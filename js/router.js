function navigate(page, id = null) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (activeNav) activeNav.classList.add('active');
  document.getElementById('main-scroll').scrollTo(0, 0);

  switch (page) {
    case 'home':   renderHome(); break;
    case 'search': renderSearch(); break;
    case 'artist': renderArtist(id); break;
    case 'album':  renderAlbum(id); break;
  }
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});
