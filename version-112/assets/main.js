(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      function show(target) {
        if (!slides.length) {
          return;
        }

        index = (target + slides.length) % slides.length;

        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("active", itemIndex === index);
        });

        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("active", itemIndex === index);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      show(0);
      play();
    }

    var searchInput = document.getElementById("movie-search");
    var regionFilter = document.getElementById("region-filter");
    var yearFilter = document.getElementById("year-filter");
    var typeFilter = document.getElementById("type-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    var emptyState = document.getElementById("empty-state");

    function fillSelect(select, values, label) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        if (!value) {
          return;
        }

        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function uniqueValues(attribute) {
      var seen = {};
      var values = [];

      cards.forEach(function (card) {
        var value = card.getAttribute(attribute) || "";
        if (value && !seen[value]) {
          seen[value] = true;
          values.push(value);
        }
      });

      return values.sort(function (a, b) {
        return b.localeCompare(a, "zh-Hans-CN", { numeric: true });
      });
    }

    if (cards.length) {
      fillSelect(regionFilter, uniqueValues("data-region"));
      fillSelect(yearFilter, uniqueValues("data-year"));
      fillSelect(typeFilter, uniqueValues("data-type"));
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionFilter ? regionFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var regionValue = card.getAttribute("data-region") || "";
        var yearValue = card.getAttribute("data-year") || "";
        var typeValue = card.getAttribute("data-type") || "";
        var matched = true;

        if (query && search.indexOf(query) === -1) {
          matched = false;
        }

        if (region && regionValue !== region) {
          matched = false;
        }

        if (year && yearValue !== year) {
          matched = false;
        }

        if (type && typeValue !== type) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    }

    [searchInput, regionFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
