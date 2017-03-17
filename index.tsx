import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'

let descriptions: string[] = []
let nativeFunctionsAmount: number = 0
let calledFunctions: any[] = []

/**
 * wrapOriginalFunction - Allow to track called functions
 *
 * @param  {Function} originalFunction
 * @param  {string} functionName
 * @return {Function}
 */
function wrapOriginalFunction( originalFunction: Function, functionName: string ): Function {
  return function(): Function {
    calledFunctions.push( functionName )
    return originalFunction.apply( this, arguments )
  }
}

type TMessage = {
  id: number,
  text: string,
  errorText: string
}

interface IState {
  descriptions: string[],
  passed: TMessage[],
  failed: TMessage[],
  checkFinished: boolean,
  coveragePercents: string
}

interface IProps {
  testFunctions: any[],
  passedTitle: string,
  failedTitle: string,
  coverageText: string
}

export default class ReactNativeInAppTesting extends Component<IProps, IState> {

  /**
   * @static it - For import to the usage as a test cases wrapper
   *
   * @param  {string} description
   * @param  {Function} testFunction
   * @return {Function}
   */
  public static it( description: string, testFunction: Function ): Function {
    descriptions.push( description )
    return testFunction
  }

  /**
   * @static connectModule - For import to calculate the test coverage
   *
   * @param  {Object} nativeModule
   * @return {Object}
   */
  public static connectModule( nativeModule: any ): any {
    for ( const prop in nativeModule ) {
      nativeFunctionsAmount++

      const originalFunction: Function = nativeModule[ prop ]
      nativeModule[ prop ] = wrapOriginalFunction( originalFunction, prop )
    }
    return nativeModule
  }

  constructor() {
    super()

    this.state = {
      descriptions: [],
      passed: [],
      failed: [],
      checkFinished: false,
      coveragePercents: '0'
    }
  }

  public componentDidMount(): void {
    this.run( this.props.testFunctions )
  }

  public render(): JSX.Element {
    return (
      <ScrollView
        style={ ( ( this.state.passed.length > 0 ) || ( this.state.failed.length > 0 ) ) ? styles.container : styles.hidden }
      >

      <View style={ ( this.state.passed.length > 0 ) ? styles.listContainer : styles.hidden }>
        <Text style={ styles.heading }>{ this.props.passedTitle }</Text>
        <View>
          {
            this.state.passed.map( ( message: TMessage ) => {
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
            this.state.failed.map( ( message: TMessage ) => {
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

  /**
   * async run - Test runner function
   *
   * @param  {Array} testFunctions
   * @return {void}
   */
  private async run( testFunctions: any[] ): Promise<any> {
    let i: number = 0

    for ( const testFunction of testFunctions ) {
      try {
        await testFunction()
        this.handleResolve( descriptions[ i ] )
      } catch ( error ) {
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
  private handleResolve( description: string ): void {
    this.updateList( 'passed', description )
  }

  /**
   * handleReject - For promise rejects from test functions
   *
   * @param  {string} description
   * @param  {Error} error
   * @return {void}
   */
  private handleReject( description: string, error: Error ): void {
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
  private updateList( listType: string, messageText: string, errorText?: string ): void {
    const currentList: TMessage[] = this.state[ listType ]
    const lastMessage: TMessage = currentList[ currentList.length - 1 ]

    let messageId: number
    if ( lastMessage ) {
      messageId = lastMessage.id + 1
    } else {
      messageId = 1
    }

    const message: TMessage = {
      id: messageId,
      text: messageText,
      errorText: errorText ? errorText : null
    }
    const newList: TMessage[] = [ ... currentList, message ]

    if ( listType === 'passed' ) {
      this.setState( { passed: newList } )
    } else {
      this.setState( { failed: newList } )
    }
  }

  /**
   * calculateCoverage - Calculate tests coverage based on connected modules
   *
   * @return {void}
   */
  private calculateCoverage(): void {
    const uniqCalledFunctions: any[] = [ ... new Set( calledFunctions ) ]
    const coveragePercents: number = uniqCalledFunctions.length * 100 / nativeFunctionsAmount
    const formattedCoveragePercents: string = coveragePercents.toFixed( 2 )

    this.setState( {
      coveragePercents: formattedCoveragePercents,
      checkFinished: true
    } )
  }
}

const styles: any = {
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
}
