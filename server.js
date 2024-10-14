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

/* Uncomment this block if you're still using MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'welcome.2024', // your MySQL password
    database: 'employee_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});
*/

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
// Routes
app.get('/', (req, res) => {
    res.render('dashboard');
});

// Firebase fetch example
// Route to fetch temperature readings
app.get('/fetch-readings', async (req, res) => {
    try {
        // Reference to the Temperature data
        const ref = db.ref('/Lettuce/CurrentReadings/Temperature');
        
        // Fetch the data from the database
        ref.once('value', (snapshot) => {
            const temperatureData = snapshot.val(); // Get the data as an object

            if (temperatureData) {
                console.log('Temperature readings:', temperatureData);
                res.status(200).json(temperatureData); // Send the temperature data as JSON
            } else {
                res.status(404).send('No temperature data found');
            }
        });
    } catch (error) {
        console.error('Error fetching Realtime Database data:', error);
        res.status(500).send('Error fetching readings');
    }
});
