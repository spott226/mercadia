function searchProducts(){

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

}


/* conectar buscador automáticamente */

document.addEventListener("DOMContentLoaded", () => {

const input = document.getElementById("search-input");

if(input){
input.addEventListener("input", searchProducts);
}

});