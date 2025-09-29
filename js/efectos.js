if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

document.documentElement.style.scrollBehavior = "smooth";

document.addEventListener("DOMContentLoaded", function () {
  // Verificar si estamos en la página de inicio
  const isIndexPage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' || 
                      window.location.pathname === '/inicio';
  
  // Siempre inicializar el lightbox en todas las páginas
  initializeLightbox();

  // ========================================
  // CÓDIGO COMÚN PARA TODAS LAS PÁGINAS (incluido header animado)
  // ========================================
  
  const header = document.querySelector("header");
  const nav = header.querySelector("nav");
  const navUl = nav.querySelector("ul");

  let savedScrollPosition = 0;
  let ticking = false;
  let isInitialized = false;
  let transitionsEnabled = false;

  let lastScrollY = 0;
  let isHeaderHidden = false;
  let hasCompletedInitialAnimation = false;
  let isFirstHide = true;
  const SCROLL_THRESHOLD = 10;
  const ANIMATION_COMPLETE_THRESHOLD = 700;

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

  function initializeHeaderSmoothly() {
    if (isInitialized) return;

    transitionsEnabled = false;

    applyInitialStyles();

    nav.offsetHeight;

    isInitialized = true;

    requestAnimationFrame(() => {
      enableTransitions();

      setTimeout(() => {
        document.body.classList.add("loaded");

        updateHeaderState();
      }, 50);
    });
  }

  function applyInitialStyles() {
    const isCurrentlyMobile = isMobile();

    if (!isCurrentlyMobile) {
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

    header.style.transition =
      "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    header.style.transform = "translateY(0)";
    header.style.willChange = "transform";
  }

  function enableTransitions() {
    transitionsEnabled = true;

    document.body.classList.add("transitions-enabled");
  }

  function toggleHeaderVisibility(shouldHide) {
    if (isHeaderHidden === shouldHide) return;

    const hamburger = document.querySelector(".hamburger");
    if (hamburger && hamburger.classList.contains("active")) {
      return;
    }

    isHeaderHidden = shouldHide;

    if (isFirstHide && shouldHide) {
      header.style.transition =
        "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      isFirstHide = false;
    }

    if (shouldHide) {
      header.style.transform = "translateY(-100%)";
      header.classList.add("header-hidden");
    } else {
      header.style.transform = "translateY(0)";
      header.classList.remove("header-hidden");
    }
  }

  function handleHeaderAutoHide() {
    if (!isMobile()) {
      if (isHeaderHidden) {
        toggleHeaderVisibility(false);
      }
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY);

    if (
      !hasCompletedInitialAnimation &&
      currentScrollY >= ANIMATION_COMPLETE_THRESHOLD
    ) {
      hasCompletedInitialAnimation = true;

      setTimeout(() => {
        const finalScrollY = window.scrollY;
        if (finalScrollY >= ANIMATION_COMPLETE_THRESHOLD) {
          hasCompletedInitialAnimation = true;
        }
      }, 100);
      return;
    }

    if (!hasCompletedInitialAnimation) {
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY <= 50) {
      toggleHeaderVisibility(false);
      lastScrollY = currentScrollY;
      return;
    }

    if (scrollDifference < SCROLL_THRESHOLD) {
      lastScrollY = currentScrollY;
      return;
    }

    const isScrollingDown = currentScrollY > lastScrollY;

    if (isScrollingDown) {
      toggleHeaderVisibility(true);
    } else {
      toggleHeaderVisibility(false);
    }

    lastScrollY = currentScrollY;
  }

  function updateHeaderState() {
    if (!isInitialized) {
      return;
    }

    const hamburger = document.querySelector(".hamburger");
    if (hamburger && hamburger.classList.contains("active")) {
      return;
    }

    const scrollY = window.scrollY;

    handleHeaderAutoHide();

    if (scrollY === 0) {
      return;
    }

    const maxScroll = 400;
    const progress = Math.min(scrollY / maxScroll, 1);
    const isCurrentlyMobile = isMobile();

    // Solo actualizar el nombre de marca en mobile Y solo en index
    if (isCurrentlyMobile && isIndexPage) {
      updateBrandName(progress);
    }

    updateHeaderStyles(progress, isCurrentlyMobile);
  }

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
        color: #5c6c5c;
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
      brandName.style.transform = `translateY(-50%) translateX(${
        (1 - nameProgress) * -10
      }px)`;
    } else {
      brandName.style.opacity = "0";
      brandName.style.pointerEvents = "none";
      brandName.style.transform = "translateY(-50%) translateX(-10px)";
    }
  }

  function updateHeaderStyles(progress, isCurrentlyMobile) {
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
      maxWidth = isCurrentlyMobile
        ? `${calculatedWidth}%`
        : `${Math.max(calculatedWidth, endWidth)}px`;
    }

    const baseGap = isCurrentlyMobile ? 20 : 32;
    const minGap = isCurrentlyMobile ? 12 : 8;
    const gapSize = baseGap - progress * (baseGap - minGap);

    const bgOpacity = progress * 0.25;
    const blurAmount = progress * 20;
    const saturateAmount = 100 + progress * 80;
    const navPadding = progress * (isCurrentlyMobile ? 15 : 20);
    const verticalPadding = 8 + navPadding * 0.2;
    const horizontalNavPadding =
      (isCurrentlyMobile ? 15 : 20) + navPadding * 0.25;
    const borderRadius = progress * (isCurrentlyMobile ? 20 : 25);
    const borderOpacity = progress * 0.3;
    const shadowOpacity = progress * 0.15;
    const shadowBlur = progress * (isCurrentlyMobile ? 30 : 50);
    const insetOpacity = progress * 0.3;
    const translateY = -(progress * (isCurrentlyMobile ? 3 : 5));
    const scale = 1 - progress * (isCurrentlyMobile ? 0.01 : 0.02);

    requestAnimationFrame(() => {
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
          0 ${
            shadowBlur * 0.4
          }px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity}),
          inset 0 1px 0 rgba(255, 255, 255, ${insetOpacity})
        `;

        const autoHideTransform = isHeaderHidden
          ? "translateY(-100%)"
          : "translateY(0)";
        const animationTransform = `translateY(${translateY}px) scale(${scale})`;

        if (!isCurrentlyMobile) {
          nav.style.transform = animationTransform;
        } else {
          if (isHeaderHidden) {
            nav.style.transform = animationTransform;
          } else {
            nav.style.transform = animationTransform;
          }
        }
      }
    });
  }

  function openMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    savedScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    if (isHeaderHidden) {
      toggleHeaderVisibility(false);
    }

    requestAnimationFrame(() => {
      hamburger.classList.add("active");
      navLinks.classList.add("show");
      body.classList.add("menu-open");

      body.style.overflow = "hidden";
      body.style.paddingRight = getScrollbarWidth() + "px";

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
      transitionsEnabled = false;
      isInitialized = false;

      isHeaderHidden = false;
      hasCompletedInitialAnimation = false;
      isFirstHide = true;
      lastScrollY = 0;

      if (!isCurrentlyMobile && isHeaderHidden) {
        header.style.transform = "translateY(0)";
        header.classList.remove("header-hidden");
        isHeaderHidden = false;
      }

      setTimeout(() => {
        initializeHeaderSmoothly();
      }, 50);
    }

    wasInMobile = isCurrentlyMobile;
  });

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

  initializeHeaderSmoothly();

  // ========================================
  // CÓDIGO EXCLUSIVO PARA INDEX.HTML
  // ========================================
  
  if (isIndexPage) {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

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
  }
});

window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});

// ========================================
// LIGHTBOX - FUNCIONA EN TODAS LAS PÁGINAS
// ========================================

function initializeLightbox() {
  const lightboxHTML = `
    <div class="lightbox-overlay" id="lightboxOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease;">
        <button class="lightbox-close" id="lightboxClose" style="position: absolute; top: 20px; right: 40px; font-size: 40px; color: white; cursor: pointer; background: none; border: none; transition: transform 0.2s ease;">&times;</button>
        <img src="" alt="" id="lightboxImage" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; animation: zoomIn 0.3s ease;">
    </div>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes zoomIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .lightbox-close:hover {
            transform: scale(1.2);
        }
        .lightbox-img {
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .lightbox-img:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
    </style>
  `;

  // Insertar el lightbox en el body
  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');

  // Función para abrir el lightbox
  function openLightbox(imgSrc, imgAlt) {
    overlay.style.display = 'flex';
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt || '';
    document.body.style.overflow = 'hidden'; // Evitar scroll del body
  }

  // Función para cerrar el lightbox
  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll
  }

  // Agregar evento de clic a todas las imágenes con la clase 'lightbox-img'
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-img')) {
      openLightbox(e.target.src, e.target.alt);
    }
  });

  // Cerrar con el botón X
  closeBtn.addEventListener('click', closeLightbox);

  // Cerrar al hacer clic en el fondo
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // Cerrar con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeLightbox();
    }
  });
}