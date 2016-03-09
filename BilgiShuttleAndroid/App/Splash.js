import React, {
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class Splash extends Component {
  componentWillMount() {
    setTimeout( () => {
      this.props.navigator.replace ({
        id: 'List'
      });
    }, 1000);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.splash}>
          BilgiShuttle Splash Screen
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D50000'
  },
  splash: {
    fontSize: 24,
    textAlign: 'center',
    color: '#fff'
  },
});
