// Dependencies
const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

const firebase = require('../firebase.js');
const openai = require('../openAI.js');

// Variables
var fuse;
const ALLOWED_HOSTS = ['tairot.app', 'localhost', '127.0.0.1', 'tairot-new.vercel.app'];

// Initialise
function checkOrigin(request, response, next) {
    const source = request.get('origin') || request.get('referer') || '';
    let host = '';
    try { host = new URL(source).hostname; } catch (error) {}
    const allowed = ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
    if (!allowed) return response.status(403).json('forbidden');
    next();
}

// Routes
router.get('/ascii', async (request, response) => {
    const { card } = request.query;
    if (!/^[a-z]+$/.test(card || '')) return response.status(400).json('invalid card');

    const filePath = path.join(process.cwd(), 'ascii', card + '.txt');
    const file = fs.readFileSync(filePath);

    response.json(file.toString());
});

router.get('/search', async (request, response) => {
    const { query } = request.query;

    const searchList = [];
    const data = await firebase.readFromFirebase("gallery");

    Object.keys(data).forEach(key => {
        var searchItem = {};
        const galleryItem = data[key];

        for (var index = 0; index < galleryItem.length; index++) {
            let newIndex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            searchItem[`${newIndex[index]}`] = galleryItem[index];
        }
        
        searchList.push(searchItem);
    })

    fuse = new Fuse(searchList, { threshold: 0.4, keys: ['0', '1', '2', '3'] });
    const search = fuse.search(query);
    const results = [];

    search.forEach((reading) => {
        results.push(reading.item);
    })

    response.json(results);
});

router.get('/firebase/read', async (request, response) => {
    const { path } = request.query;
    const ALLOWED_PATHS = new Set(['stats', 'gallery']);
    if (!ALLOWED_PATHS.has(path)) return response.status(403).json('forbidden');

    const data = await firebase.readFromFirebase(path);
    response.json(data);
});

router.get('/firebase/read/gallery', async (request, response) => {
    const { index } = request.query;
    const indexArray = index.split('-');

    const data = await firebase.viewFromGallery(indexArray[0], indexArray[1]);
    response.json(data);
});

router.post('/firebase/write', checkOrigin, async (request, response) => {
    const { parcel } = request.body;
    firebase.writeToFirebase(parcel);

    return response.status(200);
});

router.post('/firebase/update', checkOrigin, (request, response) => {
    const { parcel } = request.body;
    firebase.updateStatistics(parcel);

    return response.status(200);
});

router.post('/openai/prompt', checkOrigin, async (request, response) => {
    const { parcel } = request.body;

    const reading = await openai.promptChatGPT(parcel);
    response.json(reading);
});

// Modules
module.exports = router;