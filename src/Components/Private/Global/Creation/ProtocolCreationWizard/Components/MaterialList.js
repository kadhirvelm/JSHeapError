import React from 'react'
import Flexbox from 'flexbox-react'
import PropTypes from 'prop-types'

import { Tabs, Tab } from 'material-ui/Tabs'
import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import MenuItem from 'material-ui/MenuItem'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import CircularProgress from 'material-ui/CircularProgress'
import SelectField from 'material-ui/SelectField'
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table'

import ExtruderSix from './ExtruderSix'
import ExtruderTwo from './ExtruderTwo'

import { equals, curry, split, type, map, head, reject, concat, toPairs, length, filter, prop, uniq } from 'ramda'
import { _ } from 'underscore'

import { createNewEntry, getAllEntries } from '../../../../../../State/EntryActions'

import { svgIcon } from '../../../Display/icons'

export class MaterialList extends React.Component {

	constructor(props){
		super(props)
		this.state= Object.assign({}, this.propsConst(props), {
			size: 75,
			totalExtruders: 6,
			materialsDataSource: [],
			newMaterial: false,
			sendProperties: props.sendProperties,
			materialID: props.materialID,
			dispatch: props.dispatch,
			token: props.token,
			searchText: '',
		})
	}

	propsConst = (props) => {
		return({
			properties: props.properties,
			currSelectedExtruder: props.properties.currSelectedExtruder !== undefined ? prop('currSelectedExtruder', props.properties) : 0,
			extruderMaterials: props.properties.extruderMaterials !== undefined && prop('extruderMaterials', props.properties),
			needleGauge: props.properties.needleGauge || {},
			initialTab: props.properties.extruderSelectedTab ? prop('extruderSelectedTab', props.properties) : 0,
			displayOnly: prop('displayOnly', props) ? props.displayOnly : false,
		})
	}

	componentWillMount(){
		if (this.state.properties.extruderMaterials === undefined) { 
			this.createExtruderProperties() 
		} else {
			this.setSelectedMaterialsText()
		}
		if(this.state.properties.currentPrinter){
			this.setCurrentExtruder('A')
		}
		this.refreshMaterialContents()
	}

	createExtruderProperties = () => {
		var extruderMaterials = {}
		for (var index = 0; index < this.state.totalExtruders; ++index) {
			const character = String.fromCharCode(65 + index)
			extruderMaterials[character] = []
		}
		this.setState({ extruderMaterials: extruderMaterials })
		if( this.state.sendProperties ){
			this.state.sendProperties( 'extruderMaterials', extruderMaterials)
		}
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	buttonStyle = (index, isReady) => {
		const size = this.state.size + 'px'
		return({
			background: isReady ? '#8BC34A' : '#BDBDBD',
			boxShadow: equals(index, this.state.currSelectedExtruder) && 'inset 0px 0px 0px 3px #212121',
			boxSizing: 'border-box',
			border: 'none',
			borderRadius: '50%',
			width: size,
			height: size,
		})
	}

	mapMaterials = (material) => {
			const name = split('--', prop('Profile', material.content))
			return({
				text: name[0],
				content: name[1],
				id: prop('_id', material),
				value: (<MenuItem primaryText={ name[0] } />),
			})
		}

	refreshMaterialContents = () => {
		const setDataSource = (values) => this.setState({ materialsDataSource : length(values) > 0 ? map(this.mapMaterials, values) : [ 'None' ] })
		const filters = {
			templateId: this.state.materialID,
		}
		this.state.dispatch(getAllEntries(this.state.token, filters, setDataSource))
	}

	extruderSelected = (extruder) => {
		this.setCurrentExtruder(extruder)
	}

	setCurrentExtruder = (extruder) => {
		this.setState({ currSelectedExtruder: extruder }, () => {
			this.setSelectedMaterialsText()
		})
		if( _.isFunction(this.state.sendProperties)){
			this.state.sendProperties('currSelectedExtruder', extruder)
		}
	}

	handleUpdateInput = (value) => {
		const currExtruderMaterials = this.state.extruderMaterials
		const character = this.state.currSelectedExtruder
		const valueAppend = type(value) === 'String' ? { name: value } : { name: value.text, content: value.content, id: value.id }
		const currValues = uniq(concat([ valueAppend ], this.state.extruderMaterials[character]))
		currExtruderMaterials[character] = currValues
		this.setState({ extruderMaterials: currExtruderMaterials }, () => {
			this.setSelectedMaterialsText()
		})
		this.state.sendProperties( 'extruderMaterials', currExtruderMaterials)
	}

	removeMaterial = (value, event) => {
		const isValue = (entry) => entry === value
		const character = this.state.currSelectedExtruder
		const currMaterials = this.state.extruderMaterials
		currMaterials[character] = reject(isValue, currMaterials[character])
		this.setState({ extruderMaterials: currMaterials }, () => {
			this.setSelectedMaterialsText()
		})
		this.state.sendProperties( 'extruderMaterials', currMaterials)
	}

	changeNewMaterialDialog = () => {
		this.setState({ newMaterial: !this.state.newMaterial, materialName: '', materialContent: '', isFetching: false })
	}

	handleNewMaterial = () => {
		const submission = {
			templateId: this.state.materialID,
			access: 'PRIVATE',
			content: {
				Profile: this.state.materialName + ' -- ' + this.state.materialContent,
			},
			parents: [],
			children: [],
		}

		const callback = (newMaterial) => { 
			this.changeNewMaterialDialog()
			this.addToSelected(newMaterial)
			this.refreshMaterialContents() 
		}

		this.state.dispatch(createNewEntry(this.state.token, submission, callback))
		this.setState({ isFetching: true })
	}

	addToSelected = (newMaterial) => {
		this.handleUpdateInput(head(map(this.mapMaterials, [ newMaterial ])))
	}

	handleMaterialName = (event, newValue) => {
		this.setState({ materialName: newValue })
	}

	handleMaterialContent = (event, newValue) => {
		this.setState({ materialContent: newValue })
	}

	autoCompleteFilter = (searchText, key) => (key.indexOf(searchText) !== -1)

	clearSearchText = () => {
		this.setState({ searchText: '' })
	}

	updateSearchText = (searchText) => {
    this.setState({ searchText: searchText })
  }

  setSelectedMaterialsText = () => {
		if(!_.isUndefined(this.state.properties.extruderMaterials[this.state.currSelectedExtruder])) {
			const number = this.state.properties.extruderMaterials[this.state.currSelectedExtruder].length
			this.setState({ searchText:  number > 0 ? number + ' materials' : '' })
		}
  }

  mapExtruders = () => {
		const hasElements = (array) => length(array[1].materialList) > 0
		const mapElements = (value, key) => { return { materialList: value, needleGauge: this.state.needleGauge[key] } }
		return filter(hasElements, toPairs(_.mapObject(this.state.extruderMaterials, mapElements)))
  }

  currySetCurrentExtruder = curry(this.setCurrentExtruder)
  curryRemoveMaterial = curry(this.removeMaterial)

  handleTabChange = () => {
		const newValue = (this.state.initialTab === 0 ? 1 : 0)
		this.state.sendProperties('extruderSelectedTab', newValue)
		this.setState({ initialTab: newValue })
  }

  handleNeedleGaugeChange = (event, index, value) => {
		const currNeedleGauge = this.state.properties.needleGauge || {}
		currNeedleGauge[this.state.currSelectedExtruder] = value
		this.state.sendProperties('needleGauge', currNeedleGauge)
  }

  renderOverView = () => {
		return(
			<Flexbox flexDirection='column' justifyContent='center' alignItems='center'>
				{ this.mapExtruders().map( (value, index) => (
					<Flexbox flexDirection='row' alignItems='center' key={ index } style={ { marginTop: '5px', border: 'solid', borderWidth: '0.5px', borderColor: 'black' } }>
						<Flexbox flexDirection='column' alignItems='center' flexGrow={ 1 } style={ { marginLeft: '4px', marginRight: '8px' } }> 
							<font size={ 5 }> { value[0] } </font>
							<font size={ 2 }> { value[1].needleGauge } </font>
						</Flexbox>
						<Flexbox flexShrink={ 1 } style={ { marginTop: '5px', marginBottom: '5px' } }>
							<Table height='55px'>
								<TableBody displayRowCheckbox={ false }>
									{ value[1].materialList.map( (material, index) => (
										<TableRow key={ index } selectable={ false }>
											<TableRowColumn style={ this.mainContentStyle }> 
												<font size={ 3 }> { material.name } </font>
												<br />
												<div> { material.content } </div>
											</TableRowColumn>
										</TableRow>
										))
									}
								</TableBody>
							</Table>
						</Flexbox>
					</Flexbox>
					))
				}
			</Flexbox>
			)
  }

	render() {
		const actions = [
      <FlatButton key='cancel'
        label='Cancel'
        primary={ true }
        onTouchTap={ this.changeNewMaterialDialog }
      />,
    ]
		return(
			<Flexbox style={ { maxWidth: '250px' } }>
				{ !this.state.displayOnly ?
					<Tabs onChange={ this.handleTabChange } initialSelectedIndex={ this.state.initialTab }>
							<Tab label='Extruders'>
								<Flexbox flexDirection='column' alignItems='center' style={ { width: '250px' } } >
									<Flexbox flexDirection='row' justifyContent='center' flexWrap='wrap'>
										{ this.state.properties.currentPrinter ?
											<div>
												{ (this.state.properties.currentPrinter.content && this.state.properties.currentPrinter.content.version === 2) ?
													<ExtruderSix properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.currSelectedExtruder } rotate={ false } loadingMaterials={ true } />
													:
													<ExtruderTwo properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.currSelectedExtruder } rotate={ false } loadingMaterials={ true } />
												}
												<div style={ { marginTop: '5px' } }> 
													Extruder <font color='red' size={ 4 }> { this.state.currSelectedExtruder || '--' } </font> Contents 
												</div>
											</div>
											:
											<div>
												Please connect to a printer
											</div>
										}
									</Flexbox>
									{ this.state.currSelectedExtruder !== 0 &&
										<Flexbox flexDirection='column' key='CurrExtruder'>
											<Flexbox>
												<SelectField fullWidth={ true } floatingLabelText='Needle Gauge' value={ this.state.needleGauge[this.state.currSelectedExtruder] } onChange={ this.handleNeedleGaugeChange } hintText='Needle Gauge' maxHeight={ 200 }>
													{ _.range(34, 7, -1).map( (gauge) => (
														<MenuItem key={ gauge } value={ gauge } primaryText={ gauge } />
														))
													}
												</SelectField>
											</Flexbox>
											<Flexbox flexDirection='row' justifyContent='center' alignItems='center'>
												<AutoComplete onFocus={ this.clearSearchText } onBlur={ this.setSelectedMaterialsText } hintText='Materials' searchText={ this.state.searchText } onUpdateInput={ this.updateSearchText } fullWidth={ true } filter={ this.autoCompleteFilter } 
												dataSource={ this.state.materialsDataSource } onNewRequest={ this.handleUpdateInput } listStyle={ { height: '150px' } } />
												<IconButton tooltip='New Material' onClick={ this.changeNewMaterialDialog }> 
													{ svgIcon('redPlus') }
												</IconButton>
												<Dialog title='New Material (Private)' modal={ false } actions={ actions } open={ this.state.newMaterial } onRequestClose={ this.changeNewMaterialDialog }>
													{ this.state.isFetching &&
														<Flexbox flexDirection='row' justifyContent='flex-end'>
															<CircularProgress />
														</Flexbox>
													}
													<TextField floatingLabelText='Material Name' fullWidth={ true } onChange={ this.handleMaterialName } />
													<TextField floatingLabelText='Contents' fullWidth={ true } onChange={ this.handleMaterialContent } />
													<RaisedButton label='Submit' fullWidth={ true } primary={ true } disabled={ !(this.state.materialName && this.state.materialContent) } onClick={ this.handleNewMaterial } style={ { marginTop: '10px' } } />
												</Dialog>
											</Flexbox>
											<Table height='65px'>
												{ (this.state.extruderMaterials && this.state.extruderMaterials[this.state.currSelectedExtruder]) &&
													<TableBody displayRowCheckbox={ false }>
														{ this.state.extruderMaterials[this.state.currSelectedExtruder].map( (material, index) => (
															<TableRow key={ index } selectable={ false }>
																<TableRowColumn style={ this.mainContentStyle }> 
																	<font size={ 3 }> { material.name } </font>
																	<br />
																	<div> { material.content } </div>
																</TableRowColumn>
																<TableRowColumn style={ this.buttonContentStyle }> 
																	<IconButton iconStyle={ { width: '10px', height: '10px' } } onClick={ this.curryRemoveMaterial(material) }>
																		{ svgIcon('cancel') }
																	</IconButton>
																</TableRowColumn>
															</TableRow>
															))
														}
													</TableBody>
												}
											</Table>
										</Flexbox>
									}
								</Flexbox>
							</Tab>
						<Tab label='Overview'>
							{ this.renderOverView() }
						</Tab>
					</Tabs>
					:
					<div> { this.renderOverView() } </div>
				}
			</Flexbox>
		)
   }
}

MaterialList.propTypes = {
	materialID: PropTypes.string.isRequired,
	dispatch: PropTypes.func.isRequired,
	token: PropTypes.string.isRequired,
}

export default MaterialList

