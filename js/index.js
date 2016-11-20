/**
 * Created by Khai on 11/19/2016.
 */

var numLike = 0;
var numSave = 0;
var numWow = 0;

var addIdea = function(ideaName, description, numLike, numSave, numWow){
    var myNewElement = "<div class='idea'><h2>" + ideaName + "</h2> <p> Description: " + description + "</p>";


    var loadReaction = "<div class='react-wrapper'> <img id='like' class='react-images' src='img/like.png'> <p class='react-counter'>" +
        numLike + "</p> <img id='save' class='react-images' src='img/saveicon.png'> <p class='react-counter'>" + numSave + "</p> <img id='wow' " +
        "class='react-images' src='img/wowface.png'> <p class='react-counter'>" + numWow + "</p></div></div>";

    myNewElement = myNewElement + loadReaction;

    $(myNewElement).hide().appendTo('.ideas-wrapper').fadeIn(1000);

};

function main(){
    $('#suggest-button').on('click',function(){
        var myIdeaName = $("textarea#Title").val();
        var myDescription = $("textarea#Description").val();
        if(myIdeaName.length > 0 && myDescription.length > 0) {
            addIdea(myIdeaName, myDescription, numLike, numSave, numWow);
            $("textarea#Title").val('');
            $("textarea#Description").val('');
        }
    });
}

$(document).ready(main);


