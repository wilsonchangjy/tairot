// Dependencies
const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const fs = require('fs');

const firebase = require('../firebase.js');
const openai = require('../openAI.js');

// Variables 
var fuse;

// Initialise

// Routes
router.get('/ascii', async (request, response) => {
    const { card } = request.query;
    const result = fs.readFileSync('./ascii/' + card + ".txt");

    response.json(result.toString());
});

router.get('/search', (request, response) => {
    const { query } = request.query;
    const search = fuse.search(query);
    var results = [];

    search.forEach((reading) => {
        results.push(reading.item);
    })

    response.json(results);
});

router.get('/firebase/auth', (request, response) => {
    firebase.authFirebase();
    return response.status(400);
});

router.get('/firebase/read', async (request, response) => {
    const { path } = request.query;

    const data = await firebase.readFromFirebase(path)
    response.json(data);

    if (path == "gallery") {
        var searchList = [];

        Object.keys(data).forEach(key => {
            var searchItem = {};
            const galleryItem = data[key];

            for (var index = 0; index < galleryItem.length; index++) {
                let newIndex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                searchItem[`${newIndex[index]}`] = galleryItem[index];
            }
            
            searchList.push(searchItem);
        })

        fuse = new Fuse(searchList, {
            keys: ['0', '1', '2', '3']
        });
    }
});

router.post('/firebase/write', async (request, response) => {
    const { parcel } = request.body;
    firebase.writeToFirebase(parcel);
});

router.post('/firebase/update', (request, response) => {
    const { parcel } = request.body;
    firebase.updateStatistics(parcel);
});

router.post('/openai/prompt', async (request, response) => {
    const { parcel } = request.body;

    const reading = await openai.promptChatGPT(parcel);
    response.json(reading);
});

// Modules
module.exports = router;