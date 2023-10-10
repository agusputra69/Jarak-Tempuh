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

async function getAddressFromCoordinates(latitude, longitude) {
  // Ganti dengan API key Geocoding Anda
  const apiKey = 'AIzaSyDmv1yP--wrbXEQNKKGAMRaH9J2_V5yBgk';
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
  const data = await response.json();

  if (data.status === 'OK' && data.results[0]) {
    const address = data.results[0].formatted_address;
    return address;
  } else {
    return 'Informasi alamat tidak tersedia';
  }
}

async function updateDistanceAndLocation(position) {
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

  // Update latitude and longitude
  document.getElementById('latitude').textContent = latitude.toFixed(6);
  document.getElementById('longitude').textContent = longitude.toFixed(6);

  // Get and display address
  const addressElement = document.getElementById('address');
  const address = await getAddressFromCoordinates(latitude, longitude);
  addressElement.textContent = 'Lokasi Sekarang: ' + address;
}

function updateDistance() {
  const distanceElement = document.getElementById('totalDistance');
  distanceElement.textContent = totalDistance.toFixed(2);

  const initialDistanceElement = document.getElementById('initialDistance');
  initialDistanceElement.textContent = initialDistance.toFixed(2);

  const currentDistanceElement = document.getElementById('currentDistance');
  currentDistanceElement.textContent = (totalDistance + initialDistance).toFixed(2);
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

async function requestLocationPermission() {
  if (navigator.permissions) {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    handlePermissionStatus(permissionStatus);
  } else {
    console.log('Perangkat tidak mendukung izin lokasi.');
  }
}

function handlePermissionStatus(permissionStatus) {
  if (permissionStatus.state === 'granted') {
    console.log('Izin akses lokasi sudah diberikan.');
    startTrackingLocation();
  } else if (permissionStatus.state === 'prompt') {
    console.log('Menunggu izin akses lokasi...');
    requestGeolocationPermission();
  } else {
    console.log('Akses lokasi ditolak.');
  }
}

async function requestGeolocationPermission() {
  try {
    const position = await navigator.geolocation.getCurrentPosition();
    console.log('Izin akses lokasi diberikan.');
    startTrackingLocation();
  } catch (error) {
    console.error('Izin akses lokasi ditolak:', error);
  }
}

function startTrackingLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(onPositionUpdate);
  } else {
    console.log('Perangkat tidak mendukung geolocation.');
  }
}

function onPositionUpdate(position) {
  updateDistanceAndLocation(position);
}

// Memanggil fungsi untuk meminta izin akses lokasi
requestLocationPermission();
