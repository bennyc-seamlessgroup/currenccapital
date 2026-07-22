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
const navDd = document.querySelector(".nav-dd");
const navDdToggle = document.querySelector(".nav-dd-toggle");
const isMobileNav = () => window.matchMedia("(max-width: 1360px)").matches;

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (navScrim) navScrim.hidden = !open;
  if (!open && navDd) navDd.classList.remove("open"); // reset accordion when drawer closes
}

if (navToggle) {
  navToggle.addEventListener("click", () =>
    setNav(!document.body.classList.contains("nav-open"))
  );
}
if (navScrim) navScrim.addEventListener("click", () => setNav(false));

// Arsenal dropdown: tap-to-expand accordion on mobile, plain link on desktop.
if (navDdToggle && navDd) {
  navDdToggle.addEventListener("click", (event) => {
    if (isMobileNav()) {
      event.preventDefault();
      navDd.classList.toggle("open");
    }
  });
}

if (siteNav) {
  for (const link of siteNav.querySelectorAll("a")) {
    // The Arsenal toggle expands the submenu instead of closing the drawer.
    if (link.classList.contains("nav-dd-toggle")) continue;
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
  note.classList.remove("is-success", "is-error", "is-loading");
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

/* ============ Contact form (Web3Forms AJAX submission) ============ */

const WEB3FORMS_ACCESS_KEY = "3725d6d5-a768-42c5-9c92-e4289d6a7fad";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const submitButton = contactForm.querySelector("button[type='submit']");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Captured fresh on every submit so it restores whatever language is currently active.
    const submitButtonLabel = submitButton.innerHTML;

    const name = contactForm.querySelector("#cf-name");
    const title = contactForm.querySelector("#cf-title");
    const company = contactForm.querySelector("#cf-company");
    const email = contactForm.querySelector("#cf-email");
    const message = contactForm.querySelector("#cf-message");
    const botcheck = contactForm.querySelector("#cf-botcheck");

    // Honeypot: a real visitor never fills this in. Silently drop the submission.
    if (botcheck && botcheck.checked) {
      return;
    }

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

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Free Short Analysis Request — ${company.value.trim()}`,
      from_name: name.value.trim(),
      name: name.value.trim(),
      title: title.value.trim(),
      company: company.value.trim(),
      email: email.value.trim(),
      message: message.value.trim() || "(No additional message)",
    };

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending…";
    setNote(contactForm, "Sending your request…", "is-loading");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        contactForm.reset();
        setNote(contactForm, "Thank you — your request has been sent. We'll respond within one business day.", "is-success");
      } else {
        setNote(contactForm, "Something went wrong sending your request. Please try again or email us directly.", "is-error");
      }
    } catch (error) {
      setNote(contactForm, "Something went wrong sending your request. Please try again or email us directly.", "is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButtonLabel;
    }
  });
}

/* ============ Partner application form (Web3Forms AJAX submission) ============ */

const PARTNER_WEB3FORMS_ACCESS_KEY = "037884fa-3e3a-4ced-9b36-7ddc37fd123e";

const partnerForm = document.getElementById("partner-apply-form");

if (partnerForm) {
  const submitButton = partnerForm.querySelector("button[type='submit']");

  partnerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButtonLabel = submitButton.innerHTML;

    const firm = partnerForm.querySelector("#pf-firm");
    const contact = partnerForm.querySelector("#pf-contact");
    const email = partnerForm.querySelector("#pf-email");
    const phone = partnerForm.querySelector("#pf-phone");
    const region = partnerForm.querySelector("#pf-region");
    const message = partnerForm.querySelector("#pf-message");
    const botcheck = partnerForm.querySelector("#pf-botcheck");

    // Honeypot: a real visitor never fills this in. Silently drop the submission.
    if (botcheck && botcheck.checked) {
      return;
    }

    let valid = true;

    for (const field of [firm, contact, email]) {
      const empty = field.value.trim() === "";
      field.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
    }

    if (!valid) {
      setNote(partnerForm, "Please complete the highlighted fields.", "is-error");
      return;
    }

    if (!isValidEmail(email.value)) {
      email.classList.add("is-invalid");
      setNote(partnerForm, "Please enter a valid email address.", "is-error");
      email.focus();
      return;
    }

    email.classList.remove("is-invalid");

    const payload = {
      access_key: PARTNER_WEB3FORMS_ACCESS_KEY,
      subject: `IR Partner Application — ${firm.value.trim()}`,
      from_name: contact.value.trim(),
      firm: firm.value.trim(),
      contact: contact.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || "(Not provided)",
      region: region.value || "(Not specified)",
      message: message.value.trim() || "(No additional message)",
    };

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending…";
    setNote(partnerForm, "Sending your application…", "is-loading");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        partnerForm.reset();
        setNote(partnerForm, "Thank you — your application has been sent. Our Partner Team will respond within 48 hours.", "is-success");
      } else {
        setNote(partnerForm, "Something went wrong sending your application. Please try again or email us directly.", "is-error");
      }
    } catch (error) {
      setNote(partnerForm, "Something went wrong sending your application. Please try again or email us directly.", "is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButtonLabel;
    }
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
