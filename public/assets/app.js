// public/assets/app.js
(() => {

const $ = (id)=>document.getElementById(id);

const state = {biz:null,cart:new Map()};

// ==========================
// SEGURIDAD
// ==========================

const COOLDOWN_SECONDS = 10;
let cooldownTimer = null;

const sanitizeText=(v,max=120)=>{
let s=String(v??"");
s=s.replace(/[\u0000-\u001F\u007F-\u009F]/g,"");
s=s.replace(/\s+/g," ").trim();
if(s.length>max)s=s.slice(0,max);
return s;
};

const sanitizePhone=(v,max=15)=>{
let s=String(v??"").replace(/[^\d]/g,"");
if(s.length>max)s=s.slice(0,max);
return s;
};

const startCooldown=(btn)=>{

if(cooldownTimer)return;

let remaining=COOLDOWN_SECONDS;

btn.disabled=true;

const tick=()=>{

if(remaining<=0){
clearInterval(cooldownTimer);
cooldownTimer=null;
btn.disabled=false;
btn.textContent="Enviar pedido por WhatsApp";
return;
}

btn.textContent=`Espera ${remaining}s…`;
remaining--;

};

tick();
cooldownTimer=setInterval(tick,1000);

};

// ==========================
// DINERO
// ==========================

const money=(n)=>
Number(n||0).toLocaleString("es-MX",{
style:"currency",
currency:state.biz?.currency||"MXN"
});

// ==========================
// SLUG NEGOCIO
// ==========================

const getSlug=()=>{

const path=location.pathname.replace(/^\/+|\/+$/g,"");

if(!path)return"lunaboutiqueags";

if(path==="luna")return"lunaboutiqueags";
if(path==="f1")return"playerasf1";
if(path==="chelispa")return"chelispa";

return path;

};

// ==========================
// CARGAR NEGOCIO
// ==========================

async function loadBusiness(slug){

const res=await fetch(`/business/${slug}.json`,{cache:"no-store"});

if(!res.ok)throw new Error("Negocio no encontrado");

return res.json();

}

// ==========================
// ADAPTAR FORMULARIO
// ==========================

function adaptCheckoutMode(){

if(state.biz.checkoutMode!=="registro")return;

const hide=(id)=>{
const el=$(id);
if(!el)return;
const parent=el.closest("div")||el.parentElement;
if(parent)parent.style.display="none";
};

hide("street");
hide("neighborhood");
hide("zip");
hide("city");
hide("state");
hide("shippingType");

}

// ==========================
// RENDER TEMA
// ==========================

function renderTheme(){

if(state.biz.theme?.primary)
document.documentElement.style.setProperty("--primary",state.biz.theme.primary);

}

// ==========================
// LOGO
// ==========================

function renderLogo(){

if(!state.biz.logo)return;

const container=$("logoContainer");

container.innerHTML="";

const img=document.createElement("img");

img.src=state.biz.logo;

img.className="logo";

container.appendChild(img);

}

// ==========================
// PRODUCTOS
// ==========================

function render(){

renderTheme();
renderLogo();

$("bizName").textContent=state.biz.name||"Pedido";
$("bizNote").textContent=state.biz.note||"";

const list=$("productList");

list.innerHTML="";

state.biz.products.forEach((p)=>{

const row=document.createElement("div");
row.className="product";

row.innerHTML=`

<div class="product-left">

${p.image?`<img src="${p.image}" class="product-img">`:""}

<div class="product-info">

<div class="product-name">${p.name}</div>

<div class="price">${money(p.price)}</div>

<button class="add-variant btn-mini">Agregar</button>

</div>

</div>

`;

const btn=row.querySelector(".add-variant");

btn.addEventListener("click",()=>{

const key=p.id;

const existing=state.cart.get(key);

if(existing){
existing.qty+=1;
state.cart.set(key,existing);
}else{
state.cart.set(key,{productId:p.id,qty:1});
}

recalc(true);

});

list.appendChild(row);

});

recalc();

}

// ==========================
// TOTAL
// ==========================

function recalc(){

const byId=new Map(state.biz.products.map(p=>[p.id,p]));

let subtotal=0;

for(const[,item]of state.cart){

const p=byId.get(item.productId);

subtotal+=Number(p.price)*Number(item.qty);

}

$("subtotal").textContent=money(subtotal);
$("shipping").textContent=money(0);
$("total").textContent=money(subtotal);

return{subtotal,shipping:0,total:subtotal};

}

// ==========================
// VALIDACION
// ==========================

function validate(){

$("error").textContent="";

if(state.cart.size===0)
return"Agrega al menos un producto.";

const name=$("customerName")?.value.trim();
const phone=$("customerPhone")?.value.trim();

const letters=/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/;
const numbers=/^[0-9]+$/;

if(!name||!letters.test(name))
return"Nombre inválido";

if(!phone||!numbers.test(phone)||phone.length!==10)
return"Teléfono inválido";

if(state.biz.checkoutMode==="registro")
return null;

const street=$("street")?.value.trim();

if(!street)
return"Ingresa dirección.";

return null;

}

// ==========================
// MENSAJE WHATSAPP
// ==========================

function buildMessage({total}){

const byId=new Map(state.biz.products.map(p=>[p.id,p]));

const items=[];

for(const[,item]of state.cart){

const p=byId.get(item.productId);

items.push(`- ${p.name} x${item.qty}`);

}

const name=sanitizeText($("customerName").value);
const phone=sanitizePhone($("customerPhone").value);

return[
`🧾 Pedido para ${state.biz.name}`,
"",
`Cliente: ${name}`,
`Teléfono: ${phone}`,
"",
"Productos:",
items.join("\n"),
"",
`Total: ${money(total)}`
].join("\n");

}

// ==========================
// WHATSAPP
// ==========================

function openWhatsapp(message){

const phone=String(state.biz.whatsappPhone||"").replace(/[^\d]/g,"");

location.href=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

}

// ==========================
// INIT
// ==========================

async function init(){

try{

const slug=getSlug();

state.biz=await loadBusiness(slug);

adaptCheckoutMode();

document.title=state.biz.name;

$("sendBtn").addEventListener("click",()=>{

const btn=$("sendBtn");

if(cooldownTimer)return;

const err=validate();

if(err){

$("error").textContent=err;
return;

}

const totals=recalc();
const msg=buildMessage(totals);

startCooldown(btn);

setTimeout(()=>{

openWhatsapp(msg);

},500);

});

render();

}catch(e){

$("bizName").textContent="Error";
$("bizNote").textContent=e.message;

}

}

init();

})();