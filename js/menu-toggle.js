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
