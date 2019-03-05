//all "global" variables are contained within params object
var params;
function defineParams(){
	params = new function() {

		this.container = null;
		this.renderer = null;
		this.scene = null;

		//for frustum      
		this.zmax = 5.e10;
		this.zmin = 1;
		this.fov = 45.

		//canvas
		this.aspect = 1; //desired aspect ratio of viewer
		this.canvasFrac = 0.5; //maximum fraction of window space for canvas
		this.canvasMinWidth = 380; //minimum width of canvas, in pixels
		this.textMinWidth = 380; //minimum width of text, in pixels

		this.lights = [];

		//for sphere
		this.sphere = null
		this.radius = 5.;
		this.widthSegments = 32;
		this.heightSegments = 32;
		this.phiStart = 0;
		this.phiLength = 2.*Math.PI;
		this.thetaStart = 0;
		this.thetaLength = Math.PI;
		this.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

		this.drawSphere = function(){
			//sphere geometry
			if (params.sphere != null){
				params.scene.remove(params.sphere);
			}
			var geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments, params.phiStart, params.phiLength, params.thetaStart, params.thetaLength)
			params.sphere = new THREE.Mesh( geometry, params.material );
			params.scene.add( params.sphere );
		}
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
	params.camera.up.set(0, -1, 0);
	params.camera.position.z = 30;
	params.scene.add(params.camera);  

	//controls
	params.controls = new THREE.TrackballControls( params.camera, params.renderer.domElement );
	params.controls.addEventListener( 'change', updateLights );
}


//this will draw the scene (with lighting)
function drawScene(){

	//draw the sphere
	params.material = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true } );
	params.drawSphere();

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
}

//functions attached to buttons
function defaultView(){
	console.log('default view')
}

function hardSphereView(){
	console.log('hard-sphere model')
}

function sliceView(){
	console.log('slice')
}

function sparseView(){
	console.log('sparse model')
}

function coordinationView(){
	console.log('coordination')
}

function showHelp(){
	console.log('help')
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
		.on('click', defaultView)

	d3.select('#hardSphereButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',bw + m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.on('click', hardSphereView)

	d3.select('#sliceButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',2.*bw + 2.*m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.on('click', sliceView)

	d3.select('#sparseButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',0)
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.on('click', sparseView)

	d3.select('#coordinationButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',bw + m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.on('click',coordinationView)

	d3.select('#helpButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',2*bw + 2*m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.on('click',showHelp)
}


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

