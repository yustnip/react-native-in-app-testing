var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
let descriptions = [];
let nativeFunctionsAmount = 0;
let calledFunctions = [];
function wrapOriginalFunction(originalFunction, functionName) {
    return function () {
        calledFunctions.push(functionName);
        return originalFunction.apply(this, arguments);
    };
}
export default class ReactNativeInAppTesting extends Component {
    static it(description, testFunction) {
        descriptions.push(description);
        return testFunction;
    }
    static connectModule(nativeModule) {
        for (const prop in nativeModule) {
            nativeFunctionsAmount++;
            const originalFunction = nativeModule[prop];
            nativeModule[prop] = wrapOriginalFunction(originalFunction, prop);
        }
        return nativeModule;
    }
    constructor() {
        super();
        this.state = {
            descriptions: [],
            passed: [],
            failed: [],
            checkFinished: false,
            coveragePercents: '0'
        };
    }
    componentDidMount() {
        this.run(this.props.testFunctions);
    }
    render() {
        return (<ScrollView style={((this.state.passed.length > 0) || (this.state.failed.length > 0)) ? styles.container : styles.hidden}>

      <View style={(this.state.passed.length > 0) ? styles.listContainer : styles.hidden}>
        <Text style={styles.heading}>{this.props.passedTitle}</Text>
        <View>
          {this.state.passed.map((message) => {
            return (<View key={message.id} style={styles.listItem}>
                    <Text style={styles.messageTextPassed}>- {message.text}</Text>
                  </View>);
        })}
        </View>
      </View>

      <View style={(this.state.failed.length > 0) ? styles.listContainer : styles.hidden}>
          <Text style={styles.heading}>{this.props.failedTitle}</Text>
        <View>
          {this.state.failed.map((message) => {
            return (<View key={message.id} style={styles.listItem}>
                  <Text style={styles.messageTextFailed}>- {message.text} ({message.errorText})</Text>
                </View>);
        })}
        </View>
      </View>

        <View style={this.state.checkFinished ? styles.coverageContainer : styles.hidden}>
          <Text style={styles.coverageText}>{this.props.coverageText}: {this.state.coveragePercents}%</Text>
        </View>
      </ScrollView>);
    }
    run(testFunctions) {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            for (const testFunction of testFunctions) {
                try {
                    yield testFunction();
                    this.handleResolve(descriptions[i]);
                }
                catch (error) {
                    this.handleReject(descriptions[i], error);
                }
                i++;
            }
            this.calculateCoverage();
        });
    }
    handleResolve(description) {
        this.updateList('passed', description);
    }
    handleReject(description, error) {
        this.updateList('failed', description, error.message);
    }
    updateList(listType, messageText, errorText) {
        const currentList = this.state[listType];
        const lastMessage = currentList[currentList.length - 1];
        let messageId;
        if (lastMessage) {
            messageId = lastMessage.id + 1;
        }
        else {
            messageId = 1;
        }
        const message = {
            id: messageId,
            text: messageText,
            errorText: errorText ? errorText : null
        };
        const newList = [...currentList, message];
        if (listType === 'passed') {
            this.setState({ passed: newList });
        }
        else {
            this.setState({ failed: newList });
        }
    }
    calculateCoverage() {
        const uniqCalledFunctions = [...new Set(calledFunctions)];
        const coveragePercents = uniqCalledFunctions.length * 100 / nativeFunctionsAmount;
        const formattedCoveragePercents = coveragePercents.toFixed(2);
        this.setState({
            coveragePercents: formattedCoveragePercents,
            checkFinished: true
        });
    }
}
const styles = {
    container: {
        zIndex: 10,
        padding: 20,
        paddingTop: 40,
        flex: 1,
        backgroundColor: '#fff'
    },
    listContainer: {
        marginBottom: 10
    },
    coverageContainer: {
        marginBottom: 10
    },
    heading: {
        fontSize: 16,
        marginBottom: 10,
        color: '#222'
    },
    messageTextPassed: {
        fontSize: 12,
        color: '#009688'
    },
    messageTextFailed: {
        fontSize: 12,
        color: '#FF5252'
    },
    listItem: {
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    coverageText: {
        fontSize: 12,
        color: '#222'
    },
    hidden: {
        width: 0,
        height: 0,
        opacity: 0
    }
};
