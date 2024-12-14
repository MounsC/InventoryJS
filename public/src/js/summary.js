document.addEventListener('DOMContentLoaded', async () => {
    const inventory = await fetchInventory();
    displaySummary(inventory);
});

async function fetchInventory() {
    const res = await fetch('/api/inventory');
    return await res.json();
}
function getStockStatus(item) {
    if (!item.quantiteInitiale || item.quantiteInitiale === 0) {
        return 'inconnu';
    }

    const ratio = item.quantiteTotale / item.quantiteInitiale;
    if (ratio >= 0.7) {
        return 'ok';
    } else if (ratio >= 0.4) {
        return 'moyen';
    } else {
        return 'faible';
    }
}

function displaySummary(inventory) {
    const totalProductsEl = document.getElementById('totalProducts');
    const totalQuantityEl = document.getElementById('totalQuantity');
    const countOkEl = document.getElementById('countOk');
    const countMoyenEl = document.getElementById('countMoyen');
    const countFaibleEl = document.getElementById('countFaible');
    const topProductsBody = document.getElementById('topProductsBody');

    const totalProducts = inventory.length;

    let totalQuantity = 0;

    let countOk = 0;
    let countMoyen = 0;
    let countFaible = 0;

    inventory.forEach(item => {
        totalQuantity += item.quantiteTotale;

        const status = getStockStatus(item);
        if (status === 'ok') countOk++;
        if (status === 'moyen') countMoyen++;
        if (status === 'faible') countFaible++;
    });

    totalProductsEl.textContent = totalProducts;
    totalQuantityEl.textContent = totalQuantity;
    countOkEl.textContent = countOk;
    countMoyenEl.textContent = countMoyen;
    countFaibleEl.textContent = countFaible;

    const sorted = [...inventory].sort((a, b) => b.quantiteTotale - a.quantiteTotale);
    const top5 = sorted.slice(0, 5);

    topProductsBody.innerHTML = '';
    top5.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${item.nom}</td>
      <td>${item.quantiteTotale}</td>
      <td>${item.unite}</td>
    `;
        topProductsBody.appendChild(tr);
    });
}