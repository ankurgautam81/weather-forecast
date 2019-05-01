import React, { Component } from 'react';

import WeatherUI from './components/block/weather';

class App extends Component {
  render() {
    return (
      <div className="container">
        <WeatherUI />         
      </div>
    );
  }
}
export default App;