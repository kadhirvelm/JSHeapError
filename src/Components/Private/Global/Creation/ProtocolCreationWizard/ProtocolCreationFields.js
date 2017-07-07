import React from 'react'
import Flexbox from 'flexbox-react'
import '../../../../../Transitions.css'

import MaterialList from './Components/MaterialList'
import WellPlates from './Components/WellPlates'
import TitleField from './Components/TitleField'
import PrinterList from './Components/PrinterList'
import WellDashboard from './Components/WellDashboard'
import PrinterDashboard from './Components/PrinterDashboard'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {
	Step,
  Stepper,
  StepButton,
  StepContent,
} from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'

import { _ } from 'underscore'

import { map, mapObjIndexed, prop, propEq, head, filter, length, pickAll, curry, values } from 'ramda'

class ProtocolCreationFields extends React.Component {

	constructor(props){
		super(props)
		this.state= Object.assign({}, this.propsConst(props), {
			isFetching: false,
			retrieveTemplate: this.retrieveTemplate,
			nextStep: this.nextStep,
			previousStep: this.previousStep,
			handlePrev: this.previousStep,
			dispatch: props.dispatch,
			token: props.token,
			enableWells: false,
			handleCreation: props.handleCreation,
			socketManager: props.socketManager,
			email: props.email,
		})
	}

	propsConst = (props) => {
		return({
			fields: props.fields,
			properties: props.properties,
			stepIndex: prop('stepIndex', props.properties) ? props.properties.stepIndex : 0,
			globalStep: prop('globalStep', props.properties) ? props.properties.globalStep : 0,
			sendProperties: props.sendProperties,
			allTemplates: props.allTemplates,
			awsHandler: props.awsHandler,
		})
	}

	componentWillMount(){
		if(_.isUndefined(this.state.properties.currentStep) || this.state.properties.currentStep < 0){
			this.state.sendProperties('currentStep', 0)
		}
		this.setPreparedSteps()
		window.addEventListener('resize', this.updateWindowDimensions)
		this.updateWindowDimensions()
		this.state.socketManager.updateCallback(this.handleSocketManagerCallBack)	
	}

	handleSocketManagerCallBack = (key, message) => {
		console.log('ProtocolCreationFields', key, message)
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
		//something in here to update the state once the currentStep changes
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.updateWindowDimensions)
	}

	setPreparedSteps = () => {
		const preparedSteps = mapObjIndexed(this.prepareStep, this.state.fields)
		this.setCurrentStepProperties(preparedSteps)
		const filterCurrStep = (entry) => ( entry.StepKey === this.state.properties.currentStep || this.isGlobalForCurrentStep(entry, preparedSteps) )
		this.setState({ preparedSteps: filter(filterCurrStep, preparedSteps) })
	}

	setCurrentStepProperties = (preparedSteps) => {
		const allProperties = prop('Properties', preparedSteps[this.state.properties.currentStep.toString()])
		const enableWells = allProperties.enableWells ? allProperties.enableWells : false
		this.setState({ enableWells: enableWells })
	}

	isGlobalForCurrentStep = (entry, preparedSteps) => {
		if (prop('isGlobal', entry.Properties)) {
			const stepName = prop('Name', preparedSteps[this.state.properties.currentStep.toString()])
			const equalsStepName = propEq('Step', stepName)
			if (length(filter(equalsStepName, prop('isGlobal', entry.Properties))) >= 1){
				this.setGlobalProperties(head(filter(equalsStepName, prop('isGlobal', entry.Properties))))
				return true
			}
		}
		return false
	}

	setGlobalProperties = (entryProperties) => {
		this.state.sendProperties('globalStep', parseInt(prop('Show', entryProperties), 10))
	}

	prepareStep = (step, key) => {
		const stepContents = prop('content', step)
		const stepName = stepContents.Name
		const stepProperties = stepContents.Properties ? stepContents.Properties : {}
		const steps = map(this.mapProtocolFields, map(this.retrieveTemplate, stepContents.Steps))
		return { StepKey: parseInt(key, 10), Name: stepName, Properties: stepProperties, Steps: steps }
	}

	retrieveTemplate = (entryID) => {
		const retrieve = (template) => (template._id === entryID || template.name === entryID )
		return head(filter(retrieve, this.state.allTemplates))
	}

	mapProtocolFields = (template) => {
		if(_.isObject(template) && _.isString(template.name)){
			switch(template.name) {
				case 'Title':
					return { Name: 'Title', Entry: function entry(state) { return <TitleField sendProperties={ state.sendProperties } properties={ pickAll([ 'Print Title' ], state.properties) } name='Print Title' /> } }
				case 'Printer':
					return { Name: 'Printer', Entry: function entry(state) { return <PrinterList sendProperties={ state.sendProperties } dispatch={ state.dispatch } token={ state.token } properties={ state.properties } printerID={ state.retrieveTemplate('Printer') } socketManager={ state.socketManager } email={ state.email } /> } }
				case 'Well Plate':
					return { Name: 'Well Plate', Entry: function entry(state) { return <WellPlates sendProperties={ state.sendProperties } properties={ pickAll([ 'selectedWellIndex', 'currSelectedWells', 'wellsFileAndExtruderMapping', 'completedWells' ], state.properties) } enableWells={ state.enableWells } /> } }
				case 'Materials List':
					return { Name: 'Materials List', Entry: function entry(state) { return <MaterialList sendProperties={ state.sendProperties } properties={ pickAll([ 'currSelectedExtruder', 'extruderMaterials', 'extruderSelectedTab', 'currentPrinter', 'needleGauge' ], state.properties) } 
					dispatch={ state.dispatch } token={ state.token } materialID={ state.retrieveTemplate('Material')._id } /> } }
				case 'Well':
					return { Name: 'Well', Entry: function entry(state) { return <WellDashboard sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } 
					wellTemplate={ state.retrieveTemplate('Well') } allTemplates={ state.allTemplates } mainWidth={ state.width } awsHandler={ state.awsHandler } stlTemplate={ state.retrieveTemplate('STL') } gcodeTemplate={ state.retrieveTemplate('Gcode') }
					slicingProfileTemplate={ state.retrieveTemplate('Slicing Profile Properties') } nextStep={ state.nextStep } socketManager={ state.socketManager } email={ state.email } extruderProfileTemplate={ state.retrieveTemplate('Extruder Profile') } /> } }
				case 'BioBotPrint':
					return { Name: 'Print', Entry: function entry(state) { return <PrinterDashboard sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } materialID={ state.retrieveTemplate('Material')._id } 
					handleCreation={ state.handleCreation } socketManager={ state.socketManager } previousStep={ state.previousStep } email={ state.email } /> } }
				default:
					return { Name: '', Entry: function entry() { return <div> DEFAULT </div> } }
			}
		}
	}

	previousStep = () => {
		if (this.state.properties.currentStep > 0){
			this.state.sendProperties('currentStep', --this.state.properties.currentStep)
			this.setPreparedSteps()
		}	
	}

	nextStep = () => {
		this.state.sendProperties('currentStep', ++this.state.properties.currentStep)
		this.setPreparedSteps()
	}

	maxStep = (whichStep) => {
		return length(values(prop('Steps', this.state.preparedSteps[whichStep.toString()]))) - 1
  }

	handleNext = (whichStep, event) => {
    const { stepIndex } = this.state
    if (stepIndex < this.maxStep(whichStep)) {
      this.state.sendProperties('stepIndex', stepIndex + 1)
    }
  }

  curryHandleNext = curry(this.handleNext)

  handlePrev = () => {
    const { stepIndex } = this.state
    if (stepIndex > 0) {
      this.state.sendProperties('stepIndex', stepIndex - 1)
    }
  }

  renderStepActions = (whichKey, step) => {
    return (
      <Flexbox justifyContent='flex-end' style={ { margin: '12px 0' } }>
				{ step > 0 && (
          <RaisedButton
            label='Back'
            disableTouchRipple={ true }
            disableFocusRipple={ true }
            onTouchTap={ this.handlePrev }
            style={ { marginRight: 12 } }
          />
        )}
        <RaisedButton
          label={ this.state.stepIndex < this.maxStep(whichKey) ? 'Next' : 'Finish' }
          disableTouchRipple={ true }
          disableFocusRipple={ true }
          primary={ true }
          onTouchTap={ this.state.stepIndex < this.maxStep(whichKey) ? this.curryHandleNext(whichKey) : this.nextStep }
        />
      </Flexbox>
    )
  }

  handleTouchTap = (index, preparedStep, event) => { preparedStep.StepKey === this.state.properties.currentStep ? this.state.sendProperties('stepIndex', index) : this.setGlobalStep(index) }
  curryHandleTouchTap = curry(this.handleTouchTap)

  setGlobalStep = (index) => {
		this.state.sendProperties('globalStep', index)
  }

  renderSteps = (preparedStep) => {
		if (prop('isStepper', preparedStep.Properties) === false) {
			return this.renderPlain(preparedStep)
		}
		return this.renderStepper(preparedStep)
  }

  renderPlain = (preparedStep) => {
		return (
			<Flexbox flexGrow={ 2 }> 
				{ values(preparedStep.Steps).map( (entry, index) => (
					<Flexbox key={ index }> { entry.Entry(this.state) } </Flexbox>
					))
				}
			</Flexbox>
		)
  }

  renderStepper = (preparedStep) => {
		return (
			<Flexbox flexGrow={ 1 }>
				<Stepper activeStep={ preparedStep.StepKey === this.state.properties.currentStep ? this.state.stepIndex : this.state.globalStep } linear={ false } orientation='vertical'>
				{ values(preparedStep.Steps).map( (entry, index) => (
					<Step key={ index }>
						<StepButton onTouchTap={ this.curryHandleTouchTap(index, preparedStep) }> { entry.Name } </StepButton>
						<StepContent>
							{ entry.Entry(this.state) }
							{ preparedStep.StepKey === this.state.properties.currentStep && this.renderStepActions(preparedStep.StepKey, index) }
						</StepContent>
					</Step>
					))
				}
				</Stepper>
			</Flexbox>
		)
  }

  updateWindowDimensions = () => {
		this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  styleSideBar = () => {
		return({
			width: '375px',
		})
  }

  styleMainView = () => {
		return({
			width: this.state.width - 400,
		})
  }

	render() {
		return(
			<ReactCSSTransitionGroup
					transitionName='fade-in'
					transitionAppear={ true }
					transitionAppearTimeout={ 1000 }
					transitionEnterTimeout={ 1000 }
					transitionLeaveTimeout={ 400 }
				>
				<div key={ 1 }>
					<Flexbox flexDirection='column' style={ { marginTop: '8px' } }>
						<Flexbox>
							{ this.state.properties.currentStep > 0 &&
								<RaisedButton
									label='Back'
									onClick={ this.previousStep }
									/>
							}
						</Flexbox>
						{ this.state.preparedSteps &&
							<Flexbox flexDirection='row' justifyContent='center' alignItems='flex-start' flexGrow={ 1 }>
									{ values(this.state.preparedSteps).map( (preparedStep) => (
										<Flexbox id={ preparedStep.Name } key={ preparedStep.Name } style={ preparedStep.StepKey === this.state.properties.currentStep ? this.styleMainView() : this.styleSideBar() }> { this.renderSteps(preparedStep) } </Flexbox>
										))
									}
							</Flexbox>
						}
					</Flexbox>
				</div>
			</ReactCSSTransitionGroup>
		)
  }
}

export default ProtocolCreationFields