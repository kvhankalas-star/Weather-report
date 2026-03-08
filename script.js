
        // API CONFIG & STATE
        let map = null;
        let marker = null;
        let searchTimeout = null;

        const ICONS = {
            Clear: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
            Clouds: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-200"><path d="M17.5 19.12A4.47 4.47 0 0 0 17.5 10.12A5 5 0 0 0 8 7.62A5 5 0 0 0 3 13.62A4.5 4.5 0 0 0 4.5 22.12h13z"/></svg>',
            Rain: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-300"><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>',
            Thunderstorm: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-300"><path d="M13 2l-2 9h4l-2 9"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>',
            Snow: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m8 2 8 20"/><path d="m20 2-8 20"/><path d="M2 12h20"/><path d="m6.34 6.34 11.32 11.32"/><path d="m6.34 17.66 11.32-11.32"/></svg>'
        };

        const parseWmoCode = (code) => {
            if (code === 0) return 'Clear';
            if (code >= 1 && code <= 3) return 'Clouds';
            if (code >= 45 && code <= 48) return 'Clouds'; 
            if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return 'Rain'; 
            if (code >= 61 && code <= 67) return 'Rain';
            if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';
            if (code >= 95 && code <= 99) return 'Thunderstorm';
            return 'Clear';
        };

        // Standardize strings for display (capitalize first letters)
        const formatString = (str) => {
            if (!str) return "--";
            return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        };

        const updateBackground = (condition, isNight) => {
            const body = document.body;
            const thunderLayer = document.getElementById('thunder-layer');
            let gradient = 'from-blue-600 to-indigo-800';
            
            thunderLayer.classList.remove('thunder-active');

            if (isNight) {
                gradient = 'from-gray-950 via-slate-900 to-black';
            } else {
                switch(condition) {
                    case 'Clear': gradient = 'from-cyan-400 via-blue-500 to-blue-600'; break;
                    case 'Clouds': gradient = 'from-gray-400 via-slate-500 to-gray-600'; break;
                    case 'Rain': gradient = 'from-slate-700 via-gray-800 to-slate-900'; break;
                    case 'Thunderstorm': 
                        gradient = 'from-purple-900 via-slate-900 to-black';
                        thunderLayer.classList.add('thunder-active');
                        break;
                    case 'Snow': gradient = 'from-blue-100 via-blue-300 to-white'; break;
                }
            }
            body.className = `weather-bg min-h-screen text-white overflow-x-hidden bg-gradient-to-br ${gradient}`;
            renderAnimations(condition, isNight);
        };

        const renderAnimations = (condition, isNight) => {
            const container = document.getElementById('animations-layer');
            container.innerHTML = '';
            
            // Add clouds for cloudy/rainy/snowy conditions
            if (['Clouds', 'Rain', 'Snow', 'Thunderstorm'].includes(condition)) {
                for (let i = 0; i < 5; i++) {
                    const cloud = document.createElement('div');
                    cloud.className = 'absolute bg-white/20 blur-[60px] rounded-full';
                    cloud.style.width = (200 + Math.random() * 400) + 'px';
                    cloud.style.height = (100 + Math.random() * 200) + 'px';
                    cloud.style.top = (Math.random() * 40) + 'vh';
                    cloud.style.left = '-400px';
                    cloud.style.animation = `cloudDrift ${20 + Math.random() * 40}s linear infinite`;
                    cloud.style.animationDelay = (i * -10) + 's';
                    container.appendChild(cloud);
                }
            }

            if (condition === 'Rain' || condition === 'Thunderstorm') {
                for (let i = 0; i < 60; i++) {
                    const drop = document.createElement('div');
                    drop.className = 'absolute bg-blue-200/40 rounded-full';
                    drop.style.left = Math.random() * 100 + 'vw';
                    drop.style.top = -Math.random() * 20 + 'vh';
                    drop.style.width = '1.5px';
                    drop.style.height = (15 + Math.random() * 25) + 'px';
                    drop.style.animation = `rainfall ${0.4 + Math.random() * 0.4}s linear infinite`;
                    drop.style.animationDelay = Math.random() * 2 + 's';
                    container.appendChild(drop);
                }
            } else if (condition === 'Snow') {
                for (let i = 0; i < 80; i++) {
                    const flake = document.createElement('div');
                    flake.className = 'absolute bg-white/80 rounded-full blur-[1px]';
                    flake.style.left = Math.random() * 100 + 'vw';
                    flake.style.top = -Math.random() * 20 + 'vh';
                    flake.style.width = (3 + Math.random() * 5) + 'px';
                    flake.style.height = flake.style.width;
                    flake.style.animation = `snowfall ${4 + Math.random() * 6}s linear infinite`;
                    flake.style.animationDelay = Math.random() * 5 + 's';
                    container.appendChild(flake);
                }
            } else if (condition === 'Clear' && !isNight) {
                const sun = document.createElement('div');
                sun.className = 'absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-[40px] opacity-40';
                sun.style.animation = 'pulse-sun 10s ease-in-out infinite';
                container.appendChild(sun);
            }
        };

        const fetchWeather = async (lat, lon, cityName = null) => {
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');

            try {
                // Weather Data
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure,visibility&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
                const data = await res.json();

                // Reverse Geocode if city name not provided
                if (!cityName) {
                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
                        const geoData = await geoRes.json();
                        cityName = geoData.name || 
                                  (geoData.address && (geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state)) || 
                                  "Current Location";
                    } catch (e) {
                        cityName = "Current Location";
                    }
                }

                const condition = parseWmoCode(data.current.weather_code);
                const isNight = data.current.is_day === 0;

                // Update UI with formatted name
                document.getElementById('city-name').innerText = formatString(cityName);
                document.getElementById('condition-text').innerText = condition;
                document.getElementById('main-temp').innerText = Math.round(data.current.temperature_2m) + '°';
                document.getElementById('feels-like').innerText = `RealFeel® ${Math.round(data.current.apparent_temperature)}°`;
                document.getElementById('temp-max').innerText = Math.round(data.daily.temperature_2m_max[0]);
                document.getElementById('temp-min').innerText = Math.round(data.daily.temperature_2m_min[0]);
                document.getElementById('main-icon').innerHTML = ICONS[condition] || ICONS.Clear;

                // Stats Grid
                const stats = [
                    { label: 'Humidity', val: data.current.relative_humidity_2m + '%' },
                    { label: 'Wind', val: (data.current.wind_speed_10m / 3.6).toFixed(1) + ' m/s' },
                    { label: 'Pressure', val: data.current.surface_pressure + ' hPa' },
                    { label: 'Visibility', val: (data.current.visibility / 1000).toFixed(1) + ' km' },
                    { label: 'Sunrise', val: new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) },
                    { label: 'Sunset', val: new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
                ];
                
                const statsHtml = stats.map(s => `
                    <div class="glass-panel p-6 rounded-3xl flex flex-col justify-between items-start hover:bg-white/20 transition-all">
                        <span class="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">${s.label}</span>
                        <span class="text-3xl font-black">${s.val}</span>
                    </div>
                `).join('');
                document.getElementById('stats-grid').innerHTML = statsHtml;

                // Hourly
                const hourlyHtml = data.hourly.time.slice(0, 12).map((time, i) => `
                    <div class="flex flex-col items-center min-w-[90px] p-5 glass-panel rounded-2xl bg-white/5 border-transparent hover:border-white/20 transition-all">
                        <span class="text-sm font-bold text-white/40 mb-4">${new Date(time).getHours()}:00</span>
                        ${ICONS[parseWmoCode(data.hourly.weather_code[i])] || ''}
                        <span class="text-2xl font-black mt-4">${Math.round(data.hourly.temperature_2m[i])}°</span>
                    </div>
                `).join('');
                document.getElementById('hourly-forecast').innerHTML = hourlyHtml;

                // Daily
                const dailyHtml = data.daily.time.map((time, i) => `
                    <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors">
                        <span class="w-24 font-bold text-lg">${i === 0 ? 'Today' : new Date(time).toLocaleDateString([], {weekday:'short'})}</span>
                        <div class="flex-1 flex justify-center scale-75 md:scale-100">${ICONS[parseWmoCode(data.daily.weather_code[i])] || ''}</div>
                        <div class="flex items-center gap-6 w-32 justify-end">
                            <span class="text-white/40 font-medium">${Math.round(data.daily.temperature_2m_min[i])}°</span>
                            <span class="font-black text-xl">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                        </div>
                    </div>
                `).join('');
                document.getElementById('daily-forecast').innerHTML = dailyHtml;

                updateBackground(condition, isNight);
                updateMap(lat, lon);

                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');

            } catch (err) {
                console.error(err);
                document.getElementById('loading-state').innerHTML = `<p class='text-red-400 font-bold'>Unable to find weather for this location.</p><button onclick="location.reload()" class="mt-4 px-4 py-2 glass-panel rounded-xl">Try Again</button>`;
            }


        };

        const updateMap = (lat, lon) => {

    if (!map) {

        map = L.map('map', { zoomControl: false }).setView([lat, lon], 10);

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        ).addTo(map);

        map.on('click', (e) => fetchWeather(e.latlng.lat, e.latlng.lng));

    } else {

        map.setView([lat, lon]);

    }

    if (marker) map.removeLayer(marker);

    marker = L.marker([lat, lon]).addTo(map);

    // FIX FOR MAP SIZE
    setTimeout(() => {
        map.invalidateSize();
    }, 200);
};
        // SEARCH FUNCTIONALITY
        const searchInput = document.getElementById('search-input');
        const suggestionsDiv = document.getElementById('suggestions');

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (searchTimeout) clearTimeout(searchTimeout);
            if (val.length < 2) { suggestionsDiv.classList.add('hidden'); return; }

            searchTimeout = setTimeout(async () => {
                try {
                    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5`);
                    const data = await res.json();
                    if (!data.results) {
                        suggestionsDiv.innerHTML = `<div class="px-5 py-4 text-white/50 italic">No locations found...</div>`;
                        suggestionsDiv.classList.remove('hidden');
                        return;
                    }

                    suggestionsDiv.innerHTML = data.results.map(r => `
                        <div class="px-5 py-4 hover:bg-white/20 cursor-pointer border-b border-white/5 flex flex-col" onclick="selectCity(${r.latitude}, ${r.longitude}, '${r.name.replace(/'/g, "\\'")}')">
                            <p class="font-bold text-lg">${formatString(r.name)}</p>
                            <p class="text-xs text-white/50 uppercase tracking-tighter">${r.country} ${r.admin1 || ''}</p>
                        </div>
                    `).join('');
                    suggestionsDiv.classList.remove('hidden');
                } catch (e) {
                    console.error("Geocoding error", e);
                }
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.classList.add('hidden');
            }
        });

        window.selectCity = (lat, lon, name) => {
            fetchWeather(lat, lon, name);
            suggestionsDiv.classList.add('hidden');
            searchInput.value = '';
        };

        // INITIAL LOAD
        window.onload = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    p => fetchWeather(p.coords.latitude, p.coords.longitude),
                    () => fetchWeather(40.71, -74.00, "New York")
                );
            } else {
                fetchWeather(40.71, -74.00, "New York");
            }
        };







      
