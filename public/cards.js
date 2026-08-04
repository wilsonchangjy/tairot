// Variables
const cardCount = 3;
var cardArray;
var deckArray = [];
var cardsRead = 0;
var revealing = false;
var revealTimeout;
var activeCard = null;

// Each OpenCard owns its own history array. `cardHistory` simply points at the
// card currently being read, so follow-up questions still append to the right one —
// but a later reveal can no longer wipe an earlier card's pending reading.
var cardHistory = [];

// Initialise

// Functions
function flipCard(element) {
    element.classList.remove("active");

    const position = ++cardsRead;
    drawCard(position, shuffleCards());

    setTimeout(function() { element.remove() }, 1000);
}

function shuffleCards() {    
    const dateTime = new Date().getTime();
    const seedRandom = new Math.seedrandom(dateTime);
    const random = seedRandom();
    
    const randomCard = Math.floor(random * deckArray.length);
    const chosenCard = deckArray[randomCard];

    delete deckArray[randomCard];
    deckArray = deckArray.filter(empty => empty);

    fetch(baseURL + 'firebase/update', {
        method: "POST",
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({ parcel: { "latest": dateTime }})
    });
    fetch(baseURL + 'firebase/update', {
        method: "POST",
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({ parcel: "pull" })
    });

    return chosenCard;
}

async function drawCard(position, cardName) {
    console.log(cardName);

    const reversed = Math.random() > 0.5 ? true : false;
    const cardArt = await readTextFile(cardName);

    const card = new OpenCard(cardName, position, reversed, cardArt);
    interactive.append(card.element);

    // Point the shared reference at this card so follow-up questions land here.
    activeCard = card;
    cardHistory = card.history;

    readCard(cardName, position, reversed, card);

    setTimeout(function() {
        card.element.classList.add("active");
    }, 500);

    if (position >= cardCount) {
        setTimeout(function() {
            askRetry();
        }, 1500);
    }
}

async function dealCards() {
    cardsRead = 0;
    revealing = false;

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
                // Hold the lock for the whole reveal-and-read cycle, not a fixed 1s —
                // the old timer expired mid-request, so a rapid tap could start a
                // second reading while the first was still in flight.
                if (revealing) return;
                revealing = true;

                // Safety net so a failure upstream can never leave the deck locked.
                clearTimeout(revealTimeout);
                revealTimeout = setTimeout(function() { revealing = false; }, 15000);

                flipCard(element);
            });
        }, 1000 * index);
    });

    deckArray = [...tarotArray];
}

async function readCard(cardName, position, reversed, card) {
    const history = card.history;   // this card's own array — never clobbered by a later reveal
    const target = $(card.element.querySelector("#reading"));

    const revealMin = 1500, revealMax = 2000;
    const revealPause = new Promise(resolve =>
        setTimeout(resolve, revealMin + Math.random() * (revealMax - revealMin)));

    try {
        const reading = await topicResponse(cardName, position, reversed);
        await revealPause;

        history.push(reading);
        streamText(reading, target);
    } catch (error) {
        // Tell the querent instead of leaving the filler line sitting there forever.
        console.log('reading failed:', error);
        await revealPause;

        card.failed = true;
        target.text("The cards are clouded, and this one will not be read. Swipe on, and try again in a moment.");
    } finally {
        clearTimeout(revealTimeout);
        revealing = false;
    }
}

async function readTextFile(cardName) {
    const fileName = cardName.toLowerCase().replace(/\s/g, '');
    const ascii = await fetch(baseURL + "ascii?card=" + fileName, { method: "GET" });

    return await ascii.json();
}

// Class Object
class OpenCard {
    constructor(cardName, index, reversed, cardArt) {
        this.cardName = cardName;
        this.cardIndex = index;
        this.reversed = reversed;
        this.cardArt = cardArt
        this.history = [topic];   // this card's own reading history
        this.failed = false;
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
                <div class="user-message"><span id="static">${topic}</span></div>
                <div class="GPT-message" id="reading">${topicBuffer[Math.floor(Math.random() * topicBuffer.length)]}</div>
            </div>
        `;

        this.element = card;

        if (this.reversed) this.element.querySelector(".art").classList.add("reversed");

        if (this.#isTouchDevice()) this.#listenToTouchEvents();
        else this.#listenToMouseEvents();
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
        if (Math.abs(this.#offsetX) > this.element.clientWidth * 0.6) this.#swipe(this.#offsetX > 0 ? 1 : -1);
    }

    // Remove Card
    #swipe = (direction) => {
        this.#startPoint = null;
        document.removeEventListener("mouseup", this.#handleMouseUp);
        document.removeEventListener("mousemove", this.#handleMouseMove);
        document.removeEventListener("touchend", this.#handleTouchEnd);
        document.removeEventListener("touchmove", this.#handleTouchMove);

        this.element.style.transition = "transform 1s";
        this.element.style.transform = `translate(${direction * window.innerWidth * 1.5}px, ${this.#offsetY}px) rotate(${60 * direction}deg)`;

        if (direction > 0) {
            // Publish this card's own history, not whichever card was read last.
            fetch(baseURL + 'firebase/write', {
                method: "POST",
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ parcel: this.history })
            });
            fetch(baseURL + 'firebase/update', {
                method: "POST",
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ parcel: "gallery" })
            });
        }

        setTimeout(() => {
            this.element.remove();
        }, 1000);
    }
}