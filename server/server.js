const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/author/:type', routes.author);
app.get('/airbnb', routes.airbnbFilter);
app.get('/airbnb/:airbnbid', routes.airbnb);
app.get('/airbnb/ranking', routes.airbnbRanked);
app.get('/neighbourhoods', routes.airbnbNeighbourhoods);
app.get('/airbnb/location/:id', routes.airbnbLocation);
app.get('/yelp/location/:id', routes.yelpLocation);
app.get('/yelp', routes.yelpFilter);
app.get('/yelp/:id', routes.yelpBusinesses);
app.get('/yelp/:id/review', routes.yelpBusinessesReviews);
app.get('/yelp/ranking/:city', routes.yelpRanking);
app.get('/yelp/:state', routes.yelpCities);
app.get('/combined/location/:airbnbId/:yelpId', routes.combinedLocation);
app.get('/cities', routes.getCities);
// app.get('/yelp/users/:id', routes.yelpUsers);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
