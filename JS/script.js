/** @type {import('lottie-web')} */
var lottie;

document.addEventListener("DOMContentLoaded", () => {
    const typingElement = document.querySelector(".typing");
    if (!typingElement) return;

    // Configurable phrases and speeds
    const phrases = ["FullStack Developer", "Design System"]; // Add more strings if needed
    const typingMsPerChar = 90;   // typing speed
    const erasingMsPerChar = 45;  // erasing speed
    const holdAfterTypeMs = 1600; // pause after finishing a phrase
    const holdAfterEraseMs = 400; // pause before typing next phrase

    // Respect reduced motion with optional override via data-animate-typing="true"
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forceAnimation = typingElement.getAttribute("data-animate-typing") === "true";
    if (prefersReducedMotion && !forceAnimation) {
        typingElement.textContent = phrases[0];
        return;
    }

    // Ensure we start from empty for proper typing simulation
    typingElement.textContent = "";

    let phraseIndex = 0;
    let charIndex = 0;
    let isErasing = false;
    let accumulatorMs = 0;
    let lastTs = 0;
    let holdMsRemaining = 0;
    let rafId = 0;

    function step(ts) {
        // Pause when the tab is hidden to save CPU/battery
        if (document.hidden) {
            lastTs = ts;
            rafId = requestAnimationFrame(step);
            return;
        }

        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        if (holdMsRemaining > 0) {
            holdMsRemaining -= delta;
            rafId = requestAnimationFrame(step);
            return;
        }

        accumulatorMs += delta;
        const currentPhrase = phrases[phraseIndex];
        const interval = isErasing ? erasingMsPerChar : typingMsPerChar;

        if (accumulatorMs >= interval) {
            accumulatorMs = 0;

            if (!isErasing) {
                // typing forward
                if (charIndex < currentPhrase.length) {
                    charIndex += 1;
                    typingElement.textContent = currentPhrase.slice(0, charIndex);
                } else {
                    // finished typing the phrase
                    isErasing = true;
                    holdMsRemaining = holdAfterTypeMs;
                }
            } else {
                // erasing backward
                if (charIndex > 0) {
                    charIndex -= 1;
                    typingElement.textContent = currentPhrase.slice(0, charIndex);
                } else {
                    // finished erasing, move to next phrase
                    isErasing = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    holdMsRemaining = holdAfterEraseMs;
                }
            }
        }

        rafId = requestAnimationFrame(step);
    }

    // Clean up on page unload/navigation
    function cleanup() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("beforeunload", cleanup);
        document.removeEventListener("visibilitychange", onVisibilityChange);
    }

    function onVisibilityChange() {
        // Reset timing accumulator to avoid burst when returning to tab
        lastTs = 0;
        accumulatorMs = 0;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", cleanup);
    rafId = requestAnimationFrame(step);
});

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {

            tabs.forEach((t) => t.classList.remove("active"));

            tab.classList.add("active");

            contents.forEach((content) => content.classList.remove("active"));

            const target = tab.getAttribute("data-target");
            document.getElementById(target).classList.add("active");
        });
    });
});

