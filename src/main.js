// importing the sass stylesheet for bundling
import "./../sass/styles.scss";
import "./../lib/weather-icons-master/css/weather-icons.min.css";
import "./../lib/weather-icons-master/css/weather-icons-wind.min.css";
import { Spinner } from "spin.js";
import "spin.js/spin.css";
import { getJSONData, StorageManager } from "./Toolkit";

const WEATHER_CODE_MAP = {0:800, 1:801, 2:802, 3:804, 45:741, 48:741, 51:300, 53:300, 55:300, 56:300, 57:300, 61:500, 63:501, 65:502, 66:511, 67:511, 71:600, 73:601, 75:602, 77:602, 80:520, 81:521, 82:522, 85:620, 86:622, 95:211, 9:211, 99:211};
const WEEKDAY_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let now = new Date();
let selectedCity;
let citiesData;

let weatherDesc;
let weatherIco;

// html DOM mapping
let htmlLoadingOverlay = document.querySelector(".g-loading-overlay");
let htmlNavDropdown = document.querySelector("nav select");
let htmlHourlyContainer = document.querySelector(".hour-summary-container");
let htmlDailyContainer = document.querySelector(".ten-day-block");
let htmlCurTemperature = document.querySelectorAll(".g-cur-temp");
let htmlLowTemperature = document.querySelectorAll(".g-cur-low");
let htmlHighTemperature = document.querySelectorAll(".g-cur-high");
let htmlCityName = document.querySelector("#s-summary .city-name");
let htmlWeatherDesc = document.querySelector("#s-summary .cur-condition");
let htmlDailySummary = document.querySelector("#s-blocks .hour-summary-block .title");
let htmlFeelsLikeData = document.querySelector("#s-blocks #feels_like .info");
let htmlFeelsLikeTooltip = document.querySelector("#s-blocks #feels_like .tooltip");
let htmlPrecipitationData = document.querySelector("#s-blocks #precipitation .info");
let htmlPrecipitationData2 = document.querySelector("#s-blocks #precipitation .info2");
let htmlHumidityData = document.querySelector("#s-blocks #humidity .info");
let htmlHumidityDew = document.querySelector("#s-blocks #humidity .dew");
let htmlVisibilityData = document.querySelector("#s-blocks #visibility .info");
let htmlVisibilityTooltip = document.querySelector("#s-blocks #visibility .tooltip");
let htmlPressureData = document.querySelector("#s-blocks #pressure .info");
let htmlPressureTooltip = document.querySelector("#s-blocks #pressure .tooltip");
let htmlHourlyTemplate = document.querySelector(".hour-container.template");
let htmlDailyTemplate = document.querySelector(".day-container.template");
let bgCurrent = document.querySelector(".bg-current");
let bgNew = document.querySelector(".bg-new");

new Spinner({ color: "#FFFFFF", lines: 12 }).spin(document.querySelector(".g-loading-overlay"));
let storage = new StorageManager();

/**
 * Populates a dropdown menu with city data and fetches weather information for the selected city.
 *
 * @param {Object} data - The data object containing city information.
 */
function populateDropdown(data) {
    // if first load 
    if (!htmlNavDropdown.hasChildNodes()) {
        citiesData = data.data;
        citiesData.cities.forEach(city => {
            let option = document.createElement("option");
            option.innerHTML = `${city.name}, ${city.province}`;
            htmlNavDropdown.add(option);
        });

        if (storage.read("dropdownValue")) {
            htmlNavDropdown.value = storage.read("dropdownValue");
        }
    }

    // save dropdown data and start populating HTML
    storage.write("dropdownValue", htmlNavDropdown.value);
    selectedCity = htmlNavDropdown.value.split(",")[0];
    getJSONData(`https://api.openweathermap.org/data/2.5/weather?q=${selectedCity},CA&units=metric&appid=${process.env.API_KEY}`, populateCurrentWeather, onError);
}

/**
 * Populates the current weather information on the webpage.
 * 
 * @param {Object} data - The weather data object from the API response.
 */
function populateCurrentWeather(data) {
    if (data.cod == 200) {
        // parse data
        weatherDesc = data.weather[0].main;
        weatherIco = data.weather[0].id;
        let province = citiesData.cities.find(cityObj => cityObj.name == selectedCity).provinceShort;
        let curTemp = Math.round(data.main.temp);
        let feelsLike = Math.round(data.main.feels_like);
        let minTemp = Math.round(data.main.temp_min);
        let maxTemp = Math.round(data.main.temp_max);
        let dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);
        let visibility = Math.round(data.visibility / 1000);

        // parse weather description
        if (data.weather[0].main == "Clouds") {
            if (data.weather[0].description == "few clouds" || data.weather[0].description == "broken clouds") {
                weatherDesc = "Partly Cloudy";
            } else {
                weatherDesc = "Cloudy";
            }
        }

        // populate HTML with data
        htmlCityName.innerHTML = `${selectedCity}, ${province}`;
        htmlWeatherDesc.innerHTML = weatherDesc;
        htmlCurTemperature.forEach(element => element.innerHTML = `${curTemp}°`);
        htmlHighTemperature.forEach(element => element.innerHTML = `${maxTemp}°`);
        htmlLowTemperature.forEach(element => element.innerHTML = `${minTemp}°`);
        htmlFeelsLikeData.innerHTML = `${feelsLike}°`;
        htmlHumidityData.innerHTML = `${data.main.humidity}%`;
        htmlHumidityDew.innerHTML = `${dewPoint}°`;
        htmlVisibilityData.innerHTML = `${visibility} km`;
        htmlPressureData.innerHTML = `${data.main.pressure} hPa`;

        // precipitation population
        if (data.rain) {
            if (data.rain["1h"]) {
                htmlPrecipitationData.innerHTML = `${Math.round(data.rain["1h"])} mm`;
                htmlPrecipitationData2.innerHTML = "in last hour";
            } else if (data.rain["3h"]) {
                htmlPrecipitationData.innerHTML = `${Math.round(data.rain["3h"])} mm`;
                htmlPrecipitationData2.innerHTML = "in last 3 hours";
            }
        } else if (data.snow) { 
            if (data.snow["1h"]) {
                htmlPrecipitationData.innerHTML = `${Math.round(data.snow["1h"] / 100)} cm`;
                htmlPrecipitationData2.innerHTML = "in last hour";
            } else if (data.snow["3h"]) {
                htmlPrecipitationData.innerHTML = `${Math.round(data.snow["3h"]/ 100)} cm`;
                htmlPrecipitationData2.innerHTML = "in last 3 hours";
            }
        } else {
            htmlPrecipitationData.innerHTML = "0 mm";
            htmlPrecipitationData2.innerHTML = "in last 3h";
        }

        // wind population
        document.querySelector(".block#wind .info i").className = `wi wi-wind towards-${data.wind.deg}-deg`;
        document.querySelector(".block#wind .windSpeed").innerHTML = `${data.wind.deg}° | ${Math.round(data.wind.speed * 3.6)} km/h`;
        // visibility adjustment
        if (visibility == 0) {
            htmlVisibilityData.innerHTML = "<1 km";
        } else if (visibility == 10) {
            htmlVisibilityData.innerHTML = ">10 km";
        }

        // feels like tooltip
        if (feelsLike < curTemp) {
            htmlFeelsLikeTooltip.innerHTML = "Wind is making it feel colder.";
        } else if (feelsLike == curTemp) {
            htmlFeelsLikeTooltip.innerHTML = "Similar to the actual temperature.";
        } else if (feelsLike > curTemp) {
            htmlFeelsLikeTooltip.innerHTML = "Humidity is making it feel warmer.";
        }

        // visibility tooltip
        if (visibility == 10) {
            htmlVisibilityTooltip.innerHTML = "Perfectly clear view.";
        } else if (visibility < 10 && visibility >= 5) {
            htmlVisibilityTooltip.innerHTML = "Fairly clear view.";
        } else if (visibility < 5 && visibility >= 3) {
            htmlVisibilityTooltip.innerHTML = "Clear view.";
        } else if (visibility < 3 && visibility >= 1) {
            htmlVisibilityTooltip.innerHTML = "Low visibility.";
        } else if (visibility < 1) {
            htmlVisibilityTooltip.innerHTML = "Very low visibility.";
        }

        // pressure tooltip
        if (data.main.pressure > 1025) {
            htmlPressureTooltip.innerHTML = "Air pressure is higher than normal.";
        } else if (data.main.pressure < 1025 && data.main.pressure >= 1000) {
            htmlPressureTooltip.innerHTML = "Air pressure is normal.";
        } else if (data.main.pressure < 1000) {
            htmlPressureTooltip.innerHTML = "Air pressure is lower than normal.";
        }

        getJSONData(`https://api.open-meteo.com/v1/forecast?latitude=${data.coord.lat}&longitude=${data.coord.lon}&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`, populateForecastWeather, onError);
    } else {
        htmlCityName.innerHTML = "City Not Found";
    }
}

/**
 * Populates the forecast weather data on the webpage.
 *
 * @param {Object} data - The weather data object.
 */
function populateForecastWeather(data) {
    // get current time in city timezone
    now = new Date(new Date().toLocaleString("en-US", {timeZone: data.timezone}));

    // populate hourly data
    let hourlyElement;
    let curTimeIndex = now.getHours() + 1;
    for (let i = 0; i < 24; i++) {
        let code = data.hourly.weather_code[curTimeIndex];

        hourlyElement = htmlHourlyTemplate.cloneNode(true);
        hourlyElement.classList.remove("template");
        hourlyElement.classList.add("dyn");
        hourlyElement.querySelector(".time").innerHTML = simplifyTime(data.hourly.time[curTimeIndex]);
        hourlyElement.querySelector(".temp").innerHTML = Math.round(data.hourly.temperature_2m[curTimeIndex]) + "°";
    
        curTimeIndex < 18 ?
            hourlyElement.querySelector(".icon i").classList.add(`wi-owm-day-${WEATHER_CODE_MAP[code]}`) :
            hourlyElement.querySelector(".icon i").classList.add(`wi-owm-night-${WEATHER_CODE_MAP[code]}`)
        ;
        
        hourlyElement.removeAttribute("style");
        htmlHourlyContainer.appendChild(hourlyElement);
        curTimeIndex++;
    }

    // populate daily data
    document.querySelector(".day-container#today .icon i").className = `wi wi-owm-${WEATHER_CODE_MAP[data.daily.weather_code[0]]}`;

    let dailyElement;
    let weekdayIndex = now.getDay() + 1;
    for (let i = 0; i < 9; i++) {
        if (weekdayIndex == 7) weekdayIndex = 0;

        let code = data.daily.weather_code[i + 1];
        let hr = document.createElement("hr");
        hr.classList.add("dyn");

        dailyElement = htmlDailyTemplate.cloneNode(true);
        dailyElement.classList.remove("template");
        dailyElement.classList.add("dyn");
        dailyElement.querySelector(".weekday").innerHTML = `${WEEKDAY_MAP[weekdayIndex].substring(0, 3)}`;
        dailyElement.querySelector(".low").innerHTML = Math.round(data.daily.temperature_2m_min[i + 1]) + "°";
        dailyElement.querySelector(".high").innerHTML = Math.round(data.daily.temperature_2m_max[i + 1]) + "°";
        dailyElement.querySelector(".icon i").classList.add(`wi-owm-${WEATHER_CODE_MAP[code]}`);
        dailyElement.removeAttribute("style");
        htmlDailyContainer.appendChild(dailyElement);
        htmlDailyContainer.appendChild(hr);
        weekdayIndex++;
    }

    htmlDailySummary.innerHTML = `On ${WEEKDAY_MAP[now.getDay() + 1]}, expect a low of ${Math.round(data.daily.temperature_2m_min[1])}° and high of ${Math.round(data.daily.temperature_2m_max[1])}°.`;

    // --------------------------- finish current weather population (things requiring time in city's timezone)
    // icon population
    now.getHours() < 18 ?
        document.querySelector(".hour-summary-container div:first-child i").className = `wi wi-owm-day-${weatherIco}` :
        document.querySelector(".hour-summary-container div:first-child i").className = `wi wi-owm-night-${weatherIco}`
    ;

    // background update
    if (weatherDesc == "Cloudy") {
        bgNew.className = "bg bg-new bg-cloudy";
    } else if (weatherDesc == "Drizzle") {
        bgNew.className = "bg bg-new bg-rain";
    } else if (weatherDesc == "Rain") {
        bgNew.className = "bg bg-new bg-rain";
    } else if (weatherDesc == "Thunderstorm") {
        bgNew.className = "bg bg-new bg-rain";
    } else if (weatherDesc == "Snow") {
        bgNew.className = "bg bg-new bg-snow";
    } else if (now.getHours() < 18) {
        bgNew.className = "bg bg-new bg-clear";
    } else if (now.getHours() >= 18) {
        bgNew.className = "bg bg-new bg-night";
    }

    bgCurrent.style.opacity = "0";
    bgNew.style.opacity = "1";
    setTimeout(function() {
        let temp = bgCurrent;
        bgCurrent = bgNew;
        bgNew = temp;
    }, 1000);

    // remove loading overlay when done
    htmlLoadingOverlay.style.display = "none";
}

/**
 * Handles errors that occur during the loading of weather data.
 *
 * @param {Error} error - The error object containing details about the error.
 */
function onError(error) {    
    console.log("There was an error loading the weather data: " + error);
}

/**
 * Handles the change event for a dropdown or input element.
 * 
 * This function performs the following actions:
 * 1. Sets all elements with the class "g-info" to display "-" to indicate loading.
 * 2. Removes all elements with the class "dyn" to clear space for new dynamic content.
 * 3. Fetches new data from "cities.json" and repopulates the HTML with the new data.
 * 
 * @param {Event} e - The change event object.
 */
function onChange(e) {
    // set all data fields to "-" when loading new data (did this instead of graying out for the clone's purpose, hope you get it Sean)
    document.querySelectorAll(".g-info").forEach(element => element.innerHTML = "-");
    // remove all dynamic elements to give space to new ones
    document.querySelectorAll(".dyn").forEach(element => element.remove());
    // repopulate HTML with new data
    getJSONData("./cities.json", populateDropdown, onError);
}

/**
 * Calculates the dew point given the temperature and humidity.
 *
 * The dew point is the temperature at which air becomes saturated with moisture
 * and water droplets begin to form. This function uses the Magnus formula to
 * approximate the dew point.
 *
 * @param {number} temp - The current temperature in degrees Celsius.
 * @param {number} humidity - The current relative humidity as a percentage (0-100).
 * @returns {number} The calculated dew point in degrees Celsius, rounded to the nearest integer.
 */
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    let alpha = ((a * temp) / (b + temp)) + Math.log(humidity/100.0);
    let dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
}

/**
 * Simplifies an ISO time string to a 12-hour format with AM/PM.
 *
 * @param {string} isoTime - The ISO time string to be simplified.
 * @returns {string} The simplified time in 12-hour format with AM/PM.
 */
function simplifyTime(isoTime) {
    let hours = isoTime.slice(11, 13);
    let ampm = "am";

    if (hours == 12) {
        ampm = "pm";
    } else if (hours == 0) {
        hours = 12;
    } else if (hours > 12) {
        hours -= 12;
        ampm = "pm";
    }

    // the regex here removes the "0" from hours like "02", "06" etc.
    return `${hours.toString().replace(/^0/, "")} ${ampm}`;
}

/**
 * Main function to initialize the weather app.
 * It fetches JSON data for cities, populates the dropdown menu,
 * and sets up an event listener for changes in the dropdown selection.
 */
function main() {
    getJSONData("./cities.json", populateDropdown, onError);
    htmlNavDropdown.addEventListener("change", onChange);
}

main();