const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.16 }
);

for (const node of reveals) {
  revealObserver.observe(node);
}

const weaponTabs = document.querySelectorAll(".weapon-tab");
const weaponPanels = document.querySelectorAll(".weapon-panel");

function selectWeapon(id) {
  for (const tab of weaponTabs) {
    const isActive = tab.dataset.weapon === id;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  }

  for (const panel of weaponPanels) {
    panel.classList.toggle("active", panel.dataset.weaponPanel === id);
  }
}

for (const tab of weaponTabs) {
  tab.addEventListener("click", () => selectWeapon(tab.dataset.weapon));
}

const countTargets = document.querySelectorAll("[data-count]");

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = (el.dataset.count.split(".")[1] || "").length;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const useComma = el.dataset.format === "comma";
  const duration = 1400;
  const start = performance.now();

  function formatValue(value) {
    let text = value.toFixed(decimals);
    if (useComma) {
      const [whole, frac] = text.split(".");
      text = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (frac) text += "." + frac;
    }
    return prefix + text + suffix;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatValue(target * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = formatValue(target);
    }
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.5 }
);

for (const el of countTargets) {
  countObserver.observe(el);
}
