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
const servers = [
  "Adamantoise", "Aegis", "Alexander", "Anima", "Asura", "Atomos", "Bahamut", "Balmung", "Behemoth",
  "Belias", "Brynhildr", "Cactuar", "Carbuncle", "Cerberus", "Chocobo", "Coeurl", "Diabolos",
  "Durandal", "Excalibur", "Exodus", "Faerie", "Famfrit", "Fenrir", "Garuda", "Gilgamesh",
  "Goblin", "Gungnir", "Hades", "Hyperion", "Ifrit", "Ixion", "Jenova", "Kujata", "Lamia", "Leviathan",
  "Lich", "Louisoix", "Malboro", "Mandragora", "Masamune", "Mateus", "Midgardsormr", "Moogle", "Odin",
  "Omega", "Pandaemonium", "Phoenix", "Ragnarok", "Ramuh", "Ridill", "Sargatanas", "Shinryu", "Shiva",
  "Siren", "Tiamat", "Titan", "Tonberry", "Typhon", "Ultima", "Ultros", "Unicorn", "Valefor", "Yojimbo",
  "Zalera", "Zeromus", "Zodiark"
];

function populateServerDropdown() {
  const serverSelect = document.getElementById("serverSelect");
  servers.forEach(server => {
    const option = document.createElement("option");
    option.value = server;
    option.textContent = server;
    serverSelect.appendChild(option);
  });
}

function populateItemDropdown() {
  const itemSelect = document.getElementById("itemSelect");
  Object.keys(recipes).forEach(itemName => {
    const option = document.createElement("option");
    option.value = itemName;
    option.textContent = itemName;
    itemSelect.appendChild(option);
  });
}

async function fetchMarketData(server, itemID) {
  const url = `https://universalis.app/api/${server}/${itemID}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API responded with status ${res.status}`);
  return res.json();
}

async function calculateMaterialCost(recipe, server) {
  let total = 0;
  const details = [];

  for (const mat of recipe.materials) {
    try {
      const data = await fetchMarketData(server, mat.id);
      const price = data.listings[0]?.pricePerUnit || 0;
      const cost = price * mat.amount;
      total += cost;
      details.push(`${mat.amount}x ${mat.name} @ ${price} gil = ${cost} gil`);
    } catch (err) {
      details.push(`Error fetching ${mat.name}`);
    }
  }

  return { total, details };
}

async function calculateProfit() {
  const server = document.getElementById("serverSelect").value;
  const itemName = document.getElementById("itemSelect").value;
  const recipe = recipes[itemName];
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "Calculating...";

  try {
    const itemData = await fetchMarketData(server, recipe.id);
    const avgSalePrice = itemData.listings[0]?.pricePerUnit || 0;

    const { total: materialCost, details } = await calculateMaterialCost(recipe, server);
    const profit = avgSalePrice - materialCost;

    resultDiv.innerHTML = `
      <h2>Results for ${itemName} on ${server}</h2>
      <p><strong>Market Price:</strong> ${avgSalePrice} gil</p>
      <p><strong>Material Cost:</strong> ${materialCost} gil</p>
      <p><strong>Profit:</strong> ${profit} gil</p>
      <h3>Itemized Material Costs:</h3>
      <ul>${details.map(d => `<li>${d}</li>`).join("")}</ul>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateServerDropdown();
  populateItemDropdown();

  document.getElementById("calculateBtn").addEventListener("click", calculateProfit);
});
