
function createTooltip(loc){

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
		});
	tt.append('span')
		.attr('class','tooltipContent');


}
// for finding the circle based on clicks
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
function moveTooltip(meshIndex, meshArray=params.spheres){
	var tt = d3.select('#tooltip'+meshIndex)

	var mesh = meshArray[meshIndex];

	pos = screenXY(mesh);
	tt.style("top",pos.y )
	tt.style("left", pos.x );
	tt.select('.tooltipContent').html("x="+mesh.position.x+" y="+mesh.position.y+" z="+mesh.position.z);

}
function highlightSphere(bool, loc, meshArray=params.spheres){

	var color = params.sphereColor;
	var boxName = "sphereBox"+loc;
	if (bool){
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
	}
	meshArray[loc].material.color.setHex(color);
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



	//e = d3.event;
	if (pageX == null) pageX = e.pageX;
	if (pageY == null) pageY = e.pageY;

	var clicked = getClickedMesh(pageX, pageY);
	createTooltip(clicked['index']);

	if (params.keyboard.pressed("shift")){
		params.ttMeshIndex.push(clicked['index']);
	} else {
		params.ttMeshIndex.forEach(function(foo, i){
			highlightSphere(false, i); //turn off previous highlighting
		});
		params.ttMeshIndex = [clicked['index']];
	}

	if (params.ttMeshIndex.length > 3){ //only allow three to be highlighted
		highlightSphere(false, params.ttMeshIndex[2]); //turn off previous highlighting
		params.ttMeshIndex = params.ttMeshIndex.slice(0,2);
		params.ttMeshIndex.push(clicked['index']);
	}


	params.ttMeshIndex.forEach(function(loc){
		moveTooltip(loc); //move it into position
		highlightSphere(true, loc); //highlight the sphere
	})
}


///////////////////////////
// runs on load
///////////////////////////
d3.select('#WebGLContainer').node().addEventListener("dblclick", showTooltip);
//d3.select('#WebGLContainer').on("dblclick", showTooltip); //not sure why I can't make this work in a d3 way


