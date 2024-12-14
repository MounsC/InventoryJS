let keywordData = null;

document.addEventListener('DOMContentLoaded', async () => {
    keywordData = await loadKeywordData();
    renderInventory();
    initTooltips();
});

const searchInput = document.getElementById('searchInput');
const addForm = document.getElementById('addForm');
const inventoryContainer = document.getElementById('inventoryContainer');
const useForm = document.getElementById('useForm');
const useProductIdInput = document.getElementById('useProductId');

const editForm = document.getElementById('editForm');
const editProductIdInput = document.getElementById('editProductId');
const editNomInput = document.getElementById('editNom');
const editQuantiteUniteInput = document.getElementById('editQuantiteUnite');
const editNombreUnitesInput = document.getElementById('editNombreUnites');
const editUniteInput = document.getElementById('editUnite');

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom').value.trim();
    const quantiteUnite = parseFloat(document.getElementById('quantiteUnite').value);
    const nombreUnites = parseFloat(document.getElementById('nombreUnites').value);
    const unite = document.getElementById('unite').value.trim();

    if (nom && !isNaN(quantiteUnite) && !isNaN(nombreUnites) && unite) {
        await addProduct({ nom, quantiteParUnite: quantiteUnite, nombreUnites, unite });
        addForm.reset();
        const modalEl = document.getElementById('addModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        renderInventory(searchInput.value);
    }
});

inventoryContainer.addEventListener('click', (e) => {
    const useBtn = e.target.closest('.use-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    const editBtn = e.target.closest('.edit-btn');

    if (useBtn) {
        const id = useBtn.getAttribute('data-id');
        useProductIdInput.value = id;
        const modal = new bootstrap.Modal(document.getElementById('useModal'));
        modal.show();
    }

    if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (confirm('Supprimer ce produit ?')) {
            deleteProduct(id).then(() => {
                renderInventory(searchInput.value);
            });
        }
    }

    if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        loadProductForEdit(id);
    }
});

useForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = useProductIdInput.value;
    const quantity = parseFloat(document.getElementById('useQuantity').value);
    if (!isNaN(quantity) && quantity > 0) {
        await useQuantity(id, quantity);
    }
    const modalEl = document.getElementById('useModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    useForm.reset();
    renderInventory(searchInput.value);
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editProductIdInput.value;
    const nom = editNomInput.value.trim();
    const quantiteUnite = parseFloat(editQuantiteUniteInput.value);
    const nombreUnites = parseFloat(editNombreUnitesInput.value);
    const unite = editUniteInput.value.trim();

    if (nom && !isNaN(quantiteUnite) && !isNaN(nombreUnites) && unite) {
        await editProduct(id, { nom, quantiteParUnite: quantiteUnite, nombreUnites, unite });
        const modalEl = document.getElementById('editModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        editForm.reset();
        renderInventory(searchInput.value);
    }
});

searchInput.addEventListener('input', () => {
    renderInventory(searchInput.value);
});

async function fetchInventory() {
    const res = await fetch('/api/inventory');
    return await res.json();
}

async function addProduct(data) {
    await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function deleteProduct(id) {
    await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
    });
}

async function useQuantity(id, quantity) {
    await fetch(`/api/inventory/${id}/use`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
    });
}

async function editProduct(id, data) {
    await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function loadKeywordData() {
    try {
        const res = await fetch('/iconKeywords.json');
        if (res.ok) {
            return await res.json();
        } else {
            console.warn("Impossible de charger iconKeywords.json, utilisation du fallback.");
            return { keywords: [] };
        }
    } catch (err) {
        console.warn("Erreur chargement configuration icônes :", err);
        return { keywords: [] };
    }
}

function getStockStatus(item) {
    if (!item.quantiteInitiale || item.quantiteInitiale === 0) {
        return { label: 'Inconnu', classRow: '', badgeClass: 'bg-secondary' };
    }

    const ratio = item.quantiteTotale / item.quantiteInitiale;
    if (ratio >= 0.7) {
        return { label: 'Stock suffisant', classRow: 'stock-ok', badgeClass: 'bg-success text-white' };
    } else if (ratio >= 0.4) {
        return { label: 'Stock moyen', classRow: 'stock-moyen', badgeClass: 'bg-warning text-dark' };
    } else {
        return { label: 'Stock faible', classRow: 'stock-faible', badgeClass: 'bg-danger text-white' };
    }
}

function getProductIcon(nom) {
    if (!keywordData || !keywordData.keywords) {
        return 'bi-box';
    }

    const lowerName = nom.toLowerCase();

    for (const entry of keywordData.keywords) {
        if (entry.matches.some(keyword => lowerName.includes(keyword))) {
            return entry.icon;
        }
    }

    return 'bi-box';
}

async function renderInventory(filter = '') {
    const inventory = await fetchInventory();
    const filtered = filter ? inventory.filter(item => item.nom.toLowerCase().includes(filter.toLowerCase())) : inventory;

    inventoryContainer.innerHTML = '';
    filtered.forEach(item => {
        const { label, classRow, badgeClass } = getStockStatus(item);
        const titleInfo = `Initialement: ${item.nombreUnites} unités de ${item.quantiteParUnite}${item.unite}`;
        const iconClass = getProductIcon(item.nom);

        const col = document.createElement('div');
        col.classList.add('col-12', 'col-sm-6', 'col-md-4', 'mb-4');

        const card = document.createElement('div');
        card.classList.add('card', 'h-100', 'shadow-sm');
        if (classRow) {
            card.classList.add(classRow);
        }

        card.innerHTML = `
      <div class="card-body d-flex flex-column">
        <div class="d-flex align-items-center mb-2">
          <i class="${iconClass} fs-3 me-2"></i>
          <h5 class="card-title mb-0 flex-grow-1">${item.nom}</h5>
          <span class="badge ${badgeClass}">${label}</span>
        </div>
        <p class="card-text text-muted mb-2">
          ${item.quantiteTotale} ${item.unite}
        </p>
        <small class="text-muted" data-bs-toggle="tooltip" title="${titleInfo}">
          Détails
        </small>
        <div class="mt-auto pt-3 d-flex justify-content-between">
          <button class="btn btn-sm btn-warning use-btn" data-id="${item.id}">
            <i class="bi bi-scissors"></i> Utiliser
          </button>
          <button class="btn btn-sm btn-info text-white edit-btn" data-id="${item.id}">
            <i class="bi bi-pencil-square"></i> Modifier
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">
            <i class="bi bi-trash3"></i> Supprimer
          </button>
        </div>
      </div>
    `;

        col.appendChild(card);
        inventoryContainer.appendChild(col);
    });

    initTooltips();
}

function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

async function loadProductForEdit(id) {
    const inventory = await fetchInventory();
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    editProductIdInput.value = item.id;
    editNomInput.value = item.nom;
    editQuantiteUniteInput.value = item.quantiteParUnite;
    editNombreUnitesInput.value = item.nombreUnites;
    editUniteInput.value = item.unite;

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}
