// =========================
// CARRITO GLOBAL
// =========================

let cart = [];
let lastAddTime = 0; // evita doble click o doble evento


// =========================
// AGREGAR PRODUCTO
// =========================

function addToCart(id){

// evita duplicación por doble evento
const now = Date.now();
if(now - lastAddTime < 200) return;
lastAddTime = now;

const product = window.allProducts.find(p => p.id === id);

if(!product) return;

const existing = cart.find(item => item.id === id);

if(existing){

existing.quantity += 1;

}else{

cart.push({
id: product.id,
name: product.name,
price: product.price,
image: product.image,
quantity: 1
});

}

updateCartUI();

}


// =========================
// ACTUALIZAR UI CARRITO
// =========================

function updateCartUI(){

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

if(!cartItems) return;

cartItems.innerHTML = "";

let total = 0;
let count = 0;

cart.forEach(item => {

total += item.price * item.quantity;
count += item.quantity;

const div = document.createElement("div");
div.className = "cart-item";

div.innerHTML = `
<img src="${item.image}" width="40">

<div>
${item.name}
<br>
$${item.price} x ${item.quantity}
</div>

<button class="remove-item" data-id="${item.id}">
X
</button>
`;

cartItems.appendChild(div);

});

cartTotal.textContent = "$" + total;
cartCount.textContent = count;


// activar eliminar
document.querySelectorAll(".remove-item").forEach(btn=>{

btn.addEventListener("click",()=>{

const id = parseInt(btn.dataset.id);
removeFromCart(id);

});

});

}


// =========================
// ELIMINAR PRODUCTO
// =========================

function removeFromCart(id){

cart = cart.filter(item => item.id !== id);

updateCartUI();

}


// =========================
// CHECKOUT WHATSAPP
// =========================

function checkoutWhatsApp(){

if(cart.length === 0){
alert("El carrito está vacío");
return;
}

let message = "Hola quiero comprar:%0A%0A";

cart.forEach(item => {

message += `• ${item.name} x${item.quantity} - $${item.price}%0A`;

});

let total = cart.reduce(
(sum,item)=> sum + item.price * item.quantity,0
);

message += `%0ATotal: $${total}`;

const phone = window.storeWhats;

const url = `https://wa.me/${phone}?text=${message}`;

window.open(url,"_blank");

}


// =========================
// HACER FUNCIONES GLOBALES
// =========================

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkoutWhatsApp = checkoutWhatsApp;
window.updateCartUI = updateCartUI;

// =========================
// ACTIVAR BOTON WHATSAPP
// =========================

document.addEventListener("DOMContentLoaded", ()=>{

const checkoutBtn = document.getElementById("checkout-btn");

if(checkoutBtn){

checkoutBtn.addEventListener("click", ()=>{

if(typeof checkoutWhatsApp === "function"){
checkoutWhatsApp();
}

});

}

});
