import React from 'react'
import Flexbox from 'flexbox-react'

import { SlicerManager } from './SlicerManager'

import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'

import { _ } from 'underscore'
import { curry } from 'ramda'

class Overview extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			sendProperties: props.sendProperties,
		})
	}

	propsConst = (props) => {
		return({
			sendProperties: props.sendProperties,
			properties: props.properties,
			dispatch: props.dispatch,
			token: props.token,
			socketManager: props.socketManager,
			gcodeTemplate: props.gcodeTemplate,
			slicerManagers: props.properties.slicerManagers,
			pending: props.properties.pending || {},
			finalGcode: props.properties.finalGcode,
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	handleCallback = (id, message, optionalKey) => {
		console.log('Callback', id, message, optionalKey, this.state.slicerManagers)
		switch(optionalKey){
			case 'TASK ID':
				this.state.slicerManagers[id].startUpdates()
				this.adjustOneManager(id, this.state.slicerManagers[id], true, false)
				break
			case 'FAILURE':
				this.state.slicerManagers[id].stopUpdates()
				console.log('Failed, inform user')
				break
			default:
				if(_.isObject(message)){
					this.state.slicerManagers[id].stopUpdates()
					this.adjustOneManager(id, this.state.slicerManagers[id], false, false, message)
					this.appendfinalGcodeToWell(id, this.state.slicerManagers[id])
				} else {
					this.adjustOneManager(id, this.state.slicerManagers[id], true, false)
				}
				break
		}
	}

	appendfinalGcodeToWell = (id, manager) => {
		console.log('Append to well', id, manager)
	}

	assembleSTLObject = (entry, event) => {
		const newManager = new SlicerManager(entry.id, this.state.token, this.state.dispatch, this.state.gcodeTemplate, this.state.properties, this.handleCallback)
		this.adjustOneManager(entry.id, newManager, true, true)
		newManager.sliceFile()
	}

	curryAssembleSTLObject = curry(this.assembleSTLObject)

	adjustOneManager = (id, manager, pending, waitingForTaskID, finalGcode, callback) => {
		const currManagers = this.state.slicerManagers  || {}
		const currPendings = this.state.pending || {}
		const currWaitingForTaskID = this.state.waitingForTaskID || {}
		const currFinalGcodes = this.state.finalGcode || {}

		currManagers[id] = manager
		currPendings[id] = pending
		currWaitingForTaskID[id] = waitingForTaskID
		currFinalGcodes[id] = finalGcode

		this.state.sendProperties('slicerManagers', currManagers)
		this.state.sendProperties('pending', currPendings)
		this.state.sendProperties('waitingForTaskID', currWaitingForTaskID)
		this.state.sendProperties('finalGcode', currFinalGcodes)
	}

	render() {
		return(
			<Flexbox flexDirection='column' justifyContent='center' flexGrow={ 1 }>
				<font size={ 3 } style={ { marginBottom: '7px' } }> <b> Overview of Well Groups </b> </font>
				<Table>
					<TableHeader adjustForCheckbox={ false } displaySelectAll={ false }>
						<TableRow>
							<TableHeaderColumn> File Name </TableHeaderColumn>
							<TableHeaderColumn> Extruder </TableHeaderColumn>
							<TableHeaderColumn> Slicing Profile </TableHeaderColumn>
							<TableHeaderColumn> Slicing Status </TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody displayRowCheckbox={ false }>
						{ this.state.properties.wellsFileAndExtruderMapping && this.state.properties.wellsFileAndExtruderMapping[_.first(this.state.properties.currSelectedWells).toString()].map( (entry, index) => (
							<TableRow key={ index } selectable={ false }>
								<TableRowColumn style={ { margin: '5px', whiteSpace: 'normal', wordWrap: 'break-word' } }>
									{ entry.file.text.replaceAll('%20', ' ') }
								</TableRowColumn>
								<TableRowColumn style={ { margin: '5px' } }>
									{ !entry.file.text.endsWith('gcode') ? entry.infill || '--' : '--' }
								</TableRowColumn>
								<TableRowColumn style={ { margin: '5px' } }>
									{ (!entry.file.text.endsWith('gcode') && entry.slicingProfileObject) ? entry.slicingProfileObject.content.Properties.Name : '--' }
								</TableRowColumn>
								{ (!entry.file.text.endsWith('gcode') && this.state.finalGcode && _.isObject(this.state.finalGcode[entry.id])) ?
									<TableRowColumn>
										<font color='green'> { !entry.file.text.endsWith('gcode') ? 'Completed Slicing' : '--' } </font>
									</TableRowColumn>
									:
									<TableRowColumn>
										<RaisedButton label='Slice File' disabled={ !_.isObject(entry.slicingProfileObject) } onTouchTap={ this.curryAssembleSTLObject(entry) } style={ { margin: '5px' } } />
										{ (this.state.pending && this.state.pending[entry._id]) &&
											<CircularProgress size={ 40 } color='red' />
										}
									</TableRowColumn>
								}
							</TableRow>
							))
						}
					</TableBody>
				</Table>
			</Flexbox>
		)
   }
}

export default Overview