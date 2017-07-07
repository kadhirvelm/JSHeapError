import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import RaisedButton from 'material-ui/RaisedButton'
import MaterialUpload from '../../Display/MaterialUpload'
import Flexbox from 'flexbox-react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { renderFields } from './CreationUtils'

import { blue900 } from 'material-ui/styles/colors'

import { map, filter, curry } from 'ramda'

const textStyle = {
  width: '100%',
  minWidth: '304px',
}

const submitStyle = {
  marginTop: '10px',
}

const buttonStyle = {
	marginTop: '10px',
	width: '100%',
	minWidth: '300px',
}

const picturePreview = {
	marginTop: '10px',
	height: 'auto',
	width: 'auto',
	maxWidth: '150px',
	maxHeight: '150px',
	display: 'block',
	marginLeft: 'auto',
	marginRight: 'auto',
}

var requiredFields = []

const validate = (values) => {
	const errors = {}
	const check = requiredFields
	check.forEach( (field) => {
		if (!values[field]) {
			errors[field] = 'Required'
		}
		if(values.Url !== undefined && !/image\/.*/.test(values.Url[0].type)) {
			errors.Url = 'Only images are allowed'
		}
	})
	return errors
}

class CreationFields extends React.Component {

	constructor(props) {
		super(props)
		this.createFields = this.createFields.bind(this)
		this.arrayField = this.arrayField.bind(this)
		this.propsConst = this.propsConst.bind(this)
		this.state = {
			all_templates: props.all_templates,
			templateId: props.templateId,
		}
		this.state = this.propsConst(props)
	}

	propsConst(props) {
		const allFields = renderFields(props, this.createField)
		requiredFields = allFields[1]
		return ({  
			all_templates: props.all_templates,
			templateId: props.templateId,
			fields: allFields[0],
			submit: props.handleSubmit,
		})
	}

	createField = (template) => { return this.createFields(template.name, template.default, template.display, template.type) }

	createFields(name, default_value, display, type) {
		var component
		switch(type) {
			case 'string':
				return this.stringField(display, default_value, name)
			case 'array':
				component = this.arrayField(display, default_value, name, this.templatesCreatedByFactory())
				break
			default:
				component = null
				break
		}
		return (<Field key={ name } name={ name } component={ component } label={ name } />)
	}

	required = (value) => ( value === null ? 'Required' : undefined )

	imageUpload = ({ input, meta: { touched, error } }) => {
		return (
			<Flexbox flexDirection='column' justifyContent='center'>
				<MaterialUpload label='Upload Image' labelStyle={ { color: blue900 } }
				style={ buttonStyle } onFileLoad={ this.onFileLoad }
				{ ...input } />
				<font color='red'> { touched && error } </font>
			</Flexbox>
			)
	}

	stringField(display, default_value, name) {
		switch(display) {
			case 'line':
				return (
					<Field key={ name } name={ name } component={ TextField } floatingLabelText={ name }
						style={ textStyle } inputStyle={ textStyle } validate={ this.required } />
				)
			case 'paragraph':
				return (
					<Field key={ name } name={ name } component={ TextField } floatingLabelText={ name }
						style={ textStyle } inputStyle={ textStyle } multiLine={ true } rows={ 5 }
						rowsMax={ 7 } validate={ this.required } />
					)
			case 'image':
				return (
					<div>
						<Field key={ name } name={ name } component={ this.imageUpload } label={ name } />
						<img src={ this.picture } style={ picturePreview } alt='' />
					</div>
					)
			default:
				return null
		}
	}

	onFileLoad = (e) => {
		this.picture = e.target.result
		this.setState({ picture: e.target.result, fields: renderFields(this.props, this.createField)[0] })
	}

	handleOnChange = (props, event, index, value) => props.input.onChange(value)
	curryHandleOnChange = curry(this.handleOnChange)

	arrayField(display, default_value, name, available_templates) {
		switch(display) {
			case 'factory':
				return (props) => (
					<SelectField
					floatingLabelText={ name }
					errorText={ props.meta.touched && props.meta.error }
					maxHeight={ 150 }
					style={ { width: '100%' } }
					{ ...props.input }
					onChange={ this.curryHandleOnChange(props) }
					>
						{ map(this.menuItem, available_templates) }
					</SelectField>
					)
			default:
				return null
		}
	}

	menuItem = (template) => { return (<MenuItem key={ template._id } value={ template._id } primaryText={ template.name } /> )}

	handleArrayFieldChange = (event, index, value) => this.props.onChange(value)

	templatesCreatedByFactory(){
		const isInCreatedBy = (checkTemplate) => { return (checkTemplate.createdBy.indexOf(this.state.templateId) > -1) }
		const isDisplayAble = (checkTemplate) => { return ('included_series' in checkTemplate.content) }
		return filter(isDisplayAble, filter(isInCreatedBy, this.state.all_templates))
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	componentWillMount() {
    this.props.reset()
  }

  render() {
    return (
			<form onSubmit={ this.state.submit }>
        { this.state.fields.map( (field, index) => (
					<div key={ index }> { field } </div>
					))
				}
				<RaisedButton id='submit' type='submit'
            label='Submit' fullWidth={ true }
            primary={ true } style={ submitStyle } />
			</form>
    )
  }
}

export default reduxForm({
  form: 'Creation',
  validate,
})(CreationFields)