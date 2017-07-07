import React from 'react'
import EntryDisplay from './Global/Display/EntryDisplay'
import ProjProtList from './Global/Display/ProjProtList'

import '../../Transitions.css'

import Flexbox from 'flexbox-react'
import { getAllTemplates, getAllEntries } from '../../State/EntryActions' //createNewEntry, updateEntry
import { logoutUser } from '../../State/AuthenticateActions'
import { head, filter, propEq } from 'ramda' //keys, length, toString

import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import CircularProgress from 'material-ui/CircularProgress'

import ProtocolCreationWizard from './Global/Creation/ProtocolCreationWizard/ProtocolCreationWizard'
import { adjustPrintProperties, changeProtocolCreationWizard } from '../../State/WebsiteActions'

import { svgIcon } from './Global/Display/icons'

import { merge } from 'ramda'
import AWSHandler from '../../State/AWS'
import ReactCSSTransitonReplace from 'react-css-transition-replace'

import { SocketManager } from '../../Sockets/SocketManager'

const style = {
  progress: {
		margin: 0,
		top: 60,
		right: 20,
		bottom: 'auto',
		left: 'auto',
		position: 'fixed',
  },
  menu: {
		width: 72,
		height: 72,
  },
  menuIcon: {
		width: 36,
		height: 36,
  },
}

export class Home extends React.Component{

	constructor(props){
		super(props)
		this.state = merge(this.propsConst(props), {
			drawerOpen: false,
			protocolCreationTemplate: props.appProps.website.protocolCreationTemplate,
			all_templates: props.appProps.website.all_templates,
			socketManager: new SocketManager(),
		})
	}

	propsConst(props){
		return({
			dispatch: props.appProps.dispatch,
			auth_token: props.appProps.auth.auth_token,
			entryDisplay: props.appProps.website.entry,
			height: window.innerHeight / 2,
			all_entries: props.appProps.biobots.all_entries,
			refreshingContents: props.appProps.biobots.isFetching,
			curr_display: props.appProps.biobots.curr_display,
			curr_display_entries: props.appProps.biobots.curr_display_entries,
			controlPanel: props.appProps.controlPanel,
			resize: props.appProps.website.resize,
			set: props.appProps.website.set,
			isAdmin: props.appProps.auth.isAdmin,
			userID: props.appProps.auth.id,
			email: props.appProps.auth.email,
			awsHandler: this.state && (this.state.awsHandler || new AWSHandler(props.appProps.auth.id, props.appProps.auth.email)),
			protocolCreationWizardProperties: props.appProps.website.properties ? props.appProps.website.properties : {},
			openProtocolCreationWizard: props.appProps.website.openProtocolCreationWizard || false,
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	componentWillMount() {
		this.setProjectProtocols = this.setProjectProtocols.bind(this)
		this.getProjectsAndProtocolsEntries = this.getProjectsAndProtocolsEntries.bind(this)
		this.setProjectProtocolEntries = this.setProjectProtocolEntries.bind(this)
		this.getProjectsProtocols()
	}

	changeDrawer = () => this.setState({ drawerOpen: !this.state.drawerOpen })

	getProjectsProtocols = () => { this.state.dispatch(getAllTemplates(this.state.auth_token, {}, this.setProjectProtocols)) }

	setProjectProtocols(templates){
		const project = head(filter(x => propEq('name', 'Project', x), templates))
		const protocol = head(filter(x => propEq('name', 'Protocol', x), templates))
		this.setState({ projectTemplate: project, protocolTemplate: protocol, all_templates: templates })
		this.getProjectsAndProtocolsEntries()
   }

  getProjectsAndProtocolsEntries(){
		if (!this.state.isAdmin && (this.state.projectTemplate === undefined || this.state.protocolTemplate === undefined )) {
			this.state.dispatch(logoutUser())
		}
		this.state.dispatch(getAllEntries(this.state.auth_token, { templateId: [ this.state.projectTemplate._id, this.state.protocolTemplate._id ] }, this.setProjectProtocolEntries))
  }

  setProjectProtocolEntries(entries){
		const removeNonOwners = (entry) => (entry.owner === this.state.userID || entry.access === 'DEFAULT')
		entries = filter(removeNonOwners, entries)
		const projectEntries = filter(x => propEq('templateId', this.state.projectTemplate._id, x), entries)
		const protocolEntries = filter(x => propEq('templateId', this.state.protocolTemplate._id, x), entries)
		
		//const tempPrint = this.temp(entries)
		//this.setState({ projectEntries: projectEntries, protocolEntries: protocolEntries, protocolCreationTemplate: tempPrint, openProtocolCreationWizard: true })
		this.setState({ projectEntries: projectEntries, protocolEntries: protocolEntries })
	}

	temp = (entries) => { //DELETE WHEN FINISHED
		return head(filter( x => propEq('Title', 'STL Print', x.content), entries))
	}

	createProtocolCreation = (template) => {
		this.setState({ protocolCreationTemplate: template }, () => {
			this.changeProtocolCreation()
		})
	}

	handleProtocolCreation = (submission) => {
		const isPrint = (template) => template.name === 'BioBotPrint'
		//const currDisplay = this.state.entryDisplay
		const printTemplate = head(filter(isPrint, this.state.all_templates))._id

		const printSubmission = {
			templateId: printTemplate,
			access: 'PRIVATE',
			content: {
				TempProperties: submission,
			},
			parents: [],
			children: [],
		}

		// const changeState = (entry) => {
		// 	console.log(entry)
		// 	this.state.dispatch(changeProtocolCreationWizard(false))
		// }

		// const updateProject = (entry) => {
		// 	const mainEntryContent = currDisplay.content.Entries ? currDisplay.content.Entries : {}
		// 	mainEntryContent[toString(length(keys(mainEntryContent)))] = entry._id
		// 	currDisplay.content.Entries = mainEntryContent
		// 	this.state.dispatch(updateEntry(this.state.auth_token, currDisplay, changeState))
		// }

		console.log('Preapred print submission', printSubmission)
		//this.state.dispatch(createNewEntry(this.state.auth_token, printSubmission, updateProject))
	}

	changeProtocolCreation = () => {
		this.state.dispatch(adjustPrintProperties(false))
		this.state.dispatch(changeProtocolCreationWizard(!this.state.openProtocolCreationWizard, this.state.protocolCreationTemplate, this.state.all_templates))
	}

		/** <ReactCSSTransitonReplace
					transitionName={
              {
                enter: 'slide-enter',
                enterActive: 'slide-enter-active',
                leave: 'app-leave',
                leaveActive: this.state.openProtocolCreationWizard ? 'slide-up' : 'slide-down',
                appear: 'app-appear',
                appearActive: 'app-appear-active',
                height: 'slide-height',
              }
            }
            transitionAppear={ true }
            transitionAppearTimeout={ 1000 }
            transitionEnterTimeout={ 1200 }
            transitionLeaveTimeout={ 800 }
				>
			</ReactCSSTransitonReplace> **/

	render() {
		const projprot = this.state.projectEntries && this.state.protocolEntries
		const display = this.state.entryDisplay && this.state.all_templates

		return(
		<div id='Home' className='App'>
			<Flexbox flexDirection='column'>
				<ReactCSSTransitonReplace
				transitionName={
					{
						enter: 'slide-enter',
						enterActive: 'slide-enter-active',
						leave: 'app-leave',
						leaveActive: this.state.openProtocolCreationWizard ? 'slide-up' : 'slide-down',
						appear: 'app-appear',
						appearActive: 'app-appear-active',
						height: 'slide-height',
					}
				}
				transitionAppear={ true }
				transitionAppearTimeout={ 1000 }
				transitionEnterTimeout={ 1200 }
				transitionLeaveTimeout={ 800 }>
				{ this.state.openProtocolCreationWizard ?
					<ProtocolCreationWizard key='2' protocol={ this.state.protocolCreationTemplate } socketManager={ this.state.socketManager } cancel={ this.changeProtocolCreation } allTemplates={ this.state.all_templates } 
					dispatch={ this.state.dispatch } token={ this.state.auth_token } awsHandler={ this.state.awsHandler } properties={ this.state.protocolCreationWizardProperties } 
					handleCreation={ this.handleProtocolCreation } email={ this.state.email } />
					:
					<div key='1'>
						<Flexbox flexDirection='column'>
								<Flexbox flexDirection='row' flexGrow={ 1 }>
									<IconButton id='Drawer Open'
									tooltip='Projects/Protocols'
									tooltipPosition='bottom-right'
									onTouchTap={ this.changeDrawer }
									iconStyle={ style.menuIcon }
									style={ style.menu }
									disabled={ this.state.drawerOpen }
									>
										{ svgIcon('menu') }
									</IconButton>
									{ this.state.refreshingContents &&
										<CircularProgress id='Progress' style={ style.progress } />
									}
									{ projprot &&
										<Drawer id='Drawer' docked={ false } open={ this.state.drawerOpen } onRequestChange={ this.changeDrawer }>
											<ProjProtList id='ProjProtList' height={ this.state.height } dispatch={ this.state.dispatch } auth_token={ this.state.auth_token } 
											onSelection={ this.changeDrawer } projectTemplate={ this.state.projectTemplate } projectEntries={ this.state.projectEntries }
											protocolTemplate={ this.state.protocolTemplate } protocolEntries={ this.state.protocolEntries } refresh={ this.getProjectsAndProtocolsEntries } />
										</Drawer>
									}
								</Flexbox>
								{ projprot && display ?
									<EntryDisplay id='EntryDisplay' all_templates={ this.state.all_templates } entryDisplay={ this.state.entryDisplay } resize={ this.state.resize } set={ this.state.set }
									dispatch={ this.state.dispatch } token={ this.state.auth_token } curr_display={ this.state.curr_display } curr_display_entries={ this.state.curr_display_entries } 
									awsHandler={ this.state.awsHandler } protocol_entries={ this.state.protocolEntries } openProtocolCreation={ this.createProtocolCreation } />
									:
									<div id='Select'> Select or create a Project or Protocol from the menu on the left </div>
								}
						</Flexbox>
					</div>
				}
				</ReactCSSTransitonReplace>
			</Flexbox>
		</div>)
  }
}

export default Home
