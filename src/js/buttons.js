//this file contains all the functions related to the buttons

//helpers for buttons
function showHemiSpheres(show){
	//turns on/off the hemispheres
	params.hemiSpheres.forEach(function(m){
		m.material.visible = show;
	})
}
function showSpheres(show){
	//turns on/off the spheres, but not the interstitial sites
	params.spheres.forEach(function(m){
		if (m.name != "Octahedrals" && m.name != "Tetrahedrals") m.material.visible = show;
	})
	//also do this for the mirrored spheres
	params.scene.traverse(function(child) {
		if (child.name == "AtomsMirror") child.material.visible = show;
	});

	//reset the button
	params.showAtoms = show;
	d3.select('#atomButton').classed('buttonClickedControls', params.showAtoms)
	if (params.showAtoms){
		d3.select('#atomButton').text('Atoms On');
	} else {
		d3.select('#atomButton').text('Atoms Off');
	}
}

function showSliceMesh(show){
	//turns on/off the slice view
	params.sliceMesh.forEach(function(m){
		m.material.visible = show;
	})
}
function showCoordination(show){
	//turns on/off the coordination view, and limits the double-click ability
	params.showingCoordiation = show;
	showTooltips(!show)
	params.coordination.forEach(function(m){
		m.material.visible = show;
	})
}
function showLabels(show){
	//turns on/off the labels
	params.labels.forEach(function(m){
		m.material.visible = show;
	})
}
function changeSphereOpacity(opacity){
	//changes the opacity of the spheres
	params.spheres.forEach(function(m){
		m.material.opacity = opacity;
	})
	//also do this for the mirrored spheres
	params.scene.traverse(function(child) {
		if (child.name.includes("Mirror")) child.material.opacity = opacity;
	});
}

function changeSphereScale(scale){
	//changes the size of the spheres
	params.spheres.forEach(function(m){
		m.geometry.scale(scale, scale, scale);
	})	
	//also change the box outline scale
	params.ttMeshIndex.forEach(function(loc){
		var boxName = "sphereBox"+loc;
		var o = params.scene.getObjectByName(boxName);
		o.geometry.scale(scale, scale, scale);
	})
}
//functions attached to buttons
function defaultView(){
	//makes all changes needed for the default view
	console.log('default view');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Default View',
		eventLabel: 'clicked Default View, ' + timeStamp() + ' , ' + params.userIP,
	});

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
	params.inDefaultView = true;


	showLabels(true);
	showHemiSpheres(true);
	showSpheres(true);
	changeSphereOpacity(params.defaultOuterOpacity);

	checkClickedPlane();

	params.defaultViewTween.start();

}

function hardSphereView(){
	//makes all changes needed for the hard sphere view
	console.log('hard-sphere model');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Hard-Sphere Model',
		eventLabel: 'clicked Hard-Sphere Model, ' + timeStamp() + ' , ' + params.userIP,
	});

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
	params.inDefaultView = false;

	showSpheres(true);
	changeSphereOpacity(params.hardOpacity);

	checkClickedPlane();

	params.defaultViewTween.start();
}

function sliceView(){
	//makes all changes needed for the slice view
	console.log('slice');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Slice',
		eventLabel: 'clicked Slice, ' + timeStamp() + ' , ' + params.userIP,
	});

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
	params.doSliceUpdate = true;
	params.inDefaultView = false;

	checkClickedPlane();


	params.defaultViewTween.start();
}

function sparseView(){
	//makes all changes needed for the sparse view
	console.log('sparse model');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Sparse Model',
		eventLabel: 'clicked Sparse Model, ' + timeStamp() + ' , ' + params.userIP,
	});

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
	params.inDefaultView = false;

	checkClickedPlane();

	params.defaultViewTween.start();
}

function coordinationView(){
	//makes all changes needed for the coordination view
	console.log('coordination');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Coordination',
		eventLabel: 'clicked Coordination, ' + timeStamp() + ' , ' + params.userIP,
	});

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
	params.inDefaultView = false;

	checkClickedPlane();

	params.coordinationViewTween.start();
}

function showHelp(){
	//toggles the help screen on/off
	console.log('help');
	//google analytics
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Help',
		eventLabel: 'clicked Help, ' + timeStamp() + ' , ' + params.userIP,
	});

	//d3.selectAll('.buttonDiv').classed('buttonClicked', false);
	d3.selectAll('.buttonDiv').classed('buttonHover', true);
	d3.selectAll('#helpButton').classed('buttonClicked', true);
	d3.selectAll('#helpButton').classed('buttonHover', false);
	d3.selectAll('#textContainer').classed('scrollable', false);
	d3.selectAll('#textContainer').classed('notScrollable', true);

	d3.select('#helpContainer').classed('hidden', false)
	resizeText('#helpText');
	d3.select('#helpContainer').transition(params.transition)
		.style('background-color','rgba(100, 100, 100,'+params.helpOpacity+')')
		.style('opacity',1);


}

function setupButtons(vHeight, vWidth, controlsWidth, m, b){
	//creates all the buttons and links them to the function above
	//buttons
	d3.select('#buttonContainer')
		.style('position','absolute')
		.style('top',vHeight + 2.*m + 'px')
		.style('left',controlsWidth + 2.*m +'px')
		.style('margin',0)
		.style('padding',0)
		.style('width',vWidth + 'px')
		.style('height',2.*b + m + 'px')
		.style('z-index',1)

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

	d3.select('#sparseButton')
		.style('position','absolute')
		.style('top',0)
		.style('left',2.*bw + 2.*m + 'px')
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonHover', true)
		.classed('buttonClicked', false)
		.on('click', sparseView)

	d3.select('#sliceButton')
		.style('position','absolute')
		.style('top',b + m + 'px')
		.style('left',0)
		.style('width',bw + 'px')
		.style('height',b-2 + 'px')
		.classed('buttonClicked', false)
		.classed('buttonHover', true)
		.on('click', sliceView)


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
		.classed('buttonClicked', true)
		.classed('buttonHover', true)
		.on('click',showHelp)


	//attach a google analytics event to clicks in the render window
	d3.select('#WebGLContainer').on('click', function(){
		ga('send', { 
			hitType: 'event',
			eventCategory: 'WebGL',
			eventAction: 'Clicked in Render Window',
			eventLabel: 'Clicked in Render Window, ' + timeStamp() + ' , ' + params.userIP
		});
	});

}

