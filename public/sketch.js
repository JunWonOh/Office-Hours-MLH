var socket;
let previousState;

function setup() {
    createCanvas(1200, 800);
    background(51);
    console.log('hello....')
    socket = io.connect('http://localhost:3001');
    socket.on('mouse', function(data) {
        noStroke();
        fill(255, 0, 100);
        ellipse(data.x, data.y, 5, 5)
    });
}

function keyPressed(e) {
    // check if the event parameter (e) has Z (keycode 90) and ctrl or cmnd
    if (e.keyCode == 90 && (e.ctrlKey || e.metaKey)) {
        undoToPreviousState();
    }
}

function undoToPreviousState() {
    // if previousState doesn't exist ie is null
    // return without doing anything
    if (!previousState) {
      return;
    }
    // else draw the background (in this case white)
    // and draw the previous state
    background(255);
    image(previousState, 0, 0);
    // then set previous state to null
    previousState = null;
}

function mouseDragged() {
    console.log(mouseX + ',' + mouseY);
    var data = {
        x: mouseX,
        y: mouseY
    }
    socket.emit('mouse', data);
    noStroke();
    fill(255);
    ellipse(mouseX, mouseY, 5, 5);
    // frameRate(120);
}

function mousePressed() {
    // the moment input is detect save the state
    saveState();
}
  
function saveState() {
    // save state by taking image of background
    // for more info look at reference for get
    previousState = get();
}