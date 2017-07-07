import React from 'react'
import Flexbox from 'flexbox-react'

import BedProfile from './BedProfile'
import ImagingProfile from './ImagingProfile'

class OtherSettings extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
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
			<Flexbox flexDirection='row' justifyContent='center' flexGrow={ 1 }>
				<Flexbox flexDirection='column' alignItems='flex-start' style={ { marginLeft: '5px', marginRight: '5px' } }>
					<h3> Bed Settings </h3>
					<BedProfile sendProperties={ this.state.sendProperties } properties={ this.state.properties } name='Bed Profile' />
				</Flexbox>
				<Flexbox flexDirection='column' alignItems='flex-start' style={ { marginLeft: '5px', marginRight: '5px' } }>
					<h3> Image Preferences </h3>
					<ImagingProfile sendProperties={ this.state.sendProperties } properties={ this.state.properties } name='Image Preferences' />
				</Flexbox>	
			</Flexbox>
		)
   }
}

export default OtherSettings