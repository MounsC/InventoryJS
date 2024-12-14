import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const __dirname = process.cwd();
const DATA_FILE = path.join(__dirname, 'backend', 'inventoryData.json');

function readInventory() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
}

function writeInventory(inventory) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inventory, null, 2), 'utf-8');
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/inventory', (req, res) => {
    const inventory = readInventory();
    res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
    const { nom, quantiteParUnite, nombreUnites, unite } = req.body;
    if (!nom || !quantiteParUnite || !nombreUnites || !unite) {
        return res.status(400).json({ error: 'Informations incomplètes' });
    }

    const inventory = readInventory();
    const id = nom.toLowerCase().replace(/\s+/g, '_');
    const quantiteTotale = quantiteParUnite * nombreUnites;

    const existing = inventory.find(item => item.id === id);
    if (existing) {
        existing.quantiteTotale += quantiteTotale;
        existing.quantiteInitiale += quantiteTotale;
        existing.quantiteParUnite = quantiteParUnite;
        existing.nombreUnites += nombreUnites;
        existing.unite = unite;
        existing.nom = nom;
    } else {
        inventory.push({
            id,
            nom,
            unite,
            quantiteTotale,
            quantiteInitiale: quantiteTotale,
            quantiteParUnite,
            nombreUnites
        });
    }

    writeInventory(inventory);
    res.json({ message: 'Produit ajouté/ajusté', inventory });
});

app.put('/api/inventory/:id/use', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Quantité invalide' });
    }

    const inventory = readInventory();
    const item = inventory.find(i => i.id === id);
    if (!item) {
        return res.status(404).json({ error: 'Produit non trouvé' });
    }

    item.quantiteTotale = Math.max(item.quantiteTotale - quantity, 0);
    writeInventory(inventory);
    res.json({ message: 'Quantité utilisée', item });
});

app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { nom, quantiteParUnite, nombreUnites, unite } = req.body;

    if (!nom || !quantiteParUnite || !nombreUnites || !unite) {
        return res.status(400).json({ error: 'Informations incomplètes' });
    }

    const inventory = readInventory();
    const item = inventory.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const quantiteTotale = quantiteParUnite * nombreUnites;

    item.nom = nom;
    item.unite = unite;
    item.quantiteParUnite = quantiteParUnite;
    item.nombreUnites = nombreUnites;
    item.quantiteTotale = quantiteTotale;
    item.quantiteInitiale = quantiteTotale;

    writeInventory(inventory);
    res.json({ message: 'Produit modifié', item });
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    let inventory = readInventory();
    const initialLength = inventory.length;
    inventory = inventory.filter(item => item.id !== id);

    if (inventory.length === initialLength) {
        return res.status(404).json({ error: 'Produit non trouvé' });
    }

    writeInventory(inventory);
    res.json({ message: 'Produit supprimé', inventory });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
