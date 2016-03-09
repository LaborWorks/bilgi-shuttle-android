'use strict';

import React, {
  AppRegistry,
  Component,
  Navigator
} from 'react-native';

import Splash from './App/Splash';
import List from './App/List';
import Detail from './App/Detail';

class BilgiShuttleAndroid extends Component {
  render() {
    return (
      <Navigator
          initialRoute={{id: 'Splash', name: 'Index'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.sceneConfig) {
              return route.sceneConfig;
            }
            return Navigator.SceneConfigs.FloatFromRight;
          }} />
    );
  }

  renderScene(route, navigator) {
    switch (route.id) {
      case 'Splash':
        return ( <Splash navigator={navigator} /> );
        break;
      case 'List':
        return ( <List navigator={navigator} /> );
        break;
      case 'Detail':
        return ( <Detail navigator={navigator} /> );
        break;
    }
  }
}

AppRegistry.registerComponent('BilgiShuttleAndroid', () => BilgiShuttleAndroid);
