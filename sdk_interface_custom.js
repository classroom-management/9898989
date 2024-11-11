// GAME-SPECIFIC SETTINGS / OVERRIDES

SDK_INTERFACE_SETTINGS.GA_GAME_ID = "PUT GA_GAME-ID HERE";
SDK_INTERFACE_SETTINGS.GA_SECRET_ID = "PUT GA_SECRET-ID HERE";
SDK_INTERFACE_SETTINGS.GA_BUILD = "yandex-web 1.0.0";

SDK_INTERFACE_SETTINGS.isProd = true;

if(SDK_INTERFACE_SETTINGS.isProd) {
	// PRODUCTION
	SDK_INTERFACE_SETTINGS.debugLevel = 0;
	SDK_INTERFACE_SETTINGS.forceMockObject = false;
} else {
	// TESTING
	SDK_INTERFACE_SETTINGS.debugLevel = 1;
	SDK_INTERFACE_SETTINGS.forceMockObject = true;
}

SDK_INTERFACE_SETTINGS.useSafeStorage = false; // WARNING: Activate for NEW games ONLY, otherwise existing savegames (saved in the conventional way) will be lost!

SDK_INTERFACE_SETTINGS.leaderboardLevel = true; // Set to true, if you want to track the completed levels in the leaderboard
SDK_INTERFACE_SETTINGS.showLeaderboard = false; // Set to false, if you do not want to show the leaderboard, but still want to track it
SDK_INTERFACE_SETTINGS.levelRegex = /(\d+)/; // Adjust according to the game

SDK_INTERFACE_SETTINGS.interstitial.enabled = true;
SDK_INTERFACE_SETTINGS.rewarded.enabled = true;

SDK_INTERFACE_SETTINGS.features.gameanalytics = true;

// overrides
SDK_INTERFACE_OVERRIDES.famobi_analytics.trackEvent = (event, params) => {

	return new Promise(function(resolve, reject) {

		SDK_INTERFACE.getDebugLevel() && console.log(event, params);

		typeof GAME_ANALYTICS !== "undefined" && GAME_ANALYTICS.trackEvent(event, params);

		switch(event) {
			case "EVENT_LEVELFAIL":
				window.famobi_analytics.trackEvent("EVENT_CUSTOM", {
					eventName: "ga:progression",
					progressionStatus: "Fail",
					progression01: params.levelName,
					progression02: params.reason
				});
				if(params.reason !== "quit") {
					return window.famobi.showAd(function() {
						resolve();
					});
				}
				break;
			case "EVENT_LEVELRESTART":
			case "EVENT_LEVELSTART":
				window.famobi_analytics.trackEvent("EVENT_CUSTOM", {
					eventName: "ga:progression",
					progressionStatus: "Start",
					progression01: params.levelName
				});
				break;
			case "EVENT_LEVELSUCCESS":
				return window.famobi.showAd(function() {
					window.famobi_analytics.trackEvent("EVENT_CUSTOM", {
						eventName: "ga:progression",
						progressionStatus: "Complete",
						progression01: params.levelName
					});
					if(!SDK_INTERFACE_SETTINGS.leaderboardLevel) {
						resolve();
						return;
					}

					const match = (params.levelName.toString()).match(SDK_INTERFACE_SETTINGS.levelRegex);
					if (match) {
						const levelNumber = Math.floor(parseInt(match[1]));
						SDK_INTERFACE.getDebugLevel() && console.log(`[LEVELSUCCESS]: Completed level: ${levelNumber}`);

						if(typeof(levelNumber == "number") && levelNumber >= 0) {
							return YANDEX_LEADERBOARD.showLeaderboard(() => { resolve(); }, levelNumber);
						}
					}
				});
			case "EVENT_LEVELSCORE":
				break;
			case "EVENT_LIVESCORE":
				break;
			case "EVENT_TOTALSCORE":
				window.famobi_analytics.trackEvent("EVENT_CUSTOM", {
					eventName: "ga:progression",
					progressionStatus: "Fail",
					progression01: params.levelName,
					value: params.totalScore
				});

				if(!SDK_INTERFACE_SETTINGS.leaderboardLevel) {
					return YANDEX_LEADERBOARD.showLeaderboard(() => { resolve(); }, params.totalScore);
				}
			case "EVENT_VOLUMECHANGE":
				break;
			case "EVENT_CUSTOM":
				break;
			case "EVENT_TUTORIALCOMPLETED":
				break;
			case "EVENT_TUTORIALSKIPPED":
				break;
			case "EVENT_PAUSE":
				break;
			case "EVENT_RESUME":
				break;
			default:
			// do nothing
		};

		return resolve(event, params);
	});
};

SDK_INTERFACE_OVERRIDES.famobi_analytics.trackScreen = (screen, pageTitle) => {

	return new Promise(function(resolve, reject) {

		SDK_INTERFACE.getDebugLevel() && console.log(screen, pageTitle);

		switch(screen) {
			case "SCREEN_HOME":
				// ...
				break;
			default:
			// ...
		}

		return resolve(screen, pageTitle);
	});
};

SDK_INTERFACE_OVERRIDES.famobi.showInterstitialAd = (eventId, callback) => {
	let params = {};

	if(typeof eventId === "object") {
	    params = eventId;
	} else {
	    params.callback = typeof eventId === "function" ? eventId : typeof callback === "function" ? callback : undefined;
	    params.eventId = typeof eventId === "string" ? eventId : typeof callback === "string" ? callback : undefined;
	}

	if(typeof params.callback === "function") {
	    params.callback();
	}
	return Promise.resolve();
};