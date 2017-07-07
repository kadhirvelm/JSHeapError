import React from 'react'
import Flexbox from 'flexbox-react'

import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { repeat, min, curry, indexOf, reject, sort, mergeAll, map, forEach, concat, contains, filter, not, prop, isNil, length } from 'ramda'

const labelStyle = {
	background: 'none',
	border: 'none',
	margin: '0',
	padding: '0',
}

export class WellPlates extends React.Component{

	constructor(props){
		super(props)
		this.state = Object.assign({}, this.propsConst(props), {
			wellPlateValue: 0,
			collect: false,
			sendProperties: props.sendProperties,
			enableWells: props.enableWells,
			displayOnly: prop('displayOnly', props) ? props.displayOnly : false,
		})
	}

	propsConst = (props) => {
		this.groups = {}
		this.currentGroup = 1
		const dimensions =  props.properties.selectedWellIndex ? this.numColsAndRow(prop('selectedWellIndex', props.properties)) : { numCol: 1, numRow: 1 }
		const labels = this.createLabels(dimensions.numCol, dimensions.numRow)
		return({
			numCol: dimensions.numCol,
			numRow: dimensions.numRow,
			columnLabels: labels.columnLabels,
			rowLabels: labels.rowLabels,
			protocol: props.protocol,
			cancel: props.cancel,
			properties: props.properties,
			currSelectedWells: props.properties.currSelectedWells ? prop('currSelectedWells', props.properties) : [],
			selectedWell: props.properties.selectedWellIndex ? prop('selectedWellIndex', props.properties) : 0,
			showColors: props.showColors === undefined ? false : props.showColors,
		})
	}

	componentWillMount(){
		this.setState(this.resizeButtons(this.state.numCol, this.state.numRow))
		if (this.state.sendProperties && this.state.properties.selectedWellIndex === undefined) {
			this.state.sendProperties('welltype', 'Petri Dish')
			this.state.sendProperties('selectedWellIndex', 0)
			this.state.sendProperties('currSelectedWells', [ 0 ])
		}
	}

	resizeButtons = (numCol, numRow) => {
		const size = min((200/numRow), (300/numCol))
		return { size: size, width: size * numCol + 'px', height: size * numRow + 'px' }
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	changeWellType = (event, index, value) => {
		const dimensions = this.numColsAndRow(value)
		const newSizes = this.resizeButtons(dimensions.numCol, dimensions.numRow)
		const dimensionLabels = this.createLabels(dimensions.numCol, dimensions.numRow)
		this.setState(mergeAll([ newSizes, dimensions, dimensionLabels, { wellPlateValue: value, currSelectedWells: [] } ]))
		const wellType = dimensions.numCol === 1 ? 'Petri Dish' : dimensions.numCol * dimensions.numRow + ' Wells'
		this.state.sendProperties('welltype', wellType)
		this.state.sendProperties('selectedWellIndex', value)
		this.state.sendProperties('currSelectedWells', [])
		this.state.sendProperties('wellsFileAndExtruderMapping', [])
		this.state.sendProperties('completedWells', {})
	}

	numColsAndRow = (type) => {
		var dimensions
		switch(type){
			case 1:
				dimensions = [ 3, 2 ]
				break
			case 2:
				dimensions = [ 4, 3 ]
				break
			case 3:
				dimensions = [ 6, 4 ]
				break
			case 4:
				dimensions = [ 8, 6 ]
				break
			case 5:
				dimensions = [ 12, 8 ]
				break
			default:
				dimensions = [ 1, 1 ]
		}
		return { numCol: dimensions[0], numRow: dimensions[1] }
	}

	createLabels = (numCol, numRow) => {
		const columnLabels = map( (index) => index + 1, Array.apply(null, { length: numCol }).map(Number.call, Number))
		const rowLabels = map( (index) => String.fromCharCode(65 + index), Array.apply(null, { length: numRow }).map(Number.call, Number))
		return { columnLabels: columnLabels, rowLabels: rowLabels }
	}

	circleStyle = () => {
		const size = this.state.size.toString() + 'px'
		return({
			borderRadius: '50%',
			width: size,
			height: size,
		})
	}

	buttonStyle = (index) => {
		const size = this.state.size.toString() + 'px'
		return({
			background: (this.state.enableWells || this.state.showColors) ? this.wellColor(index) : '#546E7A',
			boxShadow: indexOf(index, this.state.currSelectedWells) !== -1 && 'inset 0px 0px 0px 3px #212121',
			boxSizing: 'border-box',
			border: 'none',
			borderRadius: '50%',
			width: size,
			height: size,
		})
	}

	wellColor = (index) => {
		if (!isNil(this.state.properties.wellsFileAndExtruderMapping) && !isNil(this.state.properties.wellsFileAndExtruderMapping[index]) && length(this.state.properties.wellsFileAndExtruderMapping[index]) > 0) {
			return prop(index.toString(), prop('completedWells', this.state.properties) ? this.state.properties.completedWells : {}) ? '#8BC34A' : '#FBC02D'
		}
		return '#BDBDBD'
	}

	startCollecting = (index, event) => {
		this.setState({ currSelectedWells: this.adjustCurrSelectedWells(index), collect: true })
	}

	stopCollecting = () => {
		if (this.state.collect) {
			this.setState({ collect: false })
			this.state.sendProperties('currSelectedWells', sort( (a,b) => a - b, this.state.currSelectedWells))
		}
	}

	buttonClicked = (index, event) => {
		if (this.state.collect) {
			this.setState({ currSelectedWells: this.adjustCurrSelectedWells(index) })
		}
	}

	adjustCurrSelectedWells = (index) => {
		var currSelectedWells = this.state.currSelectedWells
		if (indexOf(index, currSelectedWells) !== -1 ){
			const deselectWell = (value) => value === index
			currSelectedWells = reject( deselectWell, currSelectedWells)
		} else {
			currSelectedWells.push(index)
		}
		return currSelectedWells
	}

	selectAllWells = (index, event) => {
		if (typeof(index) === 'string'){
			this.selectAllRowsIn(index)
		} else {
			this.selectAllColumnsIn(index)
		}
	}

	selectAllRowsIn = (index) => {
		var currIndex = (index.charCodeAt(0) - 65) * this.state.numCol
		var allWells = repeat( 0, this.state.numCol)
		const currSelectedWells = this.adjustAllSelectedWells(this.getSelectedWells(currIndex, allWells, 1))
		this.setState({ currSelectedWells: currSelectedWells })
		this.state.sendProperties('currSelectedWells', sort( (a,b) => a - b, currSelectedWells))
	}

	selectAllColumnsIn = (index) => {
		var currIndex = index - 1
		const allWells = repeat( 0, this.state.numRow)
		const currSelectedWells = this.adjustAllSelectedWells(this.getSelectedWells(currIndex, allWells, this.state.numCol))
		this.setState({ currSelectedWells:  currSelectedWells })
		this.state.sendProperties('currSelectedWells', sort( (a,b) => a - b, currSelectedWells))
	}

	getSelectedWells = (currIndex, allWells, adjustIndex) => {
		const mapIndex = () => { const temp = currIndex; currIndex += adjustIndex; return temp }
		return map( mapIndex, allWells )
	}

	adjustAllSelectedWells = (filteredWells) => {
		var currSelectedWells = this.state.currSelectedWells
		if (filter( (index) => not(contains(index, currSelectedWells)), filteredWells).length === 0) {
			const deselectWell = (value) => contains(value, filteredWells)
			currSelectedWells = reject( deselectWell, currSelectedWells)
			return currSelectedWells
		}
		return concat(currSelectedWells, filteredWells)
	}

	curryOnStartCollecting = curry(this.startCollecting)
	curryButtonClicked = curry(this.buttonClicked)
	currySelectAllWells = curry(this.selectAllWells)

	returnKey = (id) => {
		var key = ''
		const createKey = (fileKey) => key += fileKey
		const mappingId = (file) => file.id.substring(17,24) + '_' + file.infill + '_' + file.outfill + '_'
		forEach(createKey, map(mappingId, id))
		return key
	}

	returnGroup = (id) => {
		if (this.groups[id]) {
			return this.groups[id]
		} else {
			this.groups[id] = this.currentGroup
			++this.currentGroup
			return this.currentGroup - 1
		}
	}

	buttonGroup = (index) => {
		if (prop('wellsFileAndExtruderMapping', this.state.properties)){
			const id = prop(index.toString(), this.state.properties.wellsFileAndExtruderMapping)
			return length(id) ? this.returnGroup(this.returnKey(id)) : ''
		}
		return ''
	}

	render() {
		return(
			<Flexbox flexDirection='column' justifyContent='center' alignContent='center' onMouseUp={ this.stopCollecting }>
				{ !this.state.displayOnly &&
					<SelectField style={ { marginBottom: '15px' } } hintText='Type of Well Plate' value={ this.state.selectedWell } onChange={ this.changeWellType }>
						<MenuItem value={ 0 } primaryText='Petri Dish' />
						<MenuItem value={ 1 } primaryText='6 Wells' />
						<MenuItem value={ 2 } primaryText='12 Wells' />
						<MenuItem value={ 3 } primaryText='24 Wells' />
						<MenuItem value={ 4 } primaryText='48 Wells' />
						<MenuItem value={ 5 } primaryText='96 Wells' />
					</SelectField>
				}
				<Flexbox justifyContent='center' alignContent='center'>
					<Flexbox flexDirection='column' style={ { marginTop: '15px', marginRight: '5px', height: this.state.height } }>
						{ this.state.rowLabels.map( (entry, index) => (
							<Flexbox flexDirection='column' key={ index } justifyContent='center' flexBasis='0' flexGrow={ 1 }> 
								<button style={ labelStyle } onClick={ this.state.enableWells && this.currySelectAllWells(entry) }> { entry } </button> 
							</Flexbox>
							))
						}
					</Flexbox>
					<Flexbox flexDirection='column' style={ { width: this.state.width, height: this.state.height + 25 } } >
						<Flexbox flexDirection='row' justifyContent='center' style={ { marginBottom: '5px' } }>
							{ this.state.columnLabels.map( (entry, index) => (
								<Flexbox key={ index } justifyContent='center' flexBasis='0' flexGrow={ 1 }> 
									<button style={ labelStyle } onClick={ this.state.enableWells && this.currySelectAllWells(entry) }> { entry } </button> 
								</Flexbox>
								))
							}
						</Flexbox>
						<Flexbox flexDirection='row' flexWrap='wrap'>
							{ repeat('well', parseInt(this.state.numCol * this.state.numRow, 10)).map( (entry, index) => (
								<Flexbox justifyContent='center' alignItems='center' key={ index } style={ this.circleStyle(index) }>
									<button label={ index } style={ this.buttonStyle(index) } onMouseDown={ this.state.enableWells && this.curryOnStartCollecting(index) } onMouseOver={ this.state.enableWells && this.curryButtonClicked(index) }>
										<font size={ 1 }> { this.buttonGroup(index) } </font>
									</button>
								</Flexbox>
								))
							}
						</Flexbox>
					</Flexbox>
				</Flexbox>
			</Flexbox>
		)
   }
}

export default WellPlates

