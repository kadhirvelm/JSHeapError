import React from 'react'

import CreationWizard from '../Creation/CreationWizard/CreationWizard'
import { createNewEntry } from '../../../../State/EntryActions'
import { displayEntry } from '../../../../State/WebsiteActions'
import EntryList from './EntryList'

import { List } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'

import { merge, filter, propEq, not} from 'ramda'
import { svgIcon } from './icons'

const ENTRY_LIST_HEADER_HEIGHT = 100

const styles = { //return to and adjust based on window height
  help: {
		marginTop: '1px',
    marginRight: '2px',
    right:0,
    position: 'absolute',
    zIndex: 2,
  },
  tooltipStyles: {
		whiteSpace: 'normal',
		height: 'auto',
  },
}

export class ProjProtList extends React.Component{

	constructor(props) {
		super(props)
		this.state= merge(this.propConst(props), {
			openProject: false,
			openProtocol: false,
		})
	}

	propConst(props){
		return({
			dispatch: props.dispatch,
			auth_token: props.auth_token,
			onSelection: props.onSelection,
			height: props.height,
			projectTemplate: props.projectTemplate,
			projectEntries: this.removeDefaults(props.projectEntries),
			protocolTemplate: props.protocolTemplate,
			protocolEntries: this.removeDefaults(props.protocolEntries),
			refresh: props.refresh,
		})
	}

	notDefault = propEq('access', 'DEFAULT')
	removeDefaults = (templates) => filter( (template) => not(this.notDefault(template)), templates)

	componentWillReceiveProps(nextProps){
		this.setState(this.propConst(nextProps))
	}

	componentWillMount(){
		this.createEntry = this.createEntry.bind(this)
		this.refreshAndSelect = this.refreshAndSelect.bind(this)
	}

	changeProject = () => this.setState({ openProject: !this.state.openProject })
	changeProtocol = () => this.setState({ openProtocol: !this.state.openProtocol })
	closeAll = () => this.setState({ openProject: false, openProtocol: false })

	createEntry(submission) {
		this.state.dispatch(createNewEntry(this.state.auth_token, submission, this.refreshAndSelect))
		this.closeAll()
	}

	refreshAndSelect(entry){
		this.state.refresh()
		this.state.onSelection()
		this.state.dispatch(displayEntry(entry))
	}

	render() {
		return(
			<div>
				<List id='Projects ID'>
					<Subheader id='Projects Subheader'> Projects </Subheader>
					<IconButton
								tooltip={ this.state.projectTemplate.description }
								tooltipPosition='bottom-left'
								tooltipStyles={ styles.tooltipStyles }
								style={ { top: 0, ...styles.help } }
								disableTouchRipple={ true }
								>
								{ svgIcon('help') }
					</IconButton>
					<FlatButton label='New Project' labelStyle={ { color: '#EB3C40' } } secondary={ true } onClick={ this.changeProject } />
					{ this.state.projectTemplate &&
						<CreationWizard id='Project Creation Wizard' template={ this.state.projectTemplate } open={ this.state.openProject } handleClose={ this.changeProject } handleSubmit={ this.createEntry } />
					}
					{ this.state.projectEntries && 
						<EntryList id='Project List' height={ this.state.height - ENTRY_LIST_HEADER_HEIGHT } entries={ this.state.projectEntries } dispatch={ this.state.dispatch } onSelection={ this.state.onSelection } />
					}
				</List>
				<Divider />
				<List id='Protocols ID'>
					<Subheader id='Protocols Subheader'> Protocols </Subheader>
					<IconButton
								tooltip={ this.state.protocolTemplate.description }
								tooltipPosition='bottom-left'
								tooltipStyles={ styles.tooltipStyles }
								style={ { top: this.state.height/2 + ENTRY_LIST_HEADER_HEIGHT * 2.15, ...styles.help } }
								disableTouchRipple={ true }
								>
								{ svgIcon('help') }
					</IconButton>
					<FlatButton label='New Protocol' labelStyle={ { color: '#EB3C40' } } secondary={ true } onClick={ this.changeProtocol } />
					{ this.state.protocolTemplate &&
						<CreationWizard id='Protocol Creation Wizard' template={ this.state.protocolTemplate } open={ this.state.openProtocol } handleClose={ this.changeProtocol } handleSubmit={ this.createEntry } />
					}
					{ this.state.protocolEntries &&
						<EntryList id='Protocol List' height={ this.state.height - ENTRY_LIST_HEADER_HEIGHT } entries={ this.state.protocolEntries } dispatch={ this.state.dispatch } onSelection={ this.state.onSelection } />
					}
				</List>
			</div>
		)
    }
}

export default ProjProtList
