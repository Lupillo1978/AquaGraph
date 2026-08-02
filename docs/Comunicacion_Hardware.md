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

## Próximo objetivo

Implementar firmware base para:
- Heltec (nodo maestro)
- ESP32 esclavo

Y validar el ciclo:
- servidor -> Heltec -> nodo -> respuesta
