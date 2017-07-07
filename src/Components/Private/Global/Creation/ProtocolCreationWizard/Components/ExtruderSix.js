import React from 'react'
import './ExtruderSixStyle.css'
import { map, indexOf, forEach, curry, filter, length, keys } from 'ramda'
import { _ } from 'underscore'


let deg = 0
let iconDegree = 360

const toggleExtruder = (extruder) => {
  extruder = 'extruder' + extruder
  if (iconDegree === 0) iconDegree = 360
    let extruderIcon = document.getElementById(extruder)
    extruderIcon.style.webkitTransform = 'rotate('+(iconDegree - deg)+'deg)' 
    extruderIcon.style.mozTransform    = 'rotate('+(iconDegree - deg)+'deg)' 
    extruderIcon.style.msTransform     = 'rotate('+(iconDegree - deg)+'deg)' 
    extruderIcon.style.oTransform      = 'rotate('+(iconDegree - deg)+'deg)' 
    extruderIcon.style.transform       = 'rotate('+(iconDegree - deg)+'deg)' 
}

//Component
export class ExtruderSix extends React.Component{

  constructor(props) {
      super(props)
      this.state = Object.assign({}, this.propsConst(props), {
        extruders: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
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

  increment(position) {
    return position + 1
  }

  toggle = (extruder, event) => {
    if( this.state.rotate ){
      let degreeChange = 1
      const index = indexOf(extruder, this.state.extruders)
      if ((5 - this.state.positions[index]) >= 3) {
        degreeChange = -1
      }
      const inc = (currentPos) => {
        if ((degreeChange === -1) && (currentPos === 0)) return 5
        else if ((degreeChange === 1) && (currentPos === 5)) return 0
        return currentPos + (1 * degreeChange)
      }
      var hexagon = document.querySelector('.hexagon')
      let pos = this.state.positions
      while (pos[index] !== 0) {
        deg += 60 * degreeChange
        hexagon.style.webkitTransform = 'rotate('+deg+'deg)'
        hexagon.style.mozTransform    = 'rotate('+deg+'deg)' 
        hexagon.style.msTransform     = 'rotate('+deg+'deg)' 
        hexagon.style.oTransform      = 'rotate('+deg+'deg)' 
        hexagon.style.transform       = 'rotate('+deg+'deg)' 
        forEach(toggleExtruder, this.state.extruders)
        pos = map(inc, pos)
      }
      this.setState(Object.assign({}, this.state, {
        positions: pos,
      }))
    }
    this.state.extruderSelected(extruder, event)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.propsConst(nextProps))
  }

  handleChange (event, index, value) {this.setState({ value })}

  curryToggle = curry(this.toggle)

  render() {
    return (
      <div className='hexagon'>
        <ul>
          { this.state.extruders.map( (entry, index) => (
            <li style={ { background: indexOf(entry, this.state.availableExtruders) !== -1 ? '#e83e45' : '#bdbdbd', 
            borderStyle: 'solid', borderWidth: '2px', borderColor: (this.state.currSelectedExtruder === entry) && '#000000' } } 
            onTouchTap={ (indexOf(entry, this.state.availableExtruders) !== -1 || this.state.loadingMaterials) && this.curryToggle(entry) } 
            id={ 'extruder' + entry } key={ index }> { entry } </li>
            ))
          }
        </ul>
      </div>        
    )
  }
}

export default (ExtruderSix)

