// Saat tombol paket diklik, beri animasi singkat sebelum membuka WhatsApp.
const navigation = document.querySelector(".nav-links");

if (navigation) {
  navigation.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const selectedLink = event.target.closest('a[href^="#"]:not(.button)');

    if (!(selectedLink instanceof HTMLAnchorElement)) {
      return;
    }

    navigation.querySelectorAll(".nav-link-selected").forEach((link) => {
      link.classList.remove("nav-link-selected");
      link.removeAttribute("aria-current");
    });

    selectedLink.classList.add("nav-link-selected");
    selectedLink.setAttribute("aria-current", "location");
  });
}

const servicesLink = document.querySelector('.button-row a[href="#layanan"]');
const servicesSection = document.querySelector("#layanan");
let servicesScrollFrame;
let previousScrollBehavior;

if (servicesLink instanceof HTMLAnchorElement && servicesSection) {
  const stopServicesScroll = () => {
    if (servicesScrollFrame !== undefined) {
      window.cancelAnimationFrame(servicesScrollFrame);
      servicesScrollFrame = undefined;
    }

    if (previousScrollBehavior !== undefined) {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      previousScrollBehavior = undefined;
    }
  };

  window.addEventListener("wheel", stopServicesScroll, { passive: true });
  window.addEventListener("touchstart", stopServicesScroll, { passive: true });
  window.addEventListener("pointerdown", stopServicesScroll, { passive: true });

  servicesLink.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    stopServicesScroll();
    previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.history.pushState(null, "", "#layanan");

    const targetPosition = servicesSection.getBoundingClientRect().top + window.scrollY;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetPosition);
      stopServicesScroll();
      return;
    }

    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = Math.min(1100, Math.max(550, Math.abs(distance) * 0.7));
    let startTime;

    const animateScroll = (time) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = progress < 0.5
        ? 4 * progress ** 3
        : 1 - ((-2 * progress + 2) ** 3) / 2;

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        servicesScrollFrame = window.requestAnimationFrame(animateScroll);
      } else {
        stopServicesScroll();
      }
    };

    servicesScrollFrame = window.requestAnimationFrame(animateScroll);
  });
}

const pricingSection = document.querySelector(".pricing");
const pricingFeedback = document.querySelector("#pricing-feedback");
const pricingGrid = pricingSection?.querySelector(".pricing-grid");
let packageRedirectTimer;

if (pricingSection && pricingFeedback && pricingGrid) {
  const featuredCard = pricingGrid.querySelector(".pricing-featured");
  const defaultPackageCard = featuredCard instanceof HTMLElement ? featuredCard : null;
  let activePackageCard = defaultPackageCard;

  const setActivePackageCard = (card) => {
    if (activePackageCard === card) {
      return;
    }

    activePackageCard?.classList.remove("package-active");
    activePackageCard = card;
    activePackageCard.classList.add("package-active");
  };

  if (defaultPackageCard) {
    defaultPackageCard.classList.add("package-active");
    pricingGrid.classList.add("has-selection-indicator");

    pricingGrid.addEventListener("pointerover", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const card = event.target.closest(".pricing-card");

      if (
        card instanceof HTMLElement
        && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))
      ) {
        setActivePackageCard(card);
      }
    });

    pricingGrid.addEventListener("pointerleave", () => {
      const focusedCard = document.activeElement instanceof Element
        ? document.activeElement.closest(".pricing-card")
        : null;
      setActivePackageCard(focusedCard instanceof HTMLElement ? focusedCard : defaultPackageCard);
    });

    pricingGrid.addEventListener("focusin", (event) => {
      if (event.target instanceof Element) {
        const card = event.target.closest(".pricing-card");

        if (card instanceof HTMLElement) {
          setActivePackageCard(card);
        }
      }
    });
  }

  pricingSection.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const packageLink = event.target.closest(".plan-button");

    if (!(packageLink instanceof HTMLAnchorElement) || packageLink.getAttribute("aria-disabled") === "true") {
      return;
    }

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const packageCard = packageLink.closest(".pricing-card");
    const packageName = packageCard?.querySelector(".plan-name")?.textContent.trim();

    if (!packageCard || !packageName) {
      return;
    }

    event.preventDefault();
    window.clearTimeout(packageRedirectTimer);

    pricingSection.querySelectorAll(".plan-button").forEach((link) => {
      link.setAttribute("aria-disabled", "true");
    });

    pricingFeedback.textContent = `Paket ${packageName} dipilih. Membuka WhatsApp...`;

    packageRedirectTimer = window.setTimeout(() => {
      window.location.assign(packageLink.href);
    }, 550);
  });
}
