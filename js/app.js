async function loadArtists() {
  const artists = await getArtists();
  const row = document.querySelector('.cards-row');
  row.innerHTML = '';

  const shown = artists.slice(0, 5);
  for (const artist of shown) {
    const imgData = await getArtistImage(artist.id);
    const img = imgData.image_url || '';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img artist" style="background:var(--bg5)">
        ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '🎵'}
      </div>
      <div class="card-play">
        <svg width="20" height="20" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div class="card-title">${artist.name}</div>
      <div class="card-sub">Artista</div>
    `;
    card.onclick = async () => {
      const songs = await getArtistSongs(artist.id);
      if (songs.length > 0) setQueue(songs, 0);
    };
    row.appendChild(card);
  }
}

async function loadSongs() {
  const songs = await getSongs(20);
  const list = document.getElementById('song-list');
  list.innerHTML = '';

  songs.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div>
        <span class="s-num">${i + 1}</span>
        <span class="s-play">▶</span>
      </div>
      <div class="s-info">
        <div class="s-thumb">🎵</div>
        <div>
          <div class="s-name">${s.title}</div>
          <div class="s-artist">${s.artist}</div>
        </div>
      </div>
      <div class="s-album">${s.album}</div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () => setQueue(songs, i);
    list.appendChild(row);
  });
}

// Greeting según hora
function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
  document.querySelector('.greeting-title').textContent = greet;
}

// Topbar scroll
document.getElementById('main-scroll').addEventListener('scroll', function() {
  document.getElementById('topbar').classList.toggle('scrolled', this.scrollTop > 60);
});

// Init
setGreeting();
loadArtists();
loadSongs();
