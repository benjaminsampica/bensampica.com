import mediumZoom from "medium-zoom";

function getZoomableImages() {
  return Array.from(document.querySelectorAll(".prose img")).filter((image) => {
    return !image.closest("a, button") && !image.hasAttribute("data-no-zoom");
  });
}

function initMediumZoom() {
  const images = getZoomableImages();

  if (images.length === 0) {
    return;
  }

  for (const image of images) {
    image.dataset.zoomable = "true";
  }

  mediumZoom(images, {
    background: "rgba(15, 23, 42, 0.92)",
    margin: 24,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMediumZoom, { once: true });
} else {
  initMediumZoom();
}
