import React from 'react'
import DataGrid from './DataGrid'

import { getAllEntries } from '../../../../State/EntryActions'
import { prop, keys, map, curry, values, uniq, chain } from 'ramda'

class TableVisual extends React.Component {

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
    this.setNumber = Object.keys(this.state.set).length
	}

	propsConst(props){
		return({
      set: props.set,
      token: props.token,
      dispatch: props.dispatch,
    })
	}

  componentWillMount(){
    this.updateAllPoints(this.state.set)
  }

  componentWillReceiveProps(nextProps){
    if (Object.keys(nextProps.set).length !== this.setNumber) {
      this.setNumber = Object.keys(nextProps.set).length
      this.updateAllPoints(nextProps.set)
    }
  }

  updateAllPoints = (sets) => {
    const allDataPoints = map(this.currFetchSetDataPoints(this.state), values(sets))
    Promise.all(allDataPoints).then( (values) => {
      const returnData = (set) => prop('Data', prop('content', set))

      const returnColumns = (arraySet) => keys(returnData(arraySet[0]))
      const columns = uniq(chain(returnColumns, values))

      const returnRows = (array) => chain(returnData, array)
      const rows = chain(returnRows, values)

      this.mapColumns(columns)
      this.mapRows(rows)

    })
  }

  currFetchSetDataPoints = curry(this.fetchSetDataPoints)

  fetchSetDataPoints(state, set){
    return new Promise( function(resolve) {
      const setDataPoints = (values) => resolve(values)
      const ids = prop('Included_data_points', set.content)
      state.dispatch(getAllEntries(state.token, { _id: ids }, setDataPoints))
    })
  }

  mapColumns = (keys) => {
    this.setState({ columns: keys })
  }

  mapRows = (rows) => {
    this.setState({ rows: rows })
  }

	render() {
    return (
      <div>
      { (this.state.rows && this.state.columns) &&
        <DataGrid
          componentName='Set Creator'
          columnHeaders={ this.state.columns }
          data={ this.state.rows }
        />
      }
      </div>
    )
  }

}

export default TableVisual