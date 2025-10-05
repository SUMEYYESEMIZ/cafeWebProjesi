/* =========================
   Global state
========================= */
const state = {
  products: [],
  categories: [],
  activeCategory: "Tümü",
  q: ""
};

/* =========================
   Boot
========================= */
window.addEventListener("hashchange", router);
window.addEventListener("load", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  await loadMenu();
  router();
});

/* =========================
   Data
========================= */
async function loadMenu(){
  try{
    const r = await fetch("public/data/menu.json",{cache:"no-cache"});
    const d = await r.json();
    state.products = d.items || [];
    state.categories = ["Tümü", ...new Set(state.products.map(p=>p.category))];
  }catch(e){ console.error(e); }
}

/* =========================
   Utils
========================= */
function slugify(s){
  return (s||"").toLowerCase()
    .replaceAll('ç','c').replaceAll('ğ','g').replaceAll('ı','i')
    .replaceAll('ö','o').replaceAll('ş','s').replaceAll('ü','u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
const price = n => n==null?"" : new Intl.NumberFormat("tr-TR",
  {style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);

/* =========================
   Router
========================= */
function router(){
  const hash = (location.hash.replace('#','') || '/');
  const parts = hash.split('/').filter(Boolean); // ['menu','tostlar'] gibi

  if(parts[0] === 'menu' && parts[1]) {
    const catSlug = decodeURIComponent(parts[1]);
    renderProductsByCategory(catSlug);
  } else if(parts[0] === 'menu') {
    renderMenuCategories();                 // Kategori ızgarası
  } else if(parts[0] === 'contact') {
    renderContact();
  } else {
    renderHome();
  }
}

/* =========================
   Views
========================= */
function renderHome(){
  const el = document.getElementById("app");
  el.innerHTML = `
    <section class="hero">
      <div class="hero-card">
        <span class="badge">1975'ten beri</span>
        <h2 style="margin:.4rem 0 0">Geleneksel Lezzet, Modern Sunum</h2>
        <p>Fırından yeni çıkmış simitler, günlük pastalar ve sıcak içecekler.</p>
        <div style="display:flex;gap:12px;margin-top:12px">
          <a class="btn" href="#/menu">QR Menüye Git</a>
          <a class="btn small" style="background:#5b341b" href="#/contact">İletişim</a>
        </div>
      </div>
      <div class="hero-card">
        <img src="public/assets/logo.png" alt="Simitçi Fırın"
             style="width:100%;max-width:360px;display:block;margin:auto">
      </div>
    </section>

    <section>
      <div class="tabs" id="homeTabs"></div>
      <div class="grid" id="popular"></div>
    </section>
  `;

  // Anasayfa sekmeleri (menüye yönlendirir)
  const tabs = document.getElementById("homeTabs");
  ["Simit","Pastalar","İçecekler"].forEach((t,i)=>{
    const b = document.createElement("button");
    b.className = `tab ${i===0?"active":""}`;
    b.textContent = t;
    b.onclick = ()=>location.hash="#/menu";
    tabs.appendChild(b);
  });

  // Popüler (ilk 6)
  const list = state.products.slice(0,6);
  document.getElementById("popular").append(...list.map(Card));
}

/* --- Kategori ızgarası (#/menu) --- */
/* --- Kategori ızgarası (#/menu) --- */
function renderMenuCategories(){
  const el = document.getElementById('app');

  // >> Kendi resim dosyaların:
  const cats = [
    {name:'Kahvaltı', img:'public/assets/cats/kahvalti.jpg'},
    {name:'Sahanda Grubu', img:'public/assets/cats/sahanda.jpg'},
    {name:'Kruvasan', img:'public/assets/cats/kruvasan.jpg'},
    {name:'Börekler', img:'public/assets/cats/borek.jpg'},
    {name:'Açık Sıcak Sandviçler / Sandviçler', img:'public/assets/cats/sandvic.jpg'},
    {name:'Tostlar', img:'public/assets/cats/tost.jpg'},
    {name:'Aperatifler', img:'public/assets/cats/aperatif.jpg'},
  ];

  el.innerHTML = `
    <section class="cat-grid" aria-label="Kategoriler">
      ${cats.map(c => `
        <a class="cat-card" style="--bg:url('${c.img}')"
           href="#/menu/${encodeURIComponent(slugify(c.name))}">
          <span>${c.name.toUpperCase()}</span>
        </a>
      `).join('')}
    </section>
  `;
}


/* --- Seçilen kategori ürünleri (#/menu/<slug>) --- */
function renderProductsByCategory(catSlug){
  const catFromSlug = state.categories.find(c => slugify(c) === catSlug) || 'Tümü';
  state.activeCategory = catFromSlug;
  renderMenu(); // mevcut ürün listeleme ekranın
}

/* --- Ürün listeleme ekranı (tabs + search) --- */
function renderMenu(){
  const el = document.getElementById("app");
  el.innerHTML = `
    <section>
      <div class="searchbar">
        <input id="search" placeholder="Ürün ara… (örn. simit, pasta, çay)" value="${state.q}">
      </div>
      <div class="tabs" id="tabs"></div>
      <div class="grid" id="grid"></div>
    </section>
  `;

  // Kategori sekmeleri
  const tabs = document.getElementById("tabs");
  state.categories.forEach(cat=>{
    const b = document.createElement("button");
    b.className = `tab ${state.activeCategory===cat?"active":""}`;
    b.textContent = cat;
    b.onclick = ()=>{
      state.activeCategory = cat;
      // URL'i de güncellemek istersen:
      if(cat === "Tümü") location.hash = "#/menu";
      else location.hash = `#/menu/${encodeURIComponent(slugify(cat))}`;
      renderMenu();
    };
    tabs.appendChild(b);
  });

  // Arama
  const s = document.getElementById("search");
  s.addEventListener("input", e=>{ state.q = e.target.value.toLowerCase(); filter(); });

  filter();

  function filter(){
    const grid = document.getElementById("grid");
    const q = state.q.trim();
    const list = state.products.filter(p=>{
      const okCat = state.activeCategory==="Tümü" || p.category===state.activeCategory;
      const okQ = !q || (p.name+p.desc).toLowerCase().includes(q);
      return okCat && okQ;
    });
    grid.innerHTML = "";
    grid.append(...list.map(Card));
  }
}

/* --- İletişim --- */
function renderContact(){
  const el = document.getElementById("app");
  el.innerHTML = `
    <section class="hero">
      <div class="hero-card">
        <h2>İletişim</h2>
        <p><strong>Adres:</strong> …</p>
        <p><strong>Telefon:</strong> <a href="tel:+90XXXXXXXXXX">+90 XXX XXX XX XX</a></p>
        <p><strong>Çalışma Saatleri:</strong> 07:00–23:00</p>
      </div>
      <div class="hero-card">
        <h3>Toplu Sipariş</h3>
        <p>WhatsApp’tan yazın, aynı gün dönüş yapalım.</p>
        <a class="btn" href="https://wa.me/90XXXXXXXXXX" target="_blank">WhatsApp</a>
      </div>
    </section>
  `;
}

/* =========================
   Components
========================= */
function Card(p){
  const el = document.createElement("article");
  el.className = "card";
  const img = p.image || `https://picsum.photos/seed/simit${Math.floor(Math.random()*999)}/800/600`;
  el.innerHTML = `
    <img src="${img}" alt="${p.name}">
    <div class="pad">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>${p.name}</h3>
        <div class="price">${price(p.price)}</div>
      </div>
      ${p.desc?`<p style="margin:.35rem 0;color:#555">${p.desc}</p>`:""}
    </div>
  `;
  return el;
}
