

//keep text always facing the screen
function updateTextRotation(){
	params.text.forEach(function(m){
		m.quaternion.copy(params.camera.quaternion);
	});
}

//keep the light coming from the camera location
function updateLights(){
	params.lights.forEach(function(l){
		l.position.copy(params.camera.position );
	});
}

//for the slice, in case we want to change it dynamically
function updateSlice(p,r){

	params.sliceMesh.forEach(function(m){
		params.scene.remove(m);
	})
	params.sliceMesh = [];

	var slice = drawSlice(4.*params.size, p, r, params.sliceOpacity, params.sliceColor);
	params.sliceMesh.push(slice.plane);
	params.sliceMesh.push(slice.planeLine);
	slice.mesh.forEach(function(m){
		params.sliceMesh.push(m);
	})
}

function updateSlicePlaneDepth(){
	var normal = params.slicePlane.geometry.faces[0].normal;
	var pos = params.camera.position.clone().sub(params.slicePlanePosition.clone().sub(params.offsetPosition));
	var pCheck = normal.dot(pos)*Math.cos(params.yRfac);
	if (pCheck < 1){
		params.slicePlane.material.depthTest = true;
	} else {
		params.slicePlane.material.depthTest = false;
	}

}



//draw the scene (with lighting)
function drawScene(){

	//draw the main spheres (for default, hard-Sphere and Sparse views)
	drawMainSpheres();

	//draw the slice view (updateSlice calls drawSlice -- written this way to facilitate dynamic updating of slice mesh)
	updateSlice(params.slicePlanePosition, params.slicePlaneRotation);

	//draw the coordinate view
	drawCoordination();

	//draw the box 
	drawBox();

	//draw the axes (with labels)
	drawAxes();

	//draw the labels
	drawLabels();

	//lights
	addLights();

	//some things that we only need to do when the camera moves
	params.controls.addEventListener( 'change', updateLights );
	params.controls.addEventListener( 'change', updateSlicePlaneDepth );
	params.controls.addEventListener( 'change', updateTextRotation );

}

//this is the animation loop
function animate(time) {
	requestAnimationFrame( animate );
	params.controls.update();
	params.keyboard.update();
	TWEEN.update(time);

	params.ttMeshIndex.forEach(function(loc){
		moveTooltip(loc);
	})

	if (params.keyboard.down("C")){
		console.log(params.camera.position)
	}

	//testing dynamically updating the slice location
	if (params.isSlice){



		var doSliceUpdate = false;
		if (params.keyboard.pressed("up")){
			params.xPfac += params.size*0.02;
			doSliceUpdate = true;
		}
		if (params.keyboard.pressed("down")){
			params.xPfac -= params.size*0.02;
			doSliceUpdate = true;
		}
		if (params.keyboard.pressed("left")){
			params.yRfac += Math.PI*0.02;
			doSliceUpdate = true;
		}
		if (params.keyboard.pressed("right")){
			params.yRfac -= Math.PI*0.02;
			doSliceUpdate = true;
		}

		if (doSliceUpdate){
			params.xPfac = THREE.Math.clamp(params.xPfac, -0.5*params.size, 1.5*params.size);
			params.yRfac = THREE.Math.clamp(params.yRfac, -Math.PI/2., Math.PI/2.);
			var p = params.slicePlanePosition.clone();
			p.x = params.xPfac;
			var r = params.slicePlaneRotation.clone();
			r.y = params.yRfac; 
			updateSlice(p, r);
			showSliceMesh(true);
		}
	}

	params.renderer.render( params.scene, params.camera );

}

//resize all the divs and buttons
function resizeContainers(){

	console.log('resizing')
	var m = 10; //margin
	var b = 50; //button height

	var vHeight = parseFloat(window.innerHeight) - 4.*m - 2.*b;
	var vWidth = vHeight/params.aspect;
	if (vWidth > params.canvasFrac*parseFloat(window.innerWidth)){
		vWidth = params.canvasFrac*parseFloat(window.innerWidth);
		vHeight = vWidth*params.aspect;
	}
	if (vWidth < params.canvasMinWidth){
		vWidth = params.canvasMinWidth;
		vHeight = vWidth*params.aspect;
	}

	//canvas
	d3.select('#WebGLContainer')
		.style('position','absolute')
		.style('top',m + 'px')
		.style('left',m +'px')
		.style('padding',0)
		.style('margin',0)
		.style('width',vWidth + 'px')
		.style('height',vHeight + 'px')
	if (params.renderer != null){
		d3.select("#WebGLContainer").select('canvas')
			.style('width', vWidth)
			.style('height', vHeight)
	}


	//text 
	iWidth = Math.max(params.textMinWidth, parseFloat(window.innerWidth) - vWidth - 4.*m);
	d3.select('#textContainer')
		.style('position','absolute')
		.style('top',m + 'px')
		.style('left',(vWidth + 2.*m) +'px')
		.style('margin',0)
		.style('padding',0)
		.style('width',iWidth + 'px')
		.style('height',vHeight + 2.*b + 2.*m + 'px')

	setupButtons(vHeight, vWidth, m, b);
	
	if (params.renderer != null){
		var width = parseFloat(params.container.style('width'));
		var height = parseFloat(params.container.style('width'));
		var aspect = width / height;
		params.camera.aspect = aspect;
		params.camera.updateProjectionMatrix();

		params.renderer.setSize( width, height);
	}
}


///////////////////////////
//this is called to start everything
function WebGLStart(){

//initialize everything
	init();

//draw everything
	drawScene();

//begin the animation
	animate();
}

///////////////////////////
// runs on load
///////////////////////////
window.addEventListener("resize", resizeContainers)

//called upon loading
WebGLStart();

