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
const author = async function(req, res) {
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

// Route 1: GET /airbnb/:city/:minRatingCount/:roomType/:price_min/:price_max/:state
const airbnbFilter = async function(req, res) {
  //all queries = def or 0 if defaulted
  const cityName = req.query.city;
  const minRatingCount = req.query.ratingCount ?? 0;   //lower bound on the number of ratings
  const roomType = req.query.room_type ?? '';
  const price_min = parseInt(req.query.price_min, 10) ?? 0;
  const price_max = parseInt(req.query.price_max, 10) ?? 100000;
  const state = req.query.state ?? '';

  let sortOrder = "";
  if (req.query.sort === "1") {
    sortOrder = "DESC";
  } else if (req.query.sort === "2") {
    sortOrder = "ASC";
  } else if (req.query.sort === "0") {
    sortOrder = "RAND()";
  }

  let airbnbquery1 = 
  `SELECT *
  FROM airbnb a
  WHERE a.city = '${cityName}'
  AND a.number_of_reviews > ${minRatingCount}
  AND a.room_type LIKE '%${roomType}%'
  AND a.price >= ${price_min}
  AND a.price <= ${price_max}
  AND a.state = LIKE '%${state}%'`;

  if (sortOrder !== "") {
    airbnbquery1 += " ORDER BY a.price" + sortOrder;
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

// Route 2: GET /airbnb/:airbnbid
// display name, neighbourhood, host_name, price, minimum_nights, number_of_reviews, availability_365, city for each airbnb
const airbnb = async function(req, res) {
  const id = req.params.airbnbid;

  connection.query(`
    SELECT name, neighbourhood, host_name, price, minimum_nights, number_of_reviews, availability_365
    FROM airbnb
    WHERE id = ${id}
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  }); 
}

// Route 3: GET /airbnb/ranking/:city/
const airbnbRanked = async function(req, res) {
  // return the ranking of airbnbs in a city
  const city = req.query.city;
  connection.query(`
      SELECT (@rank := @rank + 1) AS ranking, name, number_of_reviews, price, (number_of_reviews/price) AS point
      FROM airbnb, (SELECT @rank := 0) r
      WHERE city = '${city}'
      ORDER BY point DESC
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

/********************************
 * YELP QUERIES *
 ********************************/
//Route 4: GET yelp/:city/:is_open/:star/:review_count
const yelpFilter = async function(req, res) {
  //all queries = def or 0 if defaulted
  const cityName = req.query.city;
  const open = req.query.is_open === 'true' ? 1 : 0;   //1 is open, 0 is both
  const stars = req.query.star; // minimum stars
  const review_count = req.query.review_count; // minimum review_count

  let sortOrder = "";  //sort by business name
  if (req.query.sort === "1") {
    sortOrder = "DESC";
  } else if (req.query.sort === "2") {
    sortOrder = "ASC";
  } else if (req.query.sort === "0") {
    sortOrder = "RAND()";
  }

  let yelpquery = 
  `
  USE yelp

  SELECT *
  FROM businesses b
  WHERE b.city = '${cityName}'
  AND b.review_count >= ${review_count}
  AND b.stars >= ${stars}
  AND b.is_open = ${open}`;

  if (sortOrder !== "") {
    airbnbquery1 += " ORDER BY b.name" + sortOrder;
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

//Route 5: GET /yelp/:id
// display information for business
const yelpBusinesses = async function(req, res) {
  const id = req.params.id;

  connection.query(`
    USE yelp

    SELECT *
    FROM businesses b
    WHERE id = ${id}
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  }); 
}

//Route 6: GET /yelp/:id/review
// display lists of review for yelp businesses
const yelpBusinessesReviews = async function(req, res) {
  const id = req.params.id;

  connection.query(`
    USE yelp

    SELECT text, stars, useful, funny, cool
    FROM reviews
    WHERE business_id = '${id}'
    AND CAST(SUBSTR(date, 1, 4) AS UNSIGNED) >= 2015;
    ORDER BY useful DESC, funny DESC, cool DESC
    `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  }); 
}

// Route 7: GET /yelp/ranking/:city/
const yelpRanking = async function(req, res) {
  // return the ranking of airbnbs in a city
  const city = req.query.city;
  connection.query(`
      SELECT (@rank := @rank + 1) AS ranking, name, stars, review_count
      FROM businesses b, (SELECT @rank := 0) r
      WHERE city = ${city}
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

// Route 8: GET /yelp/users/:id
// display name, review_count, yelping_since, useful, funny, cool for yelp user
const yelpUsers = async function(req, res) {
  const users = req.params.id;

  connection.query(`
    USE yelp

    SELECT name, review_count, yelping_since, useful, funny, cool
    FROM users
    WHERE user_id = '${users}'
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
 * COMPLEX QUERIES THAT JOIN TWO TABLES *
 ************************/

// Route 9: GET /
const combineOnLocation = async function(req, res) {

}

// Route 7: GET /combined/
const top_songs = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    connection.query(`
      SELECT S.song_id, S.title, A.album_id, A.title AS album, plays
      FROM Songs S JOIN Albums A ON S.album_id = A.album_id
      ORDER BY plays DESC
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    connection.query(`
      SELECT S.song_id, S.title, A.album_id, A.title AS album, plays
      FROM Songs S JOIN Albums A ON S.album_id = A.album_id
      ORDER BY plays DESC
      LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)}
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  const page = req.query.page;
  const pageSize = req.query.page_size ? req.query.page_size : 10;
  
  if (!page) {
    connection.query(`
      SELECT A.album_id, A.title AS title, SUM(plays) AS plays
      FROM Albums A JOIN Songs S ON A.album_id = S.album_id
      GROUP BY A.title
      ORDER BY plays DESC
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    connection.query(`
      SELECT A.album_id, A.title AS title, SUM(plays) AS plays
      FROM Albums A JOIN Songs S ON A.album_id = S.album_id
      GROUP BY A.title
      ORDER BY plays DESC
      LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)}
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
  
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
  yelpUsers, 

}
