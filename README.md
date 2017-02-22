# react-native-in-app-testing

[![npm](https://img.shields.io/npm/dt/react-native-in-app-testing.svg)](https://www.npmjs.com/package/react-native-in-app-testing)
[![npm](https://img.shields.io/npm/v/react-native-in-app-testing.svg)](https://www.npmjs.com/package/react-native-in-app-testing)

A React Native component for testing directly inside the existing app. It may be useful for testing native modules connected to the app.

## Usage

1. `npm install react-native-in-app-testing -D`

2. Import ReactNativeInAppTesting module and insert the imported component into any another React Native component and specify required props:

    ```js
    import ReactNativeInAppTesting from 'react-native-in-app-testing'
    
    <View>
        <ReactNativeInAppTesting
            testFunctions={ arrayOfTestFunctions }
            passedTitle="Passed"
            failedTitle="Failed"
            coverageText="Coverage of connected modules"
        />
    </View>
    ```

### How to write tests

At first import `it` and `connectModule` functions and connect native modules which are supposed to test.

```js
import ReactNativeInAppTesting from 'react-native-in-app-testing'
const { it, connectModule } = ReactNativeInAppTesting

const SomeNativeModule = connectModule( NativeModules.SomeNativeModule )

```

Test functions have to be inside an array which is passed as a prop to ReactNativeInAppTesting component.

Each of passed test functions has to return a promise and the test runner shows results in dependency of the promise state (fulfilled or rejected).

Example with [chai](https://github.com/chaijs/chai) assertion library:

*For correct work of the chai library may need to install [buffer](https://www.npmjs.com/package/buffer) as a dev dependency.*

```js
import { NativeModules } from 'react-native'
import ReactNativeInAppTesting from 'react-native-in-app-testing'
const { it, connectModule } = ReactNativeInAppTesting
import { expect } from 'chai'

const SomeNativeModule = connectModule( NativeModules.SomeNativeModule )

const testFunctions = [
    it( 'some method should return an array', () => {
        return new Promise( ( resolve, reject ) => {
            SomeNativeModule.someMethod( ( response ) => {
                    try {
                        expect( response ).to.be.instanceof( Array )
                        resolve()
                    } catch ( error ) {
                        reject( error )
                    }
                }
            )
        } )
    } )
]
```
