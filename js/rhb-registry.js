/*
  Rapid House Buyer — flow registry
  Single source of truth for the guided "get started" flow: situations,
  the questions asked for each, and the 4-stage plan shown before contact
  details. Pattern adapted from a reference guided-flow UX; content and
  design are Rapid House Buyer's own.
*/
(function (w) {
	'use strict';

	var RHB = (w.RHB = w.RHB || {});

	RHB.config = {
		formEndpoint: 'https://formspree.io/f/mwvjqywq',
		storageKey: 'rhb.enquiry.v1',
		contact: {
			email: 'enquiries@rapidhousebuyer.co.uk',
			phone: '020 7199 1698',
			phoneHref: '+442071991698',
			whatsapp: 'https://wa.me/442071991698'
		}
	};

	/* ── Situations (the "goal") ──────────────────────────────────────────── */

	var SITUATIONS = [
		{ id: 'repossession', label: "I'm facing repossession", short: 'facing repossession', icon: 'shield', hint: 'Clear arrears before proceedings escalate' },
		{ id: 'debt', label: "I'm dealing with debt", short: 'dealing with debt', icon: 'pound', hint: 'A confidential financial reset' },
		{ id: 'probate', label: "I've inherited a property", short: 'an inherited property', icon: 'doc', hint: 'Sensitive, no-fuss handling' },
		{ id: 'divorce', label: "I'm separating or divorcing", short: 'a divorce sale', icon: 'scale', hint: 'A fair, swift agreed sale' },
		{ id: 'relocation', label: 'I need to relocate', short: 'relocating', icon: 'move', hint: 'Timed to your move date' },
		{ id: 'landlords', label: "I'm a landlord selling up", short: 'a portfolio exit', icon: 'key', hint: 'Tenanted or vacant, any size' },
		{ id: 'urgent-sale', label: 'I just need to sell fast', short: 'an urgent sale', icon: 'clock', hint: 'Built around your deadline' },
		{ id: 'other', label: 'Something else', short: 'your situation', icon: 'chat', hint: "Tell us — we'll work out a plan" }
	];

	/* ── Shared question building blocks ──────────────────────────────────── */

	var PROPERTY_TYPE = { id: 'propertyType', title: 'What type of property is it?', help: 'So we can prepare an accurate offer.', layout: 'cols-2',
		options: [
			{ value: 'House', label: 'House' },
			{ value: 'Flat / Apartment', label: 'Flat / Apartment' },
			{ value: 'Bungalow', label: 'Bungalow' },
			{ value: 'HMO / Multi-unit', label: 'HMO / Multi-unit' }
		]
	};

	var TIMESCALE = { id: 'timescale', title: 'How soon do you need to sell?', help: "There's no wrong answer — this just helps us plan.", layout: 'cols-2',
		options: [
			{ value: 'ASAP / within days', label: 'ASAP / within days' },
			{ value: 'Within 1-4 weeks', label: 'Within 1–4 weeks' },
			{ value: '1-3 months', label: '1–3 months' },
			{ value: 'Just exploring', label: 'Just exploring options' }
		]
	};

	var QUESTIONS = {
		repossession: [
			{ id: 'courtDate', title: 'Where are things up to with your lender?', help: 'This helps us judge how quickly we need to move.',
				options: [
					{ value: 'Court date set', label: 'A court date is already set', hint: 'We can move fastest here' },
					{ value: 'Notice received', label: "I've had a repossession notice", hint: 'No court date yet' },
					{ value: 'Arrears, no notice', label: "I'm in arrears, no notice yet" },
					{ value: 'Not sure', label: 'Not sure / prefer not to say' }
				]
			},
			PROPERTY_TYPE,
			TIMESCALE
		],
		debt: [
			{ id: 'debtType', title: "What's the debt mainly for?", help: 'Handled with total discretion either way.',
				options: [
					{ value: 'Mortgage arrears', label: 'Mortgage arrears' },
					{ value: 'Secured loan or CCJ', label: 'Secured loan or CCJ' },
					{ value: 'HMRC or business debt', label: 'HMRC or business debt' },
					{ value: 'Prefer not to say', label: 'Prefer not to say' }
				]
			},
			PROPERTY_TYPE,
			TIMESCALE
		],
		probate: [
			{ id: 'probateStage', title: 'Has grant of probate been issued?', help: 'We can agree terms before the grant comes through.',
				options: [
					{ value: 'Grant issued', label: 'Yes, grant issued' },
					{ value: 'Applied, waiting', label: "Applied, we're waiting" },
					{ value: 'Not yet applied', label: 'Not yet applied' },
					{ value: 'Not sure', label: 'Not sure' }
				]
			},
			PROPERTY_TYPE,
			TIMESCALE
		],
		divorce: [
			{ id: 'solicitorStatus', title: 'Is this being handled through solicitors?', layout: 'cols-2',
				options: [
					{ value: 'Yes, both sides', label: 'Yes, both sides' },
					{ value: 'Not yet', label: 'Not yet' },
					{ value: 'Not sure', label: 'Not sure' }
				]
			},
			PROPERTY_TYPE,
			TIMESCALE
		],
		relocation: [
			PROPERTY_TYPE,
			TIMESCALE
		],
		landlords: [
			{ id: 'portfolioSize', title: 'How many properties are you looking to sell?', layout: 'cols-3',
				options: [
					{ value: 'Just one', label: 'Just one' },
					{ value: 'A few', label: 'A few' },
					{ value: 'Full portfolio', label: 'Full portfolio' }
				]
			},
			{ id: 'tenancy', title: 'Tenanted or vacant?', layout: 'cols-3',
				options: [
					{ value: 'Tenanted', label: 'Tenanted' },
					{ value: 'Vacant', label: 'Vacant' },
					{ value: 'Mixed', label: 'Mixed' }
				]
			},
			TIMESCALE
		],
		'urgent-sale': [
			PROPERTY_TYPE,
			TIMESCALE
		],
		other: [
			PROPERTY_TYPE,
			TIMESCALE,
			{ id: 'note', type: 'text', optional: true, title: 'Anything else we should know?', help: 'Optional — a sentence or two is plenty.', placeholder: 'e.g. the property has a short lease' }
		]
	};

	/* ── The plan: our 4-stage process, framed for the chosen situation ────── */

	function planFor(situationId, answers) {
		answers = answers || {};
		var urgent = answers.timescale === 'ASAP / within days' || answers.courtDate === 'Court date set';

		return [
			{
				icon: 'chat', title: 'Contact & Initial Offer',
				when: 'Today',
				why: 'Tell us your situation. We provide an indicative cash offer within 2 hours — no obligation, fully confidential.'
			},
			{
				icon: 'clock', title: 'Same-Day Survey',
				when: urgent ? 'Today or tomorrow' : 'Within a day or two',
				why: 'Our in-house RICS-accredited surveyor visits at a time that suits you, at no cost.'
			},
			{
				icon: 'doc', title: 'Formal Cash Offer',
				when: 'Right after the survey',
				why: 'A formal written offer with a transparent valuation. No pressure to accept.'
			},
			{
				icon: 'check', title: 'Exchange & Completion',
				when: urgent ? 'As little as 24 hours' : 'On a date you choose',
				why: urgent
					? "Given what you've told us, we can move on a very short timescale if needed."
					: 'Our solicitors progress immediately once you’re ready.'
			}
		];
	}

	/* ── Accessors ───────────────────────────────────────────────────────── */

	RHB.situations = SITUATIONS;
	RHB.questions = QUESTIONS;
	RHB.planFor = planFor;

	RHB.situation = function (id) {
		for (var i = 0; i < SITUATIONS.length; i++) if (SITUATIONS[i].id === id) return SITUATIONS[i];
		return null;
	};
	RHB.questionsFor = function (situationId) {
		return QUESTIONS[situationId] || [];
	};
})(window);
