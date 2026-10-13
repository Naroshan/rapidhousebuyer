/*
  Rapid House Buyer — free instant valuation tool (valuation.html)
  Property details -> indicative open-market estimate -> RHB cash-offer
  range (75-85% of that estimate) -> optional lead capture -> done.

  The estimate is a client-side formula, not a live data lookup or an AI
  model guessing a number — deliberately so: it's instant, costs nothing
  to run, and every figure it shows is traceable to the multipliers below
  rather than to an opaque "AI accuracy" claim.
*/
(function (w, d) {
	'use strict';

	function $(sel, ctx) { return (ctx || d).querySelector(sel); }
	function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
	function esc(str) {
		return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	var reduceMotion = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var ICONS = {
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
		check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
		phone: '<path d="M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 5.8 5.8l1.4-2.2 4.5 1.5V18a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
		wa: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" stroke="none"/>'
	};
	function icon(name, cls) {
		var isWa = name === 'wa';
		return '<svg class="i i-' + name + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (isWa ? 0 : 1.9) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.info) + '</svg>';
	}

	/* ── Valuation formula ───────────────────────────────────────────────────
	   Indicative London/M25 base prices (RHB's actual coverage area, not a
	   generic UK-wide average) x a bedroom-count multiplier x a condition
	   multiplier. Every number here is a plain, traceable adjustment — there
	   is no hidden "AI confidence score" standing in for real precision. */

	var BASE_VALUES = {
		'Detached house': 650000,
		'Semi-detached house': 480000,
		'Terraced house': 420000,
		'Flat / Apartment': 380000,
		'Bungalow': 500000,
		'Maisonette': 360000
	};
	var BEDROOM_MULT = {
		'Studio': 0.55, '1 bedroom': 0.7, '2 bedrooms': 0.9,
		'3 bedrooms': 1.0, '4 bedrooms': 1.25, '5+ bedrooms': 1.55
	};
	var CONDITION_MULT = {
		'Excellent — recently renovated': 1.08,
		'Good — well maintained': 1.0,
		'Fair — some work needed': 0.92,
		'Poor — significant work needed': 0.82
	};
	var OFFER_LOW = 0.75, OFFER_HIGH = 0.85;

	function round(n) { return Math.round(n / 1000) * 1000; }

	function valuate(data) {
		var base = BASE_VALUES[data.type] || 420000;
		var bedMult = BEDROOM_MULT[data.bedrooms] || 1.0;
		var condMult = CONDITION_MULT[data.condition] || 1.0;
		var estimate = round(base * bedMult * condMult);
		return {
			estimate: estimate,
			rangeLow: round(estimate * 0.95),
			rangeHigh: round(estimate * 1.05),
			offerLow: round(estimate * OFFER_LOW),
			offerHigh: round(estimate * OFFER_HIGH)
		};
	}

	function money(n) {
		return '£' + Math.round(n).toLocaleString('en-GB');
	}

	/* ── State machine ───────────────────────────────────────────────────── */

	var stage = $('[data-stage]');
	var bar = $('[data-progress]');
	if (!stage) return;

	var SEQ = ['form', 'generating', 'results', 'done'];
	var state = {
		data: { postcode: '', bedrooms: '', bathrooms: '', type: '', condition: '' },
		result: null,
		contact: { pref: 'phone' }
	};
	var current = 'form';

	function updateProgress() {
		if (!bar) return;
		var i = SEQ.indexOf(current);
		var p = (i + 1) / SEQ.length;
		bar.style.setProperty('--p', Math.max(0.08, p));
	}

	function go(step, opts) {
		opts = opts || {};
		current = step;
		var leaving = $('.step', stage);
		var draw = function () {
			if (step === 'form') renderForm();
			else if (step === 'generating') renderGenerating();
			else if (step === 'results') renderResults();
			else if (step === 'done') renderDone();
			updateProgress();
			var h = $('.step-title', stage);
			if (h) h.focus({ preventScroll: true });
			if (!opts.skipScroll) {
				w.scrollTo({ top: stage.closest('section').offsetTop - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
			}
		};
		if (leaving && !reduceMotion) {
			leaving.classList.add('is-leaving');
			w.setTimeout(draw, 170);
		} else {
			draw();
		}
	}

	function stepHead(title, help) {
		return '<p class="eyebrow">Free instant valuation</p><h1 class="step-title" tabindex="-1">' + title + '</h1>' +
			(help ? '<p class="step-help">' + help + '</p>' : '');
	}

	/* ── Step: form ──────────────────────────────────────────────────────── */

	function renderForm() {
		var dd = state.data;
		stage.innerHTML =
			'<div class="step">' +
			stepHead('Tell us about your property', 'A few quick details — we’ll use them to work out an indicative value and what we could offer for it.') +
			'<form novalidate data-valuation-form>' +
			'<div class="fields">' +
			'<div class="field"><label for="v-postcode">Postcode</label><input type="text" id="v-postcode" name="postcode" autocomplete="postal-code" placeholder="e.g. SW11 4NQ" maxlength="10" value="' + esc(dd.postcode) + '"></div>' +
			'<div class="field half"><label for="v-bedrooms">Bedrooms</label><select id="v-bedrooms" name="bedrooms"><option value="">Select</option>' +
			['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms', '4 bedrooms', '5+ bedrooms'].map(function (o) {
				return '<option' + (dd.bedrooms === o ? ' selected' : '') + '>' + o + '</option>';
			}).join('') + '</select></div>' +
			'<div class="field half"><label for="v-bathrooms">Bathrooms</label><select id="v-bathrooms" name="bathrooms"><option value="">Select</option>' +
			['1 bathroom', '2 bathrooms', '3+ bathrooms'].map(function (o) {
				return '<option' + (dd.bathrooms === o ? ' selected' : '') + '>' + o + '</option>';
			}).join('') + '</select></div>' +
			'<div class="field"><label for="v-type">Property type</label><select id="v-type" name="type"><option value="">Select type</option>' +
			['Detached house', 'Semi-detached house', 'Terraced house', 'Flat / Apartment', 'Bungalow', 'Maisonette'].map(function (o) {
				return '<option' + (dd.type === o ? ' selected' : '') + '>' + o + '</option>';
			}).join('') + '</select></div>' +
			'<div class="field"><label for="v-condition">Condition</label><select id="v-condition" name="condition"><option value="">Select condition</option>' +
			['Excellent — recently renovated', 'Good — well maintained', 'Fair — some work needed', 'Poor — significant work needed'].map(function (o) {
				return '<option' + (dd.condition === o ? ' selected' : '') + '>' + o + '</option>';
			}).join('') + '</select></div>' +
			'</div>' +
			'<div class="step-actions"><button type="submit" class="btn btn-primary btn-lg">Get My Free Valuation' + icon('arrow') + '</button></div>' +
			'<p class="faint small">' + icon('lock') + ' Your data is never shared. No credit check, no obligation.</p>' +
			'</form></div>';

		$('[data-valuation-form]', stage).addEventListener('submit', function (e) {
			e.preventDefault();
			var el = e.target.elements;
			dd.postcode = (el.postcode.value.trim() || 'SW11 4NQ').toUpperCase();
			dd.bedrooms = el.bedrooms.value || '3 bedrooms';
			dd.bathrooms = el.bathrooms.value || '2 bathrooms';
			dd.type = el.type.value || 'Semi-detached house';
			dd.condition = el.condition.value || 'Good — well maintained';
			go('generating');
		});
	}

	/* ── Step: generating ────────────────────────────────────────────────── */

	var GEN_STEPS = [
		'Reviewing your property details…',
		'Checking typical local prices…',
		'Applying bedroom and condition adjustments…',
		'Working out your cash-offer range…',
		'Finalising your estimate…'
	];

	function renderGenerating() {
		stage.innerHTML =
			'<div class="step building" role="status" aria-live="polite">' +
			'<svg class="mark-loop" viewBox="0 0 100 100" aria-hidden="true"><path class="roofline__path" d="M16,80 L50,18 L84,80 M32,92 L68,92"/></svg>' +
			'<p data-msg>' + GEN_STEPS[0] + '</p></div>';

		state.result = valuate(state.data);

		var i = 0;
		var timer = w.setInterval(function () {
			i++;
			var el = $('[data-msg]', stage);
			if (el && i < GEN_STEPS.length) el.textContent = GEN_STEPS[i];
		}, reduceMotion ? 1 : 550);

		w.setTimeout(function () {
			w.clearInterval(timer);
			go('results');
		}, reduceMotion ? 50 : GEN_STEPS.length * 550 + 300);
	}

	/* ── Step: results (+ inline lead capture) ──────────────────────────── */

	function renderResults() {
		var r = state.result, dd = state.data;
		stage.innerHTML =
			'<div class="step">' +
			'<p class="eyebrow">Your estimate is ready</p>' +
			'<h1 class="step-title" tabindex="-1">Here’s what your property could be worth</h1>' +
			'<div class="val-block">' +
			'<div class="val-label">Indicative open-market value</div>' +
			'<div class="val-figure">' + money(r.estimate) + '</div>' +
			'<div class="val-range">Typical range: ' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</div>' +
			'<div class="val-meta">' +
			'<div class="val-meta-item"><div class="val-meta-label">Property type</div><div class="val-meta-value">' + esc(dd.type) + '</div></div>' +
			'<div class="val-meta-item"><div class="val-meta-label">Bedrooms</div><div class="val-meta-value">' + esc(dd.bedrooms) + '</div></div>' +
			'<div class="val-meta-item"><div class="val-meta-label">Postcode</div><div class="val-meta-value">' + esc(dd.postcode) + '</div></div>' +
			'</div></div>' +
			'<div class="offer-block">' +
			'<div class="offer-label">' + icon('check') + ' Your Rapid House Buyer cash offer could be</div>' +
			'<div class="offer-figure">' + money(r.offerLow) + ' – ' + money(r.offerHigh) + '</div>' +
			'<p class="offer-note">We typically offer 75–85% of open market value, in exchange for a fast, certain, zero-fee sale — offer within 2 hours, exchange in as little as 24 hours.</p>' +
			'</div>' +
			'<div class="notice">' + icon('info') + '<span><strong>Worth knowing:</strong> this is an indicative estimate based on typical London/M25 prices for this property type, bedroom count and condition — not a formal valuation or a live market lookup. Your in-house RICS survey gives you a precise, free figure with no obligation.</span></div>' +
			renderLeadForm() +
			'</div>';

		bindLeadForm();
	}

	function renderLeadForm() {
		var c = state.contact;
		return (
			'<div class="lead-block">' +
			'<h3>Get your full cash offer</h3>' +
			'<p>Leave your details and a member of our team will call or WhatsApp within 2 hours with a formal, no-obligation cash offer.</p>' +
			'<form novalidate data-lead-form>' +
			'<input type="text" name="_gotcha" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" aria-hidden="true">' +
			'<div class="fields">' +
			'<div class="field"><label for="v-name">Full name</label><input type="text" id="v-name" name="name" autocomplete="name" value="' + esc(c.name || '') + '"></div>' +
			'<div class="field half"><label for="v-phone">Phone</label><input type="tel" id="v-phone" name="phone" autocomplete="tel" inputmode="tel" value="' + esc(c.phone || '') + '"></div>' +
			'<div class="field half"><label for="v-email">Email <span class="opt">(optional)</span></label><input type="email" id="v-email" name="email" autocomplete="email" inputmode="email" value="' + esc(c.email || '') + '"></div>' +
			'</div>' +
			'<label class="check"><input type="checkbox" name="consent"' + (c.consent ? ' checked' : '') + '><span>I consent to Rapid House Buyer contacting me about this enquiry. Read our <a class="inline" href="/pages/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
			'<div class="step-actions" style="margin-top:1.25rem"><button type="submit" class="btn btn-primary btn-lg">Send Me My Cash Offer' + icon('arrow') + '</button></div>' +
			'<ul class="reassure"><li>' + icon('check') + 'Free, no obligation</li><li>' + icon('check') + 'No credit check</li><li>' + icon('check') + 'Never sold or shared</li></ul>' +
			'</form>' +
			'<button type="button" class="lead-skip" data-skip-lead>No thanks, just the estimate</button>' +
			'</div>'
		);
	}

	function bindLeadForm() {
		var form = $('[data-lead-form]', stage);
		var skip = $('[data-skip-lead]', stage);
		if (skip) skip.addEventListener('click', function () { go('done'); });
		if (!form) return;

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var el = form.elements;
			var c = state.contact;
			c.name = el.name.value.trim();
			c.phone = el.phone.value.trim();
			c.email = el.email.value.trim();
			c.consent = el.consent.checked;

			$$('[aria-invalid]', form).forEach(function (x) { x.removeAttribute('aria-invalid'); });
			$$('.field-error', form).forEach(function (x) { x.remove(); });
			var ok = true;
			function fail(input, msg, after) {
				ok = false;
				input.setAttribute('aria-invalid', 'true');
				(after || input).insertAdjacentHTML('afterend', '<p class="field-error">' + msg + '</p>');
			}
			if (!c.name) fail(el.name, 'Please tell us your name.');
			if (c.phone.replace(/\D/g, '').length < 10) fail(el.phone, 'Please add a phone number we can reach you on.');
			if (!c.consent) fail(el.consent, 'We need your OK to be in touch about this enquiry.', el.consent.closest('.check'));
			if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }
			submitLead();
		});
	}

	function submitLead() {
		var c = state.contact, dd = state.data, r = state.result;
		var btn = $('[data-lead-form] button[type="submit"]', stage);
		if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

		var fd = new FormData();
		fd.append('name', c.name);
		fd.append('phone', c.phone);
		fd.append('email', c.email || '');
		fd.append('postcode', dd.postcode);
		fd.append('property_type', dd.type);
		fd.append('bedrooms', dd.bedrooms);
		fd.append('bathrooms', dd.bathrooms);
		fd.append('condition', dd.condition);
		fd.append('estimated_value', String(r.estimate));
		fd.append('estimated_offer_range', money(r.offerLow) + ' - ' + money(r.offerHigh));
		fd.append('source', 'Free Valuation Tool');
		fd.append('_subject', 'New valuation enquiry — Rapid House Buyer (' + dd.postcode + ')');

		fetch(w.RHB.config.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
			.then(function (res) { return { sent: res.ok }; })
			.catch(function () { return { sent: false, error: true }; })
			.then(function (result) {
				if (result.error) {
					if (btn) { btn.disabled = false; btn.textContent = 'Send Me My Cash Offer'; }
					$('[data-lead-form]', stage).insertAdjacentHTML('beforeend', '<p class="field-error">We couldn’t send that just now. Please check your connection and try again, or call us on <a class="inline" href="tel:' + w.RHB.config.contact.phoneHref + '">' + w.RHB.config.contact.phone + '</a>.</p>');
					return;
				}
				if (w.gtag) { w.gtag('event', 'generate_lead', { event_category: 'Lead' }); }
				go('done');
			});
	}

	/* ── Step: done ──────────────────────────────────────────────────────── */

	function renderDone() {
		var c = state.contact;
		var cfg = w.RHB.config.contact;
		var hasContact = !!c.name;
		stage.innerHTML =
			'<div class="step">' +
			'<div class="done-top"><span class="ok-chip">' + icon('check') + (hasContact ? 'Enquiry received' : 'Estimate complete') + '</span></div>' +
			'<h1 class="step-title" tabindex="-1">' + (hasContact ? 'Thank you' + (c.name ? ', ' + esc(c.name.split(' ')[0]) : '') + '.' : 'All done.') + '</h1>' +
			'<p class="step-help">' + (hasContact
				? 'A member of our team will call or WhatsApp you within 2 hours during business hours with your formal cash offer.'
				: 'Whenever you’re ready for a formal, no-obligation cash offer, we’re here.') + '</p>' +
			'<div class="actions">' +
			'<a class="btn btn-primary" href="tel:' + cfg.phoneHref + '">' + icon('phone') + 'Call ' + cfg.phone + '</a>' +
			'<a class="btn" href="' + cfg.whatsapp + '" target="_blank" rel="noopener">' + icon('wa') + 'WhatsApp Us</a>' +
			'</div>' +
			'<p class="faint small"><a class="inline" href="/">← Back to homepage</a> &middot; <a class="inline" href="#" data-restart>Value another property</a></p>' +
			'</div>';

		$('[data-restart]', stage).addEventListener('click', function (e) {
			e.preventDefault();
			state.data = { postcode: '', bedrooms: '', bathrooms: '', type: '', condition: '' };
			state.result = null;
			go('form');
		});
	}

	/* ── Start ───────────────────────────────────────────────────────────── */

	go('form', { skipScroll: true });
})(window, document);
