document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroSlider();
  setupSearchAndFilter();
  setupPlayers();
});

function setupMobileMenu() {
  var button = document.querySelector(".menu-button");
  var panel = document.querySelector(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    var open = panel.classList.toggle("open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.textContent = open ? "×" : "☰";
  });
}

function setupHeroSlider() {
  var slider = document.querySelector(".hero-slider");
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
  var prev = slider.querySelector(".hero-prev");
  var next = slider.querySelector(".hero-next");
  if (slides.length <= 1) {
    return;
  }
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-current", i === current ? "true" : "false");
    });
  }

  function start() {
    stop();
    timer = setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-slide")) || 0);
      start();
    });
  });
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  start();
}

function setupSearchAndFilter() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll(".search-scope"));
  scopes.forEach(function (scope) {
    var input = scope.querySelector(".site-search");
    var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card"));
    var empty = scope.querySelector(".empty-result");
    var activeFilter = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var show = matchQuery && matchFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });
  });
}

function setupPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll(".player-wrap"));
  players.forEach(function (player) {
    var video = player.querySelector("video");
    var trigger = player.querySelector(".play-trigger");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    if (!video || !stream) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-ready") === "true") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "true");
    }

    function play() {
      attach();
      player.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
