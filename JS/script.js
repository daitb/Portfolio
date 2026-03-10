/* =========================================
   TYPING ANIMATION
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    const typingEl = document.querySelector(".typing");
    if (!typingEl) return;

    const phrases = ["Backend Developer", "Software Engineer", "Problem Solver"];
    const TYPE_SPEED  = 80;
    const ERASE_SPEED = 40;
    const HOLD_TYPED  = 1800;
    const HOLD_ERASED = 400;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forceAnim      = typingEl.getAttribute("data-animate-typing") === "true";

    if (prefersReduced && !forceAnim) {
        typingEl.textContent = phrases[0];
        return;
    }

    typingEl.textContent = "";

    let phraseIdx = 0, charIdx = 0, erasing = false;
    let acc = 0, lastTs = 0, hold = 0, raf = 0;

    function step(ts) {
        if (document.hidden) { lastTs = ts; raf = requestAnimationFrame(step); return; }
        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        if (hold > 0) { hold -= delta; raf = requestAnimationFrame(step); return; }

        acc += delta;
        const phrase   = phrases[phraseIdx];
        const interval = erasing ? ERASE_SPEED : TYPE_SPEED;

        if (acc >= interval) {
            acc = 0;
            if (!erasing) {
                if (charIdx < phrase.length) {
                    typingEl.textContent = phrase.slice(0, ++charIdx);
                } else {
                    erasing = true;
                    hold    = HOLD_TYPED;
                }
            } else {
                if (charIdx > 0) {
                    typingEl.textContent = phrase.slice(0, --charIdx);
                } else {
                    erasing   = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    hold      = HOLD_ERASED;
                }
            }
        }
        raf = requestAnimationFrame(step);
    }

    document.addEventListener("visibilitychange", () => { lastTs = 0; acc = 0; });
    window.addEventListener("beforeunload", () => { if (raf) cancelAnimationFrame(raf); }, { once: true });
    raf = requestAnimationFrame(step);
});

/* =========================================
   SCROLL EFFECTS
   ========================================= */
const header      = document.getElementById("header");
const progressBar = document.getElementById("scrollProgress");
const scrollTopBtn= document.getElementById("scrollTop");

window.addEventListener("scroll", () => {
    const scrollY    = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;

    // Scroll progress bar
    progressBar.style.width = ((scrollY / docHeight) * 100) + "%";

    // Sticky header style on scroll
    header.classList.toggle("scrolled", scrollY > 50);

    // Scroll-to-top button visibility
    scrollTopBtn.classList.toggle("visible", scrollY > 400);

    // Active nav link
    highlightNav(scrollY);
}, { passive: true });

function highlightNav(scrollY) {
    const offset   = scrollY + 130;
    const sections = document.querySelectorAll("section[id]");
    const links    = document.querySelectorAll(".nav-links a");

    sections.forEach(sec => {
        if (offset >= sec.offsetTop && offset < sec.offsetTop + sec.offsetHeight) {
            links.forEach(l => l.classList.remove("active"));
            const active = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
            if (active) active.classList.add("active");
        }
    });
}

/* =========================================
   SCROLL REVEAL (Intersection Observer)
   ========================================= */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll("[data-reveal]").forEach(el => {
    // Stagger siblings within the same parent container
    const siblings = Array.from(el.parentElement.children).filter(
        c => c.hasAttribute("data-reveal")
    );
    const idx = siblings.indexOf(el);
    if (siblings.length > 1 && idx > 0) {
        el.style.transitionDelay = Math.min(idx * 0.12, 0.48) + "s";
    }
    revealObserver.observe(el);
});

/* =========================================
   COUNTER ANIMATION
   ========================================= */
function animateCount(el) {
    const target  = parseInt(el.dataset.count, 10);
    const numEl   = el.querySelector(".stat-number");
    const duration = 1400;
    const start    = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        numEl.textContent = Math.round(eased * target) + (progress >= 1 ? "+" : "");
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const statsContainer = document.querySelector(".about-stats");
if (statsContainer) {
    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll(".stat").forEach(animateCount);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counterObserver.observe(statsContainer);
}

/* =========================================
   MOBILE MENU
   ========================================= */
const menuToggle = document.getElementById("menuToggle");
const navLinks   = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const open = menuToggle.classList.toggle("active");
        navLinks.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            navLinks.classList.remove("open");
            document.body.style.overflow = "";
        });
    });
}

/* =========================================
   PORTFOLIO TABS
   ========================================= */
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.add("active");
    });
});

/* =========================================
   SCROLL TO TOP
   ========================================= */
scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================
   THEME TOGGLE
   ========================================= */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = themeToggle?.querySelector("i");
    if (icon) icon.className = theme === "light" ? "bx bx-moon" : "bx bx-sun";
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
} else {
    applyTheme("dark");
}

themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "light" ? "dark" : "light");
});

