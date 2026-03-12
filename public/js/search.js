function searchProducts(scroll = false){

const input = document
.getElementById("search-input")
.value
.toLowerCase();

if(!window.allProducts || window.allProducts.length === 0) return;

const filtered = window.allProducts.filter(product =>

(product.name || "").toLowerCase().includes(input) ||
(product.description || "").toLowerCase().includes(input) ||
(product.category || "").toLowerCase().includes(input)

);

renderProducts(filtered);

/* solo bajar si se pide */

if(scroll){

const products = document.getElementById("products");

if(products){

products.scrollIntoView({
behavior:"smooth"
});

}

}

}


/* conectar buscador */

document.addEventListener("DOMContentLoaded", () => {

const input = document.getElementById("search-input");
const button = document.getElementById("search-btn");

if(!input) return;

/* buscar mientras escribe (sin bajar) */

input.addEventListener("input", () => {
searchProducts(false);
});

/* ENTER */

input.addEventListener("keypress",(e)=>{

if(e.key === "Enter"){
searchProducts(true);
}

});

/* botón */

if(button){

button.addEventListener("click", ()=>{
searchProducts(true);
});

}

});