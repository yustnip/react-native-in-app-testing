/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import RNIntegrationTests from 'react-native-integration-tests';

import { arrayOfTestFunctions } from './arrayOfTestFunctions';

export default class ExampleApp extends Component {
  render() {
    return (
      <View style={styles.container}>
        <RNIntegrationTests
          testFunctions={arrayOfTestFunctions}
          passedTitle="Passed"
          failedTitle="Failed"
          coverageText="Coverage of connected modules"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('ExampleApp', () => ExampleApp);
