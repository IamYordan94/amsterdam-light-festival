/* Amsterdam Light Festival — shared page runtime.
   Reimplements the behaviour of the original React app in plain JS:
   scroll reveals, header shadow, mobile menu, artwork carousel, FAQ accordion, demo forms. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- reveals */
  function initReveals() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    var seen = new WeakSet();
    function attach() {
      document.querySelectorAll(".reveal").forEach(function (n) {
        if (!seen.has(n)) { seen.add(n); io.observe(n); }
      });
    }
    attach();
    if (typeof MutationObserver !== "undefined") {
      new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
    }
    /* safety net: never leave content invisible if the observer never fires */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-in)").forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < window.innerHeight) n.classList.add("is-in");
      });
    }, 2500);
  }

  /* ----------------------------------------------------------- header state */
  function initHeader() {
    var header = document.querySelector("header");
    if (!header) return;
    var SHADOW = "shadow-[0_1px_0_0_rgba(255,255,255,0.18)]";
    var apply = function () {
      if (window.scrollY > 40) header.classList.add(SHADOW);
      else header.classList.remove(SHADOW);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });

    /* --------------------------------------------------------- mobile menu */
    var button = header.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]');
    if (!button) return;
    var ICON_MENU = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';
    var ICON_X = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
    var menu = null;

    function close() {
      if (!menu) return;
      menu.remove();
      menu = null;
      button.innerHTML = ICON_MENU;
      button.setAttribute("aria-label", "Open menu");
    }

    button.addEventListener("click", function () {
      if (menu) { close(); return; }
      var nav = document.createElement("nav");
      nav.className = "border-t border-paper/15 bg-night px-5 pb-7 pt-4 md:hidden";
      var items = [
        ["index.html", "Festival"],
        ["artworks.html", "Artworks & route"],
        ["tickets.html", "Canal cruise"]
      ];
      items.forEach(function (it) {
        var a = document.createElement("a");
        a.href = it[0];
        a.className = "headline block border-b border-paper/10 py-4 text-2xl text-paper";
        a.textContent = it[1];
        nav.appendChild(a);
      });
      var cta = document.createElement("a");
      cta.href = "tickets.html";
      cta.className = "btn-solid mt-6 w-full";
      cta.textContent = "Book a cruise";
      nav.appendChild(cta);
      nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
      header.appendChild(nav);
      menu = nav;
      button.innerHTML = ICON_X;
      button.setAttribute("aria-label", "Close menu");
    });

    window.addEventListener("resize", function () { if (window.innerWidth >= 768) close(); });
  }

  /* -------------------------------------------------- artwork carousel (home) */
  var AUTOPLAY_MS = 4200;
  var GAP_PX = 24;

  function initCarousel() {
    var track = document.querySelector('[aria-label="Artworks on the water route"]');
    if (!track) return;
    var root = track.parentElement;
    var prev = root.querySelector('button[aria-label="Previous artworks"]');
    var next = root.querySelector('button[aria-label="Next artworks"]');
    var status = root.querySelector("p.label-xs.ml-3");
    var paused = false;
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function delta() {
      var card = track.querySelector("[data-card]");
      return (card ? card.offsetWidth : track.clientWidth * 0.8) + GAP_PX;
    }

    function step(dir) {
      var maxScroll = track.scrollWidth - track.clientWidth - 4;
      if (dir === 1 && track.scrollLeft >= maxScroll) { track.scrollTo({ left: 0, behavior: "smooth" }); return; }
      if (dir === -1 && track.scrollLeft <= 4) { track.scrollTo({ left: maxScroll, behavior: "smooth" }); return; }
      track.scrollBy({ left: delta() * dir, behavior: "smooth" });
    }

    var AT_EDGE = "border-paper/20 text-paper/35 hover:border-paper/40 hover:text-paper/60";
    var ACTIVE = "border-paper/45 text-paper hover:bg-paper hover:text-night";
    function edges() {
      var maxScroll = track.scrollWidth - track.clientWidth - 4;
      if (prev) {
        var a = track.scrollLeft <= 4;
        prev.className = "flex h-12 w-12 items-center justify-center border-2 transition-colors " + (a ? AT_EDGE : ACTIVE);
      }
      if (next) {
        var b = track.scrollLeft >= maxScroll;
        next.className = "flex h-12 w-12 items-center justify-center border-2 transition-colors " + (b ? AT_EDGE : ACTIVE);
      }
    }

    function label() {
      if (!status) return;
      status.textContent = paused ? "Paused — swipe or use the arrows" : "Auto-scrolling · hover to pause";
    }

    function start() {
      if (reduce || timer) return;
      timer = setInterval(function () { step(1); }, AUTOPLAY_MS);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function setPaused(v) {
      paused = v;
      label();
      if (v) stop(); else start();
    }

    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    track.addEventListener("scroll", edges, { passive: true });
    track.addEventListener("mouseenter", function () { setPaused(true); });
    track.addEventListener("mouseleave", function () { setPaused(false); });
    track.addEventListener("focusin", function () { setPaused(true); });
    track.addEventListener("focusout", function () { setPaused(false); });
    track.addEventListener("touchstart", function () { setPaused(true); }, { passive: true });
    track.addEventListener("touchend", function () { setTimeout(function () { setPaused(false); }, 2500); }, { passive: true });

    edges();
    label();
    start();
  }

  /* ------------------------------------------------------------- FAQ accordion */
  function initFaq() {
    var wrap = document.querySelector(".divide-y-2.divide-ink\\/25");
    if (!wrap) return;
    var answers = [
      "No. All 31 artworks stand in public space and the walking route is free, every night from 17:00 to 23:00. You only need a ticket to see the route from the water — that is the canal cruise.",
      "75 minutes on the Water Colors route (open sloop and glass-roof boat) and 95 minutes on the Grand route with the historic salon boat, which adds the Oosterdok artworks.",
      "The sloop has wool blankets on every seat and the skipper hands out hot drinks, but it is genuinely open air. If you are sailing with small children or want to stay dry in rain, take the glass-roof boat.",
      "Yes, free of charge up to 24 hours before departure, subject to availability. Bring your booking reference — it starts with ALF — to the dock or use it in the change link in your confirmation.",
      "The glass-roof boat boards step-free at Centraal Station Pier 14 and Rokin Dock and has space for two wheelchairs per sailing. The sloop and the salon boat need a step down into the boat.",
      "Fridays, Saturdays and the week between Christmas and New Year, especially the 19:00 and 19:45 departures. Sail at 17:30 in the blue hour or at 21:15 for the quietest canals."
    ];
    var ICON_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>';
    var ICON_MINUS = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus" aria-hidden="true"><path d="M5 12h14"></path></svg>';
    var items = Array.prototype.slice.call(wrap.children);

    function setOpen(item, open) {
      var i = items.indexOf(item);
      var button = item.querySelector("button");
      var icon = button.querySelector("span.shrink-0");
      var p = item.querySelector("p");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      if (icon) icon.innerHTML = open ? ICON_MINUS : ICON_PLUS;
      if (open) {
        if (!p) {
          p = document.createElement("p");
          p.className = "max-w-3xl pb-7 text-base leading-relaxed text-night/80 md:text-lg";
          p.textContent = answers[i] || "";
          item.appendChild(p);
        }
      } else if (p) {
        p.remove();
      }
    }

    items.forEach(function (item) {
      var button = item.querySelector("button");
      if (!button) return;
      button.addEventListener("click", function () {
        var isOpen = button.getAttribute("aria-expanded") === "true";
        items.forEach(function (other) { if (other !== item) setOpen(other, false); });
        setOpen(item, !isOpen);
      });
    });
  }

  /* ------------------------------------------------------------- demo forms */
  function initForms() {
    document.querySelectorAll("form").forEach(function (f) {
      f.addEventListener("submit", function (e) { e.preventDefault(); });
    });
  }

  function boot() {
    initReveals();
    initHeader();
    initCarousel();
    initFaq();
    initForms();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
