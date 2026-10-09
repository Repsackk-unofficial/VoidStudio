const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('open', !expanded);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const filters = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.flash-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  cards.forEach(card => {
    const show = filter === 'all' || card.dataset.type === filter;
    card.classList.toggle('is-hidden', !show);
    card.setAttribute('aria-hidden', String(!show));
  });
}));

const modal = document.querySelector('.modal');
const modalTitle = document.querySelector('#modal-title');
const modalCode = document.querySelector('.modal-code');
const modalDesc = document.querySelector('.modal-desc');
const modalPattern = document.querySelector('.modal-pattern');
let lastFocused = null;
function closeModal() {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocused?.focus();
}
cards.forEach(card => card.addEventListener('click', () => {
  lastFocused = card;
  modalTitle.textContent = card.dataset.name;
  modalCode.textContent = `${card.dataset.code} / ARCHIVE ENTRY`;
  modalDesc.textContent = card.dataset.desc;
  const pattern = card.querySelector('.pattern');
  const imagePath = card.dataset.image || card.querySelector('.flash-reference-image img')?.getAttribute('src');
  modalPattern.className = pattern ? `modal-pattern ${pattern.className}` : 'modal-pattern';
  modalPattern.style.backgroundImage = imagePath ? `url("${imagePath}")` : '';
  modalPattern.style.backgroundSize = imagePath ? 'contain' : '';
  modalPattern.style.backgroundPosition = imagePath ? 'center' : '';
  modalPattern.style.backgroundRepeat = imagePath ? 'no-repeat' : '';
  modalPattern.style.backgroundColor = imagePath ? 'transparent' : '';
  modalPattern.style.clipPath = imagePath ? 'none' : '';
  modalPattern.style.filter = imagePath ? 'none' : '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}));
modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
});
document.querySelector('.modal-contact')?.addEventListener('click', closeModal);
