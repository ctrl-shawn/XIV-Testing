const recipes = {
  "Hingan Cupboard": {
    id: 18224,
    ingredients: {
      "Zelkova Lumber": { quantity: 3, id: 17523 },
      "Ruby Cotton Cloth": { quantity: 2, id: 16924 },
      "Iron Nails": { quantity: 4, id: 5331 }
    }
  },
  "Zelkova Lumber": {
    id: 17523,
    ingredients: {
      "Zelkova Log": { quantity: 5, id: 12538 },
      "Larch Resin": { quantity: 1, id: 14144 }
    }
  },
  "Ruby Cotton Cloth": {
    id: 16924,
    ingredients: {
      "Ruby Cotton Boll": { quantity: 3, id: 16734 },
      "Seawater": { quantity: 1, id: 10335 }
    }
  }
};

async function fetchItemData(server, itemId) {
  const response = await fetch(`https://universalis.app/api/v2/${server}/${itemId}`);
  const data = await response.json();
  return {
    price: data.listings[0]?.pricePerUnit || 0,
    velocity: data.regularSaleVelocity
  };
}

async function calculateMaterialCost(server, name, depth = 0) {
  const recipe = recipes[name];
  if (!recipe) {
    const { price } = await fetchItemData(server, name);
    return price;
  }

  let total = 0;
  for (const [ingredient, { quantity }] of Object.entries(recipe.ingredients)) {
    const costPerUnit = await calculateMaterialCost(server, ingredient, depth + 1);
    total += costPerUnit * quantity;
  }

  return total;
}

async function calculateProfit() {
  const server = document.getElementById("server").value;
  const itemName = document.getElementById("item").value;
  const resultDiv = document.getElementById("results");
  resultDiv.innerHTML = "Loading...";

  const recipe = recipes[itemName];
  if (!recipe) {
    resultDiv.innerHTML = `❌ Recipe for "${itemName}" not found.`;
    return;
  }

  let materialCost = 0;
  let breakdown = [];

  for (const [ingredient, { quantity }] of Object.entries(recipe.ingredients)) {
    const costPerUnit = await calculateMaterialCost(server, ingredient);
    const total = costPerUnit * quantity;
    materialCost += total;
    breakdown.push(`${ingredient} (${quantity}x): ${costPerUnit.toLocaleString()} gil`);
  }

  const { price: marketPrice, velocity } = await fetchItemData(server, recipe.id);
  const profit = marketPrice - materialCost;
  const roi = ((profit / materialCost) * 100).toFixed(2);

  resultDiv.innerHTML = `
    <h2>${itemName}</h2>
    <p><strong>Market Price:</strong> ${marketPrice.toLocaleString()} gil</p>
    <p><strong>Sales per Day:</strong> ${velocity.toFixed(2)}</p>
    <p><strong>Materials:</strong><br>${breakdown.join("<br>")}</p>
    <p><strong>Total Cost:</strong> ${materialCost.toLocaleString()} gil</p>
    <p><strong>Estimated Profit:</strong> ${profit.toLocaleString()} gil</p>
    <p><strong>ROI:</strong> ${roi}%</p>
    <p><strong>Recommendation:</strong> ${profit > 0 ? "✅ Craft & Sell" : "❌ Not Worth It"}</p>
  `;
}
