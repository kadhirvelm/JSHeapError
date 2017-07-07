import React from 'react'
import './ExtruderTwoStyle.css'

import Flexbox from 'flexbox-react'

import { indexOf, curry, filter, length, keys } from 'ramda'

import { _ } from 'underscore'

const style = {
  color: 'white',
  width: '75px',
  height: '75px',
  borderRadius: '50%',
}


export class ExtruderTwo extends React.Component{

  constructor(props) {
      super(props)
      this.state = Object.assign({}, this.propsConst(props), {
        extruders: [ 'A', 'B' ],
        positions: [ 0, 1, 2, 3, 4, 5 ],
        loadingMaterials: false,
      })
  }

  isEmpty = (value) => length(value) > 0
  isInNeedleGauge = (needleGauge, key) => !_.isUndefined(_.property(key)(needleGauge))
  curryIsInNeedleGauge = curry(this.isInNeedleGauge)

  propsConst(props){
    return({
      properties: props.properties,
      extruderSelected: props.extruderSelected,
      loadingMaterials: props.loadingMaterials ? props.loadingMaterials : false,
      availableExtruders: filter( this.curryIsInNeedleGauge(props.properties.needleGauge), keys(filter(this.isEmpty, props.properties.extruderMaterials || [] ))),
      rotate: props.rotate,
      currSelectedExtruder: props.currSelectedExtruder,
    })
  }

  toggle = (extruder, event) => {
    this.state.extruderSelected(extruder, event)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.propsConst(nextProps))
  }

  handleChange (event, index, value) {this.setState({ value })}

  curryToggle = curry(this.toggle)

  render() {
    return (
      <div className='hexagon2' >
        <Flexbox justifyContent='space-between'>
          { this.state.extruders.map( (entry, index) => (
            <li style={ _.extend(_.clone(style), { background: indexOf(entry, this.state.availableExtruders) !== -1 ? ( (this.state.currSelectedExtruder === entry) ? '#e83e45' : '#f77478') : '#bdbdbd', 
            borderStyle: 'solid', borderWidth: '3px', borderColor: (this.state.currSelectedExtruder === entry) ? '#000000' : 'transparent' }) } 
            onTouchTap={ (indexOf(entry, this.state.availableExtruders) !== -1 || this.state.loadingMaterials) && this.curryToggle(entry) } 
            id={ 'extruder' + entry } key={ index }> 
              <Flexbox flexGrow={ 1 } flexBasis='100%' style={ { marginTop: '25px' } } justifyContent='center' alignItems='center'>
                { entry }
              </Flexbox>
            </li>
            ))
          }
        </Flexbox>
      </div>        
    )
  }
}

export default ExtruderTwo

