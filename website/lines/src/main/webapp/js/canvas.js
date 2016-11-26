var canvasW, canvasH
(function() {

  var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

  var x = "black",
    y = 2;

  var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d');

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
  canvas.addEventListener("mousemove", function (e) {
      findxy('move', e)
  }, false);
  canvas.addEventListener("mousedown", function (e) {
      findxy('down', e)
  }, false);
  canvas.addEventListener("mouseup", function (e) {
      findxy('up', e)
  }, false);
  canvas.addEventListener("mouseout", function (e) {
      findxy('out', e)
  }, false);


  function drawLine() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
  }

  var mouseX,mouseY,mouseDown=0;

  function canvas_mouseDown() {
      mouseDown=1;
      drawDot(ctx,mouseX,mouseY);
  }

  function canvas_mouseUp() {
      mouseDown=0;
  }

  function canvas_mouseMove(e) {
      // Update the mouse co-ordinates when moved
      getMousePos(e);

      // Draw a pixel if the mouse button is currently being pressed
      if (mouseDown==1) {
          drawDot(ctx,mouseX,mouseY);
      }
  }

  function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            drawLine();
        }
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /**
     * Your drawings need to be inside this function otherwise they will be reset when
     * you resize the browser window and the canvas goes will be cleared.
     */
    drawStuff();
  }
  resizeCanvas();

  function drawStuff() {
          // do your drawing stuff here
  }

})();

Physics(function( world ){
  var renderer = Physics.renderer('canvas', {
   el: 'canvas', // id of the canvas element
   width: 500,
   height: 500
});
world.add( renderer );

var player = Physics.body('circle', {
    x: 50, // x-coordinate
    y: 30, // y-coordinate
    vx: 0.2, // velocity in x-direction
    vy: 0.01, // velocity in y-direction
    radius: 20
});
world.add( player );

var staticObjLine = Physics.body('rectangle', {
    x: 150, // x-coordinate
    y: 300, // y-coordinate
    width: 350,
    height: 10,
    treatment: 'static'
});
world.add(staticObjLine);

var canvas = document.getElementById('canvas');

var bounds = Physics.aabb(0, 0, canvas.width, canvas.height);

world.add( Physics.behavior('edge-collision-detection', {
    aabb: bounds,
    restitution: 0.3
}) );
// ensure objects bounce when edge collision is detected
world.add( Physics.behavior('body-impulse-response') );
world.add( Physics.behavior('constant-acceleration') );
world.add( Physics.behavior('body-collision-detection') );
world.add( Physics.behavior('sweep-prune') );

world.render();


$("canvas").click(function(e){
			     	// checking canvas coordinates for the mouse click
					var offset = $(this).offset();
					var px = e.pageX - offset.left;
     			var py = e.pageY - offset.top;
     				// this is the way physicsjs handles 2d vectors, similar at Box2D's b2Vec
					var mousePos = Physics.vector();
     				mousePos.set(px,py);
     				// finding a body under mouse position
     				var body = world.findOne({
						$at: mousePos
					})
					// there isn't any body under mouse position, going to create a new box
					if(!body){
            var staticObjLine = Physics.body('rectangle', {
                x: px, // x-coordinate
                y: py, // y-coordinate
                width: 350,
                height: 10,
                treatment: 'static'
            });
				     	world.add(staticObjLine);
					}
					else{
						// there is a body under mouse position, let's remove it
						//world.removeBody(body);
					}
      })




Physics.util.ticker.on(function( time, dt ){
    world.step( time );
});

// start the ticker
Physics.util.ticker.start();

world.on('step', function(){
    world.render();
});

});
