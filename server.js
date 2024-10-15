const express = require('express');
const mysql = require('mysql2'); // make sure you're using mysql2
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const http = require('http');

// Firebase Admin SDK setup
var admin = require("firebase-admin");

// Use path.resolve to ensure an absolute path
var serviceAccount = require(path.resolve(__dirname, 'config/fir-801cf-firebase-adminsdk-gx8cz-af012cd3dc.json'));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-801cf-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();
const port = 3000;
const hostname = '127.0.0.1'; // Define hostname

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const db = admin.database();

// Route to fetch temperature readings and render dashboard
app.get('/', async (req, res) => {
    try {
        // Create references for Lettuce, Okra, and Pechay
        const refLettuce = db.ref('/Lettuce/CurrentReadings/Temperature');
        const refOkra = db.ref('/Okra/CurrentReadings/Temperature');
        const refPechay = db.ref('/Pechay/CurrentReadings/Temperature');

        // Fetch the temperature data for each vegetable concurrently
        const lettuceSnapshot = await refLettuce.once('value');
        const okraSnapshot = await refOkra.once('value');
        const pechaySnapshot = await refPechay.once('value');

        // Extract the temperature values from the snapshots
        const lettuceTemperature = lettuceSnapshot.val();
        const okraTemperature = okraSnapshot.val();
        const pechayTemperature = pechaySnapshot.val();

        // Log the data to make sure it's being fetched
        console.log('Lettuce Temperature:', lettuceTemperature);
        console.log('Okra Temperature:', okraTemperature);
        console.log('Pechay Temperature:', pechayTemperature);

        // Pass the temperature data for Lettuce, Okra, and Pechay to the dashboard template
        res.render('dashboard', { 
            lettuceTemperature: lettuceTemperature || 'N/A',
            okraTemperature: okraTemperature || 'N/A',
            pechayTemperature: pechayTemperature || 'N/A'
        });
    } catch (error) {
        console.error('Error fetching Realtime Database data:', error);
        res.status(500).send('Error fetching readings');
    }

});
