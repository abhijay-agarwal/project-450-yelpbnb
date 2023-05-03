import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  Stack,
  Slider,
  Link,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import YelpCard from "../components/YelpCard";

const config = require("../config.json");

const InputUserFlow = () => {
  const [data, setData] = useState([]);
  const [searchType, setSearchType] = useState("airbnb");
  const [roomType, setRoomType] = useState("");
  const [minReviews, setMinReviews] = useState(0);
  const [radius, setRadius] = useState(0);
  const [minBusinesses, setMinBusinesses] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [price, setPrice] = useState([0, 2000]);
  const [length, setLength] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedYelpId, setSelectedYelpId] = useState(null);

  const columns =
    searchType === "airbnb"
      ? [
        {
          field: 'title', headerName: 'Name', width: 500, renderCell: (params) => (
            <NavLink to={`/airbnb/${params.row.id}`}>{params.row.name}</NavLink>
          )
        },
        { field: "host_name", headerName: "Host Name", width: 120 },
        { field: "price", headerName: "Price", width: 110 },
        { field: "minimum_nights", headerName: "Min Nights", width: 115 },
        { field: "number_of_reviews", headerName: "Reviews", width: 90 },
        { field: "city", headerName: "City", width: 110 },
      ]
      : [
        {
          field: "title",
          headerName: "Name",
          width: 300,
          renderCell: (params) => (
            <Link onClick={() => setSelectedYelpId(params.row.id)}>
              {params.row.name}
            </Link>
          ),
        },
        { field: "review_count", headerName: "# of Reviews", width: 105 },
        { field: "address", headerName: "Address", width: 300 },
        { field: "city", headerName: "City", width: 100 },
        { field: "state", headerName: "State", width: 100 },
        { field: "stars", headerName: "Rating", width: 100 },
        {
          field: "is_open",
          headerName: "Open?",
          width: 100,
          renderCell: (params) => (
            <div>{params.row.is_open ? "Yes" : "No"}</div>
          ),
        },
      ];

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnb`)
      .then((res) => res.json())
      .then((resJson) => {
        const airbnbData = resJson.map((airbnb) => ({
          id: airbnb.id,
          ...airbnb,
        }));
        setData(airbnbData);
      });
  }, []);

  // const searchAirbnb = () => {
  //   fetch(
  //     `http://${config.server_host}:${config.server_port}/combined/yelp?name=${name}` +
  //     `&length=${length}` +
  //     `&radius=${radius}` +
  //     `&stars = ${stars}` +
  //     `&price_min=${price[0]}&price_max=${price[1]}` +
  //     `&review_count=${minAirbnbReviews}` +
  //     `&room_type=${type}`
  //   )
  //     .then((res) => res.json())
  //     .then((resJson) => {
  //       // DataGrid expects an array of objects with a unique id.
  //       // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
  //       const airbnbData = resJson.map((airbnb) => ({
  //         id: airbnb.id,
  //         ...airbnb,
  //       }));
  //       setData(airbnbData);
  //     });
  // };

  // const searchYelp = () => {
  //   fetch(
  //     `http://${config.server_host}:${config.server_port}/combined/airbnb?name=${name}` +
  //     `&city=${city}` +
  //     `&review_count=${minReviews}` +
  //     `&stars=${stars}` +
  //     `&is_open=${isOpen}`
  //   )
  //     .then((res) => res.json())
  //     .then((resJson) => {
  //       // DataGrid expects an array of objects with a unique id.
  //       // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
  //       const yelpData = resJson.map((yelp) => ({
  //         id: yelp.business_id,
  //         ...yelp,
  //       }));
  //       setData(yelpData);
  //     });
  // };

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/combined?room_type=${roomType}` +
      `&price_min=${price[0]}` +
      `&price_max=${price[1]}` +
      `&length=${length}` +
      `&min_rating=${minRating}` +
      `&min_reviews=${minReviews}` +
      `&radius=${radius}` +
      `&min_businesses=${minBusinesses}` +
      `&stars=${minRating}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        // validate that resJson is not null
        // console.log(resJson);
        setData(
          Object.keys(resJson).length === 0
            ? []
            : resJson.map((yelp) => ({ id: yelp.business_id, ...yelp }))
        );
      });

  };

  return (
    <Container>
      {selectedYelpId && <YelpCard airbnbId={selectedYelpId} handleClose={() => setSelectedYelpId(null)} />}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h2">I'm looking for:</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="search-type"
              name="search-type"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
              }}
              row
            >
              <FormControlLabel
                value="airbnb"
                control={<Radio />}
                label="AirBnB Listings"
              />
              <FormControlLabel
                value="yelp"
                control={<Radio />}
                label="Yelp Businesses"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            My price range is between ${price[0]} and ${price[1]}.
          </Typography>
          <Slider
            value={price}
            min={0}
            max={2000}
            step={10}
            onChange={(e) => setPrice(e.target.value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography style={{ marginTop: -15 }}>
            I would like{" "}
            {roomType === "Entire home/apt" ? "an" : "a"}{" "}
            ...
          </Typography>
          <FormControl style={{ minWidth: 500 }}>
            <Select
              labelId="room-type-label"
              id="room-type-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <MenuItem value="Entire home/apt">
                <span style={{ fontWeight: "bold" }}>
                  Entire Home/Apartment
                </span>
              </MenuItem>
              <MenuItem value="Private room">
                <span style={{ fontWeight: "bold" }}>
                  Private Room
                </span>
              </MenuItem>
              <MenuItem value="Shared room">
                <span style={{ fontWeight: "bold" }}>
                  Shared Room
                </span>
              </MenuItem>
              <MenuItem value="Hotel room">
                <span style={{ fontWeight: "bold" }}>
                  Hotel Room
                </span>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} >
          <Typography>
            And I'll be staying for{" "}
            <span style={{ fontWeight: "bold" }}>
              {length || 1}
            </span>{" "}
            {length < 2 ? "day" : "days"}.
          </Typography>
          <Slider
            value={length}
            min={0}
            max={10}
            step={1}
            onChange={(e) => setLength(e.target.value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4">There's more!</Typography>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Typography>
            I'd like at least{" "}
            <span style={{ fontWeight: "bold" }}>
              {minBusinesses || 1}
            </span>{" "}
            Yelp{" "}
            {minBusinesses < 2 ? "business" : "businesses"}
          </Typography>
          <Slider
            value={minBusinesses}
            onChange={(e) => setMinBusinesses(e.target.value)}
            valueLabelDisplay="auto"
            aria-labelledby="num-businesses-slider"
            min={0}
            max={10}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            {minBusinesses < 2 ? "It" : "They"} must have been reviewed more than{" "}
            <span style={{ fontWeight: "bold" }}>
              {minReviews || 1}
            </span>{" "}
            {minReviews < 2 ? "time" : "times"}
          </Typography>
          <Slider
            value={minReviews}
            onChange={(e) => setMinReviews(e.target.value)}
            valueLabelDisplay="auto"
            aria-labelledby="num-reviews-slider"
            min={0}
            max={200}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            {minBusinesses >= 2 ? "They" : "It"} can even be as far as{" "}
            <span style={{ fontWeight: "bold" }}>
              {radius === 0 ? "__" : radius}
            </span>{" "}
            km away!
          </Typography>
          <Slider
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            valueLabelDisplay="auto"
            aria-labelledby="distance-slider"
            min={0}
            max={100}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography>
            But they {" "}
            <span style={{ fontWeight: "bold" }}>
              ALL
            </span>{" "} have to have a rating (out of 5) of at least{" "}
            <span style={{ fontWeight: "bold" }}>
              {minRating || "__"}
            </span>
          </Typography>
          <Slider
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            valueLabelDisplay="auto"
            aria-labelledby="min-rating-slider"
            step={0.1}
            min={0}
            max={5}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={() => search()}
        style={{ left: "50%", transform: "translateX(-50%)" }}
      >
        Search
      </Button>
      <h2>Results</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container >
  );
};
export default InputUserFlow;