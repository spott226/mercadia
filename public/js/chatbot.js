let botStep = 0;
let selectedCategory = null;
let storeWhats = "";

// obtener whatsapp de la tienda actual
document.addEventListener("DOMContentLoaded", () => {
  fetch("data/products.json")
    .then(res => res.json())
    .then(data => {
      const host = window.location.hostname;
      const subdomain = host.split(".")[0].toLowerCase();

      const storeData = data.stores.find(
        s => s.id.toLowerCase() === subdomain
      );

      if (storeData) {
        storeWhats = storeData.whatsapp || "";
      }
    })
    .catch(err => {
      console.error("Error cargando datos del chatbot:", err);
    });
});

function toggleBot() {
  const box = document.getElementById("chatbot-box");
  if (!box) return;

  if (box.style.display === "block") {
    box.style.display = "none";
    return;
  }

  box.style.display = "block";

  if (botStep === 0) {
    botStart();
  }
}

function botStart() {
  botStep = 1;

  const box = document.getElementById("chatbot-box");
  if (!box) return;

  box.innerHTML = `
    <p>👋 Hola, ¿quieres ayuda con tu compra?</p>

    <button id="bot-ver-productos">
      Ver productos
    </button>

    <button id="bot-whatsapp-directo">
      Hablar por WhatsApp
    </button>
  `;

  const btnProductos = document.getElementById("bot-ver-productos");
  const btnWhats = document.getElementById("bot-whatsapp-directo");

  if (btnProductos) {
    btnProductos.addEventListener("click", botCategorias);
  }

  if (btnWhats) {
    btnWhats.addEventListener("click", botWhatsDirect);
  }
}

function botCategorias() {
  botStep = 2;

  const box = document.getElementById("chatbot-box");
  if (!box) return;

  if (!window.allProducts || window.allProducts.length === 0) {
    box.innerHTML = `
      <p>No encontré productos por ahora.</p>
      <button id="bot-volver-inicio">⬅ volver</button>
    `;

    const btnVolver = document.getElementById("bot-volver-inicio");
    if (btnVolver) {
      btnVolver.addEventListener("click", botStart);
    }
    return;
  }

  const categories = [...new Set(window.allProducts.map(p => p.category))];

  let buttons = "";

  categories.forEach((cat, index) => {
    buttons += `<button class="bot-cat-btn" data-category="${cat}" id="bot-cat-${index}">${cat}</button>`;
  });

  box.innerHTML = `
    <p>¿Qué tipo de producto buscas?</p>
    ${buttons}
    <button id="bot-volver-inicio">⬅ volver</button>
  `;

  const catButtons = document.querySelectorAll(".bot-cat-btn");
  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      botProductos(category);
    });
  });

  const btnVolver = document.getElementById("bot-volver-inicio");
  if (btnVolver) {
    btnVolver.addEventListener("click", botStart);
  }
}

function botProductos(category) {
  selectedCategory = category;

  const box = document.getElementById("chatbot-box");
  if (!box) return;

  const products = window.allProducts.filter(
    p => p.category === category
  );

  if (products.length === 0) {
    box.innerHTML = `
      <p>No encontré productos en esta categoría.</p>
      <button id="bot-volver-categorias">⬅ volver</button>
    `;

    const btnVolver = document.getElementById("bot-volver-categorias");
    if (btnVolver) {
      btnVolver.addEventListener("click", botCategorias);
    }
    return;
  }

  let buttons = "";

  products.forEach((p, index) => {
    buttons += `
      <button class="bot-product-btn" data-id="${p.id}" id="bot-product-${index}">
        ${p.name} - $${p.price}
      </button>
    `;
  });

  box.innerHTML = `
    <p>Estos productos encontré:</p>
    ${buttons}
    <button id="bot-volver-categorias">⬅ volver</button>
  `;

  const productButtons = document.querySelectorAll(".bot-product-btn");
  productButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      botComprar(id);
    });
  });

  const btnVolver = document.getElementById("bot-volver-categorias");
  if (btnVolver) {
    btnVolver.addEventListener("click", botCategorias);
  }
}

function botComprar(id) {
  const product = window.allProducts.find(
    p => String(p.id) === String(id)
  );

  if (!product || !storeWhats) return;

  const message = `Hola quiero comprar este producto:\n${product.name}\n$${product.price}`;

  window.open(
    `https://wa.me/${storeWhats}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function botWhatsDirect() {
  if (!storeWhats) return;

  window.open(
    `https://wa.me/${storeWhats}`,
    "_blank"
  );
}

window.toggleBot = toggleBot;

document.addEventListener("DOMContentLoaded", () => {
  const botButton = document.getElementById("chatbot-button");
  if (botButton) {
    botButton.addEventListener("click", toggleBot);
  }
});
