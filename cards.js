// Variables
const cardCount = 3;
var cardArray;
var deckObject;
var deckArray = [];

// Initialise
fetch("./tarot.json")
    .then((response) => response.json())
    .then((data) => deckObject = data);

// Functions
function flipCard(index, element) {
    element.classList.remove("active");

    // Fade in cardfront
    drawCard(index, shuffleCards());

    setTimeout(function() {
        element.remove();
        cardArray.splice(index);
    }, 1000);
}

function shuffleCards() {    
    const seedRandom = new Math.seedrandom(new Date().getTime());
    const random = seedRandom();
    
    const randomCard = Math.floor(random * deckArray.length);
    const chosenCard = deckArray[randomCard];

    delete deckArray[randomCard];
    deckArray = deckArray.filter(empty => empty);

    return chosenCard;
}

async function drawCard(index, cardName) {
    console.log(cardName);
    console.log("Cards remaining: " + index);

    const reversed = Math.random() > 0.5 ? true : false;
    const cardArt = await readTextFile(cardName);

    const card = new OpenCard(cardName, index, reversed, cardArt);
    interactive.append(card.element);

    readCard(cardName, index, reversed);

    setTimeout(function() {
        card.element.classList.add("active");
    }, 500);

    if (index <= 0) {
        setTimeout(function() {
            askRetry();
        }, 1500);
    }
}

async function dealCards() {
    for (var i = 0; i < cardCount; i++) {
        interactive.append(
            $(`
                <div class="card-back">
                    <pre class="art centre-align">${await readTextFile("cardback")}</pre>
                </div>
            `)
        );
    }

    cardArray = $(".card-back");

    cardArray.each(function (index, element) {
        setTimeout(function() {
            element.style.transform = "rotate(" + (Math.random() * (5 - -5) + -5) + "deg)";
            element.style.transform += "translateY(" + (Math.random() * (15 - -15) + -15) + "px)";
            element.style.transform += "translateX(" + (Math.random() * (15 - -15) + -15) + "px)";
            element.classList.add("active");
            element.addEventListener("click", () => {
                flipCard(index, element);
            });
        }, 1000 * index);
    });

    deckArray = [];

    for (var child in deckObject) {
        deckArray.push(child);
    }
}

async function readCard(cardName, index, reversed) {
    const reading = await topicResponse(cardName, index, reversed);
    $("#reading").text(reading);

    $(".chatbox").append(`
        <div class="GPT-message">Swipe this card away to continue with the reading, or</div>
        <div class="user-message">
            <p id="question">Ask a question</p>
        </div>
    `);

    askQuestion();
    $(".card-front").scrollTop($(".card-front")[0].scrollHeight);
}

async function readTextFile(cardName) {
    const fileName = cardName.toLowerCase().replace(/\s/g, '');
    var ascii;

    await fetch("./ascii/" + fileName + ".txt")
    .then(response => response.text())
    .then((data) => ascii = data);

    return ascii;
}

// Class Object
class OpenCard {
    constructor(cardName, index, reversed, cardArt) {
        this.cardName = cardName;
        this.cardIndex = index;
        this.reversed = reversed;
        this.cardArt = cardArt
        this.#init();
    }

    // Properties
    #startPoint;
    #offsetX;
    #offsetY;

    #isTouchDevice = () => {
        return (("ontouchstart" in window) || ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 ));
    }

    // Initialise
    #init = () => {
        const card = document.createElement("div");
        card.classList.add("card-front");
        card.innerHTML = `
            <pre class="art centre-align">${this.cardArt}</pre>
            <div class="chatbox">
                <div class="user-message"><p id="static">${topic}</p></div>
                <div class="GPT-message" id="reading">${topicBuffer[Math.floor(Math.random() * topicBuffer.length)]}</div>
            </div>
        `;

        this.element = card;

        if (this.reversed) {
            this.element.querySelector(".art").classList.add("reversed");
        }

        if (this.#isTouchDevice()) {
            this.#listenToTouchEvents();
        }
        else {
            this.#listenToMouseEvents();
        }
    }

    // Touch Events for Mobile
    #listenToTouchEvents = () => {
        this.element.addEventListener('touchstart', (e) => {
            const touch = e.changedTouches[0];

            if (!touch) return;

            const { clientX, clientY } = touch;
            this.#startPoint = { x: clientX, y: clientY };
            document.addEventListener("touchmove", this.#handleTouchMove);
            this.element.style.transition = "transform 0s";
        });
    
        document.addEventListener("touchend", this.#handleTouchEnd);
        document.addEventListener("cancel", this.#handleTouchEnd);
    }

    #handleTouchMove = (e) => {
        if (!this.#startPoint) return;
        const touch = e.changedTouches[0];
        if (!touch) return;
        const { clientX, clientY } = touch;
        this.#animateMove(clientX, clientY);
    }

    #handleTouchEnd = () => {
        this.#startPoint = null;
        document.removeEventListener("touchmove", this.#handleTouchMove);
        this.element.style.transform = "";
    }

    // Mouse Events for Desktop
    #listenToMouseEvents = () => {
        // mousedown
        this.element.addEventListener("mousedown", e => {
            const { clientX, clientY } = e;
            this.#startPoint = { x: clientX, y: clientY };
            document.addEventListener("mousemove", this.#handleMouseMove);
            this.element.style.transition = "transform 0s";
        });

        // mouseup 
        this.element.addEventListener("mouseup", this.#handleMouseUp);

        // cancel drag
        this.element.addEventListener("dragstart", e => {
            e.preventDefault();
        });
    }

    #handleMouseMove = (e) => {
        e.preventDefault();
        if (!this.#startPoint) return;
        const { clientX, clientY } = e;
        this.#animateMove(clientX, clientY);
    }

    #handleMouseUp = (e) => {
        this.#startPoint = null;
        document.removeEventListener("mousemove", this.#handleMouseMove);
        this.element.style.transform = "";
    }

    // Animate and Move Card
    #animateMove = (x, y) => {
        this.#offsetX = x - this.#startPoint.x;
        this.#offsetY = y - this.#startPoint.y;
        const rotate = this.#offsetX * 0.1;
        this.element.style.transform = `translate(${this.#offsetX}px, 0) rotate(${rotate}deg)`;
        
        // Threshold for Swiping
        if (Math.abs(this.#offsetX) > this.element.clientWidth * 0.6) {
            this.#swipe(this.#offsetX > 0 ? 1 : -1);
        }
    }

    // Remove Card
    #swipe = (direction) => {
        this.#startPoint = null;
        document.removeEventListener("mouseup", this.#handleMouseUp);
        document.removeEventListener("mousemove", this.#handleMouseMove);
        document.removeEventListener("touchend", this.#handleTouchEnd);
        document.removeEventListener("touchmove", this.#handleTouchMove);

        this.element.style.transition = "transform 1s";
        this.element.style.transform = `translate(${direction * window.innerWidth * 1.5}px, ${this.#offsetY}px) rotate(${90 * direction}deg)`;

        setTimeout(() => {
            this.element.remove();
        }, 1000);
    }
}
