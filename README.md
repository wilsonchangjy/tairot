# tAIrot
is a virtual tarot card reading experience powered by AI. This web application is currently live at https://tairot.app and hosted on Vercel.

The artwork used in this project features ASCII Tarot Cards by Asya Davydova Lewis
https://github.com/asyapluggedin/ascii-tarot/

# Usage
The experience was designed to be an intuitive and fuss-free microsite, with minimal instructions that might feel intrusive or distracting.

Simply enter a topic of interest in your life that you wish to know more about, and pull cards to them revealed and read by an AI. Further questions can be asked during the reading of each card to clarify something or gain insight on a specific area of interest. Cards can be swiped away with a flick (similar to Tinder or Bumble), to move on with the process.

This web project was designed for mobile devices to remind users of the sentiment that these readings are personal and intimate, and probably best to not be shown on a larger screen for others to peek at.

# Technical Considerations
This project is developed using HTML, CSS and JavaScript (including JQuery), on top of NodeJS and several dependencies as well as
- OpenAI's ChatGPT API https://platform.openai.com/; the readings and responses are derived from sending the "topic" and "card" from the users' interactions, running on the latest public version of gpt-4-turbo. The system message is prompted to emulate someone older, wiser and more experienced to give the readings some personality.
- David Bay's seedrandom.js https://github.com/davidbau/seedrandom; an "under the hood" feature that Asya suggested, which records the exact millisecond timestamp that the user "pulls" a card and uses that to seed a randomiser that assigns which card from the deck is being revealed. Although not made apparent to the user as a conscious decision, this was done in hopes of creating a stronger connection and meaning in each card that is being revealed to the users.
- Kiro Risk's Fuse.js https://www.fusejs.io/; a lightweight library that enables fuzzy-searches, which makes navigating the anonymous readings easier as the Gallery continues to expand. While it works brilliantly for the most part, some tweaks are needed as the breadth of the search is a little way too generous in my opinion.

# Changelog
**Version 1.7**
Another major update, this time featuring some assistance from Claude. Set up security measures as we bring this repo public, and updated both OpenAI and DeepSeek models (completely new prompting and instructions), as well as improved the Streaming response experience to be more lifelike.

**Version 1.6**
The Anniversary Update, and also the largest one by far. Updated to GPT 4 Omni Mini, and added a couple of features such as a fuzzy Search function within the Gallery, "Streaming" responses from the AI, as well as implementing Infinite Scroll loading for the Gallery.

**Version 1.5**
Updated to GPT 4 Turbo (Preview), and added a simple Statistics page.

**Version 1.4**
Added Gallery; users will be able to publish and view readings from themselves and other anonymous users. This is done when users swipe right to dismiss the card after a reading.

**Version 1.3**
Style changes made to ensure the card's ASCII artwork displays closer to Asya's original designs.