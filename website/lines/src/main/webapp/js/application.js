$(function() {
  "use strict";

  var detect = $("#detect");
  var header = $('#header');
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');
  var myName = false;
  var author = null;
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

  var balls = [1, 2, 3, 4, 5];

  var players = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10]
    ],
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

  function createPlayer(player) {
    var player = Physics.body('circle', {
      x: player[1].x, // x-coordinate
      y: player[1].y, // y-coordinate
      vx: 0.2, // velocity in x-direction
      vy: 0.01, // velocity in y-direction
      radius: 20
    });
    return player;
  }

  function addPlayer(colour, x, y, cplayer) {
    players[cPlayer][0] = colour;
    players[cPlayer][1] = {
      "x": x,
      "y": y,
      "currentPlayers": currentPlayers
    };
    balls[cplayer] = createPlayer(players[currentPlayer]);
    currentPlayers += 1;
    world.add(balls[cplayer]);
  }

  request.onOpen = function(response) {
    /*content.html($('<p>', {
      text: 'Atmosphere connected using ' + response.transport
    }));
    input.removeAttr('disabled').focus();
    status.text('Choose name:'); */
    author = getRandomColor();
    addPlayer(author, 50, 50, currentPlayer);

    var sendConnect = {
      author: author,
      message: players
    };

    subSocket.push(jQuery.stringifyJSON(sendConnect));

    transport = response.transport;

    if (response.transport == "local") {
      subSocket.pushLocal("Name?");
    }
  };

  request.onReconnect = function(rq, rs) {
    socket.info("Reconnecting")
  };

  request.onMessage = function(rs) {

    // We need to be logged first.
    if (!myName) return;

    var message = rs.responseBody;
    try {
      var json = jQuery.parseJSON(message);
      players = json.players;
      currentPlayers = players[currentPlayer][1].currentPlayers;
      updatePlayers();
      console.log("got a message")
      console.log(json)
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON object: ',
        message.data);
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
      addMessage(json.author, json.message, me ? 'blue' : 'black', new Date(
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

  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();

      // First message is always the author's name
      if (author == null) {
        author = msg;
      }

      var json = {
        author: author,
        message: msg
      };

      subSocket.push(jQuery.stringifyJSON(json));
      $(this).val('');


      if (myName === false) {
        myName = msg;
        logged = true;
        status.text(myName + ': ').css('color', 'blue');
        input.removeAttr('disabled').focus();
        subSocket.pushLocal(myName);
      } else {
        //        input.attr('disabled', 'disabled');
        addMessage(author, msg, 'blue', new Date);
      }
    }
  });

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
