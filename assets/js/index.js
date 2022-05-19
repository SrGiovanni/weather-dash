const apikey = '33981d26ad23ea768486e597389db299';
// Storage for past searches, would be saved as "pastSearches" in local storage
// Contains objects with fields: lat, long, name;
let pastSearches = {};
let pastPlaceNames = [];
let lastSearch = {};
//{chicago: {lat: 22, lon: 55}}

// Formatting helper functions 
// format current weather
let formatCurrentWeatherBox = (currentData, locationName) => {
  console.log(currentData);
  let dt = new Date(currentData.dt*1000);
  let uvIndexClass = currentData.uvi<3 ? 'is-UVgood': currentData.uvi< 7? 'is-UVmoderate': 'is-UVhigh';
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
  let weather = dailyData.weather[0];

  return `
  <article class="column card block  ">
  <h3 class="card-header">${dt.toDateString()}</h3>
  <img src="http://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
  <div class="card-content">
    <p>Temp: ${dailyData.temp.day}&#176 F</p>
    <p>Wind: ${dailyData.wind_speed} MPH</p>
    <p>Humidity: ${dailyData.humidity} %</p>
  </div>
</article>`;
  
}

// format buttons to get previous searches
let formatPastButtons = (pastButtonData) => {
  console.log( JSON.stringify(pastButtonData) )
  return `<li><button class="button is-rounded is-info block" data-locationStr=${pastButtonData.name}>${pastButtonData.name}</button></li>`
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

  console.log(event.target.dataset.locationString)
  let locationRevisit = event.target.dataset.locationString
  pastPlaceNames.push(array.splice(pastPlaceNames.indexOf(locationRevisit), 1)[0]);
  // getWeatherData(pastSearches[locationRevisit]);
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
      //pastSearches.push({ lat, lon, name });
      pastSearches[name] = { lat, lon, name };
      pastPlaceNames.push(name);
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
  localStorage.setItem("pastPlaceNames", JSON.stringify(pastPlaceNames) );
}
/**
 * onLoad: get local data for past searches, the populate the button list
 */
let onLoad = () =>{
    let tempPast = JSON.parse(localStorage.getItem('pastSearches') );
    let tempNames = JSON.parse( localStorage.getItem('pastPlaceNames') )
    let lastSearch = JSON.parse(localStorage.getItem('weatherData'));
    let lastLocation = JSON.parse(localStorage.getItem('lastLocation'))
    if(tempPast){
        pastSearches = tempPast;
    };
    if(tempNames){
      pastPlaceNames = tempNames;
    };

    // @TODO: delete before testing and search for fresh data on load from the last element of the pastSearches array
    if ( lastSearch && lastLocation) {
      displayWeather(lastSearch, lastLocation.name);
    }
};
// On load functions
onLoad();
