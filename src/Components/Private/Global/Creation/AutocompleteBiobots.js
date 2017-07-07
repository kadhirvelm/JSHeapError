import React from 'react'

import { Field, reduxForm } from 'redux-form'
import AutoComplete from 'material-ui/AutoComplete'

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

class AutocompleteBiobots extends React.Component {

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst = (props) => {
		requiredFields.push(props.index)
		return({
			index: props.index,
			searchText: this.state ? this.state.searchText : props.searchText,
			allSets: props.allSets,
			handleClose: props.handleClose,
			name: 'autocomplete_' + props.index,
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.searchText !== this.props.searchText) {
			this.setState(this.propsConst(nextProps))
		}
	}

	handleUpdateInput = (searchText) => {
		this.setState({ searchText: searchText })
	}

	filterSets = (searchText, key) => key.indexOf(searchText) !== -1

	autoComplete = ({ input, meta: { touched, error } }) => {

		const handleClose = (data) => {
			if (data.text) {
				this.setState({ searchText: data.text })
				input.onChange(data.text)
				this.state.handleClose(this.state.index, data.id, data.text)
			}
		}
		
		return(
		<AutoComplete
			hintText='Select a set'
			searchText={ this.state.searchText }
			onUpdateInput={ this.handleUpdateInput }
			onNewRequest={ handleClose }
			dataSource={ this.state.allSets() ? this.state.allSets() : [ 'None' ] }
			menuProps={ { maxHeight: 250, width: 'auto' } }
			filter={ this.filterSets }
			fullWidth={ true }
			style={ { marginRight: '10px', marginLeft: '10px' } }
			errorText={ touched && error }
			{ ...input }
			/>)
	}

	render(){
		return(
			<Field key={ this.state.index } name={ this.state.index } component={ this.autoComplete } label='Autocomplete' />
		)
	}

}

export default reduxForm({
  form: 'Autocomplete',
  validate,
})(AutocompleteBiobots)