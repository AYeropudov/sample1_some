var socket = io();
socket.on('message', function(data) {
    console.log(data);
});
//###################################################
var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});
socket.emit('new player');
setInterval(function() {
    socket.emit('movement', movement);
}, 1000 / 60);

/**
 * Return the location of the element (x,y) being relative to the document.
 *
 * @param {Element} obj Element to be located
 */
function getElementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
/**
 * return the location of the click (or another mouse event) relative to the given element (to increase accuracy).
 * @param {DOM Object} element A dom element (button,canvas,input etc)
 * @param {DOM Event} event An event generate by an event listener.
 */
function getEventLocation(element,event){
    // Relies on the getElementPosition function.
    var pos = getElementPosition(element);

    return {
        x: (event.pageX - pos.x),
        y: (event.pageY - pos.y)
    };
}
function init2DFloor() {
    var canvas = document.getElementById('canvas');
    canvas.width = 800;
    canvas.height = 600;
    var context = canvas.getContext('2d');
    socket.on('state', function(players) {
        context.clearRect(0, 0, 800, 600);
        context.fillStyle = 'green';
        for (var id in players) {
            var player = players[id];
            context.beginPath();
            context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    });

    canvas.addEventListener("click",function(event){
        // Get the coordinates of the click
        var eventLocation = getEventLocation(this,event);
        // Get the data of the pixel according to the location generate by the getEventLocation function
        var context = this.getContext('2d');
        var pixelData = context.getImageData(eventLocation.x, eventLocation.y, 1, 1).data;

        // If transparency on the pixel , array = [0,0,0,0]
        if((pixelData[0] == 0) && (pixelData[1] == 0) && (pixelData[2] == 0) && (pixelData[3] == 0)){
            socket.emit('moveclick', eventLocation);
        }

        // Convert it to HEX if you want using the rgbToHex method.
        // var hex = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
    },false);
}

function setAction(e) {
    var attackType = e.id;
    socket.emit('battleAction', {type: attackType});
}
