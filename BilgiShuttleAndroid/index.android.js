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
      <Navigator initialRoute={{id:'Splash'}} renderScene={this.renderScene.bind(this)} />
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
        return ( <Detail navigator={navigator} name={route.name} data={route.data} nodeID={route.nodeID} />);
        break;
    }
  }
}

AppRegistry.registerComponent('BilgiShuttleAndroid', () => BilgiShuttleAndroid);
