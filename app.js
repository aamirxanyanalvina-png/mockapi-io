const API_URL = "https://6ab948f9f84897980b728273.mockapi.io/products/products";
const productsGrid = document.getElementById("productsGrid");
const productForm = document.getElementById("productForm");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");


let allProducts = [];


async function getProducts() {
  showLoader(true);
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("servers not work");
    
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    showLoader(false);
  }
}


function renderProducts(products) {
  productsGrid.innerHTML = "";
  totalCount.textContent = products.length;

  if (products.length === 0) {
    productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">not this products</p>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span class="category-badge">${product.category || 'General'}</span>
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150'">
      <div>
        <h3>${escapeHtml(product.title)}</h3>
        <div class="price">$${Number(product.price).toFixed(2)}</div>
      </div>
      <div class="card-actions">
        <button class="btn-sm btn-edit" onclick="setupEdit('${product.id}')">
          <i class="fa-solid fa-pen"></i> "edit"
        </button>
        <button class="btn-sm btn-delete" onclick="deleteProduct('${product.id}')">
          <i class="fa-solid fa-trash"></i> "delete"
          
        </button>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

// 3. POST & PUT (Create / Update)
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const productData = {
    title: document.getElementById("title").value,
    price: parseFloat(document.getElementById("price").value),
    category: document.getElementById("category").value,
    image: document.getElementById("image").value
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  try {
    showLoader(true);
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    });

    if (!response.ok) throw new Error("action wos failed");

    showToast(isEdit ? "Ապրանքը թարմացվեց!" : "save a product!", "success");
    resetForm();
    getProducts();
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    showLoader(false);
  }
});

// 4. DELETE: 
async function deleteProduct(id) {
  if (!confirm("delete product?")) return;

  try {
    showLoader(true);
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Ջնջումը չստացվեց");

    showToast("products are delete", "success");
    getProducts();
  } catch (error) {
    showToast(error.message, "danger");
  } finally {
    showLoader(false);
  }
}

 (Form Edit setup)
function setupEdit(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("title").value = product.title;
  document.getElementById("price").value = product.price;
  document.getElementById("category").value = product.category || "Electronics";
  document.getElementById("image").value = product.image;

  formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Խմբագրել Ապրանքը`;
  cancelBtn.classList.remove("hidden");
}
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  productForm.reset();
  document.getElementById("productId").value = "";
  formTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> save product;
  cancelBtn.classList.add("hidden");
}

// 6. Search )
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p => 
    p.title.toLowerCase().includes(searchTerm)
  );
  renderProducts(filtered);
});

// Helper Functions 
function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
;
getProducts();
