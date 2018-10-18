const google = window.google


class Ads {
  constructor() {
    this.onAdError = this.onAdError.bind(this)
    this.requestAds = this.requestAds.bind(this)
    this.onAdsManagerLoaded = this.onAdsManagerLoaded.bind(this)
    this.onContentPauseRequested = this.onContentPauseRequested.bind(this)
    this.onContentResumeRequested = this.onContentResumeRequested.bind(this)
  }

  
  sayHello(player) {
    console.log('hello')
    this.player = player
  }

  setupAds(player) {
    console.log('HERE', player)

    this.videoContent = player
    //this.videoContent = document.getElementById('contentElement');
    // this.videoContent.play()

    this.adDisplayContainer =
      new google.ima.AdDisplayContainer(
        document.getElementById('adContainer'),
        this.videoContent);

    // Must be done as the result of a user action on mobile
    this.adDisplayContainer.initialize();

    // Re-use this AdsLoader instance for the entire lifecycle of your page.
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    console.log('adsLoader:',this.adsLoader)

    // Add event listeners
    this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded,
      false);

    this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError,
      false);

    this.videoContent.on('ended', this.contentEndedListener);

    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    this.adsRequest.linearAdSlotWidth = 640;
    this.adsRequest.linearAdSlotHeight = 400;
    this.adsRequest.nonLinearAdSlotWidth = 640;
    this.adsRequest.nonLinearAdSlotHeight = 150;

    this.playButton = document.getElementById('playButton');
    this.playButton.addEventListener('click', () => this.requestAds(this.adsLoader, this.adsRequest));
  }

  onAdError(adErrorEvent) {
    // Handle the error logging and destroy the AdsManager
    console.log(adErrorEvent.getError());
    //this.adsManager.destroy();
    console.log('onAdError')
  }

  requestAds(adsLoader, adsRequest) {
    this.adsLoader.requestAds(adsRequest);
  }

  onAdsManagerLoaded(AdsManagerLoadedEvent) {
    // Get the ads manager.
    let videoContent = document.getElementById('contentElement');
    this.adsManager = AdsManagerLoadedEvent.getAdsManager(videoContent);  // See API reference for contentPlayback

    // // Add listeners to the required events.
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        () => this.onAdError(this.adsManager));

    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        () => this.onContentPauseRequested(AdsManagerLoadedEvent));
    
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        () => this.onContentResumeRequested(AdsManagerLoadedEvent));

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
      // Call start to show ads. Single video and overlay ads will
      // start at this time; this call will be ignored for ad rules, as ad rules
      // ads start when the adsManager is initialized.
      this.adsManager.start();
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      // Play content here, because we won't be getting an ad.
      this.videoContent.play();
      console.log('aderror')
    }
  }

  contentEndedListener = () => {
    console.log('contentEndedListener')
    this.adsLoader.contentComplete()
  };

  onContentPauseRequested() {
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking, etc.)
    console.log('onContentPauseRequested')
    this.videoContent.off('ended', this.contentEndedListener);
    this.videoContent.pause();
  }

  onContentResumeRequested() {
    // This function is where you should ensure that your UI is ready
    // to play content.
    console.log('onContentResumeRequested')
    this.videoContent.on('ended', this.contentEndedListener);
    this.videoContent.play();
  }



}

export default new Ads()