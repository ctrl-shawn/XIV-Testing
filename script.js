// Data: recipes with item IDs and materials with their IDs and quantities
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
  // Add more recipes as needed
};

// List of official FFXIV servers (can be expanded)
const servers = [
  "Adamantoise","Aegis","Alexander","Anima","Asura","Atomos","Bahamut","Balmung",
  "Behemoth","Besaid","Brynhildr","Cactuar","Coeurl","Diabolos","Durandal","Echo",
  "Faerie","Fenrir","Gilgamesh","Goblin","Jenova","Midgardsormr","Mateus","Moogle",
  "Odin","Omega","Phantom","Shinryu","Shiva","Tonberry","Typhon","Ultima","Unicorn",
  "Valefor","Yojimbo","Zalera","Zeromus"
];

// Populate datalists for autocomplete
window.addEventListener("DOMContentLoaded", () => {
  const serverList = document.getElementById("serverList");
  servers.forEach(server => {
    const option = document.createElement("option");
    option.value = server;
    serverList.appendChild(option);
  });

  const recipeList = document.getElementById("recipeList");
  Object.keys(recipes).forEach(recipeName => {
    const option = document.createElement("option");
    option.value = recipeName;
    recipeList.appendChild(option);
  });
});

// Fetch market data for a specific item on a server from Universalis API
async function fetchMarketData(server, itemId) {
  const url = `https://universalis.app/api/${encodeURIComponent(server)}/${itemId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    throw new Error(`Error fetching market data: ${err.message}`);
  }
}

async function calculateProfit() {
  const server = document.getElementById("serverInput").value.trim();
  const recipeName = document.getElementById("recipeInput").value.trim();
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = ""; // clear previous result

  if (!servers.includes(server)) {
    resultDiv.innerHTML = `<p style="color:red;">Invalid or unsupported server name.</p>`;
    return;
  }
  if (!recipes[recipeName]) {
    resultDiv.innerHTML = `<p style="color:red;">Unknown recipe selected.</p>`;
    return;
  }

  const recipe = recipes[recipeName];

  try {
    // Fetch crafted item price
    const craftedItemData = await fetchMarketData(server, recipe.itemId);
    const craftedPrice = craftedItemData.listings?.[0]?.pricePerUnit || 0;

    // Fetch materials cost and build breakdown
    let totalMaterialCost = 0;
    let breakdownHTML = "<h3>Material Costs:</h3><ul>";

    for (const mat of recipe.materials) {
      const matData = await fetchMarketData(server, mat.id);
      const matPrice = matData.listings?.[0]?.pricePerUnit || 0;
      const matTotal = matPrice * mat.amount;  // <-- use mat.amount here
      totalMaterialCost += matTotal;
      breakdownHTML += `<li>${mat.name} x${mat.amount} @ ${matPrice.toLocaleString()} = ${matTotal.toLocaleString()}</li>`;
    }
    breakdownHTML += "</ul>";

    const profit = craftedPrice - totalMaterialCost;

    // Output results
    resultDiv.innerHTML = `
      <h2>${recipeName} Profit Calculation</h2>
      <p><strong>Server:</strong> ${server}</p>
      <p><strong>Crafted Item Price:</strong> ${craftedPrice.toLocaleString()} gil</p>
      ${breakdownHTML}
      <h3>Total Material Cost: ${totalMaterialCost.toLocaleString()} gil</h3>
      <h3>Estimated Profit: ${profit.toLocaleString()} gil</h3>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

document.getElementById("calculateBtn").addEventListener("click", calculateProfit);
