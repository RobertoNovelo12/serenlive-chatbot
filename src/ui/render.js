// Cache para elementos y operaciones
let cachedChatContainer = null;
let elementsToRemove = [];
let lastCleanupTime = 0;
let typingIndicator = null;

// Función optimizada para obtener el contenedor del chat
function getChatContainer() {
  if (!cachedChatContainer || !cachedChatContainer.parentNode) {
    cachedChatContainer = document.getElementById("chatMessages") ||
      document.getElementById("chat") ||
      document.querySelector('.chat-container') ||
      document.querySelector('.messages-container') ||
      document.querySelector('.chat-messages');
  }
  return cachedChatContainer;
}

export function renderBotMessage(text, sender, callback) {  
  if (typeof sender === 'function' && callback === undefined) {
    callback = sender;
    sender = "bot";
  }
  
  if (!sender || typeof sender !== 'string') {
    sender = "bot";
  }
  
  const avatar = sender === "bot" ? "🌿" : "👤";
  addMessage(sender, text, avatar);

  // Detectar mensaje de recomendación final
  if (typeof text === 'string' && 
      text.includes("🎯 **Tu Análisis Personalizado Completo**") &&
      text.includes("¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿")) {    
    
    if (typeof userData !== 'undefined') {
      userData._testCompleted = true;
      localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    }
    
    if (typeof callback === 'function') {
      setTimeout(callback, 100);
    }
    return;
  }

  if (typeof callback === 'function') {
    setTimeout(callback, 100);
  }
}

export function addMessage(type, text, avatar) {
  const container = getChatContainer();
  if (!container) return;

  // Usar DocumentFragment para construcción más eficiente
  const fragment = document.createDocumentFragment();
  
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.style.animationDelay = "0s";

  const avatarDiv = document.createElement("div");
  avatarDiv.className = `message-avatar ${type}-msg-avatar`;
  avatarDiv.textContent = avatar;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = text;

  if (type === "user") {
    fragment.appendChild(contentDiv);
    fragment.appendChild(avatarDiv);
  } else {
    fragment.appendChild(avatarDiv);
    fragment.appendChild(contentDiv);
  }

  msg.appendChild(fragment);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

export function showTyping() {
  const chatContainer = getChatContainer();
  if (!chatContainer) {
    console.error("❌ No se encontró el contenedor de mensajes para typing");
    return;
  }

  // Remover typing anterior si existe (sin DOM query)
  hideTyping();

  const typingMessage = document.createElement('div');
  typingMessage.className = 'message bot';
  typingMessage.id = 'typing-indicator';
  typingMessage.style.animationDelay = "0s";
  
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar bot-msg-avatar";
  avatarDiv.textContent = "🌿";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  typingMessage.appendChild(avatarDiv);
  typingMessage.appendChild(contentDiv);
  
  chatContainer.appendChild(typingMessage);
  typingIndicator = typingMessage; // Cachear referencia
  
  // Scroll automático sin setTimeout adicional
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function hideTyping() {
  if (typingIndicator && typingIndicator.parentNode) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

export function renderButtonOptions(options, callback) {
  // Limpiar opciones existentes de forma eficiente
  removeAllExistingButtonOptions();
  
  const container = document.createElement("div");
  container.className = "option-buttons";

  // Usar DocumentFragment para construcción más eficiente
  const fragment = document.createDocumentFragment();

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "chat-option-button";
    btn.textContent = opt.text; // textContent es más rápido que innerText

    btn.onclick = () => {
      btn.classList.add('exit');
      setTimeout(() => {
        container.remove();
        callback(opt.id);
      }, 150);
    };

    fragment.appendChild(btn);
  });

  container.appendChild(fragment);

  const chatContainer = getChatContainer();
  if (chatContainer) {
    chatContainer.appendChild(container);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Cachear este contenedor para futura limpieza
    elementsToRemove.push(container);
  } else {
    console.error("❌ No se encontró el contenedor de mensajes");
  }
}

// FUNCIÓN ULTRA-OPTIMIZADA para eliminar opciones (reduce de 15 a 1 query)
function removeAllExistingButtonOptions() {
  const now = performance.now();
  
  // Debounce: evitar múltiples limpiezas muy seguidas
  if (now - lastCleanupTime < 50) {
    return;
  }
  lastCleanupTime = now;

  // Si tenemos elementos cacheados, usarlos primero
  if (elementsToRemove.length > 0) {
    elementsToRemove.forEach(element => {
      if (element.parentNode) {
        element.remove();
      }
    });
    elementsToRemove = [];
  }

  // UNA SOLA QUERY DOM para todos los selectores
  const allElements = document.querySelectorAll(`
    .option-buttons, .option-button, .chat-option, .chat-option-button,
    .options-container, .button-container, .options-wrapper, 
    .chat-options, .button-group, .message-options, .bot-options,
    .buttons-container, .choices-container, .option-item
  `);

  // Remover todos de una vez
  allElements.forEach(element => element.remove());

  // Limpiar mensajes duplicados (solo si es necesario)
  if (document.querySelectorAll('.message').length > 20) { // Solo si hay muchos mensajes
    const botMessages = document.querySelectorAll('.bot-message, .message');
    const messagesToRemove = [];
    
    botMessages.forEach(message => {
      const text = message.textContent?.trim();
      if (text && (
          text.includes('¿Te gustaría saber algo más?') ||
          text.includes('¿Te gustaría hacer algo más?')
      )) {
        messagesToRemove.push(message);
      }
    });

    // Mantener solo el último mensaje similar
    if (messagesToRemove.length > 1) {
      for (let i = 0; i < messagesToRemove.length - 1; i++) {
        messagesToRemove[i].remove();
      }
    }
  }
}

// Las funciones showPostRecommendationOptionsDirectly y handlePostRecommendationOption
// deberían moverse a otro archivo como initialOptions.js porque contienen lógica de negocio,
// no de renderizado. Por ahora las mantengo para compatibilidad pero optimizadas:

function showPostRecommendationOptionsDirectly() {  
  // Usar import para mantener configuración centralizada
  import("../config/responses.js").then(({ RESPONSES }) => {
    const options = [
      { id: "nuevo_test", text: "Hacer otro test" },
      { id: "que_es", text: "¿Qué es Serenlive?" },
      { id: "ingredientes", text: "¿De qué está hecho?" },
      { id: "que_es_preocupacion", text: "¿Qué es la preocupación?" },
      { id: "que_es_estres", text: "¿Qué es el estrés?" },
      { id: "modo_empleo", text: "Modo de empleo y dosis" },
      { id: "es_seguro", text: "¿Cómo puedo saber si es seguro?" },
      { id: "fin", text: "Terminar conversación" }
    ];

    renderBotMessage("¿Te gustaría hacer algo más?", "bot", () => {
      renderButtonOptions(options, handlePostRecommendationOption);
    });
  }).catch(console.error);
}

function handlePostRecommendationOption(optionId) {  
  // Optimizar usando el archivo de configuración
  import("../config/responses.js").then(({ RESPONSES }) => {
    switch (optionId) {
      case "nuevo_test":
        localStorage.removeItem("chat_serenlive_data");
        localStorage.removeItem("chat_serenlive_analysis");
        location.reload();
        break;
        
      case "fin":
        renderBotMessage(RESPONSES.gracias_final, "bot", () => {
          setTimeout(() => {
            renderButtonOptions(
              [{ id: "reiniciar", text: "Reiniciar conversación" }],
              () => location.reload()
            );
          }, 2000);
        });
        break;
        
      default:
        // Para todas las preguntas informativas usar RESPONSES
        const response = RESPONSES[optionId];
        if (response) {
          renderBotMessage(response, "bot", () => {
            setTimeout(() => {
              showPostRecommendationOptionsDirectly();
            }, 2000);
          });
        }
    }
  }).catch(console.error);
}