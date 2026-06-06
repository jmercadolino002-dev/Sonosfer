const audio = new Audio();
let currentSong = null;
let playing = false;

function playSong(song) {
  currentSong = song;
  audio.src = song.cloudflare_url;
  audio.play();
  playing = true;

  document.getElementById('track-name').textContent = song.title;
  document.getElementById('track-artist').textContent = song.artist;

  const icon = document.getElementById('play-icon');
  icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

  audio.ontimeupdate = () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    const m = Math.floor(audio.currentTime / 60);
    const s = Math.floor(audio.currentTime % 60);
    document.getElementById('time-cur').textContent = `${m}:${String(s).padStart(2,'0')}`;
  };

  audio.onended = () => playNext();
}

function togglePlay() {
  if (!currentSong) return;
  playing = !playing;
  playing ? audio.play() : audio.pause();
  const icon = document.getElementById('play-icon');
  icon.innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
}

function seek(e) {
  if (!audio.duration) return;
  const rect = document.getElementById('progress-track').getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}

function setVol(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.volume = v;
  document.getElementById('vol-fill').style.width = (v * 100) + '%';
}

let hearted = false;
function toggleHeart() {
  hearted = !hearted;
  const btn = document.getElementById('track-heart');
  btn.classList.toggle('liked', hearted);
  btn.innerHTML = hearted
    ? '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    : '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
}

let songQueue = [];
let queueIndex = 0;

function setQueue(songs, index = 0) {
  songQueue = songs;
  queueIndex = index;
  playSong(songQueue[queueIndex]);
}

function playNext() {
  if (queueIndex < songQueue.length - 1) {
    queueIndex++;
    playSong(songQueue[queueIndex]);
  }
}

function playPrev() {
  if (queueIndex > 0) {
    queueIndex--;
    playSong(songQueue[queueIndex]);
  }
}
