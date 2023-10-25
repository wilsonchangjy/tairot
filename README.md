# tAIrot
is a virtual tarot card reading experience powered by AI.

tAIrot is currently live and being hosted on GitHub pages at https://tairot.fun. However, the readings and responses provided by the AI might be temporarily unavailable due to a usage limit.

The artwork used in this project features ASCII Tarot Cards by Asya Davydova Lewis
https://github.com/asyapluggedin/ascii-tarot/

# Usage
The experience was designed to be an intuitive and fuss-free microsite, with minimal instructions that might feel intrusive or distracting.

Simply enter a topic of interest in your life that you wish to know more about, and pull cards to them revealed and read by an AI. Further questions can be asked during the reading of each card to clarify something or gain insight on a specific area of interest. Cards can be swiped away with a flick (similar to Tinder or Bumble), to move on with the process.

This web project was designed for mobile devices to remind users of the sentiment that these readings are personal and intimate, and probably best to not be shown on a larger screen for others to peek at.

# Technical Considerations
This project is developed using HTML, CSS and JavaScript (including JQuery).
- OpenAI's ChatGPT API https://platform.openai.com/; the readings and responses are derived from sending the "topic" and "card" from the users' interactions, running on the latest public version of gpt-4. The system message is prompted to emulate someone older, wiser and more experienced to give the readings some personality.
- David Bay's seedrandom.js https://github.com/davidbau/seedrandom; an "under the hood" feature that Asya suggested, which records the exact millisecond timestamp that the user "pulls" a card and uses that to seed a randomiser that assigns which card from the deck is being revealed. Although not made apparent to the user as a conscious decision, this was done in hopes of creating a stronger connection and meaning in each card that is being revealed to the users.

# Changelog
**Version 1.04**
Added Gallery; users will be able to publish and view readings from themselves and other anonymous users. This is done when users swipe right to dismiss the card after a reading.

**Version 1.03**
Style changes made to ensure the card's ASCII artwork displays closer to Asya's original designs.
