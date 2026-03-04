// public/assets/app.js

(() => {

const $ = (id) => document.getElementById(id);

const state = { biz: null, cart: new Map() };

const COOLDOWN_SECONDS = 10;
let cooldownTimer = null;

// =========================
// UTILIDADES
// =========================

const money = (n) =>
Number(n || 0).toLocaleString("es-MX", {
style: "currency",
currency: state.biz?.currency || "MXN",
});

// =========================
// SLUG
// =========================

const getSlug = () => {

const path = location.pathname.replace(/^\/+|\/+$/g, "");

if (!path) return "lunaboutiqueags";

if (path === "luna") return "lunaboutiqueags";
if (path === "f1") return "playerasf1";
if (path === "chelispa") return "chelispa";

return path;

};

// =========================
// CARGAR NEGOCIO
// =========================

async function loadBusiness(slug) {

const res = await fetch(`/business/${slug}.json`, { cache: "no-store" });

if (!res.ok) throw new Error("Negocio no encontrado");

return res.json();

}

// =========================
// LOGO
// =========================

function renderLogo() {

if (!state.biz.logo) return;

const container = $("logoContainer");

container.innerHTML = "";

const img = document.createElement("img");

img.src = state.biz.logo;

img.className = "logo";

container.appendChild(img);

}

// =========================
// MODO REGISTRO
// =========================

function adaptCheckoutMode() {

if (state.biz.checkoutMode !== "registro") return;

[
"street",
"neighborhood",
"zip",
"city",
"state",
"shippingType"
].forEach(id => {

const el = $(id);

if (!el) return;

const parent = el.closest("div");

if (parent) parent.style.display = "none";

});

}

// =========================
// CARRITO
// =========================

function makeCartKey(productId, variants) {

const keys = Object.keys(variants).sort();

return productId + "__" + keys.map(k => `${k}=${variants[k]}`).join("|");

}

// =========================
// RENDER PRODUCTOS
// =========================

function render() {

renderLogo();

$("bizName").textContent = state.biz.name || "Pedido";
$("bizNote").textContent = state.biz.note || "";

const list = $("productList");

list.innerHTML = "";

state.biz.products.forEach((p) => {

const row = document.createElement("div");
row.className = "product";

const image = p.image
? `<img src="${p.image}" class="product-img">`
: "";

const variantsHtml = (p.variants || []).map(v => {

const options = v.options.map(o => {

const name = typeof o === "string" ? o : o.name;

return `<option value="${name}">${name}</option>`;

}).join("");

return `
<label class="label small">${v.type}</label>
<select class="variant-select" data-variant="${v.type}">
${options}
</select>
`;

}).join("");

row.innerHTML = `
<div class="product-left">

${image}

<div class="product-info">

<div class="product-name">${p.name}</div>
<div class="price">${money(p.price)}</div>

${variantsHtml}

<button class="add-variant btn-mini">Agregar</button>

<div class="line-items"></div>

</div>

</div>
`;

const selects = [...row.querySelectorAll(".variant-select")];

const btn = row.querySelector(".add-variant");

const lines = row.querySelector(".line-items");

btn.addEventListener("click", () => {

const variants = {};

selects.forEach(s => variants[s.dataset.variant] = s.value);

const key = makeCartKey(p.id, variants);

const existing = state.cart.get(key);

if (existing) {

existing.qty++;

} else {

state.cart.set(key,{
productId:p.id,
variants,
qty:1
});

}

renderLineItems(lines,p.id);

recalc(true);

});

renderLineItems(lines,p.id);

list.appendChild(row);

});

recalc();

}

// =========================
// LINEAS CARRITO
// =========================

function renderLineItems(container,productId){

container.innerHTML="";

[...state.cart.entries()]
.filter(([k,v])=>v.productId===productId)
.forEach(([key,item])=>{

const row=document.createElement("div");

row.className="line-item";

const variants=Object.entries(item.variants||{})
.map(([k,v])=>`${k}: ${v}`)
.join(" · ");

row.innerHTML=`
<div>${variants}</div>
<input type="number" value="${item.qty}" min="1" class="line-qty">
<button class="line-remove">Quitar</button>
`;

row.querySelector(".line-remove").onclick=()=>{

state.cart.delete(key);

render();

};

row.querySelector(".line-qty").oninput=(e)=>{

item.qty=parseInt(e.target.value||1);

recalc();

};

container.appendChild(row);

});

}

// =========================
// TOTALES
// =========================

function recalc(){

const byId=new Map(state.biz.products.map(p=>[p.id,p]));

let subtotal=0;

for(const[,item] of state.cart){

const p=byId.get(item.productId);

subtotal+=p.price*item.qty;

}

$("subtotal").textContent=money(subtotal);
$("shipping").textContent=money(0);
$("total").textContent=money(subtotal);

return {subtotal,shipping:0,total:subtotal};

}

// =========================
// VALIDAR
// =========================

function validate(){

if(state.cart.size===0) return "Agrega un producto.";

const name=$("customerName").value.trim();
const phone=$("customerPhone").value.trim();

if(!name) return "Ingresa tu nombre.";

if(!phone || phone.length!==10) return "Teléfono inválido.";

return null;

}

// =========================
// WHATSAPP
// =========================

function buildMessage({total}){

const byId=new Map(state.biz.products.map(p=>[p.id,p]));

const items=[];

for(const[,item] of state.cart){

const p=byId.get(item.productId);

items.push(`- ${p.name} x${item.qty}`);

}

return `🧾 Pedido para ${state.biz.name}

Cliente: ${$("customerName").value}
Teléfono: ${$("customerPhone").value}

Productos:
${items.join("\n")}

Total: ${money(total)}`;

}

function openWhatsapp(message){

const phone=state.biz.whatsappPhone.replace(/[^\d]/g,"");

location.href=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

}

// =========================
// INIT
// =========================

async function init(){

try{

const slug=getSlug();

state.biz=await loadBusiness(slug);

adaptCheckoutMode();

document.title=state.biz.name;

$("sendBtn").onclick=()=>{

const err=validate();

if(err){

$("error").textContent=err;

return;

}

const totals=recalc();

const msg=buildMessage(totals);

openWhatsapp(msg);

};

render();

}catch(e){

$("bizName").textContent="Error";

$("bizNote").textContent=e.message;

}

}

init();

})();