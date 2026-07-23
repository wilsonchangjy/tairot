// Dependencies
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase, ServerValue } = require('firebase-admin/database');
require('dotenv').config();

// Credentials
// The service account is a real secret — it lives only in FIREBASE_SERVICE_ACCOUNT
// (env), never in the repo. Accepts either raw JSON or a base64-encoded blob.
function loadServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    const decoded = /^\s*\{/.test(raw) ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(decoded);
}

// Initialize Firebase (guard against re-init on warm serverless invocations)
if (!getApps().length) {
    initializeApp({
        credential: cert(loadServiceAccount()),
        databaseURL: "https://tairotfun-default-rtdb.asia-southeast1.firebasedatabase.app/"
    });
}

const database = getDatabase();

// Functions
function writeToFirebase(data) {
    database.ref("gallery").push(data);
};

function updateStatistics(data) {
    if (typeof data != "string") database.ref("stats").update(data);
    else database.ref("stats/" + data).set(ServerValue.increment(1));
}

async function readFromFirebase(path) {
    const snapshot = await database.ref(path).once('value');
    return snapshot.val();
}

async function viewFromGallery(sorting, index) {
    let scope = database.ref("gallery");

    switch (sorting) {
        case "newest":
            scope = scope.limitToLast(parseInt(index));
            break;
        case "oldest":
            scope = scope.limitToFirst(parseInt(index));
            break;
    }

    const snapshot = await scope.once('value');
    return snapshot.val();
}

// Module
module.exports = { writeToFirebase, updateStatistics, readFromFirebase, viewFromGallery };
