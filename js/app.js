// Greeting
function setGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
}

// Topbar scroll
document.getElementById('main-scroll').addEventListener('scroll', function () {
  document.getElementById('topbar')?.classList.toggle('scrolled', this.scrollTop > 60);
});

// ── HOME ──
async function renderHome() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="main-hero-bg"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        <button class="nav-arrow">&#8249;</button>
        <button class="nav-arrow">&#8250;</button>
      </div>
      <div class="topbar-right">
        <button class="btn-signup">Registrarse</button>
        <button class="btn-login">Iniciar sesión</button>
      </div>
    </div>
    <div class="greeting-section">
      <h1 class="greeting-title">${setGreeting()}</h1>
      <div class="quick-grid" id="quick-grid">
        <div class="quick-card"><div class="quick-thumb g1"></div><span class="quick-name">Cargando...</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-head">
        <span class="section-title">Artistas</span>
        <span class="section-more" onclick="navigate('search')">Ver todo</span>
      </div>
      <div class="cards-row" id="artists-row"></div>
    </div>
    <div class="section">
      <div class="section-head">
        <span class="section-title">Canciones</span>
        <span class="section-more">Ver todo</span>
      </div>
      <div class="songs-header">
        <span>#</span><span>Título</span><span>Álbum</span>
        <span class="dur-head">⏱</span>
      </div>
      <div class="song-list" id="song-list"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  document.getElementById('main-scroll').addEventListener('scroll', function () {
    document.getElementById('topbar')?.classList.toggle('scrolled', this.scrollTop > 60);
  });

  loadArtists();
  loadSongs();
  loadQuickGrid();
}

async function loadQuickGrid() {
  const songs = await getSongs(6);
  const grid = document.getElementById('quick-grid');
  if (!grid) return;
  const gradients = ['g1','g2','g3','g4','g5','g6'];
  grid.innerHTML = songs.map((s, i) => `
    <div class="quick-card" data-song-index="${i}">
      <div class="quick-thumb ${gradients[i % 6]}"></div>
      <span class="quick-name">${s.title}</span>
      <div class="quick-play">
        <svg width="18" height="18" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.quick-card').forEach((card, i) => {
    card.onclick = () => setQueue(songs, i);
  });
}

async function loadArtists() {
  const artists = await getArtists();
  const row = document.getElementById('artists-row');
  if (!row) return;
  row.innerHTML = '';
  const shown = artists.slice(0, 5);
  for (const artist of shown) {
    const imgData = await getArtistImage(artist.id);
    const img = imgData.image_url || '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img artist">
        ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '🎵'}
      </div>
      <div class="card-play"><svg width="20" height="20" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
      <div class="card-title">${artist.name}</div>
      <div class="card-sub">Artista</div>
    `;
    card.onclick = () => navigate('artist', artist.id);
    row.appendChild(card);
  }
}

async function loadSongs() {
  const songs = await getSongs(20);
  const list = document.getElementById('song-list');
  if (!list) return;

  const albumIds = [...new Set(songs.map(s => s.album_id))];
  const covers = {};
  await Promise.all(albumIds.map(async id => {
    const data = await getAlbumCover(id);
    covers[id] = data.cover_url || null;
  }));

  list.innerHTML = '';
  songs.forEach((s, i) => {
    const cover = covers[s.album_id];
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src="${cover}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
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

// ── ARTIST PAGE ──
async function renderArtist(artistId) {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div style="padding:40px 24px;color:var(--text2)">Cargando artista...</div>`;

  const [songs, imgData, artist] = await Promise.all([
    getArtistSongs(artistId),
    getArtistImage(artistId),
    getArtist(artistId)
  ]);

  if (!songs.length) {
    main.innerHTML = `<div style="padding:40px 24px;color:var(--text2)">No se encontraron canciones.</div>`;
    return;
  }

  const artistName = artist?.name || songs[0]?.artist || 'Artista';
  const img = imgData.image_url || '';

  const albumIds = [...new Set(songs.map(s => s.album_id))];
  const covers = {};
  await Promise.all(albumIds.map(async id => {
    const data = await getAlbumCover(id);
    covers[id] = data.cover_url || null;
  }));

  main.innerHTML = `
    <div class="main-hero-bg" style="background:linear-gradient(180deg,#1a2a3a 0%,transparent 100%)"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        <button class="nav-arrow" onclick="navigate('home')">&#8249;</button>
        <button class="nav-arrow">&#8250;</button>
      </div>
    </div>
    <div style="padding:0 24px 32px;display:flex;align-items:flex-end;gap:24px;min-height:220px">
      <div style="width:180px;height:180px;border-radius:50%;background:var(--bg4);overflow:hidden;flex-shrink:0;box-shadow:0 16px 48px rgba(0,0,0,0.6)">
        ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px">🎵</div>'}
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Artista</div>
        <h1 style="font-size:48px;font-weight:800;letter-spacing:-1px;margin-bottom:16px">${artistName}</h1>
        <div style="color:var(--text2);font-size:14px">${songs.length} canciones</div>
      </div>
    </div>
    <div style="padding:0 24px">
      <button onclick="setQueue(window._artistSongs, 0)" style="background:var(--accent);border:none;border-radius:50%;width:56px;height:56px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
        <svg width="24" height="24" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="songs-header">
        <span>#</span><span>Título</span><span>Álbum</span>
        <span class="dur-head">⏱</span>
      </div>
      <div class="song-list" id="artist-songs"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  window._artistSongs = songs;
  const list = document.getElementById('artist-songs');
  songs.forEach((s, i) => {
    const cover = covers[s.album_id];
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src="${cover}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
        <div>
          <div class="s-name">${s.title}</div>
          <div class="s-artist">${s.album}</div>
        </div>
      </div>
      <div class="s-album">${s.album}</div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () => setQueue(songs, i);
    list.appendChild(row);
  });
}

// ── ALBUM PAGE ──
async function renderAlbum(albumId) {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div style="padding:40px 24px;color:var(--text2)">Cargando álbum...</div>`;

  
  const [songs, coverData, album] = await Promise.all([
    getAlbumSongs(albumId),
    getAlbumCover(albumId),
    getAlbum(albumId)
  ]);

  if (!songs.length) {
    main.innerHTML = `<div style="padding:40px 24px;color:var(--text2)">No se encontraron canciones.</div>`;
    return;
  }

  const cover = coverData.cover_url || '';

  main.innerHTML = `
    <div class="main-hero-bg" style="background:linear-gradient(180deg,#2a1a3a 0%,transparent 100%)"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        <button class="nav-arrow" onclick="navigate('home')">&#8249;</button>
        <button class="nav-arrow">&#8250;</button>
      </div>
    </div>
    <div style="padding:0 24px 32px;display:flex;align-items:flex-end;gap:24px;min-height:220px">
      <div style="width:180px;height:180px;border-radius:8px;background:var(--bg4);overflow:hidden;flex-shrink:0;box-shadow:0 16px 48px rgba(0,0,0,0.6)">
        ${cover ? `<img src="${cover}" style="width:100%;height:100%;object-fit:cover">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px">💿</div>'}
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Álbum</div>
        <h1 style="font-size:36px;font-weight:800;letter-spacing:-0.5px;margin-bottom:8px">${songs[0]?.album || 'Álbum'}</h1>
        <div style="color:var(--text2);font-size:14px">${songs.length} canciones</div>
      </div>
    </div>
    <div style="padding:0 24px">
      <button onclick="setQueue(window._albumSongs, 0)" style="background:var(--accent);border:none;border-radius:50%;width:56px;height:56px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
        <svg width="24" height="24" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="songs-header">
        <span>#</span><span>Título</span><span>Duración</span><span></span>
      </div>
      <div class="song-list" id="album-songs"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  window._albumSongs = songs;
  const list = document.getElementById('album-songs');
  songs.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src="${cover}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
        <div>
          <div class="s-name">${s.title}</div>
        </div>
      </div>
      <div class="s-album"></div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () => setQueue(songs, i);
    list.appendChild(row);
  });
}

// ── SEARCH PAGE ──
async function renderSearch() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        <button class="nav-arrow" onclick="navigate('home')">&#8249;</button>
        <button class="nav-arrow">&#8250;</button>
      </div>
    </div>
    <div style="padding:0 24px">
      <h1 style="font-size:28px;font-weight:800;margin-bottom:20px">Buscar</h1>
      <div style="position:relative;margin-bottom:24px">
        <svg style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--bg)" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="text" placeholder="¿Qué quieres escuchar?"
          style="width:100%;padding:14px 14px 14px 44px;border-radius:8px;border:none;background:var(--text);color:var(--bg);font-family:inherit;font-size:15px;outline:none">
      </div>
      <div class="song-list" id="search-results"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  const input = document.getElementById('search-input');
  input.focus();
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => doSearch(input.value.trim()), 350);
  });
}

async function doSearch(q) {
  if (!q) { document.getElementById('search-results').innerHTML = ''; return; }
  const results = await search(q);
  const list = document.getElementById('search-results');
  if (!list) return;
  if (!results.length) {
    list.innerHTML = `<div style="color:var(--text2);padding:24px 0">No se encontraron resultados para "${q}"</div>`;
    return;
  }
  list.innerHTML = '';
  results.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
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
    row.onclick = () => setQueue(results, i);
    list.appendChild(row);
  });
}

// ── SIDEBAR ──
async function loadSidebarArtists() {
  const artists = await getArtists();
  const list = document.getElementById('sidebar-list');
  list.innerHTML = artists.map(a => `
    <div class="pl-item" onclick="navigate('artist', ${a.id})">
      <div class="pl-thumb" style="background:var(--bg4)">🎵</div>
      <div class="pl-info">
        <div class="pl-name">${a.name}</div>
        <div class="pl-meta">Artista</div>
      </div>
    </div>
  `).join('');
}

async function loadSidebarAlbums() {
  const albums = await getAlbums();
  const list = document.getElementById('sidebar-list');
  list.innerHTML = albums.map(a => `
    <div class="pl-item" onclick="navigate('album', ${a.id})">
      <div class="pl-thumb" style="background:var(--bg4)">💿</div>
      <div class="pl-info">
        <div class="pl-name">${a.title}</div>
        <div class="pl-meta">${a.artist}</div>
      </div>
    </div>
  `).join('');
}

function loadSidebarPlaylists() {
  const list = document.getElementById('sidebar-list');
  list.innerHTML = `
    <div class="pl-item">
      <div class="pl-thumb gradient-1"></div>
      <div class="pl-info"><div class="pl-name">Mis favoritos</div><div class="pl-meta">Lista</div></div>
    </div>
  `;
}

document.querySelectorAll('.lib-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.lib-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    if (chip.dataset.filter === 'artistas') loadSidebarArtists();
    else if (chip.dataset.filter === 'albums') loadSidebarAlbums();
    else loadSidebarPlaylists();
  });
});

// Init
navigate('home');
loadSidebarPlaylists();
