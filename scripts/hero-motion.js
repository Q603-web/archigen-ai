(() => {
  const video = document.querySelector('.cover-video');
  const button = document.querySelector('.motion-toggle');
  const media = document.querySelector('.cover-media');
  if (!video || !button || !media) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlayback = !reducedMotion.matches && !navigator.connection?.saveData;
  let visible = false;
  let pageReady = document.readyState === 'complete';
  let failed = false;
  video.muted = true;
  button.hidden = false;

  const updateLabel = () => {
    button.textContent = !video.paused ? 'Pause motion' : wantsPlayback && video.readyState < 3 && video.hasAttribute('src') ? 'Loading motion…' : 'Play motion';
  };
  const syncPlayback = () => {
    if (failed) return;
    if (!wantsPlayback || !visible || document.hidden || !pageReady) {
      video.pause();
      updateLabel();
      return;
    }
    if (!video.hasAttribute('src')) video.src = video.dataset.src;
    updateLabel();
    video.play().catch(error => {
      if (error.name === 'AbortError') return;
      wantsPlayback = false;
      updateLabel();
    });
  };
  video.addEventListener('playing', () => {
    media.classList.add('has-motion');
    updateLabel();
  });
  video.addEventListener('pause', updateLabel);
  video.addEventListener('error', () => {
    failed = true;
    video.pause();
    media.classList.remove('has-motion');
    button.hidden = true;
  });
  button.addEventListener('click', () => {
    wantsPlayback = !wantsPlayback;
    syncPlayback();
  });
  reducedMotion.addEventListener('change', () => {
    wantsPlayback = !reducedMotion.matches && !navigator.connection?.saveData;
    if (reducedMotion.matches) media.classList.remove('has-motion');
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 }).observe(media);
  } else {
    visible = true;
  }
  if (!pageReady) window.addEventListener('load', () => { pageReady = true; syncPlayback(); }, { once: true });
  syncPlayback();
})();
