import React from 'react'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import createPlotlyComponent from 'react-plotlyjs'

import CircularProgress from 'material-ui/CircularProgress'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'
import * as _colors from 'material-ui/styles/colors'
import Flexbox from 'flexbox-react'
import { getAllEntries } from '../../../../State/EntryActions'
import { prop, keys, map, values, curry, chain, filter, isEmpty, isNil, slice, sort } from 'ramda'

const Plotly = require('plotly.js/dist/plotly')
const PlotlyComponent = createPlotlyComponent(Plotly)

class GraphVisual extends React.Component {

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
    this.setNumber = Object.keys(this.state.set).length
	}

	propsConst(props){
		return({
      onPropertiesSet: props.onPropertiesSet,
      disabled: false,
      set: props.set,
      token: props.token,
      dispatch: props.dispatch,
      expanded: this.state ? this.state.expanded : false,
      overrideProps: props.overrideProps,
      properties: this.state ? this.state.properties : {
        type: 'line',
        x: '',
        xlabel: 'X',
        y: '',
        ylabel: 'Y',
        z: '',
        zlabel: 'Z',
        title: '',
      },
    })
	}

  componentWillMount(){
    this.updateAllPoints(this.state.set)
  }

  colors = () => {
    const filter600 = (entry) => entry.endsWith('600') && !entry.endsWith('A600')
    const filter300 = (entry) => entry.endsWith('300') && !entry.endsWith('A300')
    return filter( filter600, keys(_colors)).concat(filter( filter300, keys(_colors)))
  }

  componentWillReceiveProps(nextProps){
    if (Object.keys(nextProps.set).length !== this.setNumber) {
      this.setNumber = Object.keys(nextProps.set).length
      this.updateAllPoints(nextProps.set)
    }
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded: expanded })
  }

  updateAllPoints = (sets) => {
    const allDataPoints = map(this.currFetchDataPoints(this.state), values(sets))
    const setNames = map( (set) => prop('Name', set.content), values(sets))
    Promise.all(allDataPoints).then( (values) => {
      const columns = this.availableColumns(values)
      const rows = this.availableRows(values)
      if (!isEmpty(columns)){
        if ( this.state.overrideProps ){
          this.setState({ properties: this.state.overrideProps })
        } else {
          this.adjustProps('x', columns[0])
          this.adjustProps('y', columns[0])
          this.adjustProps('z', columns[0])
        }
        this.setState({ columns: columns, rows: rows, names: setNames, setColors: slice(0, setNames.length - 1, this.colors()) })
      } else {
        this.setState({ disabled: true })
      }
    })
  }

  currFetchDataPoints = curry(this.fetchDataPoints)

  fetchDataPoints(state, set){ 
    return new Promise( function(resolve) {
      const setDataPoints = (values) => resolve(values)
      const ids = prop('Included_data_points', set.content)
      state.dispatch(getAllEntries(state.token, { _id: ids }, setDataPoints))
    })
  }

  availableColumns(values) {
    const returnData = (set) => prop('Data', prop('content', set))

    const returnColumns = (arraySet) => keys(returnData(arraySet[0]))
    const allColumns = {}
    const mapColumns = (value) => allColumns[value] ? allColumns[value] += 1 : allColumns[value] = 1
    map(mapColumns, chain(returnColumns, values))

    return keys(filter((value) => value === this.setNumber, allColumns))
  }

  availableRows(values) {
    const returnData = (set) => prop('Data', prop('content', set))

    return map((array) => map(returnData, array), values)
  }

  mapRows = (rows) => {
    const extractData = (row) => prop('Data', prop('content', row))
    return map(extractData, rows)
  }

  adjustProps = (key, value) => {
    var adjustProps = this.state.properties
    adjustProps[key] = value
    this.setState({ properties: adjustProps })
    if (this.state.onPropertiesSet){
      this.state.onPropertiesSet(adjustProps)
    }
  }

  adjustTitle = (event) => {
    this.adjustProps('title', event.target.value)
  }

  adjustType = (event, index, value) => {
    this.adjustProps('type', value)
  }

  adjustX = (event, index, value) => {
    this.adjustProps('x', value)
  }

  adjustXLabel = (event) => {
    this.adjustProps('xlabel', event.target.value)
  }

  adjustY = (event, index, value) => {
    this.adjustProps('y', value)
  }

  adjustYLabel = (event) => {
    this.adjustProps('ylabel', event.target.value)
  }

  adjustZ = (event, index, value) => {
    this.adjustProps('z', value)
  }

  adjustZLabel = (event,) => {
    this.adjustProps('zlabel', event.target.value)
  }

  setData = () => {
    var currSet = -1
    const mapDataValue = (property, row) => Number(prop(property, row))
    const sortSetFilter = (property, rowA, rowB) => mapDataValue(property, rowA) - mapDataValue(property, rowB)
    const curryMapDataValue = curry(mapDataValue)
    const currySortSetFilter = curry(sortSetFilter)

    const setMap = (set) => {
      const setSorted = sort(currySortSetFilter(this.state.properties.x), set)
      ++currSet
      return ({
        type: this.state.properties.type,
        x: map(curryMapDataValue(this.state.properties.x), setSorted),    
        y: map(curryMapDataValue(this.state.properties.y), setSorted),
        z: map(curryMapDataValue(this.state.properties.z), setSorted),
        mode: 'lines',
        name: this.state.names[currSet].substring(0, 50),   
        marker: {
          color: this.state.setColors[currSet],
        },
      })
    }

    return chain(setMap, this.state.rows)
  }

  substring = (name) => name.substring(0, 50)

  layout = () => { return ({
      showlegend: true,
      legend: {
        x: 0,
        y: 0,
        borderwidth: 0.1,
      },
      autosize: true,
      margin: {
        l: 45,
        r: 10,
        t: (this.state.overrideProps !== undefined) ? 80 : 35,
        b: 45,
      },
      title: this.substring(this.state.properties.title), 
      xaxis: {
        title: this.substring(this.state.properties.xlabel), 
      },
      yaxis: {
        title: this.substring(this.state.properties.ylabel),
      },
      zaxis: {
        title: this.substring(this.state.properties.zlabel),
      },
    })
  }

  config = () => { return ({
      showLink: false,
      displayModeBar: (this.state.overrideProps !== undefined),
    })
  }

  renderColumnChoices = () => {
    if (this.state.columns) {
      return this.state.columns.map( (value, index) => (
      <MenuItem value={ value } key={ index } primaryText={ value } />
      ))
    }
  }

	render() {
    const disable = (this.state.overrideProps !== undefined)
    return (
      <div>
      { this.state.disabled ?
        <font color={ _colors.red600 } > No overlapping column headers </font>
        :
        <Flexbox flexDirection='column' style={ { marginTop: '5px', marginBottom: '5px' } }>
        { !disable &&
          <Flexbox style={ { marginBottom: '10px' } }>
            <Card expanded={ this.state.expanded } onExpandChange={ this.handleExpandChange } style={ { width: '100%' } }>
            <CardHeader title='Graph Properties' actAsExpander={ true } showExpandableButton={ true } />
              <CardText expandable={ true }>
                <Flexbox flexDirection='row' alignItems='flex-end'>
                  <TextField fullWidth={ true } floatingLabelText='Graph Title' value={ this.state.properties.title } onChange={ this.adjustTitle } style={ { marginRight: '7px' } } />
                  <SelectField disabled={ disable } value={ this.state.properties.type } onChange={ this.adjustType } floatingLabelText='Graph Type'>
                    <MenuItem value='line' label='Line' primaryText='Line' />
                    <MenuItem value='scatter3d' label='3D Line Graph' primaryText='3D Line Graph' />
                  </SelectField>
                </Flexbox>
                <Flexbox flexDirection='row'>
                  <SelectField disabled={ disable } value={ this.state.properties.x } onChange={ this.adjustX } autoWidth={ true } floatingLabelText='X Value'>
                    { this.renderColumnChoices() }
                  </SelectField>
                  <TextField disabled={ disable } fullWidth={ true } floatingLabelText='X Axis Label' value={ this.state.properties.xlabel } onChange={ this.adjustXLabel } />
                </Flexbox>
                <Flexbox flexDirection='row'>
                  <SelectField disabled={ disable } value={ this.state.properties.y } onChange={ this.adjustY } autoWidth={ true } floatingLabelText='Y Value'>
                    { this.renderColumnChoices() }
                  </SelectField>
                  <TextField disabled={ disable } fullWidth={ true } floatingLabelText='Y Axis Label' value={ this.state.properties.ylabel } onChange={ this.adjustYLabel } />
                </Flexbox>
                { this.state.properties.type === 'scatter3d' &&
                  <Flexbox flexDirection='row'>
                    <SelectField disabled={ disable } value={ this.state.properties.z } onChange={ this.adjustZ } autoWidth={ true } floatingLabelText='Z Value'>
                      { this.renderColumnChoices() }
                    </SelectField>
                    <TextField disabled={ disable } fullWidth={ true } floatingLabelText='Z Axis Label' value={ this.state.properties.zlabel } onChange={ this.adjustZLabel } />
                  </Flexbox>
                }
              </CardText>
            </Card>
          </Flexbox>
        }
        { (!isNil(this.state.columns) && !isNil(this.state.rows)) ?
          <Flexbox flexDirection='column' justifyContent='center' alignItems='flex-start'>
            <PlotlyComponent data={ this.setData() } layout={ this.layout() } config={ this.config() } />
          </Flexbox>
          :
          <Flexbox flexDirection='row' justifyContent='center' alignItems='flex-start'>
            <CircularProgress />
          </Flexbox>
        }
        </Flexbox>
      }
      </div>
    )
  }
}

export default GraphVisual