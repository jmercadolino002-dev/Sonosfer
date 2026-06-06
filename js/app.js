// Greeting
function setGreeting() {
  const h = new Date().getHours();
  return h &lt; 12 ? 'Buenos días' : h &lt; 18 ? 'Buenas tardes' : 'Buenas noches';
}

// Topbar scroll
document.getElementById('main-scroll').addEventListener('scroll', function () {
  document.getElementById('topbar')?.classList.toggle('scrolled', this.scrollTop &gt; 60);
});

// ── HOME ──
async function renderHome() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="main-hero-bg"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        &lt;button class="nav-arrow" onclick="navigate('home')"&gt;&#8249;&lt;/button&gt;
        &lt;button class="nav-arrow"&gt;&#8250;&lt;/button&gt;
      </div>
      <div class="topbar-right">
        &lt;button class="btn-signup"&gt;Registrarse&lt;/button&gt;
        &lt;button class="btn-login"&gt;Iniciar sesión&lt;/button&gt;
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
        <span class="section-more">Ver todo</span>
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
    <div class="section" id="rec-section" style="display:none">
      <div class="section-head">
        <span class="section-title">Basado en lo que escuchas</span>
      </div>
      <div class="cards-row" id="rec-row"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  document.getElementById('main-scroll').addEventListener('scroll', function () {
    document.getElementById('topbar')?.classList.toggle('scrolled', this.scrollTop &gt; 60);
  });

  loadArtists();
  loadSongs();
  loadQuickGrid();
  loadRecommendations();
}

async function loadQuickGrid() {
  const songs = await getSongs(6);
  const grid = document.getElementById('quick-grid');
  if (!grid) return;
  const gradients = ['g1','g2','g3','g4','g5','g6'];
  grid.innerHTML = songs.map((s, i) =&gt; `
    <div class="quick-card" data-song-index="${i}">
      <div class="quick-thumb ${gradients[i % 6]}"></div>
      <span class="quick-name">${s.title}</span>
      <div class="quick-play">
        &lt;svg width="18" height="18" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.quick-card').forEach((card, i) =&gt; {
    card.onclick = () =&gt; setQueue(songs, i);
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
        ${img ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '🎵'}
      </div>
      <div class="card-play">&lt;svg width="20" height="20" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;</div>
      <div class="card-title">${artist.name}</div>
      <div class="card-sub">Artista</div>
    `;
    card.onclick = () =&gt; navigate('artist', artist.id);
    row.appendChild(card);
  }
}

async function loadSongs() {
  const songs = await getSongs(20);
  const list = document.getElementById('song-list');
  if (!list) return;

  const albumIds = [...new Set(songs.map(s =&gt; s.album_id))];
  const covers = {};
  await Promise.all(albumIds.map(async id =&gt; {
    const data = await getAlbumCover(id);
    covers[id] = data.cover_url || null;
  }));

  list.innerHTML = '';
  songs.forEach((s, i) =&gt; {
    const cover = covers[s.album_id];
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
        <div>
          <div class="s-name">${s.title}</div>
          <div class="s-artist">${s.artist}</div>
        </div>
      </div>
      <div class="s-album">${s.album}</div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () =&gt; setQueue(songs, i);
    list.appendChild(row);
  });
}

async function loadRecommendations() {
  if (!currentSong) {
    const section = document.getElementById('rec-section');
    if (section) section.style.display = 'none';
    return;
  }
  try {
    const recs = await getRecommendations(currentSong.id);
    if (!recs.length) {
      const section = document.getElementById('rec-section');
      if (section) section.style.display = 'none';
      return;
    }

    const section = document.getElementById('rec-section');
    const row = document.getElementById('rec-row');
    if (!section || !row) return;

    const albumIds = [...new Set(recs.map(s =&gt; s.album_id))];
    const covers = {};
    await Promise.all(albumIds.map(async id =&gt; {
      const data = await getAlbumCover(id);
      covers[id] = data.cover_url || null;
    }));

    section.style.display = 'block';
    row.innerHTML = '';
    recs.forEach((s, i) =&gt; {
      const cover = covers[s.album_id];
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img">
          ${cover ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : '🎵'}
        </div>
        <div class="card-play">&lt;svg width="20" height="20" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;</div>
        <div class="card-title">${s.title}</div>
        <div class="card-sub">${s.artist}</div>
      `;
      card.onclick = () =&gt; setQueue(recs, i);
      row.appendChild(card);
    });
  } catch {
    const section = document.getElementById('rec-section');
    if (section) section.style.display = 'none';
  }
}

// Called by player.js whenever a new song starts playing
window.onSongPlay = loadRecommendations;

// ── ARTIST PAGE (FIXED) ──
async function renderArtist(artistId) {
  const main = document.getElementById('main-content');

  // FIX: Don't use album/songs before they are defined!
  main.innerHTML = `<div style="padding:40px 24px;color:var(--text2);font-size:14px">Cargando...</div>`;

  const [songs, imgData, artist, allAlbums] = await Promise.all([
    getArtistSongs(artistId),
    getArtistImage(artistId),
    getArtist(artistId),
    getAlbums()
  ]);

  if (!songs.length) {
    main.innerHTML = `<div style="padding:40px 24px;color:var(--text2)">No se encontraron canciones.</div>`;
    return;
  }

  const artistName = artist?.name || songs[0]?.artist || 'Artista';
  const img = imgData.image_url || '';

  const artistAlbums = allAlbums.filter(a =&gt;
    a.artist === artistName || a.artist === songs[0]?.artist || songs.some(s =&gt; s.album_id === a.id)
  );

  const albumIds = [...new Set(songs.map(s =&gt; s.album_id))];
  const covers = {};
  await Promise.all(albumIds.map(async id =&gt; {
    const data = await getAlbumCover(id);
    covers[id] = data.cover_url || null;
  }));

  const albumCardCovers = {};
  await Promise.all(artistAlbums.map(async a =&gt; {
    const data = await getAlbumCover(a.id);
    albumCardCovers[a.id] = data.cover_url || null;
  }));

  main.innerHTML = `
    <div class="main-hero-bg" style="background:linear-gradient(180deg,#1a2a3a 0%,transparent 100%)"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        &lt;button class="nav-arrow" onclick="navigate('home')"&gt;&#8249;&lt;/button&gt;
        &lt;button class="nav-arrow"&gt;&#8250;&lt;/button&gt;
      </div>
    </div>
    <div style="padding:0 24px 32px;display:flex;align-items:flex-end;gap:24px;min-height:220px">
      <div style="width:180px;height:180px;border-radius:50%;background:var(--bg4);overflow:hidden;flex-shrink:0;box-shadow:0 16px 48px rgba(0,0,0,0.6)">
        ${img ? `<img src style="width:100%;height:100%;object-fit:cover">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px">🎵</div>'}
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Artista</div>
        <h1 style="font-size:48px;font-weight:800;letter-spacing:-1px;margin-bottom:16px">${artistName}</h1>
        <div style="color:var(--text2);font-size:14px">${songs.length} canciones</div>
      </div>
    </div>
    <div style="padding:0 24px">
      &lt;button onclick="setQueue(window._artistSongs, 0)" style="background:var(--accent);border:none;border-radius:50%;width:56px;height:56px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 24px rgba(0,0,0,0.4)"&gt;
        &lt;svg width="24" height="24" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;
      &lt;/button&gt;
      <div class="songs-header">
        <span>#</span><span>Título</span><span>Álbum</span>
        <span class="dur-head">⏱</span>
      </div>
      <div class="song-list" id="artist-songs"></div>
    </div>
    <div style="padding:24px 24px 0" id="artist-albums-section" style="display:none">
      <div class="section-head">
        <span class="section-title">Álbumes</span>
      </div>
      <div class="cards-row" id="artist-albums-row"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  window._artistSongs = songs;
  const list = document.getElementById('artist-songs');
  songs.forEach((s, i) =&gt; {
    const cover = covers[s.album_id];
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
        <div>
          <div class="s-name">${s.title}</div>
          <div class="s-artist">${s.artist}</div>
        </div>
      </div>
      <div class="s-album">${s.album}</div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () =&gt; setQueue(songs, i);
    list.appendChild(row);
  });

  // Render artist albums section
  const albumsRow = document.getElementById('artist-albums-row');
  if (albumsRow && artistAlbums.length) {
    artistAlbums.forEach(album =&gt; {
      const cover = albumCardCovers[album.id];
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img">
          ${cover ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : '💿'}
        </div>
        <div class="card-play">&lt;svg width="20" height="20" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;</div>
        <div class="card-title">${album.title}</div>
        <div class="card-sub">${album.artist}</div>
      `;
      card.onclick = () =&gt; navigate('album', album.id);
      albumsRow.appendChild(card);
    });
  }
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
  const albumTitle = album?.title || songs[0]?.album || 'Álbum';

  main.innerHTML = `
    <div class="main-hero-bg" style="background:linear-gradient(180deg,#2a1a3a 0%,transparent 100%)"></div>
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        &lt;button class="nav-arrow" onclick="navigate('home')"&gt;&#8249;&lt;/button&gt;
        &lt;button class="nav-arrow"&gt;&#8250;&lt;/button&gt;
      </div>
    </div>
    <div style="padding:0 24px 32px;display:flex;align-items:flex-end;gap:24px;min-height:220px">
      <div style="width:180px;height:180px;border-radius:8px;background:var(--bg4);overflow:hidden;flex-shrink:0;box-shadow:0 16px 48px rgba(0,0,0,0.6)">
        ${cover ? `<img src style="width:100%;height:100%;object-fit:cover">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px">💿</div>'}
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Álbum</div>
        <h1 style="font-size:48px;font-weight:800;letter-spacing:-1px;margin-bottom:16px">${albumTitle}</h1>
        <div style="color:var(--text2);font-size:14px">${songs.length} canciones</div>
      </div>
    </div>
    <div style="padding:0 24px">
      &lt;button onclick="setQueue(window._albumSongs, 0)" style="background:var(--accent);border:none;border-radius:50%;width:56px;height:56px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 24px rgba(0,0,0,0.4)"&gt;
        &lt;svg width="24" height="24" fill="#000" viewBox="0 0 24 24"&gt;&lt;path d="M8 5v14l11-7z"/&gt;&lt;/svg&gt;
      &lt;/button&gt;
      <div class="songs-header">
        <span>#</span><span>Título</span><span>Duración</span><span></span>
      </div>
      <div class="song-list" id="album-songs"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  window._albumSongs = songs;
  const list = document.getElementById('album-songs');
  songs.forEach((s, i) =&gt; {
    const row = document.createElement('div');
    row.className = 'song-row';
    row.innerHTML = `
      <div><span class="s-num">${i + 1}</span><span class="s-play">▶</span></div>
      <div class="s-info">
        <div class="s-thumb">
          ${cover ? `<img src style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : '🎵'}
        </div>
        <div>
          <div class="s-name">${s.title}</div>
        </div>
      </div>
      <div class="s-album"></div>
      <div class="s-dur">${formatDuration(s.duration)}</div>
    `;
    row.onclick = () =&gt; setQueue(songs, i);
    list.appendChild(row);
  });
}

// ── SEARCH PAGE ──
async function renderSearch() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="topbar" id="topbar">
      <div class="nav-arrows">
        &lt;button class="nav-arrow" onclick="navigate('home')"&gt;&#8249;&lt;/button&gt;
        &lt;button class="nav-arrow"&gt;&#8250;&lt;/button&gt;
      </div>
    </div>
    <div style="padding:0 24px">
      <h1 style="font-size:28px;font-weight:800;margin-bottom:20px">Buscar</h1>
      <div style="position:relative;margin-bottom:24px">
        &lt;svg style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--bg)" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"&gt;&lt;circle cx="11" cy="11" r="8"/&gt;&lt;path d="m21 21-4.35-4.35"/&gt;&lt;/svg&gt;
        &lt;input id="search-input" type="text" placeholder="¿Qué quieres escuchar?"
          style="width:100%;padding:14px 14px 14px 44px;border-radius:8px;border:none;background:var(--text);color:var(--bg);font-family:inherit;font-size:15px;outline:none"&gt;
      </div>
      <div class="song-list" id="search-results"></div>
    </div>
    <div class="section-bottom"></div>
  `;

  const input = document.getElementById('search-input');
  input.focus();
  let debounce;
  input.addEventListener('input', () =&gt; {
    clearTimeout(debounce);
    debounce = setTimeout(() =&gt; doSearch(input.value.trim()), 350);
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
  results.forEach((s, i) =&gt; {
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
    row.onclick = () =&gt; setQueue(results, i);
    list.appendChild(row);
  });
}

// ── SIDEBAR ──
async function loadSidebarArtists() {
  const artists = await getArtists();
  const list = document.getElementById('sidebar-list');
  list.innerHTML = artists.map(a =&gt; `
    <div class="pl-item">
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
  list.innerHTML = albums.map(a =&gt; `
    <div class="pl-item">
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

document.querySelectorAll('.lib-chip').forEach(chip =&gt; {
  chip.addEventListener('click', () =&gt; {
    document.querySelectorAll('.lib-chip').forEach(c =&gt; c.classList.remove('active'));
    chip.classList.add('active');
    if (chip.dataset.filter === 'artistas') loadSidebarArtists();
    else if (chip.dataset.filter === 'albums') loadSidebarAlbums();
    else loadSidebarPlaylists();
  });
});

// Init
navigate('home');
loadSidebarPlaylists();
