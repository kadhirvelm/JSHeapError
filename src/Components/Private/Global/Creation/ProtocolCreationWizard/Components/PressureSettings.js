import React from 'react'
import Flexbox from 'flexbox-react'

import ExtruderTwo from './ExtruderTwo'
import ExtruderSix from './ExtruderSix'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import PillBox from './PillBox'

import { _ } from 'underscore'

import { forEach, curry } from 'ramda'

const textFieldStyle = { width: '150px', marginRight: '10px' }
const inputTextFieldStyle = { textAlign: 'center' }

class PressureSettings extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
			isOn: false,
			printerDisconnected: false,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			sendProperties: props.sendProperties,
			socketManager: props.socketManager,
			makeActiveExtruder: props.properties.makeActiveExtruder || false,
		})
	}

	componentWillMount(){
		if(_.isUndefined(this.state.properties.extruderPressures)){
			const finalObject = {}
			const potentialExtruders = [ 'A', 'B', 'C', 'D', 'E', 'F' ]
			const createObject = (key) => finalObject[key] = 0
			forEach(createObject, potentialExtruders)
			this.state.sendProperties('extruderPressures', finalObject)
		}
		this.state.socketManager.reconnectSocket(this.email, this.handleCallback)
	}

	handleCallback = (id, message) => {
		console.log('Pressure settings', id, message)
		if(id === 'UNREACHABLE_TARGET') {
			this.setState({ printerDisconnected: process.env.REACT_APP_DEBUG === 'true' ? false : true })
		} else if(_.isObject(message.response) && _.isObject(message.response.payload) && _.isObject(message.response.payload.temps)){
			if (message.response.payload.temps.length > 0) {
				const pressures = _.first(message.response.payload.temps)
				const pressure1 = pressures.bed.actual
				const pressure2 = !_.isUndefined(pressures.tool2) && pressures.tool2.actual
				const currPressure = this.state.properties.extruderPressures
				currPressure['A'] = pressure1
				currPressure['B'] = pressure2
				this.state.sendProperties('extruderPressures', currPressure)
			}	
		}
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	extruderSelected = (extruder, forceActive) => {
		if(this.state.makeActiveExtruder || _.isBoolean(forceActive)){
			const moveZ = _.isObject(this.state.properties.calibration) ? this.state.properties.calibration[extruder].Z : undefined
			this.state.socketManager.setActiveExtruder(extruder, moveZ)
		}
		this.setState({ selectedExtruder: extruder })
	}

	handleIncrease = () => {
		this.changePressure(true)
	}

	handleDecrease = () => {
		this.changePressure(false)
	}

	changePressure = (isIncrease) => {
		if(this.state.properties.extruderPressures[this.state.selectedExtruder] < 120) {
			this.state.socketManager.sendPressureChange( (isIncrease ? '0.25' : '-0.25'), this.state.selectedExtruder)
		}
	}

	changeMakeActive = (event, isInputChecked) => {
		this.state.sendProperties('makeActiveExtruder', isInputChecked)
		if(isInputChecked && this.state.selectedExtruder){
			this.extruderSelected(this.state.selectedExtruder, true)
		}
	}

	handleTestExtrude = (isOn, event) => {
		if( !_.isUndefined(this.state.selectedExtruder) ) {
			this.state.socketManager.testExtrude(this.state.selectedExtruder, isOn)
			this.setState({ isOn: isOn })
		}
	}

	curryHandleTestExtruder = curry(this.handleTestExtrude)

	render() {
		const isBioBot1 = (process.env.REACT_APP_DEBUG === 'true') ? (this.state.properties.currentPrinter.content.model === 'BioBot 1') : (this.state.properties.currentPrinter.content.model === 'BioBot-1')
		const extruders = isBioBot1 ? [ 'A', 'B' ] : [ 'A', 'B', 'C', 'D', 'E', 'F' ]
		return(
			<Flexbox flexDirection='row' flexBasis='content' justifyContent='space-around' flexGrow={ 1 }>
				{ this.state.printerDisconnected ?
					<div> The printer has disconnected, please connect to it again. </div>
					:
					<Flexbox flexDirection='row' flexBasis='content' justifyContent='space-around' flexGrow={ 1 }>
						{ this.state.properties.currentPrinter ?
							<Flexbox flexDirection='column'>
								{ isBioBot1 ?
									<ExtruderTwo properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.selectedExtruder } rotate={ false } />
									:
									<ExtruderSix properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.selectedExtruder } rotate={ false } />
								}
								<Toggle label='Make Active' toggled={ this.state.makeActiveExtruder } onToggle={ this.changeMakeActive } style={ { marginBottom: '15px' } } />
								<RaisedButton onMouseDown={ this.curryHandleTestExtruder(true) } onMouseUp={ this.curryHandleTestExtruder(false) } label={ (this.state.isOn ? 'Stop' : 'Test') +  ' Extrude ' + (this.state.selectedExtruder || '--') } primary={ this.state.isOn } />
							</Flexbox>
							:
							<div> Please connect to a printer </div>
						}
						{ this.state.selectedExtruder ?
							<Flexbox flexDirection='column' justifyContent='center' alignItems='center' style={ { marginLeft: '30px' } }>
								<Flexbox alignItems='center'> { this.state.makeActiveExtruder ? 'Active ' : 'Selected ' } Extruder <font color='red' style={ { marginLeft: '7px' } }> { this.state.selectedExtruder } </font> </Flexbox>
								<Flexbox alignItems='baseline'>
									<TextField floatingLabelText='Pressure (PSI)' value={ this.state.properties.extruderPressures[this.state.selectedExtruder] } style={ textFieldStyle } inputStyle={ inputTextFieldStyle } />
									<PillBox id='Pressure' increaseHandler={ this.handleDecrease } decreaseHandler={ this.handleIncrease } incrementAmount={ this.state.incrementAmount } stallPeriod={ 0.75 } />
								</Flexbox>
							</Flexbox>
							:
							<Flexbox flexWrap='wrap' justifyContent='center' alignItems='center' style={ { marginLeft: '15px', marginRight: '15px' } }> Please select an extruder to set pressure </Flexbox>
						}
						<Flexbox flexDirection='column' justifyContent='flex-start' alignItems='flex-end'>
							<div style={ { textDecoration: 'underline' } }> Current Pressure </div>
							{ extruders.map( (entry, index) => (
								<div key={ index }> { entry }: <font> { this.state.properties.extruderPressures[entry] } PSI </font> </div>
								))
							}
						</Flexbox>
					</Flexbox>
				}
			</Flexbox>
		)
   }
}

export default PressureSettings