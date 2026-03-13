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
// (SOLUCIÓN ESTABLE)
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

// cargar info tienda
const storeRes = await fetch("data/stores.json");
const storeData = await storeRes.json();

const storeInfo = storeData.stores.find(
s => s.id.toLowerCase() === store
);

// si no existe tienda
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

if(logo) logo.src = storeInfo.logo;
if(name) name.textContent = storeInfo.name;


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
// CHATBOT SEGUN PLAN
// ===============================

if(bot && storeInfo.plan !== "pro"){
bot.style.display = "none";
}


// ===============================
// PLAN X (SIN BUSCADOR NI CATEGORIAS)
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
// MOSTRAR DESTACADOS
// ===============================

renderFeatured(storeProducts);


// no mostrar todos los productos al inicio
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
// PRODUCTOS DESTACADOS
// ===============================

function renderFeatured(products){

if(!featuredContainer) return;

const featured = products.filter(p => p.featured);

featuredContainer.innerHTML = "";

featured.forEach(p=>{

featuredContainer.innerHTML += `

<div class="product-card">

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
// FILTRAR POR CATEGORIA
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
// INICIAR
// ===============================

loadProducts();