# Comunicación hardware del sistema AD&M AquaControl

## Objetivo

Documentar la arquitectura del flujo de comunicación entre:
- la aplicación web
- el servidor Node.js
- el Heltec (nodo maestro)
- los nodos esclavos ESP32 + SX1276

## Componentes

### 1. Aplicación web
- Permite crear dietas, definir raciones y enviar comandos.
- Se comunica con el backend mediante HTTP o WebSocket.

### 2. Servidor Node.js
- Expone endpoints para:
  - listar puertos seriales
  - conectar/desconectar el Heltec
  - enviar comandos de alimentación
  - enviar dietas al sistema
- Usa `serialport` para comunicarse con el Heltec por USB.

### 3. Heltec (nodo maestro)
- Recibe comandos por USB desde el servidor.
- Reenvía mensajes por LoRa a los nodos esclavos.
- Recibe respuestas de los nodos y las devuelve al servidor.

### 4. Nodos esclavos ESP32 + SX1276
- Reciben órdenes LoRa del maestro.
- Ejecutan acciones como alimentación o estado.
- Responden al maestro con ACK o STATUS.

## Flujo principal

1. El operador selecciona una dieta o manda alimentar.
2. El servidor envía un mensaje JSON al Heltec por USB.
3. El Heltec reenvía el mensaje por LoRa al nodo correspondiente.
4. El nodo esclavo ejecuta la acción.
5. El nodo responde al Heltec.
6. El Heltec devuelve la respuesta al servidor.
7. El servidor actualiza la UI.

## Mensajes principales

### Comando desde la web al Heltec
```json
{
  "type": "FEED_NOW",
  "nodeId": "A1-F01",
  "pondId": "POND-01",
  "gramsPerSecond": 22.5,
  "durationSeconds": 10,
  "amountGrams": 225,
  "mode": "manual"
}
```

### Comando de dieta
```json
{
  "type": "SET_DIET",
  "nodeId": "A1-F01",
  "pondId": "POND-01",
  "diet": {
    "name": "Dieta prueba",
    "blocks": []
  }
}
```

## Protocolo de programa de alimentación (compacto, un nodo por paquete)

> **Problema resuelto:** el SX1276 tiene un FIFO de 256 bytes (payload útil
> ~222 bytes con SF7/BW125/CR4/5). Un `FEEDING_PROGRAM` con todos los nodos
> excede ese límite y se truncaba: el esclavo recibía `nodeId` y `currentTime`
> pero NO el arreglo `schedule`, por lo que respondía ACK sin cargar horarios.

Para que cada programa quepa en **un único frame LoRa**, el servidor envía
**un nodo por paquete** con un JSON compacto:

```json
{ "t":"FP", "n":"101", "r":"req-123", "e":1785904460915, "z":-6, "rs":[[20,0,12,41],[21,0,12,41],[22,0,12,35]] }
```

| Clave | Descripción |
|-------|-------------|
| `t`   | Tipo: `FP` (Feeding Program) |
| `n`   | `nodeId` del alimentador |
| `r`   | `requestId` (para el ACK) |
| `e`   | Epoch en ms (hora actual) para sincronizar el reloj del esclavo |
| `z`   | Offset de zona horaria en horas (opcional) |
| `rs`  | Bloques `[HH, MM, shots, seconds]` |

El backend (`HeltecBridgeService.sendFeedingProgram`) recorre
`executionProgram` y envía cada nodo por separado con una pequeña pausa.

El firmware del esclavo sigue entendiendo el formato antiguo
`FEEDING_PROGRAM` por retrocompatibilidad.

### Respaldo: segmentación de mensajes largos
Como defensa extra, el maestro puede dividir un payload > 1 frame en
fragmentos con el esquema `CH:<total>:<idx>:<data>`. El esclavo los acumula y
reensambla antes de procesar.

### Respuesta del nodo esclavo
```json
{
  "type": "ACK",
  "nodeId": "A1-F01",
  "status": "OK"
}
```

## Archivos relevantes del proyecto

- Backend:
  - `server/routes/bridge.js`
  - `server/utils/SerialService.js`
- Documentación:
  - `docs/Arquitectura.md`
  - `docs/Comunicacion_Hardware.md`

## Cableado y configuración de la radio LoRa (SX1276)

Para que la librería `LoRa` (sandeepmistry) detecte el chip SX1276 es **obligatorio**
configurar la interfaz SPI y los pines de control **antes** de llamar a `LoRa.begin()`.
Sin esto, el inicio falla con **"LoRa init failed"**.

### Orden correcto de inicialización

```cpp
SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS); // Configura el bus SPI
LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);          // NSS, RST, DIO0
LoRa.begin(915E6);                                    // 915 MHz para América
```

### Heltec (nodo maestro) - radio SX1276 integrada

| Señal | GPIO |
|-------|------|
| SCK   | 5    |
| MISO  | 19   |
| MOSI  | 27   |
| NSS   | 18   |
| RST   | 14   |
| DIO0  | 26   |

> Nota: la librería usa por defecto VSPI (SCK=18, MISO=19, MOSI=23, SS=5), que en la
> Heltec no coincide con la radio integrada. Por eso se configuran los pines explícitamente.
> Si la tarjeta es Heltec **V3 (SX1262)** este cableado no aplica (requiere otra librería).

### ESP32 DevKit V1 + módulo SX1276 (nodo esclavo)

| Señal | GPIO |
|-------|------|
| SCK   | 18   |
| MISO  | 19   |
| MOSI  | 23   |
| NSS   | 5    |
| RST   | 14   |
| DIO0  | 26   |

> Si el cableado de tu breakout usa otros GPIO, ajusta las constantes `LORA_*` al inicio
> de `firmware/slave_esp32.ino`.

### Diagnóstico rápido

Si `LoRa.begin()` sigue fallando, el firmware imprime un mensaje indicando que verifiques
el cableado SPI. Revisa los puntos habituales:

- SCK, MISO y MOSI conectados a los pines correctos del ESP32.
- NSS (chip select) bien conectado y alto en reposo.
- RST conectado y que el módulo tenga alimentación correcta (3.3V).
- En la Heltec, asegúrate de que sea la versión V2 (SX1276). La V3 (SX1262) usa otra librería.

## Próximo objetivo

Implementar firmware base para:
- Heltec (nodo maestro)
- ESP32 esclavo

Y validar el ciclo:
- servidor -> Heltec -> nodo -> respuesta
