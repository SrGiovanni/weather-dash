const apikey = '33981d26ad23ea768486e597389db299';
// Storage for past searches, would be saved as "pastSearches" in local storage
// Contains objects with fields: lat, long, name;
let pastSearches = [];
let lastSearch = {};

// Formatting helper functions 
// format current weather
let formatCurrentWeatherBox = (currentData, locationName) => {
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

// format a forecast article box from 
let formatForecastBox = (dailyData) => {
  let dt = new Date(dailyData.dt*1000);

  return `<article>
  <h3>${dt.toDateString()}</h3>
  <p>Temp: ${dailyData.temp.day} F</p>
  <p>Wind: ${dailyData.wind_speed} MPH</p>
  <p>Humidity: ${dailyData.humidity} %</p>
</article>`;
  
}

// format buttons to get previous searches
let formatPastButtons = (pastButtonData) => {
  console.log( JSON.stringify(pastButtonData) )
  return `<li><button data-locationObj="${ JSON.stringify(pastButtonData) }">${pastButtonData.name}</button></li>`
}

// Event Handlers
// search submit handler
$('#search-form').on('submit', function(event) {
  event.preventDefault();
  let location = $("#search-box").val().trim();
  getGeolocation(location);
} );

/**
 * Past search button handler
 * takes the data from the button, and calls getWeatherData() for that location.
 * getWeatherData will call the rendering function
 * // can move the button element to the end with { array.push(array.splice(array.indexOf(element), 1)[0]); }
 * @param {*} locationString 
 */
$("#previous-searches").on('click', function(event) {
  event.preventDefault();

  console.log(event.target)
  console.log(event.target.dataset)
})

/**
 * Calls Open weather API with name of city to get the {lat, long}  
 * API params q:city name, APIKey: personal API key, limit: limit number of responses
 * Will only ask for 1 location
 * Add an object with the lat, lon, and name of the searched city to the past searches array
 * @param location 
 */
let getGeolocation = (locationString) => {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${locationString}&limit=1&appid=${apikey}`)
    .then(response => {
      console.log(response);
      return response.json()
    }).then(data => {
        // is this working? y
        console.log(data)
        return data[0] ;
    }).then(({ lat, lon, name }) => { 
      pastSearches.push({ lat, lon, name });
      getWeatherData({ lat, lon, name });
    }).catch( (err) => {
      console.log(err);
    });
};

/**
 * API call function for city
 * params: location object 
 * returns: JSON object of the location
 */ 
let getWeatherData = (locationObj) => {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${locationObj.lat}&lon=${locationObj.lon}&units=${'imperial'}&appid=${apikey}`)
  .then(response => {
      return response.json();
  }).then((data) => {
    // what did I get back?
    console.log(data)
    // @TODO remove test data form final deployment
    localStorage.setItem('weatherData', JSON.stringify( data ) );
    localStorage.setItem('lastLocation', JSON.stringify( locationObj ) );
    displayWeather(data, locationObj.name);
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
  $('#target-current-weather').html( formatCurrentWeatherBox(weatherData.current, locationName) );

  // display formatted forecast for weatherData.daily.subarray(1,6)
  $('#forecast-area').html( weatherData.daily.slice( 1, 6 ).map( formatForecastBox ).join('') );

  $('#previous-searches').html( pastSearches.map(formatPastButtons).join('') );
  saveSearches();
};


/**
 * saveSearches
 * save the current search and past searches to 
 */
let saveSearches = () => {
  localStorage.setItem("pastSearches", JSON.stringify(pastSearches) );
}
/**
 * onLoad: get local data for past searches, the populate the button list
 */
let onLoad = () =>{
    let tempPast = JSON.parse(localStorage.getItem('pastSearches') );
    let lastSearch = JSON.parse(localStorage.getItem('weatherData'));
    let lastLocation = JSON.parse(localStorage.getItem('lastLocation'))
    if(tempPast){
        pastSearches = tempPast;
    };

    // @TODO: delete before testing and search for fresh data on load from the last element of the pastSearches array
    if ( lastSearch && lastLocation) {
      displayWeather(lastSearch, lastLocation.name);
    }
};
// On load functions
onLoad();
