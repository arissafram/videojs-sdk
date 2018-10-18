import React, { Component } from 'react';
import Player from './Video/Player'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Player test="test" />
      </div>
    );
  }
}

export default App;
