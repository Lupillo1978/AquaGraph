# Bitácora del Proyecto AD&M AquaControl

## v0.1.0
- Proyecto inicial
- Express funcionando
- Chart.js integrado

---

## v0.2.0
Fecha: 1/07/2026

### Arquitectura
- Se implementó Application.js
- Se implementó EventBus
- Se implementó StateManager
- Se implementó Logger

### Dashboard
- Header
- Sidebar
- InfoPanel
- StatusBar

### Mapa
- Integración inicial de Leaflet
- Creación del MapEngine

Repositorio actualizado en GitHub.

Decisión #005

A partir de este Sprint, cada entidad principal del sistema tendrá un modelo compartido entre el Frontend y el Backend.

Las primeras entidades serán:

Farm
Pond
Feeder
Gateway
Schedule
Sensor
Mission

Con esta decisión, tanto la interfaz como la API trabajarán sobre la misma estructura conceptual, lo que facilitará la migración a MongoDB, la validación de datos y la futura sincronización en tiempo real mediante WebSockets.