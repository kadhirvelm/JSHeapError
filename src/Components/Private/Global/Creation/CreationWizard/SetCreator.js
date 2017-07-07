import React from 'react'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import CircularProgress from 'material-ui/CircularProgress'

import DataGrid from '../../Display/DataGrid'

import Flexbox from 'flexbox-react'

import { createNewEntry } from '../../../../../State/EntryActions'
import { resize } from '../../../../../State/WebsiteActions'

import { isEmpty, forEach, map, filter, head, curry, pickAll, repeat, trim, split, uniq } from 'ramda'

class SetCreator extends React.Component {

	constructor(props){
		super(props)
		this.state = {
			close: props.close,
			token: props.token,
			dispatch: props.dispatch,
			data: repeat({}, 25),
			setTemplate: head(filter(this.filterSet, props.all_templates)),
			dataPointTemplate: head(filter(this.filterDP, props.all_templates)),
			setName: '',
			createSet: this.createSet,
			creating: false,
		}
	}

	filterSet = (template) => template.name === 'Data Set'
	filterDP = (template) => template.name === 'DataPoint'

	handleClose = (Name, ID) => this.state.close(Name, ID)

	adjustColumns = (event, value) => {
		var columns = uniq(map( trim, split(',', value)))
		const data = this.state.data
		const ensureColumns = (row) => pickAll(columns, row)
		this.setState({
			columnHeaders: columns,
			data: map(ensureColumns, data),
		})
		this.state.dispatch(resize())
	}

	updateData = (values, source) => {
		const data = this.state.data
		const updateValue = (array) => data[array[0]][array[1]] = array[3]
		switch (source) {
			case 'edit':
				forEach(updateValue, values)
				break
			default:
				break
		}
		this.setState({ data: data })
	}

  handleSubmit = () => {
		this.setState({ creating: true })

		const removeEmpty = (rowData) => rowData !== undefined
		const filteredValues = (row) => filter(removeEmpty, row)
		const filterArray = filter( (entry) => !isEmpty(entry), map(filteredValues, this.state.data))
		
		const dataPointPromises = map(this.curryCreateDP(this.state), filterArray)
		Promise.all(dataPointPromises).then( (dataPoints) => {
			return this.createSet(dataPoints, this.state)
		}).then( (set) => {
			this.setState({ creating: false })
			this.handleClose(set.content.Name, set._id)
		})
  }

  curryCreateDP = curry(this.createDataPoint)

  createDataPoint(state, row){
		return new Promise( function(resolve) {
			const appendDataPoint = (entry) => { resolve(entry._id) }
			var submission = (values) => { 
				return({
					templateId: state.dataPointTemplate._id,
					access: 'PRIVATE',
					content: { Data: values },
					parents: [],
					children: [],
				})
			}
			state.dispatch(createNewEntry(state.token, submission(row), appendDataPoint))
		})
  }

  createSet(dataPointIDs, state){
		return new Promise( function(resolve) {
			const resolveSetCreation = (entry) => { console.log('set entry', entry); resolve(entry) }
			console.log(dataPointIDs, state)
			console.log(state.setTemplate, state.setName, dataPointIDs)
			var submission = { 
					templateId: state.setTemplate._id,
					access: 'PRIVATE',
					content: {
						Name: state.setName,
						Included_data_points: dataPointIDs,
					},
					parents: [],
					children: [],
			}
			console.log('set submission', submission)
			state.dispatch(createNewEntry(state.token, submission, resolveSetCreation))
		})
  }

  adjustSetName = (event) => this.setState({ setName: event.target.value })

	render(){
		return(
			<Flexbox flexDirection='column'>
				<Flexbox flexDirection='row'>
					<Flexbox flexDirection='column' justifyContent='flex-start' flexGrow={ 2 }>
						<TextField
						floatingLabelText='Set Name'
						fullWidth={ true }
						value={ this.state.setName }
						onChange={ this.adjustSetName }
						/>
						<TextField
						floatingLabelText='Column Names (comma space separated)'
						hintText='Eg: ID, Temperature, Pressure'
						fullWidth={ true }
						onChange={ this.adjustColumns }
						/>
					</Flexbox>
					<Flexbox justifyContent='flex-end'>
						{ this.state.creating ?
							<CircularProgress />
							:
							<FlatButton
								key='Back'
								label='Back'
								primary={ true }
								onTouchTap={ this.handleClose }
							/>
						}
					</Flexbox>
				</Flexbox>
				<Flexbox flexDirection='column' flexGrow={ 2 }>
					{this.state.columnHeaders &&
						<div key='Set Creator'>
							<DataGrid
							componentName='Set Creator'
							columnHeaders={ this.state.columnHeaders }
							data={ this.state.data }
							updateData={ this.updateData }
							/>
							<RaisedButton 
								key='Create'
								label='Create New Set'
								fullWidth={ true }
								secondary={ true }
								onTouchTap={ this.handleSubmit }
								style={ { marginTop: '5px' } }
							/>
						</div>
					}
				</Flexbox>
      </Flexbox>
			)
	}
}

export default SetCreator