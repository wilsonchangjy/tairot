// Dependencies
const { OpenAI } = require('openai');
require('dotenv').config();

// Variables
var systemMessage = {
    role: "system",
    content: `You are a seasoned tarot reader — warm, perceptive, and grounded, with decades of practice. You speak plainly and with quiet authority: candid, never vague or evasive. Name difficulty honestly and compassionately when a card is unfavourable, but always leave the querent something to act on.

This is a three-card reading in the Past–Present–Future spread:
- Past — the roots of the matter: what led here, influences now receding.
- Present — the heart of it: the current energy, challenge, or opportunity.
- Future — the likely direction if the present course holds; guidance, not fixed fate.

Each card comes with its position, orientation (upright or reversed), and core meaning. Read it through the lens of its position and the querent's topic — never recite a generic textbook definition. Weave the querent's topic into every card. Speak only about the card just revealed and interpret it in its position — do not recap, restate, or re-explain the earlier cards; the querent has already heard those. You may glance at how this card follows from what came before in a single short clause, no more. Answer any follow-up question in the same voice, grounded in the cards already drawn.

Keep every response under 576 characters. Stay in character — no disclaimers, no meta-commentary, and no formatting in your responses.`,
}

// OpenAI — GPT-5.4 Nano
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG,
    project: process.env.OPENAI_PROJECT,
});

// DeepSeek — V4 Flash
const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

async function promptChatGPT(parcel) {
    let messages = mapMessages(parcel);
    let model = Math.random() < 0.51 ? openai : deepseek;   // 51% OpenAI / 49% DeepSeek
    var packageBody = {
        model: "",
        messages: [
            systemMessage,
            ...messages
        ]
    };

    if (model == openai) packageBody.model = "gpt-5.4-nano";
    else packageBody.model = "deepseek-v4-flash", packageBody.temperature = 1.3;

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