// Variables
const interactive = $(".interactive");
const begin = $("#begin");
const logo = $(".logo");

// Functions
begin.click(function() {
    interactive.html(`
        <span class="input" id="topic" role="textbox" contenteditable onkeypress="inputKeyPress()" enterkeyhint="send"></span>
    `);

    $("#topic").focus();
});

logo.click(function() {
    location.href = "statistics.html";
});

function inputKeyPress() {
    var keyPress = window.event.keyCode;

    if (keyPress == 13 && $("#topic").text().trim() != "" && $("#topic").focus()) {
        $("#topic").blur();

        clearHistory();
        promptTopic($("#topic").text());
        dealCards();
        swapOut("#topic");
    }
    else if (keyPress == 13 && $("#query").text().trim() != "" && $("#query").focus()) {
        $("#query").blur();

        updateStatistics("ask");

        promptQuery($("#query").text());
        swapOut("#query");
    }
}

function swapOut(idTag) {
    const text = $(idTag).text();
    const parent = $(idTag).parent();

    $(idTag).remove();
    parent.append(`
        <p id="static">${text}</p>
   `);
}

function askQuestion() {
    const question = $("#question");

    question.click(function () {        
        $(".user-message").last().append(`
            <span class="input" id="query" role="textbox" contenteditable onkeypress="inputKeyPress()" enterkeyhint="send"></span>
        `);
    
        const input = $("#query");
        input.focus();

        $("#question").remove();
    });
}

function askRetry() {
    $("#static").remove();

    interactive.append(`
        <p id="retry">better luck next time?</p>
    `);

    $("#retry").click(function() {    
        interactive.html(`
            <span class="input" id="topic" role="textbox" contenteditable onkeypress="inputKeyPress()" enterkeyhint="send"></span>
        `);

        $("#topic").focus();
    });
}