import { readFromFirebase } from "./firebase.js";

// Variables
const gallery = $(".gallery");

// Initialise
const galleryContent = Object.values(await readFromFirebase("gallery"));
populateGallery(galleryContent.reverse());

// Functions
function populateGallery(content) {
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

    $(".gallery-item").click(function() {
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

$("#back").click(scrollTop);
$("#oldest").click(toggleSort);
$("#latest").click(toggleSort);