/*
 Игровая логика

 TODO:
 - удар и простейший рассчет и проигрывание траектории
 - полный рассчет движения всех шаров, столкновения, попадания в лузы
 */


var balls = [];
var camera_radius = 3;
var camera_angle_vert = 10, camera_angle_horiz = 30;

var radius = 0.1; // ball radius

// game geometry
var table_x_size = 3;
var table_y_size = 2;
var piramid_start = 1.4;
var cue_start = -1.8;

function create_balls() {
    // initialize balls - assign initial positions and rotations
    // cue
    balls.push({x: cue_start, y: 1.5, x_rot: 0, y_rot: 0,
		img: 'ball0.gif'});
    // numbered balls
    var r = radius * 1.01;
    var dy = 2 * r;
    var dx = 2 * r * Math.cos( Math.PI / 6);
    var n = 1;
    for (var i = 0; i < 5; i++) {
	for(var j = 0; j <= i; j++){
	    var x = piramid_start + i*dx;
	    var y = (i/2-j) * dy;
	    balls.push({x: x, y: y,
			x_rot: Math.random() * 360,
			y_rot: Math.random() * 360,
			img: 'ball' + (parseInt(Math.random() * 15) + 1) +'.gif'});
	    n += 1;
	}
    }
}

create_balls();

var aiming = true;

function handleShoot () {
    // player pressed shoot button
    if (!aiming)
	return;
    aiming = false;
    var duration = assign_animations(balls, camera_angle_horiz, camera_angle_vert);
    setTimeout(function () { aiming = true; }, duration * 1000);
}

// test animation
/*
balls[0].animation = [
    {x: balls[0].x,
     y: balls[0].y,
     vx: 0.01, vy: 0.01,
     duration: 2
    
    },
    {x: 2,
     y: 3,
     vx: -0.01,
     vy: 0.01,
     duration: 3
    }
];*/