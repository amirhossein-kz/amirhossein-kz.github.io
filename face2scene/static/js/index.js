(function () {
  "use strict";

  const copyBtn = document.getElementById("copyBibtex");
  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      const code = document.querySelector("#citation pre code");
      if (!code) return;

      const text = code.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy BibTeX";
        }, 1400);
      } catch (_) {
        copyBtn.textContent = "Copy failed";
        setTimeout(function () {
          copyBtn.textContent = "Copy BibTeX";
        }, 1400);
      }
    });
  }

  const rankMetricTables = function () {
    const parseMetricValue = function (cell) {
      if (!cell) return null;

      const text = (cell.textContent || "").replace(/,/g, "").trim();
      const value = Number.parseFloat(text);
      return Number.isFinite(value) ? value : null;
    };

    const nearlyEqual = function (left, right) {
      return Math.abs(left - right) < 1e-9;
    };

    document.querySelectorAll(".result-table").forEach(function (table) {
      const headers = Array.from(table.querySelectorAll("thead th"));
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      headers.forEach(function (header, columnIndex) {
        const label = (header.textContent || "").trim();
        const direction = label.includes("\u2193") ? "asc" : label.includes("\u2191") ? "desc" : null;
        if (!direction) return;

        const rankedCells = rows
          .map(function (row) {
            const cell = row.cells[columnIndex];
            const value = parseMetricValue(cell);
            return value === null ? null : { cell: cell, value: value };
          })
          .filter(Boolean);

        if (rankedCells.length < 2) return;

        rankedCells.sort(function (left, right) {
          return direction === "asc" ? left.value - right.value : right.value - left.value;
        });

        const uniqueValues = rankedCells.reduce(function (values, item) {
          if (!values.some(function (value) { return nearlyEqual(value, item.value); })) {
            values.push(item.value);
          }
          return values;
        }, []);

        const bestValue = uniqueValues[0];
        const secondBestValue = uniqueValues[1];

        rankedCells.forEach(function (item) {
          if (nearlyEqual(item.value, bestValue)) {
            item.cell.classList.add("metric-best");
          } else if (secondBestValue !== undefined && nearlyEqual(item.value, secondBestValue)) {
            item.cell.classList.add("metric-second");
          }
        });
      });
    });
  };

  rankMetricTables();

  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxStage = document.getElementById("lightboxStage");
  const lightboxZoomIn = document.getElementById("lightboxZoomIn");
  const lightboxZoomOut = document.getElementById("lightboxZoomOut");
  const lightboxZoomReset = document.getElementById("lightboxZoomReset");
  const zoomableImages = document.querySelectorAll(".zoomable-image");

  if (
    !lightbox ||
    !lightboxImage ||
    !lightboxClose ||
    !lightboxStage ||
    !lightboxZoomIn ||
    !lightboxZoomOut ||
    !lightboxZoomReset ||
    !zoomableImages.length
  ) return;

  let lightboxScale = 1;
  let lightboxBaseWidth = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartScrollLeft = 0;
  let dragStartScrollTop = 0;

  const applyZoom = function () {
    if (!lightboxBaseWidth) return;
    lightboxImage.style.width = (lightboxBaseWidth * lightboxScale).toFixed(0) + "px";
    lightboxZoomReset.textContent = Math.round(lightboxScale * 100) + "%";
  };

  const fitLightboxImage = function () {
    const naturalWidth = lightboxImage.naturalWidth;
    const naturalHeight = lightboxImage.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    const maxWidth = window.innerWidth * 0.94;
    const maxHeight = (window.innerHeight - 110) * 0.94;
    const fitRatio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
    lightboxBaseWidth = Math.max(320, naturalWidth * fitRatio);
    lightboxScale = 1;
    applyZoom();
    lightboxStage.scrollTop = 0;
    lightboxStage.scrollLeft = 0;
  };

  const setZoom = function (nextScale) {
    lightboxScale = Math.max(1, Math.min(4, nextScale));
    applyZoom();
  };

  const closeLightbox = function () {
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxImage.style.width = "";
    lightboxBaseWidth = 0;
    lightboxScale = 1;
    isDragging = false;
    lightboxStage.classList.remove("is-dragging");
    lightboxZoomReset.textContent = "100%";
    document.body.style.overflow = "";
  };

  zoomableImages.forEach(function (image) {
    image.addEventListener("click", function () {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      if (lightboxImage.complete) {
        fitLightboxImage();
      }
    });
  });

  lightboxImage.addEventListener("load", fitLightboxImage);

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxZoomIn.addEventListener("click", function () {
    setZoom(lightboxScale + 0.25);
  });
  lightboxZoomOut.addEventListener("click", function () {
    setZoom(lightboxScale - 0.25);
  });
  lightboxZoomReset.addEventListener("click", function () {
    setZoom(1);
    lightboxStage.scrollTop = 0;
    lightboxStage.scrollLeft = 0;
  });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightboxStage.addEventListener(
    "wheel",
    function (event) {
      if (lightbox.hidden) return;
      event.preventDefault();
      setZoom(lightboxScale + (event.deltaY < 0 ? 0.2 : -0.2));
    },
    { passive: false }
  );

  lightboxStage.addEventListener("pointerdown", function (event) {
    if (lightbox.hidden || lightboxScale <= 1) return;
    if (event.button !== 0) return;

    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartScrollLeft = lightboxStage.scrollLeft;
    dragStartScrollTop = lightboxStage.scrollTop;
    lightboxStage.classList.add("is-dragging");
    lightboxStage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  lightboxStage.addEventListener("pointermove", function (event) {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    lightboxStage.scrollLeft = dragStartScrollLeft - deltaX;
    lightboxStage.scrollTop = dragStartScrollTop - deltaY;
  });

  const stopDragging = function () {
    isDragging = false;
    lightboxStage.classList.remove("is-dragging");
  };

  lightboxStage.addEventListener("pointerup", stopDragging);
  lightboxStage.addEventListener("pointercancel", stopDragging);
  lightboxStage.addEventListener("pointerleave", function () {
    if (isDragging) {
      lightboxStage.classList.remove("is-dragging");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    } else if ((event.key === "+" || event.key === "=") && !lightbox.hidden) {
      setZoom(lightboxScale + 0.25);
    } else if (event.key === "-" && !lightbox.hidden) {
      setZoom(lightboxScale - 0.25);
    } else if (event.key === "0" && !lightbox.hidden) {
      setZoom(1);
    }
  });

  window.addEventListener("resize", function () {
    if (!lightbox.hidden && lightboxImage.src) {
      fitLightboxImage();
    }
  });
})();
