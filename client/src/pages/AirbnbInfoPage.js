import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import LazyTable from '../components/LazyTable';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

export default function AirbnbInfoPage() {
    const { airbnb_id } = useParams();

    // const [songData, setSongData] = useState([{}]);
    const [airbnbData, setAirbnbData] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/airbnb/${airbnb_id}`)
            .then(res => res.json())
            .then(resJson => setAirbnbData(resJson));
    }, [airbnb_id]);

    const yelpColumns = [
        {
            field: 'business',
            headerName: 'Name',
        },
        {
            field: 'address',
            headerName: 'Address'
        },
        {
            field: 'city',
            headerName: 'City',
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

    return (
        <Container>
            <Stack direction='row' justify='center'>
                <Stack>
                    <h1 style={{ fontSize: 64 }}>{airbnbData.name}</h1>
                    <h2>City: {airbnbData.city}</h2>
                </Stack>
            </Stack>
            <Box
                p={3}
                style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
            >
                <p>Host name: {airbnbData.host_name}</p>
                <p>Price: {airbnbData.price}</p>
                <p>Minimum nights: {airbnbData.minimum_nights}</p>
                <p>Number of reviews: {airbnbData.number_of_reviews}</p>
                <p>Number of available days in year: {airbnbData.availability_365}</p>
                <LazyTable route={`http://${config.server_host}:${config.server_port}/combined/airbnb/${airbnbData.id}`} columns={yelpColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
                <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
                    Close
                </Button>
            </Box>
        </Container>
    );
}