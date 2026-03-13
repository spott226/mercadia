let botStep = 0;
let botCart = [];
let storeWhats = "";
let storeId = "";
let chatbotConfig = null;

/* =================================
OBTENER TIENDA DESDE SUBDOMINIO
================================ */

function getStore(){

const host = window.location.hostname;
const subdomain = host.split(".")[0].toLowerCase();
return subdomain;

}

/* =================================
CARGAR CONFIGURACIÓN
================================ */

document.addEventListener("DOMContentLoaded", async () => {

storeId = getStore();

/* cargar stores */

const storeRes = await fetch("data/stores.json");
const storeData = await storeRes.json();

const storeInfo = storeData.stores.find(
s => s.id.toLowerCase() === storeId
);

if(storeInfo){
storeWhats = storeInfo.whatsapp || "";
}

/* cargar chatbot de la tienda */

try{

const botRes = await fetch(`data/chatbots/${storeId}.json`);
chatbotConfig = await botRes.json();

}catch(e){

chatbotConfig = null;

}

/* activar botón */

const botButton = document.getElementById("chatbot-button");

if(botButton){
botButton.addEventListener("click", toggleBot);
}

});


/* =================================
ABRIR / CERRAR CHATBOT
================================ */

function toggleBot(){

const box = document.getElementById("chatbot-box");

if(!box) return;

if(box.style.display === "block"){
box.style.display = "none";
return;
}

box.style.display = "block";

if(botStep === 0){
botStart();
}

}


/* =================================
PANTALLA INICIAL
================================ */

function botStart(){

botStep = 1;
botCart = [];

const box = document.getElementById("chatbot-box");

/* si la tienda tiene configuración */

if(chatbotConfig && chatbotConfig.menu){

let buttons = "";

chatbotConfig.menu.forEach((item,i)=>{

buttons += `
<button class="bot-info-btn" data-index="${i}">
${item.title}
</button>
`;

});

box.innerHTML = `

<p>👋 ${chatbotConfig.welcome || "¿En qué te puedo ayudar?"}</p>

${buttons}

<button id="bot-ver-productos">
🛒 Ver productos
</button>

<button id="bot-whatsapp-directo">
📲 Hablar por WhatsApp
</button>

`;

document.querySelectorAll(".bot-info-btn")
.forEach(btn => {

btn.addEventListener("click", ()=>{

const index = btn.dataset.index;
botShowInfo(index);

});

});

}else{

box.innerHTML = `

<p>👋 Hola ¿quieres ayuda con tu compra?</p>

<button id="bot-ver-productos">
Ver productos
</button>

<button id="bot-whatsapp-directo">
Hablar por WhatsApp
</button>

`;

}

document
.getElementById("bot-ver-productos")
.addEventListener("click", botCategorias);

document
.getElementById("bot-whatsapp-directo")
.addEventListener("click", botWhatsDirect);

}


/* =================================
MOSTRAR INFORMACIÓN
================================ */

function botShowInfo(index){

const box = document.getElementById("chatbot-box");

const info = chatbotConfig.menu[index];

box.innerHTML = `

<p>${info.text}</p>

<button id="bot-back">
⬅ volver
</button>

`;

document
.getElementById("bot-back")
.addEventListener("click", botStart);

}


/* =================================
CATEGORIAS
================================ */

function botCategorias(){

const box = document.getElementById("chatbot-box");

if(!window.allProducts || window.allProducts.length === 0){

box.innerHTML = `
<p>No encontré productos.</p>
<button id="bot-back-start">Volver</button>
`;

document
.getElementById("bot-back-start")
.addEventListener("click", botStart);

return;

}

const categories = [...new Set(
window.allProducts.map(p => p.category)
)];

let buttons = "";

categories.forEach(cat => {

buttons += `
<button class="bot-cat-btn" data-category="${cat}">
${cat}
</button>
`;

});

box.innerHTML = `

<p>¿Qué tipo de producto buscas?</p>

${buttons}

<button id="bot-back-start">
⬅ volver
</button>

`;

document.querySelectorAll(".bot-cat-btn")
.forEach(btn => {

btn.addEventListener("click", ()=>{

const category = btn.dataset.category;
botProductos(category);

});

});

document
.getElementById("bot-back-start")
.addEventListener("click", botStart);

}


/* =================================
PRODUCTOS
================================ */

function botProductos(category){

const box = document.getElementById("chatbot-box");

const products = window.allProducts.filter(
p => p.category === category
);

let buttons = "";

products.forEach(p => {

buttons += `
<button class="bot-product-btn" data-id="${p.id}">
${p.name} - $${p.price}
</button>
`;

});

box.innerHTML = `

<p>Selecciona un producto:</p>

${buttons}

<button id="bot-back-cat">
⬅ volver
</button>

`;

document.querySelectorAll(".bot-product-btn")
.forEach(btn => {

btn.addEventListener("click", ()=>{

const id = btn.dataset.id;
botAgregarProducto(id);

});

});

document
.getElementById("bot-back-cat")
.addEventListener("click", botCategorias);

}


/* =================================
AGREGAR AL PEDIDO
================================ */

function botAgregarProducto(id){

const product = window.allProducts.find(
p => String(p.id) === String(id)
);

if(!product) return;

botCart.push(product);

botMostrarPedido();

}


/* =================================
MOSTRAR PEDIDO
================================ */

function botMostrarPedido(){

const box = document.getElementById("chatbot-box");

let html = `<p><strong>🛒 Pedido actual</strong></p>`;

let total = 0;

botCart.forEach(p => {

html += `<div>• ${p.name} - $${p.price}</div>`;
total += Number(p.price);

});

html += `

<p><strong>Total: $${total}</strong></p>

<button id="bot-agregar-mas">
➕ Agregar más
</button>

<button id="bot-comprar">
📲 Comprar por WhatsApp
</button>

<button id="bot-vaciar">
🗑 Vaciar pedido
</button>

`;

box.innerHTML = html;

document
.getElementById("bot-agregar-mas")
.addEventListener("click", botCategorias);

document
.getElementById("bot-comprar")
.addEventListener("click", botEnviarPedido);

document
.getElementById("bot-vaciar")
.addEventListener("click", botVaciar);

}


/* =================================
ENVIAR PEDIDO
================================ */

function botEnviarPedido(){

if(!storeWhats) return;

let message = "Hola quiero comprar:%0A%0A";

let total = 0;

botCart.forEach(p => {

message += `• ${p.name} - $${p.price}%0A`;
total += Number(p.price);

});

message += `%0ATotal: $${total}`;

window.open(
`https://wa.me/${storeWhats}?text=${message}`,
"_blank"
);

}


/* =================================
VACIAR
================================ */

function botVaciar(){

botCart = [];
botCategorias();

}


/* =================================
WHATSAPP DIRECTO
================================ */

function botWhatsDirect(){

if(!storeWhats) return;

window.open(
`https://wa.me/${storeWhats}`,
"_blank"
);

}