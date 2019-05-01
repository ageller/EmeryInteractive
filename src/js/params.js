//all "global" variables are contained within params object

var params;
function defineParams(){
	params = new function() {

		//these hold the main three.js objects
		this.container = null;
		this.renderer = null;
		this.scene = null;
		this.camera = null;
		this.keyboard = null;

		//for frustum      
		this.zmax = 5.e10;
		this.zmin = 1;
		this.fov = 45.

		//camera view (and tween)
		this.defaultView = new THREE.Vector3(3.65,1.95,1.66);
		this.coordinationView = new THREE.Vector3(1.95,-3.65,1.66);
		this.defaultViewTween;
		this.coordinationViewTween;

		//will hold all the outer spheres
		this.spheres = [];
		this.hemiSpheres = [];
		this.coordination = [];

		//will hold items for slice view
		this.sliceMesh = [];
		this.slicePlane;

		//size of objects in viewer
		this.size = 1;

		//sphere settings
		this.sphereSegments = 32;
		this.defaultOuterOpacity = 0.12;
		this.defaultInnerOpacity = 0.7;
		this.hardOpacity = 0.95;
		this.sphereColor = 0x228B22;

		//for slice
		this.sliceColor = 0xAFEEEE;
		this.sliceOpacity = 0.7;
		this.isSlice = false;
		this.xPfac = this.size;//testing dynamic slicing
		this.yRfac = Math.PI/2.;//testing dynamic slicing
		this.slicePlanePosition = new THREE.Vector3(this.xPfac, this.size/2., this.size/2.); 
		this.slicePlaneRotation = new THREE.Vector3(0, this.yRfac, 0); 

		//for clicking
		this.highlightColor = 0xFF6347;

		//for coordination
		this.cylinderColor = "gray";
		this.cylinderRadialSegments = 32;
		this.cylinderheightSegments = 1;

		//size of the sparse model
		this.sparseScale = 0.2;
		this.isSparse = false;

		//the number of ms for the tween
		this.tweenDuration = 500;

		//canvas
		this.aspect = 1; //desired aspect ratio of viewer
		this.canvasFrac = 0.5; //maximum fraction of window space for canvas
		this.canvasMinWidth = 380; //minimum width of canvas, in pixels
		this.textMinWidth = 200; //minimum width of text, in pixels

		//will hold the lights
		this.lights = [];

		//for text
		this.fontFile = 'src/lib/helvetiker_regular.typeface.json';
		//this.fontFile = 'lib/gentilis_regular.typeface.json';
		this.text = [];
		this.labels = [];

		this.offsetPosition = new THREE.Vector3(this.size, this.size, this.size);

		//for tooltips
		this.ttMeshIndex = [];
		this.showingCoordiation = false; //won't allow tooltips in coordination view

		//for help screen
		this.transition = d3.transition().duration(1000);
		this.helpOpacity = 0.7;

	};


}

