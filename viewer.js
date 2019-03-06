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

		//the default opacity of the full spheres
		this.defaultOpacity = 0.3;
		this.hardOpacity = 0.95;
		this.sphereColor = 0x228B22;

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

		this.sphereSegments = 32;
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
	params.controls.addEventListener( 'change', updateLights );
	//params.controls.addEventListener( 'change', function(){console.log(params.camera.position) });
}

function defineTweens(){
	params.defaultViewTween = new TWEEN.Tween(params.camera.position).to(params.defaultView, params.tweenDuration).easing(TWEEN.Easing.Linear.None);
}

//from https://stackoverflow.com/questions/30245990/how-to-merge-two-geometries-or-meshes-using-three-js-r71
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
//this draws the Sphere
function drawSphere(radius, widthSegments, heightSegments, opacity, color, position){
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, 2.*Math.PI, 0, Math.PI)
	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:true,
		opacity:opacity, 
	});

	sphere = new THREE.Mesh( geometry, material );
	sphere.position.set(position.x, position.y, position.z)
	params.scene.add( sphere );
	
	return sphere;

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

//this will draw the scene (with lighting)
function drawScene(){

	var r = params.size*Math.sqrt(2)/4.

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
		var mesh = drawSphere(r, params.sphereSegments, params.sphereSegments, params.defaultOpacity, params.sphereColor, p);
		params.spheres.push(mesh);
	})
	
	var r9 = new THREE.Vector3(0,				Math.PI/2.,		0);
	var r10 = new THREE.Vector3(-Math.PI/2.,	0,				0);
	var r11 = new THREE.Vector3(0, 				0,				0);
	var r12 = new THREE.Vector3(0, 				-Math.PI/2.,	0);
	var r13 = new THREE.Vector3(Math.PI/2., 	0, 				0);
	var r14 = new THREE.Vector3(Math.PI,		0,			0);

	allP = [p9,p10,p11,p12,p13,p14]
	var allR = [r9,r10,r11,r12,r13,r14]
	allP.forEach(function(p, i){
		var mesh = drawHalfSphere(r, params.sphereSegments, params.sphereSegments, params.hardOpacity, params.sphereColor, p, allR[i]);
		params.hemiSpheres.push(mesh);
	})


	//draw the box
	drawBox();

	//lights
	params.lights = [];
	params.lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
	// lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	// lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

	//lights[0].position.set( 0, 200, 0 );
	params.lights[0].position.copy(params.camera.position );
	// lights[ 1 ].position.set( 100, 200, 100 );
	// lights[ 2 ].position.set( - 100, - 200, - 100 );

	params.lights.forEach(function(element){
		params.scene.add(element);
	})


}
function updateLights(){
	params.lights.forEach(function(element){
		element.position.copy(params.camera.position );
	});
}
//this is the animation loop
function animate(time) {
	requestAnimationFrame( animate );
	params.controls.update();
	params.renderer.render( params.scene, params.camera );
	TWEEN.update(time);
}

//functions attached to buttons
function defaultView(){
	console.log('default view');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#resetButton').classed('buttonClicked', true);
	d3.selectAll('#resetButton').classed('buttonHover', false);
	params.hemiSpheres.forEach(function(m){
		m.material.visible = true;
	})
	params.spheres.forEach(function(m){
		m.material.opacity = params.defaultOpacity;
	})
	if (params.isSparse){
		params.spheres.forEach(function(m){
			m.geometry.scale(1./params.sparseScale, 1./params.sparseScale, 1./params.sparseScale);
		})	
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
	params.hemiSpheres.forEach(function(m){
		m.material.visible = false;
	})
	params.spheres.forEach(function(m){
		m.material.opacity = params.hardOpacity;
	})
	if (params.isSparse){
		params.spheres.forEach(function(m){
			m.geometry.scale(1./params.sparseScale, 1./params.sparseScale, 1./params.sparseScale);
		})	
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

	params.defaultViewTween.start();
}

function sparseView(){
	console.log('sparse model');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#sparseButton').classed('buttonClicked', true);
	d3.selectAll('#sparseButton').classed('buttonHover', false);
	params.hemiSpheres.forEach(function(m){
		m.material.visible = false;
	})
	params.spheres.forEach(function(m){
		m.material.opacity = params.hardOpacity;
	})
	if (!params.isSparse){
		params.spheres.forEach(function(m){
			m.geometry.scale(params.sparseScale, params.sparseScale, params.sparseScale);
		})
	}
	params.isSparse = true;

	params.defaultViewTween.start();
}

function coordinationView(){
	console.log('coordination');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#coordinationButton').classed('buttonClicked', true);
	d3.selectAll('#coordinationButton').classed('buttonHover', false);

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

