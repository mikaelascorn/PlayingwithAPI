const app = {};

app.selectedArticle = [];
app.mykey = config.MY_KEY;

app.drawMap = function () {
  let script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${app.mykey}`;
  document.body.appendChild(script);
}

app.getCoffeeShop = (long, lat) => {
  // console.log(long, lat);
  $.ajax({
    url: 'http://proxy.hackeryou.com',
    dataType: 'json',
    method: 'GET',
    data: {
      reqUrl: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      params: {
        key: app.mykey,
        location: `${lat},${long}`,
        rankby: 'distance',
        type: 'cafe'
      }
    }
  }).then(res => {
    // Save the results in an array
    // console.log(res.results);
    const places = res.results;
    app.getPlaces(long, lat, places)
  }).fail((err) => {
    throw err;
  })
};

app.getPlaces = (long, lat, places) => {
  // console.log(places);
  let placesArray = [];
  if (places.length > 0) {
    for (let i = 0; i < places.length; i++) {

      let placesObject = {};
      placesObject = {
        name: places[i].name,
        address: places[i].vicinity,
        rating: places[i].rating,
        lat: places[i].geometry.location.lat,
        lng: places[i].geometry.location.lng
      };

      placesArray.push(placesObject);
    }
    // Initializes map if locations are found
    app.showPlaces(lat, long, placesArray);

  } else {
    //Displays fallback text if no locations are found
    $('#map').append(`<h3>Sorry! There's no coffee shop around here.</h3>`);
    console.log('no results for selected place');
  }
}

// markers and cafe details on map
app.showPlaces = (lat, long, placesArray) => {
  let query1 = Number(lat);
  let query2 = Number(long);
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: { lat: query1, lng: query2 }
  });

  let location = new google.maps.Marker({
    position: { 
      lat: query1, 
      lng: query2 
    },
    map: map,
  })

  let infowindow = new google.maps.InfoWindow();

  let marker, i;
  let markers = [];
  markers.push(placesArray);

  // loop through all of the places
  for (i = 0; i < placesArray.length; i++) {
    // console.log(placesArray.length);
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(placesArray[i].lat, placesArray[i].lng),
      map: map
    });
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(`<p>Name: ${placesArray[i].name}</p> <p>Address: ${placesArray[i].address}</p> <p>Rating: ${placesArray[i].rating}</p>`);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }
}

//Call Google API geocode
//Get coordinates from inputted address
app.getLocation = (userLocation) => {
  $.ajax({
    url: 'http://proxy.hackeryou.com',
    method: 'GET',
    dataType: 'json',
    data: {
      reqUrl: `https://maps.googleapis.com/maps/api/geocode/json`,
      params: {
        key: app.mykey,
        address: userLocation
      }
    }
  }).then(res => {
    // console.log(res.results);
    app.locationLat = res.results[0].geometry.location.lat;
    // console.log(locationLat);
    app.locationLong = res.results[0].geometry.location.lng;
    // console.log(locationLong);
    app.getCoffeeShop(app.locationLong, app.locationLat);
    app.drawMap();

  }).fail((err) => {
    throw err;
  })
};

app.randomArticle = (arrayNum) => {
  const articleIndex = Math.floor(Math.random() * arrayNum.length);
  app.postArticle(arrayNum[articleIndex]);
}

app.startButton = () => {
  $('.start').on('click', (e) => {
    e.preventDefault();
    $('.main-header').fadeOut();
    $('.article').fadeIn();
  });
}

app.postArticle = (oneArticle) => {
  $('.article-result').empty();
  
  $('.main-results').fadeIn();
  $('.main-results .reset').fadeIn();
  $('.article').fadeOut();
  const articleTitle = oneArticle.title;
  const articleDescription = oneArticle.description;
  const articleLink = oneArticle.url;
  
  const articlePhoto = oneArticle.urlToImage;
  console.log(articlePhoto);
  console.log(oneArticle);
  
  const postArticle = `<div class="user-result">
    <h3>Enjoy your lazy Sunday Funday 👇</h3>
    <h4>${articleTitle}</h4>
      <div class="user-contents">
        <div class="article-result">
          <h5>${articleDescription}</h5>
          <div class="article-info">
            <img src="${articlePhoto}">
            <a href="${articleLink}" target="_blank">Click to read the full article!</a>
          </div>
        </div>
  
        <div class="user-map" id="map"></div>
      </div>
    </div>`

  $('.article-result').append(postArticle);
}

// News API
app.getArticle = (userArticle) => {
  // console.log(userArticle);
  return $.ajax({
    url: `https://newsapi.org/v2/everything?sources=cbc-news&q=${userArticle}&apiKey=ac81c5c1272f4109b571719e404991f3`,
  }).then( (res) => {
    // console.log(res.articles);
    const articlesReturned = res.articles;
    app.randomArticle(articlesReturned);

  }).fail((err) => {
    throw err;
  });
}

// users article choice and location
app.userInput = () => {
  $('form').on(' submit', (e) => {
    e.preventDefault()
    const userLocation = $('#location').val();
    
    if ( userLocation == '' ) {
      alert('pick a location');
    } else {
      const article = $('select').val();

      app.getLocation(userLocation);
      app.getArticle(article);      
    }
  });
};

app.reset = (e) => {
  $('.main-results .reset').on('click', function (e) {
    console.log('clicked');
    e.preventDefault();
    console.log('reset');
    window.location.reload(true);
  });
}; //FORM RESET

app.init = () => { // Everything gets called inside of this function 
  app.userInput();
  app.reset();
  app.startButton();
};

// Document ready
$(() => {
  app.init();
});





