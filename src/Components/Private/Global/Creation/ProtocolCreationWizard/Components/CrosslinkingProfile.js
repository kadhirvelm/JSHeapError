import React from 'react'
import Flexbox from 'flexbox-react'

import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import PillBox from './PillBox'

import { curry } from 'ramda'

import { _ } from 'underscore'

const textFieldPillbox = {
	width: '70%',
}

class CrosslinkingProfile extends React.Component{

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

	componentWillMount(){
		if(_.isUndefined(this.state.properties.crosslinkingProfile)) {
			this.state.sendProperties('crosslinkingProfile', {})
		}
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	handleToggle = (id, event, isInputChecked) => {
		this.sendProps(id, isInputChecked)
	}

	curryHandleToggle = curry(this.handleToggle)

	handleDecrease = (id, incrementAmount) => {
		if(this.isWithinBound(id, -incrementAmount)){
			this.sendProps(id, (this.state.properties.crosslinkingProfile[id] || 0) - incrementAmount)
		}
	}

	handleIncrease = (id, incrementAmount) => {
		if(this.isWithinBound(id, incrementAmount)){
			this.sendProps(id, (this.state.properties.crosslinkingProfile[id] || 0) + incrementAmount)
		}
	}

	isWithinBound = (id, incrementAmount) => {
		const currValue = (this.state.properties.crosslinkingProfile[id] || 0) + incrementAmount
		if(id.endsWith('intensity')){
			return ( currValue >= 0 ) && ( currValue <= 100 )
		} else {
			return currValue >= 0
		}
	}

	handleTextField = (id, event) => { 
		const newValue = parseInt(event.target.value, 10)
		if (id.endsWith('intensity') && newValue >= 0 && newValue <= 100) {
			this.sendProps(id, newValue)
		} else if (id.endsWith('intensity') && newValue < 0) {
			this.sendProps(id, 0)
		} else if (id.endsWith('intensity') && newValue > 100) {
			this.sendProps(id, 100)
		} else if ( !id.endsWith('intensity') && newValue >= 0) {
			this.sendProps(id, newValue)
		} else {
			this.sendProps(id, 0)
		}
	}

	curryHandleTextField = curry(this.handleTextField)

	sendProps = (key, value) => {
		const currCrosslinkingProfile = this.state.properties.crosslinkingProfile
		currCrosslinkingProfile[key] = value
		this.state.sendProperties('crosslinkingProfile', currCrosslinkingProfile)
	}

	render() {
		return(
			<Flexbox justifyContent='space-around' flexGrow={ 1 }>
				<Flexbox flexDirection='column'>
					<Flexbox justifyContent='center'>
						<Toggle toggled={ this.state.properties.crosslinkingProfile.always_on_crosslinking || false } onToggle={ this.curryHandleToggle('always_on_crosslinking') } label='Always On' labelPosition='left' />
					</Flexbox>
					{ this.state.properties.crosslinkingProfile.always_on_crosslinking &&
						<Flexbox>
							<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.always_on_intensity || 0) + ' %' } floatingLabelText='Crosslinking Intensity (%)' onChange={ this.curryHandleTextField('always_on_intensity') } />
							<PillBox indicator='upDownArrows' mini={ true } id='always_on_intensity' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
						</Flexbox>
					}
				</Flexbox>
				<Flexbox flexDirection='column'>
					<Flexbox justifyContent='center'>
						<Toggle toggled={ this.state.properties.crosslinkingProfile.during_print_crosslinking || false } onToggle={ this.curryHandleToggle('during_print_crosslinking') } label='During Print' labelPosition='left' />
					</Flexbox>
					{ this.state.properties.crosslinkingProfile.during_print_crosslinking &&
						<Flexbox flexDirection='column'>
							<Flexbox>
								<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.during_print_intensity || 0) + ' %' } floatingLabelText='Crosslinking Intensity (%)' onChange={ this.curryHandleTextField('during_print_intensity') } />
								<PillBox indicator='upDownArrows' mini={ true } id='during_print_intensity' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
							</Flexbox>
							<Flexbox>
								<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.during_print_frequency || 0) + ' layers' }  floatingLabelText='Frequency (layers)' onChange={ this.curryHandleTextField('during_print_frequency') } />
								<PillBox mini={ true } id='during_print_frequency' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
							</Flexbox>
							<Flexbox>
								<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.during_print_duration || 0) + ' s' } floatingLabelText='Duration (s)' onChange={ this.curryHandleTextField('during_print_duration') } />
								<PillBox mini={ true } id='during_print_duration' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
							</Flexbox>
						</Flexbox>
					}
				</Flexbox>
				<Flexbox flexDirection='column'>
					<Flexbox justifyContent='center'>
						<Toggle toggled={ this.state.properties.crosslinkingProfile.post_print || false } onToggle={ this.curryHandleToggle('post_print') } label='Post Print' labelPosition='left' />
					</Flexbox>
					{ this.state.properties.crosslinkingProfile.post_print &&
						<Flexbox flexDirection='column'>
							<Flexbox>
								<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.post_print_intensity || 0) + ' %' } floatingLabelText='Crosslinking Intensity (%)' onChange={ this.curryHandleTextField('post_print_intensity') } />
								<PillBox indicator='upDownArrows' mini={ true } id='post_print_intensity' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
							</Flexbox>
							<Flexbox>
								<TextField style={ textFieldPillbox } value={ (this.state.properties.crosslinkingProfile.post_print_duration || 0) + ' s' } floatingLabelText='Duration (s)' onChange={ this.curryHandleTextField('post_print_duration') } />
								<PillBox mini={ true } id='post_print_duration' decreaseHandler={ this.handleDecrease } increaseHandler={ this.handleIncrease } />
							</Flexbox>
						</Flexbox>
					}			
				</Flexbox>
			</Flexbox>
		)
   }
}

export default CrosslinkingProfile