import React, {
  Component,
  StyleSheet,
  View,
  Image
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
        <Image source={require('./Splash.png')} style={styles.splash} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splash: {
    flex: 1,
    width: null,
    height: null
  },
});
