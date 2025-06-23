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

// FUNCIÓN CORREGIDA - compatible con ambos usos
export function renderBotMessage(text, sender, callback) {
  console.log("🎨 renderBotMessage called with:", { text, sender, callback: typeof callback });
  
  // Detectar si se está usando la firma antigua (text, callback)
  if (typeof sender === 'function' && callback === undefined) {
    // Uso antiguo: renderBotMessage(text, callback)
    callback = sender;
    sender = "bot";
    console.log("🔄 Detectado uso antiguo, ajustando parámetros");
  }
  
  // Valor por defecto para sender
  if (!sender || typeof sender !== 'string') {
    sender = "bot";
  }
  
  // Determinar el avatar basado en el sender
  const avatar = sender === "bot" ? "🤖" : "👤";
  
  addMessage(sender, text, avatar);

  // Ejecutar callback si existe
  if (typeof callback === 'function') {
    console.log("✅ Ejecutando callback de renderBotMessage");
    // Pequeño delay para asegurar que el mensaje se renderice
    setTimeout(() => {
      callback();
    }, 100);
  } else {
    console.log("ℹ️ No hay callback para ejecutar");
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

// 🔥 FUNCIÓN MEJORADA - Usa tu animación CSS
export function showTyping() {
  console.log('💭 Mostrando indicador de typing');
  
  const chatContainer = document.getElementById("chatMessages") ||
    document.getElementById("chat");
  
  if (!chatContainer) {
    console.error("❌ No se encontró el contenedor de mensajes para typing");
    return;
  }

  // Remover typing anterior si existe
  hideTyping();

  // Crear elemento de typing con tu estructura
  const typingMessage = document.createElement('div');
  typingMessage.className = 'message bot';
  typingMessage.id = 'typing-indicator';
  typingMessage.style.animationDelay = "0s";
  
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar bot-msg-avatar";
  avatarDiv.textContent = "🤖";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  
  // 🎨 Usar tu animación CSS de typing
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

// 🔥 FUNCIÓN MEJORADA - Más robusta
export function hideTyping() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    console.log('🚫 Ocultando indicador de typing');
    typingIndicator.remove();
  }
}