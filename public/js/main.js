'use strict';

$(function() {

	const STAGE_WIDTH = 600;
	const STAGE_HEIGHT = 480;

	/* Shaking interval */
	const shaking_interval = 5;
	/* Shaking range */
	const shaking_range = Math.PI/50;
	/* sprite lifespan */
	const lifespan = 5000;

	/* From http://www.colordic.org/w/ */
	const COLORS = ['#fef4f4',
									'#96514d',
									'#e6b422',
									'#006e54',
									'#895b8a',
									'#fdeff2',
									'#8d6449',
									'#d9a62e'];

	/* Initialize pixi.js */
	var container = new PIXI.Container();
	var renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT);

	$('div#app').append(renderer.view)

	/* onResize settings */
	/* from http://qiita.com/foo9/items/d90a72e9c7a2f37fa9cc */
	var $window = $(window);

	// XXX: debounce
	$window.resize(onResize);

	function onResize() {
	  var width;
	  var height;
	  var ratioWidth;
	  var ratioHeight;
	  var ratio;

	  width = $window.width();
	  height = $window.height();
	  ratioWidth = width / STAGE_WIDTH;
	  ratioHeight = height / STAGE_HEIGHT;
	  if (ratioWidth < ratioHeight) {
			ratio = ratioWidth;
		} else {
			ratio = ratioHeight;
		}

		renderer.view.style.width = ~~(STAGE_WIDTH * ratio) + 'px';
		renderer.view.style.height = ~~(STAGE_HEIGHT * ratio) + 'px';
	}

	onResize();

	/* application */
	function get_color() {
		var idx = Math.floor(Math.random() * COLORS.length) - 1;

		return COLORS[idx];
	}

	class User {
		constructor() {
			this.color = get_color();
		}
	}

	var user = new User();

	function onsha(color) {

		var txt = new PIXI.Text('オンシャ〜〜〜〜〜〜〜〜〜〜〜〜〜〜', 
														{fill: color,
														 font:'' + (Math.random()*20 + 20) + 'px Arial'});
		txt.anchor.x = 0.5;
		txt.anchor.y = 0.5;
		txt.position.x = Math.random() * STAGE_WIDTH;
		txt.position.y = Math.random() * STAGE_HEIGHT;
		txt.rotation = -shaking_range/2;

		container.addChild(txt);

		/* set timeout */
		var p = new Promise(function (resolve, reject) {
			setTimeout(resolve, lifespan);
		});

		p.then(function () {
			container.removeChild(txt);
		});

	}

	/* websocket */
	var ws = new WebSocket('ws://' + location.host + '/socket');

	ws.onmessage = function (e) {
		/* except: {color: 0x000000} */
		var data = JSON.parse(e.data);
		onsha(data.color);
	}

	var send = function() {
		ws.send(JSON.stringify({
			color: user.color
		}));
	};

	/* renderer */
	requestAnimationFrame( animate );

	var frame = 0;

	function animate() {
		requestAnimationFrame( animate );

		for (var i = 0; i < container.children.length; ++i) {
			if(frame%(shaking_interval*2) < shaking_interval) {
				container.children[i].rotation += shaking_range;
			} else {
				container.children[i].rotation += -shaking_range;
			}
		}

		frame++;

		renderer.render(container);
	}

	$('#app').click(function () {
		send();
	});

});

