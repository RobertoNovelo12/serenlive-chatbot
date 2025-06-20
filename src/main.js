import { showInitialOptions } from "./handlers/initialOptions.js";
import { processUserInput, initializeChat } from "./handlers/processAnswer.js";
import { disableInput, enableInput } from "./ui/input.js";

// Variables globales para el estado del chat
let isMinimized = false;
let hasNewMessages = false;
let isAnimating = false;

// Función para detectar si estamos en móvil
function isMobile() {
  return window.innerWidth <= 768; // Puedes ajustar este breakpoint según necesites
}

// Función para controlar el overflow del body solo en móvil
function toggleBodyOverflow(hide) {
  if (isMobile()) {
    if (hide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializeChat();
    showInitialOptions();
    
    // Controlar overflow al inicializar si el chat está abierto
    if (!isMinimized) {
      toggleBodyOverflow(true);
    }
    
    console.log("Aplicación inicializada correctamente");
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    document.body.innerHTML = '<p>Error cargando la aplicación. Por favor recarga la página.</p>';
  }
});

// Escuchar cambios en el tamaño de ventana para ajustar el overflow
window.addEventListener('resize', () => {
  // Si cambió de móvil a desktop, restaurar overflow
  if (!isMobile()) {
    document.body.style.overflow = '';
  } else if (!isMinimized) {
    // Si cambió a móvil y el chat está abierto, ocultar overflow
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

// Función mejorada para minimizar el chat con animación reversa
function minimizeChat() {
  if (isAnimating) return;
  
  isAnimating = true;
  const chatDemo = document.querySelector('.chat-demo');
  const container = document.getElementById('chatContainer');
  const minimized = document.getElementById('chatMinimized');
  
  // Preparar el botón minimizado
  minimized.style.visibility = 'visible';
  minimized.classList.remove('show');
  
  // Aplicar la animación de cierre con keyframes CSS
  chatDemo.style.transformOrigin = 'bottom right';
  chatDemo.classList.add('closing');
  
  // Usar requestAnimationFrame para mejor sincronización
  requestAnimationFrame(() => {
    // Esperar a que termine la animación CSS (shrinkToCorner)
    setTimeout(() => {
      // Ocultar el container principal
      container.style.display = 'none';
      container.classList.add('minimized');
      
      // Mostrar el botón minimizado con animación
      requestAnimationFrame(() => {
        minimized.classList.add('show');
        isMinimized = true;
        
        // Restaurar overflow del body cuando se minimiza (solo en móvil)
        toggleBodyOverflow(false);
        
        // Limpiar estados después de un breve delay
        setTimeout(() => {
          chatDemo.classList.remove('closing');
          isAnimating = false;
        }, 50);
      });
    }, 350); // Duración de la animación shrinkToCorner
  });
}

// Función mejorada para maximizar el chat con animación reversa
function maximizeChat() {
  if (isAnimating) return;
  
  isAnimating = true;
  const container = document.getElementById("chatContainer");
  const minimized = document.getElementById("chatMinimized");
  const badge = document.getElementById("notificationBadge");
  const chatDemo = document.querySelector('.chat-demo');

  // Ocultar overflow del body cuando se maximiza (solo en móvil)
  toggleBodyOverflow(true);

  // Ocultar el botón minimizado
  minimized.classList.remove('show');
  
  setTimeout(() => {
    // Ocultar completamente el botón
    minimized.style.visibility = "hidden";
    
    // Restaurar el container principal
    container.style.display = "flex";
    container.classList.remove("minimized");
    
    // Preparar el chat para la animación de apertura
    chatDemo.classList.remove('hidden');
    chatDemo.classList.add('visible', 'opening');
    
    // Remover la clase de apertura después de la animación
    setTimeout(() => {
      chatDemo.classList.remove('opening');
      isMinimized = false;
      hasNewMessages = false;
      isAnimating = false;
    }, 350); // Duración de la animación expandFromCorner

    // Ocultar badge de notificación
    if (badge) {
      badge.style.display = "none";
    }
  }, 200);
}

function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Ejecutar al cargar
setVH();

// Ejecutar cuando cambie el tamaño (cuando se oculte/muestre la barra de URL)
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// Hacer las funciones accesibles globalmente
window.minimizeChat = minimizeChat;
window.maximizeChat = maximizeChat;