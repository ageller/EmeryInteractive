///////////////////////////
// for finding the circle based on clicks
///////////////////////////
function getClickedMesh(pageX, pageY, meshArray=params.spheres){

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
			"meshPos":meshPos};

}
function moveTooltip(tt, i, pos=null, meshArray=params.spheres){
	if (pos == null){
		pos = screenXY(meshArray[params.ttMeshIndex[i]]);
	}
	var mesh = meshArray[params.ttMeshIndex[i]];
	tt.style("top",pos.y )
	tt.style("left", pos.x );
	tt.select('.tooltipContent').html("x="+mesh.position.x+" y="+mesh.position.y+" z="+mesh.position.z);

}
function highlightSphere(bool, i, meshArray=params.spheres){
	var color = params.sphereColor
	if (bool){
		color = params.highlightColor;
		var box = new THREE.Box3().setFromObject( meshArray[params.ttMeshIndex[i]] );
		var helper = new THREE.Box3Helper( box, params.highlightColor );
		helper.name = "sphereBox"+params.ttMeshIndex[i]
		params.scene.add( helper );
	} else {
    	params.scene.remove( params.scene.getObjectByName("sphereBox"+params.ttMeshIndex[i]) );
	}
	meshArray[params.ttMeshIndex[i]].material.color.setHex(color);
}
function screenXY(mesh){

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

function showTooltip(e, pageX = null, pageY = null){

	var i = params.ttMeshIndex.length - 1;

	if (params.ttMeshIndex.length > 0){
		highlightSphere(false, i); //turn off previous highlighting (will highlight again later)
	}

	//e = d3.event;
	if (pageX == null) pageX = e.pageX;
	if (pageY == null) pageY = e.pageY;

	var clicked = getClickedMesh(pageX, pageY);
	if (params.keyboard.pressed("shift") && params.ttMeshIndex.length < 3){
		params.ttMeshIndex.push(clicked['index']);
	} else {
		params.ttMeshIndex = [clicked['index']];
	}

	params.ttMeshIndex.forEach(function(foo, i){
		var tt = d3.select('#tooltip'+i);
		tt.style("display","block").style("opacity", 1.); //turn on tooltip
		moveTooltip(tt, i, pos=clicked['meshPos']); //move it into position
		highlightSphere(true, i); //highlight the sphere
	})
}
