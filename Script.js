document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const recentCitiesSelect = document.getElementById('recent-cities');
    const recentCitiesContainer = document.getElementById('recent-cities-container');

    const currentWeatherDiv = document.getElementById('current-weather');
    const currentCitySpan = document.getElementById('current-city');
    const currentTempSpan = document.getElementById('current-temp');
    const currentWindSpan = document.getElementById('current-wind');
    const currentHumiditySpan = document.getElementById('current-humidity');
    const currentWeatherIcon = document.getElementById('current-weather-icon');
    const currentDescription = document.getElementById('current-description');

    const forecastContainer = document.getElementById('forecast-container');

    const API_KEY = '1305045a05d74521ad5f9fcd47d30ae9';

    // State-to-city fallback map
    const stateToCityMap = {
        "madhya pradesh": "Bhopal",
        "uttar pradesh": "Lucknow",
        "maharashtra": "Mumbai",
        "rajasthan": "Jaipur",
        "gujarat": "Ahmedabad",
        "tamil nadu": "Chennai",
        "kerala": "Thiruvananthapuram",
        "karnataka": "Bengaluru",
        "punjab": "Chandigarh",
        "haryana": "Chandigarh",
        "bihar": "Patna",
        "west bengal": "Kolkata",
        "odisha": "Bhubaneswar",
        "andhra pradesh": "Amaravati",
        "telangana": "Hyderabad",
        "chhattisgarh": "Raipur",
        "jharkhand": "Ranchi",
        "assam": "Dispur",
        "delhi": "Delhi"
    };

    const getWeatherData = async (city) => {
        if (!city) {
            alert('Please enter a city name.');
            return;
        }

        const normalizedCity = city.trim().toLowerCase();
        if (stateToCityMap[normalizedCity]) {
            city = stateToCityMap[normalizedCity];
        }

        try {
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
            const currentResponse = await fetch(currentWeatherUrl);
            if (!currentResponse.ok) {
                if (currentResponse.status === 404) {
                    alert('City not found. Please enter a valid city name, not a state or region.');
                } else {
                    throw new Error(`HTTP error! status: ${currentResponse.status}`);
                }
                return;
            }
            const currentData = await currentResponse.json();
            displayCurrentWeather(currentData);

            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error(`HTTP error! status: ${forecastResponse.status}`);
            }
            const forecastData = await forecastResponse.json();
            displayExtendedForecast(forecastData);

            addCityToRecent(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Could not retrieve weather data. Please try again later.');
        }
    };

    const getWeatherDataByCoordinates = async (latitude, longitude) => {
        try {
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            const currentResponse = await fetch(currentWeatherUrl);
            if (!currentResponse.ok) {
                throw new Error(`HTTP error! status: ${currentResponse.status}`);
            }
            const currentData = await currentResponse.json();
            displayCurrentWeather(currentData);

            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error(`HTTP error! status: ${forecastResponse.status}`);
            }
            const forecastData = await forecastResponse.json();
            displayExtendedForecast(forecastData);

            addCityToRecent(currentData.name);
        } catch (error) {
            console.error('Error fetching weather data by coordinates:', error);
            alert('Could not retrieve weather data for current location. Please ensure location services are enabled.');
        }
    };

    const displayCurrentWeather = (data) => {
        const date = new Date(data.dt * 1000).toLocaleDateString();
        currentCitySpan.textContent = `${data.name} (${date})`;
        currentTempSpan.textContent = `${data.main.temp}°C`;
        currentWindSpan.textContent = `${data.wind.speed} M/S`;
        currentHumiditySpan.textContent = `${data.main.humidity}%`;
        currentWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        currentWeatherIcon.alt = data.weather[0].description;
        currentDescription.textContent = data.weather[0].description;
    };

    const displayExtendedForecast = (data) => {
        forecastContainer.innerHTML = '';
        const dailyForecasts = {};

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = item;
            }
        });

        let count = 0;
        for (const date in dailyForecasts) {
            if (count >= 5) break;
            const item = dailyForecasts[date];

            const forecastCard = document.createElement('div');
            forecastCard.className = 'bg-gray-200 p-4 rounded-lg text-center';
            forecastCard.innerHTML = `
                <h4 class="font-medium text-gray-700">(${date})</h4>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="weather icon" class="w-12 h-12 mx-auto mb-2">
                <p>Temp: ${item.main.temp}°C</p>
                <p>Wind: ${item.wind.speed} M/S</p>
                <p>Humidity: ${item.main.humidity}%</p>
            `;
            forecastContainer.appendChild(forecastCard);
            count++;
        }
    };

    const addCityToRecent = (city) => {
        let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        if (!recentCities.includes(city)) {
            recentCities.unshift(city);
            if (recentCities.length > 5) {
                recentCities.pop();
            }
            localStorage.setItem('recentCities', JSON.stringify(recentCities));
            populateRecentCitiesDropdown();
        }
    };

    const populateRecentCitiesDropdown = () => {
        const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        recentCitiesSelect.innerHTML = '<option value="">Select a recent city</option>';
        if (recentCities.length > 0) {
            recentCitiesContainer.classList.remove('hidden');
            recentCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                recentCitiesSelect.appendChild(option);
            });
        } else {
            recentCitiesContainer.classList.add('hidden');
        }
    };

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        getWeatherData(city);
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            getWeatherData(city);
        }
    });

    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoordinates(latitude, longitude);
            }, error => {
                console.error('Error getting current location:', error);
                alert('Unable to retrieve your current location. Please enable location services or search by city name.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    recentCitiesSelect.addEventListener('change', (event) => {
        const selectedCity = event.target.value;
        if (selectedCity) {
            getWeatherData(selectedCity);
        }
    });

    populateRecentCitiesDropdown();
});
