import React from 'react'
import Flexbox from 'flexbox-react'

import { DefaultPlayer as Video } from 'react-html5video'
import 'react-html5video/dist/styles.css'

class PrinterImaging extends React.Component{

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
			videoFile: false,
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
				{ this.state.videoFile ?
					<Video autoPlay loop muted
						controls={ [ 'PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen' ] }
						style={ { maxHeight: '300px', maxWidth: '300px', minHeight: '265px' } }>
						<source src='test.mp4' type='video/mp4' />
					</Video>
					:
					<img alt='Tool Path' src='https://biobots-ui.s3.amazonaws.com/Files/Images/58e308895d998e1900aa0c42_admin%40admin.com/58e43f97eea5a01300205391_FFB020CE-3C3D-4D18-9DA6-6EACDAEACDF1.JPG' style={ { maxHeight: '300px', maxWidth: '300px', height: 'auto', width: 'auto' } } />
				}
			</Flexbox>
		)
   }
}

export default PrinterImaging