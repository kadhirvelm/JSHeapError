import React from 'react'

import ReactCSSTransitonReplace from 'react-css-transition-replace'
import './EntryDisplay.css'
import '../../../../Transitions.css'

import Paper from 'material-ui/Paper'

import NewEntryDialog from '../Creation/NewEntryDialog'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'

import { createNewEntry, updateEntry, getEntryDisplay, getAllEntries } from '../../../../State/EntryActions'

import CreationWizard from '../Creation/CreationWizard/CreationWizard'
import EntryDisplayWizard from './EntryDisplayWizard'

import Flexbox from 'flexbox-react'

import FlatButton from 'material-ui/FlatButton'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'

import { prop, keys, length, toString, head, dissoc, map, concat, curry, values, isNil } from 'ramda'

const styles = {
	cornerButtons: {
    position: 'relative',
    top: 50,
    bottom: 'auto',
    marginBottom: 10,
  },
  entry: {
		width: '70%',
		height: 'auto',
		margin: '5px',
		padding: '10px',
  },
}

export class EntryDisplay extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			openNewEntry: false,
			openCreationWizard: false,
			openProtocolCreationWizard: false,
			openSettings: false,
		})
	}

	propsConst(props) {
		return({
			entry: props.curr_display ? props.curr_display : props.entryDisplay,
			entryContent_ids: prop('Content', props.entryDisplay.content),
			curr_display_entries: this.state ? this.state.curr_display_entries : [],
			dispatch: props.dispatch,
			token: props.token,
			all_templates: props.all_templates,
			refreshingContents: props.refreshingContents,
			resize: props.resize,
			set: props.set,
			awsHandler: props.awsHandler,
			protocol_entries: props.protocol_entries,
			openProtocolCreation: props.openProtocolCreation,
			availability: props.curr_display ? props.curr_display.access : props.entryDisplay.access,
			author: props.author,
		})
	}

	componentWillReceiveProps(nextProps) {
		this.setState(this.propsConst(nextProps))
		if((this.state.entry !== undefined) && (nextProps.entryDisplay._id !== this.state.entry._id)) {
			this.refreshDisplayEntry(nextProps.entryDisplay)
		}
	}

	componentWillMount(){
		this.openCreationWizard = this.openCreationWizard.bind(this)
		this.closeCreationWizard = this.closeCreationWizard.bind(this)
		this.addToProject = this.addToProject.bind(this)
		this.refreshDisplayEntry = this.refreshDisplayEntry.bind(this)
		this.refreshDisplayEntry(this.state.entry)
	}

	setCurrentDisplayEntries = (entries) => this.setState({ curr_display_entries: entries })

	refreshDisplayEntry(entry){
		this.setState({ curr_display_entries: [] })
		if (!this.state.author) {
			this.state.dispatch(getEntryDisplay(this.state.token, entry._id, this.setCurrentDisplayEntries))
		} else {
			const retrieveEntryIDs = (entries) => {
				const ids = values(head(entries).content.Entries)
				this.state.dispatch(getAllEntries(this.state.token, { _id: ids }, this.setCurrentDisplayEntries ))
			}
			this.state.dispatch(getAllEntries(this.state.token, { _id: [ entry._id ] }, retrieveEntryIDs))
		}
	}

	closeCreationWizard(){
		this.setState({ template: undefined })
		this.changeCreationWizard()
	}

	openCreationWizard(template) {
		this.changeNewEntry()
		this.setState({ template: template })
		this.changeCreationWizard()
	}

	createNewProtocol = (template) => {
		this.changeNewEntry()
		this.state.openProtocolCreation(template)
	}

	addToProject(entry) {
		const updateEntry = this.state.entry
		const mainEntryContent = updateEntry.content.Entries ? updateEntry.content.Entries : {}
		mainEntryContent[toString(length(keys(mainEntryContent)))] = entry._id
		updateEntry.content.Entries = mainEntryContent
		this.updateEntry(updateEntry)
		this.closeCreationWizard()
	}

	renderContents = () => {
		if (this.state.curr_display_entries) {
			return this.state.curr_display_entries.map((entry, index) => (
				<Paper key={ index } style={ styles.entry } >
					<EntryDisplayWizard entry={ entry } all_templates={ this.state.all_templates } token={ this.state.token } dispatch={ this.state.dispatch } awsHandler={ this.state.awsHandler } changeNewEntry={ this.changeNewEntry } />
				</Paper>
			))
		}
	}

	createFileEntry = (fileSubmission, parents, children) => {
		
		const submission = {
			templateId: this.state.template._id,
			access: 'PRIVATE',
			content: dissoc('Url', fileSubmission),
			parents: parents,
			children: children,
		}

		const createImage = (data) => {
			const uploadPromise = this.state.awsHandler.uploadFile(fileSubmission.Url.item(0), data._id)
			uploadPromise.then( (values) => {
				data.content.Url = values.Location
				this.state.dispatch(updateEntry(this.state.token, data, this.addToProject))
			})
		}

		this.state.dispatch(createNewEntry(this.state.token, submission, createImage))
	}

	handleTouchTap = (event) => {
		this.setState({ openSettings: true, anchorEl: event.target })
	}

	onRequestClose = () => {
		this.setState({ openSettings: false })
	}

	handleSettingValue = (event, menuItem, index) => {
		this.setState({ openSettings: false })
		switch(index) {
			case 0:
				this.switchEntryAccess(this.state.availability === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')
				break
			case 1:
				console.log('Delete')
				break
			default:
				break
		}
	}

	updateEntryPromise = (state, entry) => {
		return new Promise( function(resolve) {
			state.dispatch(updateEntry(state.token, entry, resolve))
		})
	}

	curryUpdateEntryPromise = curry(this.updateEntryPromise)

	switchEntryAccess = (access) => {
		const adjustAccess = (entry) => { entry['access'] = access; return entry }
		const adjustEntriesPromises = map(this.curryUpdateEntryPromise(this.state), map(adjustAccess, concat([ this.state.entry ], this.state.curr_display_entries)))
		Promise.all(adjustEntriesPromises)
	}

	changeNewEntry = () => this.setState({ openNewEntry: !this.state.openNewEntry })
	
	changeCreationWizard = () => this.setState({ openCreationWizard: !this.state.openCreationWizard })
	
	createEntry = (submission) => this.state.dispatch(createNewEntry(this.state.token, submission, this.addToProject))
	
	updateEntry = (entry) => this.state.dispatch(updateEntry(this.state.token, entry, this.refreshDisplayEntry))

	editEntry = (entry) => console.log('Edit this entry', entry)

	deleteEntry = (entry) => console.log('Delete this entry', entry)

	reorderEntry = (entry, newPosition) => console.log('Reorder this entry', entry, newPosition)

	render() {
		return(
			<div>
				<ReactCSSTransitonReplace
					transitionName='fade-wait'
            transitionAppear={ true }
            transitionAppearTimeout={ 500 }
            transitionEnterTimeout={ 1000 }
            transitionLeaveTimeout={ 400 }
					>
					<div key={ this.state.entry._id }>
						<Flexbox flexDirection='column' justifyContent='flex-start'>
							{ this.state.entry &&
								<Flexbox flexDirection='column' justifyContent='center' alignItems='center'>
									<font size={ 45 } id='header' style={ { color: '#424242' } }> <b> { this.state.entry.content.Title } </b> </font>
									<Flexbox>
										<font size='12' id='author' style={ { color: '#424242' } }> { this.state.author && ('By ' + this.state.author.first + ' ' + this.state.author.last) } </font>
									</Flexbox>
								</Flexbox>
							}
							<Flexbox flexDirection='column' alignItems='center' style={ { marginTop: '8px' } }>
								{ this.renderContents() }
							</Flexbox>
						</Flexbox>
					</div>
				</ReactCSSTransitonReplace>
				{ isNil(this.state.author) &&
					<div>
						<Flexbox flexDirection='column' justifyContent='flex-end' alignItems='center' style={ styles.cornerButtons }>
							<FloatingActionButton onClick={ this.changeNewEntry } backgroundColor='#118080'>
								<ContentAdd id='ContentAdd' />
							</FloatingActionButton>
							<FlatButton
								label={ this.state.availability }
								onTouchTap={ this.handleTouchTap }
								labelStyle={ { color: 'white', size: 8 } }
								backgroundColor={ this.state.availability === 'PUBLIC' ? '#558B2F' : '#d32f2f' }
								style={ { marginTop: '10px', marginBottom: '10px', borderRadius: '15px' } }>
							</FlatButton>
							<Popover
								open={ this.state.openSettings }
								anchorEl={ this.state.anchorEl }
								anchorOrigin={ { horizontal: 'left', vertical: 'center' } }
								targetOrigin={ { horizontal: 'right', vertical: 'bottom' } }
								onRequestClose={ this.onRequestClose }>
								<Menu onItemTouchTap={ this.handleSettingValue }>
									<MenuItem primaryText={ 'Make ' + (this.state.availability === 'PUBLIC' ? 'Private' : 'Public') } />
									<MenuItem primaryText='View Graph' />
									<MenuItem primaryText='Add Child' />
									<MenuItem primaryText='Duplicate' />
									<MenuItem primaryText='Delete' />
								</Menu>
							</Popover>
						</Flexbox>
						<NewEntryDialog id='NewEntryDialog' templates={ this.state.all_templates } curr_template_id={ this.state.entry.templateId } open={ this.state.openNewEntry } 
						handleClose={ this.changeNewEntry } createNewEntry={ this.openCreationWizard } protocol_entries={ this.state.protocol_entries } createNewProtocol={ this.createNewProtocol } />
						{ this.state.template &&
							<CreationWizard template={ this.state.template } all_templates={ this.state.all_templates } open={ this.state.openCreationWizard } handleClose={ this.closeCreationWizard } 
							handleSubmit={ this.createEntry } token={ this.state.token } dispatch={ this.state.dispatch } resize={ this.state.resize } set={ this.state.set } 
							awsHandler={ this.state.awsHandler } submitFile={ this.createFileEntry } />
						}
					</div>
				}
			</div>
		)
	}
}

export default EntryDisplay