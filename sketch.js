/*
 *  The project has some lines of code which deals with the canvas settings.
 *  You can continue writing your code, and assume these are just normal functions for now!
 *
 * TIP: for best results on any screen, I suggest using the variables 'width' & 'height' when
 * refering the the canvas dimensions. For example, 20pixels from the right is: "width - 20"
 */


// Global variables
var cx;

function setup() {
    // make the canvas 400 x 400 large
    canvas_element = createCanvas(400, 400); /* ONLY CHANGE THIS LINE TO CHANGE CANVAS DIMENSIONS */

    // HTML Styling canvas
    cx = (windowWidth - width) / 2;
    canvas_element.style('display', 'block');
    canvas_element.style('border','1px solid #000000');
    canvas_element.parent('canvas-place-holder');
    canvas_element.style('margin-left', cx + "px");
}

function windowResized() {
    // when the window resizes, adjust the canvas position
    cx = (windowWidth - width) / 2;
    canvas_element.style('margin-left', cx + "px");
}


function draw() {
    fill(random(0, 255),random(0, 255),random(0, 255));
    ellipse(mouseX, mouseY, 80, 80);
}
