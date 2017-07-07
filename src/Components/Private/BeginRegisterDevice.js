import React from 'react'

import { connect } from 'react-redux'
import { mapStateToProps } from '../../State/StateMethods'
import Flexbox from 'flexbox-react'

import { Public } from '../Public/Public'
import RegisterDevice from './RegisterDevice'

export class BeginRegisterDevice extends React.Component{

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst(props){
		return({
			dispatch: props.dispatch,
			authenticated: props.auth.isAuthenticated,
			token: props.auth.auth_token,
			email: props.auth.email,
			name: props.auth.name,
			deviceRegistration: props.match.params.id,
			registerDeviceResponse: props.biobots.registerDeviceResponse,
			isFetching: props.biobots.isFetching,
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	render() {
		return(
			<Flexbox justifyContent='center'>
				{ this.state.authenticated ?
					<RegisterDevice dispatch={ this.state.dispatch } token={ this.state.token } email={ this.state.email } name={ this.state.name } deviceRegistration={ this.state.deviceRegistration } 
					registerDeviceResponse={ this.state.registerDeviceResponse } isFetching={ this.state.isFetching } />
					:
					<Flexbox flexDirection='column' alignItems='center'>
						<font size={ 5 } style={ { marginBottom: '10px' } }> <b> Please login to register device { this.state.deviceRegistration } </b> </font>
						<Public appProps={ this.props } />
					</Flexbox>
				}
			</Flexbox>
		)
  }
}

export default connect(mapStateToProps)(BeginRegisterDevice)
