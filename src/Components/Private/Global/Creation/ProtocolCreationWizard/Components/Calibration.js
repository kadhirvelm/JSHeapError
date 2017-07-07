import React from 'react'
import Flexbox from 'flexbox-react'

import ExtruderTwo from './ExtruderTwo'
import ExtruderSix from './ExtruderSix'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import Toggle from 'material-ui/Toggle'

import PillBox from './PillBox'

import { _ } from 'underscore'
import { svgIcon } from '../../../Display/icons'

import { curry, forEach } from 'ramda'

const textFieldStyle = { width: '50px', marginRight: '10px' }
const inputTextFieldStyle = { textAlign: 'center' }
const homeButtonsStyle={ marginTop: '8px' }
const radioButtonStyle = { marginBottom: '10px' }

class Calibration extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
			isOn: false,
			continuousExtrusion: false,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			sendProperties: props.sendProperties,
			socketManager: props.socketManager,
		})
	}

	componentWillMount(){
		if(_.isUndefined(this.state.properties.calibration)){
			const finalObject = {}
			const potentialExtruders = [ 'A', 'B' ] //come back and adjust for BioBot 2
			const createObject = (key) => finalObject[key] = this.wellPlates[this.state.properties.welltype][key]
			forEach(createObject, potentialExtruders)
			this.state.sendProperties('calibration', finalObject)
		}
	}

	wellPlates = {
		'Petri Dish': {
			A: {
				X: 56,
				Y: 90,
				Z: 45,
			},
			B: {
				X: 104.33,
				Y: 90,
				Z: 45,
			},
		},
		'6 Wells': {
      A: {
				X: 18.00,
				Y: 70.2,
				Z: 45,
			},
			B: {
				X: 66.33,
				Y: 70.2,
				Z: 45,
			},
    },
    '12 Wells': {
      A: {
				X: 18.40,
				Y: 62.90,
				Z: 45,
			},
			B: {
				X: 66.73,
				Y: 62.90,
				Z: 45,
			},
    },
    '24 Wells': {
      A: {
				X: 33.3,
				Y: 193.5,
				Z: 45,
			},
			B: {
				X: 81.6,
				Y: 193.5,
				Z: 45,
			},
    },
    '96 Wells': {
      A: {
				X: 8.10,
				Y: 58.30,
				Z: 45,
			},
			B: {
				X: 56.43,
				Y: 58.30,
				Z: 45,
			},
    },
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	sendProps = (event) => {
		this.state.sendProperties(this.state.name, event.target.value)
	}

	extruderSelected = (extruder) => {
		if(_.isUndefined(this.state.selectedExtruder)){
			this.setState({ selectedExtruder: extruder }, () => {
				this.jogPrinter()
			})
		} else {
			this.setState({ selectedExtruder: extruder })
		}
		this.state.socketManager.setActiveExtruder(extruder)
	}

	handleIncrease = (id, amount) => {
		this.adjustPropertiesWithNewCalibration(id, parseFloat(this.state.properties.calibration[this.state.selectedExtruder][id], 10) + amount)
		this.jogPrinter()
	}

	handleDecrease = (id, amount) => {
		this.adjustPropertiesWithNewCalibration(id, parseFloat(this.state.properties.calibration[this.state.selectedExtruder][id], 10) - amount)
		this.jogPrinter()
	}

	handleOnChange = (id, event) => {
		this.adjustPropertiesWithNewCalibration(id, event.target.value)
	}

	curryHandleOnChange = curry(this.handleOnChange)

	handleOnBlur = () => {
		this.jogPrinter()
	}

	jogPrinter = () => {
		this.ensureAllValuesWithinMargins()
		this.state.socketManager.jogPrinterPosition(this.state.properties.calibration[this.state.selectedExtruder])
	}

	ensureAllValuesWithinMargins = () => {
		var limitCalibrations = this.state.properties.calibration
		const minMax = this.minMax
		_.mapObject(this.state.properties.calibration, function(value, key) {
			limitCalibrations[key] = _.mapObject(value, function(value, key) {
				const minMaxValue = minMax(key)
				return Math.min( Math.max(parseFloat(value, 10), minMaxValue.min), minMaxValue.max)
			})
		})
		this.state.sendProperties('calibration', limitCalibrations)
	}

	minMaxValues = {
			X: {
				min: 0,
				max: 150,
			},
			Y: {
				min: 0,
				max: 125,
			},
			Z: {
				min: 0,
				max: 58,
			},
		}

	minMax = (id) => {
		return this.minMaxValues[id]
	}

	adjustPropertiesWithNewCalibration = (id, newValue) => {
		const currCalibration = this.state.properties.calibration
		currCalibration[this.state.selectedExtruder][id] = newValue
		this.state.sendProperties('calibration', currCalibration)
	}

	handleTestExtrude = (isOn, event) => {
		if( !_.isUndefined(this.state.selectedExtruder) ) {
			this.state.socketManager.testExtrude(this.state.selectedExtruder, isOn)
			this.setState({ isOn: isOn })
		}
	}

	curryHandleTestExtruder = curry(this.handleTestExtrude)

	handleHome = (axes, event) => {
		this.state.socketManager.sendHomeCommand(axes)
	}

	curryHandleHome = curry(this.handleHome)

	setScale = (event, value) => {
		this.setState({ incrementAmount: parseFloat(value) })
	}

	changeExtrusion = (event, isInputChecked) => {
		this.setState({ continuousExtrusion: isInputChecked })
	}

	render() {
		const isBioBot1 = (process.env.REACT_APP_DEBUG === 'true') ? (this.state.properties.currentPrinter.content.model === 'BioBot 1') : (this.state.properties.currentPrinter.content.model === 'BioBot-1')
		return(
			<Flexbox flexDirection='row' flexBasis='content' justifyContent='space-around' flexGrow={ 1 }>
				<Flexbox justifyContent='center' flexGrow={ 1 }>
					{ this.state.properties.currentPrinter ?
						<Flexbox flexDirection='column' alignItems='center'>
							{ isBioBot1 ?
								<ExtruderTwo properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.selectedExtruder } rotate={ false } />
								:
								<ExtruderSix properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.selectedExtruder } rotate={ false } />
							}
							{ this.state.continuousExtrusion ?
								<RaisedButton onTouchTap={ this.curryHandleTestExtruder(!this.state.isOn) } label={ (this.state.isOn ? 'Stop' : 'Test') +  ' Extrude ' + (this.state.selectedExtruder || '--') } primary={ this.state.isOn } />
								:
								<RaisedButton onTouchTap={ this.handleContinuousExtrusion } onMouseDown={ this.curryHandleTestExtruder(true) } onMouseUp={ this.curryHandleTestExtruder(false) } label={ (this.state.isOn ? 'Stop' : 'Test') +  ' Extrude ' + (this.state.selectedExtruder || '--') } primary={ this.state.isOn } />
							}
							<Toggle label='Continuous' onToggle={ this.changeExtrusion } style={ { marginTop: '8px' } } />
						</Flexbox>
						:
						<div style={ { marginRight: '10px', marginLeft: '10px' } }> Please connect to a printer </div>
					}
					{ this.state.selectedExtruder ?
						<Flexbox justifyContent='center' style={ { marginLeft: '40px' } }>
							<Flexbox flexDirection='column'>
								<Flexbox alignItems='baseline'>
									<TextField floatingLabelText='X' onChange={ this.curryHandleOnChange('X') } onBlur={ this.handleOnBlur } value={ Math.round(this.state.properties.calibration[this.state.selectedExtruder].X * 100) / 100 } style={ textFieldStyle } inputStyle={ inputTextFieldStyle } />
									<PillBox id='X' indicator='leftRightArrows' increaseHandler={ this.handleDecrease } decreaseHandler={ this.handleIncrease } incrementAmount={ this.state.incrementAmount } increaseLabel='Right' decreaseLabel='Left' stallPeriod={ 0.5 }
									rightDisable={ this.state.properties.calibration[this.state.selectedExtruder].X === this.minMax('X').max } leftDisable={ this.state.properties.calibration[this.state.selectedExtruder].X === this.minMax('X').min } />
								</Flexbox>
								<Flexbox alignItems='baseline'>
									<TextField floatingLabelText='Y' onChange={ this.curryHandleOnChange('Y') } onBlur={ this.handleOnBlur } value={ Math.round(this.state.properties.calibration[this.state.selectedExtruder].Y * 100) / 100 } style={ textFieldStyle } inputStyle={ inputTextFieldStyle } />
									<PillBox id='Y' indicator='upDownArrows' increaseHandler={ this.handleIncrease } decreaseHandler={ this.handleDecrease } incrementAmount={ this.state.incrementAmount } increaseLabel='Up' decreaseLabel='Down' stallPeriod={ 0.5 }
									rightDisable={ this.state.properties.calibration[this.state.selectedExtruder].Y === this.minMax('Y').max } leftDisable={ this.state.properties.calibration[this.state.selectedExtruder].Y === this.minMax('Y').min } />
								</Flexbox>
								<Flexbox alignItems='baseline'>
									<TextField floatingLabelText='Z' onChange={ this.curryHandleOnChange('Z') } onBlur={ this.handleOnBlur } value={ Math.round(this.state.properties.calibration[this.state.selectedExtruder].Z * 100) / 100 } style={ textFieldStyle } inputStyle={ inputTextFieldStyle } />
									<PillBox id='Z' indicator='platforms' increaseHandler={ this.handleDecrease } decreaseHandler={ this.handleIncrease } incrementAmount={ this.state.incrementAmount } flipIncreaseDecrease={ true } increaseLabel='Raise' decreaseLabel='Lower' stallPeriod={ 1 }
									rightDisable={ this.state.properties.calibration[this.state.selectedExtruder].Z === this.minMax('Z').max } leftDisable={ this.state.properties.calibration[this.state.selectedExtruder].Z === this.minMax('Z').min } />
								</Flexbox>
							</Flexbox>
							<Flexbox flexDirection='column' justifyContent='center' alignItems='center' style={ { marginLeft: '30px' } }>
								<div style={ { marginBottom: '5px', marginTop: '10px' } }> Scale </div>
								<RadioButtonGroup name='scale' defaultSelected='1' onChange={ this.setScale }>
									<RadioButton value='0.1' label='0.1' style={ radioButtonStyle } />
									<RadioButton value='1' label='1' style={ radioButtonStyle } />
									<RadioButton value='5' label='5' style={ radioButtonStyle } />
									<RadioButton value='10' label='10' style={ radioButtonStyle } />
								</RadioButtonGroup>
							</Flexbox>
						</Flexbox>
						:
						<Flexbox flexWrap='wrap' justifyContent='center' alignItems='center' style={ { width: '250px' } }> 
							<div style={ { textAlign: 'center', marginLeft: '15px' } }> Please select an extruder to calibrate </div> 
						</Flexbox>
					}
				</Flexbox>
				<Flexbox flexDirection='column' alignItems='flex-end' justifyContent='center'>
					<RaisedButton labelPosition='before' label='X/Y' icon={ svgIcon('x_y_home') } onTouchTap={ this.curryHandleHome([ 'x', 'y' ]) } style={ homeButtonsStyle } />
					<RaisedButton labelPosition='before' label='Z' icon={ svgIcon('z_home') } onTouchTap={ this.curryHandleHome([ 'z' ]) } style={ homeButtonsStyle } />
					<RaisedButton labelPosition='before' label='E' icon={ svgIcon('e_home') } onTouchTap={ this.curryHandleHome([ 'e' ]) } style={ homeButtonsStyle } />
				</Flexbox>
			</Flexbox>
		)
   }
}

export default Calibration