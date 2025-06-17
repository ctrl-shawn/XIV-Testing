const recipes = {
  "Hingan Cupboard": {
    id: 20735,
    ingredients: {
      "Persimmon Lumber": { quantity: 6, id: 16888 },
      "Electrum Ingot": { quantity: 3, id: 16852 },
      "Cobalt Joint Plate": { quantity: 4, id: 16929 },
      "Varnish": { quantity: 3, id: 17403 },
      "Wind Crystal": { quantity: 5, id: 12345 },
      "Ice Crystal": { quantity: 4, id: 12346 }
    }
  }
};

async function fetchItemData(server, itemId) {
  try {
    const response = await fetch(`https://universalis.app/api/v2/${server}/${itemId}`);
    if (!response.ok) throw new Error("Failed to fetch from Universalis");

    const data = await response.json();

    if (!data.listings || data.listings.length === 0) {
      throw new Error(`No listings found for item ID ${itemId} on ${server}`);
    }

    return {
      price: data.listings[0].pricePerUnit,
      velocity: data.regularSaleVelocity ?? 0
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { price: 0, velocity: 0 };
  }
}

async function calculateMaterialCost(server, ingredients) {
  let totalCost = 0;
  for (const [name, { quantity, id }] of Object.entries(ingredients)) {
    const data = await fetchItemData(server, id);
    totalCost += data.price * quantity;
  }
  return totalCost;
}

async function calculateProfit() {
  const server = "Cerberus"; // Change to your server
  const select = document.getElementById("recipe-select");
  if (!select) {
    alert("Recipe selector not found in the document.");
    return;
  }

  const recipeName = select.value;
  const recipe = recipes[recipeName];

  if (!recipe) {
    alert("Recipe not found!");
    return;
  }

  const itemData = await fetchItemData(server, recipe.id);
  if (itemData.price === 0) {
    document.getElementById("result").innerHTML = `⚠️ No current listings found for <b>${recipeName}</b> on server <b>${server}</b>.`;
    return;
  }

  const materialCost = await calculateMaterialCost(server, recipe.ingredients);
  const profit = itemData.price - materialCost;
  const velocity = itemData.velocity;

  document.getElementById("result").innerHTML = `
    <h2>${recipeName} Profit Calculation</h2>
    <p>Current Market Price: <b>${itemData.price} gil</b></p>
    <p>Total Material Cost: <b>${materialCost.toFixed(2)} gil</b></p>
    <p>Estimated Profit per Item: <b>${profit.toFixed(2)} gil</b></p>
    <p>Estimated Sales Velocity: <b>${velocity.toFixed(2)} per day</b></p>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("calculate-btn").addEventListener("click", calculateProfit);
});
