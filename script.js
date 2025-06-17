// List of official FFXIV servers
const servers = [
  "Adamantoise", "Aegis", "Alexander", "Anima", "Asura", "Atomos",
  "Bahamut", "Balmung", "Brynhildr", "Cactuar", "Coeurl", "Diabolos",
  "Durandal", "Excalibur", "Exodus", "Faerie", "Famfrit", "Fenrir",
  "Hyperion", "Lamia", "Leviathan", "Lich", "Malboro", "Mandragora",
  "Masamune", "Mateus", "Midgardsormr", "Ifrit", "Ixion", "Goblin",
  "Jenova", "Kujata", "Moogle", "Odin", "Omega", "Phoenix", "Ragnarok",
  "Sargatanas", "Shinryu", "Shiva", "Tiamat", "Ultima", "Ultros",
  "Zalera", "Zeromus"
];

// Recipe data with correct XIVAPI item IDs for Hingan Cupboard and materials
const recipes = {
  "Hingan Cupboard": {
    itemId: 20735,
    materials: [
      { id: 19927, amount: 6 },  // Persimmon Lumber
      { id: 5066, amount: 3 },   // Electrum Ingot
      { id: 504, amount: 4 },    // Cobalt Joint Plate
      { id: 5070, amount: 3 },   // Varnish
      { id: 5072, amount: 5 },   // Wind Crystal
      { id: 5073, amount: 4 }    // Ice Crystal
    ],
  },
};

const serverSelect = document.getElementById("serverSelect");
const itemSelect = document.getElementById("itemSelect");
const calculateBtn = document.getElementById("calculateBtn");
const resultsDiv = document.getElementById("results");

// Populate server dropdown dynamically
function populateServers() {
  servers.forEach(server => {
    const option = document.createElement("option");
    option.value = server;
    option.textContent = server;
    serverSelect.appendChild(option);
  });
}

// Fetch market data for an item from Universalis API
async function fetchMarketData(itemId, server) {
  const url = `https://universalis.app/api/${server}/${itemId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return null;
  }
}

// Calculate the total material cost based on current market prices
async function calculateMaterialCost(materials, server) {
  let totalCost = 0;

  for (const material of materials) {
    const data = await fetchMarketData(material.id, server);
    if (!data || !data.listings || data.listings.length === 0) {
      throw new Error(`No market data for material ID ${material.id} on server ${server}`);
    }

    // Use the lowest listing price as cost
    const lowestPrice = Math.min(...data.listings.map(listing => listing.pricePerUnit));
    totalCost += lowestPrice * material.amount;
  }

  return totalCost;
}

// Calculate profit for crafting and selling the item
async function calculateProfit() {
  resultsDiv.textContent = "Calculating...";
  const server = serverSelect.value;
  const itemName = itemSelect.value;

  if (!server) {
    resultsDiv.textContent = "Please select a server.";
    return;
  }

  try {
    const recipe = recipes[itemName];
    if (!recipe) {
      resultsDiv.textContent = "Recipe data not found.";
      return;
    }

    // Fetch item market data
    const itemData = await fetchMarketData(recipe.itemId, server);
    if (!itemData || !itemData.recentHistory || itemData.recentHistory.length === 0) {
      resultsDiv.textContent = "No recent sales data for the crafted item.";
      return;
    }

    // Use last sale price or average recent price for selling price
    const lastSale = itemData.recentHistory[itemData.recentHistory.length - 1];
    const sellPrice = lastSale.pricePerUnit || lastSale.price; 

    // Calculate material cost
    const materialCost = await calculateMaterialCost(recipe.materials, server);

    // Profit per item
    const profit = sellPrice - materialCost;

    resultsDiv.innerHTML = `
      <strong>Server:</strong> ${server}<br>
      <strong>Item:</strong> ${itemName}<br>
      <strong>Sell Price:</strong> ${sellPrice.toLocaleString()} gil<br>
      <strong>Material Cost:</strong> ${materialCost.toLocaleString()} gil<br>
      <strong>Estimated Profit:</strong> ${profit.toLocaleString()} gil
    `;
  } catch (error) {
    resultsDiv.textContent = `Error: ${error.message}`;
  }
}

// Initial setup
populateServers();

calculateBtn.addEventListener("click", calculateProfit);
