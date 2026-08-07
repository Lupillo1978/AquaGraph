# TODO - Corrección del cumplimiento de horarios del nodo esclavo y ACKs

## Objetivo
El nodo esclavo no cumple los horarios de alimentación: en la UI queda
"Programa enviado. Esperando confirmación..." y la lista de ACKs muestra
"Sin ACKs recibidos aún". Se identificaron varias causas raíz y se proponen
correcciones en firmware y servidor.

## Diagnóstico
- El payload compacto (`FP`) cabe en un frame LoRa (~167 bytes < 222), no se trunca.
- El epoch `e` se parsea con `float` de 32 bits en el esclavo => se pierde precisión
  y el reloj se desvía decenas de segundos/minutos, por lo que nunca coincide
  `hora == startHour && min == startMin` y el esclavo no dispara.
- El servidor envía cada programa de nodo UNA sola vez por broadcast LoRa (sin
  confirmación de enlace); si el paquete se pierde, no llega el ACK.
- El servidor suma offset de zona horaria a `e` y el esclavo además aplica su propia
  constante TIMEZONE_OFFSET_HOURS => riesgo de doble ajuste.

## Pasos
- [x] 1. `firmware/slave_esp32.ino`: agregar `extractJsonLongLong()` (64 bits con
        `strtoull`) y usarla en `parseCompactProgram()` para parsear `e`. Evita la
        pérdida de precisión del reloj y permite disparar en el minuto exacto.
- [x] 2. `server/services/HeltecBridgeService.js`: enviar cada payload de nodo 3 veces
        (retransmisión) con pequeño retardo para mejorar la entrega y que llegue el ACK.
- [x] 3. `server/utils/HeltecProtocol.js`: enviar `e` en UTC puro (sin sumar el offset)
        para evitar el doble ajuste de zona horaria con el esclavo.
- [x] 4. `firmware/master_heltec.ino`: mejorar el log para mostrar el tipo `FP` del
        formato compacto (facilitar depuración).
- [x] 5. Ejecutar tests: `node --test "server/tests/*.test.js"` (5/5 OK).

## Nuevo requerimiento (power-on test shot)
- [x] 6. `firmware/slave_esp32.ino`: al encender el esclavo (power-on), ejecutar un
        **tiro de prueba** de 5 segundos encendiendo el pin 2 (GPIO del motor). Se usa
        el autómata no bloqueante `updateFeeding()` llamando `startFeeding(1, 5000, 0)`
        al final de `setup()`. Esto sirve para verificar que el alimentador funciona
        correctamente tras cada arranque.
- [x] 7. Confirmar que "Enviar ración" respeta estrictamente los horarios de la dieta:
        el esclavo solo enciende el motor en la hora de inicio exacta de cada bloque.

## Corrección del intervalo entre disparos (formato compacto)
- [x] 8. `server/utils/HeltecProtocol.js`: cada bloque compacto ahora incluye el valor
        de `interval` (minutos) como 5º elemento: `[HH, MM, shots, seconds, interval]`.
- [x] 9. `firmware/slave_esp32.ino`: `parseCompactProgram()` lee el 5º valor (intervalo
        en minutos) y lo convierte a ms (`intervalMin * 60 * 1000`). Así los disparos
        de cada bloque se espacian según el intervalo en lugar de ejecutarse seguidos.
- [x] 10. `server/tests/HeltecProtocol.test.js`: verificar que `rs[0][4]` == interval (5).
- [x] 11. Ejecutar tests del protocolo Heltec (4/4 OK).

## Correcciones de zona horaria (Sinaloa) y fragmentación de radio
- [x] 12. `firmware/slave_esp32.ino`: `TIMEZONE_OFFSET_HOURS` cambiado de -6 (CDMX) a
        -7 (Sinaloa). Ahora el reloj del esclavo muestra la hora local del estado de Sinaloa.
- [x] 13. `server/utils/HeltecProtocol.js`: `seconds` de cada bloque se redondea a entero
        para reducir el tamaño del payload y que cada nodo quepa en UN solo frame LoRa
        (evita fragmentación y colisiones de radio que corrompían el mensaje y el parseo
        de los intervalos).
- [x] 14. `firmware/master_heltec.ino`: `LORA_MAX_PAYLOAD` aumentado de 180 a 222 (máximo
        útil del FIFO SX1276) para que los payloads con intervalo no se fragmenten.
- [x] 15. `server/services/HeltecBridgeService.js`: retransmisiones reducidas de 3 a 2 para
        disminuir las colisiones de radio entre mensajes de distintos nodos.
- [x] 16. `server/tests/HeltecProtocol.test.js`: `seconds` esperado 42 (entero).

## Corrección del bug de parseo del primer bloque (formato compacto)
- [x] 17. `firmware/slave_esp32.ino`: `parseCompactProgram()` usaba `schedPos + 5` al extraer
        el arreglo `rs`, lo que dejaba el `[` de apertura de `rs` dentro de `scheduleArray`.
        El primer bloque se corrompía a `00:00` (el token `[9` con `toFloat()` daba 0).
        Se corrigió a `schedPos + 6` (el patrón `"rs":[` ocupa 6 caracteres) para que el
primer bloque se cargue con su hora real (ej. `09:00`). Ahora todos los bloques de
        la dieta se cargan con su hora de inicio correcta.

## Lógica de ventana por horarios (nueva `updateSchedule`/`updateFeeding`)
- [x] 18. `firmware/slave_esp32.ino`: se eliminó el campo `firedToday` (usado en la versión
        antigua) y se reemplazó por la lógica de VENTANA: cada bloque dispara UN disparo
        por instante programado dentro de `[start, end]`, separado por `interval` minutos.
- [x] 19. `firmware/slave_esp32.ino`: `updateSchedule()` calcula el índice del disparo
        correspondiente al minuto actual (`elapsed / intervalMin`) y dispara solo en los
        instantes múltiplos exactos del intervalo, marcando `shotsDone` y `lastShotMinute`
        para persistir el progreso en NVS y no repetir el mismo instante.
- [x] 20. `firmware/slave_esp32.ino`: `updateFeeding()` ahora mide el INTERVALO desde el
        INICIO del disparo (`motorStartMs + shotIntervalMs`), de modo que si un bloque
        empieza a las 15:00 con intervalo de 10 min, el siguiente disparo arranca a las
        15:10, 15:20, etc. (la duración del pin 2 queda dentro del intervalo).
- [x] 21. `firmware/slave_esp32.ino`: `parseAndRunProgram()` (legacy) se corrigió para dejar
        de usar `firedToday` y para cargar correctamente los campos nuevos (`totalShots`,
        `shotsDone`, `lastShotMinute`, ventana `start`/`end`).
- [x] 22. `server/tests/HeltecProtocol.test.js`: ejecutado con `node --test` (4/4 OK).
