if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function resetToHero() {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

resetToHero();
window.addEventListener("load", resetToHero);
window.addEventListener("pageshow", resetToHero);

const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll(".tab-panel");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const navigationLinks = [
  ...document.querySelectorAll(".main-nav a[href^='#']"),
];
const navigationSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const themedIcons = document.querySelectorAll(
  ".profile-content lord-icon, .articles-section lord-icon",
);

function updateHeroIconColors() {
  const colors = document.body.classList.contains("dark")
    ? "primary:#f7f4ff,secondary:#b8ff6a"
    : "primary:#242129,secondary:#7857ff";

  themedIcons.forEach((icon) => icon.setAttribute("colors", colors));
}

function showIconFinalFrame(icon) {
  const player = icon?.playerInstance;
  if (!player) return false;

  if (typeof player.seekToEnd === "function") {
    player.seekToEnd();
  } else if (typeof player.goToLastFrame === "function") {
    player.goToLastFrame();
  } else {
    return false;
  }

  return true;
}

function setupRevealHoverIcon(iconSelector, targetSelector) {
  const icon = document.querySelector(iconSelector);
  const target = document.querySelector(targetSelector);
  if (!icon || !target) return;

  const showFinalFrame = () => showIconFinalFrame(icon);
  if (!showFinalFrame()) {
    icon.addEventListener("ready", showFinalFrame, { once: true });
  }
  icon.addEventListener("refresh", showFinalFrame);

  target.addEventListener("mouseenter", () => {
    const player = icon.playerInstance;
    if (typeof player?.playFromStart === "function") {
      player.playFromStart();
    } else if (typeof player?.playFromBeginning === "function") {
      player.playFromBeginning();
    }
  });
}

setupRevealHoverIcon(".university-icon", ".university-meta");
setupRevealHoverIcon(".certificate-stat-icon", ".certificate-stat");
setupRevealHoverIcon(".article-stat-icon", ".article-stat");
setupRevealHoverIcon(".study-stat-icon", ".study-stat");

navigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", link.getAttribute("href"));
  });
});

const siteHeader = document.querySelector(".site-header");
const desktopViewport = window.matchMedia("(min-width: 801px)");

function updateHeaderAppearance() {
  siteHeader.classList.toggle(
    "is-scrolled",
    desktopViewport.matches && window.scrollY > 24,
  );
}

let navigationFrame;
function updateActiveNavigation() {
  const marker =
    window.scrollY + document.querySelector(".site-header").offsetHeight + 130;
  let activeSection = navigationSections[0];

  navigationSections.forEach((section) => {
    if (section.offsetTop <= marker) activeSection = section;
  });

  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4
  ) {
    activeSection = navigationSections[navigationSections.length - 1];
  }

  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeSection.id}`;
    const wasActive = link.classList.contains("active");
    link.classList.toggle("active", isActive);
    if (isActive && !wasActive && window.matchMedia("(max-width: 800px)").matches) {
      const nav = link.closest(".main-nav");
      const linkPosition =
        link.getBoundingClientRect().left -
        nav.getBoundingClientRect().left +
        nav.scrollLeft;
      nav.scrollTo({
        left: linkPosition - (nav.clientWidth - link.clientWidth) / 2,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    }
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  navigationFrame = null;
}

window.addEventListener(
  "scroll",
  () => {
    updateHeaderAppearance();
    if (navigationFrame) return;
    navigationFrame = window.requestAnimationFrame(updateActiveNavigation);
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  updateHeaderAppearance();
  updateActiveNavigation();
});
updateHeaderAppearance();
updateActiveNavigation();

function switchTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.id === `${tabName}Panel`;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

tabs.forEach((tab) =>
  tab.addEventListener("click", () => switchTab(tab.dataset.tab)),
);
document.querySelectorAll("[data-tab-target]").forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.tabTarget);
    document
      .querySelector(".content-section")
      .scrollIntoView({ behavior: "smooth" });
  });
});

const themeButton = document.querySelector("#themeButton");
const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(useDarkTheme) {
  document.body.classList.toggle("dark", useDarkTheme);
  const nextTheme = useDarkTheme ? "light" : "dark";
  themeButton.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeButton.title = `Switch to ${nextTheme} mode`;
  updateHeroIconColors();
}

applyTheme(systemColorScheme.matches);
systemColorScheme.addEventListener("change", (event) =>
  applyTheme(event.matches),
);

themeButton.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("dark"));
});

const revealGroups = [
  ".project-grid",
  ".services-grid",
  ".timeline",
  ".quote-grid",
];

revealGroups.forEach((selector) => {
  const group = document.querySelector(selector);
  if (!group) return;
  group.classList.add("reveal-group");
  [...group.children].forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-index", index);
  });
});

document
  .querySelectorAll(
    ".section-heading, .section-kicker, .experience-intro, .contact-section, .article-card",
  )
  .forEach((element) => element.classList.add("reveal"));

const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -48px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}
