function resizeControls(vHeight, controlsWidth, m, b){
	d3.select("#controlsContainer")
		.style('position','absolute')
		.style('top',m + 'px')
		.style('left',m +'px')
		.style('padding',0)
		.style('padding-top','20px')
		.style('margin',0)
		.style('width', controlsWidth +'px')
		.style('height',vHeight + 2.*b + 2.*m - 20 + 'px')
		.style('overflow-y','auto')
		.style('overflow-x','hidden')
		.style('z-index',2)

	if (d3.select('#questionControlsText').node() == null){
		setupControls(vHeight, controlsWidth, m, b);
	}

}
function setupControls(vHeight, controlsWidth, m, b){

	var fs1 = 24;

	function createInput(parent, id, value, width, height, top, left, fontsize){
		parent.append('input')
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

	function createButton(parent, id, width, height, top, left, text='Submit'){
		parent.append('div')
			.attr('id',id)
			.attr('class','buttonDivControls')
			.classed('buttonClickedControls', false)
			.classed('buttonHoverControls', false)
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
	var bh = 50 + fs1 - m;
	var bh0 = bh;

	//question input, start,  stop
	var question = d3.select("#controlsContainer").append('div')
		.attr('id','questionControls')
		.style('margin',m + 'px')
		.style('height','100px')
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
	bh += bh0 + 50 + fs1 + m;
	var miller = d3.select("#controlsContainer").append('div')
		.attr('id','millerControls')
		.style('margin',m + 'px')
		.style('margin-top','50px') 
		.style('height','124px')
	miller.append('p')
		.attr('id','millerControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',fs1 + 'px')
		.text('Miller Index')
	createInput(miller, 'millerA', 0, miWidth, 2.*fs1, bh, m, 20)
	createInput(miller, 'millerB', 0, miWidth, 2.*fs1, bh, miWidth + 2*m, 20)
	createInput(miller, 'millerC', 0, miWidth, 2.*fs1, bh, 2.*miWidth + 3*m, 20)
	createButton(miller, 'millerSubmit', controlsWidth - 20 - 4, 24, bh + 2*fs1 + m, m)
	d3.select('#millerSubmit').on('click', setMillerIndex)



	//mirroring
	bh += bh0 + 50 + fs1 + 24 + m;
	var mirror = d3.select("#controlsContainer").append('div')
		.attr('id','mirrorControls')
		.style('margin',m + 'px')
		.style('margin-top','50px') 
		.style('height','124px')
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
	bh += bh0 + 50 + fs1 + 24;
	var tooltips = d3.select("#controlsContainer").append('div')
		.attr('id','tooltipControls')
		.style('margin',m + 'px')
		.style('margin-top','100px') 
		.style('height','100px')
	tooltips.append('p')
		.attr('id','tooltipsControlsText')
		.attr('align','center')
		.style('margin',0)
		.style('padding',0)
		.style('font-size',0.8*fs1 + 'px')
		.text('Additional Controls')	
	createButton(tooltips, 'tooltipButton',controlsWidth - 20 - 4, 24, bh + 2.*fs1 + m, m ,'Tooltips On')
	d3.select('#tooltipButton')
		.classed('buttonClickedControls', params.showTooltips)
		.on('click', checkTooltips)
}

function checkControlsText(id, value){
	console.log(id, value)
	if (id.includes('miller')) setMillerIndex();
	if (id.includes('mirror')) setMirror();
}

function startQuestion(){
	params.inQuestion = !params.inQuestion
	label = ""
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

function setMillerIndex(A = null, B = null, C = null){
	if (A == null){
		var A = d3.select('#millerA').node().value;
	} else {
		d3.select('#millerA').node().value = A;
	}

	if (B == null) {
		var B = d3.select('#millerB').node().value;
	}  else {
		d3.select('#millerB').node().value = B;
	}

	if (C == null) {
		var C = d3.select('#millerC').node().value;
	} else {
		d3.select('#millerC').node().value = C;
	}

	label = 'Miller Index ' + A + ' ' + B + ' ' + C;
	console.log(label);

	ga('send', { 
		hitType: 'event',
		eventCategory: 'button',
		eventAction: 'clicked Miller Button',
		eventLabel: label + ' , ' + timeStamp() + ' , ' + params.userIP,
	});
}

function getMillerIndex(plane){

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

	var A = 0;
	var B = 0;
	var C = 0;
	if (xPoint.x != 0) A = 1./xPoint.x;
	if (yPoint.y != 0) B = 1./yPoint.y;
	if (zPoint.z != 0) C = 1./zPoint.z;

	setMillerIndex(A, B, C);

}
function setMirror(){
	var X = d3.select('#mirrorX').node().value;
	var Y = d3.select('#mirrorY').node().value;
	var Z = d3.select('#mirrorZ').node().value;
	label = 'Mirror ' + X + ' ' + Y + ' ' + Z;
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
		if (child.name == "sphereMirror") toRemove.push(child);
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
						var p = m.position;
						var g = m.geometry;
						var m = m.material.clone(); //so that the colors of the mirrored objects don't change
						m.color.setHex(params.sphereColor);
						var mm = new THREE.Mesh(g,m);
						//need an if statement so that I don't copy the ends?
						//var mm = m.clone();
						mm.name = "sphereMirror";
						mm.position.set(p.x + i*params.size, p.y + j*params.size, p.z + k*params.size);
						mm.renderOrder = -1;
						params.scene.add(mm);
					})	
				}
			}
		}
	}

}

function checkTooltips(){
	params.showTooltips = !params.showTooltips;

	label = 'Tooltips '

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
