(() => {
  const designs = Array.isArray(window.VOIDFORM_DESIGNS) ? window.VOIDFORM_DESIGNS : [];
  const grid = document.querySelector('#design-grid');
  const search = document.querySelector('#design-search');
  const count = document.querySelector('#design-count');
  const filterButtons = [...document.querySelectorAll('.design-filter')];
  const locations = [...document.querySelectorAll('.location-option')];
  const bodyZones = [...document.querySelectorAll('.body-zone')];
  const bodyLabel = document.querySelector('#body-selection-label');
  const locationLabel = button => button?.dataset.label || 'Nie wybrano';
  const sizes = [...document.querySelectorAll('.size-option')];
  const detail = document.querySelector('#detail-level');
  const money = value => Math.round(value / 10) * 10;
  const state = { design: designs[0] || null, location: locations[0] || null, size: sizes.find(el => el.dataset.size === 'm') || sizes[0], filter: 'all' };
  const typeNames = { tribal: 'NEO TRIBAL', sigil: 'CYBER SIGILISM', organic: 'ORGANIC / GLITCH' };

  function renderDesigns() {
    if (!grid) return;
    const query = (search?.value || '').trim().toLocaleLowerCase('pl');
    const filtered = designs.filter(d => (state.filter === 'all' || d.type === state.filter) && (!query || `${d.name} ${d.code} ${typeNames[d.type]}`.toLocaleLowerCase('pl').includes(query)));
    count.textContent = String(filtered.length);
    grid.innerHTML = '';
    if (!filtered.length) {
      const empty = document.createElement('p'); empty.className = 'no-designs'; empty.textContent = 'Nie znaleziono wzoru. Zmień frazę lub kategorię.'; grid.append(empty); return;
    }
    filtered.forEach(d => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `design-choice${state.design?.name === d.name ? ' selected' : ''}`;
      button.setAttribute('aria-pressed', String(state.design?.name === d.name));
      const img = document.createElement('img'); img.src = d.image; img.alt = `Wzór ${d.name}`; img.loading = 'lazy';
      const code = document.createElement('span'); code.className = 'design-code'; code.textContent = d.code;
      const name = document.createElement('strong'); name.textContent = d.name;
      const type = document.createElement('small'); type.textContent = typeNames[d.type] || d.type;
      button.append(img, code, name, type);
      button.addEventListener('click', () => { state.design = d; renderDesigns(); updateEstimate(); });
      grid.append(button);
    });
  }
  function updateEstimate() {
    if (!state.design || !state.location || !state.size) return;
    const base = Number(state.size.dataset.base || 650);
    const locationMultiplier = Number(state.location.dataset.mult || 1);
    const detailMultiplier = Number(detail.value || 1);
    const typeMultiplier = state.design.type === 'organic' ? 1.12 : state.design.type === 'sigil' ? 1.08 : 1;
    const center = base * locationMultiplier * detailMultiplier * typeMultiplier;
    const low = Math.max(250, money(center * .86));
    const high = Math.max(low + 100, money(center * 1.16));
    document.querySelector('#price-low').textContent = low.toLocaleString('pl-PL');
    document.querySelector('#price-high').textContent = high.toLocaleString('pl-PL');
    document.querySelector('#selected-image').src = state.design.image;
    document.querySelector('#selected-image').alt = `Wybrany wzór ${state.design.name}`;
    document.querySelector('#selected-code').textContent = `${state.design.code} / FLASH`;
    document.querySelector('#selected-name').textContent = state.design.name;
    document.querySelector('#summary-design').textContent = state.design.name;
    document.querySelector('#summary-location').textContent = state.location.dataset.label;
    document.querySelector('#summary-size').textContent = state.size.dataset.label;
    document.querySelector('#summary-detail').textContent = detail.options[detail.selectedIndex].text.split(' — ')[0];
    document.querySelector('#ask-quote').dataset.low = low;
    document.querySelector('#ask-quote').dataset.high = high;
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    renderDesigns();
  }));
  search?.addEventListener('input', renderDesigns);
  function selectLocation(button) {
    if (!button) return;
    state.location = button;
    locations.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    bodyZones.forEach(zone => { const selected = zone.dataset.location === button.dataset.location; zone.classList.toggle('selected', selected); zone.setAttribute('aria-pressed', String(selected)); });
    if (bodyLabel) bodyLabel.textContent = `Wybrane miejsce: ${locationLabel(button)}`;
    updateEstimate();
  }
  locations.forEach(button => button.addEventListener('click', () => selectLocation(button)));
  bodyZones.forEach(zone => {
    const activate = () => { const matching = locations.find(button => button.dataset.location === zone.dataset.location); selectLocation(matching); };
    zone.addEventListener('click', activate);
    zone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  sizes.forEach(button => button.addEventListener('click', () => {
    state.size = button; sizes.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); updateEstimate();
  }));
  detail?.addEventListener('change', updateEstimate);
  document.querySelector('#ask-quote')?.addEventListener('click', () => {
    const low = document.querySelector('#price-low').textContent;
    const high = document.querySelector('#price-high').textContent;
    const body = [
      'Cześć VOIDFORM,', '', 'proszę o potwierdzenie wyceny tatuażu:',
      `Wzór: ${state.design.name} (${state.design.code})`,
      `Miejsce: ${state.location.dataset.label}`,
      `Rozmiar: ${state.size.dataset.label}`,
      `Poziom detalu: ${detail.options[detail.selectedIndex].text}`,
      `Szacunkowa cena kalkulatora: ${low}–${high} PLN`, '',
      'Chciałbym/chciałabym poznać ostateczną wycenę i dostępne terminy.', ''
    ].join('\n');
    const subject = `VOIDFORM — wycena: ${state.design.name}`;
    window.location.href = `mailto:hello@voidform.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', e => { if (glow) { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; } });
  const menuToggle = document.querySelector('.menu-toggle'); const nav = document.querySelector('.main-nav');
  menuToggle?.addEventListener('click', () => { const expanded = menuToggle.getAttribute('aria-expanded') === 'true'; menuToggle.setAttribute('aria-expanded', String(!expanded)); nav?.classList.toggle('open', !expanded); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false'); }));
  locations.forEach(button => button.setAttribute('aria-pressed', 'false'));
  sizes.find(el => el.dataset.size === 'm')?.classList.add('active');
  selectLocation(locations[0]);
  renderDesigns(); updateEstimate();
})();



document.addEventListener('DOMContentLoaded', () => {
  const zones = document.querySelectorAll('.body-zone');
  const selectionLabel = document.getElementById('body-selection-label');

  zones.forEach(zone => {
    zone.addEventListener('click', function () {
      // Usuń klasę active ze wszystkich obszarów
      zones.forEach(z => z.classList.remove('active'));

      const location = this.getAttribute('data-location');
      
      // Zaznacz wszystkie strefy przypisane do tej samej lokalizacji (np. lewe i prawe przedramię)
      const matchingZones = document.querySelectorAll(`.body-zone[data-location="${location}"]`);
      matchingZones.forEach(z => z.classList.add('active'));

      // Zaktualizuj etykietę tekstową
      const labelText = this.getAttribute('aria-label');
      if (selectionLabel) {
        selectionLabel.textContent = 'Wybrane miejsce: ' + labelText;
      }
    });
  });
});