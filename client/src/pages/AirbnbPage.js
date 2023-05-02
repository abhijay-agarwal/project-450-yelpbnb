import { useEffect, useState } from 'react';
import { Button, MenuItem, Container, FormLabel, Grid, Link, Slider, TextField, Radio, FormControl, FormControlLabel, RadioGroup, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/SongCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedAirbnbId, setSelectedAirbnbId] = useState(null);

  // choose if you're searching for AirBnB's or Yelp restaurants
  const [searchType, setSearchType] = useState('airbnb');
  const [name, setName] = useState('');

  const [rating, setRating] = useState([0, 5]);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [numRooms, setNumRooms] = useState([0, 10]);
  const [price, setPrice] = useState([0, 2000]);
  const [state, setState] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_songs`)
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
        setData(songsWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_songs?title=${name}` +
      `&rating_low=${rating[0]}&rating_high=${rating[1]}` +
      `&city=${city}` +
      `&numRooms_low=${numRooms[0]}&numRooms_high=${numRooms[1]}` +
      `&price_low=${price[0]}&price_high=${price[1]}` +
      `&valence=${state}` +
      `&airBnbType=${type}`

      // copy the above link but change the variables to match the ones you added
      // to the search query in the server

    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const songsWithId = resJson.map((airbnb) => ({ id: airbnb.id, ...airbnb }));
        setData(songsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    {
      field: 'title', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedAirbnbId(params.row.id)}>{params.value}</Link>
      )
    },
    { field: 'host_name', headerName: 'Host Name', width: 90 },
    { field: 'neighborhood', headerName: 'Neighborhood', width: 110 },
    { field: 'price', headerName: 'Price', width: 50 },
    { field: 'minimum_nights', headerName: 'Min Nights', width: 85 },
    { field: 'number_of_reviews', headerName: '# of Reviews', width: 105 },
    { field: 'city', headerName: 'City', width: 100 },
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {selectedAirbnbId && <SongCard airbnbId={selectedAirbnbId} handleClose={() => setSelectedAirbnbId(null)} />}
      <h2>Find AirBnBs</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </Grid>
        <Grid item xs={4}>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">What are you searching for?</FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                console.log(searchType);
              }}
            >
              <FormControlLabel
                value='airbnb'
                control={<Radio />}
                label="AirBnB"
              />
              <FormControlLabel
                value="yelp"
                control={<Radio />}
                label="Yelp"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <p>Price ($USD per night)</p>
          <Slider
            value={price}
            min={0}
            max={2000}
            step={10}
            onChange={(e, newValue) => setPrice(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={4}>
          <p>Number of Rooms</p>
          <Slider
            value={numRooms}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setNumRooms(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        {/* TODO (TASK 24): add sliders for danceability, energy, and valence (they should be all in the same row of the Grid) */}
        {/* Hint: consider what value xs should be to make them fit on the same row. Set max, min, and a reasonable step. Is valueLabelFormat is necessary? */}
        <Grid item xs={4}>
          <p>Rating (0-5)</p>
          <Slider
            value={rating}
            min={0}
            max={5}
            step={0.1}
            onChange={(e, newValue) => setRating(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6}>
          <p>Select city</p>
          <Select value={city} onChange={(e) => {
            setCity(e.target.value);
          }} style={{ width: "100%" }}>
            <MenuItem value="Los Angeles">Los Angeles</MenuItem>
            <MenuItem value="Denver">Denver</MenuItem>
            <MenuItem value="San Francisco">San Francisco</MenuItem>
            <MenuItem value="Austin">Austin</MenuItem>
            <MenuItem value="Seattle">Seattle</MenuItem>
            <MenuItem value="Chicago">Chicago</MenuItem>
            <MenuItem value="Twin Cities MSA">Twin Cities MSA</MenuItem>
            <MenuItem value="New York City">New York City</MenuItem>
            <MenuItem value="Oakland">Oakland</MenuItem>
            <MenuItem value="Clark County">Clark County</MenuItem>
            <MenuItem value="Washington D.C.">Washington D.C.</MenuItem>
            <MenuItem value="Boston">Boston</MenuItem>
            <MenuItem value="San Clara Country">San Clara Country</MenuItem>
            <MenuItem value="Hawaii">Hawaii</MenuItem>
            <MenuItem value="San Diego">San Diego</MenuItem>
            <MenuItem value="Nashville">Nashville</MenuItem>
            <MenuItem value="Jersey City">Jersey City</MenuItem>
            <MenuItem value="Cambridge">Cambridge</MenuItem>
            <MenuItem value="Rhode Island">Rhode Island</MenuItem>
            <MenuItem value="New Orleans">New Orleans</MenuItem>
            <MenuItem value="Santa Cruz County">Santa Cruz County</MenuItem>
            <MenuItem value="San Mateo County">San Mateo County</MenuItem>
            <MenuItem value="Portland">Portland</MenuItem>
            <MenuItem value="Pacific Grove">Pacific Grove</MenuItem>
            <MenuItem value="Asheville">Asheville</MenuItem>
            <MenuItem value="Broward County">Broward County</MenuItem>
            <MenuItem value="Columbus">Columbus</MenuItem>
            <MenuItem value="Salem">Salem</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={6}>
          <p>Select room type</p>
          <Select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }}>
            <MenuItem value="Entire home/apt">Entire Home/Apartment</MenuItem>
            <MenuItem value="Private room">Private Room</MenuItem>
            <MenuItem value="Shared room">Shared Room</MenuItem>
            <MenuItem value="Hotel room">Hotel Room</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Button onClick={() => search()} style={{ left: '50%', transform: 'translateX(-50%)' }}>
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
    </Container>
  );
}