import React from 'react'
import './Public.css'

import LoginCard from './LoginCard'

import { connect } from 'react-redux'
import { mapStateToProps } from '../../State/StateMethods'

import Flexbox from 'flexbox-react'

export class Public extends React.Component{

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst(props){
		return({
			appProps: props.appProps,
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	render() {
		return(
			<Flexbox id='Public Flexbox' flexDirection="row" justifyContent="center">
				<LoginCard appProps={ this.props.appProps } />
			</Flexbox>
		)
	}

}

export default connect(mapStateToProps)(Public)
