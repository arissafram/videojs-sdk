const google = window.google

class Ads {
  constructor() {

    // bind functions bc my text editor can't handle error functions in the middle of a class. eye roll.
    this.onAdError = this.onAdError.bind(this)
    this.requestAds = this.requestAds.bind(this)
    this.onAdsManagerLoaded = this.onAdsManagerLoaded.bind(this)
    this.onContentPauseRequested = this.onContentPauseRequested.bind(this)
    this.onContentResumeRequested = this.onContentResumeRequested.bind(this)
  }

  setupAds(player) {
    console.log('HERE', player)

    this.videoContent = player
    //this.videoContent = document.getElementById('contentElement');
    // this.videoContent.play()

    // AF: set up ads container
    // 1. reference the id of the ads container
    // 2. also give it a reference to the video node (the SDK will poll the current time of your player to properly place mid-rolls) 
    this.adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('adContainer'), this.videoContent)

    // AF: initialize the ads display container (on mobile this will have to be the result of a user action)
    this.adDisplayContainer.initialize();

    // AF: create and adsLoader object
    // - this allows us to request ads from the server 
    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    console.log('adsLoader:',this.adsLoader)

    // AF: Add event listeners to the adsLoader
    // - the AdsManagerLoadedEvent is an event raised when ads are successfully loaded from the server through the AdsLoader
    this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded,
      false);

    // - this AdErrorEvent is an event raised when there's a problem loading events from the server
    this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError,
      false);

    // AF: this.videoContent is a reference to our player
    // -- .on('ended') is an event listener that we get from videojs
    // -- when the video (not the add) ends, call this function defined below
    this.videoContent.on('ended', this.contentEndedListener);

    // AF: create an adsRequest object
    // -- this is a class that google ima gives us to specify properties on the ad request
    // -- we can send an adTagUrl to the server to get a specific ad in return
    this.adsRequest = new google.ima.AdsRequest();
    this.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // AF: specify the slot sizes for both liner AND nonliner ads
    // -- this helps the SDK select the correct sizes if multiple ads are returned
    // -- these are required parameters
    this.adsRequest.linearAdSlotWidth = 640;
    this.adsRequest.linearAdSlotHeight = 400;
    this.adsRequest.nonLinearAdSlotWidth = 640;
    this.adsRequest.nonLinearAdSlotHeight = 150;

    // AF: ad an event listener to the play btn that will trigger an add request
    this.playButton = document.getElementById('playButton');
    this.playButton.addEventListener('click', () => this.requestAds(this.adsLoader, this.adsRequest));
  }

  // AF: this is our error handler - it was attached to the adsLoader AND adsManager as an event listener
  // -- if there's an error loading the ads, it will get the error and we can log it, or destroy it, and let the video play
  onAdError(adErrorEvent) {
    console.log(adErrorEvent.getError());
    // this.adsManager.destroy();
    console.log('onAdError')
  }

  // AF: this is our ad request function - it's attached the the play button as an event listener
  // -- this is the adsRequest object that we defined above
  // -- the requestAds method triggers the call to the server
  requestAds(adsLoader, adsRequest) {
    this.adsLoader.requestAds(adsRequest);
  }


  // AF: this is our ads manager function - it's attached to the adsLoader and is called as soon as the ads are actually loaded
  onAdsManagerLoaded(AdsManagerLoadedEvent) {

    // AF: not entirely sure where this is coming from - QUESTION
    // -- I think the adsManagerLoadedEvent is an object returned from the adsLoaded when ads are loaded
    // -- it provides us with three different methods: getAdsManager(), getStreamManager(), getUserRequestContext()
    // -- pass the getAdsManager a reference to the video (not add) so that it can poll the timing etc.
    let videoContent = document.getElementById('contentElement')
    this.adsManager = AdsManagerLoadedEvent.getAdsManager(videoContent)

    // AF: add event listeners to the adsManager
    // -- the following three are methods that we defined 
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        () => this.onAdError(this.adsManager));

    // AF: QUESTION: need to ask Matt why we pass the AdsManagerLoadedEvent object to the following two, as opposed to just 'videoContent'
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        () => this.onContentPauseRequested(AdsManagerLoadedEvent));
    
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        () => this.onContentResumeRequested(AdsManagerLoadedEvent));

    // AF: as soon as this function is called, try to init the ads manager
    try {
      // -- QUESTION: what are these variables?
      // -- then call start to show ads - ads start when the adsManager is initialized.
      this.adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
      this.adsManager.start();

    // AF: id there's a problem with the VAST response, play video instead 
    } catch (adError) {

      console.log('aderror')
      this.videoContent.play();
    }
  }

  // AF: this is was added to the player as an event listener on 'ended'
  // -- it refers to the video (not add)
  contentEndedListener = () => {
    console.log('contentEndedListener')
    this.adsLoader.contentComplete()
  };

  // AF: this is added to the adsManager as an event listener
  // -- this is where we can setup the ad UI -- ad timer, countdoown, disable seeking, etc.
  onContentPauseRequested() {
    console.log('onContentPauseRequested')
    this.videoContent.off('ended', this.contentEndedListener);
    this.videoContent.pause();
  }

  // AF: this is added to the adsManager as an event listener
  // -- the docs say that this is where we 'should ensure that [the] UI is ready' - I assume this means as ad disappears
  onContentResumeRequested() {
    console.log('onContentResumeRequested')
    this.videoContent.on('ended', this.contentEndedListener);
    this.videoContent.play();
  }



}

export default new Ads()