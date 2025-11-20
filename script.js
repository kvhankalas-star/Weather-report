// ------------------------------
// script.js — Full working file
// ------------------------------

// Put your WeatherAPI key here
const API_KEY = "5e66b46a02394a299ef60753252408";
const BASE_URL = "https://api.weatherapi.com/v1/current.json?aqi=yes";

// Elements
const form = document.getElementById("form");
const queryInput = document.getElementById("query");

const emptyBox = document.getElementById("empty");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");

const place = document.getElementById("place");
const localtime = document.getElementById("localtime");
const temp = document.getElementById("temp");
const icon = document.getElementById("icon");
const condition = document.getElementById("condition");
const feels = document.getElementById("feels");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pm25 = document.getElementById("pm25");
const updated = document.getElementById("updated");

const bg = document.getElementById("season-bg");
const overlay = document.getElementById("daynight-overlay");

// Utility: show loading on button (if present)
function setLoading(isLoading) {
  const btn = document.getElementById("go");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Loading..." : "Search";
}

// ------------------------
// Day / Night detection
// ------------------------
function updateDayNightTheme(localtimeStr) {
  // localtimeStr usually "YYYY-MM-DD HH:MM"
  let hour = 12;
  try {
    const parts = localtimeStr.split(" ");
    if (parts.length >= 2) {
      const hh = parts[1].split(":")[0];
      hour = parseInt(hh, 10);
      if (Number.isNaN(hour)) hour = 12;
    }
  } catch (e) {
    hour = 12;
  }

  const isNight = (hour >= 18 || hour < 6);
  overlay.className = isNight ? "night" : "day";
  return isNight;
}

// ------------------------
// Season background (day/night aware)
// ------------------------
function updateSeasonBackground(text, isNight) {
  text = (text || "").toLowerCase();
  // remove previously set classes (keeps overlay separate)
  bg.className = "";

  const suffix = isNight ? "-night" : "-day";

  if (text.includes("rain") || text.includes("drizzle")) bg.classList.add("rain" + suffix);
  else if (text.includes("snow") || text.includes("sleet") || text.includes("ice")) bg.classList.add("snow" + suffix);
  else if (text.includes("thunder") || text.includes("storm")) bg.classList.add("storm" + suffix);
  else if (text.includes("fog") || text.includes("mist") || text.includes("haze")) bg.classList.add("fog" + suffix);
  else if (text.includes("cloud")) bg.classList.add("cloudy" + suffix);
  else if (text.includes("sunny") || text.includes("clear")) bg.classList.add("sunny" + suffix);
  else bg.classList.add("spring" + suffix); // default
}

// ------------------------
// Fetch weather from API
// ------------------------
async function fetchWeather(q) {
  const url = `${BASE_URL}&key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  // handle non-JSON responses gracefully
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error("Invalid response from weather service");
  }

  if (!res.ok) {
    // WeatherAPI returns { error: { message: "..." } }
    const msg = data && data.error && data.error.message ? data.error.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ------------------------
// Render UI
// ------------------------
function render(data) {
  if (!data || !data.location || !data.current) {
    throw new Error("Incomplete data from API");
  }

  const loc = data.location;
  const cur = data.current;

  place.textContent = `${loc.name}, ${loc.country}`;
  localtime.textContent = loc.localtime;

  temp.textContent = `${cur.temp_c}°C`;
  // Safe icon fallback — WeatherAPI icons are like "//cdn.weatherapi.com/..."
  icon.src = cur.condition && cur.condition.icon ? ("https:" + cur.condition.icon) : "";
  icon.alt = cur.condition && cur.condition.text ? cur.condition.text : "weather icon";

  condition.textContent = cur.condition && cur.condition.text ? cur.condition.text : "-";
  feels.textContent = `Feels like: ${cur.feelslike_c}°C`;

  humidity.textContent = cur.humidity != null ? `${cur.humidity}%` : "-";
  wind.textContent = cur.wind_kph != null ? `${cur.wind_kph} kph` : "-";

  // air_quality may be missing on some plans
  const aq = cur.air_quality && cur.air_quality.pm2_5 != null ? cur.air_quality.pm2_5 : null;
  pm25.textContent = aq !== null ? aq.toFixed(1) : "N/A";

  updated.textContent = cur.last_updated || "-";

  // Day/night and season background
  const isNight = updateDayNightTheme(loc.localtime || "");
  updateSeasonBackground(cur.condition && cur.condition.text ? cur.condition.text : "", isNight);

  emptyBox.style.display = "none";
  errorBox.style.display = "none";
  resultBox.style.display = "block";
}

// ------------------------
// Clear UI
// ------------------------
function clearUI() {
  place.textContent = "";
  localtime.textContent = "";
  temp.textContent = "";
  icon.src = "";
  condition.textContent = "";
  feels.textContent = "";
  humidity.textContent = "";
  wind.textContent = "";
  pm25.textContent = "";
  updated.textContent = "";

  resultBox.style.display = "none";
  emptyBox.style.display = "block";
  errorBox.style.display = "none";
}

// ------------------------
// Handle form submit
// ------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = queryInput.value.trim();
  if (!q) {
    errorBox.textContent = "⚠ Please enter a city name.";
    errorBox.style.display = "block";
    return;
  }

  // Start loading
  setLoading(true);
  errorBox.style.display = "none";

  try {
    const data = await fetchWeather(q);

    // WeatherAPI may return an error object in JSON even with 200, check
    if (data.error) {
      throw new Error(data.error.message || "Weather API error");
    }

    render(data);
  } catch (err) {
    // Show a friendly message
    clearUI();
    errorBox.textContent = "⚠ " + (err.message || "Failed to fetch weather");
    errorBox.style.display = "block";
  } finally {
    setLoading(false);
  }
});

// ------------------------
// Optional: allow clicking the button or pressing Enter to work
// ------------------------
document.getElementById("go")?.addEventListener("click", (e) => {
  // button type default is submit so form will handle it; this prevents double submit in some browsers
  e.preventDefault();
  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
});

// Initialize UI
clearUI();
