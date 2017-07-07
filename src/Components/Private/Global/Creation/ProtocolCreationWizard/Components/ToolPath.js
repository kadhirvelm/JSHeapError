import React from 'react'
import Flexbox from 'flexbox-react'

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
			isBioBot1: props.isBioBot1,
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
				{ this.state.isBioBot1 ?
					<img alt='Tool Path' src='https://biobots-ui.s3.amazonaws.com/Files/Images/590771b22206c9130039d2f6_admin%40admin.com/591aa5d211f98e19002f2b50_Screenshot%25202017-05-15%252016.55.48.png' style={ { maxHeight: '300px', maxWidth: '300px', height: 'auto', width: 'auto' } } />
					:
					<img alt='Tool Path' src='https://biobots-ui.s3.amazonaws.com/Files/Images/58e308895d998e1900aa0c42_admin%40admin.com/58e41a9aeea5a0130020538d_11.png' style={ { maxHeight: '300px', maxWidth: '300px', height: 'auto', width: 'auto' } } />
				}
			</Flexbox>
		)
   }
}

export default TitleField