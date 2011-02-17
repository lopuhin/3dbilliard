/*

 TODO:
 - draw balls
 - lighting
 - movement of balls
 - draw stick, let balls collide
 - load billiard board model?
 - replacement for setInterval
 - move shaders from index.html to js
*/

function start() {
    var canvas = document.getElementById('main-canvas');
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    setInterval(tick, 15);
    //tick();
}

var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var squareVertexNormalBuffer;

var table_max_x = 2, table_max_z = 3;


var moonVertexPositionBuffer;
var moonVertexNormalBuffer;
var moonVertexIndexBuffer;
var moonVertexColorBuffer;
var moonVertexTextureCoordBuffer;


function initBuffers() {

    // moon buffers
    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var vertexColorData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
	var theta = latNumber * Math.PI / latitudeBands;
	var sinTheta = Math.sin(theta);
	var cosTheta = Math.cos(theta);

	for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
	    var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
 
            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
	    textureCoordData.push(u);
            textureCoordData.push(v);
	    // all are red for now
	    // TODO - multiple colors, and color some balls white in the equator
	    vertexColorData.push(1.0);
	    vertexColorData.push(0.0);
	    vertexColorData.push(0.0);
	    vertexColorData.push(1.0);
	}
    }

    var indexData = [];
    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }

    moonVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    moonVertexNormalBuffer.itemSize = 3;
    moonVertexNormalBuffer.numItems = normalData.length / 3;
 
    moonVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    moonVertexPositionBuffer.itemSize = 3;
    moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;
 
    moonVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    moonVertexTextureCoordBuffer.itemSize = 2;
    moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    moonVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorData), gl.STATIC_DRAW);
    moonVertexColorBuffer.itemSize = 4;
    moonVertexColorBuffer.numItems = vertexColorData.length / 4;
    
    moonVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    moonVertexIndexBuffer.itemSize = 1;
    moonVertexIndexBuffer.numItems = indexData.length;

    
    // table buffers
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
        table_max_x,  0.0,  table_max_z,
       -table_max_x,  0.0,  table_max_z,
        table_max_x,  0.0, -table_max_z,
       -table_max_x,  0.0, -table_max_z
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    var colors = [];
    for (var i = 0; i < 4; i++) {
      colors = colors.concat([0.0, 0.5, 0.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = 4;

    squareVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
    var normals = [
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    squareVertexNormalBuffer.itemSize = 3;
    squareVertexNormalBuffer.numItems = 4;
    
}

function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
}


var moonTexture;
function initTexture() {
    moonTexture = gl.createTexture();
    moonTexture.image = new Image();
    moonTexture.image.onload = function() {
	handleLoadedTexture(moonTexture);
    };
    moonTexture.image.src = "moon.gif";
}
 

var camera_angle_horiz = 30, camera_angle_vert = 10;


function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    gl.uniform3f(shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
    var lightingDirection = Vector.create([-1.0, -1.0, -1.0]);
    var adjustedLD = lightingDirection.toUnitVector().x(-1);
    var flatLD = adjustedLD.flatten();
    gl.uniform3f(shaderProgram.lightingDirectionUniform,
		 flatLD[0], flatLD[1], flatLD[2]);
    gl.uniform3f(shaderProgram.directionalColorUniform, 0.8, 0.8, 0.8);

    loadIdentity();
    // camera position
    mvTranslate([0.0, 0.0, -7.0]);
    //mvRotate(camera_angle_vert, [1, 0, 0]);
    //mvRotate(camera_angle_horiz, [0, 1, 0]);

    // draw the moon
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    console.log(moonVertexIndexBuffer, moonVertexColorBuffer,  moonVertexTextureCoordBuffer,
	       moonVertexPositionBuffer, moonVertexNormalBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexPositionAttribute,
	moonVertexPositionBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.vertexAttribPointer(
	shaderProgram.textureCoordAttribute,
	moonVertexTextureCoordBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexColorBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexColorAttribute,
	moonVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexNormalAttribute,
	moonVertexNormalBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    /*    
    // draw the table    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexPositionAttribute,
	squareVertexPositionBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
     */
}

var currentlyPressedKeys = Object();

var filter = 0;
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    if (String.fromCharCode(event.keyCode) == "F") {
	filter += 1;
	if (filter == 3) {
            filter = 0;
	}
    }
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


var camera_angle_shift = 0.5;

function handleKeys() {
    if (currentlyPressedKeys[KeyEvent.DOM_VK_PAGE_UP]) {

    }
    if (currentlyPressedKeys[KeyEvent.DOM_VK_PAGE_DOWN]) {

    }
    if (currentlyPressedKeys[37]) {
	// Left cursor key
	camera_angle_horiz += camera_angle_shift;
    }
    if (currentlyPressedKeys[39]) {
	// Right cursor key
	camera_angle_horiz -= camera_angle_shift;
    }
    if (currentlyPressedKeys[38]) {
	// Up cursor key
	camera_angle_vert += camera_angle_shift;
    }
    if (currentlyPressedKeys[40]) {
	// Down cursor key
	camera_angle_vert -= camera_angle_shift;
    }
}


var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
	var elapsed = timeNow - lastTime;
	
    }
    lastTime = timeNow;
}


function tick() {
    //handleKeys();
    drawScene();
    //animate();
}


// Get webgl context

var gl;

function initGL(canvas) {
    try {
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
	alert("Could not initialise WebGL, sorry :-(");
    }
}

// Matrix stuff

var mvMatrix;

function loadIdentity() {
    mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
    var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

var pMatrix;

function perspective(fovy, aspect, znear, zfar) {
    pMatrix = makePerspective(fovy, aspect, znear, zfar);
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
    if (m) {
	mvMatrixStack.push(m.dup());
	mvMatrix = m.dup();
    } else {
	mvMatrixStack.push(mvMatrix.dup());
    }
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
	throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function mvRotate(ang, v) {
    var arad = ang * Math.PI / 180.0;
    var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

// Shaders

var shaderProgram;
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert("Could not initialise shaders");
    }
    
    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
	shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute =
	gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(
	shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(
	shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
     
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    
    shaderProgram.ambientColorUniform =
	gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.lightingDirectionUniform =
	gl.getUniformLocation(shaderProgram, "uLightingDirection");
    shaderProgram.directionalColorUniform =
	gl.getUniformLocation(shaderProgram, "uDirectionalColor");
    
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(
	shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    gl.uniformMatrix4fv(
	shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));

    var normalMatrix = mvMatrix.inverse();
    normalMatrix = normalMatrix.transpose();
    gl.uniformMatrix4fv(
	shaderProgram.nMatrixUniform, false, new Float32Array(normalMatrix.flatten()));
}

// key events

if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };
}