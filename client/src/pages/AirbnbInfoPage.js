import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Button, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import YelpCard from '../components/YelpCard';
import LazyTable from '../components/LazyTable';
// import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

export default function AirbnbInfoPage() {
    const { airbnbId } = useParams();
    console.log(airbnbId);

    // const [songData, setSongData] = useState([{}]);
    const [airbnbData, setAirbnbData] = useState({});
    const [selectedYelpId, setSelectedYelpId] = useState(null);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/airbnb/${airbnbId}`)
            .then(res => res.json())
            .then(resJson => setAirbnbData(resJson));
    }, [airbnbId]);

    const yelpColumns = [
        {
            field: 'business', headerName: 'Name', width: 200, renderCell: (params) => (
                <Link onClick={() => {
                    console.log("hello");
                    setSelectedYelpId(params.row.business_id);
                }}>{params.row.business}</Link>
            )
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
            {selectedYelpId && <YelpCard yelpId={selectedYelpId} handleClose={() => setSelectedYelpId(null)} />}
            <Stack direction='row' justify='center'>
                <Stack sx={{ mb: 0 }}>
                    <h1 style={{ fontSize: 40 }}>{airbnbData.name}</h1>
                    <h2>City: {airbnbData.city}</h2>
                </Stack>
            </Stack>
            {/* <Box
                p={3}
                style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
            > */}
            <p>Host name: {airbnbData.host_name}</p>
            <p>Price: ${airbnbData.price} per night</p>
            <p>Minimum nights: {airbnbData.minimum_nights}</p>
            <p>Number of reviews: {airbnbData.number_of_reviews}</p>
            <p>Number of available days in year: {airbnbData.availability_365}</p>
            <h2>Highest rated yelp businesses close to this property:</h2>
            <LazyTable route={`http://${config.server_host}:${config.server_port}/combined/airbnb/${airbnbId}`} columns={yelpColumns} defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
            {/* </Box> */}
        </Container >
    );
}