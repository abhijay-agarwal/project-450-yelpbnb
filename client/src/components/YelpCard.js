import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Link, Modal } from '@mui/material';
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
// import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

// SongCard is a modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function YelpCard({ yelpId, handleClose }) {
  const [yelpData, setYelpData] = useState([]);
  const [airbnbData, setAirbnbData] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/yelp?id=${yelpId}`)
      .then((res) => res.json())
      .then(resJson => {
        setYelpData(resJson);
        fetch(`http://${config.server_host}:${config.server_port}/combined/${yelpData.business_id}`)
          .then(res => res.json())
          .then((resJson) => {
            setAirbnbData(resJson);
          })
      })
  });



  const reviewColumns = [
    {
      field: 'userName',
      headerName: 'User Name',
      renderCell: (row) => <span>{row.userName}</span>
    },
    {
      field: 'review',
      headerName: 'Review',
      // renderCell: (row) => <span>{row.review}</span>
    },
    {
      field: 'stars',
      headerName: 'Stars'
    },
    {
      field: 'useful',
      headerName: 'Useful'
    },
    {
      field: 'funny',
      headerName: 'Funny'
    },
    {
      field: 'cool',
      headerName: 'Cool'
    },
  ];

  // ];

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{yelpData.name}</h1>
        <p>Name: {yelpData.name}</p>
        <p>Address: {yelpData.address}</p>
        <p>City: {yelpData.city}</p>
        <p>State: {yelpData.state}</p>
        <p>Stars: {yelpData.stars}</p>
        <p>Review Count: {yelpData.review_count}</p>
        <p>Open: {yelpData.is_open === 1 ? 'Yes' : 'No'}</p>
        <LazyTable route={`http://${config.server_host}:${config.server_port}/yelp/review/${yelpData.business_id}`} columns={reviewColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}