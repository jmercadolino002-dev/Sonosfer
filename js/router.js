const routes = {
  home: () => { loadArtists(); loadSongs(); },
  search: () => { console.log('search page'); },
  artist: (id) => { loadArtistPage(id); },
  album: (id) => { loadAlbumPage(id); }
};

function navigate(page, id = null) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => n.classList.remove('active'));

  if (routes[page]) routes[page](id);
}

// Nav clicks
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});
