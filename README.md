# 🌿 Chatbot Serenlive

Un chatbot inteligente para evaluar el estrés y recomendar dosis personalizadas del suplemento natural **Serenlive**.

## 📋 Descripción

Serenlive es un chatbot conversacional que ayuda a los usuarios a:
- Evaluar su nivel de estrés a través de preguntas personalizadas
- Recibir recomendaciones de dosis específicas del suplemento Serenlive
- Obtener tips de bienestar y planes de seguimiento personalizados
- Acceder a información sobre el producto y sus ingredientes

## ✨ Características

### 🎯 Funcionalidades principales
- **Test de estrés personalizado**: 8 preguntas adaptativas para evaluar el nivel de estrés
- **Sistema de puntuación inteligente**: Algoritmo que calcula recomendaciones basadas en respuestas
- **Recomendaciones personalizadas**: Dosis, horarios y duración específicos para cada usuario
- **Tips de bienestar**: Consejos personalizados sobre nutrición, ejercicio y descanso
- **Persistencia completa**: Guarda y restaura conversaciones al recargar la página

### 🔧 Características técnicas
- **Arquitectura modular**: Código organizado en módulos independientes
- **Persistencia con localStorage**: Conversaciones y datos guardados localmente
- **Sistema de estados**: Manejo robusto de estados de conversación y test
- **Detección automática**: Restauración inteligente de conversaciones incompletas
- **Interfaz responsive**: Diseño adaptable a diferentes dispositivos

## 🏗️ Estructura del proyecto

```
chatbot-serenlive/
├── index.html              # Página principal
├── formulario.html
├── informacion.html
├── css/
│   ├── styles.css          
│   ├── chatbot.css         
│   ├── info.css          
│   └── formulario.css         
├── js/
│   ├── main.js            # Punto de entrada principal
│   ├── core/              # Lógica central
│   │   ├── state.js       # Manejo de estados
│   │   ├── analyzer.js    # Análisis de respuestas
│   │   └── storagemessage.js # Persistencia en localStorage
│   ├── handlers/          # Manejadores de eventos
│   │   ├── initialOptions.js
│   │   ├── questionFlow.js
│   │   ├── recommendation-handler.js
│   │   └── postRecommendationOptions.js
│   ├── ui/               # Interfaz de usuario
│   │   ├── render.js     # Renderizado de mensajes
│   │   └── input.js      # Manejo de inputs
│   │ 
│   └── questions.json # Banco de preguntas
└── README.md
```

## 🚀 Instalación y uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación

1. **Clona el repositorio**:
```bash
git clone https://github.com/robertonovelo12/serenlive-chatbot.git
cd chatbot-serenlive
```

2. **Abre el proyecto**:
   - **Opción 1**: Abre `index.html` directamente en tu navegador
   - **Opción 2**: Usa un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Accede al chatbot**:
   - Navega a `http://localhost:8000` (si usas servidor)
   - O abre `index.html` directamente

## 🎮 Cómo usar

### 1. **Inicio de conversación**
El chatbot saluda y ofrece tres opciones:
- ¿Qué es Serenlive?
- ¿De qué está hecho?
- Hacer prueba de estrés

### 2. **Test de estrés**
- Proporciona tu nombre
- Responde 8 preguntas sobre tu estado de estrés
- Las preguntas se adaptan a tus respuestas anteriores

### 3. **Recomendación personalizada**
Recibes:
- **Análisis**: Nivel de estrés y puntuación
- **Dosis recomendada**: Cantidad, horarios y duración
- **Tips personalizados**: Consejos específicos para tu situación
- **Plan de bienestar**: Nutrición, ejercicio y descanso
- **Plan de seguimiento**: Frecuencia y puntos de control

### 4. **Opciones post-recomendación**
- Hacer otro test
- Consultar información del producto
- Terminar conversación

## 🧠 Sistema de evaluación

### Categorización de estrés
- **Bajo** (0-33%): Manejo saludable del estrés
- **Moderado** (34-66%): Estrés manejable con apoyo
- **Alto** (67-100%): Estrés significativo que requiere atención

### Factores evaluados
- Frecuencia del estrés
- Síntomas físicos
- Calidad del sueño
- Actividades de relajación
- Alimentación
- Nivel de apoyo necesario

## 🛠️ Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage API
- **Arquitectura**: Módulos ES6
- **Diseño**: CSS Grid, Flexbox, Animaciones CSS
- **Compatibilidad**: Navegadores modernos

## 📱 Características de la interfaz

### Diseño responsive
- **Desktop**: Interfaz completa con sidebar
- **Mobile**: Diseño optimizado para pantallas pequeñas
- **Tablet**: Adaptación automática del layout

### Animaciones
- Transiciones suaves entre mensajes
- Indicador de "typing" animado
- Efectos hover en botones
- Animaciones de entrada y salida

### Accesibilidad
- Contraste adecuado de colores
- Navegación por teclado
- Texto legible y bien estructurado
- Semántica HTML apropiada

## 🔧 Configuración avanzada

### Personalizar preguntas
Edita `js/data/questions.json`:
```json
{
  "id": "nueva_pregunta",
  "text": "¿Tu pregunta aquí?",
  "type": "stress_question",
  "category": "sleep",
  "weight": 2,
  "options": ["opcion1", "opcion2", "opcion3"]
}
```

### Modificar recomendaciones
En `js/core/analyzer.js`, ajusta:
```javascript
const STRESS_THRESHOLDS = {
  low: { min: 0, max: 6 },
  moderate: { min: 7, max: 12 },
  high: { min: 13, max: 18 }
};
```

### Personalizar mensajes
Los mensajes se pueden modificar en:
- `js/handlers/recommendation-handler.js` (mensajes de recomendación)
- `js/handlers/initialOptions.js` (mensajes iniciales)
- `js/data/questions.json` (textos de preguntas)

## 🐛 Solución de problemas

### Problemas comunes

1. **Los mensajes no se guardan**:
   - Verifica que localStorage esté habilitado
   - Comprueba la consola del navegador

2. **El test no continúa después de recargar**:
   - Limpia localStorage: `localStorage.clear()`
   - Recarga la página

3. **Las opciones aparecen duplicadas**:
   - Problema conocido solucionado en la versión actual
   - Asegúrate de usar la última versión

### Debug mode
Activa el modo debug en la consola:
```javascript
localStorage.setItem('debug_mode', 'true');
```

## 🤝 Contribuir

### Cómo contribuir
1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-caracteristica`
3. Commit tus cambios: `git commit -m 'Añadir nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

### Estándares de código
- Usa ES6+ features
- Mantén funciones pequeñas y enfocadas
- Documenta funciones complejas
- Usa nombres descriptivos para variables
- Sigue la estructura modular existente

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - *Desarrollo inicial* - [RobertoNovelo](https://github.com/robertonovelo12)

## 🙏 Agradecimientos

- Equipo de Serenlive por la especificación del producto
- Comunidad de desarrolladores por las mejores prácticas
- Usuarios beta por sus valiosos comentarios

---

**Hecho con 💚 para el bienestar y la salud mental**
