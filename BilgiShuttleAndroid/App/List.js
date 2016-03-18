import React, {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  AsyncStorage,
  Alert,
  Navigator,
  ToolbarAndroid,
  BackAndroid,
  ProgressBarAndroid
} from 'react-native';

import Detail from './Detail';

// Device Width for Responsive Units
import Dimensions from 'Dimensions';
const deviceWidth = Dimensions.get('window').width;

// baseURL for api calls
const baseURL = 'http://api.bilgishuttle.com';

// AsyncStorage Keys
const dbVersion_KEY = '@BilgiShutte:dbVersion';
const data_KEY = '@BilgiShutte:data';

export default class List extends React.Component {
  constructor(props) {
		super(props);

    this.state = {
      loaded: false,
      dbVersion: {
      },
      data: {
        nodes: [],
        routes: []
      }
    }

    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator.getCurrentRoutes().length === 1  ) {
         return false;
      }
      this.props.navigator.pop();
      return true;
    });
  }

  // WORKING & UPDATED PART FOR ASYNCSTORAGE -------------- //
  componentDidMount() {

    // TESTING TESTING //
      // AsyncStorage.removeItem(dbVersion_KEY);
      // AsyncStorage.removeItem(data_KEY);
      // AsyncStorage.setItem(dbVersion_KEY, '0');
    // -------------- //

    AsyncStorage.getItem(dbVersion_KEY).then((value) => {
      // if db.version is null (new installed app)
      if(!value) {
        // display current data
        // console.log('Current database version: ', value);
        AsyncStorage.getItem(data_KEY).then((value) => {
          // console.log('Current Database: ', JSON.parse(value));
        });

        // message
        // console.log('There is no DB!!! Getting it...');

        // do the job!
        this.updateDatabaseVersion(value);
        this.updateData();
      }
      // if db.version is not null (we have a database!)
      else {
        // display current data
        // console.log('Current database version: ', value);
        AsyncStorage.getItem(data_KEY).then((value) => {
          // console.log('Current Data: ', JSON.parse(value));
        });

        // check database version
        // console.log('Checking Database Version');
        this.checkDatabaseVersion(value);
      }
    });
  }

  checkDatabaseVersion(currentDatabaseVersion) {
    fetch(baseURL+'/database_check.json', {headers: {'Cache-Control': 'no-cache'}})
      .then((res) => res.json())
      .then((res) => {
        // if current db is older
        if(currentDatabaseVersion < res.database_version.version_number){
            // console.log('YOUR DB IS OLD!');
            // console.log('Updating Database...');
            this.updateDatabaseVersion(currentDatabaseVersion);
            this.updateData();
        } else {
          // console.log('DB UP TO DATE!');
          this.setState({dbVersion: res.database_version});
          AsyncStorage.getItem(data_KEY).then((value) => {
            const readData = JSON.parse(value);
            this.setState({data: {nodes: readData.nodes, routes: readData.routes}, loaded: true});
          });
        }
      })
      .catch((error) => {
        Alert.alert('Warning!', 'You have no internet connection, cached DB will be used to display data!');
        AsyncStorage.getItem(data_KEY).then((value) => {
            const readData = JSON.parse(value);
            this.setState({data: {nodes: readData.nodes, routes: readData.routes}, loaded: true});
        });
      })
      .done();
  }

  updateDatabaseVersion(currentDatabaseVersion) {
    fetch(baseURL+'/database_check.json', {headers: {'Cache-Control': 'no-cache'}})
      .then((res) => res.json())
      .then((res) => {
        this.setState({dbVersion: res.database_version});
        AsyncStorage.setItem(dbVersion_KEY, this.state.dbVersion.version_number.toString());
        AsyncStorage.getItem(dbVersion_KEY).then((value) => {
          // console.log('Database updated to version: ', value);
        });
      })
      .catch((error) => {
        if(!currentDatabaseVersion){
          Alert.alert('Error!', 'You need to be connected to the internet.');
        } else {
          Alert.alert(':D', 'Version update esnasında internet giderse bu olacak');
        }
      })
      .done();
  }

  updateData() {
    fetch(baseURL+'/database_fetch_all.json', {headers: {'Cache-Control': 'no-cache'}})
      .then((res) => res.json())
      .then((res) => {
        this.setState({data: {nodes: res.nodes, routes: res.routes}, loaded: true});
        AsyncStorage.setItem(data_KEY, JSON.stringify(this.state.data));
        AsyncStorage.getItem(data_KEY).then((value) => {
          // console.log('Data updated to: ', value);
        });
      })
      .catch((error) => console.log(error))
      .done();
  }

	goToRoutePage(nodeName, nodeID) {
		this.props.navigator.push({
        id: 'Detail',
        data: this.state.data,
        name: nodeName,
        nodeID
    });
	}

	// ----------------------------------------------------- //

  render() {
    return (
      <Navigator renderScene={this.renderScene.bind(this)} />
    );
  }

  renderScene(route, navigator) {
    const nodeList = this.state.data.nodes.map((node, index) => {
			return (
				<TouchableHighlight
					key={index}
					onPress={this.goToRoutePage.bind(this, node.name, node.id)}
          style={styles.nodeBoxContainer}
					underlayColor='#ddd'
				>
					<View style={styles.nodeBox}>
						<Image
	          source={{uri: baseURL+node.image}}
	          style={styles.nodeImage}
	          resizeMode='contain'
	        	/>
						<Text style={styles.nodeTitle}>{node.name}</Text>
					</View>
				</TouchableHighlight>
			);
		});

    return (
      <View style={styles.container}>
        <ToolbarAndroid style={styles.navCore} titleColor="white" title="Bilgi Shuttle" />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {this.state.loaded
            ?
            nodeList
            :
            <ProgressBarAndroid
            style={{
              marginTop: 50,
              height: 50
            }}
            color= '#D50000'
            styleAttr="Inverse"
            />
          }
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

  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F0F0F0'
  },

  nodeBoxContainer: {
    borderRadius: 0
  },

  nodeBox: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 10,
    margin: 10,
    width: (deviceWidth/2)-30,
    height: 130,

    backgroundColor: '#F6F6F6',
    borderWidth: 2,
    borderColor: '#DDD',
    borderBottomColor: '#D50000',
  },

  nodeImage: {
    width: (deviceWidth/4),
    height: (deviceWidth/4)-30,
  },

  nodeTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    color: '#151515'
  },

});
