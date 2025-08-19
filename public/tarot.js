// Variables
var topic;
var query;
var chatHistory = [];

const topicBuffer = ["Ah yes, I see it now...", "Hmm, that's interesting...", "Well, I certainly didn't expect this card...", "Gimme a second...", "It's all falling into place now..."];
const queryBuffer = ["Hmm, facinating...", "Oh? Let me think about it...", "Sigh, how should I put this...", "Mm hmm...", "Uh huh, okay...", "Yeah, well..."];
const tarotArray = ["The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
                    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
                    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups", "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
                    "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups", "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", 
                    "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles",
                    "Queen of Pentacles", "King of Pentacles", "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords", "Six of Swords", "Seven of Swords",
                    "Eight of Swords", "Nine of Swords", "Ten of Swords", "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords", "Ace of Wands", "Two of Wands", 
                    "Three of Wands", "Four of Wands", "Five of Wands", "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands","Page of Wands", 
                    "Knight of Wands", "Queen of Wands", "King of Wands"];

// Initialise

// Functions
function promptQuery(input) {
    $(".chatbox").append(`
        <div class="GPT-message">${queryBuffer[Math.floor(Math.random() * queryBuffer.length)]}</div>
    `);

    queryResponse(input);
    $(".card-front").scrollTop($(".card-front")[0].scrollHeight);
}

function clearHistory(type) {
    switch(type) {
        case 'chat':
            chatHistory.splice(0, chatHistory.length);
            break;
        case 'card':
            cardHistory.splice(0, cardHistory.length);
            cardHistory.push(topic);
            break;
    }
}

async function topicResponse(input, index, reversed) {
    var countArray = ["last", "second", "first"];

    var intro = `I wish to do a tarot card reading on "${topic}", and `;
    var card = `the ${countArray[index]} card I pulled is the ${input}`;
    var response;

    if (reversed) card += " reversed";

    if (index == "2") response = await packageMessage(intro + card);
    else response = await packageMessage(card + ", and tell me how it relates to my previous cards");

    return response;
}

async function queryResponse(input) {
    const response = await packageMessage(input);
    cardHistory.push(response);
    
    streamText(response, $(".GPT-message").last());
}

const packageMessage = async (message) => {
    const newMessage = {
        content: message,
        sender: "user",
    };
    chatHistory.push(newMessage);
    
    const data = await fetch(baseURL + 'openai/prompt', {
        method: "POST",
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({ parcel: chatHistory })
    });
    const response = await data.json();

    const receivedMessage = {
        content: response,
        user: "ChatGPT"
    }
    chatHistory.push(receivedMessage);

    return response;
};

function streamText(text, target) {
    let completeText = '';
    let index = 0;

    const pseudoStream = setInterval(() => {
        completeText += text.charAt(index);
        target.text(completeText);
        
        index++;

        if ((index % 33) == 0) $(".card-front").scrollTop($(".card-front")[0].scrollHeight);
        if (index == text.length) clearInterval(pseudoStream), endResponse();
    }, 17);
}

function endResponse() {
    $(".chatbox").append(`
        <div class="GPT-message">Swipe this card right to publish this reading anonymously or left to discard, or ask a</div>
        <div class="user-message">
            <span id="question">follow up question</span>
        </div>
    `);

    askQuestion();
    $(".card-front").scrollTop($(".card-front")[0].scrollHeight);
}