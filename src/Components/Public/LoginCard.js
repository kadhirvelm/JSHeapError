import React from 'react'
import { loginUser, registerUser } from '../../State/AuthenticateActions'

import { connect } from 'react-redux'
import { mapStateToProps } from '../../State/StateMethods'

import Login from './Login'
import Register from './Register'

import { Card } from 'material-ui/Card'

import Flexbox from 'flexbox-react'
import MediaQuery from 'react-responsive'


const loginCardStyle = {
  padding: '20px',
}

export class LoginCard extends React.Component{

  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst(props){
    return({
      appProps: props.appProps,
      login_error: props.appProps.auth.login_error,
      register_error: props.appProps.auth.register_error,
      dispatch: props.appProps.dispatch,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  handleLoginUser = (values) => {
    this.state.dispatch(loginUser(values))
  }

  handleRegisterUser = (values) => {
    this.state.dispatch(registerUser(values))
  }

  render() {
    return(
      <Card
        style={ loginCardStyle }
        >
        <Flexbox id='LoginCard Box' justifyContent='center'>
          <MediaQuery minWidth={ 1224 } values={ window.testMediaQueryValues }>
            {(matches) => {
              if (matches) {
                return (
                <Flexbox
                flexDirection="row"
                alignItems="stretch"
                flexGrow={ 2 }
                justifyContent="center"
                flexWrap="wrap" >
                  <Flexbox id='Login Box' justifyContent='center'>
                    <Login
                    errorMessage={ this.state.login_error }
                    onSubmit={ this.handleLoginUser }
                      />
                  </Flexbox>
                  <Flexbox
                  minHeight="500px">
                    <div
                    className="verticalLine" />
                  </Flexbox>
                   <Flexbox id='Register Box' justifyContent='center'>
                    <Register
                      errorMessage={ this.state.register_error }
                      onSubmit={ this.handleRegisterUser }
                      />
                  </Flexbox>
                </Flexbox>
                )
              } else {
                return (
                <Flexbox
                flexDirection="column"
                alignItems="stretch"
                flexGrow={ 2 }
                justifyContent="center"
                flexWrap="wrap"> 
                  <Flexbox id='Login Box' justifyContent='center'>
                    <Login
                    errorMessage={ this.state.login_error }
                    onSubmit={ this.handleLoginUser }
                      />
                  </Flexbox>
                  <Flexbox marginTop="30px" >
                    <hr width="100%" />
                  </Flexbox>
                   <Flexbox id='Register Box' justifyContent='center'>
                    <Register
                      errorMessage={ this.state.register_error }
                      onSubmit={ this.handleRegisterUser }
                      />
                  </Flexbox>
                </Flexbox>)
              }
            }}
            </MediaQuery>
          </Flexbox>
      </Card>
    )
  }
}

export default connect(mapStateToProps)(LoginCard)
