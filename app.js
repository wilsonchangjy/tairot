// Dependencies
const express = require('express');
const path = require('path');
const api = require('./api/index.js');

// Variables
const app = express();
const port = 8888;

// Initialise
app.use(express.json())
app.use(express.raw({type: '*/*'}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api);

app.set('etag', false);
app.use((request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
});

// Functions
app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
})

// Listen
app.listen(port, () => console.log(`Server started on port ${port}`));

// Modules
module.exports = app;