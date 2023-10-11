let totalDistance = 0;
let previousPosition = null;
let initialDistance = parseFloat(localStorage.getItem('initialDistance')) || 0;
let isTrackingPaused = false;
let isInitialDistanceSet = initialDistance > 0; // Tandai apakah jarak awal sudah diisi

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

async function getAddressFromCoordinates(latitude, longitude) {
  const apiKey = 'AIzaSyDmv1yP--wrbXEQNKKGAMRaH9J2_V5yBgk'; // Ganti dengan API key Geocoding Anda
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
  const data = await response.json();

  if (data.status === 'OK' && data.results[0]) {
    const address = data.results[0].formatted_address;
    return address;
  } else {
    return 'Informasi alamat tidak tersedia';
  }
}

function updateDistance() {
  const distanceElement = document.getElementById('totalDistance');
  distanceElement.textContent = totalDistance.toFixed(2);

  const initialDistanceElement = document.getElementById('initialDistance');
  initialDistanceElement.textContent = initialDistance.toFixed(2);

  const currentDistanceElement = document.getElementById('currentDistance');
  currentDistanceElement.textContent = (totalDistance - initialDistance).toFixed(2);
}

function addManualDistance() {
  if (isTrackingPaused) return;

  if (isInitialDistanceSet) {
    alert('Jarak tempuh awal hanya bisa diisi sekali atau lakukan reset terlebih dahulu.');
  } else {
    const manualDistance = parseFloat(prompt('Masukkan jarak tempuh awal (km):'));
    if (!isNaN(manualDistance) && manualDistance >= 0) {
      initialDistance = manualDistance;
      totalDistance += initialDistance; // Perbarui totalDistance juga
      updateDistance();
      localStorage.setItem('totalDistance', totalDistance);
      localStorage.setItem('initialDistance', initialDistance);
      isInitialDistanceSet = true;
    } else {
      alert('Input tidak valid. Harap masukkan angka yang valid.');
    }
  }
}

function resetInitialDistance() {
  isInitialDistanceSet = false;
  initialDistance = 0;
  totalDistance = 0;
  updateDistance();
  localStorage.removeItem('totalDistance');
  localStorage.removeItem('initialDistance');
}

function toggleTracking() {
  isTrackingPaused = !isTrackingPaused;
  const trackingButton = document.getElementById('trackingButton');

  if (isTrackingPaused) {
    trackingButton.textContent = 'Resume Tracking';
  } else {
    trackingButton.textContent = 'Pause Tracking';
  }
}

function requestLocationPermission() {
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          console.log('Izin akses lokasi sudah diberikan.');
          startTrackingLocation();
        } else if (permissionStatus.state === 'prompt') {
          console.log('Menunggu izin akses lokasi...');
          requestGeolocationPermission();
        } else {
          console.log('Akses lokasi ditolak.');
        }
      })
      .catch((error) => console.error('Error requesting location permission:', error));
  } else if (navigator.geolocation) {
    console.log('Meminta izin akses lokasi...');
    requestGeolocationPermission();
  } else {
    console.log('Perangkat tidak mendukung geolocation.');
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

async function updateDistanceAndLocation(position) {
  if (isTrackingPaused) return;

  const { latitude, longitude } = position.coords;

  const addressElement = document.getElementById('address');
  addressElement.innerHTML = `Lokasi Sekarang: <span class="loading-text">Memperbarui lokasi...</span>`;

  const latitudeElement = document.getElementById('latitude');
  latitudeElement.textContent = latitude.toFixed(6);

  const longitudeElement = document.getElementById('longitude');
  longitudeElement.textContent = longitude.toFixed(6);

  if (previousPosition) {
    const distance = calculateDistance(previousPosition.coords.latitude, previousPosition.coords.longitude, latitude, longitude);
    totalDistance += distance;
    updateDistance();
  }

  previousPosition = position;

  const address = await getAddressFromCoordinates(latitude, longitude);

  // Menghentikan animasi loading dan menampilkan alamat
  addressElement.innerHTML = `Lokasi Sekarang: ${address}`;
}

// Cek apakah data jarak tersimpan di localStorage
if (localStorage.getItem('totalDistance') && localStorage.getItem('initialDistance')) {
  totalDistance = parseFloat(localStorage.getItem('totalDistance'));
  initialDistance = parseFloat(localStorage.getItem('initialDistance'));
  updateDistance();
}

// Memanggil fungsi untuk meminta izin akses lokasi
requestLocationPermission();
