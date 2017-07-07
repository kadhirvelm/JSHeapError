import React from 'react'
import Flexbox from 'flexbox-react'

import TextField from 'material-ui/TextField'

class BedProfile extends React.Component{

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
			<Flexbox flexDirection='column' justifyContent='center' flexGrow={ 1 }>
				<TextField onChange={ this.sendProps } defaultValue='27 C' floatingLabelText='Target Bed Temperature' />
			</Flexbox>
		)
   }
}

export default BedProfile