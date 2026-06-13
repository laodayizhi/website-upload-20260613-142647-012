(function () {
  function each(items, callback) {
    Array.prototype.forEach.call(items, callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = slider.querySelectorAll('.hero-slide');
    var dots = slider.querySelectorAll('.hero-dot');
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      each(slides, function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      each(dots, function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    each(dots, function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var grid = document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = document.getElementById('movie-search');
    var categorySelect = document.getElementById('filter-category');
    var typeSelect = document.getElementById('filter-type');
    var sortSelect = document.getElementById('sort-select');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function compareCards(a, b) {
      var mode = sortSelect ? sortSelect.value : 'year-desc';
      var yearA = parseInt(a.getAttribute('data-year') || '0', 10);
      var yearB = parseInt(b.getAttribute('data-year') || '0', 10);
      var titleA = a.getAttribute('data-title') || '';
      var titleB = b.getAttribute('data-title') || '';
      if (mode === 'year-asc') {
        return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
      }
      if (mode === 'title-asc') {
        return titleA.localeCompare(titleB, 'zh-CN') || yearB - yearA;
      }
      return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.sort(compareCards).forEach(function (card) {
        grid.appendChild(card);
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCategory = card.getAttribute('data-category') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedCategory = !category || cardCategory === category;
        var matchedType = !type || cardType.indexOf(type) !== -1;
        var matched = matchedQuery && matchedCategory && matchedType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [searchInput, categorySelect, typeSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var source = config && config.source ? config.source : '';
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
        return;
      }
      video.src = source;
      ready = true;
    }

    function startPlayback() {
      attachSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('loadedmetadata', function () {
      if (cover && !video.paused) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });

    attachSource();
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
