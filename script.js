const siteHeader = document.querySelector("[data-site-header]");
const year = document.querySelector("[data-current-year]");
let headerIsFloating = window.scrollY > 32;

function updateHeaderPosition() {
  if (!siteHeader) return;

  if (!headerIsFloating && window.scrollY > 64) headerIsFloating = true;
  else if (headerIsFloating && window.scrollY < 24) headerIsFloating = false;

  siteHeader.classList.toggle("is-floating", headerIsFloating);
}

window.addEventListener("scroll", updateHeaderPosition, { passive: true });
updateHeaderPosition();

if (year) year.textContent = String(new Date().getFullYear());
