// productos globales
window.allProducts = [];

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featured-products");
const categoriesContainer = document.getElementById("categories");


// detectar tienda desde subdominio
function getStoreFromDomain(){

const host = window.location.hostname;

// ejemplo:
// hernandez-snickers.mercadiamx.com

const subdomain = host.split('.')[0];

return subdomain.toLowerCase();

}

const store = getStoreFromDomain();

async function loadProducts(){

const res = await fetch("data/products.json");
const data = await res.json();


// buscar datos de la tienda
const storeData = data.stores.find(s =>
s.id.toLowerCase() === store
);


// cargar nombre, logo, hero y plan
if(storeData){

document.body.classList.add("theme-" + storeData.theme);

const logo = document.getElementById("store-logo");
const name = document.getElementById("store-name");
const hero = document.getElementById("hero");
const bot = document.getElementById("chatbot-button");

if(logo) logo.src = storeData.logo;

if(name) name.textContent = storeData.name;


// HERO DINAMICO
if(hero && storeData.hero){

hero.style.background = `
linear-gradient(
rgba(0,0,0,0.55),
rgba(0,0,0,0.55)
),
url("${storeData.hero}")
`;

hero.style.backgroundSize = "cover";
hero.style.backgroundPosition = "center";
hero.style.backgroundRepeat = "no-repeat";

}


// CONTROL PLAN CHATBOT
if(bot && storeData.plan === "basic"){
bot.style.display = "none";
}

}


// filtrar productos por tienda
const storeProducts = data.products.filter(
p => p.store === store && p.active
);

window.allProducts = storeProducts;

generateCategories(storeProducts);
renderFeatured(storeProducts);
renderProducts(storeProducts);

}



// generar categorias HOME
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



// productos destacados
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

<button onclick="addToCart(${p.id})">
Agregar al carrito
</button>

</div>
`;

});

}

// todos los productos
function renderProducts(products){

productsContainer.innerHTML="";

products.forEach(p=>{

productsContainer.innerHTML += `
<div class="product-card">

<img src="${p.image}" alt="${p.name}">

<h3>${p.name}</h3>

<p>$${p.price}</p>

<button onclick="addToCart(${p.id})">
Agregar al carrito
</button>

</div>
`;

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
