// Variables
const gallery = $(".gallery");
const baseURL = (window.location.href).replace("gallery.html", 'api/');
const sortBy = () => {
    if ($("#oldest").hasClass("active")) return "oldest";
    else return "newest";
};
let scrollLock = false;

// Initialise
const galleryData = (await fetch(baseURL + 'firebase/read/gallery?index=newest-20')).json();
var galleryContent = Object.values(await galleryData);

gallery.empty();
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
    
    $("#oldest").toggleClass("active");
    $("#newest").toggleClass("active");

    if (gallery.hasClass("search")) populateGallery(galleryContent.reverse());
    else {
        const sorting = sortBy();
        const galleryData = (await fetch(baseURL + `firebase/read/gallery?index=${sorting}-20`)).json();
        galleryContent = Object.values(await galleryData);
    
        switch(sorting) {
            case "newest":
                populateGallery(galleryContent.reverse());
                break;
            case "oldest":
                populateGallery(galleryContent);
                break;
        }
    }
}

async function focusSearch() {
    $(".search").html(`
        <input id="search" type="text" placeholder="Search" autocomplete="off" enterkeyhint="search" maxlength="20"></input>
    `);

    $("#search").focus();
    $("#search").on("keydown", async (event) => {
        if (event.which == 13 && $("#search").val().trim() != "" && $("#search").focus()) {
            $("#search").blur();
            gallery.addClass("search");

            const result = await fetch(baseURL + 'search?query=' + $("#search").val(), { method: "GET" });
            galleryContent = await result.json();

            gallery.empty();
            populateGallery(galleryContent);

            if (sortBy() == "oldest") $("#newest").addClass('active'), $("#oldest").removeClass('active');
        }
        else if (event.which == 13 && $("#search").val().trim() == "" && $("#search").focus()) {
            $("#search").blur();
            gallery.removeClass("search");

            var galleryContent = Object.values(await galleryData);

            gallery.empty();
            populateGallery(galleryContent.reverse());
        }
    });
}

async function infiniteLoad(index) {
    if (gallery.hasClass("search")) return;
    scrollLock = true;

    const sorting = sortBy();
    const newData = (await fetch(baseURL + `firebase/read/gallery?index=${sorting}-${index + 20}`)).json();
    const totalContent = Object.values(await newData);

    if (sorting == "newest") totalContent.reverse();
    const newContent = totalContent.slice(index, index + 20);

    populateGallery(newContent);
    scrollLock = false;
}

// Infinite Scroll
$(window).on("scroll", () => {
    if (scrollLock) return;

	const scrollHeight = $(document).height();
	const scrollPosition = $(window).height() + $(window).scrollTop();

	if (((scrollHeight - scrollPosition) / scrollHeight).toFixed(3) == 0) infiniteLoad($(".gallery-item").length);
});

$("#back").click(scrollTop);
$("#oldest").click(toggleSort);
$("#newest").click(toggleSort);
$("#search-button").click(focusSearch);