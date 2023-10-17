const admin = require('firebase-admin');

// Inisialisasi Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://jarak-tempuh-tracker-default-rtdb.asia-southeast1.firebasedatabase.app/', // Ganti dengan URL database Anda
});

const db = admin.database();

module.exports = async (req, res) => {
  const { distance } = req.body;

  const distanceRef = db.ref('totalDistance');

  // Ambil data jarak dari database
  const totalDistanceSnapshot = await distanceRef.once('value');

  let totalDistance = totalDistanceSnapshot.val() || 0;

  // Tambahkan jarak baru
  if (distance) {
    totalDistance += distance;

    // Perbarui data jarak
    await distanceRef.set(totalDistance);
  }

  res.status(200).send({ totalDistance });
};

const postData = async (distance) => {
  const data = { distance };
  const response = await fetch('jarak-tempuh.vercel.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    console.log('Total Distance:', result.totalDistance);
  } else {
    console.error('Failed to send data.');
  }
};

// Panggil postData dengan data jarak
// Misalnya: postData(5.2); // Jarak dalam kilometer
