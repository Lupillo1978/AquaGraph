# TODO - Análisis completo del flujo "ENVIAR RACIÓN" + cambios en firmware

## Análisis del flujo
- [x] Revisar UI (FeedingPanelEngine, FeedingPanelView)
- [x] Revisar servidor (bridge, HeltecProtocol, HeltecBridgeService, SerialService)
- [x] Revisar modelos y datos (Feeder, feeders.json, ponds.json)
- [x] Revisar documentación y tests

## Cambios en firmware
- [x] Modificar `firmware/master_heltec.ino`:
  - [x] Imprimir JSON crudo del ACK recibido para que el servidor lo parseee
  - [x] Comentarios adicionales en español
- [x] Modificar `firmware/slave_esp32.ino`:
  - [x] Definir y configurar GPIO 2 como salida (motor del comedero)
  - [x] Añadir extractor de números JSON (`extractJsonFloat`)
  - [x] Añadir `startFeeding()`/`updateFeeding()` para activar el pin 2 de forma no bloqueante
  - [x] Añadir lógica para ejecutar horario del `FEEDING_PROGRAM` en el pin 2 (`parseAndRunProgram`)
  - [x] Añadir lógica `FEED_NOW` con duración/gramos en el pin 2
  - [x] Comentarios en español
- [x] Verificar que la lógica y compilación son correctas

