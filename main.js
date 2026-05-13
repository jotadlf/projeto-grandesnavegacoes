// ── NAVEGAÇÃO ──────────────────────────────
// Nova Viagem → vai direto para o jogo
function irParaJogo() {
  window.location.href = 'game.html';
}

// ── TELAS SECUNDÁRIAS ──────────────────────
function openScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id)?.classList.add('active');
}

function closeScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// Fecha com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeScreen();
});
