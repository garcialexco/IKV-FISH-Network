document.addEventListener('DOMContentLoaded', function () {
  const players = document.querySelectorAll('.cs-video.has-custom-controls');
  if (!players.length) return;

  players.forEach(function (wrap) {
    const vid  = wrap.querySelector('.cs-video-el');
    const play = wrap.querySelector('.btn.play');
    const seek = wrap.querySelector('.seek');
    const fs   = wrap.querySelector('.btn.fullscreen');
    const cur  = wrap.querySelector('.current');
    const dur  = wrap.querySelector('.duration');
    if (!vid) return;

    const fmt = function (s) {
      if (isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return m + ':' + sec;
    };

    // Init UI
    const updatePlayIcon = function () {
      if (play) play.textContent = vid.paused ? '►' : '❚❚';
    };
    vid.pause();
    updatePlayIcon();

    // Duration
    vid.addEventListener('loadedmetadata', function () {
      if (dur) dur.textContent = fmt(vid.duration);
      if (seek) seek.value = 0;
    });

    // Play/Pause
    if (play) {
      play.addEventListener('click', function () {
        if (vid.paused) vid.play(); else vid.pause();
      });
    }
    vid.addEventListener('play',  updatePlayIcon);
    vid.addEventListener('pause', updatePlayIcon);

    // Progress -> slider
    vid.addEventListener('timeupdate', function () {
      if (seek && vid.duration) {
        seek.value = (vid.currentTime / vid.duration) * 100;
      }
      if (cur) cur.textContent = fmt(vid.currentTime);
    });

    // Slider -> seek
    if (seek) {
      seek.addEventListener('input', function () {
        if (!vid.duration) return;
        const pct = parseFloat(seek.value || '0') / 100;
        vid.currentTime = pct * vid.duration;
      });
    }

    // Fullscreen
    if (fs) {
      fs.addEventListener('click', function () {
        const el = wrap; // fullscreen the wrapper so controls are included
        if (document.fullscreenElement) {
          document.exitFullscreen && document.exitFullscreen();
        } else {
          el.requestFullscreen && el.requestFullscreen();
        }
      });
    }
  });
});
