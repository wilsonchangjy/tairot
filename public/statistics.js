// Variables
const baseURL = (window.location.href).replace("statistics.html", 'api/');
const statsData = await fetch(baseURL + 'firebase/read?path=stats');
const galleryData = await fetch(baseURL + 'firebase/read?path=gallery');

const stats = await statsData.json();
const gallerySize = Object.keys(await galleryData.json()).length;

// Initialise
if (document.body.contains(document.querySelector(".stats"))) showStatistics();

// Functions
async function showStatistics() {
    $("#pull").text(stats.pull);
    $("#publish").text(gallerySize);
    $("#ask").text(stats.ask);
    $("#latest").text(new Date(stats.latest).toLocaleString());
}