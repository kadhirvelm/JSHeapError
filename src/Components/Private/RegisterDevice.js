import React from 'react'

import Flexbox from 'flexbox-react'

import CircularProgress from 'material-ui/CircularProgress'
import RaisedButton from 'material-ui/RaisedButton'

import { entryTransfer, getAllEntries, updateEntry } from '../../State/EntryActions'

import { _ } from 'underscore'

import { filter } from 'ramda'

export class RegisterDevice extends React.Component{

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst(props){
		return({
			dispatch: props.dispatch,
			token: props.token,
			email: props.email,
			name: props.name,
			deviceRegistration: props.deviceRegistration,
			registerDeviceResponse: props.registerDeviceResponse,
			createTransferPromise: this.createTransferPromise,
			isFetching: props.isFetching,
		})
	}

	componentWillMount(){
		this.state.dispatch(getAllEntries(this.state.token, { 'content.registrationToken': this.state.deviceRegistration }, this.handleEntryCallback))
	}

	handleEntryCallback = (entry) => {
		if (entry.length > 0){
			entry = _.first(entry)
			var allIDs = [ entry._id ]
			allIDs.push(_.values(entry.content.extruders))
			const state = this.state
			Promise.all(_.map( _.flatten(allIDs), function(id) {
				return state.createTransferPromise(state, id)
			})).then( (values) => {
				this.claimPrinter(values)
			})
		} else {
			this.setState({ registerDeviceResponse: { status: undefined, message: 'Unable to find the request device. Please contact BioBots' } })
		}
	}

	claimPrinter = (values) => {
		console.log(values)
		const getPrinter = (value) => !_.isUndefined(value.entry.content.model)
		const printerValues = _.first(filter(getPrinter, values))
		const printer = printerValues.entry
		printer.content.registrationStatus = 'REGISTERED'

		const handleCallBack = () => {
			this.setState({ registerDeviceResponse: { status: printerValues.status, message: printerValues.message } })
		}
		this.state.dispatch(updateEntry(this.state.token, printer, handleCallBack))
	}

	createTransferPromise = (state, id) => {
		return new Promise( function(resolve) {
			state.dispatch(entryTransfer(state.token, state.email, id, resolve))
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	render() {
		const isSuccess = !_.isUndefined(this.state.registerDeviceResponse ? this.state.registerDeviceResponse.status : undefined)
		return(
			<Flexbox flexGrow={ 1 }>
				<Flexbox flexDirection='column' alignItems='center' flexGrow={ 1 }>
					<div style={ { backgroundColor: '#E83E45', width: '100%', height: '45px' } }>
						<Flexbox justifyContent='flex-end' flexGrow={ 1 }>
							<Flexbox justifyContent='center' alignItems='center' style={ { backgroundColor: '#BD323D', width: '20%', height: '45px' } }> 
								<font color='white'> { this.state.name.first.toUpperCase() } </font> 
							</Flexbox>
						</Flexbox> 
					</div>
					<font size={ this.state.isFetching ? 10 : 6 }> { isSuccess ? 'Successfully Registered' : 'Attempting to Register' } device <b> { this.state.deviceRegistration } </b> </font>
					<font style={ { marginTop: '20px' } } size={ 5 } color={  isSuccess ? 'green' : 'red' }> { this.state.registerDeviceResponse && this.state.registerDeviceResponse.message } </font>
					{ this.state.isFetching ?
						<CircularProgress size={ 150 } thickness={ 7 } style={ { margin: '30px' } } />
						:
						<RaisedButton label='Return Home' secondary={ isSuccess ? true : false } href='/' style={ { margin: '30px' } } />
					}
				</Flexbox>
			</Flexbox>
		)
  }
}

export default RegisterDevice
