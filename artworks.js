/* /artworks — filter chips, stop list, card grid and the Leaflet map.
   Mirrors the original React behaviour: the map and the Stops list always show every
   artwork; only the card grid is filtered. Selecting a stop syncs list + map + card. */
(function () {
  "use strict";

  var DATA = window.ALF_DATA || {};
  var artworks = DATA.artworks || [];
  var docks = (DATA.cruises || {}).docks || [];
  if (!artworks.length) return;

  var byStop = {};
  artworks.forEach(function (a) { byStop[a.stop] = a; });

  /* ------------------------------------------------------------------ helpers */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function findLabel(text) {
    return Array.prototype.find.call(document.querySelectorAll("p.label-xs"), function (p) {
      return p.textContent.trim() === text;
    });
  }

  /* ------------------------------------------------------------------ elements */
  var allChip = Array.prototype.find.call(document.querySelectorAll("button"), function (b) {
    return b.textContent.trim() === "All" && b.className.indexOf("label-xs") !== -1;
  });
  var chipBar = allChip ? allChip.parentElement : null;
  var chips = chipBar ? Array.prototype.slice.call(chipBar.querySelectorAll("button")) : [];
  var counter = chipBar ? chipBar.querySelector("span.label-xs.ml-auto") : null;
  var cards = Array.prototype.slice.call(document.querySelectorAll('article[id^="stop-"]'));
  var stopsLabel = findLabel("Stops");
  var stopsList = stopsLabel ? stopsLabel.parentElement.querySelector("div") : null;
  var stopButtons = stopsList ? Array.prototype.slice.call(stopsList.querySelectorAll("button")) : [];
  var mapEl = document.querySelector(".alf-map");

  /* -------------------------------------------------------------------- state */
  var activeArea = "All";
  var activeStop = null;

  var CHIP_ON = "label-xs border-2 px-5 py-3 transition-colors border-mint bg-mint text-night";
  var CHIP_OFF = "label-xs border-2 px-5 py-3 transition-colors border-paper/25 text-paper/70 hover:border-paper hover:text-paper";
  var STOP_ON = "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors border-magenta bg-paper/10";
  var STOP_OFF = "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors border-paper/15 hover:border-mint hover:bg-paper/5";
  var RING = ["ring-2", "ring-magenta", "ring-offset-8", "ring-offset-night"];
  var ARROW_RIGHT_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

  /* ------------------------------------------------------------------ filtering */
  function applyFilter() {
    chips.forEach(function (chip) {
      chip.className = chip.textContent.trim() === activeArea ? CHIP_ON : CHIP_OFF;
    });

    var visible = 0;
    cards.forEach(function (card) {
      var stop = Number(card.id.replace("stop-", ""));
      var art = byStop[stop];
      var show = activeArea === "All" || (art && art.area === activeArea);
      if (show) {
        card.removeAttribute("hidden");
        var mirror = visible % 2 === 1;
        var imgCol = card.children[0];
        var textCol = card.children[1];
        if (imgCol) imgCol.className = mirror ? "md:col-span-7 md:order-2" : "md:col-span-7";
        if (textCol) textCol.className = mirror ? "md:col-span-5 md:order-1" : "md:col-span-5";
        visible++;
      } else {
        card.setAttribute("hidden", "");
      }
    });

    if (counter) counter.textContent = visible + (visible === 1 ? " work" : " works");
  }

  /* ----------------------------------------------------------------- selection */
  var map = null;
  var markers = new Map();
  var readAbout = null;

  function applySelection() {
    stopButtons.forEach(function (btn) {
      var stop = Number(btn.querySelector("span.font-display").textContent);
      var active = stop === activeStop;
      btn.className = active ? STOP_ON : STOP_OFF;
      var num = btn.querySelector("span.font-display");
      if (num) num.className = "font-display text-lg leading-none " + (active ? "text-magenta" : "text-mint");
    });

    cards.forEach(function (card) {
      var stop = Number(card.id.replace("stop-", ""));
      RING.forEach(function (c) { card.classList.toggle(c, stop === activeStop); });
    });

    /* "Read about stop NN" appears only while something is selected */
    if (readAbout) { readAbout.remove(); readAbout = null; }
    if (activeStop !== null && stopsList) {
      readAbout = document.createElement("button");
      readAbout.type = "button";
      readAbout.className = "label-xs mt-4 flex w-full items-center justify-center gap-2 border-2 border-mint px-4 py-3 text-mint transition-colors hover:bg-mint hover:text-night";
      readAbout.innerHTML = "Read about stop " + pad2(activeStop) + " " + ARROW_RIGHT_14;
      readAbout.addEventListener("click", function () {
        activeArea = "All";
        applyFilter();
        var card = document.getElementById("stop-" + activeStop);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      stopsList.parentElement.appendChild(readAbout);
    }

    if (!map) return;
    markers.forEach(function (mk, stop) {
      mk.setIcon(artworkIcon(String(stop), stop === activeStop));
      mk.setZIndexOffset(stop === activeStop ? 400 : 0);
    });
    if (activeStop === null) return;
    var mk = markers.get(activeStop);
    if (mk) {
      map.flyTo(mk.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.7 });
      mk.openPopup();
    }
  }

  function select(stop) {
    activeStop = (stop === null || stop < 0) ? null : stop;
    applySelection();
  }

  /* ----------------------------------------------------------------------- map */
  function artworkIcon(label, isActive) {
    return L.divIcon({
      className: "alf-pin-wrap",
      html: '<span class="alf-pin' + (isActive ? " alf-pin-active" : "") + '">' + esc(label) + "</span>",
      iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18]
    });
  }
  function dockIcon() {
    return L.divIcon({
      className: "alf-pin-wrap",
      html: '<span class="alf-dock"></span>',
      iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10]
    });
  }

  function initMap() {
    if (!mapEl || typeof L === "undefined") return;
    map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    map.on("click", function () { select(-1); });

    docks.forEach(function (d) {
      L.marker([Number(d.lat), Number(d.lng)], { icon: dockIcon(), zIndexOffset: -200 })
        .addTo(map)
        .bindPopup('<span class="alf-pop-kicker">Departure dock</span><strong>' + esc(d.name) +
                   '</strong><span class="alf-pop-meta">' + esc(d.address) + "</span>");
    });

    var points = [];
    artworks.forEach(function (a) {
      var latlng = [Number(a.lat), Number(a.lng)];
      points.push(latlng);
      var m = L.marker(latlng, {
        icon: artworkIcon(String(a.stop), false),
        title: a.stop + ". " + a.title,
        riseOnHover: true
      }).addTo(map).bindPopup(
        '<span class="alf-pop-kicker">Stop ' + pad2(a.stop) + "</span><strong>" + esc(a.title) +
        '</strong><span class="alf-pop-meta">' + esc(a.kind || "") +
        '</span><span class="alf-pop-meta">' + esc(a.location) + "</span>"
      );
      m.on("click", function () { select(a.stop); });
      markers.set(a.stop, m);
    });

    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [56, 56] });
    setTimeout(function () { map.invalidateSize(); }, 60);
  }

  /* --------------------------------------------------------------------- wire */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeArea = chip.textContent.trim();
      applyFilter();
    });
  });

  stopButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var num = btn.querySelector("span.font-display");
      if (num) select(Number(num.textContent));
    });
  });

  applyFilter();
  applySelection();
  initMap();
})();
