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
			.attr('class','buttonDiv')
			.classed('buttonClicked', false)
			.classed('buttonHover', false)
			.style('position', 'absolute')
			.style('top', top + 'px')
			.style('left', left + 'px')
			.style('width', width+ 'px')
			.style('height',height + 'px')
			.style('line-height', height + 'px')
			.text(text)
			.on('mousedown', function(){
				d3.select('#'+id).classed('buttonHover', false);
				d3.select('#'+id).classed('buttonClicked', true);
			})
			.on('mouseup', function(){
				d3.select('#'+id).classed('buttonClicked', false);
			})
			.on('mouseout', function(){
				d3.select('#'+id).classed('buttonHover', true);
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
		.classed('buttonClicked', params.showTooltips)
		.on('click', checkTooltips)
}

function checkControlsText(id, value){
	console.log(id, value)
}

function startQuestion(){
	params.inQuestion = !params.inQuestion
	if (params.inQuestion){
		d3.select('#questionButton')
			.classed('buttonClicked', true)
			.text('Stop');
		params.questionN = d3.select('#questionNumber').node().value;
		console.log('Question started', params.questionN);
	} else {
		d3.select('#questionButton')
			.classed('buttonClicked', false)
			.text('Start');
		console.log('Question stopped')
	}
}

function setMillerIndex(){
	var A = d3.select('#millerA').node().value;
	var B = d3.select('#millerB').node().value;
	var C = d3.select('#millerC').node().value;
	console.log('Miller', A, B, C);
}

function setMirror(){
	var X = d3.select('#mirrorX').node().value;
	var Y = d3.select('#mirrorY').node().value;
	var Z = d3.select('#mirrorZ').node().value;
	console.log('Mirror', Z, Y, Z);
}

function checkTooltips(){
	params.showTooltips = !params.showTooltips;
	console.log('Show tooltips', params.showTooltips);

	d3.selectAll('.tooltip').classed('hidden', !params.showTooltips);

	d3.select('#tooltipButton').classed('buttonClicked', params.showTooltips)
	if (params.showTooltips){
		d3.select('#tooltipButton').text('Tooltips On');
	} else {
		d3.select('#tooltipButton').text('Tooltips Off');
	}
}
