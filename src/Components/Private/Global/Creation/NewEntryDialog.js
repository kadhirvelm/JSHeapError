import React from 'react'

import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import { GridList, GridTile } from 'material-ui/GridList'

import { filter, curry, propEq, concat, map, prop, set, lensProp, replace } from 'ramda'
import { svgIcon } from '../Display/icons'

const styles = { //return to and adjust based on window height
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  grid: {
		marginTop: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    overflowY: 'auto',
    maxHeight: '400px',
  },
  gridTile: { 
		width: '100%',
		height: 150,
  },
  help: {
		marginTop: '1px',
    marginRight: '2px',
    top:0,
    right:0,
    position: 'absolute',
    zIndex: 2,
  },
  tooltipStyles: {
		whiteSpace: 'normal',
		height: 'auto',
  },
}

export class NewEntryDialog extends React.Component{

	constructor(props){
		super(props)
		this.propsConst = this.propsConst.bind(this)
		this.state = this.propsConst(props)
	}

	propsConst(props){
		const all_templates = this.filterByCreatedBy(props.templates, props.protocol_entries, props.curr_template_id)
		return({
			open: props.open,
			handleClose: props.handleClose,
			all_templates: all_templates,
			createNewEntry: props.createNewEntry,
			createNewProtocol: props.createNewProtocol,
		})
	}

	helpText = (name) => {
		switch(name){
			case 'BioBot Print':
				return '3D Print'
			default:
				return ''
		}
	}

	filterByCreatedBy(templates, protocols, curr_template_id) {
		const isInCreatedBy = (checkTemplate) => checkTemplate.createdBy.indexOf(curr_template_id) > -1
		const accessDefault = propEq('access', 'DEFAULT')
		const addNameAndIcon = (protocol) => { 
			const name = prop('Title', protocol.content)
			protocol = set(lensProp('isProtocol'), true, protocol)
			protocol = set(lensProp('name'), name, protocol)
			protocol = set(lensProp('icon'), replace(/ /g, '_', name), protocol)
			protocol = set(lensProp('description'), this.helpText(name), protocol)
			return protocol
		}
		const filteredTemplates = filter(isInCreatedBy, templates)
		const filteredProtocols = map(addNameAndIcon, filter(accessDefault, protocols))
		return concat(filteredTemplates, filteredProtocols)
	}

	componentWillReceiveProps(nextProps) {
		this.setState(this.propsConst(nextProps))
	}

	onClick = (template, event) => {
		if (prop('isProtocol', template)) {
			this.state.createNewProtocol(template)
		} else {
			this.state.createNewEntry(template)
		}
	}

	curryOnClick = curry(this.onClick)

	render() {
		const actions = [
			<RaisedButton key='cancel'
			label="Cancel"
			primary={ true }
			onTouchTap={ this.state.handleClose }
			/>,
		]
		return(
			<Dialog id='Dialog'
			title='Add Entry'
			actions={ actions }
			modal={ false }
			open={ this.state.open }
			onRequestClose={ this.state.handleClose }
			autoScrollableBodyContent={ true }
			>
			<div style={ styles.root } >
				<GridList id='GridList' style={ styles.grid } cols={ 2 }>
					{ this.state.all_templates.map((template, index) => (
						<Paper key={ index }>
							<GridTile key={ index }>
							<IconButton
								tooltip={ template.description }
								tooltipPosition='bottom-left'
								tooltipStyles={ styles.tooltipStyles }
								style={ styles.help }
								disableTouchRipple={ true }
								>
								{ svgIcon('help') }
							</IconButton>
							<RaisedButton 
								label={ template.name }
								onClick={ this.curryOnClick(template) }
								icon={ svgIcon(template.icon) }
								style={ styles.gridTile } />
							</GridTile>
						</Paper>
					))}
				</GridList>
				</div>
			</Dialog>
		)
    }

}

export default NewEntryDialog