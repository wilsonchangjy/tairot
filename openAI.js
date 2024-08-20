// Dependencies
const { OpenAI } = require('openai');
require('dotenv').config();

// Variables
var systemMessage = {
    role: "system",
    content: "Keep responses within 480 characters, and speak like an old and wise fortune teller, but not too mysterious. I will tell you which tarot cards I have pulled, and be candid if it is looking bad. Direct all responses in the context of divination.",
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-SJv3H1cFabYsnK8RhbQA2kM6",
    project: "proj_7gJTVAwUOZ2lDhelSu8PrTX8",
});

// GPT 4o (Mini)
async function promptChatGPT(parcel) {
    let messages = mapMessages(parcel);
    const packageBody = {
        "model": "gpt-4o-mini",
        "messages": [
            systemMessage,
            ...messages
        ],
        "max_tokens": 128,
        "temperature": 1
    };

    const response = await openai.chat.completions.create(packageBody);
    return response.choices[0].message.content;
};

function mapMessages(log) {
    return log.map((message) => {
        let role = "";

        if (message.sender === "ChatGPT") role = "assistant";
        else role = "user";

        return { role: role, content: message.content }
    });
}

// Module
module.exports = { promptChatGPT };