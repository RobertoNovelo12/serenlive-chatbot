// Prevenir scroll automático ANTES de que se cargue todo
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Configuración inicial crítica
document.documentElement.style.scrollBehavior = "auto";
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header");
  const nav = header.querySelector("nav");
  const navUl = nav.querySelector("ul");
  
  let savedScrollPosition = 0;
  let ticking = false;
  let isInitialized = false;
  let transitionsEnabled = false;

  // Utilidades
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getScrollbarWidth() {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    outer.style.msOverflowStyle = "scrollbar";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
  }

  // FUNCIÓN MEJORADA: Inicialización sin saltos
  function initializeHeaderSmoothly() {
    if (isInitialized) return;
    
    // Primero configurar el estado inicial SIN transiciones
    transitionsEnabled = false;
    
    // Aplicar estilos iniciales inmediatamente
    applyInitialStyles();
    
    // Forzar recalculo de layout para asegurar que los estilos se apliquen
    nav.offsetHeight;
    
    // Marcar como inicializado ANTES de habilitar transiciones
    isInitialized = true;
    
    // Habilitar transiciones de manera gradual
    requestAnimationFrame(() => {
      enableTransitions();
      
      // Establecer scroll behavior después de que todo esté listo
      setTimeout(() => {
        document.body.classList.add("loaded");
        
        // Actualizar estado basado en posición actual del scroll
        updateHeaderState();
      }, 50); // Reducido de 100ms a 50ms
    });
  }

  // Nueva función para aplicar estilos iniciales
  function applyInitialStyles() {
    const isCurrentlyMobile = isMobile();
    
    if (!isCurrentlyMobile) {
      // Aplicar estilos desktop iniciales
      nav.style.maxWidth = "1200px";
      nav.style.background = "transparent";
      nav.style.backdropFilter = "none";
      nav.style.webkitBackdropFilter = "none";
      nav.style.padding = "0px";
      nav.style.borderRadius = "0px";
      nav.style.border = "none";
      nav.style.boxShadow = "none";
      nav.style.transform = "translateY(0px) scale(1)";
      navUl.style.gap = "32px";
      header.style.padding = "20px 40px";
    } else {
      // Aplicar estilos mobile iniciales
      nav.style.maxWidth = "100%";
      nav.style.background = "transparent";
      nav.style.backdropFilter = "none";
      nav.style.webkitBackdropFilter = "none";
      nav.style.padding = "0px";
      nav.style.borderRadius = "0px";
      nav.style.border = "none";
      nav.style.boxShadow = "none";
      nav.style.transform = "translateY(0px) scale(1)";
      navUl.style.gap = "20px";
      header.style.padding = "15px 20px";
    }
  }

  // Nueva función para habilitar transiciones
  function enableTransitions() {
    transitionsEnabled = true;
    
    // Usar clases CSS en lugar de estilos inline para mejor control
    document.body.classList.add('transitions-enabled');
  }

  // Animación del header en scroll - OPTIMIZADA
function updateHeaderState() {
  if (!isInitialized) {
    return;
  }

  const hamburger = document.querySelector(".hamburger");
  if (hamburger && hamburger.classList.contains("active")) {
    return;
  }

  const scrollY = window.scrollY;

  // NO aplicar el efecto si no hay scroll
  if (scrollY === 0) {
    return;
  }

  const maxScroll = 200;
  const progress = Math.min(scrollY / maxScroll, 1);
  const isCurrentlyMobile = isMobile();

  if (isCurrentlyMobile) {
    updateBrandName(progress);
  }

  updateHeaderStyles(progress, isCurrentlyMobile);
}


  // Nueva función para manejar el nombre de marca
  function updateBrandName(progress) {
    let brandName = header.querySelector(".brand-name");

    if (!brandName) {
      brandName = document.createElement("a");
      brandName.className = "brand-name";
      brandName.textContent = "Serenlive";
      brandName.href = "index.html";
      brandName.style.cssText = `
        position: absolute;
        left: 75px;
        top: 50%;
        transform: translateY(-50%) translateX(-10px);
        font-family: "Montserrat", sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: #000;
        text-shadow: none;
        line-height: 1.2;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
        z-index: 10;
        text-decoration: none;
        cursor: pointer;
      `;
      header.appendChild(brandName);
    }

    if (progress > 0.1) {
      const nameProgress = Math.min((progress - 0.1) / 0.9, 1);
      brandName.style.opacity = nameProgress;
      brandName.style.pointerEvents = nameProgress > 0.5 ? "auto" : "none";
      brandName.style.transform = `translateY(-50%) translateX(${(1 - nameProgress) * -10}px)`;
    } else {
      brandName.style.opacity = "0";
      brandName.style.pointerEvents = "none";
      brandName.style.transform = "translateY(-50%) translateX(-10px)";
    }
  }

  // Nueva función para actualizar estilos del header
  function updateHeaderStyles(progress, isCurrentlyMobile) {
    // Calcular todas las propiedades CSS
    const basePadding = isCurrentlyMobile ? 15 : 20;
    const maxPadding = isCurrentlyMobile ? 20 : 30;
    const headerPadding = basePadding + progress * (maxPadding - basePadding);
    const horizontalPadding = isCurrentlyMobile ? 20 : 40;

    let maxWidth;
    if (progress === 0) {
      maxWidth = isCurrentlyMobile ? "100%" : "1200px";
    } else {
      const startWidth = isCurrentlyMobile ? 100 : 1200;
      const endWidth = isCurrentlyMobile ? 90 : 600;
      const calculatedWidth = startWidth - progress * (startWidth - endWidth);
      maxWidth = isCurrentlyMobile ? `${calculatedWidth}%` : `${Math.max(calculatedWidth, endWidth)}px`;
    }

    const baseGap = isCurrentlyMobile ? 20 : 32;
    const minGap = isCurrentlyMobile ? 12 : 8;
    const gapSize = baseGap - progress * (baseGap - minGap);

    const bgOpacity = progress * 0.25;
    const blurAmount = progress * 20;
    const saturateAmount = 100 + progress * 80;
    const navPadding = progress * (isCurrentlyMobile ? 15 : 20);
    const verticalPadding = 8 + navPadding * 0.2;
    const horizontalNavPadding = (isCurrentlyMobile ? 15 : 20) + navPadding * 0.25;
    const borderRadius = progress * (isCurrentlyMobile ? 20 : 25);
    const borderOpacity = progress * 0.3;
    const shadowOpacity = progress * 0.15;
    const shadowBlur = progress * (isCurrentlyMobile ? 30 : 50);
    const insetOpacity = progress * 0.3;
    const translateY = -(progress * (isCurrentlyMobile ? 3 : 5));
    const scale = 1 - progress * (isCurrentlyMobile ? 0.01 : 0.02);

    // Aplicar estilos de manera más eficiente
    requestAnimationFrame(() => {
      // Solo aplicar si las transiciones están habilitadas o si es el estado inicial
      if (transitionsEnabled || progress === 0) {
        header.style.padding = `${headerPadding}px ${horizontalPadding}px`;
        nav.style.maxWidth = maxWidth;
        navUl.style.gap = `${gapSize}px`;
        nav.style.background = `rgba(255, 255, 255, ${bgOpacity})`;
        nav.style.backdropFilter = `blur(${blurAmount}px) saturate(${saturateAmount}%)`;
        nav.style.webkitBackdropFilter = `blur(${blurAmount}px) saturate(${saturateAmount}%)`;
        nav.style.padding = `${verticalPadding}px ${horizontalNavPadding}px`;
        nav.style.borderRadius = `${borderRadius}px`;
        nav.style.border = `1px solid rgba(255, 255, 255, ${borderOpacity})`;
        nav.style.boxShadow = `
          0 ${shadowBlur * 0.4}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity}),
          inset 0 1px 0 rgba(255, 255, 255, ${insetOpacity})
        `;
        nav.style.transform = `translateY(${translateY}px) scale(${scale})`;
      }
    });
  }

  // Menú hamburguesa - OPTIMIZADO
  function openMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    requestAnimationFrame(() => {
      hamburger.classList.add("active");
      navLinks.classList.add("show");
      body.classList.add("menu-open");
      
      body.style.overflow = "hidden";
      body.style.paddingRight = getScrollbarWidth() + "px";
      
      // Reset header styles
      nav.style.maxWidth = "";
      nav.style.background = "";
      nav.style.backdropFilter = "";
      nav.style.webkitBackdropFilter = "";
      nav.style.padding = "";
      nav.style.borderRadius = "";
      nav.style.border = "";
      nav.style.boxShadow = "";
      nav.style.transform = "";
      navUl.style.gap = "";
      header.style.padding = "";
    });
  }

  function closeMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    hamburger.classList.remove("active");
    navLinks.classList.remove("show");
    body.classList.remove("menu-open");
    body.style.overflow = "";
    body.style.paddingRight = "";

    if (savedScrollPosition !== window.pageYOffset) {
      window.scrollTo(0, savedScrollPosition);
    }

    requestAnimationFrame(() => {
      updateHeaderState();
    });
  }

  // Event listeners optimizados
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateHeaderState();
        ticking = false;
      });
      ticking = true;
    }
  });

  let wasInMobile = isMobile();
  window.addEventListener("resize", function () {
    const isCurrentlyMobile = isMobile();

    if (wasInMobile !== isCurrentlyMobile) {
      // Reinicializar solo si cambió el modo de dispositivo
      transitionsEnabled = false;
      isInitialized = false;
      
      // Esperar un poco para que el resize se complete
      setTimeout(() => {
        initializeHeaderSmoothly();
      }, 50); // Reducido de 100ms
    }

    wasInMobile = isCurrentlyMobile;
  });

  // Configuración del menú hamburguesa
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (hamburger.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    const menuLinks = navLinks.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setTimeout(closeMenu, 200);
      });
    });

    navLinks.addEventListener("click", (e) => {
      if (e.target === navLinks) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hamburger.classList.contains("active")) {
        closeMenu();
      }
    });

    const menuContainer = navLinks.querySelector("ul");
    if (menuContainer) {
      menuContainer.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

  // Inicializar todo
  initializeHeaderSmoothly();

  // Animaciones de secciones
  const sections = document.querySelectorAll("section");
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  });

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Efecto hover en tarjetas
  const cards = document.querySelectorAll(".info-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = card.offsetWidth / 2;
      const centerY = card.offsetHeight / 2;
      const angleX = (y - centerY) / 30;
      const angleY = (centerX - x) / 30;
      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    });
  });
});

// Prevenir scroll automático al recargar
window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});