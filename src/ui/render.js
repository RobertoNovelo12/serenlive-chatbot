export function addMessage(type, text, avatar) {
  const container = document.getElementById("chatMessages");
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
    msg.appendChild(contentDiv);
    msg.appendChild(avatarDiv);
  } else {
    msg.appendChild(avatarDiv);
    msg.appendChild(contentDiv);
  }

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

export function renderBotMessage(text, sender, callback) {  
  if (typeof sender === 'function' && callback === undefined) {
    callback = sender;
    sender = "bot";
  }
  
  // Valor por defecto para sender
  if (!sender || typeof sender !== 'string') {
    sender = "bot";
  }
  
  // Determinar el avatar basado en el sender
  const avatar = sender === "bot" ? "🌿" : "👤";
  
  addMessage(sender, text, avatar);

  // 🔥 DETECCIÓN AUTOMÁTICA DE MENSAJE FINAL
  if (typeof text === 'string' && text.includes("¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿")) {    
    // Esperar 3 segundos y luego mostrar las opciones
    setTimeout(() => {
      showPostRecommendationOptionsDirectly();
    }, 3000);
    
    // Si hay callback, ejecutarlo también
    if (typeof callback === 'function') {
      setTimeout(() => {
        callback();
      }, 100);
    }
    
    return; // Salir temprano
  }

  // Ejecutar callback si existe
  if (typeof callback === 'function') {
    setTimeout(() => {
      callback();
    }, 100);
  }
}

// 🔥 FUNCIÓN PARA MOSTRAR OPCIONES DIRECTAMENTE
function showPostRecommendationOptionsDirectly() {  
  const options = [
    { id: "nuevo_test", text: "Hacer otro test" },
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    { id: "fin", text: "Terminar conversación" }
  ];

  renderBotMessage("¿Te gustaría hacer algo más?", "bot", () => {
    renderButtonOptions(options, handlePostRecommendationOption);
  });
}

function handlePostRecommendationOption(optionId) {  
  if (optionId === "nuevo_test") {
    // Resetear y empezar nuevo test    
    // Limpiar localStorage
    localStorage.removeItem("chat_serenlive_data");
    localStorage.removeItem("chat_serenlive_analysis");
    
    // Recargar página para empezar completamente limpio
    location.reload();
    
  } else if (optionId === "que_es") {
    renderBotMessage(
      "Serenlive es una tira sublingual, elaborada con una matriz polimérica de grado alimenticio que permite una absorción rápida y efectiva de sus ingredientes naturales. Su formulación está diseñada para ayudar a reducir el estrés y promover la relajación de manera natural.",
      "bot",
      () => {
        setTimeout(() => {
          showPostRecommendationOptionsDirectly(); // Volver a mostrar opciones
        }, 2000);
      }
    );
    
  } else if (optionId === "ingredientes") {
    renderBotMessage(
      "Serenlive es un suplemento alimenticio de origen natural, formulado con extractos estandarizados de plantas adaptógenas como la ashwagandha, pasiflora y valeriana, junto con vitaminas del complejo B que ayudan al sistema nervioso. Todos los ingredientes son de grado farmacéutico y cumplen con los más altos estándares de calidad.",
      "bot",
      () => {
        setTimeout(() => {
          showPostRecommendationOptionsDirectly(); // Volver a mostrar opciones
        }, 2000);
      }
    );
    
  } else if (optionId === "fin") {
    renderBotMessage(
      "¡Gracias por usar Serenlive! 😊 Espero que la información te haya sido útil. ¡Que tengas un excelente día!",
      "bot",
      () => {
        setTimeout(() => {
          renderButtonOptions(
            [{ id: "reiniciar", text: "Reiniciar conversación" }],
            (optionId) => {
              if (optionId === "reiniciar") {
                location.reload();
              }
            }
          );
        }, 2000);
      }
    );
  }
}

export function renderButtonOptions(options, callback) {
  const container = document.createElement("div");
  container.className = "option-buttons";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "chat-option-button";
    btn.innerText = opt.text;

    btn.onclick = () => {
      btn.classList.add('exit');
      setTimeout(() => {
        container.remove();
        callback(opt.id);
      }, 150);
    };

    container.appendChild(btn);
  });

  const chatContainer = document.getElementById("chatMessages") ||
    document.getElementById("chat") ||
    document.querySelector('.chat-container') ||
    document.querySelector('.messages-container') ||
    document.querySelector('.chat-messages');

  if (chatContainer) {
    chatContainer.appendChild(container);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    console.error("❌ No se encontró el contenedor de mensajes");
    const tempContainer = document.createElement("div");
    tempContainer.id = "chatMessages";
    tempContainer.appendChild(container);
    document.body.appendChild(tempContainer);
  }
}

export function showTyping() {  
  const chatContainer = document.getElementById("chatMessages") ||
    document.getElementById("chat");
  
  if (!chatContainer) {
    console.error("❌ No se encontró el contenedor de mensajes para typing");
    return;
  }

  // Remover typing anterior si existe
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
  
  // Scroll automático
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 50);
}

export function hideTyping() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}