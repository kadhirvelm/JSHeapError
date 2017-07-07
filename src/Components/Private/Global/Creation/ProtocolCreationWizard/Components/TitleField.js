import React from 'react'
import Flexbox from 'flexbox-react'

import TextField from 'material-ui/TextField'

import { prop } from 'ramda'

class TitleField extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			name: props.name,
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	sendProps = (event) => {
		this.state.sendProperties(this.state.name, event.target.value)
	}

	render() {
		return(
			<Flexbox justifyContent='center'>
				<TextField onChange={ this.sendProps } floatingLabelText={ this.state.name } value={ prop(this.state.name, this.state.properties) || '' } />
			</Flexbox>
		)
   }
}

export default TitleField