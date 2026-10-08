(function(){
	var path = document.querySelector('#header .roofline .roofline__path');
	if(path){
		try{
			var len = path.getTotalLength();
			path.style.strokeDasharray = len;
			path.style.strokeDashoffset = len;
			setTimeout(function(){ path.style.strokeDashoffset = 0; }, 400);
			var logoLink = document.querySelector('#header h1 a');
			if(logoLink){
				logoLink.addEventListener('mouseenter', function(){
					path.style.transition = 'none';
					path.style.strokeDashoffset = len;
					requestAnimationFrame(function(){
						path.style.transition = '';
						requestAnimationFrame(function(){ path.style.strokeDashoffset = 0; });
					});
				});
			}
		}catch(e){}
	}
})();

(function(){
	var trigger = document.querySelector('#header nav a[href="#menu"]');
	var menu = document.getElementById('menu');
	if(!trigger || !menu) return;

	var shade = document.createElement('div');
	shade.id = 'page-shade';
	shade.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000';

	function open(e){
		if(e) e.preventDefault();
		document.body.appendChild(shade);
		shade.style.display = 'block';
		menu.classList.add('visible');
		document.body.classList.add('menu-visible');
	}
	function close(e){
		if(e) e.preventDefault();
		menu.classList.remove('visible');
		document.body.classList.remove('menu-visible');
		shade.style.display = 'none';
		if(shade.parentNode) shade.parentNode.removeChild(shade);
	}

	trigger.addEventListener('click', open);
	var closeBtn = menu.querySelector('.close');
	if(closeBtn) closeBtn.addEventListener('click', close);
	shade.addEventListener('click', close);
	document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
})();
