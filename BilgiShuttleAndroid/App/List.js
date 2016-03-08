import React, {
	View,
	ScrollView,
	Text,
	Image,
	StyleSheet,
	TouchableHighlight,
	AsyncStorage,
  Alert,
  // ActivityIndicatorIOS,
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
        console.log('Current database version: ', value);
        AsyncStorage.getItem(data_KEY).then((value) => {
          console.log('Current Database: ', JSON.parse(value));
        });

        // message
        console.log('There is no DB!!! Getting it...');

        // do the job!
        this.updateDatabaseVersion(value);
        this.updateData();
      }
      // if db.version is not null (we have a database!)
      else {
        // display current data
        console.log('Current database version: ', value);
        AsyncStorage.getItem(data_KEY).then((value) => {
          console.log('Current Data: ', JSON.parse(value));
        });

        // check database version
        console.log('Checking Database Version');
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
            console.log('YOUR DB IS OLD!');
            console.log('Updating Database...');
            this.updateDatabaseVersion(currentDatabaseVersion);
            this.updateData();
        } else {
          console.log('DB UP TO DATE!');
          this.setState({dbVersion: res.database_version});
          AsyncStorage.getItem(data_KEY).then((value) => {
            const readData = JSON.parse(value);
            this.setState({data: {nodes: readData.nodes, routes: readData.routes}, loaded: true});
          });
        }
      })
      .catch((error) => {
        AlertIOS.alert('Warning!', 'You have no internet connection, cached DB will be used to display data!');
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
          console.log('Database updated to version: ', value);
        });
      })
      .catch((error) => {
        if(!currentDatabaseVersion){
          AlertIOS.alert('Error!', 'You need to be connected to the internet.');
        } else {
          AlertIOS.alert(':D', 'Version update esnasında internet giderse bu olacak');
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
          console.log('Data updated to: ', value);
        });
      })
      .catch((error) => AlertIOS.alert(':D', 'Data update esnasında internet giderse bu olacak'))
      .done();
  }

	goToRoutePage(nodeName, nodeID) {
		this.props.navigator.push({
          component: Detail,
          title: nodeName,
          passProps: {
          	data: this.state.data,
            nodeID: nodeID,
          }
    });
	}

	// ----------------------------------------------------- //

	render() {
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
			<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
			 {this.state.loaded ? nodeList :
				 ''
			 }
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F0F0F0',
	},

  contentContainer: {
  	flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,

    backgroundColor: '#F0F0F0'
  },

  activityIndicator: {
    marginTop: 100
  },

  nodeBoxContainer: {
    borderRadius: 5
  },

  nodeBox: {
  	alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 15,
    margin: 10,
    width: (deviceWidth/2)-30,
    height: 130,

    backgroundColor: '#F6F6F6',
    borderWidth: 2,
    borderRadius: 3,
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
    marginTop: 15,
    color: '#151515'
  },
  emptyArea: {
  	flex: 1,
  	height: 250,
  	backgroundColor: 'black'
  }
});
