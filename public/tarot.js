// Variables
var topic;
var query;
var chatHistory = [];

const topicBuffer = ["Ah yes, I see it now...", "Hmm, that's interesting...", "Well, I certainly didn't expect this card...", "Gimme a second...", "It's all falling into place now..."];
const queryBuffer = ["Hmm, facinating...", "Oh? Let me think about it...", "Sigh, how should I put this...", "Mm hmm...", "Uh huh, okay..."];

// Initialise
fetch(baseURL.replace('/api', '') + "tarot.json")
    .then((response) => response.json())
    .then((data) => deckObject = data);

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
    var countArray = ["final", "second", "first"];

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
        $(".card-front").scrollTop($(".card-front")[0].scrollHeight);

        index++;

        if (index == text.length) clearInterval(pseudoStream), endResponse();
    }, 15);
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