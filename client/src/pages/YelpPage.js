import { useEffect, useState } from 'react';
import { Button, MenuItem, Container, Autocomplete, Grid, Link, Slider, TextField, Radio, FormControl, FormControlLabel, RadioGroup, Select, Checkbox } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/AirbnbCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedYelpId, setSelectedYelpId] = useState(null);

  // choose if you're searching for AirBnB's or Yelp restaurants
  const [searchType, setSearchType] = useState('airbnb');
  const [name, setName] = useState('');

  const [stars, setStars] = useState(0);
  const [city, setCity] = useState('');
  const [minReviews, setMinReviews] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState('');
  const [cities, setCities] = useState([]);

  const states = [
    { value: '', label: 'Any' },
    { value: 'AB', label: 'Alberta' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MO', label: 'Missouri' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NY', label: 'New York' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VI', label: 'Virgin Islands' },
    { value: 'VT', label: 'Vermont' },
    { value: 'WA', label: 'Washington' },
  ];

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/yelp`)
      .then(res => res.json())
      .then(resJson => {
        const yelpData = resJson.map((yelp) => ({ id: yelp.business_id, ...yelp }));
        setData(yelpData);
      });
  }, []);
  // update the values in the cities cities array whenever a new state is chosen
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/cities?state=${state}`)
      .then(res => res.json())
      .then(resJson => {
        setCities(resJson);
      });
  }, [state]);


  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/yelp?name=${name}` +
      `&state=${state}` +
      `&city=${city}` +
      `&minReviews=${minReviews}` +
      `&stars=${stars}` +
      `&isOpen=${isOpen}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const yelpData = resJson.map((yelp) => ({ id: yelp.business_id, ...yelp }));
        setData(yelpData);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    {
      field: 'title', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedYelpId(params.row.id)}>{params.row.name}</Link>
      )
    },
    { field: 'review_count', headerName: '# of Reviews', width: 105 },
    { field: 'address', headerName: 'Address', width: 300 },
    { field: 'city', headerName: 'City', width: 100 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'stars', headerName: 'Rating', width: 100 },
    {
      field: 'is_open', headerName: 'Open?', width: 100, renderCell: (params) => (
        <div>{params.row.is_open ? 'Yes' : 'No'}</div>)
    },
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
      {/* {selectedYelpId && <YelpCard airbnbId={selectedYelpId} handleClose={() => setSelectedYelpId(null)} />} */}
      <h2>Find Yelp Businesse</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Business Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            value='is_open'
            control={<Checkbox size='large' value={isOpen} onChange={(e) => setIsOpen(e.target.value)} />}
            label="Open?"
          />
        </Grid>
        <Grid item xs={4}>
          <p>Number of Rooms</p>
          <Slider
            value={minReviews}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setMinReviews(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        {/* TODO (TASK 24): add sliders for danceability, energy, and valence (they should be all in the same row of the Grid) */}
        {/* Hint: consider what value xs should be to make them fit on the same row. Set max, min, and a reasonable step. Is valueLabelFormat is necessary? */}
        <Grid item xs={4}>
          <p>Stars (0-5)</p>
          <Slider
            value={stars}
            min={0}
            max={5}
            step={0.1}
            onChange={(e, newValue) => setStars(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6} sx={{ mb: 5 }}>
          <p>Select state</p>
          <Select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%" }}>
            {states.map((state) => (
              <MenuItem key={state.value} value={state.value}>
                {state.label}
              </MenuItem>
            ))}
          </Select>
          {/* <Autocomplete
            defaultValue={states[0]}
            onChange={(e, newValue) => setState(newValue)}
            options={states}
            getOptionLabel={(option) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}

            renderInput={(params) => (
              <TextField
                value={state}
                {...params}
                inputProps={{
                  ...params.inputProps,
                }}
              />
            )}
            autoComplete={true}
            autoHighlight
          /> */}
        </Grid>
        <Grid item xs={6}>
          <p>Select city</p>
          <Select value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%" }}>
            <MenuItem value=''>Any</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.city} value={city.city}>
                {city.city}
              </MenuItem>
            ))}
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
    </Container >
  );
}