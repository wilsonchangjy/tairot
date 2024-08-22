// Variables
const gallery = $(".gallery");
const baseURL = (window.location.href).replace("gallery.html", 'api/');

// Initialise
const galleryData = await fetch(baseURL + 'firebase/read?path=gallery');
var galleryContent = Object.values(await galleryData.json());
populateGallery(galleryContent.reverse());

// Functions
function populateGallery(content) {
    gallery.empty();

    for (var conversation in content) {
        const messages = galleryContent[conversation];
        const galleryItem = document.createElement("div");
        galleryItem.className = "gallery-item";
    
        for (var index in messages) {
            const messageItem = document.createElement("p");
            messageItem.textContent = messages[index];
    
            if (index % 2 == 0) messageItem.className = "query-topic";
    
            galleryItem.append(messageItem);
        }
    
        gallery.append(galleryItem);
    }

    $(".gallery-item").on('click touchstart', function() {
        $(this).toggleClass("active");
    });
}

function scrollTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function toggleSort() {
    gallery.empty();
    populateGallery(galleryContent.reverse());

    $("#oldest").toggleClass("active");
    $("#latest").toggleClass("active");
}

async function focusSearch() {
    $(".search").html(`
        <input id="search" type="text" placeholder="Search" autocomplete="off" enterkeyhint="search" maxlength="20"></input>
    `);

    $("#search").focus();
    $("#search").on("keydown", async (event) => {
        if (event.which == 13 && $("#search").val().trim() != "" && $("#search").focus()) {
            $("#search").blur();

            const result = await fetch(baseURL + 'search?query=' + $("#search").val(), { method: "GET" });
            galleryContent = await result.json();

            populateGallery(galleryContent);
        }
    });
}

$("#back").click(scrollTop);
$("#oldest").click(toggleSort);
$("#latest").click(toggleSort);
$("#search-button").click(focusSearch);