// Recipe data with correct XIVAPI item IDs for Hingan Cupboard and materials
const recipes = {
  "Hingan Cupboard": {
    itemId: 20735,
    materials: [
      { id: 19927, name: "Persimmon Lumber", amount: 6 },  // Persimmon Lumber
      { id: 5066, name: "Electrum Ingot", amount: 3 },   // Electrum Ingot
      { id: 7023, name: "Cobalt Joint Plate", amount: 4 },    // Cobalt Joint Plate
      { id: 7017, name: "Varnish", amount: 3 },   // Varnish
      { id: 10, name: "Wind Crystal", amount: 5 },   // Wind Crystal
      { id: 9, name: "Ice Crystal", amount: 4 }    // Ice Crystal
    ],
  },
};

// Official FFXIV servers list
const serverList = [
  "Adamantoise", "Aegis", "Alexander", "Anima", "Asura", "Atomos", "Bahamut",
  "Balmung", "Behemoth", "Belias", "Brynhildr", "Cactuar", "Carbuncle",
  "Cerberus", "Chocobo", "Coeurl", "Diabolos", "Durandal", "Excalibur",
  "Exodus", "Faerie", "Famfrit", "Fenrir", "Garuda", "Gilgamesh", "Goblin",
  "Gungnir", "Hades", "Hyperion", "Ifrit", "Ixion", "Jenova", "Kujata",
  "Lamia", "Leviathan", "Lich", "Louisoix", "Malboro", "Mandragora",
  "Masamune", "Mateus", "Midgardsormr", "Moogle", "Odin", "Omega", "Pandaemonium",
  "Phoenix", "Ragnarok", "Ramuh", "Ridill", "Sargatanas", "Shinryu", "Shiva",
  "Siren", "Tiamat", "Titan", "Tonberry", "Tornado", "Typhon", "Ultima",
  "Ultros", "Unicorn", "Valefor", "Yojimbo", "Zalera", "Zeromus", "Zodiark"
];

// Populate server dropdown in HTML
function populateServerDropdown() {
  const serverSelect = document.getElementById("serverSelect");
  if (!serverSelect) return;
  serverList.forEach(server => {
    const option = document.createElement("option");
    option.value = server;
    option.textContent = server;
    serverSelect.appendChild(option);
  });
}

// Fetch market data for a given item and server
async function fetchMarketData(itemId, server) {
  const url = `https://universalis.app/api/${server}/${itemId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API responded with status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching market data for item ${itemId}:`, error);
    return null;
  }
}

// Calculate total material cost and breakdown
async function calculateMaterialCost(materials, server) {
  let totalCost = 0;
  const breakdown = [];
  for (const material of materials) {
    const data = await fetchMarketData(material.id, server);
    let price = 0;
    if (data && data.listings && data.listings.length > 0) {
      price = data.listings[0].pricePerUnit;
    } else {
      console.warn(`No listings for material ID ${material.id} on ${server}.`);
    }
    const materialTotal = price * material.amount;
    totalCost += materialTotal;
    breakdown.push({ name: material.name, unitPrice: price, amount: material.amount, total: materialTotal });
  }
  return { totalCost, breakdown };
}

// Calculate profit and render results
async function calculateProfit() {
  const server = document.getElementById("serverSelect")?.value;
  const itemName = document.getElementById("itemSelect")?.value;
  const resultDiv = document.getElementById("results");
  if (!server || !itemName) {
    resultDiv.textContent = "Please select both a server and an item.";
    return;
  }
  resultDiv.innerHTML = "Calculating...";

  const recipe = recipes[itemName];
  if (!recipe) {
    resultDiv.innerHTML = "Invalid recipe name.";
    return;
  }

  const itemData = await fetchMarketData(recipe.id, server);
  const sellPrice = (itemData && itemData.listings && itemData.listings[0])
    ? itemData.listings[0].pricePerUnit
    : 0;

  const { totalCost, breakdown } = await calculateMaterialCost(recipe.materials, server);
  const profit = sellPrice - totalCost;

  let html = `<h3>Profitability for ${itemName}</h3>`;
  html += `<p>Market Sell Price: ${sellPrice.toLocaleString()} gil</p>`;
  html += `<p>Total Material Cost: ${totalCost.toLocaleString()} gil</p>`;
  html += `<p><strong>Estimated Profit: ${profit.toLocaleString()} gil</strong></p>`;
  html += `<h4>Material Breakdown</h4><ul>`;
  breakdown.forEach(mat => {
    html += `<li>${mat.amount}x ${mat.name} @ ${mat.unitPrice.toLocaleString()} gil = ${mat.total.toLocaleString()} gil</li>`;
  });
  html += `</ul>`;

  resultDiv.innerHTML = html;
}

// DOM ready setup
document.addEventListener("DOMContentLoaded", () => {
  populateServerDropdown();
  document.getElementById("calculateBtn").addEventListener("click", calculateProfit);
});


