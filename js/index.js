const root = document.documentElement;
const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const progress = document.querySelector(".scroll-progress");
const revealEls = document.querySelectorAll("[data-reveal]");
const parallaxEls = document.querySelectorAll("[data-parallax]");

let lenis;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

root.classList.add("reveal-ready");

function updateProgress() {
  const scrollTop = window.scrollY || root.scrollTop;
  const scrollHeight = root.scrollHeight - window.innerHeight;
  const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
}

function updateParallax() {
  if (prefersReducedMotion) return;

  parallaxEls.forEach((el) => {
    const speed = Number(el.dataset.parallax || 0);
    const rect = el.getBoundingClientRect();
    const travel = rect.top * speed;
    el.style.transform = `translate3d(0, ${travel}px, 0)`;
  });
}

function requestFrame() {
  updateProgress();
  updateParallax();
}

function openMenu() {
  menuToggle.classList.add("is-open");
  menuPanel.classList.add("is-open");
  body.classList.add("is-locked");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  menuPanel.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  menuToggle.classList.remove("is-open");
  menuPanel.classList.remove("is-open");
  body.classList.remove("is-locked");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuPanel.setAttribute("aria-hidden", "true");
}

function scrollToTarget(target) {
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.05 });
    return;
  }

  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function initSmoothScroll() {
  if (prefersReducedMotion || typeof window.Lenis !== "function") return;

  lenis = new window.Lenis({
    duration: 1.12,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  lenis.on("scroll", requestFrame);
  requestAnimationFrame(raf);
}

function initReveal() {
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.94) {
      el.classList.add("is-visible");
    } else {
      observer.observe(el);
    }
  });
}

function bindAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      const target = id === "#top" ? document.body : document.querySelector(id);

      if (!target) return;

      event.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });
}

menuToggle.addEventListener("click", () => {
  if (menuPanel.classList.contains("is-open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

menuPanel.addEventListener("click", (event) => {
  if (event.target === menuPanel) closeMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);
window.addEventListener("load", requestFrame);

initSmoothScroll();
initReveal();
bindAnchors();
requestFrame();
