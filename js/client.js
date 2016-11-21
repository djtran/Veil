/**
 * Created by Khai on 11/20/2016.
 */

 function setupWebSocket()
 {
    this.ws = new WebSocket('ws://ladyhacks-veil.herokuapp.com');
    this.ws.onopen = function initialize(){
        var session = {
            session_title : "Pitch Session",
            session_id : "1234",
            create_session : true,
        }

        ws.send(JSON.stringify(session));
    }
    this.ws.onmessage = function add_update(message){
        var data = JSON.parse(message.data);
        if(data.type == "ping")
        {
            // do nothing?
        }
        else {
            var updated_session = data.object;
            $("#sessionId").text(updated_session.session_id);
            $("#ideaBoard").text(updated_session.session_title);
            var UIA = updated_session.ideas;

            console.log(message);
            var i;

            for( i = 0; i < idea_array.length; i++)
            {
                idea_array[i].session_title = UIA[i].session_title;
                    idea_array[i].session_id = UIA[i].session_id;
                    idea_array[i].idea_title = UIA[i].idea_title;
                    idea_array[i].idea_idea = UIA[i].idea_id;
                    idea_array[i].description = UIA[i].description;
                    idea_array[i].author = UIA[i].author;
                    idea_array[i].reacts = UIA[i].reacts;
            }
            if (UIA.length > idea_array.length) {
                i = UIA.length - idea_array.length;
                i = UIA.length - i;
            }

            for (i; i < UIA.length; i++) {

                idea_array.push(UIA[i]);
                addIdea(UIA[i].idea_title, i, UIA[i].description, UIA[i].reacts.upvote, UIA[i].reacts.love, UIA[i].reacts.wow);
            }
        }

        updatePage();
    };
    this.ws.onclose = function(){
        setTimeout(setupWebSocket, 1000);
    };
};

setupWebSocket();

var idea_array = [];

var addIdea = function(ideaName,arrayindex, description, numLike, numSave, numWow){
    var myNewElement = "<div class='idea'><h2>" + ideaName + "</h2> <p> Description: " + description + "</p>";


    var loadReaction = "<div class='react-wrapper'> <img id='"+ arrayindex +"' class='react-images like' src='img/like.png'> <p id = 'like' class='react-counter'>" +
    numLike + "</p> <img id='"+arrayindex+"' class='react-images save' src='img/saveicon.png'> <p id = 'save' class='react-counter'>" + numSave + "</p> <img id='"+arrayindex+"' " +
    "class='react-images wow' src='img/wowface.png'> <p id = 'wow' class='react-counter'>" + numWow + "</p></div></div>";

    myNewElement = myNewElement + loadReaction;

    $(myNewElement).hide().appendTo('.ideas-wrapper').fadeIn(1000);

};

function react(arrayindex, react)
{
    var object = idea_array[parseInt(arrayindex)];

    var obj4 = {
        session_id : object.session_id,
        session_title : object.session_title,
        idea_id : object.idea_id,
        idea_title : object.idea_title,
        action : react,
        comment : null,
        user : null
    }

    ws.send(JSON.stringify(obj4));
}

function updatePage()
{
    var container = $('.ideas-wrapper');
    idea_array.forEach(function(item,index)
    {
        //get idea
        var ideaHTML = container.children().eq(index);
        ideaHTML.find('#like').text(item.reacts.upvote);
        ideaHTML.find('#save').text(item.reacts.love);
        ideaHTML.find('#wow').text(item.reacts.wow);
    });
}

function resetSession(session)
{
    var resetter = {};
    resetter.session_title = $('#ideaBoard').text();
    resetter.session_id = $('#sessionId').text();
    resetter.reset = true;

    ws.send(JSON.stringify(resetter));
}

function new_idea(title, s_id, idea_title, idea_id, description, author ){
    this.session_title = title;
    this.session_id = s_id;
    this.idea_title = idea_title;
    this.idea_id = idea_id;
    this.description = description;
    this.author = author;
    this.reacts = {upvote: 0, love: 0, wow: 0};
}

$(document).on('click','.like',function(){
    console.log('liked');
    console.log(event.target.id);
    react(event.target.id, 'upvote');
});
$(document).on('click','.save',function(){
    console.log('loved');
    react(event.target.id, 'love');
});
$(document).on('click','.wow',function(){
    console.log('wowed');
    react(event.target.id, 'wow');
});

function main(){
    $('#suggest-button').on('click',function(){
        var myIdeaName = $("textarea#Title").val();
        var myDescription = $("textarea#Description").val();
        if(myIdeaName.length > 0 && myDescription.length > 0) {
            var packet = JSON.stringify(new new_idea('Pitch Session','1234',myIdeaName,'4321',myDescription,
                'NEW CHALLENGER'));
            ws.send(packet);
            console.log(packet);
            $("textarea#Title").val('');
            $("textarea#Description").val('');
        }
    });

}

$(document).ready(main);



