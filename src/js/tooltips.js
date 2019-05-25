//this file contains all the functions related to the tooltips (launched from double clicking)

function createTooltip(loc, meshArray=params.spheres){
	//create an individual tooltip showing the location of the selected sphere

	var tt = d3.select('body').append('div')
		.attr('id','tooltip'+loc)
		.attr('class','tooltip')
		.style('font-size','20px')
		.style('display','block')
		.style('opacity',1)
	tt.append('span')
		.attr('id','tootltipClose')
		.attr('class','close buttonHover')
		.html('&times;')
		.on('click',function(){
			highlightSphere(false, loc);
			if (params.isSlice){ //this is not efficient, but is the easiest way to get the correct colors for the slice spheres
				params.doSliceUpdate = true;
			}
		});

	var mesh = meshArray[loc];
	tt.append('span')
		.attr('class','tooltipContent')
		.text("x="+mesh.position.x+" y="+mesh.position.y+" z="+mesh.position.z);


}
function getClickedMesh(pageX, pageY, meshArray=params.spheres){
	// for finding the sphere based on the mouse click location

	var mpos = new THREE.Vector3(pageX,pageY, 0)
	var meshPos = new THREE.Vector3(0,0, 0)
	var dist = 1e100;
	var mesPos;
	var index = 0;
	meshArray.forEach(function(p,i){
		pos = screenXY(p)
		var tdist = mpos.distanceTo(pos); //need to add on depth?
		if (tdist < dist){ 
			dist = tdist
			meshPos = pos; 
			index = i;
		}
	});

	return {"index":index,
			"meshPos":meshPos
			};

}

function moveTooltip(meshIndex, offset=10, meshArray=params.spheres){
	//move a tooltip (when the user changes the camera location)

	var tt = d3.select('#tooltip'+meshIndex)
	var mesh = meshArray[meshIndex];

	pos = screenXY(mesh);
	tt.style("top",pos.y+offset )
	tt.style("left", pos.x+offset );

}
function highlightSphere(show, loc, meshArray=params.spheres){
	//turn on/off the highlighting of a selected sphere (change color, add box)

	var color = params.sphereColor;
	var boxName = "sphereBox"+loc;
	if (show){
		color = params.highlightColor;
		var test = params.scene.getObjectByName(boxName);
		if (test == null){
			var box = new THREE.Box3().setFromObject( meshArray[loc] );
			var helper = new THREE.Box3Helper( box, params.highlightColor );
			helper.name = boxName;
			params.scene.add( helper );
		}
	} else {
		params.scene.remove( params.scene.getObjectByName(boxName) ); //remove the box
		params.ttMeshIndex.splice(params.ttMeshIndex.indexOf(loc),1); //remove the value from the ttMeshIndex array
		d3.select('#tooltip'+loc).remove(); //remove the tooltip
		params.scene.remove( params.scene.getObjectByName('ttArrow') ); //remove any arrow 
		params.scene.remove( params.scene.getObjectByName('ttPlane') ); //remove any arrow 
		if (params.ttMeshIndex.length == 2){//draw back an arrow if we've removed a plane
			drawTTarrow();
		}		

	}
	meshArray[loc].material.color.setHex(color);

}

function drawTTarrow(meshArray=params.spheres){
	//draw an arrow to connect 2 selected spheres
	//https://stackoverflow.com/questions/26714230/draw-arrow-helper-along-three-line-or-two-vectors

	var from = meshArray[params.ttMeshIndex[0]].position.clone();
	var to = meshArray[params.ttMeshIndex[1]].position.clone();
	var direction = to.sub(from);
	var length = direction.length();
	var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, params.highlightColor, params.size/10., params.size/10. );
	arrowHelper.name = 'ttArrow'
	params.scene.add( arrowHelper );
}


function drawTTplane(meshArray=params.spheres){
	//draw a plane to connect 3 selected spheres
	//see info here: https://github.com/mrdoob/three.js/issues/5312
	//https://stackoverflow.com/questions/40366339/three-js-planegeometry-from-math-plane

	var p1 = meshArray[params.ttMeshIndex[0]].position.clone();
	var p2 = meshArray[params.ttMeshIndex[1]].position.clone();
	var p3 = meshArray[params.ttMeshIndex[2]].position.clone();
	//trying to avoid issues when it doesn't get the plane correct (when you click on a corner and the normal is the same direction)
	p1.addScalar(1e-4);
	p2.addScalar(1e-4);
	p3.addScalar(1e-4);
	var plane = new THREE.Plane().setFromCoplanarPoints(p1, p2, p3);

	// Create a basic  geometry
	var geometry = new THREE.PlaneGeometry( 3.*params.size, 3.*params.size, 1 );
	var material = new THREE.MeshBasicMaterial( {
		color: params.highlightColor, 
		side: THREE.DoubleSide,
	});

	// Align the geometry to the plane
	var coplanarPoint = new THREE.Vector3();
	plane.coplanarPoint(coplanarPoint); //this fails when focalPoint == 0,0,0
	var focalPoint = new THREE.Vector3().copy(coplanarPoint).add(plane.normal);
	// geometry.lookAt(focalPoint);
	// geometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);
	//console.log("plane",params.ttMeshIndex,p1, p2, p3, coplanarPoint, plane.normal, focalPoint)

	// Create mesh with the geometry
	var planeMesh = new THREE.Mesh(geometry, material);
	planeMesh.translateOnAxis(coplanarPoint.clone().normalize(), coplanarPoint.length());
	planeMesh.lookAt(focalPoint);
	planeMesh.name = 'ttPlane';
	params.scene.add(planeMesh);

	//update the slice plane to be the same
	params.slicePlanePosition = planeMesh.position;//coplanarPoint;
	params.slicePlaneRotation = planeMesh.rotation;
	params.xPfac = params.slicePlanePosition.x;
	params.xRfac = params.slicePlaneRotation.x;
	params.yRfac = params.slicePlaneRotation.y;
	params.doSliceUpdate = true;


}

function screenXY(mesh){
	//get the screen (x,y) coordinates of a given mesh

	var vector = mesh.position.clone();
	var w = d3.select('#WebGLContainer');
	var width = parseFloat(w.style('width'));
	var height = parseFloat(w.style('height'));
	var left = parseFloat(w.style('left'));
	var top = parseFloat(w.style('top'));

	vector.project(params.camera);

	vector.x = ( vector.x * width/2. ) + width/2. + left;
	vector.y = - ( vector.y * height/2. ) + height/2. + top;

	screenXYcheck = true;
	if (vector.z > 1){
		screenXYcheck = false;
	}

	vector.z = 0;

	return vector;
}

function defineTooltip(e, pageX = null, pageY = null){
	//define and show a tooltip (uses function from above)

	if (!params.showingCoordiation){

		//e = d3.event;
		if (pageX == null) pageX = e.pageX;
		if (pageY == null) pageY = e.pageY;

		var clicked = getClickedMesh(pageX, pageY);

		if (params.keyboard.pressed("shift")){
			params.ttMeshIndex.push(clicked['index']);
		} else {
			if (params.ttMeshIndex.length >0){
				var arr = params.ttMeshIndex.slice(); //because highlightSphere modifies the ttMeshIndex array
				arr.forEach(function(loc, i){
					highlightSphere(false, loc); //turn off previous highlighting
					if (i == arr.length-1){
						params.ttMeshIndex = [clicked['index']];
					}
				});
			} else {
				params.ttMeshIndex = [clicked['index']];
			}


		}

		if (params.ttMeshIndex.length > 3){ //only allow three to be highlighted
			highlightSphere(false, params.ttMeshIndex[2]); //turn off previous highlighting
			params.ttMeshIndex = params.ttMeshIndex.slice(0,2);
			params.ttMeshIndex.push(clicked['index']);
		}

	

		showTooltips();

		//google analytics
		var mesh = params.spheres[clicked['index']];
		var label = "Double Clicked Sphere: x="+mesh.position.x+" y="+mesh.position.y+" z="+mesh.position.z;
		console.log(label)
		ga('send', { 
			hitType: 'event',
			eventCategory: 'WebGL',
			eventAction: 'double clicked',
			eventLabel: label
		});

	}
}

function showTooltips(show=true){
	//define and show a tooltip (uses function from above)
	if (show){
		if (!params.showingCoordiation){

			params.ttMeshIndex.forEach(function(loc){
				if (d3.select('#tooltip'+loc).node() == null) {
					createTooltip(loc);
				}
				moveTooltip(loc); //move it into position
				highlightSphere(true, loc); //highlight the sphere
			})

			if (params.ttMeshIndex.length == 2){
				params.scene.remove( params.scene.getObjectByName('ttArrow') ); //remove any arrow 
				params.scene.remove( params.scene.getObjectByName('ttPlane') ); //remove any plane 
				drawTTarrow();
			}
			if (params.ttMeshIndex.length == 3){
				params.scene.remove( params.scene.getObjectByName('ttArrow') ); //remove any arrow 
				params.scene.remove( params.scene.getObjectByName('ttPlane') ); //remove any plane 
				drawTTplane();
			}
		}

		if (params.isSlice){ //this is not efficient, but is the easiest way to get the correct colors for the slice spheres
			params.doSliceUpdate = true;
		}

	} else {
		var ttMeshIndex = params.ttMeshIndex.slice(0); //copy this array to save the ttMeshIndex to I can show in other views later
		var arr = params.ttMeshIndex.slice(); //because highlightSphere modifies the ttMeshIndex array
		arr.forEach(function(loc, i){
			highlightSphere(false, loc); //turn off previous highlighting
		});
		params.ttMeshIndex = ttMeshIndex;
	}

}
///////////////////////////
// runs on load
///////////////////////////
d3.select('#WebGLContainer').node().addEventListener("dblclick", defineTooltip);
//d3.select('#WebGLContainer').on("dblclick", defineTooltip); //not sure why I can't make this work in a d3 way


