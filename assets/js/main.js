const menu = document.querySelector(".menu"),
  nav = document.querySelector("nav");
menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => nav.classList.remove("open"))
);

const els = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  els.forEach((e) => io.observe(e));
} else els.forEach((e) => e.classList.add("visible"));

/* —— i18n —— */
const pack = window.NERMYCA_I18N || { en: {} };
const ruCache = { text: {}, html: {}, attr: {}, meta: {}, mail: {} };
const STORAGE_KEY = "nermyca-lang";

function cacheRuOnce() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!(key in ruCache.text)) ruCache.text[key] = el.textContent;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (!(key in ruCache.html)) ruCache.html[key] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr") || "";
    spec
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (!attr || !key) return;
        const cacheKey = `${attr}|${key}`;
        if (!(cacheKey in ruCache.attr))
          ruCache.attr[cacheKey] = el.getAttribute(attr) || "";
      });
  });
  document.querySelectorAll("[data-i18n-meta]").forEach((el) => {
    const [kind, key] = el.getAttribute("data-i18n-meta").split(":");
    if (!(key in ruCache.meta)) {
      ruCache.meta[key] =
        kind === "title" ? document.title : el.getAttribute("content") || "";
    }
  });
  document.querySelectorAll("[data-i18n-mail]").forEach((el) => {
    const key = el.getAttribute("data-i18n-mail");
    if (!(key in ruCache.mail)) {
      const href = el.getAttribute("href") || "";
      const match = href.match(/[?&]subject=([^&]*)/);
      ruCache.mail[key] = match ? decodeURIComponent(match[1]) : "";
    }
  });
}

function t(lang, key) {
  if (lang === "en") return pack.en?.[key];
  return undefined;
}

function applyLang(lang) {
  cacheRuOnce();
  const en = lang === "en";
  document.documentElement.lang = en ? "en" : "ru";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = en ? t("en", key) : ruCache.text[key];
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const value = en ? t("en", key) : ruCache.html[key];
    if (value != null) el.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr") || "";
    spec
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (!attr || !key) return;
        const cacheKey = `${attr}|${key}`;
        const value = en ? t("en", key) : ruCache.attr[cacheKey];
        if (value != null) el.setAttribute(attr, value);
      });
  });

  document.querySelectorAll("[data-i18n-meta]").forEach((el) => {
    const [kind, key] = el.getAttribute("data-i18n-meta").split(":");
    const value = en ? t("en", key) : ruCache.meta[key];
    if (value == null) return;
    if (kind === "title") document.title = value;
    else el.setAttribute("content", value);
  });

  document.querySelectorAll("[data-i18n-mail]").forEach((el) => {
    const key = el.getAttribute("data-i18n-mail");
    const subject = en ? t("en", key) : ruCache.mail[key];
    if (subject == null) return;
    const href = el.getAttribute("href") || "";
    const base = href.split("?")[0];
    el.setAttribute(
      "href",
      `${base}?subject=${encodeURIComponent(subject)}`
    );
  });

  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    const active = btn.getAttribute("data-set-lang") === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }

  try {
    const url = new URL(window.location.href);
    if (lang === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    // file:// and some Safari contexts throw on replaceState — language already applied
    history.replaceState(null, "", url.href);
  } catch {
    /* ignore */
  }
}

function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "en" || fromUrl === "ru") return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru") return saved;
  } catch {
    /* ignore */
  }
  return "ru";
}

document.querySelectorAll("[data-set-lang]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const next = btn.getAttribute("data-set-lang");
    if (next === "en" || next === "ru") applyLang(next);
  });
});

try {
  applyLang(detectLang());
} catch (err) {
  console.error("i18n init failed", err);
}
