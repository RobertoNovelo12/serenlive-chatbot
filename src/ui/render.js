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

export function showTyping() {
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.id = "typing-indicator";
  typingIndicator.innerText = "Escribiendo...";

  const chatContainer = document.getElementById("chatMessages") ||
    document.getElementById("chat");

  if (chatContainer && !document.getElementById("typing-indicator")) {
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

export function hideTyping() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}