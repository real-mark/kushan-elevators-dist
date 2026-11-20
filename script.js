const siteHeader = document.querySelector("[data-site-header]");
const year = document.querySelector("[data-current-year]");
const quickActions = document.querySelector("[data-quick-actions]");
const quickActionToggles = [
  ...document.querySelectorAll("[data-quick-actions-toggle]"),
];
const quickActionStatus = document.querySelector(
  "[data-quick-action-status]",
);
if (
  quickActions &&
  quickActionToggles.length &&
  quickActions.querySelector("[data-quick-action]")
) {
  document.documentElement.classList.add("quick-actions-enabled");
}
let headerIsFloating = window.scrollY > 32;
let activeQuickActionToggle = null;
let quickActionStatusTimer;

function updateHeaderPosition() {
  if (!siteHeader) return;

  if (!headerIsFloating && window.scrollY > 64) headerIsFloating = true;
  else if (headerIsFloating && window.scrollY < 24) headerIsFloating = false;

  siteHeader.classList.toggle("is-floating", headerIsFloating);
}

window.addEventListener("scroll", updateHeaderPosition, { passive: true });
updateHeaderPosition();

if (year) year.textContent = String(new Date().getFullYear());

function setQuickActionsOpen(isOpen, restoreFocus = false) {
  if (!quickActions) return;

  document.documentElement.classList.toggle(
    "quick-actions-open",
    isOpen,
  );
  quickActions.setAttribute("aria-hidden", String(!isOpen));
  quickActions.toggleAttribute("inert", !isOpen);
  quickActionToggles.forEach((toggle) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close quick actions" : "Open quick actions",
    );
  });

  if (isOpen) {
    const firstAction = quickActions.querySelector("[data-quick-action]");
    if (firstAction) firstAction.focus();
  } else if (restoreFocus && activeQuickActionToggle) {
    activeQuickActionToggle.focus();
  }
}

quickActionToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOpen = document.documentElement.classList.contains(
      "quick-actions-open",
    );
    if (isOpen) {
      setQuickActionsOpen(false, true);
      return;
    }

    activeQuickActionToggle = toggle;
    setQuickActionsOpen(true);
  });
});

document.addEventListener("click", (event) => {
  if (!quickActions || !event.target.closest) return;
  if (
    event.target.closest("[data-quick-actions]") ||
    event.target.closest("[data-quick-actions-toggle]")
  )
    return;

  setQuickActionsOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    document.documentElement.classList.contains("quick-actions-open")
  ) {
    setQuickActionsOpen(false, true);
  }
});

if (quickActions) {
  quickActions.addEventListener("click", (event) => {
    const action = event.target.closest("[data-quick-action]");
    if (!action) return;

    if (action.hasAttribute("data-share-location")) {
      event.preventDefault();
      setQuickActionsOpen(false, true);
      shareLocation(action);
      return;
    }

    setQuickActionsOpen(false);
  });
}

async function shareLocation(button) {
  const url = button.dataset.shareUrl;
  if (!url) {
    announceQuickActionStatus("The location link is not available.");
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Kushan Elevators location",
        text: "Kushan Elevators",
        url,
      });
      announceQuickActionStatus("Location shared.");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to share the location.", error);
        announceQuickActionStatus(
          "Could not share the location. Use View on Map instead.",
        );
      }
    }
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      announceQuickActionStatus("Location link copied.");
    } catch (error) {
      console.error("Unable to copy the location link.", error);
      announceQuickActionStatus(
        "Could not copy the location. Use View on Map instead.",
      );
    }
    return;
  }

  announceQuickActionStatus(
    "Sharing is unavailable. Use View on Map instead.",
  );
}

function announceQuickActionStatus(message) {
  if (!quickActionStatus) return;

  window.clearTimeout(quickActionStatusTimer);
  quickActionStatus.textContent = message;
  quickActionStatusTimer = window.setTimeout(() => {
    quickActionStatus.textContent = "";
  }, 5000);
}
