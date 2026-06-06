const API = "https://sonosfer-backend.onrender.com";
const CDN = "https://pub-ca150376c7284c64adcb619132b3bf1a.r2.dev";

// Ping para despertar Render
fetch(`${API}/`).catch(() => {});

async function getSongs(limit = 20, offset = 0) {
  const res = await fetch(`${API}/songs?limit=${limit}&offset=${offset}`);
  return res.json();
}

async function getSong(id) {
  const res = await fetch(`${API}/songs/${id}`);
  return res.json();
}

async function getRecommendations(songId) {
  const res = await fetch(`${API}/songs/${songId}/recommendations`);
  return res.json();
}

async function getArtists() {
  const res = await fetch(`${API}/artists`);
  return res.json();
}

async function getArtist(id) {
  const res = await fetch(`${API}/artists/${id}`);
  return res.json();
}

// ← Llama directo a Deezer desde el frontend
async function getArtistImage(artistName) {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`
    );
    const data = await res.json();
    return data.data?.[0]?.picture_medium || null;
  } catch {
    return null;
  }
}

async function getArtistSongs(artistId) {
  const res = await fetch(`${API}/artists/${artistId}/songs`);
  return res.json();
}

async function getAlbums() {
  const res = await fetch(`${API}/albums`);
  return res.json();
}

async function getAlbum(id) {
  const res = await fetch(`${API}/albums/${id}`);
  return res.json();
}

async function getAlbumSongs(albumId) {
  const res = await fetch(`${API}/albums/${albumId}/songs`);
  return res.json();
}

// ← Llama directo a Deezer desde el frontend
async function getAlbumCover(artistName, albumTitle) {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(artistName + ' ' + albumTitle)}&limit=1`
    );
    const data = await res.json();
    return data.data?.[0]?.cover_medium || null;
  } catch {
    return null;
  }
}

async function getGenres() {
  const res = await fetch(`${API}/genres`);
  return res.json();
}

async function search(q) {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

function formatDuration(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
