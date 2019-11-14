// Document ready posts to the crypto controller to get a message
// to display on the screen, then passes that message to scramble.
$(document).ready( function() {
    $.post("/aspx/crypto/message")
        .done( function(response) {
            $("#message").text(response.message);
            scrambler($("#message").text());
            // Do same calls via REST2, with timeouts so we can see it happen.
            setTimeout(function()  {
                $("#scrambled").text("Do it again with REST2!");
                $("#descrambled").text("Do it again with REST2!");
                setTimeout(function()  {
                    rest2Scrambler($("#message").text());
                }, 400);
            }, 2000);
            