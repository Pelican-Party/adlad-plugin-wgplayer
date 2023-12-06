export function wgplayerPlugin() {
	let initializeCalled = false;
	/** @type {import("$adlad").AdLadPluginInitializeContext} */
	let pluginContext;

	let onRewardSuccessCb = () => {};
	let onRewardFailCb = () => {};

	const plugin = /** @type {const} @satisfies {import("$adlad").AdLadPlugin} */ ({
		name: "wgplayer",
		async initialize(ctx) {
			if (initializeCalled) {
				throw new Error("WGPlayer plugin is being initialized more than once");
			}
			initializeCalled = true;
			pluginContext = ctx;

			ctx.setCanShowRewardedAd(false);

			await ctx.loadScriptTag(
				"https://universal.wgplayer.com/tag/?lh=play.wgplayground.com&wp=/game/testing-environment/&ws=",
			);

			/** @type {Promise<void>} */
			const initPromise = new Promise((resolve) => {
				document.addEventListener("wgSdkReady", () => {
					resolve();
				}, { once: true });
			});
			await initPromise;

			window[window.preroll.config.loaderObjectName].registerRewardCallbacks({
				onReady: () => {
					ctx.setCanShowRewardedAd(true);
				},
				onSuccess: () => {
					onRewardSuccessCb();
				},
				onFail: () => {
					onRewardFailCb();
				},
			});
		},
		async showFullScreenAd() {
			/**
			 * @type {Promise<void>}
			 */
			const promise = new Promise((resolve) => {
				window[window.preroll.config.loaderObjectName].refetchAd(() => {
					resolve();
				});
			});
			const then = performance.now();
			await promise;
			const delta = performance.now() - then;

			if (delta < 5) {
				return {
					didShowAd: false,
					errorReason: /** @type {const} */ ("time-constraint"),
				};
			} else {
				return {
					didShowAd: true,
					errorReason: null,
				};
			}
		},
		async showRewardedAd() {
			pluginContext.setCanShowRewardedAd(false);
			/** @type {Promise<boolean>} */
			const promise = new Promise((resolve) => {
				window[window.preroll.config.loaderObjectName].showRewardAd();
				onRewardSuccessCb = () => {
					resolve(true);
				};
				onRewardFailCb = () => {
					resolve(false);
				};
			});
			const success = await promise;
			if (success) {
				return {
					didShowAd: true,
					errorReason: null,
				};
			} else {
				return {
					didShowAd: false,
					errorReason: /** @type {const} */ ("unknown"),
				};
			}
		},
	});

	return plugin;
}
