(function() {
  "use strict";

  const select = (selector, all = false) => {
    const value = selector.trim();
    return all ? [...document.querySelectorAll(value)] : document.querySelector(value);
  };

  const on = (type, selector, listener, all = false) => {
    const elements = select(selector, all);
    if (!elements) return;

    if (all) {
      elements.forEach((element) => element.addEventListener(type, listener));
      return;
    }

    elements.addEventListener(type, listener);
  };

  const onscroll = (element, listener) => {
    element.addEventListener("scroll", listener);
  };

  const body = select("body");
  const navbarLinks = select("#navbar .scrollto", true);
  const mobileNavToggle = select(".mobile-nav-toggle");
  const mobileNavIcon = mobileNavToggle ? mobileNavToggle.querySelector("i") : null;
  const backToTop = select(".back-to-top");
  const themeToggle = select(".theme-toggle");
  const themeToggleIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const themeToggleLabel = themeToggle ? themeToggle.querySelector("span") : null;
  const themeColorMeta = select("#theme-color-meta");
  const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (theme, persist = false) => {
    if (!body) return;

    const resolvedTheme = theme === "dark" ? "dark" : "light";
    const isDark = resolvedTheme === "dark";
    body.setAttribute("data-theme", resolvedTheme);

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    if (themeToggleIcon) {
      themeToggleIcon.classList.toggle("bi-moon-stars", !isDark);
      themeToggleIcon.classList.toggle("bi-sun", isDark);
    }

    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#0b1320" : "#dce5f0");
    }

    if (persist) {
      window.localStorage.setItem("homepage-theme", resolvedTheme);
    }
  };

  const getPreferredTheme = () => {
    const storedTheme = window.localStorage.getItem("homepage-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return "light";
  };

  const syncMobileNavToggle = () => {
    if (!mobileNavToggle || !mobileNavIcon || !body) return;

    const isOpen = body.classList.contains("mobile-nav-active");
    mobileNavToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNavToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    mobileNavIcon.classList.toggle("bi-list", !isOpen);
    mobileNavIcon.classList.toggle("bi-x", isOpen);
  };

  const navbarLinksActive = () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
    if (nearBottom && navbarLinks.length) {
      navbarLinks.forEach((link) => link.classList.remove("active"));
      navbarLinks[navbarLinks.length - 1].classList.add("active");
      return;
    }

    const position = window.scrollY + 120;
    navbarLinks.forEach((link) => {
      if (!link.hash) return;
      const section = select(link.hash);
      if (!section) return;

      if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  const scrollToSection = (selector) => {
    const section = select(selector);
    if (!section) return;

    window.scrollTo({
      top: section.offsetTop,
      behavior: "smooth"
    });
  };

  const toggleBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("active", window.scrollY > 100);
  };

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener("click", () => {
      if (!body) return;
      body.classList.toggle("mobile-nav-active");
      syncMobileNavToggle();
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body?.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  darkThemeQuery.addEventListener("change", (event) => {
    if (window.localStorage.getItem("homepage-theme")) return;
    applyTheme(event.matches ? "dark" : "light");
  });

  on("click", ".scrollto", function(event) {
    if (!this.hash || !select(this.hash)) return;

    event.preventDefault();

    if (body && body.classList.contains("mobile-nav-active")) {
      body.classList.remove("mobile-nav-active");
      syncMobileNavToggle();
    }

    scrollToSection(this.hash);
  }, true);

  applyTheme(getPreferredTheme());

  window.addEventListener("load", () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollToSection(window.location.hash);
    }
  });

  const typed = select(".typed");
  if (typed) {
    const typedStrings = (typed.getAttribute("data-typed-items") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (typedStrings.length) {
      new Typed(".typed", {
        strings: typedStrings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000
      });
    }
  }

  const publicationYearByTitle = {
    "Face2Scene: Using Facial Degradation as an Oracle for Diffusion-Based Scene Restoration": "2026",
    "LIFT: Latent Implicit Functions for Task- and Data-Agnostic Encoding": "2025",
    "MedScale-Former: Self-guided multiscale transformer for medical image segmentation": "2025",
    "SUM: Saliency Unification through Mamba for Visual Attention Modeling": "2025",
    "FuseNet: Self-Supervised Dual-Path Network for Medical Image Segmentation": "2024",
    "INCODE: Implicit Neural Conditioning with Prior Knowledge Embeddings": "2024",
    "Beyond Self-Attention: Deformable Large Kernel Attention for Medical Image Segmentation": "2024",
    "Laplacian-Former: Overcoming the Limitations of Vision Transformers in Local Texture Detection": "2023",
    "Unlocking Fine-Grained Details with Wavelet-based High-Frequency Enhancement in Transformers": "2023",
    "DermoSegDiff: A Boundary-aware Segmentation Diffusion Model for Skin Lesion Delineation": "2023",
    "Self-supervised Semantic Segmentation: Consistency over Transformation": "2023",
    "Implicit Neural Representation in Medical Imaging: A Comparative Survey": "2023",
    "Diffusion Models in Medical Imaging: A Comprehensive Survey": "2022",
    "Advances in Medical Image Analysis with Vision Transformers: A Comprehensive Review": "2023",
    "DAE-Former: Dual Attention-guided Efficient Transformer for Medical Image Segmentation": "2023",
    "MS-Former: Multi-Scale Self-Guided Transformer for Medical Image Segmentation": "2023",
    "MMCFormer: Missing Modality Compensation Transformer for Brain Tumor Segmentation": "2023",
    "HiFormer: Hierarchical Multi-scale Representations Using Transformers for Medical Image Segmentation": "2023",
    "An Intelligent Modular Real-Time Vision-Based System for Environment Perception": "2022"
  };

  const publicationCards = select("#publications .post", true);
  publicationCards.forEach((card) => {
    const content = card.querySelector(".pub-content");
    if (!content) return;

    const title = content.querySelector(".pub-title");
    if (!title) return;

    const normalizedTitle = (title.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    if (publicationYearByTitle[normalizedTitle]) {
      card.dataset.year = publicationYearByTitle[normalizedTitle];
    }
  });

  const publicationStatus = select(".publication-status");
  const publicationFilters = select(".pub-filter", true);

  const applyPublicationFilter = (year) => {
    let visibleCount = 0;

    publicationCards.forEach((card) => {
      const isVisible = year === "all" || card.dataset.year === year;
      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (!publicationStatus) return;
    publicationStatus.textContent = year === "all"
      ? `Showing all ${visibleCount} publications.`
      : `Showing ${visibleCount} publication${visibleCount === 1 ? "" : "s"} from ${year}.`;
  };

  publicationFilters.forEach((button) => {
    button.addEventListener("click", () => {
      publicationFilters.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      applyPublicationFilter(button.dataset.filter || "all");
    });
  });

  const publicationMedia = select(".pub-media", true);
  publicationMedia.forEach((media) => {
    if (media.querySelector(".pub-media-link")) return;

    const image = media.querySelector("img");
    const video = media.querySelector("video");
    const asset = image || video;
    if (!asset) return;

    const trigger = document.createElement("a");
    const label = document.createElement("span");
    const teaserLabel = asset.getAttribute("alt") || asset.getAttribute("aria-label") || "Publication teaser";

    trigger.className = "pub-media-link pub-teaser-lightbox";
    trigger.href = asset.currentSrc || asset.getAttribute("src") || "";
    trigger.setAttribute("aria-label", `Open full teaser for ${teaserLabel}`);
    trigger.setAttribute("data-gallery", "publication-teasers");
    trigger.setAttribute("data-glightbox", `title: ${teaserLabel}`);

    if (video) {
      trigger.setAttribute("data-type", "video");
    }

    label.className = "pub-media-link-label";
    label.innerHTML = '<i class="fas fa-expand-alt" aria-hidden="true"></i><span>View full teaser</span>';
    trigger.appendChild(label);
    media.appendChild(trigger);
  });

  GLightbox({
    selector: ".pub-teaser-lightbox"
  });

  window.addEventListener("load", () => {
    navbarLinksActive();
    toggleBackToTop();
    syncMobileNavToggle();
    applyPublicationFilter("all");

    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });

  onscroll(document, navbarLinksActive);
  onscroll(document, toggleBackToTop);
})();
