import React, { Component, Fragment } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Ads from './Ads';

export default class Player extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.player = videojs(this.videoNode, this.props, () => {
      // window.player = this.player
    })

    Ads.setupAds(this.player)
    this.player.src(src)
  }

  componentWillUnmount() {
    this.player.dispose()
  }

  render() {
    return(
      <Fragment>
        <div id="mainContainer">
          <div id="content" style={{marginTop: "100px"}}>
            <video 
              id="contentElement"
              controls
              nativecontrolsfortouch="false"
              className="video-js vjs-scotty vjs-16-9"
              playsInline
              ref={ node => this.videoNode = node } 
              />
          </div>
          <div id="adContainer"></div>
        </div>
        <button id="playButton">Play</button>
      </Fragment>
    )
  }
}

const src = 'http://vjs.zencdn.net/v/oceans.webm'