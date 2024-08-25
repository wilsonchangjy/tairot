// Dependencies
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, push, set, increment, update, query, limitToLast, limitToFirst } = require('firebase/database');
require('dotenv').config();

// Variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "tairotfun.firebaseapp.com",
    databaseURL: "https://tairotfun-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "tairotfun",
    storageBucket: "tairotfun.appspot.com",
    messagingSenderId: "1003998231205",
    appId: "1:1003998231205:web:9cf2e1e8bca8b4698e2b4c",
    measurementId: "G-7LFTX6JJ4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();

// Functions
function writeToFirebase(data) {
    const reference = ref(database, "gallery/");

    push(reference, data);
};

function updateStatistics(data) {
    let reference = ref(database, "stats/");

    if (typeof data != "string") update(reference, data);
    else {
        reference = ref(database, "stats/" + data);
        set(reference, increment(1));
    }
}

async function readFromFirebase(path) {
    const reference = ref(database, path);

    const snapshot = await get(reference);
    var data = snapshot.val();
    return data;
}

async function viewFromGallery(sorting, index) {
    const reference = ref(database, "gallery");
    var scope;

    switch(sorting) {
        case "newest":
            scope = query(reference, limitToLast(parseInt(index)));
            break;
        case "oldest":
            scope = query(reference, limitToFirst(parseInt(index)));
            break;
    }

    const snapshot = await get(scope);
    const data = snapshot.val();

    return data;
}

// Module
module.exports = { writeToFirebase, updateStatistics, readFromFirebase, viewFromGallery };