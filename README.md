An intuitive web application for managing and tracking inventory. 
The application allows users to add, edit, and delete inventory items, view a detailed summary of stock, and dynamically update quantities. Built using Express.js.


## Features

- **Inventory Management**: Add, edit, and delete items.
- **Stock Usage**: Deduct quantities as needed.
- **Summary Dashboard**: Visual representation of inventory levels and top products.
- **Search Functionality**: Quickly find items using keywords.

## Prerequisites

- **Node.js** (version 14.x or higher)
- **npm** (Node Package Manager)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MounsC/InventoryJS.git
   cd InventoryJS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the environment**:
   Ensure the `inventoryData.json` file is located in the `backend` directory. This file serves as the application's database.

## Running the Project

1. **Start the server**:
   ```bash
   node backend/server.js
   ```

2. **Access the application**:
   Open a browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

- Navigate to the **Inventory** page (`index.html`) to manage items.
- Go to the **Summary** page (`summary.html`) for a detailed overview of stock levels and top products.
- Use the **floating button** to add new items or interact with existing ones to edit, use, or delete them.

## Technologies Used

### Frontend:
- **HTML/CSS**: For structure and styling.
- **Bootstrap 5**: Responsive design and components.
- **JavaScript**: Client-side logic with dynamic rendering.

### Backend:
- **Node.js**: Server-side runtime.
- **Express.js**: Lightweight backend framework.
- **File System (fs)**: For JSON-based data storage.

## API Endpoints

### GET `/api/inventory`
Retrieve all inventory items.

### POST `/api/inventory`
Add a new inventory item.
```json
{
  "nom": "string",
  "quantiteParUnite": "number",
  "nombreUnites": "number",
  "unite": "string"
}
```

### PUT `/api/inventory/:id/use`
Update the quantity of an item by deducting usage.
```json
{
  "quantity": "number"
}
```

### PUT `/api/inventory/:id`
Edit the details of an item.
```json
{
  "nom": "string",
  "quantiteParUnite": "number",
  "nombreUnites": "number",
  "unite": "string"
}
```

### DELETE `/api/inventory/:id`
Delete an item from the inventory.
