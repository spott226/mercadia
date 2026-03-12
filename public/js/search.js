/* ===============================
BUSCADOR DE PRODUCTOS
================================ */

function searchProducts(){

const input = document
.getElementById("search-input")
.value
.toLowerCase();

/* si aún no cargan productos */

if(!window.allProducts || window.allProducts.length === 0) return;

/* filtrar productos */

const filtered = window.allProducts.filter(product =>

(product.name || "").toLowerCase().includes(input) ||
(product.description || "").toLowerCase().includes(input) ||
(product.category || "").toLowerCase().includes(input)

);

/* renderizar resultados */

renderProducts(filtered);

/* bajar a la sección de productos */

const productsSection = document.getElementById("products");

if(productsSection){

productsSection.scrollIntoView({
behavior:"smooth",
block:"start"
});

}

}


/* ===============================
CONECTAR BUSCADOR
================================ */

document.addEventListener("DOMContentLoaded", () => {

const input = document.getElementById("search-input");
const button = document.getElementById("search-btn");

if(button){
button.addEventListener("click", searchProducts);
}

if(!input) return;

/* buscar mientras escribe */

input.addEventListener("input", searchProducts);

/* buscar al presionar ENTER */

input.addEventListener("keypress", (e)=>{

if(e.key === "Enter"){
searchProducts();
}

});

});