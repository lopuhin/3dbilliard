/*
 Игровая логика

 TODO:
 - начальное расположение шаров
 - биток, вращение камеры вокруг битка
 - удар и простейший рассчет и проигрывание траектории
 - полный рассчет движения всех шаров, столкновения, попадания в лузы
 */


var balls = [];

var radius = 0.1;

var table_x_size = 3;
var table_y_size = 2;
var piramid_start = 1.5;

function create_balls() {
    var r = radius * 1.02;
    var dy = 2 * r;
    var dx = 2 * r * Math.cos( 30/180 * Math.PI);
    var n = 1;
    for (var i = 0; i < 5; i++) {
	for(var j = 0; j <= i; j++){
	    balls.push({x: piramid_start + i*dx,
			y: (i/2-j) * dy,
			img: 'ball' + n+'.gif'});
	    n+=1;
	}
    }
}

create_balls();