import React from 'react'
import Flexbox from 'flexbox-react'
import { getUser } from '../../State/AuthenticateActions'
import { getAllEntries, getAllTemplates, createNewEntry } from '../../State/EntryActions'
import { head, filter, propEq, curry, length, map, values, concat, keys, sort } from 'ramda'

import moment from 'moment'

import '../../Transitions.css'
import ReactCSSTransitonReplace from 'react-css-transition-replace'
import EntryDisplay from './Global/Display/EntryDisplay'

import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import { svgIcon } from './Global/Display/icons'

import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'

const styles = {
  entry: {
		width: '70%',
		height: 'auto',
		background: 'white',
		borderWidth: '1px',
		borderColor: '#616161',
		borderStyle: 'solid',
		margin: '10px',
		marginBottom: '10px',
  },
}

export class Feed extends React.Component{

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst = (props) => {
		return({
			allTemplates: props.all_templates ? props.all_templates : [],
			allPublicEntries: this.state ? this.state.allPublicEntries : [],
			token: props.token,
			dispatch: props.dispatch,
		})
	}

	retrieveTemplate = (templateName) => {
		const retrieve = (template) => template.name === templateName
		return head(filter(retrieve, this.state.allTemplates))
	}

	componentWillMount(){
		this.refreshFeed()
	}

	refreshFeed = () => {
		if ( length(this.state.allTemplates) === 0 ){
			const setTemplates = (templates) => { this.setState({ allTemplates: templates }); this.refreshFeed() }
			this.state.dispatch( getAllTemplates(this.state.token, {}, setTemplates))
		} else {
			const sortByUpdatedAt = (a, b) => { return new Date(b.updatedAt) - new Date(a.updatedAt) }
			const printEverything = (entries) => this.setState({ allPublicEntries: sort(sortByUpdatedAt, filter(propEq('access', 'PUBLIC'), entries)) })
			this.state.dispatch(getAllEntries(this.state.token, { access: 'PUBLIC', templateId: [ this.retrieveTemplate('Project'), this.retrieveTemplate('Protocol') ] }, printEverything))
		}
	}

	handleTouchTap = (entry, event) => {
		this.setState({ openProject: entry, openSettings: true, anchorEl: event.target })
	}

	curryTouchTap = curry(this.handleTouchTap)

	onRequestClose = () => {
		this.setState({ openSettings: false })
	}

	viewEntry = (entry) => {
		const printUser = (user) => this.setState({ viewingEntry: this.state.openProject, author: user.name })
		this.state.dispatch(getUser(this.state.token, entry.owner, printUser))
	}

	copyOfEntry = (state, entry) => {
		return new Promise(function(resolve) {
			const resolveWithId = (entry) => resolve(entry._id)
			const submission = {
				templateId: entry.templateId,
				access: 'PRIVATE',
				content: entry.content,
				parents: concat(entry.parents, [ entry._id ]),
				children: entry.children,
			}
			state.dispatch(createNewEntry(state.token, submission, resolveWithId))
		})
	}

	curryCopyOfEntry = curry(this.copyOfEntry)

	handleDuplicateOfEntry = (entry) => {
		const createEntryCopies = (entries) => {
			const promises = map(this.curryCopyOfEntry(this.state), entries)
			Promise.all(promises).then( (values) => {
				const content = {}
				const mapObject = (key) => content[key] = values[parseInt(key, 10)]
				map(mapObject, keys(entry.content.Entries))
				const title = 'Copy of ' + entry.content.Title
				const submissionContent = {
					Title: title,
					Description: entry.content.Description,
					Entries: content,
				}
				this.completeCopy(entry, submissionContent)
			})
		}

		this.state.dispatch(getAllEntries(this.state.token, { _id: values(entry.content.Entries) }, createEntryCopies ))
	}

	completeCopy = (entry, submissionContent) => {

		const submission = {
			templateId: entry.templateId,
			access: 'PRIVATE',
			content: submissionContent,
			parents: concat(entry.parents, [ entry._id ]),
			children: entry.children,
		}

		const updateDuplication = (entry) => {
			console.log('Copied!', entry)
		}

		this.state.dispatch(createNewEntry(this.state.token, submission, updateDuplication))
	}

	handleSettingValue = (event, menuItem, index) => {
		this.setState({ openSettings: false })
		switch(index) {
			case 0:
				this.viewEntry(this.state.openProject)
				break
			case 1:
				this.handleDuplicateOfEntry(this.state.openProject)
				break
			case 2:
				console.log('View Graph')
				break
			default:
				break
		}
	}

	setViewingEntryToNil = () => {
		this.setState({ viewingEntry: undefined, author: undefined })
	}


	render() {
		return(
			<div>
				<ReactCSSTransitonReplace
					transitionName='fade-wait'
					transitionAppear={ true }
					transitionAppearTimeout={ 500 }
					transitionEnterTimeout={ 1000 }
					transitionLeaveTimeout={ 400 }>
				{ this.state.viewingEntry ?
					<div key='1'>
						<Flexbox flexDirection='column'>
							<Flexbox>
								<RaisedButton label='Back' onTouchTap={ this.setViewingEntryToNil } icon={ svgIcon('backArrow') } style={ { marinTop: '15px' } } />
							</Flexbox>
							<Flexbox justifyContent='center'>
								<EntryDisplay id='EntryDisplay' all_templates={ this.state.allTemplates } entryDisplay={ this.state.viewingEntry } dispatch={ this.state.dispatch } token={ this.state.token } curr_display={ this.state.viewingEntry } author={ this.state.author } />
							</Flexbox>
						</Flexbox>
					</div>
					:
					<div key='2'>
						<Flexbox id='Feed' flexDirection='column' justifyContent='flex-start' alignItems='center'>
							<font size={ 30 } color='#424242' style={ { marginBottom: '10px', marginTop: '10px' } }> <b> Build With Life </b> </font>
							{ this.state.allPublicEntries.map( (publicEntry, index) => (
								<Flexbox flexDirection='row' style={ styles.entry } key={ index }>
									<Flexbox flexDirection='column' flexGrow={ 1 }>
										<Flexbox flexDirection='column' justifyContent='center' alignItems='center' flexWrap='wrap' style={ { marginTop: '6px' } }>
											<font size={ 5 } style={ { margin: '10px', padding: '1px' } }> { publicEntry.content.Title } </font>
											<font size={ 3 } style={ { margin: '10px', padding: '1px' } }> { publicEntry.content.Description } </font>
										</Flexbox>
										<Flexbox alignItems='center'>
											<font size={ 1 } style={ { marginLeft: '3px', marginRight: '5px', marginBottom: '2px' } }> <font size={ 2 } color='#EB3C40'> { length(publicEntry.parents) } </font> parents </font>
											<font size={ 1 } > <font size={ 2 } color='#EB3C40'> { length(publicEntry.children) } </font> children </font>
										</Flexbox>
									</Flexbox>
									<Flexbox flexDirection='column' justifyContent='flex-end' alignItems='flex-end'>
										<Flexbox justifyContent='flex-end' alignItems='flex-start'>
											<IconButton id='Drawer Open'
												style={ { height: 'auto', width: 'auto' } }
												onTouchTap={ this.curryTouchTap(publicEntry) }>
												{ svgIcon('rightSettings') }
											</IconButton>
										</Flexbox>
										<Flexbox flexGrow={ 1 } alignItems='flex-end' justifyContent='flex-end'>
											<font size='1' style={ { color: '#BDBDBD', marginRight: '5px', marginBottom: '2px' } }> { moment(new Date(publicEntry.updatedAt)).format('MM/DD/YY hh:mm a') } </font>
										</Flexbox>
									</Flexbox>
								</Flexbox>
								))
							}
							<Flexbox>
								<IconButton onTouchTap={ this.refreshFeed }>
									{ svgIcon('refresh')}
								</IconButton>
							</Flexbox>
						</Flexbox>
						<Popover
							open={ this.state.openSettings }
							anchorEl={ this.state.anchorEl }
							anchorOrigin={ { horizontal: 'left', vertical: 'bottom' } }
							targetOrigin={ { horizontal: 'left', vertical: 'top' } }
							onRequestClose={ this.onRequestClose }>
								<Menu onItemTouchTap={ this.handleSettingValue }>
									<MenuItem primaryText='View' />
									<MenuItem primaryText='Add Child (Duplicate)' />
									<MenuItem primaryText='View Graph' />
								</Menu>
						</Popover>
					</div>
				}
				</ReactCSSTransitonReplace>
			</div>
		)
	}

}

export default Feed
