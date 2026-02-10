import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.14.0/dist/pocketbase.es.mjs';

// ✅ Replace with your remote PocketBase URL
const pb = new PocketBase('http://127.0.0.1:8090'); 

const form = document.getElementById('medicineForm');
const inventoryList = document.getElementById('inventoryList');

// Fetch and display inventory
async function fetchInventory() {
  try {
    const records = await pb.collection('medicines').getFullList();
    inventoryList.innerHTML = '';

    const today = new Date();

    records.forEach(record => {
      const tr = document.createElement('tr');

      const expDate = new Date(record.expiration_date);
      let status = 'OK';
      let className = 'ok';

      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        status = 'EXPIRED';
        className = 'expired';
      } else if (diffDays <= 30) {  // Near expiry within 30 days
        status = 'NEAR EXPIRY';
        className = 'near-expiry';
      }

      tr.classList.add(className);
      tr.innerHTML = `
        <td>${record.name}</td>
        <td>${record.type}</td>
        <td>${record.quantity}</td>
        <td>${record.expiration_date}</td>
        <td>${status}</td>
      `;

      inventoryList.appendChild(tr);
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
  }
}

// Add medicine
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('medName').value;
  const quantity = parseInt(document.getElementById('medQty').value);
  const expiration_date = document.getElementById('medExp').value;
  const type = document.getElementById('medType').value;

  try {
    await pb.collection('medicines').create({
      name,
      type,
      quantity,
      expiration_date
    });

    form.reset();
    fetchInventory();
  } catch (err) {
    console.error('Error adding medicine:', err);
  }
});

// Initial load
fetchInventory();
