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

</content>
