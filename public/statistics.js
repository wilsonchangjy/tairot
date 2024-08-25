// Variables
const baseURL = (window.location.href).replace("statistics.html", 'api/');
const statsData = await fetch(baseURL + 'firebase/read?path=stats');
const stats = await statsData.json();

// Initialise
if (document.body.contains(document.querySelector(".stats"))) showStatistics();

// Functions
async function showStatistics() {
    $("#pull").text(stats.pull);
    $("#publish").text(stats.gallery);
    $("#ask").text(stats.ask);
    $("#latest").text(new Date(stats.latest).toLocaleString());
}