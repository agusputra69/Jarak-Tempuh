let totalDistance = 0;
let previousPosition = null;
let initialDistance = 0;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function saveToLocalStorage() {
  localStorage.setItem('totalDistance', totalDistance);
  localStorage.setItem('initialDistance', initialDistance);
}

function loadFromLocalStorage() {
  totalDistance = parseFloat(localStorage.getItem('totalDistance')) || 0;
  initialDistance = parseFloat(localStorage.getItem('initialDistance')) || 0;
}

loadFromLocalStorage();

function updateDistance() {
  const distanceElement = document.getElementById('totalDistance');
  distanceElement.textContent = totalDistance.toFixed(2);

  const initialDistanceElement = document.getElementById('initialDistance');
  initialDistanceElement.textContent = initialDistance.toFixed(2);

  const currentDistanceElement = document.getElementById('currentDistance');
  currentDistanceElement.textContent = (totalDistance - initialDistance).toFixed(2);

  saveToLocalStorage();
}

function addManualDistance() {
  const manualDistance = parseFloat(prompt('Masukkan jarak tempuh awal (km):'));
  if (!isNaN(manualDistance) && manualDistance >= 0) {
    initialDistance = manualDistance;
    updateDistance();
  } else {
    alert('Input tidak valid. Harap masukkan angka yang valid.');
  }
}

function onPositionUpdate(position) {
  const { latitude, longitude } = position.coords;

  if (previousPosition) {
    const distance = calculateDistance(
      previousPosition.coords.latitude,
      previousPosition.coords.longitude,
      latitude,
      longitude
    );
    totalDistance += distance;
    updateDistance();
  }

  previousPosition = position;
}

if (navigator.permissions) {
  navigator.permissions.query({ name: 'geolocation' })
    .then(permissionStatus => {
      if (permissionStatus.state === 'granted') {
        navigator.geolocation.watchPosition(onPositionUpdate);
      } else {
        console.log('Akses lokasi ditolak.');
      }
    })
    .catch(error => console.error('Error querying permission:', error));
} else {
  console.log('Perangkat tidak mendukung izin lokasi.');
}
