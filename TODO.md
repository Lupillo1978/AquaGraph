# TODO - Gráfico de Dieta en Barras

- [x] Convertir el gráfico de dieta de tipo "line" a "bar" en DietChart.js
- [x] Eliminar opciones de línea (tension, fill) y agregar estilos/colores profesionales a las barras
- [x] Actualizar el encabezado de la tarjeta en DietEditorView.js para reflejar barras

# TODO - Tooltip con Intervalo en el Gráfico de Dieta

- [x] Agregar arreglo `intervals` por hora en DietChart.js (dataset + update)
- [x] Mostrar tercer valor "Intervalo" en el tooltip (DietChart.js label callback)
- [x] Incluir `interval` en cada evento del schedule generado por DietChartModal.buildSchedule()
- [x] Incluir `interval` en cada evento del schedule generado por DietEngine.buildDailySchedule()

# TODO - Modal de Gráfico de Dieta

- [x] Crear componente reutilizable DietChartModal.js (overlay con claridad reducida, modal centrado ~70%, claridad normal)
- [x] Hacer DietChart.js reutilizable aceptando un id de canvas
- [x] Conectar "Ver Gráfico" en el Administrador de Dietas (DietManagerView + DietManagerEngine)
- [x] Conectar "Ver Gráfico" en el panel de Enviar Ración (FeedingPanelView + FeedingPanelEngine)
- [x] Agregar estilos CSS del modal en estilos.css
- [ ] Verificar que el modal muestre el gráfico correctamente en ambas vistas

# Bug - Inconsistencia de porcentaje en el gráfico (bloque 23:00)

- [x] Corregir el desfase (off-by-one) entre el número de disparos calculados y los realmente generados en el schedule
- [x] `DietEngine.buildDailySchedule()`: distribuir el porcentaje entre los disparos REALES generados por el bucle
- [x] `DietChartModal.buildSchedule()`: aplicar la misma corrección
- [x] Soportar `end="00:00"` como fin de día (24:00) para cerrar la hora completa en `timeToMinutes(time, isEnd)`
- [x] Actualizar `calculateShots()` en ambos archivos para usar `timeToMinutes(..., true)`

# Bug - Barra de desplazamiento del panel derecho afecta toda la pantalla

- [x] Cambiar `body { overflow: auto }` → `body { overflow: hidden }` en estilos.css
- [x] Cambiar `.app-container { min-height: 100vh }` → `.app-container { height: 100vh }` en estilos.css
- [x] Resultado: solo `#infoPanel` (con `overflow-y: auto`) tiene su propia barra de desplazamiento; el `#sidebar` y el mapa central quedan fijos

# Rediseño compacto del Editor de Dietas

- [x] Fusionar el hero "Editor de Dietas" con la card "Información General" en una sola barra compacta (`DietEditorView.js`)
- [x] La barra superior ahora contiene: título, Nombre, Descripción y botones Cancelar/Guardar
- [x] Reducir el padding de las celdas de bloques (`py-3` → `py-1`) en `DietItemRow.js`
- [x] Compactar la tabla de bloques (headers, inputs, celdas) en `estilos.css`
- [x] Compactar el recuadro de resumen (Total %, Disparos, Duración) en `estilos.css`
- [x] Reducir los `min-height` del gráfico y dar más altura disponible a bloques y gráfica
- [x] Reemplazar clases obsoletas (`diet-editor-hero`, `diet-info-card`) por las nuevas (`diet-editor-topbar`, `diet-card-header`, `diet-label`)

# Ajustes al Editor de Dietas (feedback)

- [x] Eliminar el badge "Planificación" de la barra superior
- [x] Reordenar la barra superior con flexbox: título | Nombre | Descripción | botones alineados a la derecha (`margin-left: auto`) para que no se encimen con los inputs
- [x] Hacer que la barra de desplazamiento de "Bloques de Alimentación" sea interna (solo en `.diet-table-wrapper` con `overflow-y: auto` y `flex:1`)
- [x] El shell del editor (`diet-editor-shell`) usa `height:100%` + flex column, y `.diet-main-row` con `flex:1` para que solo la tabla haga scroll
- [x] `#workspace:has(.diet-editor-shell)` → `overflow: hidden` para que el scroll de la tabla no deforme la gráfica ni el resto de la pantalla

# Ajustes al Editor de Dietas (feedback 2)

- [x] Anclar el recuadro de resumen (Total %, Disparos, Duración) totalmente abajo con `margin-top: auto` + `flex-shrink: 0` en `.diet-summary-card`
- [x] Quitar el padding inferior del shell (`diet-editor-shell`) para que el resumen quede pegado a la base
- [x] Confirmar que la barra de desplazamiento de la tabla "Bloques de Alimentación" es interna (`overflow-y: auto`, `flex:1`, `min-height:0`) y no afecta la vista de la gráfica ni el resto de la pantalla

# Fix: barra de scroll en Bloques de Alimentación no aparecía (feedback)

- [x] Causa raíz: `#workspace:has(.diet-editor-shell)` no aplicaba en el navegador (selector `:has` sin soporte), por lo que `#workspace` seguía con `overflow: auto` y la página crecía en vez de confinar la tabla
- [x] Reemplazar el selector `:has()` por una clase explícita `diet-editor-mode` manejada por JS
- [x] `WorkspaceManager.render()` → `workspace.classList.toggle("diet-editor-mode", content.includes("diet-editor-shell"))`
- [x] CSS: `#workspace.diet-editor-mode { overflow: hidden }` para que solo la tabla de bloques haga scroll interno
- [x] La cadena flex (shell → main-row → blocks-col → card → card-body → table-wrapper) confina la altura y muestra la barra de scroll solo en la tabla
