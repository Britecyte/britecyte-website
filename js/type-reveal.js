/**
 * Multi-line type-on reveal: when a .reveal block becomes visible,
 * type its text-bearing children in parallel (multiple lines at once).
 */
const TYPE_SELECTOR = "h1, h2, h3, h4, p, li, .hero-belief, .section-intro, .band-lede, address";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapTextNodes(el) {
  if (el.dataset.typed === "1") return;
  if (el.closest("a, button, .pipe-map, .news-grid, .team-grid, form")) return;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest("script, style, svg")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((textNode) => {
    const text = textNode.nodeValue;
    const frag = document.createDocumentFragment();
    const word = document.createElement("span");
    word.className = "type-line";
    word.setAttribute("aria-hidden", "true");

    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "type-ch";
      span.textContent = ch === " " ? "\u00a0" : ch;
      word.appendChild(span);
    });

    const sr = document.createElement("span");
    sr.className = "type-sr";
    sr.textContent = text;

    frag.appendChild(sr);
    frag.appendChild(word);
    textNode.parentNode.replaceChild(frag, textNode);
  });

  el.dataset.typed = "1";
  el.classList.add("is-typing");
}

function runType(el) {
  wrapTextNodes(el);
  const chars = Array.from(el.querySelectorAll(".type-ch"));
  if (!chars.length) {
    el.classList.remove("is-typing");
    el.classList.add("is-typed");
    return;
  }

  const total = chars.length;
  const duration = Math.min(2200, Math.max(700, total * 14));
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const count = Math.floor(t * total);
    for (let i = 0; i < total; i += 1) {
      chars[i].classList.toggle("is-on", i < count);
    }
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      el.classList.remove("is-typing");
      el.classList.add("is-typed");
    }
  }

  requestAnimationFrame(frame);
}

export function enhanceScrollRevealWithTyping() {
  if (prefersReducedMotion()) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible", "is-typed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const root = entry.target;
        root.classList.add("is-visible");
        const targets = root.matches(TYPE_SELECTOR)
          ? [root]
          : Array.from(root.querySelectorAll(TYPE_SELECTOR));
        targets.forEach((el) => {
          if (el.closest(".pipe-map, .news-grid, form, .team-card-bio, .pipe-detail")) return;
          runType(el);
        });
        observer.unobserve(root);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
