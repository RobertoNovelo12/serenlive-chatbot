import { showInitialOptions } from "./handlers/initialOptions.js";
import { processUserInput, initializeChat } from "./handlers/processAnswer.js";
import { disableInput, enableInput } from "./ui/input.js";

let isMinimized = false;
let hasNewMessages = false;
let isAnimating = false;

function isMobile() {
  return window.innerWidth <= 768;
}

function toggleBodyOverflow(hide) {
  if (isMobile()) {
    if (hide) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializeChat();
    showInitialOptions();

    if (!isMinimized) {
      toggleBodyOverflow(true);
    }
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    document.body.innerHTML =
      "<p>Error cargando la aplicación. Por favor recarga la página.</p>";
  }
});

window.addEventListener("resize", () => {
  if (!isMobile()) {
    document.body.style.overflow = "";
  } else if (!isMinimized) {
    toggleBodyOverflow(true);
  }
});

document.getElementById("nameInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendInput();
});
document.querySelector(".send-button").addEventListener("click", sendInput);

function sendInput() {
  const input = document.getElementById("nameInput");
  const text = input.value.trim();
  if (!text) return;

  processUserInput(text);
  input.value = "";
}

function minimizeChat() {
  if (isAnimating) return;

  isAnimating = true;
  const chatDemo = document.querySelector(".chat-demo");
  const container = document.getElementById("chatContainer");
  const minimized = document.getElementById("chatMinimized");

  minimized.style.visibility = "visible";
  minimized.classList.remove("show");

  chatDemo.style.transformOrigin = "bottom right";
  chatDemo.classList.add("closing");

  requestAnimationFrame(() => {
    setTimeout(() => {
      container.style.display = "none";
      container.classList.add("minimized");

      requestAnimationFrame(() => {
        minimized.classList.add("show");
        isMinimized = true;

        toggleBodyOverflow(false);

        setTimeout(() => {
          chatDemo.classList.remove("closing");
          isAnimating = false;
        }, 50);
      });
    }, 50);
  });
}

function maximizeChat() {
  if (isAnimating) return;

  isAnimating = true;
  const container = document.getElementById("chatContainer");
  const minimized = document.getElementById("chatMinimized");
  const badge = document.getElementById("notificationBadge");
  const chatDemo = document.querySelector(".chat-demo");

  toggleBodyOverflow(true);

  minimized.classList.remove("show");

  setTimeout(() => {
    minimized.style.visibility = "hidden";

    container.style.display = "flex";
    container.classList.remove("minimized");

    chatDemo.classList.remove("hidden");
    chatDemo.classList.add("visible", "opening");

    setTimeout(() => {
      chatDemo.classList.remove("opening");
      isMinimized = false;
      hasNewMessages = false;
      isAnimating = false;
    }, 150);

    if (badge) {
      badge.style.display = "none";
    }
  }, 100);
}

function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setVH();

window.addEventListener("resize", setVH);
window.addEventListener("orientationchange", setVH);

window.minimizeChat = minimizeChat;
window.maximizeChat = maximizeChat;
