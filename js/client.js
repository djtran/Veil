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

function resetSession(session)
{
    var resetter = {};
    resetter.session_title = $('#ideaBoard').text();
    resetter.session_id = $('#sessionId').text();
    resetter.reset = true;

    ws.send(JSON.stringify(resetter));
}

function new_idea(title, s_id, idea_title, idea_id, description, author){
    this.session_title = title;
    this.session_id = s_id;
    this.idea_title = idea_title;
    this.idea_id = idea_id;
    this.description = description;
    this.author = author;
    this.reacts = {upvote: 0, love: 0, wow: 0};
}

ws.onopen = function initialize(){
    var session = {
        session_title : "Default Session",
        session_id : "1234",
        create_session : true,
    }

    ws.send(JSON.stringify(session));
}

ws.onmessage = function add_update(message){
    var data = JSON.parse(message.data);
    var updated_session = data.object;
    $("#sessionId").text(updated_session.session_id);
    $("#ideaBoard").text(updated_session.session_title);
    var UIA = updated_session.ideas;

    console.log(message);

    /////////////////
    // Update existing

    for(var j = 0; j < idea_array.length; j++)
    {
        idea_array[j].session_title = UIA[j].session_title;
        idea_array[j].session_id = UIA[j].session_id;
        idea_array[j].idea_title = UIA[j].idea_title;
        idea_array[j].idea_idea = UIA[j].idea_id;
        idea_array[j].description = UIA[j].description;
        idea_array[j].author = UIA[j].author;
        idea_array[j].reacts = UIA[j].reacts;

    }



    ////////////////
    //Add new

    var i = 0;
    if(UIA.length > idea_array.length)
    {
        i = UIA.length - idea_array.length;
        i = UIA.length - i;
    }

    for(i; i < UIA.length; i++)
    {

        idea_array.push(new new_idea(UIA[i].session_title, UIA[i].session_id, UIA[i].idea_title, UIA[i].idea_id,
            UIA[i].description, UIA[i].author, UIA[i].reacts));
        addIdea(UIA[i].idea_title, UIA[i].description, UIA[i].reacts.upvote, UIA[i].reacts.love, UIA[i].reacts.wow);

    }

};

$(document).ready(main);

function main(){

    $('#suggest-button').on('click',function(){
        var myIdeaName = $("textarea#Title").val();
        var myDescription = $("textarea#Description").val();
        if(myIdeaName.length > 0 && myDescription.length > 0) {
            var packet = JSON.stringify(new new_idea('Default Session','1234',myIdeaName,'4321',myDescription,
                'NEW CHALLENGER'));
            ws.send(packet);
            console.log(packet);
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

