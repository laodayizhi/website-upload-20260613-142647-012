function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("player-overlay");
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
  var hlsInstance = null;
  var attached = false;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function play() {
    if (overlay) {
      overlay.classList.add("hidden");
    }

    attachStream().then(function () {
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });
  });

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
