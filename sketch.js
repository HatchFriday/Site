/*
 *  The project has some lines of code which deals with the canvas settings.
 *  You can continue writing your code, and assume these are just normal functions for now!
 *
 * TIP: for best results on any screen, I suggest using the variables 'width' & 'height' when
 * refering the the canvas dimensions. For example, 20pixels from the right is: "width - 20"
 */


// Global variables
var cx;
var ts = 40;
var cols = 30;
var rows = 12;

var field = [];
var keysPressed = [];
var players = [];

var gtile, btile, atile, barrier_tile;

function preload() {
    gtile = loadImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/154887/Routetut.png");
    btile = loadImage("https://vignette.wikia.nocookie.net/moom/images/9/90/Hat_10.png/revision/latest?cb=20171206230957");
    atile = loadImage("https://i.imgur.com/cglfIah.png");
    barrier_tile = loadImage("http://xmoto.tuxfamily.org/sprites/Textures/Textures/MetalTile_bw_880.png");

}

function setup() {
    // make the canvas 400 x 400 large
    canvas_element = createCanvas(ts * cols, ts * rows + 80); /* ONLY CHANGE THIS LINE TO CHANGE CANVAS DIMENSIONS */
    textAlign(CENTER, CENTER);
    // HTML Styling canvas
    cx = (windowWidth - width) / 2;
    canvas_element.style('display', 'block');
    canvas_element.style('border','1px solid #000000');
    canvas_element.parent('canvas-place-holder');
    canvas_element.style('margin-left', cx + "px");
    initialize_field();
    players.push(new Player(3, 6, 0, "P1", 0, 20));
    players.push(new Player(28, 6, 180, "P2", 0, 20));
}

function windowResized() {
    // when the window resizes, adjust the canvas position
    cx = (windowWidth - width) / 2;
    canvas_element.style('margin-left', cx + "px");
}



function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function rotate_point(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function Tile(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.appear = function(bg) {
        var x = ts * this.x;
        var y = ts * this.y;
        if (bg) {
            image(gtile, x, y, ts, ts);
        }
        switch (this.type) {
            case "bush":
                image(btile, x - ts / 4, y - ts / 4, ts * 1.5, ts * 1.5);
                break;
            case "barrier":
                image(barrier_tile, x, y, ts, ts);
                break;
            case "ammo":
                image(gtile, x, y, ts, ts);
                image(atile, x, y, ts, ts);
                break;
            default:
                image(gtile, x, y, ts, ts);
                break;
        }
        //fill(0);
        //textSize(12);
        //text("" + this.x + "," + this.y + "", x, y + 20);
    };
}

function Bullet(x, y, angle, speed, owner, index, color) {
    this.first_x = x;
    this.first_y = y;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.owner = owner;
    this.index = index;
    this.c = color;

    this.appear = function() {
        fill(this.c);
        stroke(this.c);
        ellipse(this.x, this.y, ts/5, ts/5);
    };

    this.update = function(index) {
        // bullet out of bounds
        if (this.x < 0 || this.x > ts * cols || this.y < 0 || this.y > ts * rows) {
            this.owner.bullets.splice(index, 1);
            return;
        }
        // bullet collision
        for (var i = 0; i < players.length; i++) {
            if (players[i] === this.owner) {
                continue;
            }
            // bullet hit a player checks
            var px = players[i].x;
            var py = players[i].y;
            if (dist(this.x, this.y, px, py) < (ts / 5 + ts / 2)) {
                // shot
                players[i].hp -= 20;
                this.owner.bullets.splice(index, 1);
                return;
            }
            // bullet hit a wall checks
            var w = ts / 5;
            var l = 1;
            for (var  i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    var t = field[i][j];
                    if (t.type !== "barrier") {
                        continue;
                    }

                    if (this.x + w > t.x * ts + l && this.x - w + l < t.x * ts + ts && this.y + w > t.y * ts + l && this.y - w + l < t.y * ts + ts) {
                        this.owner.bullets.splice(index, 1);
                        console.log("passing a barrier!");
                    }
                }
            }

        }

        // new position
        var newpnt = rotate_point(this.x, this.y, this.x + this.speed, this.y, this.angle);
        this.x = newpnt[0];
        this.y = newpnt[1];
    };
}

function Player(x, y, angle, type, ammo, ammo_max) {
    this.c = x;
    this.r = y;
    this.x = this.c * ts;
    this.y = this.r * ts;
    this.angle = angle;
    this.type = type;
    this.color = color(0, 155, 255);
    this.color1 = color(255, 55, 200);
    this.speed = 2;
    this.ammo = ammo;
    this.ammo_max = ammo_max;
    this.cooldown = 10;
    this.bullet_speed = 10;
    this.bullets = [];
    this.hp = 100;

    this.appear = function() {
        noStroke();
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].appear();
        }
        switch (this.type) {
            case "P1":
                fill(this.color);
                break;
            case "P2":
                fill(this.color1);
                break;
        }

        stroke(0);
        strokeWeight(3);
        var x = this.x - ts / 2;
        var y = this.y - ts / 2;
        var newpnt = rotate_point(x, y, x + 30, y, this.angle);
        line(x, y, newpnt[0], newpnt[1]);
        ellipse(x, y, ts, ts);
        fill(255);
        textSize(12);
        text(this.ammo, x, y);
    };

    this.collision = function(dx, dy) {
        //console.log("running collisions");
        var ret = false;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                // check player position
                var t = field[i][j];
                if (t.type === "ground") {
                    continue;
                }
                var w = ts / 2;
                var x = dx - w;
                var y = dy - w;
                var l = 4;

                if (x + w > t.x * ts + l && x - w + l < t.x * ts + ts && y + w > t.y * ts + l && y - w + l < t.y * ts + ts) {
                    // if collision was with ammo, do ammo stuff
                    if (field[i][j].type === "ammo") {
                        this.ammo += 5;
                        field[i][j].type = "ground";
                        continue;
                    }
                    if (field[i][j].type === "bush") {
                        continue;
                    }
                    // barrier
                    /*
                    if ((x < t.x * ts + l) {
                        // right impact
                    } else if ()*/
                    ret = true;
                }
            }
        }
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(i);
        }
        this.cooldown = clamp(this.cooldown - 1, 0, 10);
        return ret;
    };

    this.update = function() {
        var nx = this.x;
        var ny = this.y;
        if(this.type === "P2"){
            if (keysPressed[37]) { // left
                this.angle += this.speed * 1.5;
            }
            if (keysPressed[39]) { // right
                this.angle -= this.speed * 1.5;
            }
            if (keysPressed[38]) { // up
                var x = this.x;
                var y = this.y;
                var newpnt = rotate_point(this.x, this.y, x + this.speed, y, this.angle);
                nx = newpnt[0];
                ny = newpnt[1];
            }
            if (keysPressed[40]) { // down
                var x = this.x;
                var y = this.y;
                var newpnt = rotate_point(this.x, this.y, x - this.speed, y, this.angle);
                nx = newpnt[0];
                ny = newpnt[1];
            }
            if (keysPressed[32] && this.cooldown < 1 && this.ammo > 0) { // right shift
                this.bullets.push(new Bullet(this.x - ts / 2, this.y - ts / 2, this.angle, this.bullet_speed, this, this.bullets.length + 1, this.color1));
                this.cooldown = 10;
                this.ammo--;
            }
        } else if(this.type === "P1"){
            if (keysPressed[65]) { // left a
                this.angle += this.speed * 1.5;
            }
            if (keysPressed[68]) { // right d
                this.angle -= this.speed * 1.5;
            }
            if (keysPressed[87]) { // up w
                var x = this.x;
                var y = this.y;
                var newpnt = rotate_point(this.x, this.y, x + this.speed, y, this.angle);
                nx = newpnt[0];
                ny = newpnt[1];
            }
            if (keysPressed[83]) { // down s
                var x = this.x;
                var y = this.y;
                var newpnt = rotate_point(this.x, this.y, x - this.speed, y, this.angle);
                nx = newpnt[0];
                ny = newpnt[1];
            }
            if (keysPressed[69] && this.cooldown < 1 && this.ammo > 0) { // e
                this.bullets.push(new Bullet(this.x - ts / 2, this.y - ts / 2, this.angle, this.bullet_speed, this, this.bullets.length + 1, this.color));
                this.cooldown = 10;
                this.ammo--;
            }
        }
        var attributes = this.collision(nx, ny);
        if (attributes) {
            // check direction of collision

            console.log("collision");
            return false;
        } else {
            this.x = nx;
            this.y = ny;
        }


        this.x = clamp(this.x, ts, ts * cols);
        this.y = clamp(this.y, ts, ts * rows);
        return true;
    };


}
function initialize_field() {
     for (var i = 0; i < cols; i++) {
        var r = [];
        for (var  j = 0; j < rows; j++) {
            r.push(new Tile(i, j, "ground"));
        }
        field.push(r);
    }
    field[0][0].type = 'bush';
    field[0][1].type = 'bush';
    field[0][2].type = 'ammo';
    field[0][3].type = 'ground';
    field[0][4].type = 'ground';
    field[0][5].type = 'ground';
    field[0][6].type = 'ground';
    field[0][7].type = 'ground';
    field[0][8].type = 'ground';
    field[0][9].type = 'ammo';
    field[0][10].type = 'bush';
    field[0][11].type = 'bush';
    field[1][0].type = 'bush';
    field[1][1].type = 'bush';
    field[1][2].type = 'ammo';
    field[1][3].type = 'ground';
    field[1][4].type = 'ground';
    field[1][5].type = 'ground';
    field[1][6].type = 'ground';
    field[1][7].type = 'ground';
    field[1][8].type = 'ground';
    field[1][9].type = 'ammo';
    field[1][10].type = 'bush';
    field[1][11].type = 'bush';
    field[2][0].type = 'barrier';
    field[2][1].type = 'barrier';
    field[2][2].type = 'barrier';
    field[2][3].type = 'barrier';
    field[2][4].type = 'barrier';
    field[2][5].type = 'ground';
    field[2][6].type = 'ground';
    field[2][7].type = 'barrier';
    field[2][8].type = 'barrier';
    field[2][9].type = 'barrier';
    field[2][10].type = 'barrier';
    field[2][11].type = 'barrier';
    field[3][0].type = 'ammo';
    field[3][1].type = 'ground';
    field[3][2].type = 'ground';
    field[3][3].type = 'ground';
    field[3][4].type = 'ground';
    field[3][5].type = 'ground';
    field[3][6].type = 'ground';
    field[3][7].type = 'ground';
    field[3][8].type = 'ground';
    field[3][9].type = 'ground';
    field[3][10].type = 'ground';
    field[3][11].type = 'ammo';
    field[4][0].type = 'ammo';
    field[4][1].type = 'ground';
    field[4][2].type = 'ground';
    field[4][3].type = 'ground';
    field[4][4].type = 'ground';
    field[4][5].type = 'ground';
    field[4][6].type = 'ground';
    field[4][7].type = 'ground';
    field[4][8].type = 'ground';
    field[4][9].type = 'ground';
    field[4][10].type = 'ground';
    field[4][11].type = 'bush';
    field[5][0].type = 'ground';
    field[5][1].type = 'ground';
    field[5][2].type = 'ground';
    field[5][3].type = 'ground';
    field[5][4].type = 'ground';
    field[5][5].type = 'ground';
    field[5][6].type = 'ground';
    field[5][7].type = 'ground';
    field[5][8].type = 'ground';
    field[5][9].type = 'ground';
    field[5][10].type = 'ammo';
    field[5][11].type = 'barrier';
    field[6][0].type = 'bush';
    field[6][1].type = 'ground';
    field[6][2].type = 'ground';
    field[6][3].type = 'ground';
    field[6][4].type = 'ground';
    field[6][5].type = 'ground';
    field[6][6].type = 'ground';
    field[6][7].type = 'ground';
    field[6][8].type = 'ground';
    field[6][9].type = 'barrier';
    field[6][10].type = 'barrier';
    field[6][11].type = 'barrier';
    field[7][0].type = 'barrier';
    field[7][1].type = 'ground';
    field[7][2].type = 'ground';
    field[7][3].type = 'ground';
    field[7][4].type = 'ground';
    field[7][5].type = 'barrier';
    field[7][6].type = 'ground';
    field[7][7].type = 'ground';
    field[7][8].type = 'ground';
    field[7][9].type = 'ground';
    field[7][10].type = 'ground';
    field[7][11].type = 'barrier';
    field[8][0].type = 'barrier';
    field[8][1].type = 'barrier';
    field[8][2].type = 'barrier';
    field[8][3].type = 'ground';
    field[8][4].type = 'ground';
    field[8][5].type = 'barrier';
    field[8][6].type = 'ground';
    field[8][7].type = 'ground';
    field[8][8].type = 'ground';
    field[8][9].type = 'ground';
    field[8][10].type = 'ground';
    field[8][11].type = 'ground';
    field[9][0].type = 'bush';
    field[9][1].type = 'ground';
    field[9][2].type = 'ground';
    field[9][3].type = 'ground';
    field[9][4].type = 'ground';
    field[9][5].type = 'ground';
    field[9][6].type = 'ground';
    field[9][7].type = 'ground';
    field[9][8].type = 'ground';
    field[9][9].type = 'ground';
    field[9][10].type = 'ground';
    field[9][11].type = 'ground';
    field[10][0].type = 'ground';
    field[10][1].type = 'ground';
    field[10][2].type = 'ground';
    field[10][3].type = 'ground';
    field[10][4].type = 'ground';
    field[10][5].type = 'ground';
    field[10][6].type = 'ground';
    field[10][7].type = 'ground';
    field[10][8].type = 'ground';
    field[10][9].type = 'ground';
    field[10][10].type = 'ground';
    field[10][11].type = 'ground';
    field[11][0].type = 'ground';
    field[11][1].type = 'ground';
    field[11][2].type = 'ground';
    field[11][3].type = 'ground';
    field[11][4].type = 'ground';
    field[11][5].type = 'ground';
    field[11][6].type = 'ground';
    field[11][7].type = 'ground';
    field[11][8].type = 'ground';
    field[11][9].type = 'ground';
    field[11][10].type = 'ground';
    field[11][11].type = 'ground';
    field[12][0].type = 'ground';
    field[12][1].type = 'ground';
    field[12][2].type = 'ground';
    field[12][3].type = 'ammo';
    field[12][4].type = 'barrier';
    field[12][5].type = 'ground';
    field[12][6].type = 'ground';
    field[12][7].type = 'ground';
    field[12][8].type = 'ground';
    field[12][9].type = 'ground';
    field[12][10].type = 'barrier';
    field[12][11].type = 'ammo';
    field[13][0].type = 'ground';
    field[13][1].type = 'ground';
    field[13][2].type = 'barrier';
    field[13][3].type = 'ammo';
    field[13][4].type = 'barrier';
    field[13][5].type = 'ground';
    field[13][6].type = 'barrier';
    field[13][7].type = 'ground';
    field[13][8].type = 'ground';
    field[13][9].type = 'barrier';
    field[13][10].type = 'barrier';
    field[13][11].type = 'barrier';
    field[14][0].type = 'ground';
    field[14][1].type = 'ground';
    field[14][2].type = 'barrier';
    field[14][3].type = 'barrier';
    field[14][4].type = 'barrier';
    field[14][5].type = 'barrier';
    field[14][6].type = 'barrier';
    field[14][7].type = 'ground';
    field[14][8].type = 'ground';
    field[14][9].type = 'ground';
    field[14][10].type = 'barrier';
    field[14][11].type = 'ammo';
    field[15][0].type = 'ground';
    field[15][1].type = 'ground';
    field[15][2].type = 'barrier';
    field[15][3].type = 'ammo';
    field[15][4].type = 'ammo';
    field[15][5].type = 'ground';
    field[15][6].type = 'barrier';
    field[15][7].type = 'ground';
    field[15][8].type = 'ground';
    field[15][9].type = 'ground';
    field[15][10].type = 'ground';
    field[15][11].type = 'ground';
    field[16][0].type = 'ground';
    field[16][1].type = 'ground';
    field[16][2].type = 'bush';
    field[16][3].type = 'ground';
    field[16][4].type = 'ground';
    field[16][5].type = 'ground';
    field[16][6].type = 'ground';
    field[16][7].type = 'ground';
    field[16][8].type = 'ground';
    field[16][9].type = 'ground';
    field[16][10].type = 'ground';
    field[16][11].type = 'ground';
    field[17][0].type = 'ground';
    field[17][1].type = 'ground';
    field[17][2].type = 'ground';
    field[17][3].type = 'ground';
    field[17][4].type = 'ground';
    field[17][5].type = 'ground';
    field[17][6].type = 'ground';
    field[17][7].type = 'ground';
    field[17][8].type = 'ground';
    field[17][9].type = 'ground';
    field[17][10].type = 'ground';
    field[17][11].type = 'ground';
    field[18][0].type = 'ground';
    field[18][1].type = 'ground';
    field[18][2].type = 'ground';
    field[18][3].type = 'ground';
    field[18][4].type = 'ground';
    field[18][5].type = 'ground';
    field[18][6].type = 'ground';
    field[18][7].type = 'ground';
    field[18][8].type = 'ground';
    field[18][9].type = 'ground';
    field[18][10].type = 'ground';
    field[18][11].type = 'ground';
    field[19][0].type = 'ground';
    field[19][1].type = 'ground';
    field[19][2].type = 'ground';
    field[19][3].type = 'ground';
    field[19][4].type = 'ground';
    field[19][5].type = 'barrier';
    field[19][6].type = 'ground';
    field[19][7].type = 'ground';
    field[19][8].type = 'ground';
    field[19][9].type = 'ground';
    field[19][10].type = 'ground';
    field[19][11].type = 'bush';
    field[20][0].type = 'ground';
    field[20][1].type = 'ground';
    field[20][2].type = 'ground';
    field[20][3].type = 'ground';
    field[20][4].type = 'ground';
    field[20][5].type = 'barrier';
    field[20][6].type = 'ground';
    field[20][7].type = 'ground';
    field[20][8].type = 'ground';
    field[20][9].type = 'barrier';
    field[20][10].type = 'barrier';
    field[20][11].type = 'barrier';
    field[21][0].type = 'barrier';
    field[21][1].type = 'ground';
    field[21][2].type = 'ground';
    field[21][3].type = 'ground';
    field[21][4].type = 'ground';
    field[21][5].type = 'ground';
    field[21][6].type = 'ground';
    field[21][7].type = 'ground';
    field[21][8].type = 'ground';
    field[21][9].type = 'ground';
    field[21][10].type = 'ground';
    field[21][11].type = 'barrier';
    field[22][0].type = 'barrier';
    field[22][1].type = 'barrier';
    field[22][2].type = 'barrier';
    field[22][3].type = 'ground';
    field[22][4].type = 'ground';
    field[22][5].type = 'ground';
    field[22][6].type = 'ground';
    field[22][7].type = 'ground';
    field[22][8].type = 'ground';
    field[22][9].type = 'ground';
    field[22][10].type = 'ground';
    field[22][11].type = 'bush';
    field[23][0].type = 'barrier';
    field[23][1].type = 'ground';
    field[23][2].type = 'ground';
    field[23][3].type = 'ground';
    field[23][4].type = 'ground';
    field[23][5].type = 'ground';
    field[23][6].type = 'ground';
    field[23][7].type = 'ground';
    field[23][8].type = 'ground';
    field[23][9].type = 'ground';
    field[23][10].type = 'ground';
    field[23][11].type = 'ground';
    field[24][0].type = 'bush';
    field[24][1].type = 'ground';
    field[24][2].type = 'ground';
    field[24][3].type = 'ground';
    field[24][4].type = 'ground';
    field[24][5].type = 'ground';
    field[24][6].type = 'ground';
    field[24][7].type = 'ground';
    field[24][8].type = 'ground';
    field[24][9].type = 'ground';
    field[24][10].type = 'ground';
    field[24][11].type = 'ground';
    field[25][0].type = 'ammo';
    field[25][1].type = 'ground';
    field[25][2].type = 'ground';
    field[25][3].type = 'ground';
    field[25][4].type = 'ground';
    field[25][5].type = 'ground';
    field[25][6].type = 'ground';
    field[25][7].type = 'ground';
    field[25][8].type = 'ground';
    field[25][9].type = 'ground';
    field[25][10].type = 'ground';
    field[25][11].type = 'ammo';
    field[26][0].type = 'ammo';
    field[26][1].type = 'ground';
    field[26][2].type = 'ground';
    field[26][3].type = 'ground';
    field[26][4].type = 'ground';
    field[26][5].type = 'ground';
    field[26][6].type = 'ground';
    field[26][7].type = 'ground';
    field[26][8].type = 'ground';
    field[26][9].type = 'ground';
    field[26][10].type = 'ground';
    field[26][11].type = 'ammo';
    field[27][0].type = 'barrier';
    field[27][1].type = 'barrier';
    field[27][2].type = 'barrier';
    field[27][3].type = 'barrier';
    field[27][4].type = 'barrier';
    field[27][5].type = 'ground';
    field[27][6].type = 'ground';
    field[27][7].type = 'barrier';
    field[27][8].type = 'barrier';
    field[27][9].type = 'barrier';
    field[27][10].type = 'barrier';
    field[27][11].type = 'barrier';
    field[28][0].type = 'bush';
    field[28][1].type = 'bush';
    field[28][2].type = 'ammo';
    field[28][3].type = 'ground';
    field[28][4].type = 'ground';
    field[28][5].type = 'ground';
    field[28][6].type = 'ground';
    field[28][7].type = 'ground';
    field[28][8].type = 'ground';
    field[28][9].type = 'ammo';
    field[28][10].type = 'bush';
    field[28][11].type = 'bush';
    field[29][0].type = 'bush';
    field[29][1].type = 'bush';
    field[29][2].type = 'ammo';
    field[29][3].type = 'ground';
    field[29][4].type = 'ground';
    field[29][5].type = 'ground';
    field[29][6].type = 'ground';
    field[29][7].type = 'ground';
    field[29][8].type = 'ground';
    field[29][9].type = 'ammo';
    field[29][10].type = 'bush';
    field[29][11].type = 'bush';



}



var draw = function() {
  // update world
    for (var i = 0; i < players.length; i++) {
        players[i].update();
    }
    var upper_layer = [];
    var lower_layer = [];
    // render world
    background(0);
    for (var i = 0; i < cols; i ++) {
      for (var j = 0; j < rows; j++) {
          //console.log(field[i][j]);
          if (field[i][j].type === "bush") {
              upper_layer.push(field[i][j]);
              field[i][j].appear(true);
          } else {
              field[i][j].appear(false);
          }

      }
    }
    for (var i = 0; i < players.length; i++) {
        players[i].appear();
    }
    for (var i = 0; i < upper_layer.length; i++) {
        upper_layer[i].appear();
    }
    // draw hp
    for (var  i = 0; i < players.length; i++) {
        fill(255);
        textSize(20);
        text("HP:", ts + (i * (cols - 6) * ts), ts * (rows + 1));
        fill(150);
        rect(ts * 2+ (i * (cols - 6) * ts), ts * rows + ts / 2 + 4, 100, 20);
        fill(map(players[i].hp, 0, 100, 255, 0), map(players[i].hp, 0, 100, 0, 255), 0);
        rect(ts * 2+ (i * (cols - 6) * ts), ts * rows + ts / 2 + 4, players[i].hp, 20);
        if (players[i].hp <= 0) {
            textSize(50);
            fill(0);
            text("Player " + (i + 1) + " wins!", width/2, height / 2);
            noLoop();
            continue;
        }
    }


};



var keyPressed = function() {
    keysPressed[keyCode] = true;
};

var keyReleased = function() {
    keysPressed[keyCode] = false;
};
