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

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform =
	gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform =
	gl.getUniformLocation(shaderProgram, "uPointLightingColor");
}


var moonTexture;

function initTextures() {
    moonTexture = gl.createTexture();
    moonTexture.image = new Image();
    moonTexture.image.onload = function() {
	handleLoadedTexture(moonTexture);
    };
    moonTexture.image.src = "moon.gif";
}


var tableVertexPositionBuffer;
var tableVertexNormalBuffer;
var tableVertexTextureCoordBuffer;
var tableVertexIndexBuffer;
var tableVertexColorBuffer;

var moonVertexPositionBuffer;
var moonVertexNormalBuffer;
var moonVertexTextureCoordBuffer;
var moonVertexIndexBuffer;
var moonVertexColorBuffer;

var draw_table = true;

function initBuffers() {
    tableVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tableVertexPositionBuffer);
    var vertices = [
       -2.0, 0.0, -3.0,
        2.0, 0.0, -3.0,
        2.0, 0.0,  3.0,
       -2.0, 0.0,  3.0];
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
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0];
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
    var radius = 0.2;
 
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
 
    moonVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    moonVertexNormalBuffer.itemSize = 3;
    moonVertexNormalBuffer.numItems = normalData.length / 3;

    moonVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    moonVertexColorBuffer.itemSize = 4;
    moonVertexColorBuffer.numItems = vertexColors.length / 4;

    moonVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    moonVertexTextureCoordBuffer.itemSize = 2;
    moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
 
    moonVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    moonVertexPositionBuffer.itemSize = 3;
    moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;
 
    moonVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    moonVertexIndexBuffer.itemSize = 1;
    moonVertexIndexBuffer.numItems = indexData.length;
  }


var camera_angle_vert = 10, camera_angle_horiz = 30;

 
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
 
    gl.uniform1i(shaderProgram.useLightingUniform, true);
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
    
    gl.uniform3f(
        shaderProgram.pointLightingLocationUniform, 0.0, 0.0, -20.0);
 
    gl.uniform3f(
        shaderProgram.pointLightingColorUniform, 0.8, 0.8, 0.8);
 
    loadIdentity();
 
    mvTranslate([0, 0, -5]);
     
    mvRotate(camera_angle_vert,  [1, 0, 0]);
    mvRotate(camera_angle_horiz, [0, 1, 0]);

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

    // ball
    gl.uniform1i(shaderProgram.useTexturesUniform, true);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.vertexAttribPointer(
	shaderProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize,
	gl.FLOAT, false, 0, 0);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexNormalAttribute, moonVertexNormalBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexColorBuffer);
    gl.vertexAttribPointer(
	shaderProgram.vertexColorAttribute, moonVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}
 
 
var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
	var elapsed = timeNow - lastTime;
	// TODO
    }
    lastTime = timeNow;
}



function tick() {
    handleKeys();
    drawScene();
    animate();
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

 
 
