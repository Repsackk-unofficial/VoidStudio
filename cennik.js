(() => {
  const designs = Array.isArray(window.VOIDFORM_DESIGNS) ? window.VOIDFORM_DESIGNS : [];
  const grid = document.querySelector('#design-grid');
  const search = document.querySelector('#design-search');
  const count = document.querySelector('#design-count');
  const filterButtons = [...document.querySelectorAll('.design-filter')];
  const locations = [...document.querySelectorAll('.location-option')];
  const bodyZones = [...document.querySelectorAll('.body-zone')];
  const bodyLabel = document.querySelector('#body-selection-label');
  const sizes = [...document.querySelectorAll('.size-option')];
  const detail = document.querySelector('#detail-level');
  const previewTattoo = document.querySelector('#preview-tattoo');
  const previewBodySvg = document.querySelector('#preview-body-svg');
  const previewFacingLabel = document.querySelector('#preview-facing-label');
  const previewRing = document.querySelector('#preview-placement-ring');
  const locationLabel = button => button?.dataset.label || 'Nie wybrano';
  const money = value => Math.round(value / 10) * 10;
  const state = {
    design: designs[0] || null,
    location: locations.find(el => el.dataset.location === 'forearm') || locations[0] || null,
    size: sizes.find(el => el.dataset.size === 'm') || sizes[0] || null,
    filter: 'all'
  };
  const typeNames = { tribal: 'NEO TRIBAL', sigil: 'CYBER SIGILISM', organic: 'ORGANIC / GLITCH' };

  // Pozycje są dopasowane do viewBox 300 x 500 sylwetki.
  // Wymiary podglądu zmieniają się wraz z wybranym rozmiarem.
  const placements = {
    front: {
      neck:     { x: 133, y: 76,  w: 34, h: 22, angle: 0 },
      shoulder: { x: 174, y: 99,  w: 39, h: 35, angle: -20 },
      upperarm: { x: 187, y: 126, w: 28, h: 48, angle: -12 },
      forearm:  { x: 194, y: 162, w: 25, h: 47, angle: -8 },
      chest:    { x: 119, y: 112, w: 62, h: 48, angle: 0 },
      ribs:     { x: 122, y: 151, w: 55, h: 43, angle: 0 },
      stomach:  { x: 124, y: 185, w: 52, h: 43, angle: 0 },
      thigh:    { x: 119, y: 234, w: 36, h: 82, angle: 0 },
      calf:     { x: 118, y: 325, w: 25, h: 85, angle: 0 },
      ankle:    { x: 116, y: 431, w: 24, h: 43, angle: 0 },
      hand:     { x: 65,  y: 196, w: 22, h: 25, angle: -10 },
      back:     { x: 119, y: 117, w: 62, h: 90, angle: 0 }
    },
    back: {
      neck:     { x: 133, y: 76,  w: 34, h: 22, angle: 0 },
      shoulder: { x: 174, y: 99,  w: 39, h: 35, angle: -20 },
      upperarm: { x: 187, y: 126, w: 28, h: 48, angle: -12 },
      forearm:  { x: 194, y: 162, w: 25, h: 47, angle: -8 },
      chest:    { x: 119, y: 112, w: 62, h: 48, angle: 0 },
      ribs:     { x: 122, y: 151, w: 55, h: 43, angle: 0 },
      stomach:  { x: 124, y: 185, w: 52, h: 43, angle: 0 },
      back:     { x: 120, y: 111, w: 60, h: 103, angle: 0 },
      thigh:    { x: 145, y: 234, w: 36, h: 82, angle: 0 },
      calf:     { x: 158, y: 325, w: 25, h: 85, angle: 0 },
      ankle:    { x: 160, y: 431, w: 24, h: 43, angle: 0 },
      hand:     { x: 65,  y: 196, w: 22, h: 25, angle: -10 }
    }
  };

  function currentFacing() {
    if (state.location?.dataset.location === 'back') return 'back';
    // Pośladki są częścią tylnego widoku, pozostałe miejsca pokazujemy z przodu.
    if (state.location?.dataset.location === 'thigh' &&
        /poślad/i.test(bodyZones.find(z => z.dataset.location === 'thigh' && z.classList.contains('selected'))?.getAttribute('aria-label') || '')) return 'back';
    return 'front';
  }

  function renderDesigns() {
    if (!grid) return;
    const query = (search?.value || '').trim().toLocaleLowerCase('pl');
    const filtered = designs.filter(d =>
      (state.filter === 'all' || d.type === state.filter) &&
      (!query || `${d.name} ${d.code} ${typeNames[d.type] || d.type}`.toLocaleLowerCase('pl').includes(query))
    );
    if (count) count.textContent = String(filtered.length);
    grid.innerHTML = '';
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'no-designs';
      empty.textContent = 'Nie znaleziono wzoru. Zmień frazę lub kategorię.';
      grid.append(empty);
      return;
    }
    filtered.forEach(d => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `design-choice${state.design?.name === d.name ? ' selected' : ''}`;
      button.setAttribute('aria-pressed', String(state.design?.name === d.name));
      const img = document.createElement('img');
      img.src = d.image; img.alt = `Wzór ${d.name}`; img.loading = 'lazy';
      const code = document.createElement('span'); code.className = 'design-code'; code.textContent = d.code;
      const name = document.createElement('strong'); name.textContent = d.name;
      const type = document.createElement('small'); type.textContent = typeNames[d.type] || d.type;
      button.append(img, code, name, type);
      button.addEventListener('click', () => {
        state.design = d;
        renderDesigns();
        updateEstimate();
      });
      grid.append(button);
    });
  }

  function syncLocationUI() {
    const selectedLocation = state.location?.dataset.location;
    locations.forEach(button => {
      const selected = button === state.location;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    bodyZones.forEach(zone => {
      const selected = zone.dataset.location === selectedLocation;
      zone.classList.toggle('selected', selected);
      zone.classList.toggle('active', selected);
      zone.setAttribute('aria-pressed', String(selected));
    });
    if (bodyLabel) bodyLabel.textContent = `Wybrane miejsce: ${locationLabel(state.location)}`;
  }

  function updateBodyPreview() {
    if (!previewTattoo || !previewBodySvg || !state.location) return;
    const facing = currentFacing();
    const loc = state.location.dataset.location || 'forearm';
    const placement = (placements[facing] || placements.front)[loc] || placements.front.forearm;
    const sizeKey = state.size?.dataset.size || 'm';
    const sizeScale = ({ xs: 0.52, s: 0.72, m: 1, l: 1.22, xl: 1.45 })[sizeKey] || 1;
    const width = placement.w * sizeScale;
    const height = placement.h * sizeScale;
    const x = placement.x + (placement.w - width) / 2;
    const y = placement.y + (placement.h - height) / 2;
    const href = state.design?.image || '';
    previewTattoo.setAttribute('href', href);
    previewTattoo.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    previewTattoo.setAttribute('x', x.toFixed(1));
    previewTattoo.setAttribute('y', y.toFixed(1));
    previewTattoo.setAttribute('width', width.toFixed(1));
    previewTattoo.setAttribute('height', height.toFixed(1));
    previewTattoo.setAttribute('transform', placement.angle ? `rotate(${placement.angle} ${ (x + width / 2).toFixed(1)} ${(y + height / 2).toFixed(1)})` : '');
    previewBodySvg.dataset.facing = facing;
    previewBodySvg.setAttribute('aria-label', `Podgląd wzoru ${state.design?.name || ''} na ${locationLabel(state.location)}, widok ${facing === 'back' ? 'tyłu' : 'przodu'}`);
    if (previewFacingLabel) previewFacingLabel.textContent = facing === 'back' ? 'BACK VIEW' : 'FRONT VIEW';
    if (previewRing) {
      previewRing.setAttribute('x', (x - 3).toFixed(1));
      previewRing.setAttribute('y', (y - 3).toFixed(1));
      previewRing.setAttribute('width', (width + 6).toFixed(1));
      previewRing.setAttribute('height', (height + 6).toFixed(1));
      previewRing.style.opacity = '1';
    }
  }

  function updateEstimate() {
    if (!state.design || !state.location || !state.size || !detail) return;
    const base = Number(state.size.dataset.base || 650);
    const locationMultiplier = Number(state.location.dataset.mult || 1);
    const detailMultiplier = Number(detail.value || 1);
    const typeMultiplier = state.design.type === 'organic' ? 1.12 : state.design.type === 'sigil' ? 1.08 : 1;
    const center = base * locationMultiplier * detailMultiplier * typeMultiplier;
    const low = Math.max(250, money(center * .86));
    const high = Math.max(low + 100, money(center * 1.16));
    document.querySelector('#price-low').textContent = low.toLocaleString('pl-PL');
    document.querySelector('#price-high').textContent = high.toLocaleString('pl-PL');
    document.querySelector('#selected-code').textContent = `${state.design.code} / FLASH`;
    document.querySelector('#selected-name').textContent = state.design.name;
    document.querySelector('#summary-design').textContent = state.design.name;
    document.querySelector('#summary-location').textContent = locationLabel(state.location);
    document.querySelector('#summary-size').textContent = state.size.dataset.label;
    document.querySelector('#summary-detail').textContent = detail.options[detail.selectedIndex].text.split(' — ')[0];
    const askQuote = document.querySelector('#ask-quote');
    askQuote.dataset.low = low;
    askQuote.dataset.high = high;
    updateBodyPreview();
  }

  function selectLocation(button) {
    if (!button) return;
    state.location = button;
    syncLocationUI();
    updateEstimate();
  }

  filterButtons.forEach(button => button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    renderDesigns();
  }));
  search?.addEventListener('input', renderDesigns);
  locations.forEach(button => button.addEventListener('click', () => selectLocation(button)));

  bodyZones.forEach(zone => {
    const activate = () => {
      const matching = locations.find(button => button.dataset.location === zone.dataset.location);
      if (matching) selectLocation(matching);
    };
    zone.addEventListener('click', activate);
    zone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });

  sizes.forEach(button => button.addEventListener('click', () => {
    state.size = button;
    sizes.forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    updateEstimate();
  }));

  detail?.addEventListener('change', updateEstimate);
  document.querySelector('#ask-quote')?.addEventListener('click', () => {
    if (!state.design || !state.location || !state.size || !detail) return;
    const low = document.querySelector('#price-low').textContent;
    const high = document.querySelector('#price-high').textContent;
    const body = [
      'Cześć VOIDFORM,', '', 'proszę o potwierdzenie wyceny tatuażu:',
      `Wzór: ${state.design.name} (${state.design.code})`,
      `Miejsce: ${locationLabel(state.location)}`,
      `Rozmiar: ${state.size.dataset.label}`,
      `Poziom detalu: ${detail.options[detail.selectedIndex].text}`,
      `Szacunkowa cena kalkulatora: ${low}–${high} PLN`, '',
      'Chciałbym/chciałabym poznać ostateczną wycenę i dostępne terminy.', ''
    ].join('\n');
    const subject = `VOIDFORM — wycena: ${state.design.name}`;
    window.location.href = `mailto:hello@voidform.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', e => {
    if (glow) { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; }
  });
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav?.classList.toggle('open', !expanded);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  sizes.forEach(b => b.setAttribute('aria-pressed', String(b === state.size)));
  filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
  renderDesigns();
  syncLocationUI();
  updateEstimate();
})();