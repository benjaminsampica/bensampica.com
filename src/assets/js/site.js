const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navToggle = document.querySelector("[data-nav-toggle]");
const header = document.querySelector("[data-site-header]");

themeToggle?.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
});

navToggle?.addEventListener("click", () => {
  const open = navigation?.classList.toggle("is-open") ?? false;
  navToggle.setAttribute("aria-expanded", String(open));
});

navigation?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;
  navigation.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
});

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

for (const pre of document.querySelectorAll(".prose pre")) {
  const code = pre.querySelector("code");
  if (!code) continue;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "code-copy";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(code.textContent ?? "");
    button.textContent = "Copied";
    window.setTimeout(() => { button.textContent = "Copy"; }, 1400);
  });
  pre.append(button);
}

const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length > 0) {
  const headings = tocLinks
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of tocLinks) link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
    }
  }, { rootMargin: "-18% 0px -72% 0px" });
  for (const heading of headings) observer.observe(heading);
}

const lightboxRoots = document.querySelectorAll("[data-lightbox-root]");
if (lightboxRoots.length > 0 && "HTMLDialogElement" in window) {
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt="">';
  document.body.append(dialog);
  const dialogImage = dialog.querySelector("img");

  for (const container of lightboxRoots) {
    container.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLImageElement)) return;
      dialogImage.src = event.target.currentSrc || event.target.src;
      dialogImage.alt = event.target.alt;
      dialog.showModal();
    });
  }

  dialog.querySelector("button")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
