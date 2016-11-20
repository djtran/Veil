/**
 * Created by Khai on 11/19/2016.
 */



var addIdea = function(ideaName, description){
    var myNewElement = "<div class='idea'><h2>" + ideaName + "</h2> <p> Description: " + description + "</p></div>";
    $(myNewElement).hide().appendTo('.ideas-wrapper').fadeIn(1000);
};

function main(){
    $('#suggest-button').on('click',function(){
        var myIdeaName = $("textarea#Title").val();
        var myDescription = $("textarea#Description").val();
        if(myIdeaName.length > 0 && myDescription.length > 0) {
            addIdea(myIdeaName, myDescription);
            $("textarea#Title").val('');
            $("textarea#Description").val('');
        }
    });

}

$(document).ready(main);


