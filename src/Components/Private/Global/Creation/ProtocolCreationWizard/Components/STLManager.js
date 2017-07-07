
import React from 'react'
import Flexbox from 'flexbox-react'

import { resize } from '../../../../../../State/WebsiteActions'

import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Step, Stepper, StepLabel } from 'material-ui/Stepper'
import Slider from 'material-ui/Slider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../../../../Global/Display/icons'

import { prop, curry } from 'ramda'

export class STLManager extends React.Component{

    constructor(props) {
      super(props)
      this.state = this.propsConst(props)
    }

    propsConst(props){
      return({
        dispatch: props.dispatch,
        token: props.token,
        properties: props.properties,
        sendProperties: props.sendProperties,
        handleSlicingSettingsSubmit: props.handleSlicingSettingsSubmit,
        currentStep: this.state ? this.state.currentStep : 0,
        allValues: this.state ? 
          this.state.allValues 
          : 
          {
            Name: '',
            LayerHeight: 0.2,
            Scale: 1,
            Rotate: 0,
            PrinterCenterX: 0,
            PrinterCenterY: 0,
            TravelSpeed: 4,
            PrintSpeed: 4,
            InfillDensity: 0.99,
            InfillPattern: 1,
            FirstLayerHeight: 0.2,
            SolidLayers: 0,
            InfillSpeed: 4,
            InfillAngle: 0,
            Perimeters: 1,
            PerimeterSpeed: 4,
            Skirts: 0,
            SkirtDistance: 6,
            SkirtHeight: 1,
          },
      })
    }

    round = (number, round) => {
      round = round || 10
      return parseFloat( number.toFixed(round) )
    }

    componentWillReceiveProps(nextProps){
      this.setState(this.propsConst(nextProps))
    }

    handleNext = () => { this.resizeScreen(); this.state.currentStep < 2 ? this.setState({ currentStep: ++this.state.currentStep }) : this.state.handleSlicingSettingsSubmit(this.state.allValues) }

    handlePrev = () => { this.resizeScreen(); this.state.currentStep > 0 && this.setState({ currentStep: --this.state.currentStep }) }

    resizeScreen = () => this.state.dispatch(resize())

    showProperties = (currentStep) => {
      switch(currentStep) {
        case 0:
          return this.firstStep()
        case 1:
          return this.secondStep()
        case 2:
          return this.thirdStep()
        default:
          return
      }
    }

    setValue = (key, event) => {
      var currValues = this.state.allValues
      currValues[key] = event.target.value
      this.setState({ allValues: currValues })
    }

    setSliderValue = (key, event, value) => {
      var currValues = this.state.allValues
      currValues[key] = value
      this.setState({ allValues: currValues })
    }

    setSelectFieldValue = (key, event, index, value) => {
      var currValues = this.state.allValues
      currValues[key] = value
      this.setState({ allValues: currValues })
    }

    currySetValue = curry(this.setValue)
    currySetSliderValue = curry(this.setSliderValue)
    currySetSelectFieldValue = curry(this.setSelectFieldValue)

    getValue = (key) => prop(key, this.state.allValues) !== undefined ? this.state.allValues[key] : ''

    firstStep = () => {
      return(
        <TextField value={ this.getValue('Name') } floatingLabelText='Slicing Profile Name' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('Name') } />
      )
    }

    possibleInfillPaterns = () => [ 'Line', 'Rectilinear', 'Concentric', 'Honeycomb', 'Hilbert Curve', 'Archimedean Chords', 'Octagram Spiral' ]

    secondStep = () => {
      return(
        <Flexbox flexDirection='row' justifyContent='space-around'>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnDoubleValue(this.getValue('LayerHeight')) + ' mm' } floatingLabelText='Layer Height' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('LayerHeight') } />
            <Slider value={ this.returnDoubleValue(this.getValue('LayerHeight')) } style={ { width: '85%' } } min={ 0 } max={ 3 } step={ 0.20 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('LayerHeight') } />
            <TextField value={ this.getValue('Scale') } floatingLabelText='Scale' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('Scale') } />
            <Slider value={ this.returnDoubleValue(this.getValue('Scale')) < 10 ? this.returnDoubleValue(this.getValue('Scale')) : 10  } style={ { width: '85%' } } min={ 0 } max={ 10 } step={ 0.25 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('Scale') } />
          </Flexbox>
          <Flexbox flexDirection='column'>
            <TextField value={ this.getValue('Rotate') } floatingLabelText='Rotate' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('Rotate') } />
            <TextField value={ this.getValue('PrinterCenterX') } floatingLabelText='Printer Center X' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('PrinterCenterX') } />
            <TextField value={ this.getValue('PrinterCenterY') } floatingLabelText='Printer Center Y' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('PrinterCenterY') } />
          </Flexbox>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnDoubleValue(this.getValue('TravelSpeed')) + ' mm/s' } floatingLabelText='Travel Speed' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('TravelSpeed') } />
            <Slider value={ this.returnDoubleValue(this.getValue('TravelSpeed')) } style={ { width: '85%' } } min={ 0 } max={ 64 } step={ 0.25 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('TravelSpeed') } />
            <TextField value={ this.returnDoubleValue(this.getValue('PrintSpeed')) + ' mm/s' } floatingLabelText='Print Speed' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('PrintSpeed') } />
            <Slider value={ this.returnDoubleValue(this.getValue('PrintSpeed')) } style={ { width: '85%' } } min={ 0 } max={ 64 } step={ 0.25 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('PrintSpeed') } />
          </Flexbox>
          <Flexbox flexDirection='column'>
            <Flexbox flexDirection='column' alignItems='center'>
              <TextField value={ this.returnDoubleValue(this.getValue('InfillDensity')) * 100 + ' %' } floatingLabelText='Infill Density' onChange={ this.currySetValue('InfillDensity') } />
              <Slider value={ this.returnDoubleValue(this.getValue('InfillDensity')) } style={ { width: '85%' } } min={ 0 } max={ 1 } step={ 0.01 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('InfillDensity') } />
            </Flexbox>
            <SelectField value={ this.getValue('InfillPattern') } hintText='Infill Pattern' floatingLabelText='Infill Pattern' onChange={ this.currySetSelectFieldValue('InfillPattern') }>
              { this.possibleInfillPaterns().map( (entry, index) => (
                <MenuItem key={ index + 1 } value={ index + 1 } label={ entry } primaryText={ entry } />
                ))
              }
            </SelectField>
          </Flexbox>       
        </Flexbox>
      )
    }

    thirdStep = () => {
      return(
        <Flexbox flexDirection='row' justifyContent='space-around'>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnDoubleValue(this.getValue('FirstLayerHeight')) + ' mm' } floatingLabelText='First Layer Height' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('FirstLayerHeight') } />
            <Slider value={ this.returnDoubleValue(this.getValue('FirstLayerHeight')) } style={ { width: '85%' } } min={ 0 } max={ 3 } step={ 0.20 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('FirstLayerHeight') } />
          </Flexbox>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnIntValue(this.getValue('SolidLayers')) } floatingLabelText='Solid Layers' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('SolidLayers') } />
            <TextField value={ this.returnDoubleValue(this.getValue('InfillSpeed')) + ' mm/s' } floatingLabelText='Infill Speed' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('InfillSpeed') } />
            <Slider value={ this.returnDoubleValue(this.getValue('InfillSpeed')) } style={ { width: '85%' } } min={ 0 } max={ 64 } step={ 0.25 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('InfillSpeed') } />
            <TextField value={ this.returnIntValue(this.getValue('InfillAngle')) + ' degrees' } floatingLabelText='Infill Angle' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('InfillAngle') } />
            <Slider value={ this.returnDoubleValue(this.getValue('InfillAngle')) } style={ { width: '85%' } } min={ 0 } max={ 90 } step={ 1 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('InfillAngle') } />
          </Flexbox>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnDoubleValue(this.getValue('Perimeters')) } floatingLabelText='Perimeters' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('Perimeters') } />
            <TextField value={ this.returnDoubleValue(this.getValue('PerimeterSpeed')) + ' mm/s' } floatingLabelText='Perimeter Speed' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('PerimeterSpeed') } />
            <Slider value={ this.returnDoubleValue(this.getValue('PerimeterSpeed')) } style={ { width: '85%' } } min={ 0 } max={ 64 } step={ 0.25 } sliderStyle={ { margin: '3px' } } onChange={ this.currySetSliderValue('PerimeterSpeed') } />
          </Flexbox>
          <Flexbox flexDirection='column' alignItems='center'>
            <TextField value={ this.returnIntValue(this.getValue('Skirts')) } floatingLabelText='Skirts' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('Skirts') } />
            <TextField value={ this.returnIntValue(this.getValue('SkirtDistance')) } floatingLabelText='Skirt Distance' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('SkirtDistance') } />
            <TextField value={ this.returnIntValue(this.getValue('SkirtHeight')) } floatingLabelText='Skirt Height' style={ { marginLeft: '4px', marginRight: '4px' } } onChange={ this.currySetValue('SkirtHeight') } />
          </Flexbox>  
        </Flexbox>
      )
    }

    returnIntValue = (value) => parseInt(value, 10)
    returnDoubleValue = (value) => this.round(parseFloat(value), 2)

    render() {
      return(
        <Flexbox flexDirection='column' flexGrow={ 1 }>
          <Flexbox justifyContent='center' flexBasis='auto'>
            <Stepper activeStep={ this.state.currentStep }>
              <Step>
                <StepLabel> Profile Name </StepLabel>
              </Step>
              <Step>
                <StepLabel> Basic Settings </StepLabel>
              </Step>
              <Step>
                <StepLabel> Advanced Settings </StepLabel>
              </Step>
            </Stepper>
          </Flexbox>
          <Flexbox flexDirection='column'>
            <Flexbox flexBasis='auto' justifyContent='flex-end'>
              { this.state.currentStep > 0 &&
                <RaisedButton label={ this.state.currentStep > 0 && 'Previous' } onTouchTap={ this.handlePrev } style={ { marginRight: '5px' } } />
              }
              <RaisedButton label={ this.state.currentStep === 2 ? 'Submit' : 'Next' } primary={ this.state.currentStep === 2 ? true : false } onTouchTap={ this.handleNext } />
            </Flexbox>
            <Flexbox flexGrow={ 1 } justifyContent='center'>
              { this.showProperties(this.state.currentStep) }
            </Flexbox>
            <Flexbox justifyContent='flex-end'>
              <IconButton tooltip='Help'>
                { svgIcon('help') }
              </IconButton>
            </Flexbox>
          </Flexbox>
        </Flexbox>
      )
    }
}

export default (STLManager)

