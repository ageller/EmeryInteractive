//all "global" variables are contained within params object
var params;
function defineParams(){
	params = new function() {

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
		this.defaultView = new THREE.Vector3(3.3,1.75,1.5);
		this.coordinationView = new THREE.Vector3(1.75,-3.3,1.5);
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

		//for coordination
		this.cylinderColor = "gray";
		this.cylinderRadialSegments = 32;
		this.cylinderheightSegments = 1;

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



		this.offsetPosition = new THREE.Vector3(this.size, this.size, this.size);


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

	//keyboard
    params.keyboard = new KeyboardState();

}

function defineTweens(){
	params.defaultViewTween = new TWEEN.Tween(params.camera.position).to(params.defaultView, params.tweenDuration).easing(TWEEN.Easing.Linear.None);
	params.coordinationViewTween = new TWEEN.Tween(params.camera.position).to(params.coordinationView, params.tweenDuration).easing(TWEEN.Easing.Linear.None);
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
function drawSphere(radius, widthSegments, heightSegments, opacity, color, position, visible = true){
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, 2.*Math.PI, 0, Math.PI)
	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:true,
		opacity:opacity, 
		visible:visible
		//shininess:50,
	});

	sphere = new THREE.Mesh( geometry, material );
	sphere.position.set(position.x, position.y, position.z)
	//update the vertices of the plane geometry so that I can check for the intersection -- not needed (and also breaks the sparse view)
	//https://stackoverflow.com/questions/23990354/how-to-update-vertices-geometry-after-rotate-or-move-object
	// sphere.updateMatrix();
	// sphere.geometry.applyMatrix( sphere.matrix );
	// sphere.matrix.identity();
	// sphere.position.set( 0, 0, 0 );
	// sphere.rotation.set( 0, 0, 0 );
	// sphere.scale.set( 1, 1, 1 );

	params.scene.add( sphere );
	
	return sphere;

}

//draw a cylinder
function drawCylinder(radius, height, radialSegments, heightSegments, color, position, rotation, visible = false){
	var geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments);

	var material = new THREE.MeshPhongMaterial( { 
		color: color, 
		flatShading: false, 
		transparent:false,
		visible:visible
	});

	cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.set(position.x, position.y, position.z)
	cylinder.rotation.set(rotation.x, rotation.y, rotation.z)

	params.scene.add( cylinder );
	
	return cylinder;
}

//draw the slice view
//https://jsfiddle.net/8uxw667m/4/
//https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane/42353447
function drawSlice(size, position, rotation, opacity, color){

	var pointsOfIntersection;
	var objs = [];
	var check = 0;

	function setPointOfIntersection(line, plane, minDistance) {
		var pointOfIntersection = new THREE.Vector3();
		plane.intersectLine(line, pointOfIntersection);
		//find the minimum distance so that I don't add so many points! (slows things down a bit here, but I think this is needed)
		var minD = minDistance*1000.;
		pointsOfIntersection.vertices.forEach(function(p,i){
			var d = pointOfIntersection.distanceTo(p)
			if (d < minD){
				minD = d;
			}
		})
		if (pointOfIntersection) {
			if (pointOfIntersection.distanceTo(new THREE.Vector3(0,0,0)) != 0  && minD > minDistance){//some failure mode for this at 0,0,0
				pointsOfIntersection.vertices.push(pointOfIntersection.clone());
				pointsOfIntersection.center.add(pointOfIntersection.clone());
			}
		};
	}


	function sortPoints(plane, obj){

		//get the center of the sphere
		var center = new THREE.Vector3();
		obj.geometry.computeBoundingBox();   
		obj.geometry.boundingBox.getCenter(center);
		obj.localToWorld( center );

		//get the normal of the plane
		var normal = plane.geometry.faces[0].normal;

		//populate the indices and also copy over the vertices so that I can resort them later
		var indices = [];
		var vertices = [];
		//also calculate the center for later (probably not the best way to do this)
		pointsOfIntersection.vertices.forEach(function(p,i){
			indices.push(i);
			vertices.push(p.clone());
		})

		//sort the indices
		indices.sort(function (i, j) { 
			//https://stackoverflow.com/questions/14370636/sorting-a-list-of-3d-coplanar-points-to-be-clockwise-or-counterclockwise
			var A = vertices[i].clone().sub(center);
			var B = vertices[j].clone().sub(center);
			var C = A.cross(B);
			return normal.dot(C)});

		//update the vertices
		var j = 0;
		indices.forEach(function(i,j){
			pointsOfIntersection.vertices[j].copy(vertices[i]);
		})
		//add the first point on to close the loop (need to do this twice for some reason)
		if (indices.length > 0){
			pointsOfIntersection.vertices.push(vertices[indices[0]]);
			pointsOfIntersection.vertices.push(vertices[indices[0]]);
			pointsOfIntersection.vertices.needsUpdate = true;
		}

		return center
	}

	function drawIntersectionPoints(plane, obj, minDistance) {
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
			setPointOfIntersection(lineAB, mathPlane, minDistance);
			setPointOfIntersection(lineBC, mathPlane, minDistance);
			setPointOfIntersection(lineCA, mathPlane, minDistance);
		});



		//sort the points around a object .
		sortPoints(plane, obj);
		
		if (pointsOfIntersection.vertices.length > 2){
			var lineMaterial = new THREE.LineBasicMaterial( { 
				color: "red",
				visible:false
			}) ;
			var line = new THREE.Line( pointsOfIntersection, lineMaterial );
			params.scene.add( line );
			objs.push(line);

			var N = pointsOfIntersection.vertices.length;
			pointsOfIntersection.center.divide(new THREE.Vector3(N,N,N));

			//in case we want to see the points
			// var pointsMaterial = new THREE.PointsMaterial({
			// 	size: 0.1,
			// 	color: "red"
			// });
			// var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
			// params.scene.add(points);

		}
  
	}

	////////////////////

	var geometry = new THREE.PlaneGeometry( size, size, 1 );
	var material = new THREE.MeshBasicMaterial( {
		color: color, 
		side: THREE.DoubleSide,
		transparent:true,
		opacity:opacity, 
		visible:false,
		depthTest:false,
		depthWrite:true,
	});


	var plane = new THREE.Mesh( geometry, material );
	plane.renderOrder = 1; //so that we see everything through it, regardless of camera location!
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
	plane.geometry.computeFaceNormals()
	var normal = plane.geometry.faces[0].normal;

	params.slicePlane = plane;
	params.slicePlanePosition = position;
	updateSlicePlaneDepth();

	params.scene.add( plane );

	params.spheres.forEach(function(m,i){ 

		//this is an interesting package, but doesn't seem to work well enough for our purposes
		// var planeBSP = new ThreeBSP(plane);
		// var sphereBSP = new ThreeBSP(m);
		// var intersectBSP = planeBSP.intersect(sphereBSP);
		// var mesh = intersectBSP.toMesh(material);
		// params.scene.add( mesh );


		var box = new THREE.Box3().setFromObject( m );
		var size = new THREE.Vector3();
		box.getSize(size);
		var minDistance = (size.x + size.y + size.z)/3.* 0.001;

		pointsOfIntersection = new THREE.Geometry();
		pointsOfIntersection.center = new THREE.Vector3(0,0,0);
		drawIntersectionPoints(plane, m, minDistance);

		if (pointsOfIntersection.vertices.length > 0){
			//add the objects that have any intersection
			//I will do this in two steps pieces
			//First: I will get a convex Geometry of the object.  This apparently doesn't look good right at the intersection
			// -- I will clean up the convex geometry by adjusting normals and removing the face that hits the plane
			//Second: I will draw a flat geometry at the surface of intersection
			//These will be combined into a single geometry that is then shown to the viewer
			//I don't know how easily this will work in another setup...


			//create a list of vertices for the intersection to use in convex geometry
			m.intersected = true;
			vertices = [];
			m.geometry.vertices.forEach(function(v){
				p = v.clone().add(m.position).sub(position)
				if (p.dot(normal) <= 0){
					vertices.push(v)
				}
			})

			pointsOfIntersection.vertices.forEach(function(v){
				vertices.push(v.clone().sub(m.position));
			})
			var gC = new THREE.ConvexGeometry( vertices );
			gC.computeVertexNormals();
			gC.computeFaceNormals();

			//some of these normals are not coming our correctly... I will try to fix that here
			//I will also delete the front face here
			toDelete = [];
			var n0 = new THREE.Vector3(0,0,0);
			gC.faces.forEach(function(f,i){
				//console.log(f.normal)
				var d = f.normal.dot(normal);
				if (d > (1 - 1e-4)){ //delete the front face
					toDelete.push(i);
				}
				var vA = gC.vertices[f.a].clone();
				var vB = gC.vertices[f.b].clone();
				var vC = gC.vertices[f.c].clone();

				f.vertexNormals.forEach(function(n,j){
					//find the minimum distance to the intersection surface (slows things down a bit here, but I think this is needed)
					var minD = minDistance*1000.;
					pointsOfIntersection.vertices.forEach(function(p,k){
						p0 = p.clone().sub(m.position);
						var dA = vA.distanceTo(p0);
						var dB = vB.distanceTo(p0);
						var dC = vC.distanceTo(p0);
						var d = Math.min(dC, Math.min(dA,dB));
						if (d < minD){
							minD = d;
						}
					})
					var d = n.dot(normal);
					if (d > 0. && minD < minDistance*1e-4){
						gC.faces[i].vertexNormals[j].copy(n0);
					}
				})

			})
			toDelete.forEach(function(i){
				delete gC.faces[i];
			})
			gC.faces = gC.faces.filter( function(v) { return v; });
			gC.elementsNeedUpdate = true; // update faces
			gC.normalsNeedUpdate = true;

			//create a surface using the pointsOfIntersection and drawing triangles
			//get the center

			var gF = new THREE.Geometry();
			gF.vertices.push(pointsOfIntersection.vertices[0].clone().sub(m.position));
			pointsOfIntersection.vertices.forEach(function(v,i){
				if (i > 0){
					gF.vertices.push(pointsOfIntersection.center.clone().sub(m.position));
					gF.vertices.push(pointsOfIntersection.vertices[i].clone().sub(m.position));
				}
				offset = i * 2;
				if (2+offset < 2*pointsOfIntersection.vertices.length){
					gF.faces.push(new THREE.Face3(0 + offset, 1 + offset, 2 + offset));
				}
			})
			gF.computeVertexNormals();

			//combine these into a single geometry
			var singleGeometry = new THREE.Geometry();

			var mesh = new THREE.Mesh(gC)
			mesh.updateMatrix();
			singleGeometry.merge(mesh.geometry, mesh.matrix);

			mesh = new THREE.Mesh(gF)
			mesh.updateMatrix();
			singleGeometry.merge(mesh.geometry, mesh.matrix);


			mesh = new THREE.Mesh(singleGeometry, m.material.clone());

			mesh.position.set(m.position.x, m.position.y, m.position.z)
			mesh.rotation.set(m.rotation.x, m.rotation.y, m.rotation.z)
			mesh.material.opacity = params.hardOpacity;
			//mesh.material.wireframe = true;
			mesh.material.visible = false;
			mesh.side = THREE.DoubleSide;
			params.scene.add(mesh)
			objs.push(mesh)

			//to see the normals
			//var helper = new THREE.VertexNormalsHelper( mesh, 0.1, "red", 1 );
			//var helper = new THREE.FaceNormalsHelper( mesh, 0.1, "red", 1 );
			//params.scene.add(helper)


		} else {
			//those that don't (and only take those behind plane)
			var p = m.position.clone().sub(position)
			if (p.dot(normal) < 0){
				m.intersected = false;
				var mesh = new THREE.Mesh(m.geometry.clone(), m.material.clone());
				mesh.material.opacity = params.hardOpacity;
				mesh.material.visible = false;
				mesh.position.set(m.position.x, m.position.y, m.position.z)
				mesh.rotation.set(m.rotation.x, m.rotation.y, m.rotation.z)
				params.scene.add(mesh)
				objs.push(mesh)
			}
		}
	});


	return {
		"plane":plane,
		"mesh":objs,
	}

}

//draw the outside box with axes
function drawBox(){
	var geometry = new THREE.BoxBufferGeometry( params.size, params.size, params.size);

	var edges = new THREE.EdgesGeometry( geometry );
	var material = new THREE.LineBasicMaterial( {color: 0x000000} )
	var line = new THREE.LineSegments( edges,  material);
	line.position.set(params.size/2, params.size/2., params.size/2.);
	params.scene.add( line );

	//The X axis is orange. The Y axis is green. The Z axis is blue.
	var cubeAxis = new THREE.AxesHelper(1.5*params.size);
	cubeAxis.position.set(0,0,0);
	params.scene.add( cubeAxis );

	//add cones to the tops of the axes (for emphasis) -- matching the colors for the axes
	var gX = new THREE.ConeGeometry( params.size/30., params.size/10., 16, 1 );
	var mX = new THREE.MeshBasicMaterial( {color: new THREE.Color(1, 0.6, 0)} );
	var cX = new THREE.Mesh( gX, mX );
	cX.position.set(1.5*params.size, 0, 0);
	cX.rotation.set(0, 0, -Math.PI/2);
	params.scene.add( cX );

	var gY = new THREE.ConeGeometry( params.size/30., params.size/10., 16, 1 );
	var mY = new THREE.MeshBasicMaterial( {color: new THREE.Color(0.6, 1, 0)} );
	var cY = new THREE.Mesh( gY, mY );
	cY.position.set(0, 1.5*params.size, 0);
	cY.rotation.set(0, 0, 0);
	params.scene.add( cY );

	var gZ = new THREE.ConeGeometry( params.size/30., params.size/10., 16, 1 );
	var mZ = new THREE.MeshBasicMaterial( {color: new THREE.Color(0, 0.6, 1)} );
	var cZ = new THREE.Mesh( gZ, mZ );
	cZ.position.set(0, 0, 1.5*params.size);
	cZ.rotation.set(Math.PI/2, 0, 0);
	params.scene.add( cZ );
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

//for the slice, in case we want to change it dynamically
function updateSlice(p,r){

	params.sliceMesh.forEach(function(m){
		params.scene.remove(m);
	})
	params.sliceMesh = [];

	var slice = drawSlice(2.*params.size, p, r, params.sliceOpacity, params.sliceColor);
	params.sliceMesh.push(slice.plane);
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

function drawMainSpheres(){
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

}

function drawCoordination(){
	var radius = params.size*Math.sqrt(2)/4.*params.sparseScale;

	//spheres
	//corner
	var p1  = new THREE.Vector3(0, 				0, 				0);

	//middle "ring"
	var p2 = new THREE.Vector3(params.size/2.,	params.size/2.,	0);
	var p3 = new THREE.Vector3(-params.size/2.,	params.size/2.,	0);
	var p4 = new THREE.Vector3(-params.size/2.,	-params.size/2.,	0);
	var p5 = new THREE.Vector3(params.size/2.,	-params.size/2.,	0);

	//top "ring"
	var p6 = new THREE.Vector3(params.size/2.,	0,				params.size/2.);
	var p7 = new THREE.Vector3(0,				params.size/2.,	params.size/2.);
	var p8 = new THREE.Vector3(-params.size/2.,	0,				params.size/2.);
	var p9 = new THREE.Vector3(0,				-params.size/2.,params.size/2.);

	//bottom "ring"
	var p10 = new THREE.Vector3(params.size/2.,	0,				-params.size/2.);
	var p11 = new THREE.Vector3(0,				params.size/2.,	-params.size/2.);
	var p12 = new THREE.Vector3(-params.size/2.,0,				-params.size/2.);
	var p13 = new THREE.Vector3(0,				-params.size/2.,-params.size/2.);


	var allP = [p1, p2,p3,p4,p5, p6,p7,p8,p9, p10,p11,p12,p13]
	allP.forEach(function(p){
		var mesh = drawSphere(radius, params.sphereSegments, params.sphereSegments, params.hardOpacity, params.sphereColor, p, false);
		params.coordination.push(mesh);
	});

	//cylinders
	//positions
	var n = new THREE.Vector3(2,2,2);
	var p1to2 = p2.clone().sub(p1).divide(n);
	var p1to3 = p3.clone().sub(p1).divide(n);
	var p1to4 = p4.clone().sub(p1).divide(n);
	var p1to5 = p5.clone().sub(p1).divide(n);

	var p1to6 = p6.clone().sub(p1).divide(n);
	var p1to7 = p7.clone().sub(p1).divide(n);
	var p1to8 = p8.clone().sub(p1).divide(n);
	var p1to9 = p9.clone().sub(p1).divide(n);

	var p1to10 = p10.clone().sub(p1).divide(n);
	var p1to11 = p11.clone().sub(p1).divide(n);
	var p1to12 = p12.clone().sub(p1).divide(n);
	var p1to13 = p13.clone().sub(p1).divide(n);

	//lengths
	var h1to2 = p1.clone().sub(p2).length();
	var h1to3 = p1.clone().sub(p3).length();
	var h1to4 = p1.clone().sub(p4).length();
	var h1to5 = p1.clone().sub(p5).length();

	var h1to6 = p1.clone().sub(p6).length();
	var h1to7 = p1.clone().sub(p7).length();
	var h1to8 = p1.clone().sub(p8).length();
	var h1to9 = p1.clone().sub(p9).length();

	var h1to10 = p1.clone().sub(p10).length();
	var h1to11 = p1.clone().sub(p11).length();
	var h1to12 = p1.clone().sub(p12).length();
	var h1to13 = p1.clone().sub(p13).length();


	//rotation (not sure what the algorithm is here...)
	var r1to2 = new THREE.Vector3(0, 0, -Math.atan2(p2.y, p2.x));
	var r1to3 = new THREE.Vector3(0, 0, -Math.atan2(p3.y, p3.x));
	var r1to4 = new THREE.Vector3(0, 0, -Math.atan2(p4.y, p4.x));
	var r1to5 = new THREE.Vector3(0, 0, -Math.atan2(p5.y, p5.x));

	var r1to6 = new THREE.Vector3(0, 						-Math.acos(p6.z/h1to6), 2.*Math.acos(p6.z/h1to6));
	var r1to7 = new THREE.Vector3(Math.acos(p6.z/h1to6), 	-Math.acos(p7.z/h1to7), 0);
	var r1to8 = new THREE.Vector3(0,						Math.acos(p8.z/h1to8), 	2.*Math.acos(p8.z/h1to8));
	var r1to9 = new THREE.Vector3(-Math.acos(p9.z/h1to9), 	0, 						0);

	var r1to10 = new THREE.Vector3(0, 						Math.acos(p6.z/h1to6), 2.*Math.acos(p6.z/h1to6));
	var r1to11 = new THREE.Vector3(-Math.acos(p6.z/h1to6), 	Math.acos(p7.z/h1to7), 0);
	var r1to12 = new THREE.Vector3(0,						-Math.acos(p8.z/h1to8), 	2.*Math.acos(p8.z/h1to8));
	var r1to13 = new THREE.Vector3(Math.acos(p9.z/h1to9), 	0, 						0);

	var allP = [p1to2,p1to3,p1to4,p1to5, p1to6,p1to7,p1to8,p1to9, p1to10,p1to11,p1to12,p1to13]
	var allR = [r1to2,r1to3,r1to4,r1to5, r1to6,r1to7,r1to8,r1to9, r1to10,r1to11,r1to12,r1to13]
	var allH = [h1to2,h1to3,h1to4,h1to5, h1to6,h1to7,h1to8,h1to9, h1to10,h1to11,h1to12,h1to13]
	allP.forEach(function(p,i){
		var mesh = drawCylinder(radius/4., allH[i], params.cylinderRadialSegments, params.cylinderHeightSegments, params.cylinderColor, allP[i], allR[i]);
		params.coordination.push(mesh);
	});
}


//draw the scene (with lighting)
function drawScene(){

	//draw the main spheres (for default, hard-Sphere and Sparse views)
	drawMainSpheres();

	//draw the slice view (updateSlice calls drawSlice -- written this way to facilitate dynamic updating of slice mesh)
	updateSlice(params.slicePlanePosition, params.slicePlaneRotation);

	//draw the coordinate view
	drawCoordination();

	//draw the box with axes
	drawBox();

	//lights
	addLights()


}

//this is the animation loop
function animate(time) {
	requestAnimationFrame( animate );
	params.controls.update();
    params.keyboard.update();
	TWEEN.update(time);


	if (params.keyboard.down("C")){
		console.log(params.camera.position)
	}

	//testing dynamically updating the slice location
	if (params.isSlice){

		//check location of slice plane for blending
		updateSlicePlaneDepth();

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

//helpers for buttons
function showHemiSpheres(bool){
	params.hemiSpheres.forEach(function(m){
		m.material.visible = bool;
	})
}
function showSpheres(bool){
	params.spheres.forEach(function(m){
		m.material.visible = bool;
	})
}
function showSliceMesh(bool){
	params.sliceMesh.forEach(function(m){
		m.material.visible = bool;
	})
}
function showCoordination(bool){
	params.coordination.forEach(function(m){
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

	showSliceMesh(false);
	showCoordination(false);
	if (params.isSparse){
		changeSphereScale(1./params.sparseScale);
		params.isSparse = false;
	}
	params.isSlice = false;

	showHemiSpheres(true);
	showSpheres(true);
	changeSphereOpacity(params.defaultOuterOpacity);


	params.defaultViewTween.start();

}

function hardSphereView(){
	console.log('hard-sphere model');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#hardSphereButton').classed('buttonClicked', true);
	d3.selectAll('#hardSphereButton').classed('buttonHover', false);

	showHemiSpheres(false);
	showCoordination(false);
	showSliceMesh(false);
	if (params.isSparse){
		changeSphereScale(1./params.sparseScale);
		params.isSparse = false;
	}
	params.isSlice = false;

	showSpheres(true);
	changeSphereOpacity(params.hardOpacity);

	params.defaultViewTween.start();
}

function sliceView(){
	console.log('slice');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);;
	d3.selectAll('#sliceButton').classed('buttonClicked', true);
	d3.selectAll('#sliceButton').classed('buttonHover', false);

	showHemiSpheres(false);
	showSpheres(false);
	showCoordination(false);

	showSliceMesh(true);
	params.isSlice = true;

	params.defaultViewTween.start();
}

function sparseView(){
	console.log('sparse model');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#sparseButton').classed('buttonClicked', true);
	d3.selectAll('#sparseButton').classed('buttonHover', false);

	showHemiSpheres(false);
	showSliceMesh(false);
	showCoordination(false);

	if (!params.isSparse){
		changeSphereScale(params.sparseScale);
		params.isSparse = true;
	}
	showSpheres(true);
	changeSphereOpacity(params.hardOpacity);

	params.isSlice = false;

	params.defaultViewTween.start();
}

function coordinationView(){
	console.log('coordination');
	d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#coordinationButton').classed('buttonClicked', true);
	d3.selectAll('#coordinationButton').classed('buttonHover', false);

	showHemiSpheres(false);
	showSpheres(false);
	showSliceMesh(false);

	showCoordination(true);

	params.isSlice = false;

	params.coordinationViewTween.start();
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

