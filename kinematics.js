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
		    var dt = now - segment.start;
		    var v = {x: segment.vx, y: segment.vy};
		    var ds = scale_vector(v, covered(vector_norm(v), dt));
		    ball.x = segment.x + ds.x;
		    ball.y = segment.y + ds.y;
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
		      vx: cue_speed.x, vy: cue_speed.y}];
    next_intersection(balls, borders, 0, 0);
    return 1.0; // TODO
}


function next_intersection(balls, borders, time, cnt) {
    // find first intersection of any of moving balls, starting with @time
    // update animation segment, and call itself recurcively to find the next intersection
    var intersection, c_ball1, c_ball2, c_border;
    console.log(balls, time);
    foreach(
	function (moving_ball) {
	    if (moving_ball.animation &&
		total_duration(moving_ball.animation) >= time) {
		foreach(function (another_ball) {
			    if (moving_ball != another_ball) {
				var x = ball_intersection(moving_ball, another_ball, time);
				if (x && (!intersection || x.t < intersection.t)) {
				    intersection = x;
				    c_ball1 = moving_ball;
				    c_ball2 = another_ball;
				}
			    }
		    }, balls);
		foreach(function (border) {
			    var x = border_intersection(moving_ball, border, time);
			    if (x && (!intersection || x.t < intersection.t)) {
				intersection = x;
				c_ball1 = moving_ball;
				c_ball2 = undefined;
				c_border = border;
			    }
			}, borders);
	    }
	}, balls);
    console.log('final', intersection);
    if (intersection) {
	var segment;
	if (c_ball1.animation) {
	    var last_segment = last(c_ball1.animation);
	    last_segment.duration = intersection.t - time;
	    segment = {x: intersection.point.x, y: intersection.point.y,
		       vx: intersection.moving_ball_v.x,
		       vy: intersection.moving_ball_v.y};
	} else {
	    c_ball1.animation = [];
	    segment = {x: ball.x, y: ball.y};
	}
	console.log('new segment', segment);
	c_ball1.animation.push(segment);
	
	if (cnt < 20) {
	    next_intersection(balls, borders, intersection.t, cnt + 1);
	}
    }
}

// TODO

function ball_intersection(moving_ball, another_ball, time) {
    return undefined;
    var segment = last(moving_ball.animation);
    if (another_ball.animation) {
	var another_segment = current_segment(another_ball.animation, time);
	// TODO
    } else {
	var v = {x: segment.vx, y: segment.vy};
	var fn = function (t) {
	    var ds = scale_vector(v, covered(vector_norm(v), t));
	    return distance(add_vectors(segment, ds), another_ball) -
		another_ball.radius - moving_ball.radius;
	};
	var t = newton_solve(fn, 0, 10);
	console.log('solution', t);
	if (t != undefined) {
	    var ds = scale_vector(v, covered(vector_norm(v), t));
	    return {point: add_vectors(segment, ds), t: time + t,
		    moving_ball_v: v, another_ball_v: v}; // TODO
	}
    }
}

function border_intersection(moving_ball, border, time) {
    // return time delta, point and normal of intersection with border
    var segment = last(moving_ball.animation);
    var border_vect = {x: border[1].x - border[0].x,
		       y: border[1].y - border[0].y};
    var normal1 = scale_vector({x: border_vect.y, y: -border_vect.x}, moving_ball.radius);
    var normal2 = mult_vector(normal1, -1);
    var line1 = [add_vectors(border[0], normal1),
		 add_vectors(border[1], normal1)];
    var line2 = [add_vectors(border[0], normal2),
		 add_vectors(border[1], normal2)];
    // TODO - edges intersection
    var int1 = line_intersection(segment, line1);
    var int2 = line_intersection(segment, line2);
    var segment_v = {x: segment.vx, y: segment.vy};
    var v_module = vector_norm(segment_v);
    var normal = normal1;
    var angle = angle_between(segment_v, normal);
    if (segment_v.x * normal.x + segment_v.y * normal.y > 0) {
	normal = normal2;
    }
    var intersections = [];
    if (int1.x != undefined) {
	var t1 = time_to_cover(v_module, distance(segment, int1));
	intersections.push({point: int1, t: time + t1});
    }
    if (int2.x != undefined) {
	var t2 = time_to_cover(v_module, distance(segment, int2));
	intersections.push({point: int2, t: time + t2});
    }
    if (intersections.length) {
	var intersection = find_max(intersections, function (x) { return -x.t; });
	intersection.moving_ball_v = rotate_vector(
	    segment_v, 2 * angle_between(segment_v, normal) - Math.PI);
	return intersection;
    }
}

function line_intersection(segment, line) {
    // return intersection point of animation segment and a line
    var a = {x: segment.vx, y: segment.vy}; // direction
    var a0 = {x: segment.x, y: segment.y}; // start
    var b = {x: line[1].x - line[0].x, y: line[1].y - line[0].y};
    var b0 = {x: line[0].x, y: line[0].y};
    var solution = gauss_solve(
	[[a.x, -b.x],
	 [a.y, -b.y]],
	[b0.x - a0.x,
	 b0.y - a0.y]);
    if (solution[0] > 0 && solution[1] < 1.0 && solution[1] > 0.0) { // it lies inside line
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
    for (var i = N - 1; i >= 0; i-- ) {
	for (var j = 0; j < N; j++ ) {
	    if (Math.abs(matrix[i][j]) > 0 && answer[j] == undefined) {
		var s = 0;
		for (var k = 0; k < N && answer[k] != undefined; k++ ) {
		    s += matrix[i][k] * answer[k];
		}
		answer[j] = (vector[i] - s) / matrix[i][j];
		break;
	    }
	}
    }
    return answer;
}
gauss_solve.test = function () {
    console.log(gauss_solve(
		    [[1, -3, 4],
		     [-2, 3, 12],
		     [3, 2, -1]], [2, 13, 4]));
    console.log(gauss_solve(
		    [[1, -1],
		     [1, 2]], [2, 4]));
};


function find_max(lst, fn) {
    return lst[find_max_index(lst, fn)];
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


function newton_solve(fn, start, limit) {
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
	if (Math.abs(x - start) > limit)
	    return undefined;
    }
    return x;
}
newton_solve.test = function () {
    console.log(solve_newton(function (x) {return x * x - 2;}, 1, 3));
};


// 2d vectors

function rotate_vector(v, angle) {
    var ca = Math.cos(angle);
    var sa = Math.sin(angle);
    return {x: v.x*ca - v.y*sa,
	    y: v.x*sa + v.y*ca};
}

function angle_between(v1, v2) {
    v1 = scale_vector(v1, 1);
    v2 = scale_vector(v2, 1);
    return Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
}

function vector_norm(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function scale_vector(v, new_norm) {
    var coef = new_norm / vector_norm(v);
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
    return vector_norm({x: a.x - b.x, y: a.y - b.y});
}

function to_radians(angle) {
    return Math.PI * angle / 180;
}


