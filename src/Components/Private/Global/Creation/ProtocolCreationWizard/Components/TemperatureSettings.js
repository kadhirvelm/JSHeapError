import React from 'react'
import Flexbox from 'flexbox-react'

class TemperatureSettings extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			sendProperties: props.sendProperties,
			socketManager: props.socketManager,
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
				Temperature Settings
			</Flexbox>
		)
   }
}

export default TemperatureSettings