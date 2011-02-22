function covered(v0, t) {
    // distance, covered by ball, taking friction into account
    return t * v0; // TODO - slowing down
}

function time_to_cover(v0, distance) {
    // inverse of covered with v0 = const
    return distance / v0;
}


function update_position (ball) {
    // update ball position if it is moving, using ball.animation -
    // an array of animation segments
    if (!ball.animation)
	return;
    foreach(function (segment) {
		// search for current segment
		if (segment.end)
		    return 'continue';
		var now = (new Date()).getTime() / 1000;
		if (segment.start) {
		    if (now > segment.start + segment.duration) {
			segment.end = now;
			return 'continue';
		    }
		    // update ball position
		    // FIXME - only if covered is linear by v
		    var dt = now - segment.start;
		    ball.x += covered(segment.vx, dt);
		    ball.y += covered(segment.vy, dt);
		} else { // just starting the segment
		    segment.start = now;
		    ball.x = segment.x;
		    ball.y = segment.y;
		}
		return 'break';		
	    },
	   ball.animation);
}


function assign_animations(balls, borders, camera_angle_horiz, initial_speed) {
    // calculate ball animations, return total animation duration

    // assign initial speed to cue
    var cue = balls[0];
    var cue_speed = vector_from_angle(initial_speed, to_radians(camera_angle_horiz - 90));
    cue.animation = [{x: cue.x, y: cue.y,
		      vx: cue_speed.x, vy: cue_speed.y
		      //duration: 1.0
		     }];
    next_intersection(balls, borders, 0);
    return 1.0;
}


function next_intersection(balls, borders, time) {
    // find first intersection of any of moving balls, starting with @time
    // update animation segment, and call itself recurcively to find the next intersection
    var intersection, c_ball1, c_ball2, c_border;
    foreach(
	function (moving_ball) {
	    if (moving_ball.animation &&
		total_duration(moving_ball.animation) >= time) {
		foreach(function (another_ball) {
			    if (moving_ball != another_ball) {
				var x = ball_intersection(moving_ball, another_ball, time);
				if (!intersection || x.t < intersection.t) {
				    intersection = x;
				    c_ball1 = moving_ball;
				    c_ball2 = another_ball;
				}
			    }
		    }, balls);
		foreach(function (border) {
			    var x = border_intersection(moving_ball, border, time);
			    if (!intersection || x.t < intersection.t) {
				intersection = x;
				c_ball1 = moving_ball;
				c_border = border;
			    }
			}, borders);
	    }
	}, balls);
    console.log(intersection);
}

// TODO

function ball_intersection(moving_ball, another_ball, time) {
    
}

function border_intersection(moving_ball, border, time) {
    // return time delta, point and normal of intersection with border
    var segment = current_segment(moving_ball.animation, time);
    console.log('segment', segment);
    var border_vect = {x: border[1].x - border[0].x,
		       y: border[1].y - border[0].y};
    var normal1 = scale_vector({x: -border_vect.y, y: border_vect.x}, 1);
    var normal2 = mult_vector(normal1, -1);
    var line1 = [add_vectors(border[0], normal1),
		 add_vectors(border[1], normal1)];
    var line2 = [add_vectors(border[0], normal2),
		 add_vectors(border[1], normal2)];
    // TODO - edgese intersection
    var int1 = line_intersection(segment, line1);
    var int2 = line_intersection(segment, line2);
    var v_module = Math.sqrt(segment.vx * segment.vx + segment.vy * segment.vy);
    var t1 = time_to_cover(v_module, distance(segment, int1));
    var t2 = time_to_cover(v_module, distance(segment, int2));
    return find_max([{point: int1, normal: normal1, t: t1},
		     {point: int2, normal: normal2, t: t2}],
		    function (x) { return x.t; }); 
}

function line_intersection(segment, line) {
    // return intersection point of animation segment and a line
    var a = {x: segment.vx, y: segment.vy}; // direction
    var a0 = {x: segment.x, y: segment.y}; // start
    var b = {x: line[1].x - line[0].x, y: line[1].y - line[0].y};
    var b0 = {x: line[0].x, y: line[0].y};
    var solution = gauss_solve(
	[[a.x, b.x],
	 [a.y, b.y]],
	[b0.x - a0.x,
	 b0.y - a0.y]);
    if (solution[1] < 1.0 && solution[1] > 0.0) { // it lies inside line
	return add_vectors(a0, mult_vector(a, solution[0]));
    }
    return {};
}

// animation utils

function current_segment(animation, time) {
    var current, t = 0;
    foreach(function (s) {
		if (s.duration)
		    t += s.duration;
		if (t >= time) {
		    current = s;
		    return 'break';
		}
		return 'continue';
	    }, animation);
    return current;
}

function total_duration(animation) {
    var duration = 0;
    foreach(function (segment) {
		if (segment.duration)
		    duration += segment.duration;
	    }, animation);
    return duration;
}

// math utils

function gauss_solve(matrix, vector) {
    // gauss solution method
    var N = matrix.length;
    var answer = [];
    for (var i = 0; i < N; i++ ) {
	var col_ind = find_max_index(matrix[i], Math.abs);
	for (var j = i + 1; j < N; j++ ) {
	    var coef = matrix[j][col_ind] / matrix[i][col_ind];
	    for (var k = 0; k < N; k++ )
		matrix[j][k] -= coef * matrix[i][k];
	    vector[j] -= coef * vector[i];
	}
	answer.push(undefined);
    }
    console.log(matrix, vector);
    for (var i = N - 1; i >= 0; i-- ) {
	for (var j = 0; j < N; j++ ) {
	    if (Math.abs(matrix[i][j]) > 0 && answer[j] == undefined) {
		var s = 0;
		for (var k = 0; k < N && k != j; k++ ) {
		    s += matrix[i][k] * answer[k];
		}
		answer[j] = (vector[i] - s) / matrix[i][j];
	    }
	}
    }
    return answer;
}
gauss_solve.test = function () {
    console.log(gauss_solve(
		[[1, 3, 4],
		 [2, 3, 12],
		 [3, 2, 1]], [8, 17, 6]));
};

function find_max(lst, fn) {
    fn = fn || function (x) { return x; };
    var m, c;
    for (var i = 0; i < lst.length; i++ ) {
	c = fn(lst[i]);
	if (m == undefined || c > m)
	    m = c;
    }
    return m;
}

function find_max_index(lst, fn) {
    var m, c, index;
    for (var i = 0; i < lst.length; i++ ) {
	c = fn(lst[i]);
	if (m == undefined || c > m) {
	    m = c;
	    index = i;
	}
    }
    return index;
}

function scale_vector(v, new_norm) {
    var coef = new_norm / Math.sqrt(v.x*v.x + v.y*v.y);
    return mult_vector(v, coef);
}

function mult_vector(v, coef) {
    return {x: v.x * coef, y: v.y * coef};
}

function vector_from_angle(module, angle) {
    return {x: module * Math.cos(angle),
	    y: module * Math.sin(angle)};
}

function add_vectors(v1, v2) {
    return {x: v1.x + v2.x,
	    y: v1.y + v2.y};
}

function distance(a, b) {
    var dx = (a.x - b.x);
    var dy = (a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
}

function to_radians(angle) {
    return Math.PI * angle / 180;
}

function solve_newton(fn, start) {
    // Solve equation fn(x) == 0, starting from start, using Newton method
    var x = start;
    var delta = 0.0001;
    var dx = delta;
    var fnx = fn(x);
    var dfdx;
    while (Math.abs(fnx) > delta) {
	dfdx = (fn(x + dx) - fnx) / dx;
	x = x - fnx / dfdx;
	fnx = fn(x);
    }
    return x;
}
solve_newton.test = function () {
    console.log(solve_newton(function (x) {return x * x - 2;}, 1));
};


