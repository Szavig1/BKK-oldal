const express = require("express");
const app = express();
const axios = require('axios');
const apiKey = 'acfaf15f-e56c-414d-8d49-493b8863e638';

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000; // Use environment port or default to 3000
var server = app.listen(PORT, () => {
    server.setTimeout(500000); // Set timeout to 500 seconds (500,000 milliseconds)
    console.log(`Server is running on port ${PORT}`);
});

app.get(".", (req, res) => {
    res.render("index");
});

app.get("/ikarus", (req, res) => {
    res.render("ikarus");
    try
    {
        const valasz = await axios.get('https://futar.bkk.hu/api/query/v1/ws/otp/api/where/vehicle-for-trip', 
        {
            params: 
            {
                tripId: 'BKK_C77874420',
                ifModifiedSince: 1625685137,
                includeReferences: 'true',
                dialect: 'true'
            }
        });
    }
    catch
    {

    }
});