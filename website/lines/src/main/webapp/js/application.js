$(function() {
  "use strict";

  var detect = $("#detect");
  var header = $('#header');
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');
  var myName = false;
  var author = null;
  var ball   = null;
  var logged = false;
  var socket = $.atmosphere;
  var subSocket;
  //  var transport = 'long-polling';
  var transport = 'websocket';

  var request = {
    url: "/lines",
    contentType: "application/json",
    logLevel: 'debug',
    transport: transport,
    fallbackTransport: 'long-polling'
  };

  var balls = [],
    cPlayer = 0,
    currentPlayers = 0,
    currentPlayer = 0,
    max_players = 5; //one client to spectate

  /*  $("#input").keypress(function(e) {
      console.log("keypress");
      if (currentPlayer < max_players) {
        addPlayer("1.1.1.1");
      }
    }); */

  function createPlayer(x1,y1,colour) {
    var player = Physics.body('circle', {
      x: x1, // x-coordinate
      y: y1, // y-coordinate
      vx: 0.2, // velocity in x-direction
      vy: 0.01, // velocity in y-direction
      radius: 20
    });

    //player.fill(colour)

    world.add(player);
    return player;

  }

  request.onOpen = function(response) {
    /*content.html($('<p>', {
      text: 'Atmosphere connected using ' + response.transport
    }));
    input.removeAttr('disabled').focus();
    status.text('Choose name:'); */
    author = getRandomColor();
    ball = createPlayer(50,50,author);

    balls.push({"obj" : ball, "colour" : author});

      var xpos = ball.state.pos.x;
      var ypos = ball.state.pos.y;

    var sendConnect = {
      "author": author,
      "message": xpos + " " + ypos
    };
    subSocket.push(jQuery.stringifyJSON(sendConnect));
  };


var refresh = function(){

    if (ball != null) {
        var xpos = ball.state.pos.x; 
        var ypos = ball.state.pos.y;

      var sendConnect = {
        "author": author,
        "message": xpos + " " + ypos
      };


      subSocket.push(jQuery.stringifyJSON(sendConnect));

    }
};

setInterval(refresh,100);


  request.onReconnect = function(rq, rs) {
    socket.info("Reconnecting")
  };

  request.onMessage = function(rs) {

    var message = rs.responseBody;
    try {
      var json = jQuery.parseJSON(message);
      var colour = json.author;

      var posString = json.message;
      var positions = posString.split(" ");

      var newX = positions[0];
      var newY = positions[1];

      var exists = false;

      balls.forEach(function(bball){
        if (bball.colour == colour) {

          exists = true;
          bball.obj.state.pos.x = newX;
          bball.obj.state.pos.y = newY;
          bball.obj.state.vx = 0;
          bball.obj.state.vy = 0;
          console.log(bball.obj.state.vy);

        }
      });

      if (!exists) {
        var ball = createPlayer(newX,newY,author);

        balls.push({"obj" : ball, "colour" : colour});
      }

    } catch (e) {
      console.log('This doesn\'t look like a valid JSON object: ',
        message);
      return;
    }

    if (!logged) {
      logged = true;
      status.text(myName + ': ').css('color', 'blue');
      input.removeAttr('disabled').focus();
      subSocket.pushLocal(myName);
    } else {
      input.removeAttr('disabled');
      var me = json.author == author;
      var date = typeof(json.time) == 'string' ? parseInt(json.time) :
        json.time;
      addMessage(json.author, json.xPos, me ? 'blue' : 'black', new Date(
        date));
    }
  };

  request.onClose = function(rs) {
    logged = false;
  };

  request.onError = function(rs) {
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your ' +
        'socket or the server is down'
    }));
  };

  subSocket = socket.subscribe(request);

  function updatePlayers() {
    balls.forEach(function(element, i) {
      if (element == null && players[i] != null) {
        balls[i] = createPlayer(players[i]);
      }
    })
  }

  function getRandomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }

  function addMessage(author, message, color, datetime) {
    content.append(
      '<p><span style="color:' + color + '">' + author + '</span> @ ' + +
      (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) +
      ':' + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() :
        datetime.getMinutes()) + ': ' + message + '</p>');
  }
});
