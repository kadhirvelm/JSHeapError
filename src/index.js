import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import thunkMiddleware from 'redux-thunk'
import injectTapEventPlugin from 'react-tap-event-plugin'

import biobotsApp from './State/Reducers'
import { saveState, loadState } from './State/StateStoreLoad'

import * as _colors from 'material-ui/styles/colors'
import { fade } from 'material-ui/utils/colorManipulator'
import { getMuiTheme } from 'material-ui/styles'

import BeginRegisterDevice from './Components/Private/BeginRegisterDevice'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

require('dotenv').config()

let createStoreWithThunk = applyMiddleware(thunkMiddleware)(createStore)
const persistedState = loadState()
let store = createStoreWithThunk(biobotsApp, persistedState)

store.subscribe( () => {
	saveState(store.getState())
})

injectTapEventPlugin()

const muiTheme = getMuiTheme({
  fontFamily: 'DINPro',
  palette: {
    primary1Color: '#EB3C40',
    primary2Color: '#EB3C40',
    primary3Color: _colors.grey400,
    accent1Color: '#b71c1c',
    accent2Color: _colors.grey100,
    accent3Color: _colors.grey500,
    textColor: _colors.grey800,
    secondaryTextColor: fade(_colors.grey800, 0.54),
    alternateTextColor: _colors.white,
    canvasColor: _colors.white,
    borderColor: _colors.grey300,
    disabledColor: fade(_colors.grey800, 0.3),
    pickerHeaderColor: _colors.cyan500,
    clockCircleColor: fade(_colors.grey800, 0.07),
    shadowColor: _colors.fullBlack,
  },
})

//17 128 128 -- teal: #118080
//235 60 64 -- red: #EB3C40

ReactDOM.render((
	<MuiThemeProvider muiTheme={ muiTheme }>
		<Provider store={ store }>
			<BrowserRouter>
        <Switch>
          <Route path='/register/:id' component={ BeginRegisterDevice } />
          <Route path='/*' component={ App } />
        </Switch>
			</BrowserRouter>
		</Provider>
  </MuiThemeProvider>),
  document.getElementById('root')
)