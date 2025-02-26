const apiKey = "dcc3cc1e7eb935483c86154e46c3a55a";
let isDetailedView = true; 
let isCelsius = true; 
let currentPage = 1;
const itemsPerPage = 5;
let currentChart; 


document.getElementById("search-btn").addEventListener("click", function() {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    if (/^[a-zA-Z\s]+$/.test(city)) {
      fetchWeatherAndForecast(city); // البحث عن المدينة
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid City Name',
        text: 'Please enter a valid city name (letters only)!',
        confirmButtonColor: '#3085d6',
      });
    }
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Empty Input',
      text: 'Please enter a city name!',
      confirmButtonColor: '#3085d6',
    });
  }
});

document.getElementById("toggle-unit").addEventListener("change", function () {
  isCelsius = !isCelsius;
  document.getElementById("unit-label").innerText = isCelsius ? "°C" : "°F";
  const city = document.getElementById("city-input").value;
  if (city) {
    fetchWeatherAndForecast(city);
  } else {
    getCurrentLocation();
  }
});

document.getElementById("toggle-theme").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  document.querySelector("header").classList.toggle("dark-mode");
  document.querySelector(".temp-card").classList.toggle("dark-mode");
  document.querySelectorAll(".weather-detail-item").forEach((item) => {
    item.classList.toggle("dark-mode");
  });
  document.querySelector("footer").classList.toggle("dark-mode");
});

document.getElementById("toggle-view").addEventListener("click", function () {
  isDetailedView = !isDetailedView;
  const city = document.getElementById("city-input").value;
  if (city) {
    fetchWeatherAndForecast(city);
  } else {
    getCurrentLocation();
  }
});

document.getElementById("add-favorite").addEventListener("click", function () {
  const city = document.getElementById("location").innerText.split(",")[0];
  if (city) {
    saveFavoriteCity(city);
    displayFavorites();
  }
});

document.getElementById("refresh-data").addEventListener("click", function () {
  const city = document.getElementById("city-input").value;
  if (city) {
    fetchWeatherAndForecast(city);
  } else {
    getCurrentLocation();
  }
  Swal.fire({
    icon: "success",
    title: "Data Refreshed!",
    text: "Weather data has been updated.",
    confirmButtonColor: "#00b09b",
    timer: 2000,
    timerProgressBar: true,
  });
});

// Fetch weather and forecast data for a given city
function fetchWeatherAndForecast(city) {
  showLoading();
  fetchWeatherByCity(city); 
  fetchForecastByCity(city); 
}

// Fetch current weather data for a city using OpenWeatherMap API
function fetchWeatherByCity(city) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        updateWeatherUI(data);
        saveSearchHistory(city); 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'City Not Found',
          text: 'Please enter a valid city name.',
          confirmButtonColor: '#3085d6',
        });
      }
      hideLoading();
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to fetch weather data. Please check your internet connection.',
        confirmButtonColor: '#3085d6',
      });
      hideLoading();
    });
}

// Save a searched city to localStorage
function saveSearchHistory(city) {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!searchHistory.includes(city.toLowerCase())) {
    searchHistory.push(city.toLowerCase());
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    displaySearchHistory(); 
  }
}

// Save a city to favorites in localStorage
function saveFavoriteCity(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(city.toLowerCase())) {
    favorites.push(city.toLowerCase());
    localStorage.setItem("favorites", JSON.stringify(favorites));
    Swal.fire({
      icon: "success",
      title: "City Added!",
      text: "The city has been added to your favorites.",
      confirmButtonColor: "#00b09b",
      timer: 2000,
      timerProgressBar: true,
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "City Already Exists",
      text: "This city is already in your favorites!",
      confirmButtonColor: "#ff5f6d",
    });
  }
}

// Fetch 5-day forecast data for a city using OpenWeatherMap API
function fetchForecastByCity(city) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "200") {
        updateForecastUI(data);
        createTemperatureChart(data);
      } else {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error Fetching Forecast Data',
          text: data.message || 'Failed to fetch forecast data.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
      });
    
      }
      hideLoading();
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to fetch forecast data. Please check your internet connection.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      hideLoading();
    });
}

// Fetch current weather data using latitude and longitude
function fetchWeatherByCoords(lat, lon) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        updateWeatherUI(data);
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Location not found!",
          text: "Please enter a valid city name.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
      hideLoading();
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to fetch weather data!",
        text: "Please enter a valid city name.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      hideLoading();
    });
}

// Fetch 5-day forecast data using latitude and longitude
function fetchForecastByCoords(lat, lon) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "200") {
        updateForecastUI(data);
        createTemperatureChart(data);
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Failed to fetch forecast data!",
          text: "Please enter a valid city name.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
      hideLoading();
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to fetch forecast data!",
        text: "Please enter a valid city name.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      hideLoading();
    });
}

// Update the UI with current weather data
function updateWeatherUI(data) {
  const tempUnit = isCelsius ? "°C" : "°F";
  document.getElementById(
    "temperature"
  ).innerText = `${data.main.temp}${tempUnit}`;
  document.getElementById("weather-condition").innerText =
    data.weather[0].description;
  document.getElementById(
    "location"
  ).innerText = `${data.name}, ${data.sys.country}`;

  const weatherIcon = document.getElementById("weather-icon");
  const weatherCode = data.weather[0].id;
  weatherIcon.src = getWeatherIconSrc(weatherCode);

  if (isDetailedView) {
    document.getElementById("wind-speed").innerText = `${data.wind.speed} ${
      isCelsius ? "km/h" : "mph"
    }`;
    document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;
    document.getElementById("humidity").innerText = `${data.main.humidity}%`;
    document.getElementById("visibility").innerText = `${
      data.visibility / 1000
    } km`;
    document.getElementById("sunrise").innerText = new Date(
      data.sys.sunrise * 1000
    ).toLocaleTimeString();
    document.getElementById("sunset").innerText = new Date(
      data.sys.sunset * 1000
    ).toLocaleTimeString();
    document.querySelector(".weather-details").classList.add("full-view");
    document.querySelector(".weather-details").classList.remove("summary-view");
  } else {
    document.querySelector(".weather-details").classList.add("summary-view");
    document.querySelector(".weather-details").classList.remove("full-view");
  }
}

// Update the UI with 5-day forecast data
function updateForecastUI(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const temp = `${day.main.temp}${isCelsius ? "°C" : "°F"}`;
    const icon = getWeatherIconSrc(day.weather[0].id);

    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item";
    forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="${icon}" height="100px" width="100px" alt="${day.weather[0].description}">
            <p>${temp}</p>
        `;

    forecastContainer.appendChild(forecastItem);
  });
}

// Create a temperature chart for the 5-day forecast
function createTemperatureChart(data) {
  const ctx = document.getElementById("temperature-chart").getContext("2d");
  const labels = data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .map((item) =>
      new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "long" })
    );
  const temperatures = data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .map((item) => item.main.temp);

  if (currentChart) {
    currentChart.destroy();
  }

  currentChart = new Chart(ctx, {
    responsive: true,
    maintainAspectRatio: false,

    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          borderColor: "#3498db",
          borderWidth: 1,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Get the weather icon source based on the weather code
function getWeatherIconSrc(weatherCode) {
  if (weatherCode >= 200 && weatherCode < 300) {
    return "images/thunderstorm.gif";
  } else if (weatherCode >= 300 && weatherCode < 500) {
    return "images/sprinkle.gif";
  } else if (weatherCode >= 500 && weatherCode < 600) {
    return "images/rain.gif";
  } else if (weatherCode >= 600 && weatherCode < 700) {
    return "images/snow.gif";
  } else if (weatherCode >= 700 && weatherCode < 800) {
    return "images/fog.gif";
  } else if (weatherCode === 800) {
    return "images/sunny.gif";
  } else if (weatherCode > 800 && weatherCode < 900) {
    return "images/cloudy.gif";
  } else {
    return "images/na.gif";
  }
}

// Display the search history
function displaySearchHistory() {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const searchHistoryContainer = document.getElementById("search-history");
  searchHistoryContainer.innerHTML = "";

  const totalPages = Math.ceil(searchHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = searchHistory.slice(startIndex, endIndex);

  paginatedData.forEach((city) => {
    const listItem = document.createElement("li");
    listItem.innerText = city;
    listItem.addEventListener("click", () => {
      document.getElementById("city-input").value = city;
      fetchWeatherAndForecast(city);
    });
    searchHistoryContainer.appendChild(listItem);
  });

  updateSearchHistoryPagination(totalPages);
}

// Update the search history pagination
function updateSearchHistoryPagination(totalPages) {
  const paginationContainer = document.getElementById(
    "search-history-pagination"
  );
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("page-button");
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displaySearchHistory();
    });
    paginationContainer.appendChild(pageButton);
  }
}

// Display the favorites list
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesContainer = document.getElementById("favorites");
  favoritesContainer.innerHTML = "";

  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = favorites.slice(startIndex, endIndex);

  paginatedData.forEach((city) => {
    const listItem = document.createElement("li");
    listItem.innerText = city;
    listItem.addEventListener("click", () => {
      fetchWeatherAndForecast(city);
    });
    favoritesContainer.appendChild(listItem);
  });

  updateFavoritesPagination(totalPages);
}

// Update the favorites pagination
function updateFavoritesPagination(totalPages) {
  const paginationContainer = document.getElementById("favorites-pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("page-button");
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayFavorites();
    });
    paginationContainer.appendChild(pageButton);
  }
}

// Get the user's current location using the Geolocation API
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
        fetchForecastByCoords(lat, lon);
      },
      (error) => {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "City not found!",
          text: "Failed to get your location. Please enter a city name.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    );
  } else {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "City not found!",
      text: "Geolocation is not supported by this browser.",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }
}

// Show the loading overlay
function showLoading() {
  document.getElementById("loading-overlay").style.display = "flex";
}

// Hide the loading overlay
function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

// Enable drag and drop for favorites
new Sortable(document.getElementById("favorites"), {
  animation: 150,
  ghostClass: "sortable-ghost",
});

// Call getCurrentLocation when the page loads
window.onload = () => {
  showLoading();
  getCurrentLocation();
  displaySearchHistory();
  displayFavorites();
  hideLoading();
};