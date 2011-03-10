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


