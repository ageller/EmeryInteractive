
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
function showLabels(bool){
	params.labels.forEach(function(m){
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

	showLabels(true);
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

	showLabels(false);
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

	showLabels(false);
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

	showLabels(false);
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

	showLabels(false);
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