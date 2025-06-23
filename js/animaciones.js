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
