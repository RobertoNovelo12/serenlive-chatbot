// Variables para controlar el estado del chatbot
let bounceCount = 0;
let bounceInterval;
let hasInteracted = false;

function handleHeaderScroll() {
  const header = document.querySelector("header");
  const heroSection = document.querySelector(".hero");

  if (!header || !heroSection) return;

  const heroHeight = heroSection.offsetHeight;

  function onScroll() {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    const isCurrentlyMobile = isMobile();
    if (isCurrentlyMobile) {
      header.classList.remove("scrolled");
      return;
    }

    if (scrollPosition > heroHeight - 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  let ticking = false;

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  onScroll();
}

function isMobile() {
  return window.innerWidth <= 768;
}

document.addEventListener("DOMContentLoaded", handleHeaderScroll);

window.addEventListener("resize", function () {
  setTimeout(handleHeaderScroll, 100);
});

// Función para inicializar el chatbot
function initializeChatbot() {
  const chatContainer = document.getElementById('chatContainer');
  const chatMinimized = document.getElementById('chatMinimized');
  
  // Mostrar el chatbot inicialmente con animación
  setTimeout(() => {
    chatContainer.classList.add('show-initial');
  }, 500); // Esperar 500ms antes de mostrar
  
  // Después de 2 segundos, minimizar automáticamente
  setTimeout(() => {
    minimizeChat();
    startBounceAnimation();
  }, 2500);
}

// Función para minimizar el chat (modificar la existente si ya existe)
function minimizeChat() {
  const chatContainer = document.getElementById('chatContainer');
  const chatMinimized = document.getElementById('chatMinimized');
  const chatDemo = chatContainer.querySelector('.chat-demo');
  
  // Aplicar animación de cierre
  chatDemo.classList.add('closing');
  
  setTimeout(() => {
    chatContainer.style.display = 'none';
    chatMinimized.classList.add('ready'); // Preparar para transiciones
    chatMinimized.classList.add('show');
  }, 200);
}

// Función para maximizar el chat (modificar la existente si ya existe)
function maximizeChat() {
  const chatContainer = document.getElementById('chatContainer');
  const chatMinimized = document.getElementById('chatMinimized');
  const chatDemo = chatContainer.querySelector('.chat-demo');
  
  hasInteracted = true;
  stopBounceAnimation();
  
  chatMinimized.classList.remove('show');
  chatContainer.style.display = 'block';
  chatDemo.classList.remove('closing');
  chatDemo.classList.add('opening');
  
  setTimeout(() => {
    chatDemo.classList.remove('opening');
  }, 200);
}

// Función para iniciar la animación de rebote
function startBounceAnimation() {
  if (hasInteracted) return;
  
  const chatMinimized = document.getElementById('chatMinimized');
  
  bounceInterval = setInterval(() => {
    if (bounceCount < 2 && !hasInteracted) {
      chatMinimized.classList.add('bounce');
      bounceCount++;
      
      // Remover la clase después de la animación
      setTimeout(() => {
        chatMinimized.classList.remove('bounce');
      }, 800);
      
      if (bounceCount >= 2) {
        stopBounceAnimation();
      }
    }
  }, 5000); // Cada 5 segundos
}

// Función para detener la animación de rebote
function stopBounceAnimation() {
  if (bounceInterval) {
    clearInterval(bounceInterval);
    bounceInterval = null;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  initializeChatbot();
});

// Detectar interacción del usuario para detener el rebote
document.getElementById('chatMinimized').addEventListener('click', function() {
  hasInteracted = true;
  stopBounceAnimation();
});

// También detener el rebote si el usuario cierra el chat
document.getElementById('closeButton').addEventListener('click', function() {
  hasInteracted = true;
  stopBounceAnimation();
});

// FUNCIONALIDAD SCROLL TO BOTTOM - Agregar al final del archivo existente
document.addEventListener('DOMContentLoaded', function() {
  const chatMessages = document.getElementById('chatMessages');
  const scrollButton = document.getElementById('scrollToBottomBtn');
  
  if (!chatMessages || !scrollButton) return;
  
  let isUserScrolling = false;
  let scrollTimeout;
  
  // Verificar si está en el bottom
  function isAtBottom() {
    const threshold = 50;
    return chatMessages.scrollTop >= (chatMessages.scrollHeight - chatMessages.clientHeight - threshold);
  }
  
  // Mostrar/ocultar botón
  function toggleScrollButton() {
    if (isAtBottom()) {
      scrollButton.classList.remove('show', 'pulse');
    } else {
      scrollButton.classList.add('show');
      // Pulso después de 2 segundos
      setTimeout(() => {
        if (scrollButton.classList.contains('show')) {
          scrollButton.classList.add('pulse');
        }
      }, 2000);
    }
  }
  
  // Scroll hacia abajo
  function scrollToBottom() {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth'
    });
  }
  
  // Event listeners
  chatMessages.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    if (!isUserScrolling) {
      scrollTimeout = setTimeout(toggleScrollButton, 100);
    }
  });
  
  scrollButton.addEventListener('click', function() {
    isUserScrolling = true;
    scrollToBottom();
    scrollButton.classList.remove('pulse');
    
    // Verificar si llegó al bottom después del scroll automático
    setTimeout(() => {
      isUserScrolling = false;
      toggleScrollButton(); // Verificar inmediatamente después del scroll
    }, 300); // Reducir el tiempo para que sea más responsivo
  });
  
  // Verificar inicialmente
  toggleScrollButton();
});