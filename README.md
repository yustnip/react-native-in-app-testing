# react-native-integration-tests

[![npm](https://img.shields.io/npm/dt/react-native-integration-tests.svg)](https://www.npmjs.com/package/react-native-integration-tests)
[![npm](https://img.shields.io/npm/v/react-native-integration-tests.svg)](https://www.npmjs.com/package/react-native-integration-tests)

A React Native component for testing native modules integration directly inside the existing app.

## Usage

1. `npm install react-native-integration-tests -D`

2. Import RNIntegrationTests module and insert the imported component into any another React Native component and specify required props:

    ```js
    import RNIntegrationTests from 'react-native-integration-tests'
    
    <View>
        <RNIntegrationTests
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
import RNIntegrationTests from 'react-native-integration-tests'
const { it, connectModule } = RNIntegrationTests

const SomeNativeModule = connectModule( NativeModules.SomeNativeModule )

```

Test functions have to be inside an array which is passed as a prop to RNIntegrationTests component.

Each of passed test functions has to return a promise and the test runner shows results in dependency of the promise state (fulfilled or rejected).

Example with [chai](https://github.com/chaijs/chai) assertion library:

```js
import { NativeModules } from 'react-native'
import RNIntegrationTests from 'react-native-integration-tests'
const { it, connectModule } = RNIntegrationTests
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
