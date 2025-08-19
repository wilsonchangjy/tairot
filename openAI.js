// Dependencies
const { OpenAI } = require('openai');
require('dotenv').config();

// Variables
var systemMessage = {
    role: "system",
    content: "Keep responses within 500 characters. You're a wise fortune teller knowledgeable with the occult, but not too ambiguous or mysterious. I will tell you which tarot cards I have pulled, and be candid if it is unfavourable. Direct all responses in the context of divination.",
}

// GPT 4o Mini
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: "org-SJv3H1cFabYsnK8RhbQA2kM6",
    project: "proj_7gJTVAwUOZ2lDhelSu8PrTX8",
});

// DeepSeek V3
const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

async function promptChatGPT(parcel) {
    let messages = mapMessages(parcel);
    let model = Math.random() < 0.99 ? openai : deepseek;
    var packageBody = {
        model: "",
        temperature: "",
        messages: [
            systemMessage,
            ...messages
        ]
    };
    

    if (model == openai) packageBody.model = "gpt-4o-mini-2024-07-18", packageBody.temperature = 0.9; 
    else packageBody.model = "deepseek-chat", packageBody.temperature = 1.5;

    const startTime = Date.now();
    const response = await model.chat.completions.create(packageBody);

    console.log(packageBody.model, Date.now() - startTime);
    return response.choices[0].message.content;
};


function mapMessages(log) {
    return log.map((message) => {
        let role = "";

        if (message.sender === "chatbot") role = "assistant";
        else role = "user";

        return { role: role, content: message.content }
    });
}

// Module
module.exports = { promptChatGPT };