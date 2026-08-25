function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Paints the played portion of a range input in --color-accent — accent-color
// alone only recolors the thumb (Chrome) or gives an unstyleable fill
// (Firefox), so the two-tone track is built by hand here.
function paintRange(input: HTMLInputElement): void {
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 1;
  const pct = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  const track = 'color-mix(in srgb, var(--color-on-media) 30%, transparent)';
  input.style.background = `linear-gradient(to right, var(--color-accent) ${pct}%, ${track} ${pct}%)`;
}

export function initAudioPlayers(selector = '[data-audio-player]'): void {
  const players = Array.from(document.querySelectorAll<HTMLElement>(selector));

  players.forEach((player) => {
    const audio = player.querySelector<HTMLAudioElement>('[data-audio-el]');
    const playBtn = player.querySelector<HTMLButtonElement>('[data-play-btn]');
    const iconPlay = player.querySelector<HTMLElement>('[data-icon-play]');
    const iconPause = player.querySelector<HTMLElement>('[data-icon-pause]');
    const time = player.querySelector<HTMLElement>('[data-time]');
    const timeline = player.querySelector<HTMLInputElement>('[data-timeline]');
    const volumeGroup = player.querySelector<HTMLElement>('[data-volume-group]');
    const volumeBtn = player.querySelector<HTMLButtonElement>('[data-volume-btn]');
    const iconVolume = player.querySelector<HTMLElement>('[data-icon-vol]');
    const iconVolumeMute = player.querySelector<HTMLElement>('[data-icon-vol-mute]');
    const volumeSlider = player.querySelector<HTMLInputElement>('[data-volume-slider]');
    if (
      !audio ||
      !playBtn ||
      !iconPlay ||
      !iconPause ||
      !time ||
      !timeline ||
      !volumeGroup ||
      !volumeBtn ||
      !iconVolume ||
      !iconVolumeMute ||
      !volumeSlider
    )
      return;

    function setPlayingIcon(playing: boolean): void {
      iconPlay!.hidden = playing;
      iconPause!.hidden = !playing;
      playBtn!.setAttribute('aria-label', playing ? 'Pause' : 'Abspielen');
    }

    function setMuteIcon(muted: boolean): void {
      iconVolume!.hidden = muted;
      iconVolumeMute!.hidden = !muted;
      volumeBtn!.setAttribute('aria-label', muted ? 'Stummschaltung aufheben' : 'Stummschalten');
    }

    function collapseVolume(): void {
      volumeGroup!.classList.remove('is-expanded');
    }

    playBtn.addEventListener('click', () => {
      collapseVolume();
      if (audio!.paused) audio!.play();
      else audio!.pause();
    });

    audio.addEventListener('play', () => {
      setPlayingIcon(true);
      // Single-playback: starting this track pauses every other one on the page.
      players.forEach((other) => {
        if (other === player) return;
        other.querySelector<HTMLAudioElement>('[data-audio-el]')?.pause();
      });
    });
    audio.addEventListener('pause', () => setPlayingIcon(false));
    audio.addEventListener('ended', () => setPlayingIcon(false));

    audio.addEventListener('loadedmetadata', () => {
      timeline.max = String(audio!.duration || 0);
      time.textContent = `${formatTime(audio!.currentTime)} / ${formatTime(audio!.duration)}`;
    });

    audio.addEventListener('timeupdate', () => {
      timeline.value = String(audio!.currentTime);
      paintRange(timeline);
      time.textContent = `${formatTime(audio!.currentTime)} / ${formatTime(audio!.duration)}`;
    });

    timeline.addEventListener('pointerdown', collapseVolume);
    timeline.addEventListener('input', () => {
      audio!.currentTime = Number(timeline.value);
      paintRange(timeline);
    });

    volumeBtn.addEventListener('click', () => {
      audio!.muted = !audio!.muted;
      setMuteIcon(audio!.muted);
    });

    volumeSlider.addEventListener('input', () => {
      audio!.volume = Number(volumeSlider.value);
      audio!.muted = audio!.volume === 0;
      setMuteIcon(audio!.muted);
      paintRange(volumeSlider);
    });

    volumeGroup.addEventListener('pointerenter', () => volumeGroup!.classList.add('is-expanded'));
    volumeGroup.addEventListener('pointerleave', () => {
      if (!volumeGroup!.matches(':focus-within')) collapseVolume();
    });
    volumeGroup.addEventListener('focusin', () => volumeGroup!.classList.add('is-expanded'));
    volumeGroup.addEventListener('focusout', () => {
      if (!volumeGroup!.matches(':hover')) collapseVolume();
    });

    paintRange(timeline);
    paintRange(volumeSlider);
    setMuteIcon(audio.muted);
  });
}
