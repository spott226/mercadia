// carrito global
let cart = [];

// agregar producto
function addToCart(id){

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

if (typeof toggleCart === "function") {
toggleCart();
}

// actualizar carrito
function updateCartUI(){

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

cartItems.innerHTML = "";

let total = 0;
let count = 0;

cart.forEach(item => {

total += item.price * item.quantity;
count += item.quantity;

cartItems.innerHTML += `
<div class="cart-item">

<img src="${item.image}" width="40">

<div>
${item.name}
<br>
$${item.price} x ${item.quantity}
</div>

<button onclick="removeFromCart(${item.id})">
X
</button>

</div>
`;

});

cartTotal.textContent = "$" + total;
cartCount.textContent = count;

}

// eliminar producto
function removeFromCart(id){

cart = cart.filter(item => item.id !== id);

updateCartUI();

}

// checkout WhatsApp
function checkoutWhatsApp(){

if(cart.length === 0){
alert("El carrito está vacío");
return;
}

let message = "Hola quiero comprar:%0A";

cart.forEach(item => {

message += `• ${item.name} x${item.quantity} - $${item.price}%0A`;

});

let total = cart.reduce(
(sum,item)=> sum + item.price * item.quantity,0
);

message += `%0ATotal: $${total}`;

const phone = "524491234567";

const url = `https://wa.me/${phone}?text=${message}`;

window.open(url,"_blank");

}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkoutWhatsApp = checkoutWhatsApp;
