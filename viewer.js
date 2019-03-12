//all "global" variables are contained within params object
var params;
function defineParams(){
	params = new function() {

		this.container = null;
		this.renderer = null;
		this.scene = null;
		this.camera = null;

		//for frustum      
		this.zmax = 5.e10;
		this.zmin = 1;
		this.fov = 45.

		//camera view (and tween)
		this.defaultView = new THREE.Vector3(3.3,1.75,1.5);
		this.defaultViewTween;

		//will hold all the outer spheres
		this.spheres = [];
		this.hemiSpheres = [];

		//will hold items for slice view
		this.sliceMesh = [];

		//the default opacity of the full spheres
		this.defaultOuterOpacity = 0.12;
		this.defaultInnerOpacity = 0.7;
		this.hardOpacity = 0.95;
		this.sphereColor = 0x228B22;

		this.sliceColor = 0xAFEEEE;
		this.sliceOpacity = 0.7;

		//this size of the sparse model
		this.sparseScale = 0.2;
		this.isSparse = false;

		//the number of ms for the tween
		this.tweenDuration = 500;

		//canvas
		this.aspect = 1; //desired aspect ratio of viewer
		this.canvasFrac = 0.5; //maximum fraction of window space for canvas
		this.canvasMinWidth = 380; //minimum width of canvas, in pixels
		this.textMinWidth = 380; //minimum width of text, in pixels

		this.lights = [];

		this.sphereSegments = 16;
		this.size = 1;

	};


}



//this initializes everything needed for the scene
function init(){
	defineParams()
	resizeContainers();

	params.container = d3.select('#WebGLContainer')
	var width = parseFloat(params.container.style('width'));
	var height = parseFloat(params.container.style('width'));
	var aspect = width / height;

	// renderer
	params.renderer = new THREE.WebGLRenderer( {
		antialias:true,
	} );
	params.renderer.setSize(width, height);

	params.container.node().appendChild( params.renderer.domElement );

	// scene
	params.scene = new THREE.Scene();     
	params.scene.background = new THREE.Color( 0xffffff );

	// camera
	params.camera = new THREE.PerspectiveCamera( params.fov, aspect, params.zmin, params.zmax);
	params.camera.up.set(0, 0, 1);
	params.camera.position.set(params.defaultView.x, params.defaultView.y, params.defaultView.z);
	params.scene.add(params.camera);  

	//controls
	//params.controls = new THREE.TrackballControls( params.camera, params.renderer.domElement );
	params.controls = new THREE.OrbitControls( params.camera);
	params.controls.enablePan = false;
	params.controls.rotateSpeed = 0.5;
	params.domElement = params.renderer.domElement;
	//params.controls.addEventListener( 'change', function(){console.log(params.camera.position) });
}

function defineTweens(){
	params.defaultViewTween = new TWEEN.Tween(params.camera.position).to(params.defaultView, params.tweenDuration).easing(TWEEN.Easing.Linear.None);
}

//draw a quarter sphere
function drawQuarterSphere(radius, widthSegments, heightSegments, opacity, color, position, rotation){
	var sphere = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI/2., 0, Math.PI/2.)
	var circle1 = new THREE.CircleGeometry(radius, widthSegments, 0., Math.PI/2.)
	var circle2 = new THREE.CircleGeometry(radius, widthSegments, 0., Math.PI/2.)
	var circle3 = new THREE.CircleGeometry(radius, widthSegments, 0., Math.PI/2.)

	var sphereMesh = new THREE.Mesh(sphere);

	var circle1Mesh = new THREE.Mesh(circle1);
	circle1Mesh.rotation.set(0, 0, Math.PI/2.);

	var circle2Mesh = new THREE.Mesh(circle2);
	circle2Mesh.rotation.set(Math.PI/2., 0, Math.PI/2.);

	var circle3Mesh = new THREE.Mesh(circle3);
	circle3Mesh.rotation.set(Math.PI/2., Math.PI/2., 0);

	var singleGeometry = new THREE.Geometry();

	sphereMesh.updateMatrix(); // as needed
	singleGeometry.merge(sphereMesh.geometry, sphereMesh.matrix);

	circle1Mesh.updateMatrix(); // as needed
	singleGeometry.merge(circle1Mesh.geometry, circle1Mesh.matrix);

	circle2Mesh.updateMatrix(); // as needed
	singleGeometry.merge(circle2Mesh.geometry, circle2Mesh.matrix);

	circle3Mesh.updateMatrix(); // as needed
	singleGeometry.merge(circle3Mesh.geometry, circle3Mesh.matrix);

	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:true,
		//shininess:50,
		opacity:opacity, 
		side:THREE.DoubleSide,
	});

	var mesh = new THREE.Mesh(singleGeometry, material);
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	mesh.renderOrder = -1;
	params.scene.add(mesh);
	return mesh;

}

//draw a half sphere
function drawHalfSphere(radius, widthSegments, heightSegments, opacity, color, position, rotation){
	var sphere = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI, 0, Math.PI)
	var circle = new THREE.CircleGeometry(radius, widthSegments, 0., 2.*Math.PI)

	var sphereMesh = new THREE.Mesh(sphere);
	var circleMesh = new THREE.Mesh(circle);

	var singleGeometry = new THREE.Geometry();

	sphereMesh.updateMatrix(); // as needed
	singleGeometry.merge(sphereMesh.geometry, sphereMesh.matrix);

	circleMesh.updateMatrix(); // as needed
	singleGeometry.merge(circleMesh.geometry, circleMesh.matrix);

	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:true,
		//shininess:50,
		opacity:opacity, 
		side:THREE.DoubleSide,
	});

	var mesh = new THREE.Mesh(singleGeometry, material);
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	mesh.renderOrder = -1;
	params.scene.add(mesh);

	return mesh;

}

//draw a full sphere
function drawSphere(radius, widthSegments, heightSegments, opacity, color, position){
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, 2.*Math.PI, 0, Math.PI)
	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:true,
		opacity:opacity, 
		//shininess:50,
	});

	sphere = new THREE.Mesh( geometry, material );
	sphere.position.set(position.x, position.y, position.z)
	//update the vertices of the plane geometry so that I can check for the intersection
	//https://stackoverflow.com/questions/23990354/how-to-update-vertices-geometry-after-rotate-or-move-object
	sphere.updateMatrix();
	sphere.geometry.applyMatrix( sphere.matrix );
	sphere.matrix.identity();
	sphere.position.set( 0, 0, 0 );
	sphere.rotation.set( 0, 0, 0 );
	sphere.scale.set( 1, 1, 1 );

	params.scene.add( sphere );
	
	return sphere;

}

//draw the slice view
//https://jsfiddle.net/8uxw667m/4/
//https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane/42353447
function drawSlice(size, position, rotation, opacity, color){

	var pointsOfIntersection = new THREE.Geometry();


	function setPointOfIntersection(line, plane) {
		var pointOfIntersection = new THREE.Vector3();
		plane.intersectLine(line, pointOfIntersection);
		if (pointOfIntersection) {
			if (pointOfIntersection.distanceTo(new THREE.Vector3(0,0,0)) != 0 ){//some failure mode for this
				//console.log("intersection", pointOfIntersection)
				pointsOfIntersection.vertices.push(pointOfIntersection.clone());
			}
		};
	}

	function sortPoints(){
		var center = new THREE.Vector3();
		var angles = [];
		var N = 0.;
		pointsOfIntersection.vertices.forEach(function(p){
			center.add(p);
			N+=1;
		})
		center.divide(new THREE.Vector3(N,N,N))
		//console.log("center", center, N)
		var i = 0;
		pointsOfIntersection.vertices.forEach(function(p){
			var x = p.x - center.x;
			var y = p.y - center.y;
			var z = p.z - center.z;
			r = Math.sqrt(x*x + y*y + z*z);
			angles.push(Math.acos(z/r));
		})
		//https://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
		console.log(pointsOfIntersection.vertices[0], angles)
		pointsOfIntersection.vertices.sort(function (a, b) { return angles[a] < angles[b] ? -1 : angles[a] > angles[b] ? 1 : 0; });
		pointsOfIntersection.vertices.needsUpdate = true;
		console.log(pointsOfIntersection.vertices[0])
			//console.log("angles", angles)
	}

	function drawIntersectionPoints(plane, obj) {
		var a = new THREE.Vector3(),
			b = new THREE.Vector3(),
			c = new THREE.Vector3();
		var planePointA = new THREE.Vector3(),
			planePointB = new THREE.Vector3(),
			planePointC = new THREE.Vector3();
		var lineAB = new THREE.Line3(),
			lineBC = new THREE.Line3(),
			lineCA = new THREE.Line3();


		var mathPlane = new THREE.Plane();
		plane.localToWorld(planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
		plane.localToWorld(planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
		plane.localToWorld(planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
		mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);

		obj.geometry.faces.forEach(function(face) {
			obj.localToWorld(a.copy(obj.geometry.vertices[face.a]));
			obj.localToWorld(b.copy(obj.geometry.vertices[face.b]));
			obj.localToWorld(c.copy(obj.geometry.vertices[face.c]));
			lineAB = new THREE.Line3(a, b);
			lineBC = new THREE.Line3(b, c);
			lineCA = new THREE.Line3(c, a);
			setPointOfIntersection(lineAB, mathPlane);
			setPointOfIntersection(lineBC, mathPlane);
			setPointOfIntersection(lineCA, mathPlane);
		});

		// var pointsMaterial = new THREE.PointsMaterial({
		// 	size: .5,
		// 	color: "red"
		// });
		// var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
		// params.scene.add(points);

		//do something to sort the points around a circle.
		sortPoints();

		var lineMaterial = new THREE.LineBasicMaterial( { 
			color: "red" 
		}) ;
		var line = new THREE.LineSegments( pointsOfIntersection, lineMaterial );
		params.scene.add( line );
  
	}

	////////////////////

	var geometry = new THREE.PlaneGeometry( size, size, 1 );
	var material = new THREE.MeshBasicMaterial( {
		color: color, 
		side: THREE.DoubleSide,
		transparent:true,
		opacity:opacity, 
		visible:false,
	});


	var plane = new THREE.Mesh( geometry, material );
	plane.position.set(position.x, position.y, position.z);
	plane.rotation.set(rotation.x, rotation.y, rotation.z);
	//update the vertices of the plane geometry so that I can check for the intersection
	//https://stackoverflow.com/questions/23990354/how-to-update-vertices-geometry-after-rotate-or-move-object
	plane.updateMatrix();
	plane.geometry.applyMatrix( plane.matrix );
	plane.matrix.identity();
	plane.position.set( 0, 0, 0 );
	plane.rotation.set( 0, 0, 0 );
	plane.scale.set( 1, 1, 1 );

	params.scene.add( plane );

	// var m = params.spheres[0];
	// drawIntersectionPoints(plane, m)
	params.spheres.forEach(function(m){ 
		drawIntersectionPoints(plane, m)
	});

	return plane;

}

//draw the outside box with axes
function drawBox(){
	var geometry = new THREE.BoxBufferGeometry( params.size, params.size, params.size);

	var edges = new THREE.EdgesGeometry( geometry );
	var material = new THREE.LineBasicMaterial( {color: 0x000000} )
	var line = new THREE.LineSegments( edges,  material);
	line.position.set(params.size/2, params.size/2., params.size/2.);
	params.scene.add( line );

	//The X axis is red. The Y axis is green. The Z axis is blue.
	var cubeAxis = new THREE.AxesHelper(1.5*params.size);
	cubeAxis.position.set(0,0,0);
	params.scene.add( cubeAxis );
}

//define lights
function addLights(){
	params.lights = [];
	//params.lights[0] = new THREE.DirectionalLight(0xffffff, 1.2)
	params.lights[0] = new THREE.PointLight( 0xffffff, 1.2, 0 );
	// lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	// lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

	//lights[0].position.set( 0, 200, 0 );
	params.lights[0].position.copy(params.camera.position );
	// lights[ 1 ].position.set( 100, 200, 100 );
	// lights[ 2 ].position.set( - 100, - 200, - 100 );

	params.lights.forEach(function(element){
		params.scene.add(element);
	})

	params.controls.addEventListener( 'change', updateLights );
}

//keep the light coming from the camera location
function updateLights(){
	params.lights.forEach(function(l){
		l.position.copy(params.camera.position );
	});
}

//draw the scene (with lighting)
function drawScene(){

	var radius = params.size*Math.sqrt(2)/4.

	//draw the full spheres (this should be from an input file)
	//corners
	var p1  = new THREE.Vector3(0, 				0, 				0);
	var p2  = new THREE.Vector3(params.size, 	0, 				0);
	var p3  = new THREE.Vector3(0, 				params.size, 	0);
	var p4  = new THREE.Vector3(params.size, 	params.size, 	0);
	var p5  = new THREE.Vector3(0, 				0,				params.size);
	var p6  = new THREE.Vector3(params.size, 	0, 				params.size);
	var p7  = new THREE.Vector3(0, 				params.size, 	params.size);
	var p8  = new THREE.Vector3(params.size,		params.size, 	params.size);
	//centers on planes
	var p9  = new THREE.Vector3(0,				params.size/2.,	params.size/2.);
	var p10 = new THREE.Vector3(params.size/2.,	0,				params.size/2.);
	var p11 = new THREE.Vector3(params.size/2.,	params.size/2.,	0);
	var p12 = new THREE.Vector3(params.size,	params.size/2.,	params.size/2.);
	var p13 = new THREE.Vector3(params.size/2.,	params.size,	params.size/2.);
	var p14 = new THREE.Vector3(params.size/2.,	params.size/2.,	params.size);

	var allP = [p1,p2,p3,p4,p5,p6,p7,p8, p9,p10,p11,p12,p13,p14]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultOuterOpacity, params.sphereColor, p);
		params.spheres.push(mesh);
	})
	
	//half spheres
	var r9 = new THREE.Vector3(0,				Math.PI/2.,		0);
	var r10 = new THREE.Vector3(-Math.PI/2.,	0,				0);
	var r11 = new THREE.Vector3(0, 				0,				0);
	var r12 = new THREE.Vector3(0, 				-Math.PI/2.,	0);
	var r13 = new THREE.Vector3(Math.PI/2., 	0, 				0);
	var r14 = new THREE.Vector3(Math.PI,		0,			0);

	allP = [p9,p10,p11,p12,p13,p14]
	var allR = [r9,r10,r11,r12,r13,r14]
	allP.forEach(function(p, i){
		var mesh = drawHalfSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultInnerOpacity, params.sphereColor, p, allR[i]);
		params.hemiSpheres.push(mesh);
	})


	var r1 = new THREE.Vector3(0,				Math.PI/2.,		0); 
	var r2 = new THREE.Vector3(0,				0,				0); 
	var r3 = new THREE.Vector3(Math.PI/2.,		Math.PI/2.,		0);  
	var r4 = new THREE.Vector3(Math.PI/2.,		0,				0);
	var r5 = new THREE.Vector3(0,				Math.PI/2.,		-Math.PI/2.); 
	var r6 = new THREE.Vector3(0,				-Math.PI/2.,	0);
	var r7 = new THREE.Vector3(Math.PI/2.,		0,				Math.PI);  
	var r8 = new THREE.Vector3(Math.PI,		0,				0);    
	allP = [p1,p2,p3,p4,p5,p6,p7,p8]
	allR = [r1,r2,r3,r4,r5,r6,r7,r8]
	allP.forEach(function(p, i){
		var mesh = drawQuarterSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultInnerOpacity, params.sphereColor, p, allR[i]);
		params.hemiSpheres.push(mesh);
	})


	//draw slice
	var p = new THREE.Vector3(params.size,	params.size/2.,	params.size/2.); 
	var r = new THREE.Vector3(0,			Math.PI/2.,		0); 

	mesh = drawSlice(2.*params.size, p, r, params.sliceOpacity, params.sliceColor);
	params.sliceMesh.push(mesh)

	//draw the box
	drawBox();



	//lights
	addLights()


}


//this is the animation loop
function animate(time) {
	requestAnimationFrame( animate );
	params.controls.update();
	params.renderer.render( params.scene, params.camera );
	TWEEN.update(time);
}

//helpers for buttons
function showHemiSpheres(bool){
	params.hemiSpheres.forEach(function(m){
		m.material.visible = bool;
	})
}

function showSliceMesh(bool){
	params.sliceMesh.forEach(function(m){
		m.material.visible = bool;
	})
}
function changeSphereOpacity(opacity){
	params.spheres.forEach(function(m){
		m.material.opacity = opacity;
	})
}

function changeSphereScale(scale){
	params.spheres.forEach(function(m){
		m.geometry.scale(scale, scale, scale);
	})	
}
//functions attached to buttons
function defaultView(){
	console.log('default view');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#resetButton').classed('buttonClicked', true);
	d3.selectAll('#resetButton').classed('buttonHover', false);

	showHemiSpheres(true);
	changeSphereOpacity(params.defaultOuterOpacity);
	showSliceMesh(false);
	if (params.isSparse){
		changeSphereScale(1./params.sparseScale);
	}

	params.isSparse = false;
	params.defaultViewTween.start();

}

function hardSphereView(){
	console.log('hard-sphere model');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#hardSphereButton').classed('buttonClicked', true);
	d3.selectAll('#hardSphereButton').classed('buttonHover', false);

	showHemiSpheres(false);
	changeSphereOpacity(params.hardOpacity);
	showSliceMesh(false);
	if (params.isSparse){
		changeSphereScale(1./params.sparseScale);
	}

	params.isSparse = false;

	params.defaultViewTween.start();
}

function sliceView(){
	console.log('slice');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);;
	d3.selectAll('#sliceButton').classed('buttonClicked', true);
	d3.selectAll('#sliceButton').classed('buttonHover', false);

	showHemiSpheres(false);
	changeSphereOpacity(params.hardOpacity);
	showSliceMesh(true);
	if (params.isSparse){
		changeSphereScale(1./params.sparseScale);
	}

	params.isSparse = false;

	params.defaultViewTween.start();
}

function sparseView(){
	console.log('sparse model');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#sparseButton').classed('buttonClicked', true);
	d3.selectAll('#sparseButton').classed('buttonHover', false);

	showHemiSpheres(false);
	changeSphereOpacity(params.hardOpacity);
	if (!params.isSparse){
		changeSphereScale(params.sparseScale);
	}
	showSliceMesh(false);

	params.isSparse = true;

	params.defaultViewTween.start();
}

function coordinationView(){
	console.log('coordination');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#coordinationButton').classed('buttonClicked', true);
	d3.selectAll('#coordinationButton').classed('buttonHover', false);

	showHemiSpheres(false);
	changeSphereOpacity(params.hardOpacity);
	if (!params.isSparse){
		changeSphereScale(params.sparseScale);
	}
	showSliceMesh(false);

	params.isSparse = true;

	params.defaultViewTween.start();
}

function showHelp(){
	console.log('help');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#helpButton').classed('buttonClicked', true);
	d3.selectAll('#helpButton').classed('buttonHover', false);
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

	//buttons
	d3.select('#buttonContainer')
		.style('position','absolute')
		.style('top',vHeight + 2.*m + 'px')
		.style('left',m +'px')
		.style('margin',0)
		.style('padding',0)
		.style('width',vWidth + 'px')
		.style('height',2.*b + m + 'px')

	var bw = (vWidth - 2.*m - 2.)/3. //-2 accounts for button border width
	d3.select('#resetButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',0)
		.style('width', bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', true)
		.classed('buttonHover', false)
		.on('click', defaultView)

	d3.select('#hardSphereButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',bw + m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', false)
		.classed('buttonHover', true)
		.on('click', hardSphereView)

	d3.select('#sliceButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',2.*bw + 2.*m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', false)
		.classed('buttonHover', true)
		.on('click', sliceView)

	d3.select('#sparseButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',0)
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonHover', true)
		.classed('buttonClicked', false)
		.on('click', sparseView)

	d3.select('#coordinationButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',bw + m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', false)
		.classed('buttonHover', true)
		.on('click',coordinationView)

	d3.select('#helpButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',2*bw + 2*m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', false)
		.classed('buttonHover', true)
		.on('click',showHelp)

	if (params.renderer != null){
		var width = parseFloat(params.container.style('width'));
		var height = parseFloat(params.container.style('width'));
		var aspect = width / height;
		params.camera.aspect = aspect;
		params.camera.updateProjectionMatrix();

		params.renderer.setSize( width, height);
	}
}


//this is called to start everything
function WebGLStart(){

//initialize everything
	init();

//define the tweens
	defineTweens();

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

