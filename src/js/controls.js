function resizeControls(vHeight, controlsWidth, m, b){
	console.log('resizeControls', vHeight, controlsWidth, m, b)
	d3.select("#controlsContainer")
		.style('position','absolute')
		.style('top',m + 'px')
		.style('left',m +'px')
		.style('padding',0)
		//.style('padding-top','2px')
		//.style('padding-right','20px') //to allow for a srollbar
		.style('margin',0)
		.style('width', controlsWidth +'px')
		.style('height',vHeight + 2.*b + 2.*m + 'px')
		.style('overflow-y','auto')
		.style('overflow-x','hidden')
		.style('z-index',2)

	d3.select('#Controls').remove()
	if (d3.select('#Controls').node() == null){
		var parent = d3.select('#controlsContainer').append('div').attr('id','Controls');
		var width = controlsWidth;
		if (parseFloat(window.innerHeight) < 755) width -= 10; //10px to allow for the scrollbar
		setupControls(parent, vHeight, width, m, b); 
	}

}
function setupControls(parent, vHeight, controlsWidth, m, b, pad){

	var fs1 = 18;

	function createInput(parent1, id, value, width, height, top, left, fontsize){
		parent1.append('input')
			.attr('id',id)
			.attr('type','text')
			.attr('value',value)
			.attr('autocomplete','off')
			.style('position','absolute')
			.style('top',top + 'px')
			.style('left',left + 'px')
			.style('margin',0)
			.style('padding',0)
			.style('font-size',fontsize + 'px')
			.style('width',width + 'px' )
			.style('height',height + 'px')
			.on('keypress',function(){
				var key = event.keyCode || event.which;
				if (key == 13) checkControlsText(this.id, this.value);
			})	
	}

	function createButton(parent1, id, width, height, top, left, text='Submit'){
		parent1.append('div')
			.attr('id',id)
			.attr('class','buttonDivControls')
			.classed('buttonClickedControls', false)
			.classed('buttonHoverControls', true)
			.style('position', 'absolute')
			.style('top', top + 'px')
			.style('left', left + 'px')
			.style('width', width+ 'px')
			.style('height',height + 'px')
			.style('line-height', height + 'px')
			.text(text)
			.on('mousedown', function(){
				d3.select('#'+id).classed('buttonHoverControls', false);
				d3.select('#'+id).classed('buttonClickedControls', true);
			})
			.on('mouseup', function(){
				d3.select('#'+id).classed('buttonClickedControls', false);
			})
			.on('mouseout', function(){
				d3.select('#'+id).classed('buttonHoverControls', true);
			})
	}

	//width of the input boxes
	var miWidth = (controlsWidth - 4.*m)/3.;
	var bh = 24 + fs1 - m;
	var bh0 = bh;

	//question input, start,  stop
	var question = parent.append('div')
		.attr('id','questionControls')
		.style('margin',m + 'px')
		.style('height','35px')
	question.append('p')
		.attr('id','questionControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',fs1 + 'px')
		.text('Question #')
	createInput(question, 'questionNumber', 0, miWidth, 2.*fs1,  bh, 10, 20)
	createButton(question, 'questionButton', 2.*miWidth + m, 2*fs1 - 4, bh, miWidth + 2*m, 'Start')
	d3.select('#questionButton').on('click', startQuestion)

	//miller index
	bh += bh0 + 24 + fs1 + m;
	var miller = parent.append('div')
		.attr('id','millerControls')
		.style('margin',m + 'px')
		.style('margin-top','50px') 
		.style('height','70px')
	miller.append('p')
		.attr('id','millerControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',fs1 + 'px')
		.text('Miller Index')
	createInput(miller, 'millerH', '-', miWidth, 2.*fs1, bh, m, 20)
	createInput(miller, 'millerK', '-', miWidth, 2.*fs1, bh, miWidth + 2*m, 20)
	createInput(miller, 'millerL', '-', miWidth, 2.*fs1, bh, 2.*miWidth + 3*m, 20)
	createButton(miller, 'millerSubmit', controlsWidth - 20 - 4, 24, bh + 2*fs1 + m, m)
	d3.select('#millerSubmit').on('click', setMillerIndex)



	//mirroring
	bh += bh0 + 65 + fs1 + m;
	var mirror = parent.append('div')
		.attr('id','mirrorControls')
		.style('margin',m + 'px')
		.style('margin-top','50px') 
		.style('height','30px')
	mirror.append('p')
		.attr('id','mirrorControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',fs1 + 'px')
		.text('Mirroring')
	createInput(mirror, 'mirrorX', 1, miWidth, 2.*fs1, bh, m, 20)
	createInput(mirror, 'mirrorY', 1, miWidth, 2.*fs1, bh, miWidth + 2*m, 20)
	createInput(mirror, 'mirrorZ', 1, miWidth, 2.*fs1, bh, 2.*miWidth + 3*m, 20)
	createButton(mirror, 'mirrorSubmit', controlsWidth - 20 - 4, 24, bh + 2*fs1 + m, m)
	d3.select('#mirrorSubmit').on('click', setMirror)


	//tooltip on/off
	bh += bh0 + 30 + fs1;
	var additional = parent.append('div')
		.attr('id','tooltipControls')
		.style('margin',m + 'px')
		.style('margin-top','100px') 
		.style('height','100px')
	additional.append('p')
		.attr('id','tooltipsControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',fs1 + 'px')
		.text('Additional Controls')	
	var sz = 22.
	createButton(additional, 'tooltipButton',controlsWidth - 20 - 4, sz, bh + 2.*sz + m, m ,'Tooltips On')
	d3.select('#tooltipButton')
		.classed('buttonClickedControls', params.showTooltips)
		.on('click', checkTooltips)

	//on/off for main atoms
	createButton(additional, 'atomButton',controlsWidth - 20 - 4, sz, bh + 3.*sz + 2.*m, m ,'Atoms On')
	d3.select('#atomButton')
		.classed('buttonClickedControls', params.showAtoms)
		.on('click', function(){checkAtoms('showAtoms', 'Atoms', 'atomButton')})

	//on/off for interstitial sites
	createButton(additional, 'octahedralButton',controlsWidth - 20 - 4, sz, bh + 4.*sz + 3.*m, m ,'Octahedral Off')
	d3.select('#octahedralButton')
		.classed('buttonClickedControls', params.showOctahedrals)
		.on('click', function(){checkAtoms('showOctahedrals', 'Octahedrals', 'octahedralButton')})

	createButton(additional, 'tetrahedralButton',controlsWidth - 20 - 4, sz, bh + 5.*sz + 4.*m, m ,'Tetrahedral Off')
	d3.select('#tetrahedralButton')
		.classed('buttonClickedControls', params.showTetrahedrals)
		.on('click', function(){checkAtoms('showTetrahedrals', 'Tetrahedrals', 'tetrahedralButton')})
}

function checkControlsText(id, value){
	console.log(id, value)
	if (id.includes('miller')) setMillerIndex();
	if (id.includes('mirror')) setMirror();
}

function startQuestion(){
	params.inQuestion = !params.inQuestion
	var label = ""
	if (params.inQuestion){
		d3.select('#questionButton')
			.classed('buttonClickedControls', true)
			.text('Stop');
		params.questionN = d3.select('#questionNumber').node().value;
		label = 'Started Question ' + params.questionN;
	} else {
		d3.select('#questionButton')
			.classed('buttonClickedControls', false)
			.text('Start');
		label = 'Stopped Question'
	}

	console.log(label);
	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Question Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});
}

function setMillerIndex(){

	var H = parseFloat(d3.select('#millerH').node().value);
	var K = parseFloat(d3.select('#millerK').node().value);
	var L = parseFloat(d3.select('#millerL').node().value);
	
	updateMillerIndex(H, K, L);

	if (H != null && K != null & L != null){
		var p1 = new THREE.Vector3(0, 0, 0);
		var p2 = new THREE.Vector3(0, 0, 0);
		var p3 = new THREE.Vector3(0, 0, 0);
		if (H != 0) p1.x = 1./H;
		if (K != 0) p2.y = 1./K;
		if (L != 0) p3.z = 1./L;

		makePlaneFromPoints(p1, p2, p3);
	}

	var label = 'Miller Index ' + H + ' ' + K + ' ' + L;
	console.log(label);

	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Miller Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});
}
function updateMillerIndex(H, K, L){
	d3.select('#millerH').node().value = H;
	d3.select('#millerK').node().value = K;
	d3.select('#millerL').node().value = L;
}
function getMillerIndexFromPlane(plane){

	//check intersection with x axis
	var xAxis = new THREE.Line3(new THREE.Vector3(0,0,0), new THREE.Vector3(100, 0, 0));
	var yAxis = new THREE.Line3(new THREE.Vector3(0,0,0), new THREE.Vector3(0, 100, 0));
	var zAxis = new THREE.Line3(new THREE.Vector3(0,0,0), new THREE.Vector3(0, 0, 100));
	var xPoint = new THREE.Vector3();
	var yPoint = new THREE.Vector3();
	var zPoint = new THREE.Vector3();
	plane.intersectLine(xAxis, xPoint);
	plane.intersectLine(yAxis, yPoint);
	plane.intersectLine(zAxis, zPoint);

	var H = 0;
	var K = 0;
	var L = 0;
	if (xPoint.x != 0) H = 1./xPoint.x;
	if (yPoint.y != 0) K = 1./yPoint.y;
	if (zPoint.z != 0) L = 1./zPoint.z;

	updateMillerIndex(H,K,L);
}
function setMirror(){
	var X = d3.select('#mirrorX').node().value;
	var Y = d3.select('#mirrorY').node().value;
	var Z = d3.select('#mirrorZ').node().value;
	var label = 'Mirror ' + X + ' ' + Y + ' ' + Z;
	console.log(label);

	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Mirror Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});

	//remove all mirrored spheres
	var toRemove = [];
	params.scene.traverse(function(child) {
		if (child.name.includes("Mirror")) toRemove.push(child);
	});
	toRemove.forEach(function(child){
		params.scene.remove(child);
	})


	//add the mirrored spheres
	for (var i = 0; i<X; i++){
		for (var j = 0; j<Y; j++){
			for (var k = 0; k<Z; k++){	
				if (i > 0 || j > 0 || k> 0){
					params.spheres.forEach(function(m){
						var pos = m.position;
						var geo = m.geometry;
						var mat = m.material.clone(); //so that the colors of the mirrored objects don't change
						m.material.transparent.value = true;
						//m.color.setHex(params.sphereColor);
						var mm = new THREE.Mesh(geo,mat);
						if (m.material.opacity.value < 1) mm.renderOrder = 1;
						//need an if statement so that I don't copy the ends?
						//var mm = m.clone();
						mm.name = m.name + "Mirror";
						mm.position.set(pos.x + i*params.size, pos.y + j*params.size, pos.z + k*params.size);
						params.scene.add(mm);
					})	
				}
			}
		}
	}

}

function checkTooltips(){
	params.showTooltips = !params.showTooltips;

	var label = 'Tooltips '

	d3.selectAll('.tooltip').classed('hidden', !params.showTooltips);

	d3.select('#tooltipButton').classed('buttonClickedControls', params.showTooltips)
	if (params.showTooltips){
		d3.select('#tooltipButton').text('Tooltips On');
		label += 'On';
	} else {
		d3.select('#tooltipButton').text('Tooltips Off');
		label += 'Off';
	}

	console.log(label);

	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Tooltips OnOff Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});
}

function checkAtoms(flag, name, buttonID){
	params[flag] = !params[flag];

	var label = name + ' '

	var m = [];
	params.scene.traverse(function(child) {
		if (child.name.includes(name)) m.push(child);
	});
	m.forEach(function(child){
		child.material.visible = params[flag];
	});

	//special case for Atoms and anything other than default view
	if (name == "Atoms"){
		if (params.inDefaultView) {
			showHemiSpheres(params[flag]);
		} else {
			showHemiSpheres(false);
		}
	}
	
	//do I need a special case for slice view and interstitials?
	if (params.isSlice){
		sliceView(doTween=false);
	}
	
	d3.select('#'+buttonID).classed('buttonClickedControls', params[flag])
	if (params[flag]){
		d3.select('#'+buttonID).text(name + ' On');
		label += 'On';
	} else {
		d3.select('#'+buttonID).text(name + ' Off');
		label += 'Off';
	}

	console.log(label);

	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked ' + name + ' OnOff Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});
}
