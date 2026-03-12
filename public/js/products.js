// productos globales
window.allProducts = [];
window.storeWhats = "";

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featured-products");
const categoriesContainer = document.getElementById("categories");

// detectar tienda desde subdominio
function getStoreFromDomain(){
const host = window.location.hostname;
const subdomain = host.split('.')[0];
return subdomain.toLowerCase();
}

const store = getStoreFromDomain();


async function loadProducts(){

// cargar datos de la tienda
const storeRes = await fetch("data/stores.json");
const storeData = await storeRes.json();

const storeInfo = storeData.stores.find(
s => s.id.toLowerCase() === store
);

// si no encuentra tienda
if(!storeInfo){
console.error("No se encontró la tienda:", store);
return;
}

window.storeWhats = storeInfo.whatsapp || "";

document.body.classList.add("theme-" + storeInfo.theme);

const logo = document.getElementById("store-logo");
const name = document.getElementById("store-name");
const hero = document.getElementById("hero");
const bot = document.getElementById("chatbot-button");

if(logo) logo.src = storeInfo.logo;
if(name) name.textContent = storeInfo.name;

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

if(bot && storeInfo.plan === "basic"){
bot.style.display = "none";
}


// cargar productos de esa tienda
const productsRes = await fetch(`data/products/${store}.json`);
const productsData = await productsRes.json();

if(!productsData.products){
console.error("No hay productos en:", store);
return;
}

const storeProducts = productsData.products.filter(p => p.active);

window.allProducts = storeProducts;

generateCategories(storeProducts);
renderFeatured(storeProducts);
renderProducts(storeProducts);

}


// generar categorias
function generateCategories(products){

const cats = [...new Set(products.map(p => p.category))];

categoriesContainer.innerHTML="";

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


// PRODUCTOS DESTACADOS
function renderFeatured(products){

if(!featuredContainer) return;

const featured = products.filter(p => p.featured);

featuredContainer.innerHTML="";

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

activateCartButtons();

}


// TODOS LOS PRODUCTOS
function renderProducts(products){

productsContainer.innerHTML="";

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

activateCartButtons();

}


// activar botones del carrito
function activateCartButtons(){

document.querySelectorAll(".add-cart").forEach(btn=>{

btn.onclick = null;

btn.addEventListener("click",()=>{

const id = parseInt(btn.dataset.id);

if(typeof addToCart === "function"){
addToCart(id);
}

});

});

}


// filtrar por categoria
function filterCategory(cat){

const filtered = window.allProducts.filter(
p => p.category === cat
);

renderProducts(filtered);

document.getElementById("products").scrollIntoView({
behavior:"smooth"
});

}


// buscador
function searchProducts(){

const input = document
.getElementById("search-input")
.value
.toLowerCase();

const filtered = window.allProducts.filter(product =>

product.name.toLowerCase().includes(input) ||
product.description.toLowerCase().includes(input) ||
product.category.toLowerCase().includes(input)

);

renderProducts(filtered);

}


// iniciar
loadProducts();
