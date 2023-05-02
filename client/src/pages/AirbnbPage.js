import { useEffect, useState } from 'react';
import {
  Button,
  MenuItem,
  Container,
  FormLabel,
  Grid,
  Link,
  Slider,
  TextField,
  Radio,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Select,
  Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/AirbnbCard';
import { getDistance } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedAirbnbId, setSelectedAirbnbId] = useState(null);

  // choose if you're searching for AirBnBs or Yelp restaurants
  const [searchType, setSearchType] = useState('airbnb');
  const [name, setName] = useState('');

  const [minRatings, setMinRatings] = useState(0);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [length, setLength] = useState(0);
  const [neighbourhood, setNeighbourhood] = useState('');
  const [price, setPrice] = useState([0, 2000]);
  const [state, setState] = useState('');
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState([]);

  const cities = [
    'Asheville',
    'Austin',
    'Boston',
    'Broward County',
    'Cambridge',
    'Chicago',
    'Clark County',
    'Columbus',
    'Denver',
    'Hawaii',
    'Jersey City',
    'Los Angeles',
    'Nashville',
    'New Orleans',
    'New York City',
    'Oakland',
    'Pacific Grove',
    'Portland',
    'Rhode Island',
    'Salem',
    'San Clara Country',
    'San Diego',
    'San Francisco',
    'San Mateo County',
    'Santa Cruz County',
    'Seattle',
    'Twin Cities MSA',
    'Washington D.C.',
  ];

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnb`)
      .then(res => res.json())
      .then(resJson => {
        const airbnbData = resJson.map((airbnb) => ({ id: airbnb.id, ...airbnb }));
        setData(airbnbData);
      });
  }, []);

  // get the neighbourhoods from /neighbourhoods whenever the selected city changes AND is not empty
  useEffect(() => {
    if (city) {
      fetch(`http://${config.server_host}:${config.server_port}/neighbourhoods?city=${city}`)
        .then(res => res.json())
        .then(resJson => {
          // if city is Nashville, the neighbourhoods are numbered instead of named, so sort them by the number that appears at position 10 in the neighbourhood string
          if (city === 'Nashville') {
            resJson.sort((a, b) => {
              const aNum = parseInt(a.neighbourhood.substring(9), 10);
              const bNum = parseInt(b.neighbourhood.substring(9), 10);
              return aNum - bNum;
            });
          }
          setNeighbourhoodOptions(resJson);
        });
    }
  }, [city]);


  // get data when search is pressed
  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnb?` +
      `city=${city}` +
      `&stay_length=${length}` +
      `&price_min=${price[0]}&price_max=${price[1]}` +
      `&rating_count=${minRatings}` +
      `&room_type=${type}` +
      `&neighbourhood=${neighbourhood}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const airbnbData = resJson.map((airbnb) => ({ id: airbnb.id, ...airbnb }));
        setData(airbnbData);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    {
      field: 'title', headerName: 'Name', width: 450, renderCell: (params) => (
        <Link onClick={() => setSelectedAirbnbId(params.row.id)}>{params.row.name}</Link>
      )
    },
    { field: 'host_name', headerName: 'Host Name', width: 110 },
    { field: 'neighbourhood', headerName: 'Neighborhood', width: 130 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'minimum_nights', headerName: 'Min Nights', width: 105 },
    { field: 'number_of_reviews', headerName: 'Reviews', width: 80 },
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
          <p>Duration of Stay</p>
          <Slider
            value={length}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setLength(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        {/* TODO (TASK 24): add sliders for danceability, energy, and valence (they should be all in the same row of the Grid) */}
        {/* Hint: consider what value xs should be to make them fit on the same row. Set max, min, and a reasonable step. Is valueLabelFormat is necessary? */}
        <Grid item xs={4}>
          <p>Number of ratings</p>
          <Slider
            value={minRatings}
            min={0}
            max={966}
            step={10}
            onChange={(e, newValue) => setMinRatings(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Select an area</p>
          <Select value={city} onChange={(e) => {
            setCity(e.target.value);
            setNeighbourhood('');
          }} style={{ width: "100%" }}>
            <MenuItem value=''>Any</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={4}>
          <p>Select neighbourhood</p>
          <Select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} style={{ width: "100%" }}>
            <MenuItem value=''>Any</MenuItem>
            {neighbourhoodOptions.map((neighbourhood) => (
              <MenuItem key={neighbourhood.neighbourhood} value={neighbourhood.neighbourhood}>
                {neighbourhood.neighbourhood}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={4} sx={{ mb: 5 }}>
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