let productCount = 0

function addProduct(){

productCount++

const container = document.getElementById("products")

const div = document.createElement("div")
div.className = "product"

div.innerHTML = `

<h3>Producto ${productCount}</h3>

<input class="name" placeholder="Nombre producto">

<input class="price" type="number" placeholder="Precio">

<select class="category">
<option>sudaderas</option>
<option>gorras</option>
<option>playeras</option>
<option>tenis</option>
<option>perfumes</option>
<option>spa</option>
<option>otros</option>
</select>

<input class="stock" type="number" placeholder="Stock">

<label>Imagen</label>
<input type="file" class="image">

<textarea class="description" placeholder="Descripción"></textarea>

`

container.appendChild(div)

}


function sendJSON(){

const products=[]

document.querySelectorAll(".product").forEach((p,i)=>{

const imageFile=p.querySelector(".image").files[0]

products.push({

name:p.querySelector(".name").value,
price:Number(p.querySelector(".price").value),
category:p.querySelector(".category").value,
stock:Number(p.querySelector(".stock").value),
image:imageFile ? imageFile.name : "",
description:p.querySelector(".description").value,
featured:true,
active:true

})

})

const json=JSON.stringify(products,null,2)

const numeroAdmin="524494389825"

const mensaje=encodeURIComponent(json)

window.open(`https://wa.me/${numeroAdmin}?text=${mensaje}`)

}

document.getElementById("addBtn").addEventListener("click",addProduct)
document.getElementById("sendBtn").addEventListener("click",sendJSON)