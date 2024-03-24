const express = require("express");
const app = express();
const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.API_KEY;

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000; // Use environment port or default to 3000
var server = app.listen(PORT, () => {
    server.setTimeout(500000); // Set timeout to 500 seconds (500,000 milliseconds)
    console.log(`Server is running on port ${PORT}`);
});

function matchTripIdToTripHeadsign(tripId, trips) {
    const trip = trips[tripId];
    return trip ? trip.tripHeadsign : null;
}

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/ikarus", async (req, res) => {
    try
    {
        const vehicleResponse = await axios.get('https://futar.bkk.hu/api/query/v1/ws/otp/api/where/vehicle-for-trip', 
        {
            params: 
            {
                tripId: 'BKK_C77217453',
                ifModifiedSince: 1625685137,
                appVerison: '1.1.abc',
                version: 2,
                includeReferences: 'true',
                key: 'acfaf15f-e56c-414d-8d49-493b8863e638'
            }
        });

        const vehiclesData = vehicleResponse.data;

        const vehicles = vehiclesData.data.list.map((vehicle) => ({
            vehicleId: vehicle.vehicleId,
            tripId: vehicle.tripId,
            licensePlate: vehicle.licensePlate,
            label: vehicle.label,
            currentStop: vehiclesData.data.references.stops.name,
            tripHeadsign: matchTripIdToTripHeadsign(vehicle.tripId, vehiclesData.data.references.trips),
            routeId: vehiclesData.data.references.trips.routeId
        }));
        
        res.render("ikarus", {vehicles});
    }
    catch (error)
    {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});