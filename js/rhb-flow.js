/*
  Rapid House Buyer — guided "get started" flow (get-started.html)
  situation -> only the questions relevant to it -> your plan -> details -> done.
  Accepts ?situation=<id> to skip straight to that situation's first question.
*/
(function (w, d) {
	'use strict';

	var RHB = w.RHB;

	function $(sel, ctx) { return (ctx || d).querySelector(sel); }
	function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
	function esc(str) {
		return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	function params() {
		var out = {};
		new URLSearchParams(w.location.search).forEach(function (v, k) { out[k] = v; });
		return out;
	}
	var reduceMotion = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var ICONS = {
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
		check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		pound: '<path d="M16 7.2A3.6 3.6 0 0 0 9.5 9.4V18M7 18h10M7 13.5h6.5"/>',
		doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
		scale: '<path d="M12 3v18M7 21h10M5 7l4-1.5M19 7l-4-1.5M5 7L2 13a3.5 3.5 0 0 0 6 0zM19 7l-3 6a3.5 3.5 0 0 0 6 0z"/>',
		move: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
		key: '<circle cx="8" cy="15" r="4.2"/><path d="M11 12l9-9M16 7l2.5 2.5M19.5 3.5L22 6"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 20.5l1.4-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
		shield: '<path d="M12 3l8 3v6c0 4.6-3.4 8.4-8 9-4.6-.6-8-4.4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
		lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
		phone: '<path d="M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 5.8 5.8l1.4-2.2 4.5 1.5V18a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
		mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
		wa: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" stroke="none"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>'
	};
	function icon(name, cls) {
		var isWa = name === 'wa';
		return '<svg class="i i-' + name + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (isWa ? 0 : 1.9) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.info) + '</svg>';
	}

	var stage = $('[data-stage]');
	var aside = $('[data-aside]');
	var bar = $('[data-progress]');
	if (!stage) return;

	var state = { situation: null, answers: {}, contact: { pref: 'phone' } };
	var current = null;
	var submitted = false;

	function sequence() {
		var steps = ['situation'];
		if (state.situation) {
			RHB.questionsFor(state.situation).forEach(function (q) { steps.push('q:' + q.id); });
			steps.push('plan', 'details');
		}
		return steps;
	}
	function question(key) {
		var id = key.slice(2);
		var qs = RHB.questions[state.situation] || [];
		for (var i = 0; i < qs.length; i++) if (qs[i].id === id) return qs[i];
		return null;
	}
	function next() {
		var seq = sequence();
		var i = seq.indexOf(current);
		go(seq[Math.min(i + 1, seq.length - 1)]);
	}
	function go(step, opts) {
		opts = opts || {};
		if (!opts.fromHistory) w.history.pushState({ step: step }, '');
		render(step);
	}
	function render(step) {
		current = step;
		var leaving = $('.step', stage);
		var draw = function () {
			if (step === 'situation') renderSituation();
			else if (step.indexOf('q:') === 0) renderQuestion(question(step));
			else if (step === 'plan') renderPlan();
			else if (step === 'details') renderDetails();
			updateProgress();
			updateAside();
			var h = $('.step-title', stage);
			if (h) h.focus({ preventScroll: true });
			w.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
		};
		if (leaving && !reduceMotion) {
			leaving.classList.add('is-leaving');
			w.setTimeout(draw, 170);
		} else {
			draw();
		}
	}
	function updateProgress(value) {
		if (!bar) return;
		var seq = sequence();
		var p = value != null ? value : (seq.indexOf(current) + 1) / (seq.length + 1);
		bar.style.setProperty('--p', Math.max(0.04, p));
	}

	function stepHead(title, help, withBack) {
		var seq = sequence();
		var n = seq.indexOf(current) + 1;
		var sit = RHB.situation(state.situation);
		var eyebrow = state.situation ? 'Step ' + n + ' of ' + seq.length + ' · ' + sit.short : "Let's get started";
		return (
			'<button type="button" class="back-link" data-back' + (withBack ? '' : ' hidden') + '>' + icon('back') + 'Back</button>' +
			'<p class="eyebrow">' + eyebrow + '</p>' +
			'<h1 class="step-title" tabindex="-1">' + title + '</h1>' +
			(help ? '<p class="step-help">' + help + '</p>' : '')
		);
	}

	function optionButton(o, pressed) {
		return (
			'<button type="button" class="option" data-value="' + esc(o.value) + '" aria-pressed="' + (pressed ? 'true' : 'false') + '">' +
			(o.icon ? '<span class="opt-icon">' + icon(o.icon) + '</span>' : '') +
			'<span class="opt-text"><strong>' + esc(o.label) + '</strong>' + (o.hint ? '<small>' + esc(o.hint) + '</small>' : '') + '</span>' +
			'<span class="opt-check">' + icon('check') + '</span>' +
			'</button>'
		);
	}

	/* ── Step: situation ─────────────────────────────────────────────────── */

	function renderSituation() {
		stage.innerHTML =
			'<div class="step">' +
			stepHead("What's prompting the sale?", "We'll only ask what's relevant — no industry jargon, no credit check.", false) +
			'<div class="options cols-2" role="group" aria-label="What\'s prompting the sale?">' +
			RHB.situations.map(function (s) {
				return optionButton({ value: s.id, label: s.label, hint: s.hint, icon: s.icon }, state.situation === s.id);
			}).join('') +
			'</div></div>';

		$$('.option', stage).forEach(function (btn) {
			btn.addEventListener('click', function () {
				var id = btn.getAttribute('data-value');
				if (state.situation !== id) { state.situation = id; state.answers = {}; }
				$$('.option', stage).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
				updateAside();
				w.setTimeout(next, 220);
			});
		});
	}

	/* ── Step: a question ────────────────────────────────────────────────── */

	function renderQuestion(q) {
		if (!q) { go('situation'); return; }
		var value = state.answers[q.id];
		var body = '';

		if (q.type === 'text') {
			body =
				'<div class="text-field"><label class="sr-only" for="q-text">' + esc(q.title) + '</label>' +
				'<textarea id="q-text" rows="4" placeholder="' + esc(q.placeholder || '') + '">' + esc(value || '') + '</textarea></div>' +
				'<div class="step-actions"><button type="button" class="btn btn-primary btn-lg" data-continue>Continue' + icon('arrow') + '</button>' +
				(q.optional ? '<button type="button" class="btn btn-lg" data-skip>Skip</button>' : '') + '</div>';
		} else {
			body = '<div class="options ' + (q.layout || '') + '" role="group" aria-label="' + esc(q.title) + '">' +
				q.options.map(function (o) { return optionButton(o, value === o.value); }).join('') + '</div>';
		}

		stage.innerHTML = '<div class="step">' + stepHead(q.title, q.help, true) + body + '</div>';

		if (q.type === 'text') {
			var ta = $('#q-text', stage);
			$('[data-continue]', stage).addEventListener('click', function () { state.answers[q.id] = ta.value.trim(); next(); });
			var skip = $('[data-skip]', stage);
			if (skip) skip.addEventListener('click', function () { delete state.answers[q.id]; next(); });
			return;
		}

		$$('.option', stage).forEach(function (btn) {
			btn.addEventListener('click', function () {
				state.answers[q.id] = btn.getAttribute('data-value');
				$$('.option', stage).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
				updateAside();
				w.setTimeout(next, 220);
			});
		});
	}

	/* ── Step: plan ───────────────────────────────────────────────────────── */

	function renderPlan() {
		var sit = RHB.situation(state.situation);
		var items = RHB.planFor(state.situation, state.answers);

		var list = items.map(function (it, i) {
			return (
				'<li style="--i:' + i + '">' +
				'<span class="tl-icon">' + icon(it.icon) + '</span>' +
				'<h3>' + esc(it.title) + '</h3>' +
				'<span class="tl-when">' + esc(it.when) + '</span>' +
				'<p class="tl-next">' + esc(it.why) + '</p>' +
				'</li>'
			);
		}).join('');

		stage.innerHTML =
			'<div class="step">' +
			stepHead("Here's your plan.", 'A clear, four-step process for ' + esc(sit.short) + ' — no obligation at any point.', true) +
			'<ol class="timeline">' + list + '</ol>' +
			'<div class="notice">' + icon('info') + '<span><strong>Worth knowing:</strong> cash buyers typically offer 75–85% of open market value — the trade-off for speed, certainty and zero costs. If the open market would suit you better, we’ll say so. We are not FCA regulated, and we encourage independent legal and financial advice.</span></div>' +
			'<div class="step-actions"><button type="button" class="btn btn-primary btn-lg" data-continue>Looks good' + icon('arrow') + '</button>' +
			'<span class="faint">Free · No obligation</span></div>' +
			'</div>';

		$('[data-continue]', stage).addEventListener('click', next);
	}

	/* ── Step: details ────────────────────────────────────────────────────── */

	function renderDetails(errorMsg) {
		var c = state.contact;
		stage.innerHTML =
			'<div class="step">' +
			stepHead('Where should we send your offer?', "We'll call or WhatsApp within 2 hours. No pressure, no obligation.", true) +
			(errorMsg ? '<div class="error-box" role="alert">' + errorMsg + '</div>' : '') +
			'<form novalidate data-details>' +
			'<input type="text" name="_gotcha" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" aria-hidden="true">' +
			'<div class="fields">' +
			'<div class="field"><label for="f-name">Full name</label><input type="text" id="f-name" name="name" autocomplete="name" value="' + esc(c.name || '') + '"></div>' +
			'<div class="field half"><label for="f-phone">Phone</label><input type="tel" id="f-phone" name="phone" autocomplete="tel" inputmode="tel" value="' + esc(c.phone || '') + '"></div>' +
			'<div class="field half"><label for="f-postcode">Property postcode</label><input type="text" id="f-postcode" name="postcode" autocomplete="postal-code" value="' + esc(c.postcode || '') + '"></div>' +
			'<div class="field"><label for="f-email">Email <span class="opt">(optional)</span></label><input type="email" id="f-email" name="email" autocomplete="email" inputmode="email" value="' + esc(c.email || '') + '"></div>' +
			'<div class="field"><span class="label" id="pref-label">Best way to reach you</span>' +
			'<div class="segmented" role="group" aria-labelledby="pref-label">' +
			'<button type="button" data-pref="phone" aria-pressed="' + (c.pref === 'phone') + '">Call</button>' +
			'<button type="button" data-pref="whatsapp" aria-pressed="' + (c.pref === 'whatsapp') + '">WhatsApp</button>' +
			'<button type="button" data-pref="email" aria-pressed="' + (c.pref === 'email') + '">Email</button>' +
			'</div></div>' +
			'</div>' +
			'<label class="check"><input type="checkbox" name="consent"' + (c.consent ? ' checked' : '') + '><span>I consent to Rapid House Buyer contacting me about this enquiry. Read our <a class="inline" href="/pages/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>' +
			'<div class="step-actions" style="margin-top:1.5rem"><button type="submit" class="btn btn-primary btn-lg">Get My Free Cash Offer' + icon('arrow') + '</button></div>' +
			'<ul class="reassure"><li>' + icon('check') + 'Free, no obligation</li><li>' + icon('check') + 'No credit check</li><li>' + icon('check') + 'Never sold or shared</li></ul>' +
			'</form></div>';

		var form = $('[data-details]', stage);
		$$('[data-pref]', form).forEach(function (btn) {
			btn.addEventListener('click', function () {
				c.pref = btn.getAttribute('data-pref');
				$$('[data-pref]', form).forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
			});
		});

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var el = form.elements;
			c.name = el.name.value.trim();
			c.phone = el.phone.value.trim();
			c.postcode = el.postcode.value.trim();
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
			if (!c.postcode) fail(el.postcode, 'Please add the property postcode.');
			if (!c.consent) fail(el.consent, 'We need your OK to be in touch about this enquiry.', el.consent.closest('.check'));
			if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }
			submit();
		});
	}

	/* ── Submit -> building -> done ──────────────────────────────────────── */

	function makeRef() {
		var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		var out = '';
		var buf = new Uint8Array(6);
		(w.crypto || w.msCrypto).getRandomValues(buf);
		for (var i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
		return 'RHB-' + out;
	}

	function submit() {
		var ref = makeRef();
		var c = state.contact;
		var sit = RHB.situation(state.situation);

		var answers = RHB.questionsFor(state.situation).map(function (q) {
			var v = state.answers[q.id];
			if (v == null || v === '') return null;
			return { question: q.title, answer: v };
		}).filter(Boolean);

		current = 'building';
		updateProgress(0.96);
		stage.innerHTML =
			'<div class="step building" role="status" aria-live="polite">' +
			'<svg class="mark-loop" viewBox="0 0 100 60" aria-hidden="true"><path class="roofline__path" d="M6,50 L50,13 L94,50 M63,29 L63,13 L78,13 L78,24"/></svg>' +
			'<p data-msg>Putting your plan together…</p></div>';
		var msgs = ['Preparing your request…', 'Almost there…'];
		var m = 0;
		var timer = w.setInterval(function () {
			var el = $('[data-msg]', stage);
			if (el && m < msgs.length) el.textContent = msgs[m++];
		}, 650);

		var fd = new FormData();
		fd.append('name', c.name);
		fd.append('phone', c.phone);
		fd.append('email', c.email || '');
		fd.append('postcode', c.postcode);
		fd.append('situation', sit.label);
		fd.append('contact_preference', c.pref);
		fd.append('reference', ref);
		answers.forEach(function (a) { fd.append(a.question, a.answer); });
		fd.append('_subject', 'New cash offer enquiry — Rapid House Buyer (' + ref + ')');

		var wait = new Promise(function (r) { w.setTimeout(r, reduceMotion ? 300 : 1700); });
		var send = fetch(RHB.config.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
			.then(function (res) { return { sent: res.ok }; })
			.catch(function () { return { sent: false, error: true }; });

		Promise.all([send, wait]).then(function (res) {
			w.clearInterval(timer);
			var result = res[0];
			if (result.error) {
				current = 'details';
				renderDetails('We couldn’t send that just now. Please check your connection and try again — or call us on <a class="inline" href="tel:' + RHB.config.contact.phoneHref + '">' + RHB.config.contact.phone + '</a>.');
				updateProgress();
				return;
			}
			submitted = true;
			w.history.replaceState({ step: 'done' }, '');
			if (w.gtag) { w.gtag('event', 'conversion', { send_to: 'AW-18112548315/I_aTCIawvtEcENub3rxD' }); }
			if (w.gtag) { w.gtag('event', 'generate_lead', { event_category: 'Lead' }); }
			renderDone(ref, answers);
		});
	}

	function renderDone(ref, answers) {
		current = 'done';
		updateProgress(1);
		var sit = RHB.situation(state.situation);
		var c = state.contact;
		var first = (c.name || '').split(' ')[0];
		var items = RHB.planFor(state.situation, state.answers);

		var list = items.map(function (it, i) {
			return (
				'<li style="--i:' + i + '">' +
				'<span class="tl-icon">' + icon(it.icon) + '</span>' +
				'<h3>' + esc(it.title) + '</h3>' +
				'<span class="tl-when">' + esc(it.when) + '</span>' +
				'<p class="tl-next">' + icon('check') + '<span>' + esc(it.why) + '</span></p>' +
				'</li>'
			);
		}).join('');

		stage.innerHTML =
			'<div class="step">' +
			'<div class="done-top"><span class="ok-chip">' + icon('check') + 'Enquiry received</span><span class="ref-chip">Ref ' + esc(ref) + '</span></div>' +
			'<h1 class="step-title" tabindex="-1">' + (first ? 'Thank you, ' + esc(first) + '.' : 'Thank you.') + '</h1>' +
			'<p class="step-help">A member of our team will call or WhatsApp you within 2 hours during business hours to talk through your free cash offer for ' + esc(sit.short) + '.</p>' +
			'<ol class="timeline">' + list + '</ol>' +
			'<div class="actions">' +
			'<a class="btn btn-primary" href="tel:' + RHB.config.contact.phoneHref + '">' + icon('phone') + 'Call ' + RHB.config.contact.phone + '</a>' +
			'<a class="btn" href="' + RHB.config.contact.whatsapp + '" target="_blank" rel="noopener">' + icon('wa') + 'WhatsApp Us</a>' +
			'</div>' +
			'<p class="faint small"><a class="inline" href="/">← Back to homepage</a></p>' +
			'</div>';

		renderDoneAside(answers);
		var h = $('.step-title', stage);
		if (h) h.focus({ preventScroll: true });
		w.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	/* ── Aside: the answers building up as you go ───────────────────────── */

	function updateAside() {
		if (!aside) return;
		var sit = state.situation && RHB.situation(state.situation);
		var rows = [];
		if (sit) rows.push({ label: sit.label, when: null });
		Object.keys(state.answers).forEach(function (k) {
			var v = state.answers[k];
			if (!v) return;
			var qs = RHB.questions[state.situation] || [];
			var q = qs.filter(function (x) { return x.id === k; })[0];
			if (!q || q.type === 'text') return;
			rows.push({ label: v, when: q.title });
		});

		aside.innerHTML =
			'<div class="plan-card">' +
			'<div class="plan-card-head"><svg class="mark" viewBox="0 0 100 60" aria-hidden="true"><path class="roofline__path" d="M6,50 L50,13 L94,50 M63,29 L63,13 L78,13 L78,24" style="stroke-dashoffset:0"/></svg><div><strong>Your enquiry so far</strong><small>' +
			(sit ? esc(sit.short) : 'Tell us what’s going on') + '</small></div></div>' +
			(rows.length
				? '<ol>' + rows.map(function (r) { return '<li><span class="fi">' + icon('check') + '</span><span>' + esc(r.label) + (r.when ? '<small>' + esc(r.when) + '</small>' : '') + '</span></li>'; }).join('') + '</ol>'
				: '<p class="empty">Answer a few quick questions and we’ll build your plan here.</p>') +
			'<p class="plan-card-foot">' + icon('lock') + '<span>Nothing is shared until you submit.</span></p>' +
			'</div>';
	}

	function renderDoneAside(answers) {
		if (!aside) return;
		var cfg = RHB.config.contact;
		var rows = answers.map(function (a) {
			return '<li><span class="fi">' + icon('check') + '</span><span>' + esc(a.answer) + '<small>' + esc(a.question) + '</small></span></li>';
		}).join('');
		aside.innerHTML =
			'<div class="plan-card">' +
			'<div class="plan-card-head"><svg class="mark" viewBox="0 0 100 60" aria-hidden="true"><path class="roofline__path" d="M6,50 L50,13 L94,50 M63,29 L63,13 L78,13 L78,24" style="stroke-dashoffset:0"/></svg><div><strong>What you told us</strong></div></div>' +
			(rows ? '<ol>' + rows + '</ol>' : '') +
			'<p class="plan-card-foot">' + icon('chat') + '<span>Need a hand? Call <a class="inline" href="tel:' + cfg.phoneHref + '">' + cfg.phone + '</a></span></p>' +
			'</div>';
	}

	/* ── Start ───────────────────────────────────────────────────────────── */

	d.addEventListener('click', function (e) {
		if (e.target.closest('[data-back]')) w.history.back();
	});

	w.addEventListener('popstate', function (e) {
		if (submitted) { w.location.replace('/'); return; }
		var step = e.state && e.state.step;
		if (!step) return;
		if (step !== 'situation' && sequence().indexOf(step) === -1) step = 'situation';
		render(step);
	});

	var p = params();
	var sit = p.situation && RHB.situation(p.situation);
	if (sit) state.situation = sit.id;

	w.history.replaceState({ step: 'situation' }, '');
	if (state.situation) go(sequence()[1]);
	else render('situation');
})(window, document);
