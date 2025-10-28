/* =========================
   GlobGeleneksel Lezzet, Modern Sunum - STATE
========================= */
const state = {
  products: [],
  categories: [],            // [{name, slug}]
  activeCategorySlug: "all", // sadece SLUG tutuyoruz
  q: ""
};

/* =========================
   Sıra (yiyecekler -> içecekler)
   NOTE: Sıra karşılaştırması slug üzerinden yapılır.
========================= */
const ORDER = [
  // YİYECEKLER
  "kahvalti",
  "fit-kahvaltilar",
  "soguk-sandvicler", "soguk-sandvic",
  "simit",
  "pogaca",
  "acma",
  "borekler", "borek", "borek-cesitleri",
  "firindan", "firindan-lezzetler",
  "tek-kisilik-pastalar",
  "sutlu-tatlilar", "sutlu-tatli", "sutlu-tatli-cesitleri",
  "serbetli-tatlilar", "serbetli",
  // İÇECEKLER (sona)
  "kahve",
  "sicak-icecekler", "sicak-icecek",
  "bitki-ve-meyve-caylari",
  "soguk-icecekler", "soguk-icecek"
];
/* Ana sayfada göstereceğimiz en sevilen ürünler (ad ile eşleşir) */
const POPULAR = [
  "Çıtır Simit",
  "Kaşarlı Tost (garnitürlü)",
  "Sütlaç",
  "Americano",
  "Kıymalı Kol Böreği",
  "Bahçıvan Sandviç"
];

/* =========================
   Boot
========================= */
window.addEventListener("hashchange", () => {
  router();
  syncChipbarActive(); // route değişince chipbar'ı güncelle
  closeMenu();         // varsa mobil çekmeceyi kapat
});

window.addEventListener("load", async () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  await loadMenu();
  setupChipbar();      // chipbar eventleri
  initDrawer();        // hamburger/drawer başlat
  router();
  syncChipbarActive(); // ilk yüklemede aktif chip'i boya
});

/* =========================
   PDF'den çıkarılan TÜM ÜRÜNLER
   Görsel yollarını klasörüne göre güncelle:
   image: "public/assets/menu/<kategori>/<dosya>.jpg"
========================= */
const DATA_PDF = [
  // KAHVALTI — Serpme ve tabak kahvaltılar
  { category:"Kahvaltı", name:"Simitçi Fırın Special Serpme (2 Kişilik)", price:"800 TL", image:"public/assets/menu/kahvalti/serpme.png" },
  { category:"Kahvaltı", name:"Gurme Kahvaltı Tabağı", price:"250 TL", image:"public/assets/menu/kahvalti/gurme.png" },
  { category:"Kahvaltı", name:"Hızlı Simit Kahvaltı", price:"120 TL", image:"public/assets/menu/kahvalti/hizli-simit.png" },
  { category:"Kahvaltı", name:"Söğüş Tabağı", price:"70 TL", image:"public/assets/menu/kahvalti/sogus.png" },

  // SICAKLAR
  { category:"Sıcaklar", name:"Menemen (Klasik)", price:"100 TL", image:"public/assets/menu/sicaklar/menemen-klasik.png" },
  { category:"Sıcaklar", name:"Menemen (Kaşarlı)", price:"150 TL", image:"public/assets/menu/sicaklar/menemen-kasarli.png" },
  { category:"Sıcaklar", name:"Menemen (Sucuklu)", price:"175 TL", image:"public/assets/menu/sicaklar/menemen-sucuklu.png" },
  { category:"Sıcaklar", name:"Sahanda Yumurta (Klasik)", price:"100 TL", image:"public/assets/menu/sicaklar/sahanda-klasik.png" },
  { category:"Sıcaklar", name:"Sahanda Yumurta (Sucuklu)", price:"170 TL", image:"public/assets/menu/sicaklar/sahanda-sucuklu.png" },
  { category:"Sıcaklar", name:"Patates Kızartması", price:"75 TL", image:"public/assets/menu/sicaklar/patates.jpg" },

  // FİT KAHVALTILAR
  { category:"Fit Kahvaltılar", name:"Fit Avokado Tabağı", image:"public/assets/menu/fit/avokado.png" },
  { category:"Fit Kahvaltılar", name:"Granola Bowl", image:"public/assets/menu/fit/granola.png" },

  // TOST ÇEŞİTLERİ
  { category:"Tost Çeşitleri", name:"Kaşarlı Tost (garnitürlü)", price:"110 TL", image:"public/assets/menu/tost-cesitleri/kasarli.png" },
  { category:"Tost Çeşitleri", name:"Karışık Tost (garnitürlü)", price:"150 TL", image:"public/assets/menu/tost-cesitleri/karisik.png" },
  { category:"Tost Çeşitleri", name:"Kavurmalı Kaşarlı Tost (garnitürlü)", price:"180 TL", image:"public/assets/menu/tost-cesitleri/kavurmali.png" },

  // SOĞUK SANDVİÇLER
  { category:"Soğuk Sandviçler", name:"Bahçıvan Sandviç", price:"80 TL", image:"public/assets/menu/sandvic/bahcivan.jpg" },
  { category:"Soğuk Sandviçler", name:"Klasik Sandviç", price:"90 TL", image:"public/assets/menu/sandvic/klasik.jpg" },
  { category:"Soğuk Sandviçler", name:"Tonbalıklı Sandviç", price:"180 TL", image:"public/assets/menu/sandvic/ton.jpg" },
  { category:"Soğuk Sandviçler", name:"Gurme Simit Sandviç", price:"130 TL", image:"public/assets/menu/sandvic/urme-simit.jpg" },
  { category:"Soğuk Sandviçler", name:"Avokadolu Sandviç", price:"150 TL", image:"public/assets/menu/sandvic/avokado.jpg" },

  // SİMİT ÇEŞİTLERİ
  { category:"Simit Çeşitleri", name:"Çıtır Simit", price:"20 TL", image:"public/assets/menu/simit/citir.png" },
  { category:"Simit Çeşitleri", name:"Tereyağlı Simit", price:"25 TL", image:"public/assets/menu/simit/tereyagli.png" },
  { category:"Simit Çeşitleri", name:"Çikolatalı Simit", price:"30 TL", image:"public/assets/menu/simit/cikolatali.png" },
  { category:"Simit Çeşitleri", name:"Zeytinli Simit", price:"30 TL", image:"public/assets/menu/simit/zeytinli.png" },
  { category:"Simit Çeşitleri", name:"Kaşarlı Simit", price:"30 TL", image:"public/assets/menu/simit/kasarli.png" },
  { category:"Simit Çeşitleri", name:"Sucuklu Simit", price:"30 TL", image:"public/assets/menu/simit/sucuklu.png" },
  { category:"Simit Çeşitleri", name:"Tahinli Simit", price:"30 TL", image:"public/assets/menu/simit/tahinli.png" },
  { category:"Simit Çeşitleri", name:"Pizza Simit", price:"80 TL", image:"public/assets/menu/simit/pizza.png" },

  // BÖREK ÇEŞİTLERİ
  { category:"Börek Çeşitleri", name:"Kıymalı Kol Böreği", price:"125 TL", image:"public/assets/menu/borek/kiymali-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Peynirli Kol Böreği", price:"125 TL", image:"public/assets/menu/borek/peynirli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Patatesli Kol Böreği", price:"125 TL", image:"public/assets/menu/borek/patatesli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Ispanaklı Kol Böreği", price:"125 TL", image:"public/assets/menu/borek/ispanakli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Su Böreği", price:"125 TL", image:"public/assets/menu/borek/su-boregi.jpg" },
  { category:"Börek Çeşitleri", name:"Kürt Böreği", price:"125 TL", image:"public/assets/menu/borek/kurt-boregi.png" },
  { category:"Börek Çeşitleri", name:"Kıymalı Kol Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/kiymali-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Peynirli Kol Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/peynirli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Patatesli Kol Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/patatesli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Ispanaklı Kol Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/ispanakli-kol.jpg" },
  { category:"Börek Çeşitleri", name:"Su Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/su-boregi.jpg" },
  { category:"Börek Çeşitleri", name:"Kürt Böreği(kg)", price:"500 TL", image:"public/assets/menu/borek/kurt-boregi.png" },

  // POĞAÇA ÇEŞİTLERİ
  { category:"Poğaça Çeşitleri", name:"Sade Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/sade.jpg" },
  { category:"Poğaça Çeşitleri", name:"Peynirli Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/peynirli.jpg" },
  { category:"Poğaça Çeşitleri", name:"Patatesli Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/patatesli.jpg" },
  { category:"Poğaça Çeşitleri", name:"Zeytinli Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/zeytinli.jpg" },
  { category:"Poğaça Çeşitleri", name:"Kaşarlı Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/kasarli.jpg" },
  { category:"Poğaça Çeşitleri", name:"Dereotlu Poğaça", price:"20 TL", image:"public/assets/menu/pogaca/dereotlu.png" },

  // AÇMA ÇEŞİTLERİ
  { category:"Açma Çeşitleri", name:"Sade Açma", price:"20 TL", image:"public/assets/menu/acma/sade.png" },
  { category:"Açma Çeşitleri", name:"Peynirli Açma", price:"20 TL", image:"public/assets/menu/acma/peynirli.png" },
  { category:"Açma Çeşitleri", name:"Patatesli Açma", price:"20 TL", image:"public/assets/menu/acma/patatesli.png" },
  { category:"Açma Çeşitleri", name:"Zeytinli Açma", price:"20 TL", image:"public/assets/menu/acma/zeytinli.png" },
  { category:"Açma Çeşitleri", name:"Kaşarlı Açma", price:"20 TL", image:"public/assets/menu/acma/kasarli.png" },
  { category:"Açma Çeşitleri", name:"Salam Kaşarlı Açma", price:"30 TL", image:"public/assets/menu/acma/salam-kasarli.png" },
  { category:"Açma Çeşitleri", name:"Çikolatalı Açma", price:"20 TL", image:"public/assets/menu/acma/cikolatali.png" },

  // FIRINDAN LEZZETLER
  { category:"Fırından Lezzetler", name:"Tahinli Çörek", price:"80 TL", image:"public/assets/menu/firindan/tahinli-corek.png" },
  { category:"Fırından Lezzetler", name:"Ay Çöreği", price:"40 TL", image:"public/assets/menu/firindan/ay-coregi.png" },
  { category:"Fırından Lezzetler", name:"Kete", price:"40 TL", image:"public/assets/menu/firindan/kete.png" },
  { category:"Fırından Lezzetler", name:"İzmir Bombası", price:"40 TL", image:"public/assets/menu/firindan/izmir-bombasi.png" },
  { category:"Fırından Lezzetler", name:"Üzümlü Kesme", price:"50 TL", image:"public/assets/menu/firindan/uzumlu-kesme.png" },
  { category:"Fırından Lezzetler", name:"Çatal Kurabiye", price:"50 TL", image:"public/assets/menu/firindan/catal.png" },
  { category:"Fırından Lezzetler", name:"Şam Kurabiyesi", price:"50 TL", image:"public/assets/menu/firindan/sam-kurabiye.png" },
  { category:"Fırından Lezzetler", name:"Elmalı Turta", price:"50 TL", image:"public/assets/menu/firindan/elmali-turta.png" },
  { category:"Fırından Lezzetler", name:"Elmalı Turt", price:"80 TL", image:"public/assets/menu/firindan/elmali-turt.png" },
  { category:"Fırından Lezzetler", name:"Muffin Kek", price:"50 TL", image:"public/assets/menu/firindan/muffin.png" },
  { category:"Fırından Lezzetler", name:"Selanik Gevreği", price:"75 TL", image:"public/assets/menu/firindan/selanik-gevregi.png" },
  { category:"Fırından Lezzetler", name:"Beze", price:"75 TL", image:"public/assets/menu/firindan/beze.png" },
  { category:"Fırından Lezzetler", name:"Susamlı Çubuk", price:"75 TL", image:"public/assets/menu/firindan/susamli-cubuk.png" },
  { category:"Fırından Lezzetler", name:"Un Kurabiyesi", price:"50 TL", image:"public/assets/menu/firindan/un-kurabiyesi.png" },

  // KURABİYE (Kuru Pasta Çeşitleri)
  { category:"Kurabiye", name:"Tatlı Kurabiye (250 g)", price:"125 TL", image:"public/assets/menu/kurabiye/tatli-250.png" },
  { category:"Kurabiye", name:"Tuzlu Kurabiye (250 g)", price:"100 TL", image:"public/assets/menu/kurabiye/tuzlu-250.png" },
  { category:"Kurabiye", name:"Karışık Kurabiye (250 g)", price:"110 TL", image:"public/assets/menu/kurabiye/karisik-250.png" },
  { category:"Kurabiye", name:"Special Kurabiye (250 g)", price:"200 TL", image:"public/assets/menu/kurabiye/special-250.png" },
  { category:"Kurabiye", name:"Kiloluk Tuzlu Kuru Pasta", price:"400 TL", image:"public/assets/menu/kurabiye/tuzlu-250.png" },
  { category:"Kurabiye", name:"Kiloluk Tatlı Kuru Pasta", price:"500 TL", image:"public/assets/menu/kurabiye/tatli-250.png" },
  { category:"Kurabiye", name:"Kiloluk Special Kuru Pasta", price:"800 TL", image:"public/assets/menu/kurabiye/special-250.png" },

  // SÜTLÜ TATLILAR
  { category:"Sütlü Tatlılar", name:"Sütlaç", price:"80 TL", image:"public/assets/menu/sutlu/sutlac.png" },
  { category:"Sütlü Tatlılar", name:"Islak Kek", price:"80 TL", image:"public/assets/menu/sutlu/islak-kek.png" },
  { category:"Sütlü Tatlılar", name:"Kıbrıs Tatlısı", price:"80 TL", image:"public/assets/menu/sutlu/kibris.png" },
  { category:"Sütlü Tatlılar", name:"Profiterol", price:"120 TL", image:"public/assets/menu/sutlu/profiterol.png" },
  { category:"Sütlü Tatlılar", name:"Trileçe (Karamelli/Frambuazlı)", price:"100 TL", image:"public/assets/menu/sutlu/trilece.png" },
  { category:"Sütlü Tatlılar", name:"Magnolya (Lotus/Çilek/Muz/Oreo)", price:"120 TL", image:"public/assets/menu/sutlu/magnolia.png" },
  { category:"Sütlü Tatlılar", name:"Supangle", price:"120 TL", image:"public/assets/menu/sutlu/supangle.png" },
  { category:"Sütlü Tatlılar", name:"Browni", price:"150 TL", image:"public/assets/menu/sutlu/browni.png" },
  { category:"Sütlü Tatlılar", name:"Kaşık Pasta (Çilek/Orman Meyve)", price:"120 TL", image:"public/assets/menu/sutlu/kasik-pasta.png" },
  { category:"Sütlü Tatlılar", name:"Tiramisu", price:"100 TL", image:"public/assets/menu/sutlu/tiramisu.png" },
  { category:"Sütlü Tatlılar", name:"Ekler (Porsiyon)", price:"130 TL", image:"public/assets/menu/sutlu/ekler.png" },
  { category:"Sütlü Tatlılar", name:"Muzlu–Çilekli Sarma (Porsiyon)", price:"130 TL", image:"public/assets/menu/sutlu/muzlu-cilekli-sarma.png" },
  { category:"Sütlü Tatlılar", name:"Karışık Petifür (Porsiyon)", price:"130 TL", image:"public/assets/menu/sutlu/petifur.png" },

  // TEK KİŞİLİK PASTALAR
  { category:"Tek Kişilik Pastalar", name:"Karışık Meyveli", price:"140 TL", image:"public/assets/menu/pasta/k-meyveli.png" },
  { category:"Tek Kişilik Pastalar", name:"Çikolatalı", price:"140 TL", image:"public/assets/menu/pasta/cikolatali.png" },
  { category:"Tek Kişilik Pastalar", name:"Krokanlı", price:"140 TL", image:"public/assets/menu/pasta/krokan.png" },
  { category:"Tek Kişilik Pastalar", name:"Çilekli", price:"140 TL", image:"public/assets/menu/pasta/cilekli.png" },
  { category:"Tek Kişilik Pastalar", name:"Çilekli Çikolatalı", price:"140 TL", image:"public/assets/menu/pasta/cilekli-cikolatali.png" },
  { category:"Tek Kişilik Pastalar", name:"Fıstık Çikolatalı", price:"140 TL", image:"public/assets/menu/pasta/fistik-cik.png" },
  { category:"Tek Kişilik Pastalar", name:"Muzlu", price:"140 TL", image:"public/assets/menu/pasta/muzlu.png" },
  { category:"Tek Kişilik Pastalar", name:"Muzlu Çikolatalı", price:"140 TL", image:"public/assets/menu/pasta/muzlu-cikolatali.png" },
  { category:"Tek Kişilik Pastalar", name:"Jakonte", price:"140 TL", image:"public/assets/menu/pasta/jakonte.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Kalpli (Frambuaz/Çikolata)", price:"140 TL", image:"public/assets/menu/pasta/kalpli.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Profiterollü", price:"140 TL", image:"public/assets/menu/pasta/profiterollu.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Malaga Pasta", price:"140 TL", image:"public/assets/menu/pasta/malaga.jpg" },
  // TEK KİŞİLİK PASTALAR (ayrılmış)
  { category:"Tek Kişilik Pastalar", name:"Cardinal",                price:"140 TL", image:"public/assets/menu/pasta/cardinal.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Ballı",                   price:"140 TL", image:"public/assets/menu/pasta/balli.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Velvet",                  price:"140 TL", image:"public/assets/menu/pasta/velvet.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Budapeşte",               price:"140 TL", image:"public/assets/menu/pasta/budapeste.png" },
  { category:"Tek Kişilik Pastalar", name:"San Sebastian",           price:"140 TL", image:"public/assets/menu/pasta/san-sebastian.png" },
  { category:"Tek Kişilik Pastalar", name:"Cheese Cake (Limon)",     price:"140 TL", image:"public/assets/menu/pasta/cheesecake-limon.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Cheese Cake (Frambuaz)",  price:"140 TL", image:"public/assets/menu/pasta/cheesecake-frambuaz.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Ibiza",                   price:"140 TL", image:"public/assets/menu/pasta/ibiza.png" },
  { category:"Tek Kişilik Pastalar", name:"Mozaik",                  price:"140 TL", image:"public/assets/menu/pasta/mozaik.jpg" },
  { category:"Tek Kişilik Pastalar", name:"Mois",                    price:"140 TL", image:"public/assets/menu/pasta/mois.png" },

  // PASTALAR (No'lu turtalar)
  { category:"Pastalar", name:"Newyork Pasta 0 no", price:"550 TL", image:"public/assets/menu/pastalar/newyork-pasta.png" },
  { category:"Pastalar", name:"Moblan Pasta (Fıstık - Akışkan Çikolata) 0 no", price:"550 TL", image:"public/assets/menu/pastalar/moblan-fistik.png" },
  { category:"Pastalar", name:"Moblan Pasta (Muzlu - Çilekli) 0 no", price:"550 TL", image:"public/assets/menu/pastalar/moblan-muz-cilek.png" },
  { category:"Pastalar", name:"Hasbahçe (Karışık Meyveli) 0 no", price:"550 TL", image:"public/assets/menu/pastalar/hasbahce.png" },
  { category:"Pastalar", name:"Çilekli 0 no", price:"550 TL", image:"public/assets/menu/pastalar/cilekli.png" },
  { category:"Pastalar", name:"Çilekli Çikolatalı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/cilekli-cikolatali.png" },
  { category:"Pastalar", name:"Muz - Çilek 0 no", price:"550 TL", image:"public/assets/menu/pastalar/muz-cilek.png" },
  { category:"Pastalar", name:"Muzlu 0 no", price:"550 TL", image:"public/assets/menu/pastalar/muzlu.png" },
  { category:"Pastalar", name:"Muzlu Çikolatalı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/muzlu-cikolatali.png" },
  { category:"Pastalar", name:"Orman Meyveli 0 no", price:"550 TL", image:"public/assets/menu/pastalar/orman-meyveli.png" },
  { category:"Pastalar", name:"Orman Meyveli Çikolatalı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/orman-meyveli-cikolatali.png" },
  { category:"Pastalar", name:"Fıstık - Çikolatalı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/fistik-cikolatali.png" },
  { category:"Pastalar", name:"Parça Çikolatalı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/parca-cikolatali.png" },
  { category:"Pastalar", name:"Krokanlı 0 no", price:"550 TL", image:"public/assets/menu/pastalar/krokanli.png" },
  { category:"Pastalar", name:"Lotuslu (Çilekli - Muzlu) 0 no", price:"550 TL", image:"public/assets/menu/pastalar/lotuslu.png" },
  { category:"Pastalar", name:"Çikolata - Kestane 0 no", price:"550 TL", image:"public/assets/menu/pastalar/cikolata-kestane.png" },

  { category:"Pastalar", name:"Newyork Pasta 1 no", price:"650 TL", image:"public/assets/menu/pastalar/newyork-pasta.png" },
  { category:"Pastalar", name:"Moblan Pasta (Fıstık - Akışkan Çikolata) 1 no", price:"650 TL", image:"public/assets/menu/pastalar/moblan-fistik.png" },
  { category:"Pastalar", name:"Moblan Pasta (Muzlu - Çilekli) 1 no", price:"650 TL", image:"public/assets/menu/pastalar/moblan-muz-cilek.png" },
  { category:"Pastalar", name:"Hasbahçe (Karışık Meyveli) 1 no", price:"650 TL", image:"public/assets/menu/pastalar/hasbahce.png" },
  { category:"Pastalar", name:"Çilekli 1 no", price:"650 TL", image:"public/assets/menu/pastalar/cilekli.png" },
  { category:"Pastalar", name:"Çilekli Çikolatalı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/cilekli-cikolatali.png" },
  { category:"Pastalar", name:"Muz - Çilek 1 no", price:"650 TL", image:"public/assets/menu/pastalar/muz-cilek.png" },
  { category:"Pastalar", name:"Muzlu 1 no", price:"650 TL", image:"public/assets/menu/pastalar/muzlu.png" },
  { category:"Pastalar", name:"Muzlu Çikolatalı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/muzlu-cikolatali.png" },
  { category:"Pastalar", name:"Orman Meyveli 1 no", price:"650 TL", image:"public/assets/menu/pastalar/orman-meyveli.png" },
  { category:"Pastalar", name:"Orman Meyveli Çikolatalı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/orman-meyveli-cikolatali.png" },
  { category:"Pastalar", name:"Fıstık - Çikolatalı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/fistik-cikolatali.png" },
  { category:"Pastalar", name:"Parça Çikolatalı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/parca-cikolatali.png" },
  { category:"Pastalar", name:"Krokanlı 1 no", price:"650 TL", image:"public/assets/menu/pastalar/krokanli.png" },
  { category:"Pastalar", name:"Lotuslu (Çilekli - Muzlu) 1 no", price:"650 TL", image:"public/assets/menu/pastalar/lotuslu.png" },
  { category:"Pastalar", name:"Çikolata - Kestane 1 no", price:"650 TL", image:"public/assets/menu/pastalar/cikolata-kestane.png" },

  { category:"Pastalar", name:"Newyork Pasta 2 no", price:"750 TL", image:"public/assets/menu/pastalar/newyork-pasta.png" },
  { category:"Pastalar", name:"Moblan Pasta (Fıstık - Akışkan Çikolata) 2 no", price:"750 TL", image:"public/assets/menu/pastalar/moblan-fistik.png" },
  { category:"Pastalar", name:"Moblan Pasta (Muzlu - Çilekli) 2 no", price:"750 TL", image:"public/assets/menu/pastalar/moblan-muz-cilek.png" },
  { category:"Pastalar", name:"Hasbahçe (Karışık Meyveli) 2 no", price:"750 TL", image:"public/assets/menu/pastalar/hasbahce.png" },
  { category:"Pastalar", name:"Çilekli 2 no", price:"750 TL", image:"public/assets/menu/pastalar/cilekli.png" },
  { category:"Pastalar", name:"Çilekli Çikolatalı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/cilekli-cikolatali.png" },
  { category:"Pastalar", name:"Muz - Çilek 2 no", price:"750 TL", image:"public/assets/menu/pastalar/muz-cilek.png" },
  { category:"Pastalar", name:"Muzlu 2 no", price:"750 TL", image:"public/assets/menu/pastalar/muzlu.png" },
  { category:"Pastalar", name:"Muzlu Çikolatalı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/muzlu-cikolatali.png" },
  { category:"Pastalar", name:"Orman Meyveli 2 no", price:"750 TL", image:"public/assets/menu/pastalar/orman-meyveli.png" },
  { category:"Pastalar", name:"Orman Meyveli Çikolatalı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/orman-meyveli-cikolatali.png" },
  { category:"Pastalar", name:"Fıstık - Çikolatalı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/fistik-cikolatali.png" },
  { category:"Pastalar", name:"Parça Çikolatalı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/parca-cikolatali.png" },
  { category:"Pastalar", name:"Krokanlı 2 no", price:"750 TL", image:"public/assets/menu/pastalar/krokanli.png" },
  { category:"Pastalar", name:"Lotuslu (Çilekli - Muzlu) 2 no", price:"750 TL", image:"public/assets/menu/pastalar/lotuslu.png" },
  { category:"Pastalar", name:"Çikolata - Kestane 2 no", price:"750 TL", image:"public/assets/menu/pastalar/cikolata-kestane.png" },

  // ŞERBETLİ TATLILAR
  { category:"Şerbetli Tatlılar", name:"Kare Fıstıklı Kadayıf (Porsiyon)", price:"250 TL", image:"public/assets/menu/serbetli/kare-fistikli-kadayif.png" },
  { category:"Şerbetli Tatlılar", name:"Kare Cevizli Kadayıf (Porsiyon)", price:"120 TL", image:"public/assets/menu/serbetli/kare-cevizli-kadayif.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Baklava (Porsiyon)", price:"120 TL", image:"public/assets/menu/serbetli/cevizli-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Kuru Baklava (Porsiyon)", price:"250 TL", image:"public/assets/menu/serbetli/kuru-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Sarı Burma (Cevizli) (Porsiyon)", price:"150 TL", image:"public/assets/menu/serbetli/sari-burma.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Midye (Porsiyon)", price:"150 TL", image:"public/assets/menu/serbetli/cevizli-midye.png" },
  { category:"Şerbetli Tatlılar", name:"Bülbül Yuvası (Porsiyon)", price:"150 TL", image:"public/assets/menu/serbetli/bulbul-yuvasi.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Sultan (Porsiyon)", price:"120 TL", image:"public/assets/menu/serbetli/cevizli-sultan.png" },
  { category:"Şerbetli Tatlılar", name:"Fıstıklı Havuç Dilim (Porsiyon)", price:"250 TL", image:"public/assets/menu/serbetli/havuc-dilim.jpg" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Ev Baklavası (Porsiyon)", price:"120 TL", image:"public/assets/menu/serbetli/cevizli-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Soğuk Fıstıklı Baklava (Porsiyon)", price:"200 TL", image:"public/assets/menu/serbetli/soguk-fistikli.png" },
  { category:"Şerbetli Tatlılar", name:"Soğuk Fındıklı Baklava (Porsiyon)", price:"150 TL", image:"public/assets/menu/serbetli/soguk-findikli.png" },
  { category:"Şerbetli Tatlılar", name:"Şekerpare (Porsiyon)", price:"0 TL", image:"public/assets/menu/serbetli/sekerpare.png" },

  { category:"Şerbetli Tatlılar", name:"Kare Fıstıklı Kadayıf KG", price:"1000 TL",image:"public/assets/menu/serbetli/kare-fistikli-kadayif.png" },
  { category:"Şerbetli Tatlılar", name:"Kare Cevizli Kadayıf KG", price:"500 TL", image:"public/assets/menu/serbetli/kare-cevizli-kadayif.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Baklava KG", price:"450 TL", image:"public/assets/menu/serbetli/cevizli-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Kuru Baklava KG", price:"1000 TL", image:"public/assets/menu/serbetli/kuru-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Sarı Burma (Cevizli)KG", price:"600 TL", image:"public/assets/menu/serbetli/sari-burma.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Midye KG", price:"600 TL", image:"public/assets/menu/serbetli/cevizli-midye.png" },
  { category:"Şerbetli Tatlılar", name:"Bülbül Yuvası KG", price:"550 TL", image:"public/assets/menu/serbetli/bulbul-yuvasi.png" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Sultan KG", price:"450 TL", image:"public/assets/menu/serbetli/cevizli-sultan.png" },
  { category:"Şerbetli Tatlılar", name:"Fıstıklı Havuç Dilim KG", price:"1000 TL", image:"public/assets/menu/serbetli/havuc-dilim.jpg" },
  { category:"Şerbetli Tatlılar", name:"Cevizli Ev Baklavası KG", price:"450 TL", image:"public/assets/menu/serbetli/cevizli-baklava.png" },
  { category:"Şerbetli Tatlılar", name:"Soğuk Fıstıklı Baklava KG", price:"700 TL", image:"public/assets/menu/serbetli/soguk-fistikli.png" },
  { category:"Şerbetli Tatlılar", name:"Soğuk Fındıklı Baklava KG", price:"500 TL", image:"public/assets/menu/serbetli/soguk-findikli.png" },
  { category:"Şerbetli Tatlılar", name:"Şekerpare KG", price:"250 TL", image:"public/assets/menu/serbetli/sekerpare.png" },

  // KAHVE (sıcak + soğuk)
  { category:"Kahve", name:"Espresso Single", price:"90 TL", image:"public/assets/menu/kahve/espresso.png" },
  { category:"Kahve", name:"Espresso Double", price:"110 TL", image:"public/assets/menu/kahve/espresso.png" },
  { category:"Kahve", name:"Americano", price:"120 TL", image:"public/assets/menu/kahve/americano.png" },
  { category:"Kahve", name:"Filtre Kahve", price:"120 TL", image:"public/assets/menu/kahve/filtre.png" },
  { category:"Kahve", name:"Latte", price:"130 TL", image:"public/assets/menu/kahve/latte.png" },
  { category:"Kahve", name:"Cappuccino", price:"130 TL", image:"public/assets/menu/kahve/latte.png" },
  { category:"Kahve", name:"Flat White", price:"130 TL", image:"public/assets/menu/kahve/latte.png" },
  { category:"Kahve", name:"Macchiato", price:"130 TL", image:"public/assets/menu/kahve/latte.png" },
  { category:"Kahve", name:"Cortado", price:"130 TL", image:"public/assets/menu/kahve/latte.png" },
  { category:"Kahve", name:"Mocha", price:"130 TL", image:"public/assets/menu/kahve/mocha.png" },
  { category:"Kahve", name:"White Chocolate Mocha", price:"150 TL", image:"public/assets/menu/kahve/white-mocha.png" },
  { category:"Kahve", name:"Caramel Macchiato", price:"150 TL", image:"public/assets/menu/kahve/caramel-macchiato.png" },
  { category:"Kahve", name:"Toffee Nut Latte", price:"150 TL", image:"public/assets/menu/kahve/caramel-macchiato.png" },
  { category:"Kahve", name:"Vanilla Latte", price:"150 TL", image:"public/assets/menu/kahve/vanilla-latte.png" },
  { category:"Kahve", name:"Caramel Latte", price:"150 TL", image:"public/assets/menu/kahve/caramel-macchiato.png" },
  { category:"Kahve", name:"Pumpkin Spice Latte", price:"150 TL", image:"public/assets/menu/kahve/psl.png" },
  // Iced & Cold Brew
  { category:"Kahve", name:"Iced Americano", price:"120 TL", image:"public/assets/menu/kahve/iced-americano.png" },
  { category:"Kahve", name:"Iced Filtre", price:"120 TL", image:"public/assets/menu/kahve/iced-filtre.png" },
  { category:"Kahve", name:"Iced Latte", price:"130 TL", image:"public/assets/menu/kahve/iced-latte.png" },
  { category:"Kahve", name:"Iced Caramel Macchiato", price:"150 TL", image:"public/assets/menu/kahve/iced-caramel-macchiato.png" },
  { category:"Kahve", name:"Iced Mocha", price:"130 TL", image:"public/assets/menu/kahve/iced-mocha.png" },
  { category:"Kahve", name:"Iced White Chocolate Mocha", price:"150 TL", image:"public/assets/menu/kahve/iced-white-mocha.png" },
  { category:"Kahve", name:"Iced Toffee Nut Latte", price:"150 TL", image:"public/assets/menu/kahve/iced-latte.png" },
  { category:"Kahve", name:"Türk Kahvesi", price:"70 TL", image:"public/assets/menu/kahve/turk-kahvesi.png" },
  { category:"Kahve", name:"Türk Kahvesi Double", price:"110 TL", image:"public/assets/menu/kahve/turk-kahvesi.png" },

  // SICAK İÇECEKLER (kahveler hariç)
  { category:"Sıcak İçecekler", name:"Bardak Çay",       price:"20 TL", image:"public/assets/menu/sicak-icecekler/bardak-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Fincan Çay",       price:"40 TL", image:"public/assets/menu/sicak-icecekler/fincan-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Yeşil Çay",        price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Yasemin Çayı",     price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Rezene Çayı",      price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Ihlamur",          price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Nane Limon",       price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Ada Çayı",         price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Papatya Çayı",     price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Kış Çayı",         price:"40 TL", image:"public/assets/menu/sicak-icecekler/kis.jpg" },
  { category:"Sıcak İçecekler", name:"Elma Çayı",        price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Elma Tarçın",      price:"40 TL", image:"public/assets/menu/sicak-icecekler/yesil-cay.jpg" },
  { category:"Sıcak İçecekler", name:"Kuşburnu",         price:"40 TL", image:"public/assets/menu/sicak-icecekler/kis.jpg" },
  { category:"Sıcak İçecekler", name:"Böğürtlen",        price:"40 TL", image:"public/assets/menu/sicak-icecekler/kis.jpg" },

  { category:"Sıcak İçecekler", name:"Salep",            price:"—",     image:"public/assets/menu/sicak-icecekler/salep.jpg" },
  { category:"Sıcak İçecekler", name:"Sıcak Çikolata",   price:"—",     image:"public/assets/menu/sicak-icecekler/sicak-cikolata.jpg" },

  // SOĞUK İÇECEKLER
  { category:"Soğuk İçecekler", name:"Su (0.5 lt)", price:"10 TL", image:"public/assets/menu/soguk-icecek/su-05.jpg" },
  { category:"Soğuk İçecekler", name:"Teneke Coca Cola (330 ml)", price:"50 TL", image:"public/assets/menu/soguk-icecek/cola-330.jpg" },
  { category:"Soğuk İçecekler", name:"Şişe Coca Cola", price:"30 TL", image:"public/assets/menu/soguk-icecek/cola-sise.jpg" },
  { category:"Soğuk İçecekler", name:"Cola Turka", price:"40 TL", image:"public/assets/menu/soguk-icecek/colaturka.jpg" },
  { category:"Soğuk İçecekler", name:"Fanta (330 ml)", price:"50 TL", image:"public/assets/menu/soguk-icecek/fanta-330.jpg" },
  { category:"Soğuk İçecekler", name:"Cappy (330 ml)", price:"50 TL", image:"public/assets/menu/soguk-icecek/cappy-330.jpg" },
  { category:"Soğuk İçecekler", name:"Redbull (250 ml)", price:"60 TL", image:"public/assets/menu/soguk-icecek/redbull-250.jpg" },
  { category:"Soğuk İçecekler", name:"Didi (250 ml)", price:"30 TL", image:"public/assets/menu/soguk-icecek/didi-250.jpg" },
  { category:"Soğuk İçecekler", name:"Lipton Ice Tea (330 ml)", price:"50 TL", image:"public/assets/menu/soguk-icecek/lipton-330.jpg" },
  { category:"Soğuk İçecekler", name:"Beypazarı Soda (200 ml)", price:"20 TL", image:"public/assets/menu/soguk-icecek/beypazari-200.jpg" },
  { category:"Soğuk İçecekler", name:"Meyveli Soda Çeşitleri (200 ml)", price:"30 TL", image:"public/assets/menu/soguk-icecek/meyveli-soda-200.jpg" },
  { category:"Soğuk İçecekler", name:"Ayran (200 ml)", price:"20 TL", image:"public/assets/menu/soguk-icecek/ayran-200.jpg" },
  { category:"Soğuk İçecekler", name:"Niğde Gazoz", price:"30 TL", image:"public/assets/menu/soguk-icecek/nigde-gazoz.jpg" },
  { category:"Soğuk İçecekler", name:"Uludağ Limonata (330 ml)", price:"40 TL", image:"public/assets/menu/soguk-icecek/limonata-330.jpg" },
  { category:"Soğuk İçecekler", name:"Capri Sun", price:"20 TL", image:"public/assets/menu/soguk-icecek/capri-sun.jpg" },
  { category:"Soğuk İçecekler", name:"Meysu Nektarı", price:"20 TL", image:"public/assets/menu/soguk-icecek/meysu.jpg" },
  { category:"Soğuk İçecekler", name:"Link (200 ml)", price:"20 TL", image:"public/assets/menu/soguk-icecek/link-200.jpg" },
  { category:"Soğuk İçecekler", name:"İçim Süt (180 ml)", price:"20 TL", image:"public/assets/menu/soguk-icecek/icim-180.jpg" },
  { category:"Soğuk İçecekler", name:"Coca Cola (1 lt)", price:"60 TL", image:"public/assets/menu/soguk-icecek/cola-25.jpg" },
  { category:"Soğuk İçecekler", name:"Fanta (1 lt)", price:"60 TL", image:"public/assets/menu/soguk-icecek/fanta-25.jpg" },
  { category:"Soğuk İçecekler", name:"Uludağ Limonata (1 lt)", price:"60 TL", image:"public/assets/menu/soguk-icecek/limonata-1lt.jpg" },
  { category:"Soğuk İçecekler", name:"Meysu (1 lt)", price:"60 TL", image:"public/assets/menu/soguk-icecek/meysu-1lt.jpg" },
  { category:"Soğuk İçecekler", name:"Didi (2.5 lt)", price:"80 TL", image:"public/assets/menu/soguk-icecek/didi-25.jpg" },
  { category:"Soğuk İçecekler", name:"Coca Cola (2.5 lt)", price:"100 TL", image:"public/assets/menu/soguk-icecek/cola-25.jpg" },
  { category:"Soğuk İçecekler", name:"Fanta (2.5 lt)", price:"100 TL", image:"public/assets/menu/soguk-icecek/fanta-25.jpg" },
  { category:"Soğuk İçecekler", name:"Lipton (1.5 lt)", price:"75 TL", image:"public/assets/menu/soguk-icecek/lipton-15.jpg" },
  { category:"Soğuk İçecekler", name:"Su (1.5 lt)", price:"30 TL", image:"public/assets/menu/soguk-icecek/su-05.jpg" },
];

/* =========================
   Data loader (inline DATA_PDF)
========================= */
async function loadMenu(){
  try{
    // Ürünlere kategori SLUG'larını da ekle
    state.products = DATA_PDF.map(p => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      return {
        ...p,
        _cats: cats,
        _catSlugs: cats.map(slugify)
      };
    });

    // Kategorileri {name, slug} olarak çıkar
    const seen = new Set();
    const uniq = [];
    state.products.flatMap(p => p._cats).forEach(name => {
      const slug = slugify(name);
      if(!seen.has(slug)){
        seen.add(slug);
        uniq.push({ name, slug });
      }
    });

    // Sıralama
    uniq.sort((a,b) => {
      const ia = ORDER.indexOf(a.slug);
      const ib = ORDER.indexOf(b.slug);
      const A = ia === -1 ? 999 : ia;
      const B = ib === -1 ? 999 : ib;
      if (A !== B) return A - B;
      return a.name.localeCompare(b.name, "tr");
    });

    state.categories = [{name:"Tümü", slug:"all"}, ...uniq];
  }catch(e){
    console.error("DATA_PDF yüklenemedi:", e);
  }
}

/* =========================
   Utils
========================= */
function slugify(s){
  return (s || "")
    .normalize("NFD")                 // birleşik işaretleri ayır
    .toLocaleLowerCase("tr")          // TR kurallarıyla küçült
    .replace(/[\u0300-\u036f]/g, "")  // tüm diakritikleri sil (i̇ -> i)
    .replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i")
    .replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
    .replace(/&/g," ve ")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .trim();
}

function price(n){
  // n sayısal değilse (örn. "120 TL") aynen yaz.
  if (typeof n === "number" && Number.isFinite(n)) {
    return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
  }
  return n ?? "";
}

/* =========================
   Router
========================= */
function router(){
  const hash = (location.hash.replace('#','') || '/');
  const parts = hash.split('/').filter(Boolean); // ['menu','tost-cesitleri'] gibi

  if(parts[0] === 'menu' && parts[1]) {
    state.activeCategorySlug = decodeURIComponent(parts[1]); // sadece SLUG
    renderMenu();
  } else if(parts[0] === 'menu') {
    state.activeCategorySlug = "all";
    renderMenuCategories();                 // Kategori ızgarası
  } else if(parts[0] === 'contact') {
    renderContact();
  } else {
    renderHome();
  }
}

/* =========================
   Chipbar entegrasyonu
========================= */
function setupChipbar(){
  const chips = document.querySelectorAll(".chipbar .chip");
  if(!chips.length) return;

  chips.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = btn.dataset.cat; // örn: kahvalti, sicak-icecekler, all...
      chips.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      location.hash = slug === "all" ? "#/menu" : `#/menu/${slug}`;

      const appEl = document.getElementById("app");
      appEl && appEl.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
}

// route/görünüm değişince chipbar'da aktif olanı boya:
function syncChipbarActive(){
  const chips = document.querySelectorAll(".chipbar .chip");
  if(!chips.length) return;

  const hash = (location.hash.replace('#','') || '/');
  const parts = hash.split('/').filter(Boolean);
  const isMenu = parts[0] === 'menu';
  const currentSlug = (isMenu && parts[1]) ? parts[1] : 'all';

  chips.forEach(b => {
    const match = (b.dataset.cat === currentSlug) ||
                  (!parts[1] && b.dataset.cat === 'all');
    b.classList.toggle("active", !!match);
  });
}

/* =========================
   HAMBURGER / DRAWER (mobil)
========================= */
let _drawerEls = { btn:null, drawer:null, list:null, backdrop:null };

function initDrawer(){
  const btn = document.getElementById('menuToggle');
  const drawer = document.getElementById('chipDrawer');
  if(!btn || !drawer) return;

  const list   = drawer.querySelector('.chip-list');
  const chipbar = document.querySelector('.chipbar');

  // chipbar içeriğini drawer’a kopyala (duplicate HTML yazmamak için)
  if (chipbar && list) list.innerHTML = chipbar.innerHTML;

  // backdrop oluştur
  let backdrop = document.getElementById('backdrop');
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.id = 'backdrop';
    backdrop.className = 'backdrop';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
  }

  function openMenu(){
    drawer.classList.add('open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded','true');
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function _closeMenu(){
    drawer.classList.remove('open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
    backdrop.hidden = true;
    document.body.style.overflow = '';
  }
  // global erişim için:
  window.closeMenu = _closeMenu;

  btn.addEventListener('click', () => {
    drawer.classList.contains('open') ? _closeMenu() : openMenu();
  });
  backdrop.addEventListener('click', _closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') _closeMenu(); });

  // Drawer içindeki chip’e tıklanınca orijinali tetikle + kapat
  drawer.addEventListener('click', (e) => {
    const tapped = e.target.closest('.chip');
    if (!tapped) return;
    const cat = tapped.getAttribute('data-cat');
    const original = document.querySelector(`.chipbar .chip[data-cat="${cat}"]`);
    if (original) original.click();
    _closeMenu();
  });

  _drawerEls = { btn, drawer, list, backdrop };
}
function closeMenu(){
  const { btn, drawer, backdrop } = _drawerEls;
  if (!btn || !drawer || !backdrop) return;
  drawer.classList.remove('open');
  btn.classList.remove('is-open');
  btn.setAttribute('aria-expanded','false');
  backdrop.hidden = true;
  document.body.style.overflow = '';
}

/* =========================
   Views
========================= */
function renderHome(){
  const el = document.getElementById("app");
  el.innerHTML = `
  <section class="hero hero-band">
    <div class="hero-inner">
      <span class="badge">1975'ten beri</span>
      <h2>Geleneksel Lezzet, Modern Sunum</h2>
      <p>Fırından yeni çıkmış simitler, günlük pastalar ve sıcak içecekler.</p>
      <div class="actions">
        <a class="btn" href="#/menu">Menüye Git</a>
        <a class="btn small" href="#/contact">İletişim</a>
      </div>
    </div>
  </section>

  <section class="container">
    <h3 class="home-subtitle">En Sevilenler</h3>
    <div class="grid" id="popular"></div>
  </section>
  `;

  renderPopularGrid();   // ⬅️ ızgarayı doldur
}
function renderPopularGrid(){
  const grid = document.getElementById("popular");
  if(!grid) return;

  // isimle eşleştir, yoksa ilk 6 ürünü göster
  const wanted = new Set(POPULAR.map(s => s.toLowerCase()));
  let items = state.products.filter(p => wanted.has(p.name.toLowerCase()));

  if (items.length === 0) {
    items = state.products.slice(0, 6);
  } else {
    items = items.slice(0, 6);
  }

  grid.innerHTML = "";
  grid.append(...items.map(Card));
}

/* --- Kategori ızgarası (#/menu) --- */
function renderMenuCategories(){
  const el = document.getElementById('app');

  const cats = [
    { name: 'Kahvaltı',                img: 'public/assets/cats/kahvalti.png' },
    { name: 'Sıcaklar',                img: 'public/assets/cats/sicaklar.png' },
    { name: 'Fit Kahvaltılar',         img: 'public/assets/cats/fit.png' },
    { name: 'Tost Çeşitleri',          img: 'public/assets/cats/tost.jpg' },
    { name: 'Soğuk Sandviçler',        img: 'public/assets/cats/sandvic.png' },
    { name: 'Simit Çeşitleri',         img: 'public/assets/cats/simit.png' },
    { name: 'Börek Çeşitleri',         img: 'public/assets/cats/borek.png' },
    { name: 'Poğaça Çeşitleri',        img: 'public/assets/cats/pogaca.png' },
    { name: 'Açma Çeşitleri',          img: 'public/assets/cats/acma.png' },
    { name: 'Fırından Lezzetler',      img: 'public/assets/cats/firindan.png' },
    { name: 'Kurabiye',                img: 'public/assets/cats/kurabiye.jpg' },
    { name: 'Sütlü Tatlılar',          img: 'public/assets/cats/sutlu.png' },
    { name: 'Tek Kişilik Pastalar',    img: 'public/assets/cats/pasta.png' },
    { name: 'Pastalar',                img: 'public/assets/cats/pastalar.jpg' },
    { name: 'Şerbetli Tatlılar',       img: 'public/assets/cats/serbetli.png' },
    { name: 'Kahve',                   img: 'public/assets/cats/kahve.jpg' },
    { name: 'Sıcak İçecekler',         img: 'public/assets/cats/sicak-icecekler.jpg' },
    { name: 'Soğuk İçecekler',         img: 'public/assets/cats/soguk-icecek.png' }
  ];

  el.innerHTML = `
    <section class="cat-grid" aria-label="Kategoriler">
      ${cats.map(c => `
        <a class="cat-card" style="--cat-img:url('${c.img}')"
           href="#/menu/${encodeURIComponent(slugify(c.name))}">
          <span>${c.name.toUpperCase()}</span>
        </a>
      `).join('')}
    </section>
  `;
}

/* --- Ürün listeleme ekranı (arama + grid) --- */
function renderMenu(){
  const el = document.getElementById("app");
  el.innerHTML = `
    <section>
      <div class="searchbar">
        <input id="search" placeholder="Ürün ara… (örn. simit, pasta, çay)" value="${state.q}">
      </div>
      <div class="grid" id="grid"></div>
    </section>
  `;

  // Arama
  const s = document.getElementById("search");
  s.addEventListener("input", e=>{ state.q = e.target.value.toLowerCase(); filter(); });

  filter();

  function filter(){
    const grid = document.getElementById("grid");
    const q = state.q.trim().toLowerCase();

    const list = state.products.filter(p=>{
      const okCat = (state.activeCategorySlug === "all") ||
                    (Array.isArray(p._catSlugs) && p._catSlugs.includes(state.activeCategorySlug));
      const txt = (p.name + " " + (p.desc || "") + " " + (p._cats||[]).join(" ")).toLowerCase();
      const okQ = !q || txt.includes(q);
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
        <p><strong>Adres:ARAPÇEŞME MAHALLESİ KAVAK CADDESİ NO:20B GEBZE/KOCAELİ</strong></p>
        <p><strong>Telefon:</strong> <a href="tel:+905438919499">+90 543 891 94 99</a></p>
        <p><strong>Çalışma Saatleri:</strong> 05:00–23:59</p>
      </div>
      <div class="hero-card">
        <h3>Özel Gün Pasta Siparişi</h3>
        <p>WhatsApp’tan yazın, aynı gün dönüş yapalım.(Sadece sipariş oluşturmak için ve bilgi vermek içindir, eve teslimatımız sadece trendyol üzerinden vardır.)</p>
        <a class="btn" href="https://wa.me/905438919499" target="_blank">WhatsApp</a>
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
  const fallback = `public/assets/placeholder.jpg`;
  const img = p.image || fallback;
  el.innerHTML = `
    <figure class="thumb">
      <img loading="lazy" src="${img}" alt="${p.name}"
           onerror="this.onerror=null;this.src='${fallback}'">
    </figure>
    <div class="pad">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <h3 style="margin:0">${p.name}</h3>
        <div class="price">${price(p.price)}</div>
      </div>
      ${p.desc?`<p style="margin:.35rem 0;color:#555">${p.desc}</p>`:""}
    </div>
  `;
  return el;
}




