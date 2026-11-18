import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import SplitText from "./components/SplitText/SplitText";

function animateTitle(title, signal) {
  const text = title.textContent;
  let root;
  let finished = false;
  function restore() {
    if (finished) return;
    finished = true;
    root?.unmount();
    title.textContent = text;
    title.removeAttribute("aria-label");
  }

  signal.addEventListener("abort", restore, { once: true });
  Promise.resolve(document.fonts?.ready).then(() => {
    if (finished) return;
    title.setAttribute("aria-label", text);
    const visualTitle = document.createElement("span");
    visualTitle.setAttribute("aria-hidden", "true");
    title.replaceChildren(visualTitle);
    root = createRoot(visualTitle, { onUncaughtError: () => queueMicrotask(restore) });
    root.render(
      <SplitText text={text} tag="span" splitType="words" trigger="load"
        textAlign="start" duration={0.45} delay={45}
        from={{ opacity: 0.55, y: 8 }} to={{ opacity: 1, y: 0 }}
        onLetterAnimationComplete={() => queueMicrotask(restore)} />
    );
  }).catch(restore);
}

export function initMotion({ homepage, splitTitle }) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) return;
  const controller = new AbortController();
  const { signal } = controller;
  if (homepage) {
    const lenis = new Lenis({ autoRaf: true });
    signal.addEventListener("abort", () => {
      lenis.destroy();
    }, { once: true });
  }
  if (splitTitle) animateTitle(splitTitle, signal);
  preference.addEventListener("change", () => controller.abort(), { signal });
}
