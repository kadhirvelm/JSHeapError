import React from 'react'
import { head, filter, mapObjIndexed, sortBy, prop, values, map, curry } from 'ramda'
import moment from 'moment'
import Flexbox from 'flexbox-react'

import GraphVisual from './GraphVisual'
import TableVisual from './TableVisual'

import IconButton from 'material-ui/IconButton'
import { svgIcon } from './icons'

import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'

import { getAllEntries } from '../../../../State/EntryActions'

const styles = {
	date: {
		position: 'relative',
		zIndex: 2,
	},
	dateFont: {
		color: 'grey',
	},
	entryBox: {
		width: '100%',
	},
}

const marginTop = {
	marginTop: '5px',
	marginBottom: '5px',
}

const defaultFlexBox = (div) => {
		return <Flexbox flexDirection='column' justifyContent='flex-start' alignItems='flex-start' flexGrow={ 2 } style={ marginTop }> { div } </Flexbox>
	}

const centeredFlexBox = (div) => {
	return <Flexbox flexDirection='column' justifyContent='flex-start' alignItems='center' flexGrow={ 2 } style={ marginTop }> { div } </Flexbox>
}

export class EntryDisplayWizard extends React.Component{

	constructor(props){
		super(props)
		this.displayDataVisual = this.displayDataVisual.bind(this)
		this.renderFields = this.renderFields.bind(this)
		this.sortByOrderAndAppendDisplay = this.sortByOrderAndAppendDisplay.bind(this)
		this.state = { 
			entry: props.entry,
			dispatch: props.dispatch,
			token: props.token,
			all_templates: props.all_templates,
			awsHandler: props.awsHandler,
			openSettings: false,
			changeNewEntry: props.changeNewEntry,
		}
	}

	componentWillMount(){
		this.setState(this.propsConst(this.props))
	}

	propsConst(props) {
		return({
			entry: props.entry,
			filteredEntries: this.renderFields(props.entry, this.returnTemplate(props.all_templates, props.entry)),
		})
	}

	returnTemplate(templates, entry) {
		const filterTemplateID = (template) => template._id === entry.templateId
		return head(filter(filterTemplateID, templates))
	}

	renderFields(entry, template) {
		const filteredEntries = this.sortByOrderAndAppendDisplay(entry, template)
		return map(this.currySwitchEntryDisplay(entry), filteredEntries)
	}

	sortByOrderAndAppendDisplay(thisEntry, thisTemplate){
		const sortByOrder = sortBy(prop('order'))

		const removeDisplayNone = (entry) => entry.display !== 'none'

		const appendOrderAndDisplay = (value, key) => {
			return({
				key: key,
				value: prop(key, thisEntry.content),
				display: value.display,
				order: value.order,
			})
		}
		return sortByOrder(values(filter(removeDisplayNone, mapObjIndexed(appendOrderAndDisplay, thisTemplate.content))))
	}
	
	switchEntryDisplay = (initialEntry, filteredEntry) => {
		var div
		switch(filteredEntry.display){
			case 'line':
				return centeredFlexBox(<font size='4' style={ { fontWeight: 'bold' } }> { filteredEntry.value } </font>)
			case 'paragraph':
				if (filteredEntry.order === 2) {
					div = <font size='2' style={ { paddingLeft: '1.8em' } }> { filteredEntry.value } </font>
				} else {
					div = <font> { filteredEntry.value } </font>
				}
				break
			case 'image':
				return centeredFlexBox(<img style={ { maxWidth: '100%' } } alt='' src={ filteredEntry.value } />)
			case 'list':
				this.displayDataVisual(initialEntry)
				break
			default:
				break
		}
		return defaultFlexBox(div)
	}

	currySwitchEntryDisplay = curry(this.switchEntryDisplay)

	displayDataVisual = (thisEntry) => {
		const fetchSetPromise = this.fetchSet(this.state, prop('Set', thisEntry.content).concat(prop('Visualization', thisEntry.content)))
		fetchSetPromise.then( (values) => {
			const setsAndVisuals = this.separateIntoSetAndVisualization(values)

			const graphVisual = (graph) => centeredFlexBox(<GraphVisual set={ setsAndVisuals.sets } overrideProps={ prop('Properties', graph.content) } token={ this.state.token } dispatch={ this.state.dispatch } />)
			const tableVisual = () => (<TableVisual set={ setsAndVisuals.sets } token={ this.state.token } dispatch={ this.state.dispatch } />)
			
			const graphs = setsAndVisuals.graphs ? map(graphVisual, setsAndVisuals.graphs) : []
			const table = setsAndVisuals.tables ? map(tableVisual, setsAndVisuals.tables) : []

			const all_displays = this.state.filteredEntries.concat(graphs.concat(table))
			this.setState({ filteredEntries: all_displays })
		})
	}

	fetchSet = (state, setIDs) => {
		return new Promise( function(resolve) {
			const callback = (values) => resolve(values)
			state.dispatch(getAllEntries(state.token, { _id: setIDs }, callback))
		})
	}

	separateIntoSetAndVisualization = (values) => {
		const setTemplate = head(filter((template) => template.name === 'Data Set', this.state.all_templates))
		const tableTemplate = head(filter((template) => template.name === 'Table', this.state.all_templates))
		const graphTemplate = head(filter((template) => template.name === 'Graph', this.state.all_templates))

		return {
			sets: filter((entry) => entry.templateId === setTemplate._id, values), 
			tables: filter((entry) => entry.templateId === tableTemplate._id, values),
			graphs: filter((entry) => entry.templateId === graphTemplate._id, values),
		}
	}

	componentWillReceiveProps(nextProps) {
		if ( nextProps.entry._id !== this.state.entry._id ) {
			this.setState(this.propsConst(nextProps))
		}
	}

	handleTouchTap = (event) => {
		this.setState({ openSettings: true, anchorEl: event.target })
	}

	onRequestClose = () => {
		this.setState({ openSettings: false })
	}

	handleSettingValue = (menuItemValue, event) => {
		switch(menuItemValue) {
			case 'Edit':
				console.log('Edit')
				break
			case 'Delete':
				console.log('Delete')
				break
			case 'Reorder':
				console.log('Reorder')
				break
			case 'View Graph':
				console.log('View Graph')
				break
			case 'Add Child':
				console.log('Add Child')
				break
			case 'Add Parent':
				console.log('Add Parent')
				break
			case 'Duplicate':
				console.log('Duplicate This')
				break
			default:
				break
		}
		this.onRequestClose()
	}

	curryHandleSettingValue = curry(this.handleSettingValue)

	changeEntryItems = () => {
		return[
			<MenuItem key='Edit' primaryText='Edit' onTouchTap={ this.curryHandleSettingValue('Edit') } />,
			<MenuItem key='Delete' primaryText='Delete' onTouchTap={ this.curryHandleSettingValue('Delete') } />,
			<MenuItem key='Reorder' primaryText='Reorder' onTouchTap={ this.curryHandleSettingValue('Reorder') } />,
		]
	}

	graphItems = () => {
		return[
			<MenuItem key='View Graph' primaryText='View Graph' onTouchTap={ this.curryHandleSettingValue('View Graph') } />,
			<MenuItem key='Add Child' primaryText='Add Child' onTouchTap={ this.curryHandleSettingValue('Add Child') } />,
			<MenuItem key='Add Parent' primaryText='Add Parent' onTouchTap={ this.curryHandleSettingValue('Add Parent') } />,
		]
	}
	
	render() {
		return(
			<Flexbox flexDirection='column' style={ styles.entryBox }>
				<Flexbox flexDirection='row' justifyContent='flex-end' alignItems='flex-end' style={ styles.date }> 
					<font size='1' style={ styles.dateFont }> { moment(new Date(this.state.entry.updatedAt)).format('MM/DD/YY hh:mm a') } </font>
					<IconButton id='Drawer Open'
							tooltip='Settings'
							tooltipPosition='bottom-right'
							iconStyle={ { height: 12, width: 12 } }
							style={ { height: 20, width: 20 } }
							onTouchTap={ this.handleTouchTap }>
						{ svgIcon('settings') }
					</IconButton>
					<Popover
						open={ this.state.openSettings }
						anchorEl={ this.state.anchorEl }
						anchorOrigin={ { horizontal: 'left', vertical: 'bottom' } }
						targetOrigin={ { horizontal: 'middle', vertical: 'top' } }
						onRequestClose={ this.onRequestClose }>
						<Menu>
							<MenuItem primaryText='Adjust Entry' rightIcon={ svgIcon('rightSettings') } menuItems={ this.changeEntryItems() } />
							<MenuItem primaryText='Graph' rightIcon={ svgIcon('rightSettings') } menuItems={ this.graphItems() } />
							<MenuItem primaryText='Duplicate' key={ 'Check for Protocol' } onTouchTap={ this.curryHandleSettingValue('Duplicate') } />
						</Menu>
					</Popover>
				</Flexbox>
				<Flexbox flexDirection='column' flexGrow={ 2 }>
				{ this.state.filteredEntries &&
					<div>
						{ this.state.filteredEntries.map( (entry, index) => (
							<div key={ index }> { entry } </div>
							)) 
						}
					</div>
				}
				</Flexbox>
			</Flexbox>
		)
	}
}

export default EntryDisplayWizard