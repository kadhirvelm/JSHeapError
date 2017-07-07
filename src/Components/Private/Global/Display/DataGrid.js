import React, { Component } from 'react'
import Handsontable from '../../../../../node_modules/handsontable/dist/handsontable.full'
import '../../../../../node_modules/handsontable/dist/handsontable.css'

class DataGrid extends Component {

  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst = (props) => {
    this.data = props.data
    this.columnHeaders = props.columnHeaders
    return({
      componentName: props.componentName,
      updateData: props.updateData,
      disabled: props.disabled ? props.disabled : false,
    })
  }

  tableSettings = () => {
    return({
      manualColumnResize: true,
      manualRowResize: true,
      rowHeaders: true,
      afterChange: this.logChange,
      manualColumnMove: true,
      manualRowMove: true,
      columnSorting: true,
      sortIndicator: true,
      maxHeight: 320,
      stretchH: 'all',
      data: this.data,
      colHeaders: this.columnHeaders,
      cells: this.state.disabled && this.disableRows,
    })
  }

  disableRows = () => {
    return { editor: false }
  }

  componentDidMount() {
    let container = this.refs[this.state.componentName]
    this.table = new Handsontable(container, this.tableSettings())
  }

  componentWillReceiveProps(nextProps){
    if ( nextProps.data !== this.data ) {
      this.setState(this.propsConst(nextProps))
      this.updateTable()
    }
  }

  updateTable = () => {
    this.table.updateSettings( this.tableSettings() )
    this.table.updateSettings( this.tableSettings() ) //Not sure why this works, but fixes the error in keys
  }

  logChange = (values, source) => {
    if (this.state.updateData) {
      this.state.updateData(values, source)
    }
  }

  render() {
    return (
      <div style={ { marginBottom: '15px' } } ref={ this.state.componentName } />
      )
  }
}

export default DataGrid