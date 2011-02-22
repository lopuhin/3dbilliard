/*
 Игровая логика

 TODO:
 - удар и простейший рассчет и проигрывание траектории
 - полный рассчет движения всех шаров, столкновения, попадания в лузы
 */


var balls = [];

var radius = 0.1;

var table_x_size = 3;
var table_y_size = 2;
var piramid_start = 1.4;
var cue_start = -1.8;

function create_balls() {
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

// test animation

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
];