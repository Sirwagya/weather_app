const API_KEY = 'db75416a5ff6410cb3c42915262301';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function updateTime() {
    const now = new Date();
    document.getElementById('timeHour').textContent = String(now.getHours()).padStart(2, '0');
    document.getElementById('timeMinute').textContent = String(now.getMinutes()).padStart(2, '0');
}

function updateDate() {
    const now = new Date();
    document.getElementById('dateDay').textContent = String(now.getDate()).padStart(2, '0');
    document.getElementById('dateMonth').textContent = months[now.getMonth()];
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchWeather();
    }
}

async function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    hideError();
    document.getElementById('weatherDisplay').classList.add('loading');

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        showError('City not found. Please try again.');
    } finally {
        document.getElementById('weatherDisplay').classList.remove('loading');
    }
}

function updateWeatherDisplay(data) {
    const { location, current } = data;

    document.getElementById('cityName').textContent = location.name;
    document.getElementById('region').textContent = `${location.region}, ${location.country}`;
    document.getElementById('tempValue').textContent = Math.round(current.temp_c);
    document.getElementById('conditionText').textContent = current.condition.text.toUpperCase();

    const iconUrl = 'https:' + current.condition.icon.replace('64x64', '128x128');
    const iconImg = document.getElementById('weatherIcon');
    iconImg.src = iconUrl;
    iconImg.style.display = 'block';
    document.getElementById('iconPlaceholder').style.display = 'none';

    document.getElementById('latitude').textContent = location.lat.toFixed(4);
    document.getElementById('longitude').textContent = location.lon.toFixed(4);

    const localTime = new Date(location.localtime);
    document.getElementById('timeHour').textContent = String(localTime.getHours()).padStart(2, '0');
    document.getElementById('timeMinute').textContent = String(localTime.getMinutes()).padStart(2, '0');
    document.getElementById('dateDay').textContent = String(localTime.getDate()).padStart(2, '0');
    document.getElementById('dateMonth').textContent = months[localTime.getMonth()];
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${position.coords.latitude},${position.coords.longitude}&aqi=no`);
                    if (response.ok) {
                        const data = await response.json();
                        updateWeatherDisplay(data);
                    }
                } catch (error) {
                    loadDefaultCity();
                }
            },
            () => loadDefaultCity()
        );
    } else {
        loadDefaultCity();
    }
}

async function loadDefaultCity() {
    document.getElementById('cityInput').value = 'Pune';
    await searchWeather();
}

document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    updateTime();
    setInterval(updateTime, 1000);
    getWeatherByLocation();
});
