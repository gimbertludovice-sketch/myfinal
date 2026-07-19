/* =========================================================================
   LUDOVICE Catalog — powers products.html
   Renders the 600-item grid, handles search/filter/sort + "load more"
   pagination, and the clickable product detail modal.
   ========================================================================= */

(function () {
  const PAGE_SIZE = 24;
  let state = {
    query: '',
    cat: 'all',
    sort: 'default',
    visible: PAGE_SIZE
  };

  const grid = document.getElementById('product-grid');
  const meta = document.getElementById('results-meta');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const chips = document.querySelectorAll('.chip');

  // honor ?cat= param coming from the homepage category strip
  const params = new URLSearchParams(location.search);
  if (params.get('cat')) {
    state.cat = params.get('cat');
    chips.forEach(c => c.classList.toggle('active', c.dataset.cat === state.cat));
  }

  function getFiltered() {
    let list = LUDOVICE_PRODUCTS.filter(p => {
      const matchesCat = state.cat === 'all' || p.category === state.cat;
      const matchesQuery = !state.query || p.name.toLowerCase().includes(state.query) || p.desc.toLowerCase().includes(state.query);
      return matchesCat && matchesQuery;
    });
    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => (b.popular - a.popular) || (b.rating - a.rating));
    }
    return list;
  }

  function cardHTML(p) {
    return `
      <article class="card product-card reveal is-visible" data-id="${p.id}">
        <div class="product-card__media" data-open="${p.id}">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          ${p.popular ? '<span class="product-card__tag">Popular</span>' : ''}
          <span class="product-card__cat">${p.categoryLabel}</span>
        </div>
        <div class="product-card__body">
          <h3 data-open="${p.id}" style="cursor:pointer;">${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-card__rating"><span class="stars">${starString(p.rating)}</span> ${p.rating} (${p.reviews})</div>
          <div class="product-card__footer">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-primary btn-sm" data-buy="${p.id}">Buy Now</button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const filtered = getFiltered();
    const slice = filtered.slice(0, state.visible);
    grid.innerHTML = slice.map(cardHTML).join('');
    meta.textContent = `Showing ${slice.length} of ${filtered.length} dishes${state.cat !== 'all' ? ' in ' + document.querySelector(`.chip[data-cat="${state.cat}"]`).textContent : ''}${state.query ? ` matching "${state.query}"` : ''}`;
    loadMoreBtn.style.display = filtered.length > state.visible ? 'inline-flex' : 'none';

    grid.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', () => openModal(Number(el.dataset.open)));
    });
    grid.querySelectorAll('[data-buy]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = LUDOVICE_PRODUCTS.find(x => x.id === Number(el.dataset.buy));
        Cart.add(p);
      });
    });
  }

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim().toLowerCase();
    state.visible = PAGE_SIZE;
    render();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.cat = chip.dataset.cat;
      state.visible = PAGE_SIZE;
      render();
    });
  });

  loadMoreBtn.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    render();
  });

  // ---- detail modal ----
  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// sourcery skip: avoid-function-declarations-in-blocks
  function openModal(id) {
    const p = LUDOVICE_PRODUCTS.find(x => x.id === id);
    if (!p) return;
    modalBody.innerHTML = `
      <div style="aspect-ratio:16/9;overflow:hidden;">
        <img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div style="padding:32px;">
        <span class="badge-soft">${p.categoryLabel}</span>
        <h2 style="margin-top:12px;">${p.name}</h2>
        <div class="product-card__rating" style="margin:10px 0 16px;"><span class="stars">${starString(p.rating)}</span> ${p.rating} rating · ${p.reviews} reviews</div>
        <p style="color:var(--slate);">${p.desc}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:26px;">
          <span class="price" style="font-size:1.5rem;">${money(p.price)}</span>
          <button class="btn btn-primary" id="modal-buy">Buy Now</button>
        </div>
      </div>`;
    document.getElementById('modal-buy').addEventListener('click', () => { Cart.add(p); closeModal(); });
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  render();
})();
