// ===============================
// PRODUCTOS GLOBALES
// ===============================

window.allProducts = [];
window.storeWhats = "";

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featured-products");
const categoriesContainer = document.getElementById("categories");


// ===============================
// DETECTAR TIENDA DESDE SUBDOMINIO
// ===============================

function getStoreFromDomain(){

const host = window.location.hostname;
const subdomain = host.split('.')[0];

return subdomain.toLowerCase();

}

const store = getStoreFromDomain();


// ===============================
// EVENTO GLOBAL PARA BOTON CARRITO
// ===============================

document.addEventListener("click",function(e){

if(e.target.classList.contains("add-cart")){

const id = parseInt(e.target.dataset.id);

if(typeof addToCart === "function"){
addToCart(id);
}else{
console.error("addToCart no está cargado");
}

}

});


// ===============================
// CARGAR PRODUCTOS
// ===============================

async function loadProducts(){

const storeRes = await fetch("data/stores.json");
const storeData = await storeRes.json();

const storeInfo = storeData.stores.find(
s => s.id.toLowerCase() === store
);

if(!storeInfo){
console.error("No se encontró la tienda:", store);
return;
}

window.storeWhats = storeInfo.whatsapp || "";

document.body.classList.add("theme-" + storeInfo.theme);


// ===============================
// DATOS VISUALES TIENDA
// ===============================

const logo = document.getElementById("store-logo");
const name = document.getElementById("store-name");
const hero = document.getElementById("hero");
const bot = document.getElementById("chatbot-button");

const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");

if(logo) logo.src = storeInfo.logo;
if(name) name.textContent = storeInfo.name;

if(heroTitle && storeInfo.heroTitle){
heroTitle.textContent = storeInfo.heroTitle;
}

if(heroSubtitle && storeInfo.heroSubtitle){
heroSubtitle.textContent = storeInfo.heroSubtitle;
}


// ===============================
// HERO
// ===============================

if(hero && storeInfo.hero){

hero.style.background = `
linear-gradient(
rgba(0,0,0,0.55),
rgba(0,0,0,0.55)
),
url("${storeInfo.hero}")
`;

hero.style.backgroundSize = "cover";
hero.style.backgroundPosition = "center";

}


// ===============================
// SECCIONES DINÁMICAS
// ===============================

renderStoreSections(storeInfo);
renderStoreReferences(storeInfo);
renderStoreTrustMessage(storeInfo);
renderStorePayments(storeInfo);


// ===============================
// CHATBOT SEGUN PLAN
// ===============================

if(bot && storeInfo.plan !== "pro"){
bot.style.display = "none";
}


// ===============================
// PLAN X
// ===============================

if(storeInfo.plan === "x"){

const searchBox = document.querySelector(".search-box");
const categoriesSection = document.getElementById("categories");

if(searchBox) searchBox.style.display = "none";
if(categoriesSection) categoriesSection.style.display = "none";

}


// ===============================
// CARGAR PRODUCTOS
// ===============================

const productsRes = await fetch(`data/products/${store}.json`);
const productsData = await productsRes.json();

if(!productsData.products){

console.error("No hay productos en:", store);
return;

}

const storeProducts = productsData.products.filter(p => p.active);

window.allProducts = storeProducts;


// ===============================
// GENERAR CATEGORIAS
// ===============================

if(storeInfo.plan !== "x"){
generateCategories(storeProducts);
}


// ===============================
// DESTACADOS
// ===============================

renderFeatured(storeProducts);

productsContainer.innerHTML = "";

}


// ===============================
// GENERAR CATEGORIAS
// ===============================

function generateCategories(products){

const cats = [...new Set(products.map(p => p.category))];

categoriesContainer.innerHTML = "";

cats.forEach(cat=>{

const div = document.createElement("div");
div.className = "category-card";

div.innerHTML = `<h3>${cat}</h3>`;

div.addEventListener("click",()=>{

filterCategory(cat);

});

categoriesContainer.appendChild(div);

});

}


// ===============================
// DESTACADOS
// ===============================

function renderFeatured(products){

if(!featuredContainer) return;

const featured = products.filter(p => p.featured);

featuredContainer.innerHTML = "";

featured.forEach(p=>{

featuredContainer.innerHTML += `

<div class="product-card">

${p.bestseller ? `<span class="badge bestseller">🔥 Más vendido</span>` : ""}
${p.recommended ? `<span class="badge recommended">⭐ Recomendado</span>` : ""}

<img src="${p.image}" alt="${p.name}">

<h3>${p.name}</h3>

<p>$${p.price}</p>

<button class="add-cart" data-id="${p.id}">
Agregar al carrito
</button>

</div>

`;

});

}

// ===============================
// TODOS LOS PRODUCTOS
// ===============================

function renderProducts(products){

productsContainer.innerHTML = "";

products.forEach(p=>{

productsContainer.innerHTML += `

<div class="product-card">

${p.bestseller ? `<span class="badge bestseller">🔥 Más vendido</span>` : ""}
${p.recommended ? `<span class="badge recommended">⭐ Recomendado</span>` : ""}

<img src="${p.image}" alt="${p.name}">

<h3>${p.name}</h3>

<p>$${p.price}</p>

<button class="add-cart" data-id="${p.id}">
Agregar al carrito
</button>

</div>

`;

});

}


// ===============================
// FILTRAR CATEGORIA
// ===============================

function filterCategory(cat){

const filtered = window.allProducts.filter(
p => p.category === cat
);

renderProducts(filtered);

document.getElementById("products").scrollIntoView({
behavior:"smooth"
});

}


// ===============================
// BUSCADOR
// ===============================

function searchProducts(){

const input = document
.getElementById("search-input")
.value
.toLowerCase();

const filtered = window.allProducts.filter(product =>

(product.name || "").toLowerCase().includes(input) ||
(product.description || "").toLowerCase().includes(input) ||
(product.category || "").toLowerCase().includes(input)

);

renderProducts(filtered);

}


// ===============================
// SECCIONES DE TIENDA
// ===============================

function renderStoreSections(storeInfo){

const container = document.getElementById("store-sections");

if(!container) return;
if(!storeInfo.sections) return;

let html = "";

if(storeInfo.sections.warning){

html += `
<div class="store-section">
<h3>${storeInfo.sections.warning.title}</h3>
<ul>
${storeInfo.sections.warning.items.map(i=>`<li>${i}</li>`).join("")}
</ul>
</div>
`;

}

if(storeInfo.sections.freeTest){

html += `
<div class="store-section">
<h3>${storeInfo.sections.freeTest.title}</h3>
<ul>
${storeInfo.sections.freeTest.items.map(i=>`<li>${i}</li>`).join("")}
</ul>
</div>
`;

}

if(storeInfo.sections.trust){

html += `
<div class="store-section">
<h3>${storeInfo.sections.trust.title}</h3>
<ul>
${storeInfo.sections.trust.items.map(i=>`<li>${i}</li>`).join("")}
</ul>
</div>
`;

}

container.innerHTML = html;

}


// ===============================
// REFERENCIAS
// ===============================

function renderStoreReferences(storeInfo){

const container = document.getElementById("store-references");

if(!container) return;

if(!storeInfo.references || storeInfo.references.length === 0){
container.style.display = "none";
return;
}

let html = `

<h2 style="text-align:center;margin:40px 0;">
Referencias reales
</h2>

<div class="references-carousel">

<div class="references-track">

`;

storeInfo.references.forEach(img => {

html += `<img src="${img}" alt="referencia">`;

});

/* duplicamos para loop infinito */

storeInfo.references.forEach(img => {

html += `<img src="${img}" alt="referencia">`;

});

html += `

</div>

</div>

`;

container.innerHTML = html;

}

// ===============================
// LEYENDA DE CONFIANZA
// ===============================

function renderStoreTrustMessage(storeInfo){

const container = document.getElementById("trust-message");

if(!container) return;
if(!storeInfo.trustMessage) return;

container.innerHTML = `

<div class="store-section">

<h3>${storeInfo.trustMessage.title}</h3>

<p>${storeInfo.trustMessage.text}</p>

</div>

`;

}


// ===============================
// METODOS DE PAGO
// ===============================

function renderStorePayments(storeInfo){

const container = document.getElementById("store-payments");

if(!container) return;
if(!storeInfo.payments) return;

let html = `
<h2 style="text-align:center;margin:30px 0;">Métodos de pago</h2>

<div class="payments-grid">
`;

Object.values(storeInfo.payments).forEach(p=>{

html += `

<div class="payment-card">

<h3>${p.title}</h3>

<p>Banco: ${p.bank}</p>
<p>Número: ${p.number}</p>
<p>A nombre de: ${p.name}</p>

<p><strong>Concepto:</strong> ${p.concept}</p>

<p>${p.note}</p>

</div>

`;

});

html += `</div>`;

container.innerHTML = html;

}


// ===============================
// INICIAR
// ===============================

loadProducts();