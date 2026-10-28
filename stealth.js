// Runs inside the page itself. Makes X believe the tab is always visible and
// focused, so its timeline keeps loading new likes while you're on another tab.
(() => {
  const define = (obj, prop, value) => {
    try {
      Object.defineProperty(obj, prop, { get: () => value, configurable: true });
    } catch (e) {}
  };
  define(Document.prototype, "hidden", false);
  define(Document.prototype, "visibilityState", "visible");
  define(Document.prototype, "webkitHidden", false);
  define(Document.prototype, "webkitVisibilityState", "visible");
  try {
    document.hasFocus = () => true;
  } catch (e) {}

  const swallow = (e) => e.stopImmediatePropagation();
  document.addEventListener("visibilitychange", swallow, true);
  document.addEventListener("webkitvisibilitychange", swallow, true);
  window.addEventListener("visibilitychange", swallow, true);
  // only swallow the window's own blur, never an input's blur
  window.addEventListener("blur", (e) => { if (e.target === window) swallow(e); }, true);
})();
