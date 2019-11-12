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
            // Initiates chain to generate, scramble, descramble and
            // validate an array of random passwords.
            generatePasswordArray();

            // REST2 works for passing arrays, but breaks on strings that include ";" and ",".
            // rest2GeneratePasswordArray( function(unscrambledArray) {
            //     appendArrayToID(unscrambledArray, $("#unscrambledPasswords"));
            //     unscrambledArray = escapeStuff(unscrambledArray);
            //     rest2ScramblerArray(unscrambledArray);
            // })
        })
        .fail( function(error) {
            console.error(error);
        });
});

// Scrambler calls scramble, appends the scrambled message to the screen,
// then passes the scrambled nessage to descrambler.
function scrambler(unscrambled) {
    scramble(unscrambled, function(scrambled) {
        $("#scrambled").text(scrambled);
        // This is somewhat unneeded, as I could have just passed the call
        // to descramble(scrambled, callback) instead.
        descrambler(scrambled);
    });
}

// Descrambler calls descramble and appends the descrambled message to the screen.
function descrambler(scrambled) {
    descramble(scrambled, function(descrambled) {
        $("#descrambled").text(descrambled);
    });
}

// REST2 versions.
function rest2Scrambler(unscrambled) {
    rest2Scramble(unscrambled, function(scrambled) {
        $("#scrambled").text(scrambled);
        // This is somewhat unneeded, as I could have just passed the call
        // to descramble(scrambled, callback) instead.
        rest2Descrambler(scrambled);
    });
}

// REST2 versions.
function rest2Descrambler(scrambled) {
    rest2Descramble(scrambled, function(descrambled) {
        $("#descrambled").text(descrambled);
    });
}

// This posts to generatePasswordArray, appends the array to the page,
// and passes the array to verifyPasswordArray, then returns the unscrambled array.
function generatePasswordArray() {
    $.post("/aspx/crypto/generatePasswordArray")
        .done( function(response) {
            // arrayTest(response.unscrambledArray);
            // scramblerArray(response.unscrambledArray);
            // rest2ScramblerArray(response.unscrambledArray);

            // appendArrayToID(response.unscrambledArray, $("#unscrambledPasswords"));
            // appendArrayToID(response.scrambledArray, $("#scrambledPasswords"));
            // appendArrayToID(response.descrambledArray, $("#descrambledPasswords"));
            appendArraysToIDsVerySlowly(response);
            validateArrays(response.unscrambledArray, response.descrambledArray);
        })
        .fail( function(error) {
            console.error(error);
        });
}

function appendArrayToID(array, selector) {
    $.each(array, function(index, value) {
        selector.append("<li>" + htmlEncode(value) + "</li>");
    });
}

function appendArraysToIDsVerySlowly(response) {
    var length = response.unscrambledArray.length;

    // Without an anonymous closure, calling this with a for loop/timeout will fail spectacularly.
    function appendStuff(response, i) {
        $("#unscrambledPasswords").append("<li>" + htmlEncode(response.unscrambledArray[i]) + "</li>");
        $("#scrambledPasswords").append("<li>" + htmlEncode(response.scrambledArray[i]) + "</li>");
        $("#descrambledPasswords").append("<li>" + htmlEncode(response.descrambledArray[i]) + "</li>");
    }

    // Binding the variables to the function allows use in a for loop.
    var appendElements = function(response, i) {
        setTimeout( function() {
            $("#unscrambledPasswords").append("<li>" + htmlEncode(response.unscrambledArray[i]) + "</li>");
            $("#scrambledPasswords").append("<li>" + htmlEncode(response.scrambledArray[i]) + "</li>");
            $("#descrambledPasswords").append("<li>" + htmlEncode(response.descrambledArray[i]) + "</li>");
        }, i * 100);
    };

    // Anonymous closure.
    // for (var i = 0; i < length; ++i) {
    //     (function(response, i) {
    //         setTimeout( function() {
    //             appendStuff(response, i);
    //         }, i * 100);
    //     }(response, i));
    // }

    // Another anonymous closure.
    // for (var i = 0; i < length; ++i) {
    //     setTimeout( (function(response, i) {
    //         return function() {
    //             appendStuff(response, i);
    //         };
    //     })(response, i), i * 100);
    // }

    // More readable.
    // for (var i = 0; i < length; ++i) {
    //     appendElements(response, i);
    // }

    // With setInterval, best way IMHO. Uses reference to self to kill self at end of Arrays.
    var i = 0;
    var interval = setInterval( function() {
        $("#unscrambledPasswords").append("<li>" + htmlEncode(response.unscrambledArray[i]) + "</li>");
        $("#scrambledPasswords").append("<li>" + htmlEncode(response.scrambledArray[i]) + "</li>");
        $("#descrambledPasswords").append("<li>" + htmlEncode(response.descrambledArray[i]) + "</li>");
        ++i;
        if (i == length) {
            clearInterval(interval);
        }
    }, 100);
    interval;
}

// This posts to generatePasswordArray, appends the array to the page,
// and passes the array to verifyPasswordArray, then returns the unscrambled array.
function rest2GeneratePasswordArray(callback) {
    REST2.exec({
        url: "/aspx/crypto/generatePasswordArray",
        callback: function(context) {
            if (REST2.isSuccess(context)) {
                callback(context.Result.unscrambledArray);
            } else if (context.HasErrors) {
                console.error(context.Errors);
            }
        }
    });
}

function escapeStuff(unescapedArray) {
    var length = unescapedArray.length;

    for (var i = 0; i < length; ++i) {
        var element = unescapedArray[i];
        unescapedArray[i] = element.replace(/;/g, "\\;").replace(/,/g, "\\,");
    }

    return unescapedArray;
}

function arrayTest(unscrambledArray) {
    var valid = true;
    var length = unscrambledArray.length;

    $.each(unscrambledArray, function(index, value) {
        scramble(value, function(scrambled) {
            descramble(scrambled, function(descrambled) {
                $("#unscrambledPasswords").append("<li>" + htmlEncode(value) + "</li>");
                $("#scrambledPasswords").append("<li>" + htmlEncode(scrambled) + "</li>");
                $("#descrambledPasswords").append("<li>" + htmlEncode(descrambled) + "</li>");
                if (value != descrambled) {
                    $("#validatePasswords").append("FAILURE @ " + index + "...<br/>");
                    valid = false;
                }
                if (index == length -1 && valid) {
                    $("#validatePasswords").append("Zach owes you 7K!!!");
                }
            });
        });
    });
}

// These didn't work, because passing the array to the backend somehow borked out.
// Saved for possible fixing and reuse later. EDIT: The fix should involve
// passing a second array of metadata with the length of each string as
// indexes. The backend reads the passed array as one long string and
// chops it up at commas and semicolons (maybe others?), so the scrambled
// arrays have to be passed as strings instead and separated using the metadata array.

// This calls scrambleArray and passes the append function + a call to descramblerArray.
function scramblerArray(unscrambledArray) {
    scrambleArray(unscrambledArray, function(scrambledArray) {
        appendArrayToID(scrambledArray, $("#scrambledPasswords"));
        descramblerArray(unscrambledArray, scrambledArray);
    });
}

// This calls descrambleArray and passes the append function + a call to validateArrays.
function descramblerArray(unscrambledArray, scrambledArray) {
    descrambleArray(scrambledArray, function(descrambledArray) {
        appendArrayToID(descrambledArray, $("#descrambledPasswords"));
        validateArrays(unscrambledArray, descrambledArray);
    });
}

// This calls scrambleArray and passes the append function + a call to descramblerArray.
function rest2ScramblerArray(unscrambledArray) {
    rest2ScrambleArray(unscrambledArray, function(scrambledArray) {
        appendArrayToID(scrambledArray, $("#scrambledPasswords"));
        console.log(unscrambledArray);
        console.log(scrambledArray);
        //rest2DescramblerArray(unscrambledArray, scrambledArray);
    });
}

// This calls descrambleArray and passes the append function + a call to validateArrays.
function rest2DescramblerArray(unscrambledArray, scrambledArray) {
    rest2DescrambleArray(scrambledArray, function(descrambledArray) {
        appendArrayToID(descrambledArray, $("#descrambledPasswords"));
        //validateArrays(unscrambledArray, descrambledArray);
    });
}

function validateArrays(unscrambledArray, descrambledArray) {
    var valid = true;

    $.each(unscrambledArray, function(index, value) {
        if (value != descrambledArray[index]) {
            $("#validatePasswords").append("FAILURE @ " + index + "...<br/>");
            valid = false;
        }
    });

    if (valid) {
        $("#validatePasswords").append("Zach owes you 7K!!!");
    }
}

