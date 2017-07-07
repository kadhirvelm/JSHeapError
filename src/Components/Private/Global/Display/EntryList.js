import React from 'react'
import { sortBy, prop } from 'ramda'
import { displayEntry } from '../../../../State/WebsiteActions'
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table'

export class EntryList extends React.Component{

	constructor(props){
		super(props)
		this.propsConst = this.propsConst.bind(this)
		this.state = this.propsConst(props)
	}

	propsConst(props){
		const entries = this.updateEntriesOrder(props.entries)
		return({
			dispatch: props.dispatch,
			height: props.height,
			entries: entries,
			onSelection: props.onSelection,
		})
	}

	updateEntriesOrder(entries){
		const entriesSortFunction = sortBy(prop('updatedAt'))
		return entriesSortFunction(entries).reverse()
	}

	componentWillMount(){
		this.handleChange = this.handleChange.bind(this)
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}
	
	handleChange(event) {
		const entryToDisplay = this.state.entries[event[0]]
		if(entryToDisplay !== undefined) {
			this.state.dispatch(displayEntry(entryToDisplay))
			this.state.onSelection()
		}
	}

	render() {
		return(
			<Table id='Table' height={ this.state.height+'px' } onRowSelection={ this.handleChange }>
				<TableBody id='TableBody' displayRowCheckbox={ false }>
					{this.state.entries.map( (row, index) => (
						<TableRow key={ index }>
							<TableRowColumn>{row.content.Title}</TableRowColumn>
						</TableRow>
					))}
				</TableBody>
			</Table>
		)
	}
}

export default EntryList
