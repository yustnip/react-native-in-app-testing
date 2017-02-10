/**
 * @flow
 */

import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    ScrollView
// $FlowIgnore
} from 'react-native'

let descriptions: Array<string> = []
let nativeFunctionsAmount: number = 0
let calledFunctions = []

/**
 * wrapOriginalFunction - Allow to track called functions
 *
 * @param  {Function} originalFunction
 * @param  {string} functionName
 * @return {Function}
 */
function wrapOriginalFunction( originalFunction: Function, functionName: string ): Function {
    return function() {
        calledFunctions.push( functionName )
        return originalFunction.apply( this, arguments )
    }
}

export default class RNIntegrationTests extends Component {
    state: {
        descriptions: Array<string>,
        passed: Array<Object>,
        failed: Array<Object>,
        checkFinished: boolean,
        coveragePercents: number
    }
    
    constructor( props: Object ) {
        super( props )
        
        this.state = {
            descriptions: [],
            passed: [],
            failed: [],
            checkFinished: false,
            coveragePercents: 0
        }
    }
    
    /**
     * @static it - For import to the usage as a test cases wrapper
     *
     * @param  {string} description
     * @param  {Function} testFunction
     * @return {Function}
     */
    static it( description: string, testFunction: Function ): Function {
        descriptions.push( description )
        return testFunction
    }
    
    /**
     * @static connectModule - To calculate the native module test coverage
     *
     * @param  {Object} nativeModule
     * @return {Object}
     */
    static connectModule( nativeModule: Object ): Object {
        for( const prop in nativeModule ) {
            nativeFunctionsAmount++
            
            const originalFunction = nativeModule[ prop ]
            nativeModule[ prop ] = wrapOriginalFunction( originalFunction, prop )
        }
        return nativeModule
    }
    
    /**
     * async run - Test runner function
     *
     * @param  {Array} testFunctions
     * @return {void}
     */
    async run( testFunctions: Array<Function> ) {
        let i = 0
        
        for ( const testFunction of testFunctions ) {
            try {
                await testFunction()
                this.handleResolve( descriptions[ i ] )
            } catch( error ) {
                this.handleReject( descriptions[ i ], error )
            }
            
            i++
        }
        this.calculateCoverage()
    }
    
    /**
     * handleResolve - For promise resolves from test functions
     *
     * @param  {string} description
     * @return {void}
     */
    handleResolve( description: string ) {
        this.updateList( 'passed', description )
    }
    
    /**
     * handleReject - For promise rejects from test functions
     *
     * @param  {string} description
     * @param  {Object} error
     * @return {void}
     */
    handleReject( description: string, error: Object ) {
        this.updateList( 'failed', description, error.message )
    }
    
    /**
     * updateList - Update passed or faled list
     *
     * @param  {string} listType
     * @param  {string} messageText
     * @param  {string} errorText?
     * @return {void}
     */
    updateList( listType: string, messageText: string, errorText?: string ) {
        const currentList = this.state[ listType ]
        const lastMessage = currentList[ currentList.length - 1 ]
        
        let messageId
        if ( lastMessage ) {
            messageId = lastMessage.id + 1
        } else {
            messageId = 1
        }
        
        const message: Object = {
            id: messageId,
            text: messageText,
            errorText: errorText ? errorText : null
        }
        const newList = [ ... currentList, message ]
        
        if ( listType === 'passed' ) {
            this.setState( { passed: newList } )
        } else {
            this.setState( { failed: newList } )
        }
    }
    
    /**
     * calculateCoverage - Calculate tests coverage of connected native modules
     *
     * @return {void}
     */
    calculateCoverage() {
        // $FlowIssue #1059
        const uniqCalledFunctions = [ ... new Set( calledFunctions ) ]
        const coveragePercents = uniqCalledFunctions.length * 100 / nativeFunctionsAmount
        const formattedCoveragePercents = coveragePercents.toFixed( 2 )
        
        this.setState( {
            // $FlowIssue #1059
            coveragePercents: formattedCoveragePercents,
            checkFinished: true
        } )
    }
    
    componentDidMount() {
        this.run( this.props.testFunctions )
    }
        
    render() {
        return (
                <ScrollView
                    style={ ( ( this.state.passed.length > 0 ) || ( this.state.failed.length > 0 ) ) ? styles.container : styles.hidden }
                >
                    
                    <View style={ ( this.state.passed.length > 0 ) ? styles.listContainer : styles.hidden }>
                        <Text style={ styles.heading }>{ this.props.passedTitle }</Text>
                        <View>
                            {
                                this.state.passed.map( ( message ) => {
                                    return (
                                        <View key={ message.id } style={ styles.listItem }>
                                            <Text style={ styles.messageTextPassed }>- { message.text }</Text>
                                        </View>
                                    )
                                } )
                            }
                        </View>
                    </View>
                    
                    <View style={ ( this.state.failed.length > 0 ) ? styles.listContainer : styles.hidden }>
                        <Text style={ styles.heading }>{ this.props.failedTitle }</Text>
                        <View>
                            {
                                this.state.failed.map( ( message ) => {
                                    return (
                                        <View key={ message.id } style={ styles.listItem }>
                                            <Text style={ styles.messageTextFailed }>- { message.text } ({ message.errorText })</Text>
                                        </View>
                                    )
                                } )
                            }
                        </View>
                    </View>
                    
                    <View style={ this.state.checkFinished ? styles.coverageContainer : styles.hidden }>
                        <Text style={ styles.coverageText }>{ this.props.coverageText }: { this.state.coveragePercents }%</Text>
                    </View>
                </ScrollView>
        )
    }
}

const styles = StyleSheet.create( {
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
} )
