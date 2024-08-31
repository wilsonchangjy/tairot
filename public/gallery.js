// Variables
const gallery = $(".gallery");
const pagination = $("#pagination");
const baseURL = (window.location.href).replace("gallery.html", 'api/');
const sortBy = () => {
    if ($("#oldest").hasClass("active")) return "oldest";
    else return "newest";
};

// Initialise
const galleryData = (await fetch(baseURL + 'firebase/read/gallery?index=newest-20')).json();
const galleryStats = await fetch(baseURL + 'firebase/read?path=stats');
var galleryContent = Object.values(await galleryData);
var galleryCount = await galleryStats.json();

gallery.empty();
pagination.text("loading...");
populateGallery(galleryContent.reverse());

// Functions
function populateGallery(content) {
    for (var conversation in content) {
        const messages = content[conversation];
        const galleryItem = document.createElement("div");
        galleryItem.className = "gallery-item";
    
        for (var index in messages) {
            const messageItem = document.createElement("p");
            messageItem.textContent = messages[index];
    
            if (index % 2 == 0) messageItem.className = "query-topic";
    
            galleryItem.append(messageItem);
        }

        $clamp(galleryItem, { clamp: 3 });
        gallery.append(galleryItem);
    }

    $(".gallery-item").on('click', function() {
        $(this).prop('style').removeProperty("-webkit-line-clamp");
    });
}

function scrollTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

async function toggleSort() {
    gallery.empty();
    $(".sort p").toggleClass("active");

    const sorting = sortBy();
    const galleryData = (await fetch(baseURL + `firebase/read/gallery?index=${sorting}-20`)).json();
    galleryContent = Object.values(await galleryData);

    pagination.text(`Showing 20 of ${galleryCount.gallery}`);

    switch(sorting) {
        case "newest":
            populateGallery(galleryContent.reverse());
            break;
        case "oldest":
            populateGallery(galleryContent);
            break;
    }
}

async function focusSearch() {
    $(".search").html(`
        <input id="search" type="text" placeholder="Search" autocomplete="off" enterkeyhint="search" maxlength="20"></input>
    `);

    $("#search").focus();
    $("#search").on("keydown", async (event) => {
        if (event.which == 13 && $("#search").focus()) {
            if ($("#search").val().trim() != "") {
                gallery.addClass("search");
    
                const result = await fetch(baseURL + 'search?query=' + $("#search").val(), { method: "GET" });
                galleryContent = await result.json();

                $(".sort p").removeClass("active");
                $(".sort p").addClass("disabled");

                pagination.text(`Showing ${galleryContent.length} of ${galleryContent.length}`);
            }
            else if ($("#search").val().trim() == "") {
                gallery.removeClass("search");
    
                galleryContent = Object.values(await galleryData);
                galleryContent.reverse();

                $(".sort p").removeClass("disabled");
                $("#newest").addClass("active");

                pagination.text(`Showing 20 of ${galleryCount.gallery}`);
            }
            
            $("#search").blur();
            gallery.empty();
            populateGallery(galleryContent);
        }
    });
}

async function infiniteLoad(index) {
    if (gallery.hasClass("search") || gallery.hasClass("loading")) return;
    gallery.addClass("loading");

    const endIndex = index + 20;
    const sorting = sortBy();
    const newData = (await fetch(baseURL + `firebase/read/gallery?index=${sorting}-${endIndex}`)).json();
    const totalContent = Object.values(await newData);

    if (sorting == "newest") totalContent.reverse();
    const newContent = totalContent.slice(index, endIndex);

    populateGallery(newContent);
    pagination.text(`Showing ${(endIndex < galleryCount.gallery ? endIndex : galleryCount.gallery)} of ${galleryCount.gallery}`);

    gallery.removeClass("loading");
}

// Infinite Scroll
$(window).on("scroll", () => {
    if (gallery.hasClass("loading")) return;
    else if (pagination.isVisible()) infiniteLoad($(".gallery-item").length);
});

$.fn.isVisible = function() {
    const elementTop = $(this).offset().top;
    const elementBottom = elementTop + $(this).outerHeight();

    const viewportTop = $(window).scrollTop();
    const viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

// Event Listeners
$("#back").click(scrollTop);
$(".sort p").click(toggleSort);
$("#search-button").click(focusSearch);