import React from 'react'
import Flexbox from 'flexbox-react'

import Extruder from './Extruder'
import Files from './Files'
import OtherSettings from './OtherSettings'
import CrosslinkingProfile from './CrosslinkingProfile'
import WellPlates from './WellPlates'
import Overview from './Overview'

import {
	Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'

import { length, curry, prop, pickAll, sort, filter, keys, toPairs, map, forEach, head } from 'ramda'

import { _ } from 'underscore'

class WellDashboard extends React.Component {

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
			currentStep: 0,
			email: props.email,
		})
	}

	propsConst = (props) => {
		return({
			sendProperties: props.sendProperties,
			properties: props.properties,
			dispatch: props.dispatch,
			token: props.token,
			wellTemplate: props.wellTemplate,
			stlTemplate: props.stlTemplate,
			gcodeTemplate: props.gcodeTemplate,
			slicingProfileTemplate: props.slicingProfileTemplate,
			extruderProfileTemplate: props.extruderProfileTemplate,
			allTemplates: props.allTemplates,
			mappedSelectedWells: this.translateWellIndex(props.properties),
			availableExtruders: this.availableExtruders,
			mainWidth: props.mainWidth,
			awsHandler: props.awsHandler,
			nextStep: props.nextStep,
			socketManager: props.socketManager,
		})
	}

	componentWillMount(){
		this.state.socketManager.reconnectSocket(this.email, this.handleSocketManagerCallback)
		const unpreparedSteps = this.getDisplayedSteps(prop('content', this.state.wellTemplate))
		const isUndefined = (wellComponent) => _.isObject(wellComponent)
		const allUnfilteredComponents = map(this.mapWellComponentFields, unpreparedSteps)
		allUnfilteredComponents.push(this.overviewTab())
		this.setState({ preparedSteps: filter(isUndefined, allUnfilteredComponents) })
		this.state.sendProperties('calibrate', undefined)
	}

	getDisplayedSteps = (content) => {
		const sortByOrder = (a, b) => { return a[1].order - b[1].order }
		const removeDisplayNone = (templateArray) => templateArray[1].display !== 'none'
		return filter(removeDisplayNone, sort(sortByOrder, toPairs(content)))
	}

	overviewTab = () => {
		return { Name: 'Overview', Entry: function entry(state) { return <Overview sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } 
		socketManager={ state.socketManager } gcodeTemplate={ state.gcodeTemplate } /> } }
	}

	mapWellComponentFields = (template) => {
		switch(template[0]){
			case 'PrintFileList':
				return { Name: 'Upload Files', Entry: function entry(state) { return <Files sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } 
				templateId={ state.wellTemplate._id } awsHandler={ state.awsHandler } stlTemplate={ state.stlTemplate } gcodeTemplate={ state.gcodeTemplate } availableExtruders={ state.availableExtruders() } 
				slicingProfileTemplate={ state.slicingProfileTemplate } /> } }
			case 'Extruders':
				return { Name: 'Extruder Properties', Entry: function entry(state) { return <Extruder sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } 
				socketManager={ state.socketManager } extruderProfileTemplate={ state.extruderProfileTemplate } /> } }
			case 'CrosslinkingProfile':
				return { Name: 'Crosslinking Profile', Entry: function entry(state) { return <CrosslinkingProfile sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } /> } }
			case 'BedProfile':
				return (_.isObject(this.state.properties.currentPrinter) && this.state.properties.currentPrinter.content.model === 'BioBot 2') && { Name: 'Other Settings', Entry: function entry(state) { 
					return <OtherSettings sendProperties={ state.sendProperties } properties={ state.properties } dispatch={ state.dispatch } token={ state.token } /> } }
			default:
				return
		}
	}

	handleSocketManagerCallBack = (messageKey, data) => {
		console.log('WellDashboard', messageKey, data)
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	sendProps = (event) => {
		this.state.sendProperties(this.state.name, event.target.value)
	}

	maxStep = () => {
		return length(this.state.preparedSteps) - 1
  }

	handleNext = () => {
    const { currentStep } = this.state
    if (currentStep < this.maxStep()) {
      this.setState({ currentStep: currentStep + 1 })
    }
  }

  handlePrev = () => {
    const { currentStep } = this.state
    if (currentStep > 0) {
      this.setState({ currentStep: currentStep - 1 })
    }
  }

  handleFinish = () => {
		const state = this.state
		const setFinished = (wellIndex) => {
			const wellsFileAndExtruderMapping = prop('wellsFileAndExtruderMapping', state.properties)
			const currCompletedWells = prop('completedWells', state.properties) ? state.properties.completedWells : {}
			currCompletedWells[wellIndex.toString()] = {
				wellsFileAndExtruderMapping: wellsFileAndExtruderMapping ? wellsFileAndExtruderMapping[wellIndex] : {},
				errors: [],
			}
			state.sendProperties('completedWells', currCompletedWells)
		}
		forEach(setFinished, this.state.properties.currSelectedWells)
    this.state.sendProperties('globalStep', 2)
    this.state.sendProperties('currSelectedWells', [])
    this.setState({ currentStep: 0 })
  }

	handleTouchTap = (index, event) => this.setState({ currentStep: index })
  curryHandleTouchTap = curry(this.handleTouchTap)

	renderStepActions = (step) => {
    return (
      <div style={ { margin: '12px 0' } }>
        { step > 0 && (
          <RaisedButton
            label='Back'
            disableTouchRipple={ true }
            disableFocusRipple={ true }
            onTouchTap={ this.handlePrev }
          />
        )}
        <RaisedButton
          label={ this.state.currentStep < this.maxStep() ? 'Next' : 'Finish' }
          disableTouchRipple={ true }
          disableFocusRipple={ true }
          primary={ true }
          onTouchTap={ this.state.currentStep < this.maxStep() ? this.handleNext : this.handleFinish }
          style={ { marginLeft: 12 } }
        />
      </div>
    )
  }

  renderCurrentContent(){
		const currentContent = prop('Entry', this.state.preparedSteps[this.state.currentStep])
		return(
			<Flexbox flexDirection='column' flexGrow={ 1 }>
				<Flexbox justifyContent='flex-end'>
					{ this.renderStepActions(this.state.currentStep) }
				</Flexbox>
				<Flexbox flexGrow={ 1 }>
					{ currentContent(this.state) }
				</Flexbox>
			</Flexbox>
		)
  }

  translateWellIndex = (properties) => {
		const totalNumAndCols = this.numColsAndRow(prop('selectedWellIndex', properties))
		const currSelectedWells = prop('currSelectedWells', properties)
		var mappedSelectedWells = []
		if (length(currSelectedWells) > 0) {
			mappedSelectedWells = map(this.curryMappedToColAndRow(totalNumAndCols), currSelectedWells)
		}
		return mappedSelectedWells
  }

  translateSingleWellIndex = (wellIndex) => {
		const totalNumAndCols = this.numColsAndRow(prop('selectedWellIndex', this.state.properties))
		const objectRowAndCol = this.mappedToColAndRow(totalNumAndCols, wellIndex)
		return objectRowAndCol.row + objectRowAndCol.column
  }

  numColsAndRow = (type) => {
		var dimensions
		switch(type){
			case 0:
				dimensions = [ 1, 1 ]
				break
			case 1:
				dimensions = [ 3, 2 ]
				break
			case 2:
				dimensions = [ 4, 3 ]
				break
			case 3:
				dimensions = [ 6, 4 ]
				break
			case 4:
				dimensions = [ 8, 6 ]
				break
			case 5:
				dimensions = [ 12, 8 ]
				break
			default:
				dimensions = [ 0, 0 ]
		}
		return { numCol: dimensions[0], numRow: dimensions[1] }
	}

	mappedToColAndRow = (dimensions, number) => {
		const colNumber = number % dimensions.numCol
		const row = (number - colNumber) / dimensions.numCol
		return { row: String.fromCharCode(65 + row), column: colNumber + 1 }
	}

	availableExtruders = () => {
		if (this.state.properties.extruderMaterials) {
			const handleFilter = (extruderKey) => length(extruderKey) > 0
			const available = filter( handleFilter, this.state.properties.extruderMaterials)
			return length(keys(available)) > 0 ? available : undefined
		}
		return undefined
  }

	curryMappedToColAndRow = curry(this.mappedToColAndRow)

	handleWellEntryCreations = () => {
		const assembledPrintObject = this.assemblePrintObject(this.state.properties)
		this.state.sendProperties('finalPrintObject', assembledPrintObject)
		this.state.nextStep()
	}

	assemblePrintObject = (properties) => {
		console.log(properties, properties['Print Title'])
		return({
			printName: properties['Print Title'],
			welltype: properties.welltype,
			wellFiles: this.createWellFiles(properties),
			bedProfile: {},
			selectedPrinter: properties.currentPrinter,
			extruderPositions: {
				'0': { 'X': 0, 'Y': 0, 'Z': 45 },
				'1': { 'X': 0, 'Y': 0, 'Z': 45 },
			},
		})
	}

	createWellFiles = (properties) => {
		const wells = properties.wellsFileAndExtruderMapping
		var finalMapping = {}
		for( let key in wells) {
			if (wells.hasOwnProperty(key)) {
				var firstKey = this.translateSingleWellIndex(key).slice(0, 1)
				var secondKey = this.translateSingleWellIndex(key).slice(1, 2) - 1
				if (!(firstKey in finalMapping)){ finalMapping[firstKey] = {} }
				finalMapping[firstKey][secondKey] = {
					printFiles: wells[key],
					extruderProfile: {},
					imagingProfile: {},
					combinedPrint: {
						file: head(wells[key]).file,
					},
				}
			}
		}
		return finalMapping
	}

	isPrintDisabled = () => {
		return _.isUndefined(this.state.properties.currentPrinter)
	}

	savePrintEntry = () => {
		console.log('Handle save here')
	}

	render() {
		return(
			<Paper zDepth={ 2 } style={ { padding: '10px' } } >
				<Flexbox flexDirection='column' justifyContent='flex-start' alignItems='flex-start' style={ { width: this.state.mainWidth - 425 } }>
					{ (length(this.state.mappedSelectedWells) > 0 && this.availableExtruders() !== undefined) ?
						<div style={ { width: '100%' } }>
							<Flexbox justifyContent='flex-start' alignItems='center' flexWrap='wrap'>
								<Flexbox style={ { marginRight: '5px' } }>
									<h4> Setting Well Properties: &nbsp; </h4>
								</Flexbox>
								<Flexbox flexWrap='wrap'>
									{ this.state.mappedSelectedWells.map( (entry, index) => (
										<div key={ index }> { entry.row + entry.column }, &nbsp; </div>
										))
									}
								</Flexbox>
							</Flexbox>
							<Flexbox flexDirection='column' justifyContent='flex-start'>
								<Flexbox justifyContent='center' flexGrow={ 1 }>
									<Stepper activeStep={ this.state.currentStep } linear={ false } orientation='horizontal'>
										{ this.state.preparedSteps.map( (entry, index) => (
											<Step key={ index }>
												<StepButton onTouchTap={ this.curryHandleTouchTap(index) }> { entry.Name } </StepButton>
											</Step>
											))
										}
									</Stepper>
								</Flexbox>
								<Flexbox flexGrow={ 1 }>
									{ this.renderCurrentContent() }
								</Flexbox>
							</Flexbox>
						</div>
						:
						<Flexbox flexDirection='column' justifyContent='center' style={ { width: '100%' } }>
							<h2> { this.availableExtruders() ? 'Select a well to set its properties.' : 'Be sure to specify at least one extruder\'s material.' } </h2>
							{ (prop('completedWells', this.state.properties) && length(keys(this.state.properties.completedWells)) > 0) &&
								<div>
									<Flexbox justifyContent='center' alignItems='center' flexDirection='column' style={ { margin: '10px', marginBottom: '20px' } }>
										<WellPlates sendProperties={ this.state.sendProperties } properties={ pickAll([ 'selectedWellIndex', 'currSelectedWells', 'wellsFileAndExtruderMapping', 'completedWells' ], this.state.properties) } displayOnly={ true } showColors={ true } />
									</Flexbox>
									<RaisedButton
											label='Print'
											backgroundColor='#00796B'
											labelColor='#FAFAFA'
											fullWidth={ true }
											style={ { height: '75px' } }
											labelStyle={ { fontSize: 55 } }
											disabled={ this.isPrintDisabled() }
											onTouchTap={ this.handleWellEntryCreations } />
									<RaisedButton
											label='Save For Later'
											backgroundColor='#E83E45' 
											labelColor='#FAFAFA'
											fullWidth={ true }
											style={ { height: '30px', marginTop: '10px' } }
											labelStyle={ { fontSize: 15, textAlign: 'center', verticalAlign: 'middle' } }
											onTouchTap={ this.savePrintEntry } />
								</div>
							}
						</Flexbox>
					}
				</Flexbox>
			</Paper>
		)
  }
}

export default WellDashboard