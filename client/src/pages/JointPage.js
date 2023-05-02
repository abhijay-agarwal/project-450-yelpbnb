import { useEffect, useState } from 'react';
import { Button, MenuItem, Container, InputLabel, Grid, Link, Slider, TextField, Radio, FormControl, FormControlLabel, RadioGroup, Select, Checkbox } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/SongCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
    // define variables to store the state of the search filters for both the airbnb and yelp pages
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [selectedAirbnbId, setSelectedAirbnbId] = useState(null);
    // choose if you're searching for AirBnB's or Yelp restaurants
    const [searchType, setSearchType] = useState('airbnb');
    // TODO (TASK 1): define state variables for the search filters

}