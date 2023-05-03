import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';
import YelpCard from '../components/YelpCard';

import LazyTable from '../components/LazyTable';
// import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  const [appAuthor, setAppAuthor] = useState('');
  const [stateRanks, setStateRanks] = useState([]);
  const [selectedYelpId, setSelectedYelpId] = useState(null);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/ranking`)
      .then(res => res.json())
      .then(resJson => setStateRanks(resJson));
  }, []);

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

  const getFullState = (stateAbbr) => {
    const state = states.find((s) => s.value === stateAbbr);
    return state ? state.label : "";
  }

  console.log(getFullState('LA'));



  // Here, we define the columns of the "Top Songs" table. The songColumns variable is an array (in order)
  // of objects with each object representing a column. Each object has a "field" property representing
  // what data field to display from the raw data, "headerName" property representing the column label,
  // and an optional renderCell property which given a row returns a custom JSX element to display in the cell.
  const yelpColumns = [
    {
      field: 'name',
      headerName: 'Business',
      renderCell: (params) => <Link onClick={() => setSelectedYelpId(params.row.business_id)}>{params.row.name}</Link>
    },
    {
      field: 'stars',
      headerName: 'Rating',
      // renderCell: (row) => <NavLink to={`/albums/${row.album_id}`}>{row.album}</NavLink> // A NavLink component is used to create a link to the album page
    },
  ];

  // TODO (TASK 15): define the columns for the top albums (schema is Album Title, Plays), where Album Title is a link to the album page
  // Hint: this should be very similar to songColumns defined above, but has 2 columns instead of 3
  const stateColumns = [
    {
      field: 'state',
      headerName: 'State Abbreviation',
    },
    {
      field: 'qualityBusinesses',
      headerName: 'Number of high-rated (over 4.0) Yelp businesses'
    },
    {
      field: 'numAirbnb',
      headerName: 'Number of AirBnBs'
    },
  ]

  return (
    <Container>
      {/* SongCard is a custom component that we made. selectedSongId && <SongCard .../> makes use of short-circuit logic to only render the SongCard if a non-null song is selected */}
      {selectedYelpId && <YelpCard yelpId={selectedYelpId} handleClose={() => setSelectedYelpId(null)} />}
      <Divider />
      <h2>Top States</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/ranking`} columns={stateColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
      <Divider />

      <h2>Top 100 Rated Businesses</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_businesses`} columns={yelpColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
      <Divider />
      <p>yelpBnB!</p>
    </Container>
  );
};