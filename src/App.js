import React from 'react'
import './App.css'
import './Transitions.css'

import { mapStateToProps } from './State/StateMethods'

import { Private } from './Components/Private/Private'

import Flexbox from 'flexbox-react'

import { connect } from 'react-redux'

import ReactCSSTransitonReplace from 'react-css-transition-replace'

require('dotenv').config()

export class App extends React.Component {

  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst(props) {
    return({
      authenticated: props.auth.isAuthenticated,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  render() {
    return(
      <Flexbox flexDirection='column'>
        <ReactCSSTransitonReplace
            transitionName={ 
              {
                enter: 'app-enter',
                enterActive: 'app-enter-active',
                leave: 'app-leave',
                leaveActive: this.state.authenticated ? 'slide-right' : 'slide-left',
                appear: 'app-appear',
                appearActive: 'app-appear-active',
              }
            }
            transitionAppear={ true }
            transitionAppearTimeout={ 1000 }
            transitionEnterTimeout={ 1000 }
            transitionLeaveTimeout={ 400 }
            >
          <Private appProps={ this.props } />
        </ReactCSSTransitonReplace>
      </Flexbox>
      )
  }

}

export default connect(mapStateToProps)(App)
