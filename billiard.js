/*
 Графика
  
 TODO:
 - кий и нормальный стол
 - освещение
 - тени под шарами

*/

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
    
    shaderProgram.vertexPositionAttribute =
	gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(
	shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.textureCoordAttribute =
	gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    
    shaderProgram.vertexNormalAttribute =
	gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.useLightingUniform =
	gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.useTexturesUniform =
	gl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.ambientColorUniform =
	gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform =
	gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform =
	gl.getUniformLocation(shaderProgram, "uPointLightingColor");
}



function create_ball_onload(ball) {
    return function () {
	handleLoadedTexture(ball.texture);
    };
};

function initTextures() {
    for (var i = 0; i < balls.length; i++ ) {
	var ball = balls[i];
	ball.texture = gl.createTexture();
	ball.texture.image = new Image();
	ball.texture.image.onload = create_ball_onload(ball);
	ball.texture.image.src = "img/" + ball.img;
    } 
}


var tableVertexPositionBuffer;
var tableVertexNormalBuffer;
var tableVertexTextureCoordBuffer;
var tableVertexIndexBuffer;
var tableVertexColorBuffer;

var ballVertexPositionBuffer;
var ballVertexNormalBuffer;
var ballVertexTextureCoordBuffer;
var ballVertexIndexBuffer;
var ballVertexColorBuffer;


function initBuffers() {
    tableVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexPositionBuffer);
    var vertices = [
       -table_x_size, 0.0, -table_y_size,
        table_x_size, 0.0, -table_y_size,
        table_x_size, 0.0,  table_y_size,
       -table_x_size, 0.0,  table_y_size];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    tableVertexPositionBuffer.itemSize = 3;
    tableVertexPositionBuffer.numItems = 4;
 
    tableVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexNormalBuffer);
    var vertexNormals = [
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    tableVertexNormalBuffer.itemSize = 3;
    tableVertexNormalBuffer.numItems = 4;
    
    var vertexColors = [
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0];
    tableVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexColorBuffer);    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    tableVertexColorBuffer.itemSize = 4;
    tableVertexColorBuffer.numItems = 4;
        
    tableVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tableVertexIndexBuffer);
    var tableVertexIndices = [0, 1, 2, 0, 2, 3];
    gl.bufferData(
	gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tableVertexIndices), gl.STATIC_DRAW);
    tableVertexIndexBuffer.itemSize = 1;
    tableVertexIndexBuffer.numItems = 6;

 
    var latitudeBands = 15;
    var longitudeBands = 15;
 
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    var vertexColors = [];
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
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
	    vertexColors.push(1.0);
	    vertexColors.push(1.0);
	    vertexColors.push(1.0);
	    vertexColors.push(1.0);
	}
    }
 
    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
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
 
    ballVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    ballVertexNormalBuffer.itemSize = 3;
    ballVertexNormalBuffer.numItems = normalData.length / 3;

    ballVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    ballVertexColorBuffer.itemSize = 4;
    ballVertexColorBuffer.numItems = vertexColors.length / 4;

    ballVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    ballVertexTextureCoordBuffer.itemSize = 2;
    ballVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
 
    ballVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    ballVertexPositionBuffer.itemSize = 3;
    ballVertexPositionBuffer.numItems = vertexPositionData.length / 3;
 
    ballVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    ballVertexIndexBuffer.itemSize = 1;
    ballVertexIndexBuffer.numItems = indexData.length;
  }


var camera_angle_vert = 10, camera_angle_horiz = 30;
var camera_radius = 3;
 
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    gl.uniform1i(shaderProgram.useLightingUniform, true);
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
    
    gl.uniform3f(
        shaderProgram.pointLightingLocationUniform, 0.0, 1.0, -3.0);
 
    gl.uniform3f(
        shaderProgram.pointLightingColorUniform, 0.8, 0.8, 0.8);
 
    loadIdentity();

    var cue = balls[0];

    mvTranslate([0, 0, -camera_radius]);
    
    mvRotate(camera_angle_vert,  [1, 0, 0]);
    mvRotate(camera_angle_horiz, [0, 1, 0]);

    mvTranslate([-cue.x, -radius * 5, -cue.y]);
    
    // table
    gl.uniform1i(shaderProgram.useTexturesUniform, false);
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexPositionBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexPositionAttribute, tableVertexPositionBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexNormalBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexNormalAttribute, tableVertexNormalBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexColorBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexColorAttribute,
	tableVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
     
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tableVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, tableVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    // balls
    gl.uniform1i(shaderProgram.useTexturesUniform, true);

    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexPositionBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexPositionAttribute, ballVertexPositionBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexTextureCoordBuffer);
    gl.vertexAttribPointer(
	shaderProgram.textureCoordAttribute, ballVertexTextureCoordBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexNormalBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexNormalAttribute, ballVertexNormalBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexColorBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexColorAttribute, ballVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballVertexIndexBuffer);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    map(function (ball) {
	    gl.bindTexture(gl.TEXTURE_2D, ball.texture);
	    mvPushMatrix();
	    mvTranslate([ball.x, radius, ball.y]);
	    mvRotate(ball.x_rot, [1, 0, 0]);
	    mvRotate(ball.y_rot, [0, 1, 0]);
	    setMatrixUniforms();
	    gl.drawElements(gl.TRIANGLES, ballVertexIndexBuffer.numItems,
			    gl.UNSIGNED_SHORT, 0);
	    mvPopMatrix();
	},
	balls);
}
 
 
var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
	var elapsed = timeNow - lastTime;
	map(update_position, balls);
    }
    lastTime = timeNow;
}



function tick() {
    handleKeys();
    drawScene();
    animate();
}
 

var camera_angle_shift = 0.5;
var camera_radius_shift = 0.05;

function handleKeys() {
    if (currentlyPressedKeys[KeyEvent.DOM_VK_PAGE_UP]) {
	camera_radius -= camera_radius_shift;
    }
    if (currentlyPressedKeys[KeyEvent.DOM_VK_PAGE_DOWN]) {
	camera_radius += camera_radius_shift;
    }
    var sign = (camera_radius > 0) ? 1 : -1;
    if (currentlyPressedKeys[37]) {
	// Left cursor key
	camera_angle_horiz += sign * camera_angle_shift;
    }
    if (currentlyPressedKeys[39]) {
	// Right cursor key
	camera_angle_horiz -= sign * camera_angle_shift;
    }
    if (currentlyPressedKeys[38]) {
	// Up cursor key
	camera_angle_vert += sign * camera_angle_shift;
    }
    if (currentlyPressedKeys[40]) {
	// Down cursor key
	camera_angle_vert -= sign * camera_angle_shift;
    }
}
    
function webGLStart() {
    var canvas = document.getElementById("main-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTextures();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.clearDepth(1.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    setInterval(tick, 15);
}

 
 
