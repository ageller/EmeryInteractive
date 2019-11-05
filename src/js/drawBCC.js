//this contains all functions needed to draw the different views.  Ideally this will be defined from an input file.

function drawMainSpheres(){
	//used for the default view, hard sphere view, and sparse view

	var radius = params.size*Math.sqrt(3)/4;

	//draw the full spheres (this should be from an input file)
	//corners
	var p1  = new THREE.Vector3(0, 				0, 				0);
	var p2  = new THREE.Vector3(params.size, 	0, 				0);
	var p3  = new THREE.Vector3(0, 				params.size, 	0);
	var p4  = new THREE.Vector3(params.size, 	params.size, 	0);
	var p5  = new THREE.Vector3(0, 				0,				params.size);
	var p6  = new THREE.Vector3(params.size, 	0, 				params.size);
	var p7  = new THREE.Vector3(0, 				params.size, 	params.size);
	var p8  = new THREE.Vector3(params.size,	params.size, 	params.size);

	var allP = [p1,p2,p3,p4,p5,p6,p7,p8]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultOuterOpacity, params.sphereColor, p, params.showAtoms, 'Atoms');
		params.spheres.push(mesh);
	})

	//center at center
	var p9  = new THREE.Vector3(params.size/2,	params.size/2,	params.size/2);
	var allP = [p9]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultInnerOpacity, params.sphereColor, p, params.showAtoms, 'Atoms');
		params.spheres.push(mesh);
	})
	

	//Quarter spheres
	var r1 = new THREE.Vector3(0,				Math.PI/2.,		0); 
	var r2 = new THREE.Vector3(0,				0,				0); 
	var r3 = new THREE.Vector3(Math.PI/2.,		Math.PI/2.,		0);  
	var r4 = new THREE.Vector3(Math.PI/2.,		0,				0);
	var r5 = new THREE.Vector3(0,				Math.PI/2.,		-Math.PI/2.); 
	var r6 = new THREE.Vector3(0,				-Math.PI/2.,	0);
	var r7 = new THREE.Vector3(Math.PI/2.,		0,				Math.PI);  
	var r8 = new THREE.Vector3(Math.PI,		    0,				0);
	allP = [p1,p2,p3,p4,p5,p6,p7,p8]
	allR = [r1,r2,r3,r4,r5,r6,r7,r8]
	allP.forEach(function(p, i){
		var mesh = drawQuarterSphere(radius, params.sphereSegments, params.sphereSegments, params.defaultInnerOpacity, params.sphereColor, p, allR[i], params.showAtoms, 'Atoms');
		params.hemiSpheres.push(mesh);
	})

}


function drawOctahedral(){
	//interstitial octahedral sites, touch 6 atoms

	var radius = params.size*Math.sqrt(3)/4.*0.155; 

	//draw the full spheres (this should be from an input file)
	//-Face Center- 
	var p1  = new THREE.Vector3(params.size/2., params.size/2., 0);
	var p2  = new THREE.Vector3(params.size/2., 0, 				params.size/2.);
	var p3  = new THREE.Vector3(0, 				params.size/2.,	params.size/2.);
	var p4  = new THREE.Vector3(params.size, 	params.size/2.,	params.size/2.);
	var p5  = new THREE.Vector3(params.size/2., params.size,	params.size/2.);
	var p6  = new THREE.Vector3(params.size/2., params.size/2.,	params.size);

	//-Edge Center-
	var p7  = new THREE.Vector3(params.size/2.,	0, 				0.);
	var p8  = new THREE.Vector3(0, 				params.size/2.,	0.);
	var p9  = new THREE.Vector3(params.size/2.,	params.size,	0.);
	var p10 = new THREE.Vector3(params.size,	params.size/2., 0.);
	var p11 = new THREE.Vector3(0, 				0.,				params.size/2.);
	var p12 = new THREE.Vector3(params.size, 	0.,				params.size/2.);
	var p13 = new THREE.Vector3(0.,				params.size,	params.size/2.);
	var p14 = new THREE.Vector3(params.size,	params.size,	params.size/2.);
	var p15 = new THREE.Vector3(params.size/2.,	0.,				params.size);
	var p16 = new THREE.Vector3(0.,				params.size/2.,	params.size);
	var p17 = new THREE.Vector3(params.size/2.,	params.size,	params.size);
	var p18 = new THREE.Vector3(params.size,	params.size/2.,	params.size);

	var allP = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.hardOpacity, params.octahedralColor, p, params.showOctahedrals, 'Octahedrals');
		params.spheres.push(mesh);
	})
}

function drawTetrahedral(){
	//interstitial tetrahedral sites, touch 4 atoms
	var radius = params.size*Math.sqrt(3)/4.*0.29; 

	//draw the full spheres (this should be from an input file)
	//-On faces-

	var p1  = new THREE.Vector3(0.,   			  params.size/4.,     params.size/2.);
	var p2  = new THREE.Vector3(0.,   			  params.size/2.,     params.size/4.);
	var p3  = new THREE.Vector3(0.,   			  params.size/2.,     params.size*3/4.);
	var p4  = new THREE.Vector3(0.,   			  params.size*3/4.,   params.size/2.);

	var p5  = new THREE.Vector3(params.size, 	  params.size/4.,     params.size/2.);
	var p6  = new THREE.Vector3(params.size, 	  params.size/2.,     params.size/4.);
	var p7  = new THREE.Vector3(params.size, 	  params.size/2.,     params.size*3/4.);
	var p8  = new THREE.Vector3(params.size, 	  params.size*3./4.,  params.size/2.);

	var p9  = new THREE.Vector3(params.size/4.,   0.,     			  params.size/2.);
	var p10 = new THREE.Vector3(params.size/2.,   0.,   			  params.size/4.);
	var p11 = new THREE.Vector3(params.size/2.,   0.,   			  params.size*3/4.);
	var p12 = new THREE.Vector3(params.size*3/4., 0.,     			  params.size/2.);

	var p13 = new THREE.Vector3(params.size/4.,   params.size,     	  params.size/2.);
	var p14 = new THREE.Vector3(params.size/2.,   params.size,   	  params.size/4.);
	var p15 = new THREE.Vector3(params.size/2.,   params.size,   	  params.size*3/4.);
	var p16 = new THREE.Vector3(params.size*3/4., params.size,     	  params.size/2.);

	var p17 = new THREE.Vector3(params.size/4.,   params.size/2.,     0.);
	var p18 = new THREE.Vector3(params.size/2.,   params.size/4.,     0.);
	var p19 = new THREE.Vector3(params.size/2.,   params.size*3/4.,   0.);
	var p20 = new THREE.Vector3(params.size*3/4., params.size/2.,     0.);

	var p21 = new THREE.Vector3(params.size/4.,   params.size/2.,     params.size);
	var p22 = new THREE.Vector3(params.size/2.,   params.size/4.,     params.size);
	var p23 = new THREE.Vector3(params.size/2.,   params.size*3/4.,   params.size);
	var p24 = new THREE.Vector3(params.size*3/4., params.size/2.,     params.size);

	var allP = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23,p24]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.hardOpacity, params.tetrahedralColor, p, params.showTetrahedrals, 'Tetrahedrals');
		params.spheres.push(mesh);
	})
}

function addLights(){
	//define lights
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

}
