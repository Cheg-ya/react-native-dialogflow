
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

import ApiAi from "react-native-api-ai"

export default class App extends Component {
  constructor(props) {
      super(props);

      this.state = {
          result: "",
          listeningState: "not started",
          audioLevel: 0,
      };

      console.log(ApiAi);

      ApiAi.setConfiguration(
          "INSERT_YOUR_CLENT_ACCESS_TOKEN_HERE ", ApiAi.LANG_GERMAN
      );
  }


  render() {
      return (
          <View style={styles.container}>

              <View style={{flex: 4}}>
                  <Text>{"Listening State: " + this.state.listeningState}</Text>
                  <Text>{"Audio Level: " + this.state.audioLevel}</Text>
                  <Text>{"Result: " + this.state.result}</Text>
              </View>
              <View style={{flex: 1, padding: 10}}>
                  <Button title="Start Listening" onPress={() => {

/*
                      const contexts = [{
                                       "name": "greetings",
                                       "lifespan": 3,
                                       "parameters": {
                                          "name": "Sam"
                                       }
                                    }];

                      ApiAi.setContexts(contexts);
                      */

                      ApiAi.onListeningStarted(() => {
                          this.setState({listeningState: "started"});
                      });

                      ApiAi.onListeningCanceled(() => {
                          this.setState({listeningState: "canceled"});
                      });

                      ApiAi.onListeningFinished(() => {
                          this.setState({listeningState: "finished"});
                      });

                      ApiAi.onAudioLevel(level => {
                          this.setState({audioLevel: level});
                      });

                      ApiAi.startListening(result => {
                          this.setState({result: result});
                      }, error => {
                          this.setState({result: error});
                      });

                  }}/>
              </View>
          </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F5FCFF',
  },

});

AppRegistry.registerComponent('ApiAiExample', () => App);
