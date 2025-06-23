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
  console.log("🎨 renderBotMessage called with:", {
    text,
    sender,
    callback: typeof callback,
  });

  if (typeof sender === "function" && callback === undefined) {
    callback = sender;
    sender = "bot";
  }

  if (!sender || typeof sender !== "string") {
    sender = "bot";
  }

  const avatar = sender === "bot" ? "🤖" : "👤";

  addMessage(sender, text, avatar);

  if (typeof callback === "function") {
    setTimeout(() => {
      callback();
    }, 100);
  } else {
  }
}

export function renderButtonOptions(options, callback) {
  const container = document.createElement("div");
  container.className = "option-buttons";

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "chat-option-button";
    btn.innerText = opt.text;

    btn.onclick = () => {
      btn.classList.add("exit");
      setTimeout(() => {
        container.remove();
        callback(opt.id);
      }, 150);
    };

    container.appendChild(btn);
  });

  const chatContainer =
    document.getElementById("chatMessages") ||
    document.getElementById("chat") ||
    document.querySelector(".chat-container") ||
    document.querySelector(".messages-container") ||
    document.querySelector(".chat-messages");

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
  const chatContainer =
    document.getElementById("chatMessages") || document.getElementById("chat");

  if (!chatContainer) {
    console.error("❌ No se encontró el contenedor de mensajes para typing");
    return;
  }

  hideTyping();

  const typingMessage = document.createElement("div");
  typingMessage.className = "message bot";
  typingMessage.id = "typing-indicator";
  typingMessage.style.animationDelay = "0s";

  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar bot-msg-avatar";
  avatarDiv.textContent = "🤖";

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
