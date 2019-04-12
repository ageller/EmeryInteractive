//define the two tweens for the different views
function defineTweens(){
	params.defaultViewTween = new TWEEN.Tween(params.camera.position)
		.to(params.defaultView, params.tweenDuration)
		.easing(TWEEN.Easing.Linear.None);


	params.coordinationViewTween = new TWEEN.Tween(params.camera.position)
		.to(params.coordinationView, params.tweenDuration)
		.easing(TWEEN.Easing.Linear.None);
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

	//keyboard
    params.keyboard = new KeyboardState();

	//define the tweens
	defineTweens();

}
