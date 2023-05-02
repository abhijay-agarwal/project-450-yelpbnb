const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * WARM UP ROUTES *
 ******************/

// Route 0: GET /author
const author = async function (req, res) {
  // TODO (TASK 1): replace the values of name and pennKey with your own
  const name = 'YelpBnB';
  const pennKey = 'yelpyelp';

  // checks the value of type the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.send(`Created by ${name}`);
  } else if (req.params.type === 'pennkey') {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back response 'Created by [pennkey]'
    res.send(`Created by ${pennKey}`);
  } else {
    // we can also send back an HTTP status code to indicate an improper request
    res.status(400).send(`'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`);
  }
}

/********************************
 * AIRBNB QUERIES *
 ********************************/

// Route 1: GET /airbnb/:city/:minRatingCount/:roomType/:price_min/:price_max/:availability
const airbnbFilter = async function (req, res) {
  //all queries = def or 0 if defaulted
  const cityName = req.query.city;
  const minRatingCount = parseInt(req.query.ratingCount, 10) ?? 0;   //lower bound on the number of ratings
  const roomType = req.query.room_type ?? '';
  const price_min = parseInt(req.query.price_min, 10) ?? 0;
  const price_max = parseInt(req.query.price_max, 10) ?? 100000;
  const availability_min = parseInt(req.query.price_max, 10) ?? 0; //minimum night availability out of 365

  let sortOrder = "";
  if (req.query.sort === "1") {
    sortOrder = "DESC";
  } else if (req.query.sort === "2") {
    sortOrder = "ASC";
  } else if (req.query.sort === "0") {
    sortOrder = "RAND()";
  }

  let airbnbquery1 =
    `
  SELECT id, name, host_name, price, minimum_nights, number_of_reviews, availability_365, city
  FROM airbnb a
  WHERE a.city = '${cityName}'
  AND a.number_of_reviews > ${minRatingCount}
  AND a.room_type LIKE '%${roomType}%'
  AND a.price BETWEEN ${price_min} AND ${price_max}
  AND a.availability_365 >= ${availability_min}`;

  if (sortOrder !== "") {
    airbnbquery1 += " ORDER BY a.price LIMIT 100" + sortOrder;
  }

  connection.query(airbnbquery1, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 2: GET /airbnb/:id
// display name, host_name, price, minimum_nights, number_of_reviews, availability_365, city for each airbnb
const airbnb = async function (req, res) {
  const id = req.params.airbnbid;

  connection.query(`
    SELECT id, name, host_name, price, minimum_nights, number_of_reviews, availability_365, city
    FROM airbnb
    WHERE id = ${id}
    LIMIT 1
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 3: GET /airbnb/ranking/:city
const airbnbRanked = async function (req, res) {
  // return the ranking of airbnbs in a city
  const city = req.query.city;
  connection.query(`
      SELECT id, (@rank := @rank + 1) AS ranking, name, number_of_reviews, price, (number_of_reviews/price) AS point
      FROM airbnb, (SELECT @rank := 0) r
      WHERE city = '${city}'
      ORDER BY point DESC
      LIMIT 50;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

/********************************
 * YELP QUERIES *
 ********************************/
//Route 4: GET yelp/:cityName/:open/:stars/:review_count
const yelpFilter = async function (req, res) {
  //all queries = def or 0 if defaulted
  const cityName = req.query.city;
  const open = req.query.is_open === 'true' ? 1 : 0;   //1 is open, 0 is both
  const stars = parseInt(req.query.stars, 10) ?? 0;; // minimum stars
  const review_count = parseInt(req.query.review_count, 10) ?? 0; // minimum review_count

  let sortOrder = "";
  if (req.query.sort === "1") {
    sortOrder = "DESC";
  } else if (req.query.sort === "2") {
    sortOrder = "ASC";
  } else if (req.query.sort === "0") {
    sortOrder = "RAND()";
  }

  let yelpquery =
    `
  SELECT b.business_id, b.name, b.address, b.city, b.stars, b.review_count
  FROM (
    SELECT * 
    FROM businesses 
    WHERE b.city = '${cityName}'
    AND b.review_count >= ${review_count}
    AND b.stars >= ${stars}
    AND b.is_open = ${open}
   ) b 
   `;

  if (sortOrder !== "") {
    airbnbquery1 += " ORDER BY b.stars DESC, b.review_count DESC LIMIT 100" + sortOrder;
  }

  connection.query(yelpquery, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

//Route 5: GET /yelp/:id/:name
// display information for business
const yelpBusinesses = async function (req, res) {
  const name = req.query.name;
  const id = req.params.id;

  connection.query(`
    SELECT business_id, name, address, city, stars, review_count
    FROM businesses
    WHERE business_id = '${id}'
    UNION
    SELECT business_id, name, address, city, stars, review_count
    FROM businesses
    WHERE name = '${name}';
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 6: GET /yelp/:city
const yelpRanking = async function (req, res) {
  // return the ranking of yelps in a city
  const city = req.query.city;
  connection.query(`
      SELECT business_id, (@rank := @rank + 1) AS ranking, name, stars, review_count
      FROM businesses b, (SELECT @rank := 0) r
      WHERE city = '${city}'
      ORDER BY stars DESC, review_count DESC
      LIMIT 20;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

//Route A: GET /yelp/:state/
//return cities given state from Yelp data
const yelpCities = async function (req, res) {
  const state = req.query.state;
  connection.query(`
SELECT DISTINCT city
FROM businesses
WHERE state = 'PA';
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });

}

/************************
 * COMPLEX QUERIES*
 ************************/

//Route 7: GET /yelp/:id
// Join tables businesses, users, and reviews to display most useful review along with name of user, 
// business name, review, stars, useful, funny and cool rankings in a certain state
const yelpBusinessesReviews = async function (req, res) {
  const id = req.params.id;

  connection.query(`
  SELECT u.name AS userName, b.name AS businessName, r.text AS review, r.stars, r.useful, r.funny, r.cool
FROM (
  SELECT business_id, MAX(useful) AS max_useful
  FROM reviews
  GROUP BY business_id
) top_reviews
JOIN reviews r ON r.business_id = top_reviews.business_id AND r.useful = top_reviews.max_useful
JOIN users u ON r.user_id = u.user_id
JOIN businesses b ON r.business_id = b.business_id AND b.state = 'PA'
GROUP BY b.name
ORDER BY b.name;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}


// Route 8: GET /combined/:id/:name
// Given the id of an airbnb, rank the surrounding businesses based on average stars and review count, and output the most useful review. 

const airbnbToYelp = async function (req, res) {
  const id = req.params.id;
  const name = req.query.name;

  connection.query(`
  SELECT b.name AS business_name, b.city,
  AVG(r.stars) AS avg_stars, COUNT(r.review_id) AS review_count, r.text AS review
FROM (
SELECT business_id, MAX(useful) AS max_useful
FROM reviews
GROUP BY business_id
) top_reviews
JOIN reviews r ON r.business_id = top_reviews.business_id AND r.useful = top_reviews.max_useful
JOIN businesses b ON r.business_id = b.business_id
JOIN airbnb a ON a.longitudeint = b.longitudeint AND a.latitudeint = b.latitudeint
WHERE a.id = '${id}' OR a.name = '${name}'
GROUP BY b.business_id
ORDER BY avg_stars DESC, review_count DESC
LIMIT 50;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 9: GET /combined/:id/:name/:roomType/:price_min/:price_max
// Given the id of a business or the name, rank the surrounding airbnb, filter based on price, room type, order based on number of reviews 

const yelpToAirbnb = async function (req, res) {
  const id = req.params.id;
  const name = req.query.name;
  const roomType = req.query.room_type ?? '';
  const price_min = parseInt(req.query.price_min, 10) ?? 0;
  const price_max = parseInt(req.query.price_max, 10) ?? 100000;

  connection.query(`
  SELECT a.name AS airbnb_name, b.name AS business_name, a.city,
      a.price, a.number_of_reviews
FROM airbnb a
JOIN businesses b ON a.longitudeint = b.longitudeint AND a.latitudeint = b.latitudeint
WHERE b.business_id = '${id}' OR b.name LIKE '${name}$%'
AND a.price BETWEEN ${price_min} AND ${price_max}
AND a.room_type = '${roomType}'
GROUP BY b.business_id, a.number_of_reviews
LIMIT 50;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 10: GET /combined/stateranking
// For each state, return the list of states ranked by decreasing number of businesses with more than 4 stars, and secondarily number of airbnb in the state.

const stateRanking = async function (req, res) {

  connection.query(
    `WITH temp1 AS (
    SELECT business_id, name
    FROM businesses
    WHERE stars >= 4
    ),
    temp2 AS (
    SELECT city, COUNT(id) AS numAirbnb
    FROM airbnb
    GROUP BY city
    )
    SELECT B.state, COUNT(temp1.business_id), temp2.numAirbnb
    FROM businesses B
    JOIN temp1
    ON B.business_id = temp1.business_id
    JOIN temp2
    ON temp2.city = B.city
    GROUP BY B.state, temp2.numAirbnb
    ORDER BY COUNT(temp1.business_id) DESC, temp2.numAirbnb DESC;
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}


module.exports = {
  author,
  airbnbFilter,
  airbnb,
  airbnbRanked,
  yelpFilter,
  yelpBusinesses,
  yelpBusinessesReviews,
  yelpRanking,
  airbnbToYelp,
  yelpToAirbnb,
  stateRanking,
  yelpCities
}
