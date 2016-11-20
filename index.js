  var server = require('http').createServer()
  , url = require('url')
  , path = require('path')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 8080;

  var collectionName = 'veil'
  var collection;
  //let heroku give us the mLab MongoDB uri
  var mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/veil';

  //variable to hold database
  var db;

  app.use(express.static(path.join(__dirname, '')));
  //////////////////////////////
  // web socket message handling
  //////////////////////////////

  wss.on('connection', function connection(ws) {
    var location = url.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    ws.send('Connected to the server');
    ws.on('message', function incoming(message) {

      var data = JSON.parse(message);

      if(!(data == null))
      {
        if(data.hasOwnProperty('action'))
        {
          console.log('1');
          var debug = interactIdea(db,data);

          if(debug == null)
          {
            var response = {
              type : 'interact-idea',
              success : false,
              object : null
            }
            ws.send(JSON.stringify(response));
          }
          else

          {
            var response = {
              type : 'interact-idea',
              success : true,
              object : debug
            }
            ws.send(JSON.stringify(response));

          }
        }
        else if(data.hasOwnProperty('author'))
        {
          console.log('2');
          ws.send('You sent me an idea');

          var debug = submitIdea(db, data);

          if(debug == null)
          {
            var response = {
              type : 'submit-idea',
              success : false,
              object : null
            }
            ws.send(JSON.stringify(response));
          }
          else
          {
            var response = {
              type : 'submit-idea',
              success : true,
              object : debug
            }
            ws.send(JSON.stringify(response));
          }

        }
        else if(data.hasOwnProperty('create_session'))
        {
          if(data.create_session)
          {
            console.log('3');
            var debug = createSession(db, data.session_title, data.session_id);

            var response = {
              type : 'create-session',
              success : true,
              object : debug
            }
            ws.send(JSON.stringify(response));

          }
          else
          {
            console.log('4');
            var debug2 = getSession(db, data);
            if(debug2 == null)
            {
              var response = {
                type : 'find-session',
                success : false,
                object : null,
              }

              ws.send(JSON.stringify(response));
            }
            else
            {
              var response = {
                type : 'find-session',
                success : true,
                object : debug
              }

              ws.send(JSON.stringify(response));
            }
          }
        }
        else
        {
          ws.send('Invalid request');
        }
      }
    });

  });

  //////////////////////
  // HTTP Routing
  //////////////////////

  app.get('/*', function(req, res){
    res.sendFile((path.join(__dirname + '/index.html')));
  });

  server.on('request', app);

  /////////////////////////
  //  mongo functions
  //////////////////////////

  //Ensures that you are still connected to database.
  function checkConnected(db)
  {
    if((db == null))
    {
      MongoClient.connect(mongoURL, function(err, database){
        if(err)
        {
          console.log(err);
          process.exit(1);
        }

        db = database;
        console.log("Database %s connection ready", db);
        collection = db.collection(collectionName);

      });
    }

    return true;
  }
  //Create a session if one does not already exist, returns session always
  function createSession(db, sessTitle, sessId)
  {
    if(checkConnected(db))
    {

      collection.findOne({ session_title : sessTitle, session_id : sessId }, function(err, doc){

        //none found
        if(doc == null)
        {
          console.log('session not found, creating');
          var sessionObj = {
            session_id : sessId,
            session_title : sessTitle,
            num_ideas : 3,
            top_ideas : [],
            ideas : []
          }
          collection.insertOne(sessionObj);
          return sessionObj;
        }
        else
        {
          return doc;
        }
      });   
    }
  }
  //Get a session by id, returns session or null
  function getSession(db, anObj, callbackfcn)
  {
    if(checkConnected(db))
    {
      var search = collection.findOne({session_id: anObj.session_id, session_title : anObj.session_title}, callbackfcn);
    }
  }

  //submit idea to session, returns session or null
  function submitIdea(db, ideaObj)
  {
    if(checkConnected(db))
    {
      var search = getSession(db,ideaObj, function(err, doc){

        if(doc == null)
        {
          return null;
        }

        var modIdeas = doc.ideas;
        var exists = false;
        if(modIdeas == null)
        {
          modIdeas = [];
        }
        else
        {

          modIdeas.forEach(function(item, index){
            if(item.idea_title == ideaObj.idea_title && item.idea_id == ideaObj.idea_id)
            {
              exists = true;
            }
          });
        }

        if(exists)
        {
          return null;
        }
        else
        {
          modIdeas.push(ideaObj);
          console.log(modIdeas[0].idea_title);
          collection.updateOne({
            session_id : ideaObj.session_id, 
            session_title : ideaObj.session_title
          }, { $set : {ideas : modIdeas}}, function(err, result) {
            if(result.result.n != 1)
            {
              return null;
            }
            else
            {
              return result;
            }
          });
        }
      });
    }
  }

  function interactIdea(db, interactObj)
  {
    if(checkConnected(db))
    {
      collection.findOne({session_id : interactObj.session_id, session_title : interactObj.session_title}, function(err, doc)
      {
        if(doc != null)
        {
          var modIdeas = doc.ideas;
          if(modIdeas == null)
          {
            return null;
          }

          modIdeas.forEach(function(item,index)
          {
            if(item.idea_id == interactObj.idea_id && item.idea_title == interactObj.idea_title)
            {
              if(interactObj.action == 'upvote')
              {
                modIdeas[index].reacts.upvote += 1;
              }
              else if(interactObj.action == 'love')
              {
                modIdeas[index].reacts.love += 1;
              }
              else if(interactObj.action == 'wow')
              {
                modIdeas[index].reacts.wow += 1;
              }
              else if(interactObj.action == 'comment')
              {
                var comments = modIdeas[index].comments;
                if(comments == null)
                {
                  comments = [{comment : interactObj.comment, user : interactObj.user}];
                  modIdeas[index].comments = comments;
                }
                else
                {
                  modIdeas[index].comments.push({comment : interactObj.comment, user : interactObj.user});                  
                }
              }
            }
          });
        }

        collection.updateOne({session_id: interactObj.session_id, session_title : interactObj.session_title}, {$set : {ideas : modIdeas} }, function(err, result){
          if(result.result.n != 1)
          {
            return null;
          }
          else
          {
            return result;
          }
        });

      });
    }
  }


//////////////////////////
// Connectivity  &  Setup
//////////////////////////


  //Connect to the mongodb, then set up the server to listen on the port.
  MongoClient.connect(mongoURL, function(err, database){
    if(err)
    {
      console.log(err);
      process.exit(1);
    }

    db = database;
    console.log("Database %s connection ready", db);
    collection = db.collection(collectionName);


    //reinitialize session
    db.dropDatabase();
    createSession(db,'Lady Problems Hackathon Ideation', '1234');


    server.listen(port,function(){
      console.log("App now running on port", port);
    });
  });
