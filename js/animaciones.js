function handleHeaderScroll() {
  const header = document.querySelector('header');
  const heroSection = document.querySelector('.hero');
  
  if (!header || !heroSection) return;

  const heroHeight = heroSection.offsetHeight;

  function onScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Solo aplicar en escritorio
    const isCurrentlyMobile = isMobile();
    if (isCurrentlyMobile) {
      header.classList.remove('scrolled'); // Asegura que se quite si vuelve a móvil
      return;
    }

    if (scrollPosition > heroHeight - 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Ejecutamos una vez al cargar para establecer el estado inicial
  onScroll();
}


function isMobile() {
  return window.innerWidth <= 768; // Puedes ajustar el breakpoint si usas otro
}

// Al cargar el DOM
document.addEventListener('DOMContentLoaded', handleHeaderScroll);

// Recalcular en redimensionamiento
window.addEventListener('resize', function () {
  setTimeout(handleHeaderScroll, 100);
});