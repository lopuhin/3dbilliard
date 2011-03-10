// common utils

function map(fn, lst) {
    var res = [];
    for (var i = 0; i < lst.length; i++ ) {
	res.push(fn(lst[i], i));
    }
    return res;
}


function foreach(fn, lst) {
    for (var i = 0; i < lst.length; i++ ) {
	var res = fn(lst[i], i);
	if (res == 'break')
	    break;
    }
}


function last(lst) {
    return lst[lst.length - 1];
}


function any(fn, lst) {
    for (var i = 0; i < lst.length; i++) {
	if (fn(lst[i]))
	    return true;
    }
    return false;
}

function in_list(lst, el) {
    return any(function (x) { return x == el; }, lst);
}



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
