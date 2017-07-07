import React from 'react'

import CreationFields from './CreationFields'
import PropTypes from 'prop-types'

import DataFields from './DataFields'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import CircularProgress from 'material-ui/CircularProgress'

import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiThemes from 'material-ui/styles/getMuiTheme'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import * as _colors from 'material-ui/styles/colors'
import { fade } from 'material-ui/utils/colorManipulator'
import { getMuiTheme } from 'material-ui/styles'

import { createNewEntry } from '../../../../../State/EntryActions'

import { prop, toPairs, filter, head, values, map } from 'ramda'

const muiTheme = getMuiTheme({
  fontFamily: 'DINPro',
  palette: {
    primary1Color: _colors.red600,
    primary2Color: _colors.red600,
    primary3Color: _colors.grey400,
    accent1Color: _colors.teal600,
    accent2Color: _colors.grey100,
    accent3Color: _colors.grey500,
    textColor: _colors.grey800,
    secondaryTextColor: fade(_colors.darkBlack, 0.54),
    alternateTextColor: _colors.white,
    canvasColor: _colors.white,
    borderColor: _colors.grey300,
    disabledColor: fade(_colors.darkBlack, 0.3),
    pickerHeaderColor: _colors.cyan500,
    clockCircleColor: fade(_colors.darkBlack, 0.07),
    shadowColor: _colors.fullBlack,
  },
})

export class CreationWizard extends React.Component{

	constructor(props){
		super(props)
		this.state= Object.assign({}, this.templateConsts(props), {
			isLoading: false,
		})
	}

	getChildContext() {
    return { muiTheme: getMuiThemes(baseTheme) }
  }

	templateConsts(props) {
		return {
			title: props.template.name,
			template: props.template,
			all_templates: props.all_templates,
			parents: props.parents ? props.parents : [],
			children: props.children ? props.children : [],
			open: props.open,
			close: props.handleClose,
			submit: props.handleSubmit,
			token: props.token,
			dispatch: props.dispatch,
			resize: props.resize,
			sets: this.state ? this.state.sets : {},
			awsHandler: props.awsHandler,
			submitFile: props.submitFile,
		}
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.templateConsts(nextProps))
		this.resetTheState(nextProps.template)
	}

	componentWillMount(){
		this.handleSubmit = this.handleSubmit.bind(this)
		this.submitSubmission = this.submitSubmission.bind(this)
		this.handleClose = this.handleClose.bind(this)
		this.resetTheState = this.resetTheState.bind(this)
		this.createData = this.createData.bind(this)
		this.resetTheState(this.props.template)
	}

	componentWillUnmount(){
		this.setState({ isLoading: false })
	}

	resetTheState(template){
		this.setState({ content: toPairs(prop('content', template)) })
	}

	handleSubmit(values){
		this.setState({ isLoading: true })
		if ( values.Url && values.Url.item && values.Url.item(0)) {
			this.state.submitFile(values, this.state.parents, this.state.children)
		} else {
			this.submitSubmission(values)
		}
	}

	submitSubmission(values){
		const submission = {
			templateId: this.state.template._id,
			access: 'PRIVATE',
			content: values,
			parents: this.state.parents,
			children: this.state.children,
		}
		this.state.submit(submission)
	}

	setDisplayProperties = (value) => {
		this.setDisplayProperties = value
	}

	setSets = (value) => {
		this.setState({ sets: value })
	}

	createData(dataValues){
		const createDisplayEntry = this.createDisplay(this.state, dataValues.Visualization, this.setDisplayProperties)
		createDisplayEntry.then( (display) => {
			const submission = {
				templateId: this.state.template._id,
				access: 'PRIVATE',
				content: {
					Set: map( (set) => set._id, values(this.state.sets)),
					Title: dataValues.Title,
					Caption: dataValues.Caption,
					Visualization: [ display._id ],
				},
				parents: this.state.parents,
				children: this.state.children,
			}
			this.state.submit(submission)
		})
	}

	createDisplay = (state, visualization, displayProperties) => {
		return new Promise( function(resolve) {
			const getTable = (template) => template.name === 'Table'
			const getGraph = (template) => template.name === 'Graph'
			const template = head(filter((visualization - 1) ? getGraph : getTable, state.all_templates))
			
			const submission = {
				templateId: template._id,
				access: 'PRIVATE',
				content: {
					Properties: displayProperties,
				},
				parents: state.parents,
				children: state.children,
			}

			const callback = (entry) => resolve(entry)

			state.dispatch(createNewEntry(state.token, submission, callback))
		})
	}

	handleClose(){
		this.resetTheState(this.props)
		this.state.close()
	}

	render() {
		const actions = [
		<FlatButton key='Cancel'
		label='Cancel'
		primary={ true }
		onTouchTap={ this.handleClose }
		/>,
		]
		return(
			<MuiThemeProvider muiTheme={ muiTheme }>
				<Dialog id='Dialog'
				title={ 'Create New ' + this.state.title }
				actions={ actions }
				open={ this.state.open }
				autoScrollBodyContent={ true }
				onRequestClose={ this.handleClose } >
				{ this.state.isLoading &&
					<CircularProgress />
				}
				{ this.state.template.name === 'Data' ?
					<DataFields fields={ this.state.template.content } all_templates={ this.state.all_templates } templateId={ this.state.template._id } onSubmit={ this.createData } 
					token={ this.state.token } dispatch={ this.state.dispatch } resize={ this.state.resize } setDisplayProperties={ this.setDisplayProperties } setSets={ this.setSets } />
					:
					<CreationFields fields={ this.state.template.content } all_templates={ this.state.all_templates } templateId={ this.state.template._id } onSubmit={ this.handleSubmit } />
				}
				</Dialog>
			</MuiThemeProvider>
		)
   }
}

CreationWizard.childContextTypes = {
  muiTheme: PropTypes.object.isRequired,
}

export default CreationWizard