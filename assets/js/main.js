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

  const navbarLinks = select("#navbar .nav-link.scrollto", true);
  const backToTop = select(".back-to-top");

  const navbarLinksActive = () => {
    const firstSection = select("#about");
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
    if (nearBottom && navbarLinks.length) {
      navbarLinks.forEach((link) => link.classList.remove("active"));
      navbarLinks[navbarLinks.length - 1].classList.add("active");
      return;
    }

    const position = window.scrollY + 120;
    if (firstSection && position < firstSection.offsetTop) {
      navbarLinks.forEach((link, index) => link.classList.toggle("active", index === 0));
      return;
    }

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
      behavior: "auto"
    });
  };

  const toggleBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("active", window.scrollY > 100);
  };

  on("click", ".scrollto", function(event) {
    if (!this.hash || !select(this.hash)) return;

    event.preventDefault();

    scrollToSection(this.hash);
  }, true);

  window.addEventListener("load", () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollToSection(window.location.hash);
    }
  });

  const publicationYearByTitle = {
    "A Unified Theory of Sinusoidal Activation Families for Implicit Neural Representations": "2026",
    "AVIS: Adaptive Test-Time Scaling for Vision-Language Models": "2026",
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

  const newsItems = select("#news .news-list > li", true);
  const newsToggle = select(".news-toggle");
  const recentNewsCount = 6;

  const updateNewsVisibility = (expanded) => {
    newsItems.forEach((item, index) => {
      item.classList.toggle("news-hidden", !expanded && index >= recentNewsCount);
    });

    if (!newsToggle) return;
    newsToggle.textContent = expanded ? "show recent news only" : "show older news";
    newsToggle.setAttribute("aria-expanded", String(expanded));
  };

  if (newsToggle && newsItems.length > recentNewsCount) {
    newsToggle.addEventListener("click", () => {
      updateNewsVisibility(newsToggle.getAttribute("aria-expanded") !== "true");
    });
  } else if (newsToggle) {
    newsToggle.hidden = true;
  }

  const publicationCards = select("#publications .post", true);
  publicationCards.forEach((card) => {
    const content = card.querySelector(".pub-content");
    if (!content) return;

    const title = content.querySelector(".pub-title");
    const normalizedTitle = (title?.textContent || "Publication")
      .replace(/\s+/g, " ")
      .trim();

    if (publicationYearByTitle[normalizedTitle]) {
      card.dataset.year = publicationYearByTitle[normalizedTitle];
    }

    const venueGroup = content.querySelector(".pub-venue")?.parentElement;
    const abstract = content.querySelector(".pub-abstract");
    const links = [...content.querySelectorAll(".pub-link a")];

    if (!venueGroup || content.querySelector(".pub-actions") || (!links.length && !abstract)) return;

    const actions = document.createElement("div");
    actions.className = "pub-actions";
    actions.setAttribute("aria-label", `Links for ${normalizedTitle}`);

    links.forEach((link) => {
      const originalLabel = (link.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      let label = originalLabel.toLowerCase();

      if (/project/.test(label)) label = "project";
      else if (/paper|pdf|arxiv/.test(label)) label = "paper";
      else if (/github|code/.test(label)) label = "code";
      else if (/dataset|data/.test(label)) label = "data";
      else if (/weight|model/.test(label)) label = "weights";

      link.textContent = label;
      link.className = "pub-action-link";
      link.setAttribute("aria-label", `${label} for ${normalizedTitle} (opens in a new tab)`);
      actions.appendChild(link);
    });

    if (abstract) {
      const toggle = abstract.querySelector(".pub-abstract-toggle");

      if (toggle) {
        const updateAbstractLabel = () => {
          toggle.setAttribute(
            "aria-label",
            `${abstract.open ? "Hide" : "Show"} abstract for ${normalizedTitle}`
          );
        };

        abstract.addEventListener("toggle", updateAbstractLabel);
        updateAbstractLabel();
      }

      actions.appendChild(abstract);
    }

    venueGroup.insertAdjacentElement("afterend", actions);
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

    const assetSource = asset.getAttribute("src") || "";
    if (video) {
      media.dataset.mediaType = "video";
    } else if (/\.gif(?:$|[?#])/i.test(assetSource)) {
      media.dataset.mediaType = "animation";
    }

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
    label.innerHTML = '<span>view demo</span><i class="fas fa-expand-alt" aria-hidden="true"></i>';
    trigger.appendChild(label);
    media.appendChild(trigger);
  });

  GLightbox({
    selector: ".pub-teaser-lightbox"
  });

  window.addEventListener("load", () => {
    navbarLinksActive();
    toggleBackToTop();
    updateNewsVisibility(false);
    applyPublicationFilter("all");

  });

  onscroll(document, navbarLinksActive);
  onscroll(document, toggleBackToTop);
})();
