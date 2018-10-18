import React, { Component } from 'react';
import logo from './logo.svg';
import Player from './Video/Player'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <Player test="test" />
      </div>
    );
  }
}

export default App;
