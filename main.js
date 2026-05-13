  function openScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id)?.classList.add('active');
  }
  function closeScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeScreen();
  });