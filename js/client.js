/**
 * Created by Khai on 11/20/2016.
 */

var ws = new WebSocket('ws://ladyhacks-veil.herokuapp.com');

var idea_array = [];

var addIdea = function(ideaName,arrayindex, description, numLike, numSave, numWow){
    var myNewElement = "<div id = '" + arrayindex + "'class='idea'><h2>" + ideaName + "</h2> <p> Description: " + description + "</p>";


    var loadReaction = "<div class='react-wrapper'> <img id='like' class='react-images' src='img/like.png'> <p class='react-counter'>" +
        numLike + "</p> <img id='save' class='react-images' src='img/saveicon.png'> <p class='react-counter'>" + numSave + "</p> <img id='wow' " +
        "class='react-images' src='img/wowface.png'> <p class='react-counter'>" + numWow + "</p></div></div>";

    myNewElement = myNewElement + loadReaction;

    $(myNewElement).hide().appendTo('.ideas-wrapper').fadeIn(1000);

};

function react(arrayindex, react)
{
    var object = UIA[parseInt(arrayindex)];

    var obj4 = {
        session_id : object.session_id,
        session_title : object.session_title,
        idea_id : object.idea_id,
        idea_title : object.idea_title,
        action : react,
        comment : null,
        user : author
    }

    ws.send(JSON.stringify(obj4));
}

function new_idea(title, s_id, idea_title, idea_id, description, author, reacts){
    this.session_title = title;
    this.session_id = s_id;
    this.idea_title = idea_title;
    this.idea_id = idea_id;
    this.description = description;
    this.author = author;
    this.reacts = reacts;
}

ws.onmessage = function add_update(message){
    var data = JSON.parse(message);
    var updated_session = data.object;
    var UIA = updated_session.ideas;

    for(var i = 0; i < UIA.length; i++)
    {
        if(UIA[i].idea_id != idea_array[i].idea_id)
        {
            idea_array[i].append(new new_idea(UIA[i].session_title, UIA[i].session_id, UIA[i].idea_title, UIA[i].idea_id,
                UIA[i].description, UIA[i].author, UIA[i].reacts));
            addIdea(UIA[i].idea_title, i, UIA[i].description, UIA[i].reacts.upvote, UIA[i].reacts.love, UIA[i].reacts.wow);
        }
        else
        {
            idea_array[i].session_title = UIA[i].session_title;
            idea_array[i].session_id = UIA[i].session_id;
            idea_array[i].idea_title = UIA[i].idea_title;
            idea_array[i].idea_idea = UIA[i].idea_id;
            idea_array[i].description = UIA[i].description;
            idea_array[i].author = UIA[i].author;
            idea_array[i].reacts = UIA[i].reacts;
        }
    }
};

function main(){

    $('#suggest-button').on('click',function(){
        var myIdeaName = $("textarea#Title").val();
        var myDescription = $("textarea#Description").val();
        if(myIdeaName.length > 0 && myDescription.length > 0) {
            ws.send(JSON.stringify(new new_idea('Default Session','1234',myIdeaName,Math.random()*9999,myDescription,
                'NEW CHALLENGER',new_reacts(10,3,1))));
            $("textarea#Title").val('');
            $("textarea#Description").val('');
        }
    });

    $('#like').on('click',function(){
        react(event.target.id, 'upvote');
    });
    $('#save').on('click',function(){
        react(event.target.id, 'love');
    });
    $('#wow').on('click',function(){
        react(event.target.id, 'wow');
    });

}

$(document).ready(main);

