import React from 'react'

import { getAllEntries } from '../../../../../State/EntryActions'
import { resize } from '../../../../../State/WebsiteActions'

import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import { Step, Stepper, StepContent, StepButton } from 'material-ui/Stepper'

import AutocompleteBiobots from '../AutocompleteBiobots'

import Flexbox from 'flexbox-react'
import { Field, reduxForm } from 'redux-form'
import { renderFields } from './CreationUtils'
import moment from 'moment'

import SetCreator from './SetCreator'
import GraphVisual from '../../Display/GraphVisual'
import TableVisual from '../../Display/TableVisual'

import { head, filter, prop, map, add, subtract, sort, isEmpty, dissoc, curry } from 'ramda'

import { svgIcon } from '../../Display/icons'

const submitStyle = {
  marginTop: '10px',
}

const textStyle = {
  width: '100%',
  minWidth: '304px',
}

const menuIcon = {
	width: 16,
	height: 16,
}

var requiredFields = []

const validate = (values) => {
	const errors = {}
	const check = requiredFields
	check.forEach( (field) => {
		if (!values[field]) {
			errors[field] = 'Required'
		}
	})
	return errors
}

class DataFields extends React.Component {

	constructor(props) {
		super(props)
		this.createArrayField = this.createArrayField.bind(this)
		this.createFields = this.createFields.bind(this)
		this.selectedSets = {}
		this.state = this.propsConst(props)
		this.totalSets = 1
	}

	propsConst(props) {
		return ({
			all_templates: props.all_templates,
			templateId: props.templateId,
			submit: props.handleSubmit,
			selectedSets: this.state ? this.state.selectedSets : {},
			token: props.token,
			dispatch: props.dispatch,
			newSet: this.state ? this.state.newSet : false,
			resize: props.resize,
			setDisplayProperties: props.setDisplayProperties,
			setSets: props.setSets,
			stepIndex: this.state ? this.state.stepIndex : 0,
			finished: this.state ? this.state.finished : false,
		})
	}

	createField = (template) => { return this.createFields(template.name, template.default, template.display, template.type) }

	componentWillMount() {
		this.props.reset()
		this.renderAllFields()
	}

	renderAllFields = () => {
		const all_fields = renderFields(this.props, this.createField)
		this.setState({ fields: all_fields[0] })
		requiredFields = filter( (entry) => entry !== 'Set', all_fields[1])
	}

	componentDidMount(){
		this.setAutocompleteSets()
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	setAutocompleteSets = () => {
		const setPromise = this.setAvailableSets(this.props, this.state)
		setPromise.then( (values) => {
			this.setState({ sets: values.set, allSets: values.allSet })
		})
	}

	setAvailableSets(props, state){
		return new Promise( function(resolve) {
			const seriesTemplateFilter = (template) => template.name === 'Data Set'
			const seriesTemplate = head(filter(seriesTemplateFilter, props.all_templates))
			const createMenuItem = (set) => { return ({
				text: set[0] + ' - ' + set[2],
				id: set[1],
				value: (<MenuItem primaryText={ set[0] } secondaryText={ set[2] } />),
			})}
			const sortByDate = (entryA, entryB) => { return new Date(entryB.updatedAt) - new Date(entryA.updatedAt) }
			const extractName = (set) => [ prop('Name', set.content), prop('_id', set), moment(new Date(prop('updatedAt', set))).format('MM/DD-hh a') ]
			const setValues = (values) => { resolve({ set: map(createMenuItem, map(extractName, sort(sortByDate, values))), allSet: values }) }
			return state.dispatch(getAllEntries(state.token, { templateId: [ seriesTemplate._id ] }, setValues))
		})
	}

	createFields(name, default_value, display, type) {
		switch(type){
			case 'string':
				return this.createStringField(display, default_value, name)
			case 'array':
				return this.createArrayField(display, default_value, name)
			default:
				return <div> DEFAULT </div>
		}
	}

	createStringField(display, default_value, name) {
		var component
		switch(display){
			case 'line':
				component = ({ input, meta: { touched, error } }) => (
						<TextField id={ name } floatingLabelText={ name }
						style={ textStyle } inputStyle={ textStyle } 
						errorText={ touched && error }
						{ ...input } />
					)
				break
			case 'paragraph':
				component = ({ input, meta: { touched, error } }) => (
						<TextField id={ name } floatingLabelText={ name }
						style={ textStyle } inputStyle={ textStyle }
						multiLine={ true } rows={ 5 }
						errorText={ touched && error }
						{ ...input } />
					)
				break
			default:
				return <div> DEFAULT </div>
		}
		return(<Field key={ name } name={ name } component={ component } label={ name } />)
	}

	createArrayField(display, default_value, name) {
		switch(display){
			case 'list':
				return (
					<Flexbox key={ name } flexDirection='row' style={ { marginTop: '5px' } }>
						<Flexbox flexDirection='column' justifyContent='flex-start' alignItems='flex-start' style={ { marginTop: '13px' } }>
							{ name } :
						</Flexbox>
						<Flexbox flexDirection='column' justifyContent='flex-start' flexGrow={ 2 }>
							{ this.allAutoCompleteSets().map( (field, index) => (
								<div key={ index }> { field } </div>
								))}
						</Flexbox>
						<Flexbox flexDirection='column' justifyContent='flex-start' alignItems='flex-end' style={ { marginLeft: '25px', marginTop: '4px' } }>
							<RaisedButton label='New Set' onClick={ this.changeSetDialog } />
							<Flexbox>
								<IconButton id='minusSet'
								tooltip='Remove a set'
								tooltipPosition='bottom-left'
								onTouchTap={ this.subtract }
								iconStyle={ menuIcon }
								>
									{ svgIcon('minus') }
								</IconButton>
								<IconButton id='addSet'
								tooltip='Add a set'
								tooltipPosition='bottom-left'
								onTouchTap={ this.add }
								iconStyle={ menuIcon }
								>
									{ svgIcon('plus') }
								</IconButton>
							</Flexbox>
						</Flexbox>
					</Flexbox>
				)
			case 'factory':
				return <Field key={ name } name={ name } component={ this.visualizationField } label={ name } />
			default:
				return <div> DEFAULT </div>
		}
	}

	subtract = () => { 
		if (this.totalSets > 1) {
			const currSets = this.state.selectedSets
			const lastIndex = (this.totalSets - 1).toString()
			if (prop(lastIndex, currSets)) {
				this.selectedSets = dissoc(lastIndex, this.selectedSets)
				this.setState({ selectedSets: dissoc(lastIndex, currSets) })
			}
			this.changeSets(subtract(this.totalSets, 1))
		} 
	}
	add = () => { this.changeSets(add(this.totalSets, 1)) }

	changeSets = (newNum) => {
		this.totalSets = newNum
		this.renderAllFields()
	}

	allSets = () => this.state.allSets

	allAutoCompleteSets = () => {
		var sets = []
		for ( var index = 0; index < this.totalSets; index++){
			sets.push( <AutocompleteBiobots index={ index.toString() } searchText={ this.selectedSets ? this.selectedSets[index] : '' } allSets={ this.sets } handleClose={ this.handleClose } /> )
		}
		return sets
	}

	sets = () => this.state.sets

	visualizationField = ({ input, meta: { touched, error } }) => {
		const options = [ 'Table', 'Graph' ]
		const changeVisualization = (event, index, value) => { 
			this.setState({ visualization: options[value - 1] })
			input.onChange(value)
			if (this.state.selectedSets) {
				this.state.dispatch(resize())
			}
		}
		return(
			<SelectField
			floatingLabelText='Select Visualization'
			errorText={ touched && error }
			{ ...input } fullWidth={ true }
			onChange={ changeVisualization }>
				{ options.map( (value, index) => (
					<MenuItem value={ index + 1 } key={ index } primaryText={ value } />
					))
				}
			</SelectField>
		)
	}

	handleClose = (index, ID, text) => {
		var currSelectedSets = this.state.selectedSets
		const selectSetNameAndID = (entry) => entry._id === ID

		currSelectedSets[index] = head(filter(selectSetNameAndID, this.state.allSets))
		this.selectedSets[index] = text

		this.setState({ selectedSets: currSelectedSets, fields: renderFields(this.props, this.createField)[0] })
		this.state.setSets(currSelectedSets)
	}

	changeSetDialog = () => { 
		this.setAutocompleteSets()
		this.setState({ newSet: !this.state.newSet })
	}

	setGraphProperties = (values) => {
		this.state.setDisplayProperties(values)
	}

	handleNext = () => {
		this.setState({
			stepIndex: this.state.stepIndex + 1,
			finished: this.state.stepIndex === (this.state.fields.length - 1),
		})
		this.state.dispatch(resize())
	}

	handlePrevious = () => {
		this.setState({
			stepIndex: this.state.stepIndex > 0 ? this.state.stepIndex - 1 : this.state.stepIndex,
		})
		this.state.dispatch(resize())
	}

	renderStepActions(step) {
    const { stepIndex } = this.state
    return (
      <div style={ { margin: '12px 0' } }>
				{step < (this.state.fields.length - 1) && (
					<RaisedButton
						label={ stepIndex === (this.state.fields.length - 1) ? 'Finish' : 'Next' }
						disableTouchRipple={ true }
						disableFocusRipple={ true }
						primary={ true }
						onTouchTap={ this.handleNext }
						style={ { marginRight: 12 } }
					/>
        )}
        {((step > 0) && step < (this.state.fields.length - 1)) && (
          <FlatButton
            label='Back'
            disabled={ stepIndex === 0 }
            disableTouchRipple={ true }
            disableFocusRipple={ true }
            onTouchTap={ this.handlePrevious }
          />
        )}
      </div>
    )
  }

  onClick = (index, event) => this.setState({ stepIndex: index })
  curryOnClick = curry(this.onClick)

  render() {
    return (
				<div>
				{ this.state.newSet ?
					<SetCreator close={ this.changeSetDialog } token={ this.state.token } dispatch={ this.state.dispatch }
					all_templates={ this.state.all_templates } />
					:
					<form onSubmit={ this.state.submit }>
					<Stepper activeStep={ this.state.stepIndex } orientation='vertical' linear={ false }>
					{ this.state.fields.map( (field, index) => (
						<Step key={ index }>
							<StepButton onClick={ this.curryOnClick(index) }> Step { index } - { field.key } </StepButton>
							<StepContent>
								{ field }
								{ this.renderStepActions(index) }
							</StepContent>
						</Step>
						))
					}
					</Stepper>
					{ (this.state.visualization && !isEmpty(this.state.selectedSets)) &&
						<Flexbox flexDirection='column' justifyContent='flex-start'>
							{ (this.state.visualization === 'Table') ?
							<TableVisual dispatch={ this.state.dispatch } token={ this.state.token } set={ this.state.selectedSets } resize={ this.state.resize } />
							:
							<GraphVisual dispatch={ this.state.dispatch } token={ this.state.token } set={ this.state.selectedSets } onPropertiesSet={ this.setGraphProperties } resize={ this.state.resize } />
							}
						</Flexbox>
					}
					<RaisedButton id='submit' type='submit'
						label='Submit' fullWidth={ true } disabled={ !(this.state.visualization && !isEmpty(this.state.selectedSets)) }
						primary={ true } style={ submitStyle } />
					</form>
				}
			</div>
    )
  }
}

export default reduxForm({
  form: 'Data',
  validate,
})(DataFields)