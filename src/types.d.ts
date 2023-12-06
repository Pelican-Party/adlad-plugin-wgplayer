interface Window {
	preroll: {
		config: {
			loaderObjectName: "wgAfgLoader";
		};
	};

	wgAfgLoader: {
		registerRewardCallbacks(callbacks: RewardCallbacks): void;
		refetchAd(callback: () => void): void;
		showRewardAd(): void;
	};
}

interface RewardCallbacks {
	onReady(): void;
	onSuccess(): void;
	onFail(): void;
}
