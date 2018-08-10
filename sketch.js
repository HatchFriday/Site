/*
 *  The project has some lines of code which deals with the canvas settings.
 *  You can continue writing your code, and assume these are just normal functions for now!
 *
 * TIP: for best results on any screen, I suggest using the variables 'width' & 'height' when
 * refering the the canvas dimensions. For example, 20pixels from the right is: "width - 20"
 */


// Global variables
var cx;

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}


function setup() {
    // make the canvas 400 x 400 large
    canvas_element = createCanvas(400, 400); /* ONLY CHANGE THIS LINE TO CHANGE CANVAS DIMENSIONS */

    // HTML Styling canvas
    canvas_element.parent('canvas-place-holder');
    canvas_element.style('display', 'block');
    canvas_element.style('border','1px solid #000000');

    let x = getOffset( document.getElementById('canvas-place-holder') ).left;
    let y = getOffset( document.getElementById('canvas-place-holder') ).top;
    let element = document.getElementById('canvas-place-holder');
    let positionInfo = element.getBoundingClientRect();
    let w = positionInfo.left;
    cx = w - width / 2;
    canvas_element.position(cx + x, y);

}

function windowResized() {
    let x = getOffset( document.getElementById('canvas-place-holder') ).left;
    let y = getOffset( document.getElementById('canvas-place-holder') ).top;
    var element = document.getElementById('canvas-place-holder');
    var positionInfo = element.getBoundingClientRect();
    var w = positionInfo.left;
    console.log(w);
    cx = x + (w - width / 2);
    canvas_element.position(cx, y);
}

function draw() {
    fill(random(0, 255),random(0, 255),random(0, 255));
    ellipse(mouseX, mouseY, 80, 80);
}
