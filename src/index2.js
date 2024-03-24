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
    try {
        const vehicles = [];
        const promises = [];

        // Végigmegyünk a tripId-kön
        for (let i = 11111111; i <= 99999999; i++) {
            const tripId = `BKK_C${i}`;
            // Promise-ek létrehozása minden tripId-re
            const promise = axios.get('https://futar.bkk.hu/api/query/v1/ws/otp/api/where/vehicle-for-trip', {
                params: {
                    tripId,
                    ifModifiedSince: 1625685137,
                    appVerison: '1.1.abc',
                    version: 2,
                    includeReferences: 'true',
                    key: 'acfaf15f-e56c-414d-8d49-493b8863e638'
                }
            }).then(response => {
                const vehiclesData = response.data;
                // Ellenőrizze, hogy van-e jármű a válaszban
                if (vehiclesData.data.list && vehiclesData.data.list.length > 0) {
                    // Szűrjük az Ikarus 412-es típusú buszokat
                    const ikarusVehicles = vehiclesData.data.list.filter(vehicle => vehicle.label === "Ikarus 412-es típusú autóbusz");
                    // Ha találtunk ilyen buszt, adjuk hozzá a vehicles tömbhöz
                    if (ikarusVehicles.length > 0) {
                        ikarusVehicles.forEach(vehicle => {
                            vehicles.push({
                                vehicleId: vehicle.vehicleId,
                                tripId: vehicle.tripId,
                                licensePlate: vehicle.licensePlate,
                                label: vehicle.label,
                                currentStop: vehiclesData.data.references.stops.name,
                                tripHeadsign: matchTripIdToTripHeadsign(vehicle.tripId, vehiclesData.data.references.trips),
                                routeId: vehiclesData.data.references.trips.routeId
                            });
                        });
                    }
                }
            }).catch(error => {
                console.error('Error fetching data:', error);
            });
            promises.push(promise);
        }

        // Várjuk meg az összes promise befejezését
        await Promise.all(promises);

        // Sorrendezzük a buszokat tripId szerint
        vehicles.sort((a, b) => (parseInt(a.tripId.slice(6)) > parseInt(b.tripId.slice(6))) ? 1 : -1);

        // Rendereljük az eredményt
        res.render("ikarus", { vehicles });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});