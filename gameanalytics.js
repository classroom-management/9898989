const GAME_ANALYTICS = (

	function () {

		const VERSION = "v1.0.0";
		const IS_DEBUG = !!SDK_INTERFACE.getDebugLevel();
		let promise = null;
		let interval = null;

		const URL = "//download.gameanalytics.com/js/GameAnalytics-4.4.5.min.js";
		const BUILD = SDK_INTERFACE_SETTINGS.GA_BUILD || "famobi-web 1.0.0";

		const GAME_KEY = SDK_INTERFACE_SETTINGS.GA_GAME_ID || "";
		const SECRET_KEY = SDK_INTERFACE_SETTINGS.GA_SECRET_ID || "";

		function init() {

			if (promise) {
				return promise;
			}

			promise = new Promise((resolve, reject) => {

				IS_DEBUG && console.log("[GameAnalytics] init...");

				if(!SDK_INTERFACE_SETTINGS.features.gameanalytics) {
					return reject("[GameAnalytics] GA is not supported (feature 'gameanalytics' is disabled)");
				}

				const game_key = GAME_KEY;
				const secret_key = SECRET_KEY;

				if(!(typeof game_key === "string" && game_key.length && typeof secret_key === "string" && secret_key.length)) {
					return reject("[GameAnalytics] GA is not supported (missing or invalid keys)");
				}

				const build = BUILD;

				const setEnabledInfoLog = IS_DEBUG;
				const setEnabledEventSubmission = true;

				window.famobi = window.famobi || {};
				window.famobi.config = window.famobi.config || {};
				window.famobi.config.game_analytics = window.famobi.config.game_analytics || {};

				// available items
				const resource_currencies = window.famobi.config.game_analytics.resource_currencies || null;
				const resource_item_types = window.famobi.config.game_analytics.resource_item_types || null;
				const custom_01 = window.famobi.config.game_analytics.custom_01 || null;
				const custom_02 = window.famobi.config.game_analytics.custom_02 || null;
				const custom_03 = window.famobi.config.game_analytics.custom_03 || null;

				const onScriptLoaded = () => {

					if(typeof GameAnalytics !== "undefined") {

						IS_DEBUG && console.log(
							"[GameAnalytics] Initializing...",
							{
								game_key: GAME_KEY,
								build,
								setEnabledInfoLog,
								setEnabledEventSubmission,
								resource_currencies,
								resource_item_types,
								custom_01,
								custom_02,
								custom_03
							}
						);

						GameAnalytics("setEnabledInfoLog", setEnabledInfoLog);
						GameAnalytics("setEnabledEventSubmission", setEnabledEventSubmission);
						GameAnalytics("configureBuild", BUILD);

						resource_currencies && GameAnalytics("configureAvailableResourceCurrencies", resource_currencies);
						resource_item_types && GameAnalytics("configureAvailableResourceItemTypes", resource_item_types);
						custom_01 && GameAnalytics("configureAvailableCustomDimensions01", custom_01);
						custom_02 && GameAnalytics("configureAvailableCustomDimensions02", custom_02);
						custom_03 && GameAnalytics("configureAvailableCustomDimensions03", custom_03);

						GameAnalytics("initialize", game_key, secret_key)

						resolve();
					}

					reject("[GameAnalytics] GA is not ready");
				};

				SDK_INTERFACE.loadFile(URL).then(onScriptLoaded).catch(e => {IS_DEBUG && console.log(e)});
			});

			return promise;
		};

		function trackEvent(event, params) {

			window.gameanalytics = window.gameanalytics || {};

			if(typeof window.gameanalytics.GameAnalytics === "undefined") {
				return;
			}

			params = params || {};
			params.eventName = params.eventName || "";

			switch(event) {
				case "EVENT_LEVELFAIL":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_LEVELFAIL:" + params.reason});
					break;
				case "EVENT_LEVELRESTART":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_LEVELRESTART"});
					break;
				case "EVENT_LEVELSTART":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_LEVELSTART"});
					break;
				case "EVENT_LEVELSUCCESS":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_LEVELSUCCESS"});
					break;
				case "EVENT_LEVELSCORE":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_LEVELSCORE", value: params.levelScore});
					break;
				case "EVENT_LIVESCORE":
					// nope: function call happens way too often
					break;
				case "EVENT_TOTALSCORE":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_TOTALSCORE", value: params.totalScore});
					break;
				case "EVENT_VOLUMECHANGE":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_VOLUMECHANGE"});
					break;
				case "EVENT_CUSTOM":

					// bridge (EVENT_CUSTOM to GameAnalytics Event)
					if(params.eventName.toLowerCase().startsWith("ga:") && typeof gameanalytics !== "undefined") {

						switch(params.eventName.toLowerCase().split(":")[1]) {

							case "business":
								gameanalytics.GameAnalytics.addBusinessEvent(params.cartType, params.itemType, params.itemId, params.amount, params.currency);
								break;

							case "resource":
								gameanalytics.GameAnalytics.addResourceEvent(params.flowType, params.itemType, params.itemId, params.amount, params.resourceCurrency);
								break;

							case "progression":
								gameanalytics.GameAnalytics.addProgressionEvent(params.progressionStatus, params.progression01, params.progression02, params.progression03, params.value);
								break;

							case "error":
								gameanalytics.GameAnalytics.addErrorEvent(params.severity, params.message);
								break;

							case "design":
								gameanalytics.GameAnalytics.addDesignEvent(params.eventId, params.value);
								break;

							case "ads":
								break;

							case "impression":
								break;

							default:
								SDK_INTERFACE_SETTINGS.debugLevel && console.log("unknown GA event type");
						}
						return;
					}

					if(params.eventName === "LEVELEND") {
						window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:LEVELEND:" + params.result, value: params.score});
					}
					break;
				case "EVENT_TUTORIALCOMPLETED":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_TUTORIALCOMPLETED"});
					break;
				case "EVENT_TUTORIALSKIPPED":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_TUTORIALSKIPPED"});
					break;
				case "EVENT_PAUSE":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_PAUSE"});
					break;
				case "EVENT_RESUME":
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "ga:design", eventId: "TrackEvent:EVENT_RESUME"});
					break;
			}
		};

		interval = setInterval(() => {
			if(typeof window.famobi !== "undefined" && typeof window.famobi.config !== "undefined" && window.famobi.config !== null) {
				clearInterval(interval);
				init().catch(e => {IS_DEBUG && console.log(e)});
			}
		}, 250);

		return {
			init: init,
			trackEvent: trackEvent
		};
	}
)();