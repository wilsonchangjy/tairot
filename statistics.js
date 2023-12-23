import { readFromFirebase } from "./firebase.js";

// Variables
const stats = await readFromFirebase("stats");
const gallerySize = Object.keys(await readFromFirebase("gallery")).length;

// Initialise
if (document.body.contains(document.querySelector(".stats"))) showStatistics();

// Functions
async function showStatistics() {
    $("#pull").text(stats.pull);
    $("#publish").text(gallerySize);
    $("#ask").text(stats.ask);
    $("#latest").text(new Date(stats.latest).toLocaleString());
}