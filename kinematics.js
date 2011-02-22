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


function covered(v0, t) {
    return t * v0; // TODO - slowing down
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


function assign_animations () {
    // calculate ball animations, return total animation duration

    return 1.0;
}