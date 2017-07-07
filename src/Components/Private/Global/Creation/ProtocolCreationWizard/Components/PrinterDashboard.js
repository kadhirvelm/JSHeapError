import React from 'react'
import Flexbox from 'flexbox-react'

import WellPlates from './WellPlates'
import MaterialList from './MaterialList'
import ToolPath from './ToolPath'
import PrinterImaging from './PrinterImaging'

import LinearProgress from 'material-ui/LinearProgress'
import Dialog from 'material-ui/Dialog'
import { Tabs, Tab } from 'material-ui/Tabs'
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'

import Calibration from './Calibration'
import PressureSettings from './PressureSettings'

import { svgIcon } from '../../../Display/icons'

import { split } from 'ramda'
import { _ } from 'underscore'

var moment = require('moment')

require('moment-duration-format')

const emergencyStopStyle = {
	icon: {
    width: 27,
    height: 27,
  },
  button: {
    width: 35,
    height: 35,
    padding: 0,
  },
}

class PrinterDashboard extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
			extruderCalibration: {
				A: {},
				B: {},
			},
			email: props.email,
			attemptingToCancel: false,
			openTools: false,
			openDashboardTools: false,
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			token: props.token,
			dispatch: props.dispatch,
			materialID: props.materialID,
			name: props.name,
			handleCreation: props.handleCreation,
			socketManager: props.socketManager,
			previousStep: props.previousStep,
			isBioBot1: props.properties.currentPrinter && props.properties.currentPrinter.content.version === 1,
			printerDashboardModalStep: props.properties.printerDashboardModalStep || 0,
			calibrate: _.isUndefined(props.properties.calibrate) ? true : props.properties.calibrate,
			isPaused: props.properties.isPaused,
			isCanceled: props.properties.isCanceled || false,
		})
	}
	
	handleSocketManagerCallback = (key, message) => {
		console.log('printer dashboard', key, message)
		if (key === 'UPDATE' && !_.isUndefined(message.response) && !_.isUndefined(message.response.payload) ) {
			const progress = message.response.payload.progress || { printTimeLeft: '', printTime: '' }
			const position = message.response.payload.position || { 'X': '', 'Y': '', 'Z': '' }
			this.setState({ progress: progress, extruderPosition: position })
		}
	}

	componentWillMount(){
		this.state.socketManager.reconnectSocket(this.email, this.handleSocketManagerCallback)
		this.createPrintEntry()
	}

	createPrintEntry = () => {
		this.state.handleCreation({ test: 'test' })
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	componentDidMount(){
		if(this.state.isBioBot1){
			this.sendHomeAndWellPlateCommands()
		}
	}

	style = () => {
		return({
			margin: '15px',
			padding: '2px',
		})
	}

	sendHomeAndWellPlateCommands = () => {
		this.state.socketManager.sendHomeCommand([ 'z', 'e', 'x', 'y' ])
		this.state.socketManager.sendWellPlateValue(this.returnWellNumber(this.state.properties.welltype))
	}

	returnWellNumber = (wellnumber) => {
		if(wellnumber === 'Petri Dish') {
			return 1
		} else {
			return parseInt(wellnumber, 10)
		}
	}

	openCalibrationScreen = () => {
		this.state.sendProperties('calibrate', true)
	}

	handleBackModal = () => {
		this.state.sendProperties('calibrate', false)
		this.state.previousStep()
	}

	handlePreviousModal = () => {
		this.state.sendProperties('printerDashboardModalStep', --this.state.printerDashboardModalStep)
	}

	handleNextModal = () => {
		this.state.sendProperties('printerDashboardModalStep', ++this.state.printerDashboardModalStep)
	}

	completeCalibrationScreen = () => {
		this.handleCalibration()
		const currFinalPrintObject = this.state.properties.finalPrintObject
		const currentExtruderCalibration = this.state.properties.calibration
		currFinalPrintObject.extruderPositions = {
			'0': { 
				'X': currentExtruderCalibration.A.X,
				'Y': currentExtruderCalibration.A.Y,
				'Z': currentExtruderCalibration.A.Z,
			},
			'1': {
				'X': currentExtruderCalibration.B.X,
				'Y': currentExtruderCalibration.B.Y,
				'Z': currentExtruderCalibration.B.Z,
			},
		}
		this.state.socketManager.sendPrintParameters(this.state.properties.finalPrintObject)
		this.state.sendProperties('calibrate', false)
	}

	handleCalibration = () => {
		const currentExtruderCalibration = this.state.properties.calibration
		const extruderPositions = {
			'tool0': {
				'X': currentExtruderCalibration.A.X,
				'Y': currentExtruderCalibration.A.Y,
				'Z': currentExtruderCalibration.A.Z,
			},
			'tool1': {
				'X': currentExtruderCalibration.B.X,
				'Y': currentExtruderCalibration.B.Y,
				'Z': currentExtruderCalibration.B.Z,
			},
		}
		this.state.socketManager.sendPrintCalibrateValues(extruderPositions)
	}

	getCurrentStep = (retrieveStep) => {
		switch(_.isUndefined(retrieveStep) ? this.state.printerDashboardModalStep : retrieveStep){
			case 0:
				return <PressureSettings properties={ this.state.properties } sendProperties={ this.state.sendProperties } socketManager={ this.state.socketManager } />
			case 1:
				return <Calibration properties={ this.state.properties } sendProperties={ this.state.sendProperties } socketManager={ this.state.socketManager } />
			default:
				return
		}
	}

	emergencyStop = () => {
		this.state.socketManager.sendEmergencyStop()
		this.handleBackModal()
	}

	renderBioBotCalibrationModal = () => {
		const isFirstStep = (this.state.printerDashboardModalStep === 0)
		const isLastStep = (this.state.printerDashboardModalStep === 1)
		return(
			<div>
			{ this.state.isBioBot1 &&
				<Dialog title='Prepare Print' modal={ true } open={ this.state.calibrate } onRequestClose={ this.onRequestClose } >
					<Flexbox flexGrow={ 1 } flexDirection='column'>
						<Flexbox flexDirection='column' alignItems='stretch'>
							<Stepper activeStep={ this.state.printerDashboardModalStep }>
								<Step>
									<StepLabel> Set Pressure </StepLabel>
								</Step>
								<Step>
									<StepLabel> Calibrate </StepLabel>
								</Step>
							</Stepper>
							<div>
								{ this.getCurrentStep() }
							</div>
						</Flexbox>
						<Flexbox alignItems='flex-end'>
							<Flexbox justifyContent='flex-start'>
								<IconButton tooltip='Emergency Stop' iconStyle={ emergencyStopStyle.icon } style={ emergencyStopStyle.button } tooltipPosition='top-center' onTouchTap={ this.emergencyStop }>
									{ svgIcon('stop') }
								</IconButton>
							</Flexbox>
							<Flexbox flexGrow={ 1 } justifyContent='flex-end' style={ { marginTop: '10px' } }>
								<RaisedButton label={ isFirstStep ? 'Cancel Print' : 'Back' } onTouchTap={ isFirstStep ? this.handleBackModal : this.handlePreviousModal } />
								<RaisedButton label={ isLastStep ? 'Set Calibration' : 'Next' } primary={ true } onTouchTap={ isLastStep ? this.completeCalibrationScreen : this.handleNextModal } style={ { marginLeft: '5px' } } />
							</Flexbox>
						</Flexbox>
					</Flexbox>
				</Dialog>
			}
			</div>
		)
	}

	timeLeft = () => {
		const timeLeft = this.state.progress ? split(':', moment.duration(this.state.progress.printTime, 'seconds').format('hh:mm')) : [ '--', '--' ]
		const minutesLeft = timeLeft.pop()
		const hoursLeft = timeLeft.pop() || 0
		return { hours: hoursLeft, minutes: minutesLeft }
	}

	handlePauseAndResume = () => {
		this.state.socketManager.sendRunningCommand(!this.state.isPaused ? 'start' : 'pause')
		this.state.sendProperties('isPaused', !this.state.isPaused)
	}

	handleCancel = () => {
		if(!this.state.isCanceled) {
			this.closeRequestToCancel()
		}
		this.state.socketManager.sendRunningCommand(!this.state.isCanceled ? 'restart' : 'cancel')
		this.state.sendProperties('isCanceled', !this.state.isCanceled)
	}

	openRequestToCancel = () => this.setState({ attemptingToCancel: true })
	closeRequestToCancel = () => this.setState({ attemptingToCancel: false })

	handleToolsTap = (event) => {
		event.preventDefault()
		this.setState({ openTools: true, anchorTools: event.currentTarget })
	}

	handleToolsRequestClose = () => this.setState({ openTools: false })

	handleToolSelection = (event, value) => {
		this.handleToolsRequestClose()
		switch(value) {
			case 'pressure':
				this.openDashboardTools(0)
				break
			case 'jogPanel':
				this.openDashboardTools(1)
				break
			case 'calibrate':
				this.state.sendProperties('printerDashboardModalStep', 0)
				this.openCalibrationScreen()
				break
			case 'state':
				console.log('Handle state')
				break
			default:
				break
		}
	}

	openDashboardTools = (number) => {
		console.log('Setting dashboard tool number', number)
		this.setState({ dashboardToolNumber: number, openDashboardTools: true })
	}

	closeDashboardTools = () => this.setState({ openDashboardTools: false })

	render() {
		const attemptToCancelActions = [
			<RaisedButton key='back' label='Back' onTouchTap={ this.closeRequestToCancel } />,
			<RaisedButton key='confirm' label='Confirm Cancel' primary={ true } onTouchTap={ this.handleCancel } style={ { marginLeft: '10px' } } />,
		]

		const dashboardToolsActions = [
			<RaisedButton key='done' label='Done' onTouchTap={ this.closeDashboardTools } />,
		]
		const timeLeft = this.timeLeft()
		return(
			<Flexbox flexDirection='column' flexGrow={ 1 }>
				<Flexbox alignItems='flex-start' style={ { borderStyle:'solid', background: 'white', borderWidth: '1px' } }>
					<Flexbox flexDirection='column' flexGrow={ 1 } style={ this.style() }>
						<h4> Well Plate </h4>
						<WellPlates properties={ this.state.properties } displayOnly={ true } />
					</Flexbox>
					<Flexbox flexGrow={ 1 } style={ this.style() }>
						<Tabs tabItemContainerStyle={ { background: '#424242' } } inkBarStyle={ { background: '#E0E0E0' } }>
							<Tab label='Tool Path'>
								<div style={ this.style() }>
									<ToolPath properties={ this.state.properties } dispatch={ this.state.dispatch } token={ this.state.token } isBioBot1={ this.state.isBioBot1 } />
								</div>
							</Tab>
							{ !this.state.isBioBot1 && 
								<Tab label='Live Feed'>
									<div style={ this.style() }>
										<PrinterImaging properties={ this.state.properties } dispatch={ this.state.dispatch } token={ this.state.token } />
									</div>
								</Tab>
							}
						</Tabs>
					</Flexbox>
					<Flexbox flexDirection='column' flexGrow={ 1 } style={ this.style() }>
						<h4> Extruders and Materials </h4>
						<MaterialList properties={ this.state.properties } dispatch={ this.state.dispatch } token={ this.state.token } displayOnly={ true } materialID={ this.state.materialID } />
					</Flexbox>
				</Flexbox>
				<Flexbox flexDirection='row' flexGrow={ 2 }>
					<Flexbox flexBasis='content' alignItems='center'>
							<RaisedButton label={ this.state.isPaused ? 'Resume' : 'Pause' } primary={ this.state.isPaused } disabled={ this.state.isCanceled } onTouchTap={ this.handlePauseAndResume } />
							<RaisedButton label={ this.state.isCanceled ? 'Restart' : 'Cancel Print' } primary={ this.state.isCanceled } onTouchTap={ this.state.isCanceled ? this.handleCancel : this.openRequestToCancel } style={ { marginLeft: '15px' } } />
							<Dialog title='Cancel Print?' modal={ false } open={ this.state.attemptingToCancel } onRequestClose={ this.closeRequestToCancel } actions={ attemptToCancelActions }>
								<Flexbox justifyContent='center'>
									<div> Are you sure you want to cancel this print? You cannot undo this action. </div>
								</Flexbox>
							</Dialog>
					</Flexbox>
					<Flexbox flexGrow={ 1 } justifyContent='flex-end' alignItems='center'>
						<IconButton tooltip='Emergency Stop' iconStyle={ emergencyStopStyle.icon } style={ emergencyStopStyle.button } tooltipPosition='top-center' onTouchTap={ this.emergencyStop }>
							{ svgIcon('stop') }
						</IconButton>
						<IconButton id='Drawer Open'
									tooltip='Open Tools'
									onTouchTap={ this.handleToolsTap } //this.openCalibrationScreen }
									tooltipPosition='bottom-center'
									style={ { marginLeft: '10px' } }>
							{ svgIcon('settings') }
						</IconButton>
						<Popover open={ this.state.openTools } anchorEl={ this.state.anchorTools } anchorOrigin={ { horizontal: 'right', vertical: 'center' } } targetOrigin={ { horizontal: 'left', vertical: 'center' } } onRequestClose={ this.handleToolsRequestClose }>
							<Menu onChange={ this.handleToolSelection }>
								<MenuItem value='pressure' primaryText='Adjust Pressure' />
								<MenuItem value='jogPanel' primaryText='Jog Panel' />
								<MenuItem value='state' primaryText='Printer State' />
								<MenuItem value='calibrate' primaryText='Re-calibrate' />
							</Menu>
						</Popover>
						<Dialog title='Dashboard Tools' modal={ false } open={ this.state.openDashboardTools } onRequestClose={ this.closeDashboardTools } actions={ dashboardToolsActions }>
							<Flexbox flexDirection='column' alignItems='stretch'> { this.getCurrentStep(this.state.dashboardToolNumber) } </Flexbox>
						</Dialog>
					</Flexbox>			
				</Flexbox>
				<Flexbox flexDirection='column' flexGrow={ 1 } style={ { marginTop: '20px' } }>
					{ !this.state.calibrate &&
						<div>
							<LinearProgress mode={ this.state.progress ? 'indeterminate' : 'determinate' } value={ 0 } />
							<font size={ 20 }> <b> { timeLeft.hours } hours { timeLeft.minutes } minutes </b> </font>
						</div>
					}
				</Flexbox>
				{ this.renderBioBotCalibrationModal() }
			</Flexbox>
		)
   }
}

export default PrinterDashboard