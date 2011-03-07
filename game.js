/*
 Игровая логика

 TODO:
 - удар и простейший рассчет и проигрывание траектории
 - полный рассчет движения всех шаров, столкновения, попадания в лузы
 */


var camera_center;
var camera_radius = 3;
var camera_angle_vert = 10, camera_angle_horiz = 30;

var radius = 0.1; // ball radius

// game geometry
var table_x_size = 3;
var table_y_size = 2;
var piramid_start = 1.4;
var cue_start = -1.8;
var initial_speed = 4.0;


function create_balls(cue_start, piramid_start) {
    // initialize balls - assign initial positions and rotations
    var balls = [];
    // cue
    balls.push({x: cue_start, y: 1.5, radius: radius,
		x_rot: 0, y_rot: 0,
		img: 'ball0.gif'});
    // numbered balls
    var r = radius * 1.05;
    var dy = 2 * r;
    var dx = 2 * r * Math.cos( Math.PI / 6);
    var n = 1;
    for (var i = 0; i < 5; i++) {
	for(var j = 0; j <= i; j++){
	    var x = piramid_start + i*dx;
	    var y = (i/2-j) * dy;
	    balls.push({x: x, y: y, radius: radius,
			x_rot: Math.random() * 360,
			y_rot: Math.random() * 360,
			img: 'ball' + (parseInt(Math.random() * 15) + 1) +'.gif'});
	    n += 1;
	}
    }
    return [balls[0], balls[1]];
}

function create_borders(table_x_size, table_y_size) {
    return [
	[{x: -table_x_size, y: -table_y_size},
	 {x: -table_x_size, y:  table_y_size}],
	[{x: table_x_size, y: -table_y_size},
	 {x: table_x_size, y:  table_y_size}],
	[{x: table_x_size, y: -table_y_size},
	 {x: -table_x_size, y: -table_y_size}],
	[{x: table_x_size, y: table_y_size},
	 {x: -table_x_size, y: table_y_size}]
    ];
}



var balls = create_balls(cue_start, piramid_start);

// buggy initial position
balls[0].x = -0.676121080136062;
balls[0].y = -1.286662289618628;
balls[1].x = -0.39966139683266544;
balls[1].y = 0.2460576344232599;
camera_angle_horiz = -192;

var borders = create_borders(table_x_size, table_y_size);
camera_center = {x: balls[0].x, y: balls[0].y};

var aiming = true;

function handleShoot() {
    // player pressed shoot button
    if (!aiming)
	return;
    aiming = false;
    foreach(function(ball) { ball.animation = undefined; }, balls);
    console.log('hadleShoot, camera_angle_horiz %s', camera_angle_horiz);
    var duration = assign_animations(balls, borders, camera_angle_horiz, initial_speed);
    setTimeout(
	function () {
	    aiming = true;
	    camera_center = {x: balls[0].x, y: balls[0].y};
	},
	duration * 1000);
}

// test animation
/*
balls[0].animation = [
    {x: balls[0].x,
     y: balls[0].y,
     vx: 0.01, vy: 0.01,
     duration: 1
    
    },
    {x: 2,
     y: 3,
     vx: -1,
     vy: 1,
     duration: 3
    }
];

balls[1].animation = [
    {x: balls[1].x,
     y: balls[1].y,
     vx: 0, vy: 0,
     duration: 1
    
    },
    {x: balls[1].x,
     y: balls[1].y,
     vx: -1,
     vy: 1,
     duration: 3
    }
];*/