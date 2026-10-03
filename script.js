if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function resetToHero() {
    if (window.location.hash) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

resetToHero();
window.addEventListener("load", resetToHero);
window.addEventListener("pageshow", resetToHero);

const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll(".tab-panel");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const navigationLinks = [...document.querySelectorAll(".main-nav a[href^='#']")];
const navigationSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

document.querySelectorAll(".certificate-card .credential-icon").forEach((badge) => {
    const iconBox = document.createElement("span");
    const icon = document.createElement("lord-icon");
    iconBox.className = "credential-icon";
    iconBox.setAttribute("aria-hidden", "true");
    icon.className = "credential-logo";
    icon.setAttribute("src", "https://cdn.lordicon.com/wjdlpfml.json");
    iconBox.append(icon);
    badge.replaceWith(iconBox);
});

const themedIcons = document.querySelectorAll(
    ".profile-content lord-icon, .certificate-card lord-icon, .articles-section lord-icon"
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
            block: "start"
        });
        window.history.replaceState(null, "", link.getAttribute("href"));
    });
});

let navigationFrame;
function updateActiveNavigation() {
    const marker = window.scrollY + document.querySelector(".site-header").offsetHeight + 130;
    let activeSection = navigationSections[0];

    navigationSections.forEach((section) => {
        if (section.offsetTop <= marker) activeSection = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        activeSection = navigationSections[navigationSections.length - 1];
    }

    navigationLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeSection.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    navigationFrame = null;
}

window.addEventListener("scroll", () => {
    if (navigationFrame) return;
    navigationFrame = window.requestAnimationFrame(updateActiveNavigation);
}, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
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

tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => {
        switchTab(button.dataset.tabTarget);
        document.querySelector(".content-section").scrollIntoView({ behavior: "smooth" });
    });
});

document.querySelector("#messageButton").addEventListener("click", () => {
    window.open("https://www.linkedin.com/in/navdeep-singh-51b573356/", "_blank", "noopener,noreferrer");
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
systemColorScheme.addEventListener("change", (event) => applyTheme(event.matches));

themeButton.addEventListener("click", () => {
    applyTheme(!document.body.classList.contains("dark"));
});

const revealGroups = [
    ".project-grid",
    ".services-grid",
    ".timeline",
    ".quote-grid"
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

document.querySelectorAll(
    ".section-heading, .section-kicker, .experience-intro, .contact-section, .article-card"
).forEach((element) => element.classList.add("reveal"));

const certificateCards = [...document.querySelectorAll(".certificate-card")];
const certificatesToggle = document.querySelector("#certificatesToggle");
const certificatesSection = document.querySelector("#certificates");
const certificateModal = document.querySelector("#certificateModal");
const certificateModalTitle = document.querySelector("#certificateModalTitle");
const certificateModalImage = document.querySelector("#certificateModalImage");
const certificateOriginalLink = document.querySelector("#certificateOriginalLink");
const certificateModalClose = document.querySelector(".certificate-modal-close");
const initiallyVisibleCertificates = 6;

function openCertificateModal(card) {
    if (!certificateModal || !card) return;

    certificateModalTitle.textContent = card.dataset.title;
    certificateModalImage.src = card.dataset.preview;
    certificateModalImage.alt = `Full preview of ${card.dataset.title} certificate`;
    certificateOriginalLink.href = card.dataset.source;
    certificateModal.showModal();
}

certificateCards.forEach((card) => {
    card.querySelector(".certificate-card-main")?.addEventListener("click", () => {
        openCertificateModal(card);
    });
});

certificateModalClose?.addEventListener("click", () => certificateModal.close());
certificateModal?.addEventListener("click", (event) => {
    if (event.target === certificateModal) certificateModal.close();
});
certificateModal?.addEventListener("close", () => {
    certificateModalImage.removeAttribute("src");
});

function expandCertificates() {
    certificateCards.slice(initiallyVisibleCertificates).forEach((card, index) => {
        card.hidden = false;
        card.classList.remove("is-leaving");
        card.classList.add("is-entering");
        card.style.setProperty("--certificate-index", index);
        card.addEventListener("animationend", () => card.classList.remove("is-entering"), { once: true });
    });

    certificatesToggle.setAttribute("aria-expanded", "true");
    certificatesToggle.textContent = "Show Fewer Certificates";
}

function collapseCertificates() {
    const extraCards = certificateCards.slice(initiallyVisibleCertificates);
    const finishCollapse = () => {
        extraCards.forEach((card) => {
            card.hidden = true;
            card.classList.remove("is-entering", "is-leaving");
            card.style.removeProperty("--certificate-index");
        });
    };

    if (prefersReducedMotion.matches) {
        finishCollapse();
    } else {
        extraCards.forEach((card) => card.classList.add("is-leaving"));
        window.setTimeout(finishCollapse, 300);
    }

    certificatesToggle.setAttribute("aria-expanded", "false");
    certificatesToggle.textContent = "View All ";

    const sectionTop = certificatesSection.getBoundingClientRect().top;
    if (sectionTop < -80) {
        certificatesSection.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
    }
}

certificatesToggle?.addEventListener("click", () => {
    const isExpanded = certificatesToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) collapseCertificates();
    else expandCertificates();
});

const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -48px"
    });

    revealElements.forEach((element) => revealObserver.observe(element));
}
