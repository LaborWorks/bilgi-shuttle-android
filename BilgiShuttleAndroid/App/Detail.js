import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Navigator,
  AppState,
  ScrollView,
  ToolbarAndroid,
  TouchableOpacity
} from 'react-native';

import Timer from './Utils/Timer';

export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: this.props.data.nodes,
      routes: this.props.data.routes.filter((route) => route.start == this.props.nodeID),
      currentAppState: AppState.currentAppState
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange.bind(this));
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
  }

  _handleAppStateChange(currentAppState) {
    this.props.navigator.pop();
  }

  getNextValues(start, destination) {
    const routes = this.state.routes;
    const next = {
      ring: false,
      in_secs: '',
      next_next_one: ''
    };

    // DISPOSABLE VARIABLES
    const currentTime = new Date();
    const routeRequested = routes.filter((route) => (route.start==start && route.destination==destination))[0];

    const routeRawData = routeRequested.raw_data.split(' - ');
    const routeTimes = [];

    // transforming raw data to time format
    routeRawData.map((time) => {
      if(time == 'Ring'){
        routeTimes.push(time);
      } else {
        let d = new Date();
        let t = time.split(':');
        d.setHours(t[0], t[1], 0);
        routeTimes.push(d);
      }
    });

    // ring check
    routeTimes.map((time, index) => {
      if(time == 'Ring' && routeTimes[index-1]){
        if(routeTimes[index-1] < currentTime && routeTimes[index+1]>currentTime) {
          next.ring = true;
        }
      }
    });

    // find next shuttles --will be used in next steps--
    const nextShuttles = routeTimes.filter((time) => time > currentTime);

    // set next.in_secs
    if(nextShuttles[0]) {
      next.in_secs = (nextShuttles[0]-currentTime) / 1000;
    } else {
      next.in_secs = 'Done For Today!';
    }

    // set next.next_next_one
    if(next.ring == true){
      next.next_next_one = nextShuttles[0].getHours()+':'+(nextShuttles[0].getMinutes() === 0 ? '00' : nextShuttles[0].getMinutes());
    } else {
        if(nextShuttles[1]) {
          next.next_next_one = nextShuttles[1].getHours()+':'+(nextShuttles[1].getMinutes() === 0 ? '00' : nextShuttles[1].getMinutes());
        } else {
          next.next_next_one = 'Done!';
        }
    }
    return next;
  }

  render() {
    console.log(this.props);
    return (
      <Navigator renderScene={this.renderScene.bind(this)} />
    );
  }

  renderScene(route, navigator) {
		const routeList = this.state.routes.map((route, index) => {

      const start = route.start;
      const destination = route.destination;
      const destinationName = this.state.nodes.filter((node) => node.id == destination)[0].name;

      // preparing 'NEXT' values for rendering
      let nextValues = this.getNextValues(start, destination);

      let timeRemaining = nextValues.in_secs;
      let isRing = nextValues.ring;
      let nextOne = nextValues.next_next_one;
      let rawData = route.raw_data;

			return (
				<View key={index} style={styles.routeBox}>
					<Text style={styles.routeDestination}> {destinationName} </Text>
					<Text style={styles.routeTime}> {isRing ? 'Ring' : (timeRemaining == 'Done For Today!' ? 'Done For Today!' : <Timer seconds={timeRemaining} nextOne={nextOne}/>)} </Text>
					<Text style={styles.routeRawData}> {rawData} </Text>
					<Text style={styles.routeNextOne}> {nextOne == 'Done!' ? ' ' : 'Next One: '+nextOne} </Text>
				</View>
			)
		})

		return (
      <View style={styles.container}>
        <ToolbarAndroid style={styles.navCore} titleColor="white" title={"Shuttles From " + this.props.name} />
        <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
    			{routeList}
    		</ScrollView>
      </View>
		);
	}
}

const styles = StyleSheet.create({
  navCore: {
    backgroundColor: '#D50000',
    height: 56
  },

  navContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  navText: {
    color: '#FFF',
    fontSize: 20
  },

  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },

  splash: {
    fontSize: 24,
    textAlign: 'center',
    color: '#000'
  },
  routeBox: {
    margin: 10,
    padding: 15,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F6F6F6',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#DDD',
    borderBottomColor: '#D50000'
  },
  routeDestination: {
    fontSize: 22,
    fontWeight: '600',
    color: '#151515',
    marginTop: 5,
    marginBottom: 20
  },
  routeTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D50000',
    marginBottom: 5
  },
  routeRawData: {
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 15,
    marginBottom: 15,
    color: '#424242',
    lineHeight: 14
  },
  routeNextOne: {
    fontSize: 12,
    fontWeight: '600',
    color: '#151515'
  }
});
