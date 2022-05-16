const apikey = '33981d26ad23ea768486e597389db299';
// Storage for past searches, would be saved as "pastSearches" in local storage
let pastSearches = [];

// format current weather
let currentWeatherBox = (currentData, locationName) => {
  console.log(currentData);
  let dt = new Date(currentData.dt*1000);
  let uvIndexClass = currentData.uvi<3? 'uv-favorable': currentData.uvi< 7? 'uv-moderate': 'uv-high';
  let weather = currentData.weather[0];
  
  return `<h3>${locationName +' '+ dt.toDateString() +' ' }</h3>
   <img src="http://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
  <p>Temp: ${currentData.temp}&#176 F</p>
  <p>Wind: ${currentData.wind_speed}</p>
  <p>Humidity: ${currentData.humidity}%</p>
  <p>UV index: <span class=${uvIndexClass}>${currentData.uvi}</span></p>`;
};

//format a forecast article box from 
let forecastBox = (dailyData) => {
  let dt = new Date(dailyData.dt*1000);

  return `<article>
  <h3>${dt.toDateString()}</h3>
  <p>Temp: ${dailyData.temp.day} F</p>
  <p>Wind: ${dailyData.wind_speed} MPH</p>
  <p>Humidity: ${dailyData.humidity} %</p>
</article>`;
  
}

// search submit handler
$('#search-form').on('submit', function(event) {
  event.preventDefault();
  let location = $("#search-box").val().trim();
  getGeolocation(location);
} );

/**
 * Calls Open weather API with name of city to get the {lat, long}  
 * API params q:city name, APIKey: personal API key, limit: limit number of responses
 * Will only ask for 1 location
 * @param location 
 */
let getGeolocation = (locationString) => {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${locationString}&limit=1&appid=${apikey}`)
    .then(response => {
      console.log(response);
        return response.json()
    }).then(data => {
        // is this working?
        console.log(data)
        return {lat, lon, name} = data[0];
    }).then(locationObj => {
        getWeatherData(locationObj);
    }).catch( (err) => {
      console.log(err);
    });
};

/**
 * API call function for city
 * params: location object 
 * returns: JSON object of the location
 */ 
let getWeatherData = (location) => {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&units=${'imperial'}&appid=${apikey}`)
  .then(response => {
      return response.json();
  }).then((data) => {
    // what did I get back?
    console.log(data)
    displayWeather(data, location.name);
  }).catch((err) => {
    console.log(err);
  });
};

/**
 * display data to dashboard
 * params: JSON data for city
 * returns: null
 */
let displayWeather = (weatherData, locationName) => {
  $('#target-current-weather').html( currentWeatherBox(weatherData.current, locationName) );
};

/**
 * onLoad: get local data for past searches, the populate the button list
 */
let onLoad = () =>{
    let tempPast = JSON.parse(localStorage.getItem('pastSearches') );
    if(tempPast){
        pastSearches = tempPast;
    };
};
// On load functions
