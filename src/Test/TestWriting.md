#Biobots Testing Framework

All tests are stored in src/Test and can be run as such:
```
npm test
npm test Components
npm test Components/Public
npm test Components/Private
npm test State
```
Don't forget to add the process.env variable before the test command, example to test the login functions using the local environment:
```
ui_local_url npm test Login
```

## Useful Resources

1. [Enzmye](https://github.com/airbnb/enzyme)

2. [Jest](https://facebook.github.io/jest/docs/api.html)

3. [React Test Utils](https://facebook.github.io/react/docs/test-utils.html)

4. [Redux Mock Store](https://github.com/arnaudbenard/redux-mock-store)

## Common Tests

| Testing Problem | Strategy | Example |
| ------------- |:-------------:| -----:|
| Mocking LocalStorage | Object.defineProperty | [StateStoreLoad](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/State/StateStoreLoad.test.js#L21), line 21 |
| Checking Routing | Setting props.router | [StateMethods](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/State/StateMethods.test.js#L13), line 13|
| Verifying Reducers|Pass in JSON and check output| [Reducers](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/State/Reducers.test.js#L38), line 38|
| Mocking AJAX Requests|Use spyOn and callFake function| [Action](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/State/Action.test.js#L23), line 23|
| Mocking the Redux Store| Use Redux Mock Store| [Action](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/State/Action.test.js#L92), line 92|
| Simulate User Interaction | Use .find.simulate and .find.get.value | [Register](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/Components/Public/Register.test.js#L63), line 63 |
| Mocking props | Pass it in as a parameter | [Private](https://github.com/biobotsdev/biobots-ui/blob/km-test_suites_2/src/Test/Components/Private/Private.test.js#L12), line 12|

