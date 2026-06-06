// js/api.js
const API = "https://sonosfer-backend.onrender.com";
const CDN = "https://pub-ca150376c7284c64adcb619132b3bf1a.r2.dev";

async function getSongs(limit = 20, offset = 0) {
  const res = await fetch(`${API}/songs?limit=${limit}&offset=${offset}`);
  return res.json();
}

async function getArtist(artistId) {
  const res = await fetch(`${API}/artists`);
  const artists = await res.json();
  return artists.find(a => a.id === artistId);
}

async function getSong(id) {
  const res = await fetch(`${API}/songs/${id}`);
  return res.json();
}

async function getAlbum(albumId) {
  const res = await fetch(`${API}/albums`);
  const albums = await res.json();
  return albums.find(a => a.id === albumId);
}

async function getRecommendations(songId) {
  const res = await fetch(`${API}/songs/${songId}/recommendations`);
  return res.json();
}

async function getArtists() {
  const res = await fetch(`${API}/artists`);
  return res.json();
}

async function getArtistImage(artistId) {
  const res = await fetch(`${API}/artists/${artistId}/image`);
  return res.json();
}

async function getArtistSongs(artistId) {
  const res = await fetch(`${API}/artists/${artistId}/songs`);
  return res.json();
}

async function getAlbums() {
  const res = await fetch(`${API}/albums`);
  return res.json();
}

async function getAlbumSongs(albumId) {
  const res = await fetch(`${API}/albums/${albumId}/songs`);
  return res.json();
}

async function getAlbumCover(albumId) {
  const res = await fetch(`${API}/albums/${albumId}/cover`);
  return res.json();
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
