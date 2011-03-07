var friction_coef = 0.3;

function covered_distance(v0, t) {
    // distance, covered by ball, taking friction into account
    return v0 * (1 - Math.exp(-friction_coef * t)) / friction_coef;
}

function updated_speed(v0, t) {
    return v0 * Math.exp(-friction_coef * t);
}


function time_to_cover(v0, distance) {
    // inverse of covered with v0 = const
    return - Math.log(1 - distance * friction_coef / v0) / friction_coef;
}

function time_to_stop(v0) {
    // time till the ball stops completly
    var almost_zero_v = 0.05;
    if (v0 <= almost_zero_v)
	return 0;
    return - Math.log(almost_zero_v / v0) / friction_coef;
}


function update_position(ball) {
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
		    var ds = scale_vector(v, covered_distance(vector_norm(v), dt));
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
    var get_duration = function (ball) {
	var total_duration = 0;
	if (ball.animation) {
	    foreach(function (segment) {
			if (segment.duration)
			    total_duration += segment.duration;
		    }, ball.animation);
	}
	return total_duration;
    };
    return find_max(map(get_duration, balls));
}

// TODO - split
function next_intersection(balls, borders, time, prev_ball_pair) {
    // find first intersection of any of moving balls, starting with @time
    // update animation segment, and call itself recurcively to find the next intersection
    var eps = 0.000001;
    var intersection, c_ball1, c_ball2;
    console.log(balls, time);
    foreach(
	function (moving_ball) {
	    if (moving_ball.animation && !last(moving_ball.animation).duration) {
		foreach(function (another_ball) {
			    // balls just collided can not collide again
			    if (moving_ball != another_ball && (
				!prev_ball_pair || !(
				    in_list(prev_ball_pair, moving_ball) &&
   					in_list(prev_ball_pair, another_ball)))) {
				var x = ball_intersection(moving_ball, another_ball, time);
				if (x && (!intersection || x.t < intersection.t) &&
				   x.t - time > eps) {
				    intersection = x;
				    c_ball1 = moving_ball;
				    c_ball2 = another_ball;
				}
			    }
		    }, balls);
		foreach(function (border) {
			    var x = border_intersection(moving_ball, border, time);
			    if (x && (!intersection || x.t < intersection.t) &&
				x.t - time > eps) {
				intersection = x;
				c_ball1 = moving_ball;
				c_ball2 = undefined;
			    }
			}, borders);
		var last_s = last(moving_ball.animation);
		var last_v = {x: last_s.vx, y: last_s.vy};
		var t = time + time_to_stop(vector_norm(last_v));
		if ((!intersection || t < intersection.t) && t - time > eps) {
		    var ds = scale_vector(
			last_v, covered_distance(vector_norm(last_v), t - time));
		    intersection = {t: t, point: add_vectors(last_s, ds)};
		    c_ball1 = moving_ball;
		    c_ball2 = undefined;
		}
	    }
	}, balls);
    console.log('final', intersection);
    if (intersection) {
	var last_segment = last(c_ball1.animation);
	last_segment.duration = intersection.t - time;
	if (intersection.moving_ball_v) {
	    var segment = {x: intersection.point.x, y: intersection.point.y,
			   vx: intersection.moving_ball_v.x,
			   vy: intersection.moving_ball_v.y};
	    if (c_ball2) {
		if (c_ball2.animation) {
		    var s = last(c_ball2.animation);
		    s.duration = intersection.t - time;
		} else { // add still animation
		    c_ball2.animation = [{x: c_ball2.x, y: c_ball2.y,
					  vx: 0, vy: 0, duration: intersection.t}];
		}
		c_ball2.animation.push(
		    {x: intersection.another_point.x,
		     y: intersection.another_point.y,
		     vx: intersection.another_ball_v.x,
		     vy: intersection.another_ball_v.y});
	    }
	    c_ball1.animation.push(segment);
	}
	if (any(function (ball) {
		return ball.animation && ! last(ball.animation).duration;
		}, balls)) {
	    prev_ball_pair = undefined;
	    if (c_ball1 && c_ball2)
		prev_ball_pair = [c_ball1, c_ball2];
	    next_intersection(balls, borders, intersection.t, prev_ball_pair);
	}
    }
}


function ball_intersection(moving_ball, another_ball, time) {
    var segment = last(moving_ball.animation);
    var fn;
    var v = {x: segment.vx, y: segment.vy};
    var another_v = {x: 0, y: 0};
    var another_pos = {x: another_ball.x, y: another_ball.y};
    if (another_ball.animation) {
	var another_segment = current_segment(another_ball.animation, time);
	if (another_segment) {
	    another_v = {x: another_segment.vx, y: another_segment.vy};
	    another_pos = another_segment;
	    fn = function (t) {
		var ds1 = scale_vector(v, covered_distance(vector_norm(v), t));
		var ds2 = scale_vector(another_v,
				       covered_distance(vector_norm(another_v), t));
		return distance(add_vectors(segment, ds1),
				add_vectors(another_segment, ds2)) -
		    another_ball.radius - moving_ball.radius;
	    };
	} else {
	    another_pos = last(another_ball.animation);
	}
    }
    if (!fn) {
	fn = function (t) {
	    var ds = scale_vector(v, covered_distance(vector_norm(v), t));
	    return distance(add_vectors(segment, ds), another_ball) -
		another_ball.radius - moving_ball.radius;
	};
    }
    var t = newton_solve(fn, 0, 100); // FIXME - calc limit
    if (t != undefined && t >= 1e-8) {
	var ds1 = scale_vector(v, covered_distance(vector_norm(v), t));
	var pos1 = add_vectors(segment, ds1);
	var ds2 = scale_vector(another_v,
			       covered_distance(vector_norm(another_v), t));
	var pos2 = add_vectors(another_pos, ds2);
	v = scale_vector(v, updated_speed(vector_norm(v), t));
	another_v = scale_vector(another_v, updated_speed(vector_norm(another_v), t));
	var v1v2 = ball_collision(v, pos1, another_v, pos2);
	return {point: pos1, t: time + t, another_point: pos2,
		moving_ball_v: v1v2[0], another_ball_v: v1v2[1]};
    }
}

function ball_collision(v1, pos1, v2, pos2) {
    // return speeds of balls after collision
    console.log('ball_collision', v1, pos1, v2, pos2);
    var ds = scale_vector({x: pos2.x - pos1.x, y: pos2.y - pos1.y}, 1);
    var angle = angle_between(ds, {x: 1, y: 0});
    console.log('angle', angle);
    v1 = rotate_vector(v1, angle);
    v2 = rotate_vector(v2, angle);
    console.log('rotated', v1, v2);
    // now ceners of balls are aligned with x axis
    var new_v1 = {x: v2.x, y: v1.y};
    var new_v2 = {x: v1.x, y: v2.y};
    // rotate them back
    var res= [rotate_vector(new_v1, -angle),
	      rotate_vector(new_v2, -angle)];
    console.log('result', res[0], res[1]);
    return res;
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
	if (!isNaN(t1))
	    intersections.push({point: int1, t: time + t1});
    }
    if (int2.x != undefined) {
	var t2 = time_to_cover(v_module, distance(segment, int2));
	if (!isNaN(t2))
	    intersections.push({point: int2, t: time + t2});
    }
    if (intersections.length) {
	var intersection = find_max(intersections, function (x) { return -x.t; });
	var updated_v = scale_vector(
	    segment_v,
	    updated_speed(vector_norm(segment_v), intersection.t - time));
	intersection.moving_ball_v = rotate_vector(
	    updated_v, 2 * angle_between(updated_v, normal) - Math.PI);
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
		    console.log('current_segment', t, time);
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
	var j = find_max_index(matrix[i], function (x, j) {
				   if (answer[j] == undefined)
				       return Math.abs(x);
				   return 0;
			       });
	var s = 0;
	for (var k = 0; k < N && answer[k] != undefined; k++ ) {
	    s += matrix[i][k] * answer[k];
	}
	answer[j] = (vector[i] - s) / matrix[i][j];
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
    console.log(gauss_solve(
		    [[3.464101615137755, 0],
		     [-2.220e-10, -4]],
		    [-1.0999999999999999, -4.135085296108588]));
};


function find_max(lst, fn) {
    return lst[find_max_index(lst, fn)];
}

function find_max_index(lst, fn) {
    fn = fn || function (x) { return x; };
    var m, c, index;
    for (var i = 0; i < lst.length; i++ ) {
	c = fn(lst[i], i);
	if (m == undefined || c > m) {
	    m = c;
	    index = i;
	}
    }
    return index;
}


function newton_solve(fn, start, limit) {
    // Solve equation fn(x) == 0, starting from start, using Newton method,
    // searching for positive solution not greater then limit
    var x = start;
    var delta = 0.0001;
    var dx = delta;
    var fnx = fn(x);
    var dfdx;
    var iter_limit = 1000;
    while (Math.abs(fnx) > delta) {
	iter_limit -= 1;
	dfdx = (fn(x + dx) - fnx) / dx;
	x = x - fnx / dfdx;
	fnx = fn(x);
	if (iter_limit < 0 || x < 0 || Math.abs(x - start) > limit)
	    return undefined;
    }
    console.log(x, fn(x - delta), fn(x), fn(x + delta));
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
    var n = vector_norm(v);
    if (n > 0) {
	var coef = new_norm / n;
	return mult_vector(v, coef);
    }
    return v;
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


