(function(){
	"use strict";

	/* Roofline brand animation */
	function prep(path){
		if(!path || path.__rhbPrepped) return;
		try{
			var len = path.getTotalLength();
			path.style.strokeDasharray = len;
			path.style.strokeDashoffset = len;
			path.__rhbLen = len;
			path.__rhbPrepped = true;
		}catch(e){}
	}
	var headerIconPath = document.querySelector('#banner .logo .roofline__path');
	prep(headerIconPath);
	if(headerIconPath){
		setTimeout(function(){ headerIconPath.style.strokeDashoffset = 0; }, 900);
	}
	var wizardPath = document.querySelector('#wizardRoofline .roofline__path');
	prep(wizardPath);
	window.__rhbSetWizardProgress = function(step, total){
		if(!wizardPath || !wizardPath.__rhbLen) return;
		wizardPath.style.strokeDashoffset = wizardPath.__rhbLen * (1 - step / total);
	};
	if(wizardPath){ window.__rhbSetWizardProgress(1, 4); }

	/* Situation picker */
	var DATA = {
		repossession: {
			title: "Facing Repossession? We Can Help.",
			text: "A fast cash sale can clear the arrears and protect your credit record before proceedings escalate — even with a court date already set. We can move on very short timescales, and liaise directly with your lender where needed.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: as little as 24 hours"],
			cta: "Stop My Repossession"
		},
		debt: {
			title: "Selling Due to Debt",
			text: "Releasing equity quickly through a cash sale can help settle secured and unsecured debts and give you a clean financial reset — handled with total discretion.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: 3–7 days typical"],
			cta: "Get a Confidential Offer"
		},
		probate: {
			title: "Probate & Inherited Property",
			text: "We work alongside executors and solicitors to buy inherited property in any condition, sensitively and without fuss — no need to clear, repair or present the property first.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: on your timeline"],
			cta: "Value the Inherited Property"
		},
		divorce: {
			title: "Divorce & Separation",
			text: "A swift, agreed sale removes one of the biggest points of contention in a separation. We can work directly through both parties' solicitors to keep things fair and straightforward.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: 3–7 days typical"],
			cta: "Get a Fair Offer for Both of You"
		},
		relocation: {
			title: "Urgent Relocation",
			text: "Job offers, family commitments or health circumstances can demand immediate action. We match our purchase timeline to your move date so the property doesn't hold you back.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: as little as 24 hours"],
			cta: "Sell Before I Move"
		},
		landlords: {
			title: "Landlords Exiting Portfolios",
			text: "We buy tenanted or vacant buy-to-lets, HMOs and full portfolios — no need to serve notice or wait for tenants to vacate. We can complete on multiple properties simultaneously.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: on your timeline"],
			cta: "Get a Portfolio Offer"
		},
		"urgent-sale": {
			title: "Need an Urgent Sale",
			text: "Need to complete in days rather than months? Our process is built around your deadline — no waiting for a buyer's mortgage or a chain to hold together under pressure.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: as little as 24 hours"],
			cta: "Sell My House Fast"
		},
		other: {
			title: "Whatever Your Situation",
			text: "Chain break, downsizing, a problem property that won't sell on the open market, or something else entirely — tell us what's going on and we'll give you a clear, honest plan.",
			timeline: ["Offer: 2 hours","Survey: same day","Exchange: on your timeline"],
			cta: "Tell Us What's Going On"
		}
	};

	var grid = document.getElementById('situationGrid');
	var panel = document.getElementById('situationPanel');
	if(grid && panel){
		grid.querySelectorAll('.situation-pill').forEach(function(pill){
			pill.setAttribute('aria-pressed','false');
			pill.addEventListener('click', function(){
				grid.querySelectorAll('.situation-pill').forEach(function(p){ p.setAttribute('aria-pressed','false'); });
				pill.setAttribute('aria-pressed','true');
				var key = pill.getAttribute('data-situation');
				var d = DATA[key];
				if(!d) return;
				panel.innerHTML =
					'<h3 class="situation-panel__title">'+d.title+'</h3>'+
					'<p class="situation-panel__text">'+d.text+'</p>'+
					'<ul class="situation-panel__timeline">'+d.timeline.map(function(t){ return '<li><span>'+t+'</span></li>'; }).join('')+'</ul>'+
					'<ul class="actions"><li><a href="#offer-wizard" class="button primary" id="situationCta">'+d.cta+'</a></li></ul>';
				panel.hidden = false;
				requestAnimationFrame(function(){ panel.classList.add('is-visible'); });

				var pillValue = pill.getAttribute('data-value');
				var situationHidden = document.getElementById('w-situation');
				if(situationHidden) situationHidden.value = pillValue;
				var situationGridEl = document.getElementById('w-situation-grid');
				if(situationGridEl){
					situationGridEl.querySelectorAll('.wizard-choice').forEach(function(c){
						c.setAttribute('aria-pressed', c.getAttribute('data-value') === pillValue ? 'true' : 'false');
					});
				}
			});
		});
	}

	/* Offer wizard */
	var form = document.getElementById('offerForm');
	if(form){
		var steps = form.querySelectorAll('.wizard-step');
		var stepLabel = document.getElementById('wizardStepLabel');
		var total = steps.length;

		function goTo(n){
			steps.forEach(function(s){ s.hidden = (parseInt(s.getAttribute('data-step'),10) !== n); });
			if(stepLabel) stepLabel.textContent = 'Step '+n+' of '+total;
			if(window.__rhbSetWizardProgress) window.__rhbSetWizardProgress(n, total);
		}

		form.querySelectorAll('.wizard-next').forEach(function(btn){
			btn.addEventListener('click', function(e){
				e.preventDefault();
				var step = btn.closest('.wizard-step');
				if(step && step.getAttribute('data-step') === '1'){
					var pc = document.getElementById('w-postcode');
					if(!pc.value.trim()){ pc.style.borderColor = '#c0392b'; pc.focus(); return; }
					pc.style.borderColor = '';
				}
				goTo(parseInt(btn.getAttribute('data-next'),10));
			});
		});
		form.querySelectorAll('.wizard-back').forEach(function(btn){
			btn.addEventListener('click', function(e){
				e.preventDefault();
				goTo(parseInt(btn.getAttribute('data-back'),10));
			});
		});
		form.querySelectorAll('.wizard-choice-grid').forEach(function(group){
			var targetId = group.getAttribute('data-field-target');
			var target = targetId ? document.getElementById(targetId) : null;
			group.querySelectorAll('.wizard-choice').forEach(function(choice){
				choice.addEventListener('click', function(){
					group.querySelectorAll('.wizard-choice').forEach(function(c){ c.setAttribute('aria-pressed','false'); });
					choice.setAttribute('aria-pressed','true');
					if(target) target.value = choice.getAttribute('data-value');
					var step = choice.closest('.wizard-step');
					if(step && step.getAttribute('data-step') === '2'){
						setTimeout(function(){ goTo(3); }, 220);
					}
				});
			});
		});
		form.addEventListener('submit', function(){
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({event:'generate_lead', event_category:'Lead'});
		});
	}

	/* Cookie banner */
	var banner = document.getElementById('cookieBanner');
	if(banner && !localStorage.getItem('rhb_consent')){
		setTimeout(function(){ banner.classList.add('visible'); }, 1800);
		var a = document.getElementById('cookieAccept'), d = document.getElementById('cookieDecline');
		if(a) a.addEventListener('click', function(e){ e.preventDefault(); localStorage.setItem('rhb_consent','all'); banner.classList.remove('visible'); });
		if(d) d.addEventListener('click', function(e){ e.preventDefault(); localStorage.setItem('rhb_consent','essential'); banner.classList.remove('visible'); });
	}

	var fy = document.getElementById('footerYear');
	if(fy) fy.textContent = new Date().getFullYear();
})();
