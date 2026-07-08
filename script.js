/* ============ Scroll reveal ============ */

const reveals = document.querySelectorAll(".reveal, .reveal-stagger");

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.14 }
);

for (const node of reveals) {
  revealObserver.observe(node);
}

/* ============ Mobile / tablet hamburger nav ============ */

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("primary-nav");
const navScrim = document.querySelector(".nav-scrim");

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (navScrim) navScrim.hidden = !open;
}

if (navToggle) {
  navToggle.addEventListener("click", () =>
    setNav(!document.body.classList.contains("nav-open"))
  );
}
if (navScrim) navScrim.addEventListener("click", () => setNav(false));
if (siteNav) {
  for (const link of siteNav.querySelectorAll("a")) {
    link.addEventListener("click", () => setNav(false));
  }
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNav(false);
});

/* ============ Weapon tabs ============ */

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

/* ============ Count-up stats ============ */

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

/* ============ FAQ: close others when one opens ============ */

const faqItems = document.querySelectorAll(".faq-item");

for (const item of faqItems) {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    for (const other of faqItems) {
      if (other !== item && other.open) {
        other.open = false;
      }
    }
  });
}

/* ============ Helpers ============ */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.co.jp",
  "ymail.com", "rocketmail.com", "hotmail.com", "hotmail.co.uk", "outlook.com",
  "live.com", "msn.com", "aol.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me", "gmx.com", "gmx.net", "mail.com",
  "zoho.com", "yandex.com", "yandex.ru", "qq.com", "163.com", "126.com",
  "foxmail.com", "hey.com", "fastmail.com", "tutanota.com", "aim.com",
]);

// A company/official email = not a free consumer webmail provider.
function isCorporateEmail(value) {
  const domain = value.trim().toLowerCase().split("@")[1] || "";
  return domain !== "" && !FREE_EMAIL_DOMAINS.has(domain);
}

function setNote(form, message, state) {
  const note = form.querySelector("[data-form-note]");
  if (!note) return;
  if (!note.dataset.original) {
    note.dataset.original = note.textContent;
  }
  note.textContent = message;
  note.classList.remove("is-success", "is-error");
  if (state) note.classList.add(state);
}

/* ============ Newsletter subscribe ============ */

const subscribeForm = document.getElementById("subscribe-form");

if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = subscribeForm.querySelector("input[type='email']");
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      input.classList.add("is-invalid");
      setNote(subscribeForm, "Please enter a valid work email address.", "is-error");
      input.focus();
      return;
    }

    input.classList.remove("is-invalid");
    input.value = "";
    input.disabled = true;
    subscribeForm.querySelector("button[type='submit']").disabled = true;
    setNote(subscribeForm, "You're subscribed. Watch your inbox for the next intelligence briefing.", "is-success");
  });
}

/* ============ Contact form (composes an email) ============ */

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.querySelector("#cf-name");
    const title = contactForm.querySelector("#cf-title");
    const company = contactForm.querySelector("#cf-company");
    const email = contactForm.querySelector("#cf-email");
    const message = contactForm.querySelector("#cf-message");

    let valid = true;

    for (const field of [name, title, company, email]) {
      const empty = field.value.trim() === "";
      field.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
    }

    if (!valid) {
      setNote(contactForm, "Please complete the highlighted fields.", "is-error");
      return;
    }

    if (!isValidEmail(email.value)) {
      email.classList.add("is-invalid");
      setNote(contactForm, "Please enter a valid email address.", "is-error");
      email.focus();
      return;
    }

    // Require an official company email so we can verify the person represents the company.
    if (!isCorporateEmail(email.value)) {
      email.classList.add("is-invalid");
      setNote(
        contactForm,
        "Please use your official company email address — we can't accept personal webmail (Gmail, Outlook, etc.).",
        "is-error"
      );
      email.focus();
      return;
    }

    email.classList.remove("is-invalid");

    const subject = `Free Short Analysis Request — ${company.value.trim()}`;
    const bodyLines = [
      `Name: ${name.value.trim()}`,
      `Title: ${title.value.trim()}`,
      `Company / Ticker: ${company.value.trim()}`,
      `Company Email: ${email.value.trim()}`,
      "",
      message.value.trim() || "(No additional message)",
    ];
    const mailto =
      "mailto:tokenize@currencgroup.com" +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
    setNote(contactForm, "Opening your email client — send the drafted message to complete your request.", "is-success");
  });
}

/* ============ Report page sticky CTA bar ============ */

const reportSticky = document.getElementById("report-sticky");

if (reportSticky) {
  window.addEventListener(
    "scroll",
    () => {
      reportSticky.classList.toggle("visible", window.scrollY > 600);
    },
    { passive: true }
  );
}
