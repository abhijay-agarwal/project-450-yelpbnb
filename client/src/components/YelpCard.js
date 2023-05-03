import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Link, Modal } from '@mui/material';
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import { DataGrid } from '@mui/x-data-grid';
// import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

// SongCard is a modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function YelpCard({ yelpId, handleClose }) {
  const [airbnbData, setAirbnbData] = useState([]);
  const [displayData, setDisplayData] = useState({});
  const [reviews, setReviews] = useState([{}]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/yelp?id=${yelpId}`)
      .then((res) => res.json())
      .then(resJson => {
        setDisplayData(resJson[0]);

        fetch(`http://${config.server_host}:${config.server_port}/combined/${yelpId}`)
          .then(res => res.json())
          .then((resJson) => {
            const airbnbData = resJson.map((item) => ({ id: item.airbnbId, ...item }));
            setAirbnbData(airbnbData);
            setReviews(getReviews(yelpId));
          })
      })
  });

  const getReviews = (id) => {
    fetch(`http://${config.server_host}:${config.server_port}/yelp/review/${id}`)
      .then(res => res.json())
      .then(resJson => {
        return resJson;
      }
      )
  };

  const airbnbColumns = [
    {
      field: 'airbnbName',
      headerName: 'Name',
      width: 300,
      renderCell: (params) => (
        <NavLink to={`/airbnb/${params.row.id}`}>{params.row.airbnbName}</NavLink>
      )
    },
    {
      field: 'airbnbCity',
      headerName: 'City',
      width: 150,
      renderCell: (params) => <span>{params.row.airbnbCity}</span>
    },
    {
      field: 'price',
      headerName: 'Price',

      renderCell: (params) => <p>${params.row.price}</p>
    },

  ];




  const reviewColumns = [
    {
      field: 'name',
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
        <h1>{displayData.name}</h1>
        <p>Address: {displayData.address}</p>
        <p>City: {displayData.city}</p>
        <p>State: {displayData.state}</p>
        <p>Stars: {displayData.stars}</p>
        <p>Review Count: {displayData.review_count}</p>
        <p>Open: {displayData.is_open === 1 ? 'Yes' : 'No'}</p>

        {/** only render Reviews and the lazytable if the content of getReviews is not empty */}

        <>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            <>
              <h2> Reviews</h2>
              <LazyTable route={`http://${config.server_host}:${config.server_port}/yelp/review/${yelpId}`} columns={reviewColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
            </>
          ) : (
            <h2>No reviews found</h2>
          )
          }
        </>

        <h2>Top AirBnBs in the area</h2>
        <DataGrid
          rows={airbnbData}
          columns={airbnbColumns}
          pageSize={3}
          rowsPerPageOptions={[3]}
          autoHeight
        />
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal >
  );
}