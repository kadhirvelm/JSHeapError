import React from 'react'
import Flexbox from 'flexbox-react'
import './Extruder.css'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ExtruderSix from './ExtruderSix'
import ExtruderTwo from './ExtruderTwo'
import PillBox from './PillBox'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Dialog from 'material-ui/Dialog'

import { createNewEntry, getAllEntries } from '../../../../../../State/EntryActions'

import { _ } from 'underscore'
import { filter, head, forEach, curry, prop } from 'ramda'

var moment = require('moment')

const style = {
  textFieldStyle: { width: '50%', marginRight: '10px' },
  inputStyle: { textAlign: 'center' },
  floatingLabelStyle: { fontSize: '12px' },
  flexboxStyle: { marginRight: '5px', marginLeft: '5px' },
}

export class Extruder extends React.Component{

  componentWillMount(){
    this.state = Object.assign({}, this.propsConst(this.props), {
      openProfileName: false,
    })
    this.state.socketManager.updateCallback(this.handleSocketManagerCallback)
    this.updateExtruderProfileList()
  }

  propsConst(props){
    return({
      dispatch: props.dispatch,
      token: props.token,
      sendProperties: props.sendProperties,
      properties: props.properties,
      currentPrinter: props.properties.currentPrinter,
      extruderProfileTemplate: props.extruderProfileTemplate,
      extruderProfile: this.sendExtruderProfile(props.properties, props.sendProperties),
      socketManager: props.socketManager,
    })
  }

  componentDidMount(){
    this.extruderSelected('A')
  }

  updateExtruderProfileList = () => {
    const updateExtruderProfileSelectList = (allExtruderProfiles) => {
      this.setState({ allExtruderProfiles: allExtruderProfiles }, () => {
        this.createSelectList()
        this.updateProperties()
      })
    }
    this.state.dispatch(getAllEntries(this.state.token, { templateId: this.state.extruderProfileTemplate._id }, updateExtruderProfileSelectList))
  }

  createSelectList = () => {
    const allExtruderProfilesItems = []
    moment().format('MMM Do YY')
    _.map(this.state.allExtruderProfiles, (entry, index) => {
      allExtruderProfilesItems.push(<MenuItem key={ index } value={ entry._id } primaryText={ entry.content.Name } secondaryText={ moment(new Date(prop('updatedAt', entry))).format('MM/DD-hh a') } />)
    })
    this.setState({ allExtruderProfilesItems: allExtruderProfilesItems })
  }

  handleSocketManagerCallback(message_id, value){
    //console.log('Socket manager in Extruder ', message_id, value)
  }

  createExtruderProfile = (properties) => {
    const extruderKeys = _.keys(_.omit(properties.extruderMaterials, (value) => { return value.length === 0 }))
    const currExtruderProperties = properties.extruderProfile || {}
    const isInExtruderProperties = (key) => currExtruderProperties[key] === undefined
    const setExtruderProperties = (key) => currExtruderProperties[key] = { target_pressure: 0, current_pressure: '--', target_temperature: 23, current_temperature: '--' }
    forEach(setExtruderProperties, filter( isInExtruderProperties, extruderKeys))
    return currExtruderProperties
  }

  sendExtruderProfile = (properties, sendProperties) => {
    const extruderProperties = this.createExtruderProfile(properties)
    sendProperties('extruderProfile', extruderProperties)
    return extruderProperties
  }

  extruderSelected = (extruder) => {
    this.setState({ currentExtruder: extruder })
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.state.extruderProfile, this.createExtruderProfile(nextProps.properties)) || !_.isEqual(this.state.currentPrinter, nextProps.properties.currentPrinter)) {
      this.setState(this.propsConst(nextProps))
    }
    if (!_.isUndefined(this.state.allExtruderProfiles) && !_.isEqual(this.createProperties(nextProps), this.state.stateExtruderProfile)) {
      this.updateProperties()
    }
  }

  updateProperties = () => {
    const newProperties = this.createProperties(this.props)
    if (newProperties) {
      this.state.sendProperties('extruderProfile', newProperties)
      this.setState({ 'currentExtruder': undefined, 'stateExtruderProfile': newProperties })
    }
  }

  createProperties = (props) => {
    if (!_.isUndefined(props.properties.loadedExtruderProfile)) {
      const findId = (extruderProfile) => extruderProfile._id === props.properties.loadedExtruderProfile
      const selectedProfile = head(filter( findId, this.state.allExtruderProfiles || []))
      if(!_.isUndefined(selectedProfile)) {
        const newExtruderProfile = {}
        _.map(this.extruderProperties(), (extruder) => {
          newExtruderProfile[extruder] = { target_pressure: selectedProfile.content.Pressure[extruder] || 0, current_pressure: '--', target_temperature: selectedProfile.content.Temperature[extruder] || 23, current_temperature: '--' }
        })
        return newExtruderProfile
      }
    }
    return undefined
  }

  decreaseHandler = (id, incrementAmount) => {
    if( parseFloat(this.state.extruderProfile[this.state.currentExtruder][id]) > 0) {
      this.state.sendProperties('loadedExtruderProfile', undefined)
      this.changeValue(id, (parseFloat(this.state.extruderProfile[this.state.currentExtruder][id]) - incrementAmount).toFixed(2))
    }
  }

  increaseHandler = (id, incrementAmount) => {
    if ( parseFloat(this.state.extruderProfile[this.state.currentExtruder][id]) < 150 ) {
      this.state.sendProperties('loadedExtruderProfile', undefined)
      this.changeValue(id, (parseFloat(this.state.extruderProfile[this.state.currentExtruder][id]) + incrementAmount).toFixed(2))
    }
  }

  onTextFieldChange = (id, event) => {
    this.state.sendProperties('loadedExtruderProfile', undefined)
    var change = parseFloat(event.target.value)
    if (change > 150) {
      change = 150
    } else if (change < 0 || isNaN(change)) {
      change = 0
    }
    this.changeValue(id, change)
  }

  changeValue = (id, newValue) => {
    const currProperties = this.state.extruderProfile
    currProperties[this.state.currentExtruder][id] = parseFloat(newValue)
    this.state.sendProperties('extruderProfile', currProperties)
  }

  curryOnTextFieldChange = curry(this.onTextFieldChange)

  extruderProperties = () => {
    if (this.state.currentPrinter.content.version === 2) {
      return _.keys(this.state.properties.extruderProfile || {})
    } else {
      const isInBioBot1 = (key) => _.indexOf([ 'A', 'B' ], key) !== -1
      return filter(isInBioBot1, _.keys(this.state.properties.extruderProfile || {}))
    }
  }

  handleClose = () => {
    this.setState({ openProfileName: false })
  }

  handleOpen = () => {
    this.setState({ openProfileName: true })
  }

  handleExtruderProfileName = (event) => {
    this.setState({ profileName: event.target.value, errorText: '' })
  }

  saveProfile = () => {
    if (_.isUndefined(this.state.profileName)) {
      this.setState({ errorText: 'Required' })
      return
    }
    const content = {
      Name: this.state.profileName,
      NozzleGauge: {},
      Pressure: {},
      Temperature: {},
      X: {},
      Y: {},
      Z: {},
    }
    _.map(this.extruderProperties(), (extruder) => {
      const thisExtruder = this.state.properties.extruderProfile[extruder]
      content.NozzleGauge[extruder] = this.state.properties.needleGauge[extruder]
      content.Pressure[extruder] = thisExtruder.target_pressure
      content.Temperature[extruder] = thisExtruder.target_temperature
      content.X[extruder] = 0
      content.Y[extruder] = 0
      content.Z[extruder] = 0
    })
    const submission = {
      templateId: this.state.extruderProfileTemplate._id,
      access: 'PRIVATE',
      content: content,
      parents: [],
      children: [],
    }
    this.state.dispatch(createNewEntry(this.state.token, submission, this.setLoadedProfile))
  }

  setLoadedProfile = (loadedProfile, index, value) => {
    this.handleClose()
    if(_.isUndefined(value)){
      const currAllExtruderProfiles = this.state.allExtruderProfiles
      currAllExtruderProfiles.push(loadedProfile)
      this.setState({ allExtruderProfiles: currAllExtruderProfiles }, () => {
        this.createSelectList()
        this.state.sendProperties('loadedExtruderProfile', loadedProfile._id)
        this.updateProperties()
      })
    } else {
      this.state.sendProperties('loadedExtruderProfile', value)
      this.updateProperties()
    }
  }

  handleTestExtrude = (isOn, event) => {
    if( !_.isUndefined(this.state.currentExtruder) ) {
      this.state.socketManager.testExtrude(this.state.currentExtruder, isOn)
      this.setState({ isOn: isOn })
    }
  }

  curryHandleTestExtruder = curry(this.handleTestExtrude)

  render() {
    const actions = [
      <FlatButton key='cancel'
        label='Cancel'
        secondary={ true }
        onTouchTap={ this.handleClose }
      />,
      <FlatButton key='submit'
        label='Submit'
        primary={ true }
        onTouchTap={ this.saveProfile }
      />,
    ]

    return(
      <Flexbox flexDirection='row' justifyContent='space-around' flexGrow={ 1 }>
        <Flexbox flexBasis='45%' flexDirection='column' justifyContent='center' alignItems='center' flexGrow={ 1 }>
          <Flexbox>
            <SelectField floatingLabelText='Load Profile' value={ this.state.properties.loadedExtruderProfile } onChange={ this.setLoadedProfile }>
              { this.state.allExtruderProfilesItems }
            </SelectField>
          </Flexbox>
          <Flexbox>
            { (this.state.currentPrinter && this.state.currentPrinter.content.version === 2) ?
            <ExtruderSix properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.currentExtruder } rotate={ false } />
            :
            <ExtruderTwo properties={ this.state.properties } extruderSelected={ this.extruderSelected } currSelectedExtruder={ this.state.currentExtruder } rotate={ false } />
            }
          </Flexbox>
          <Flexbox alignItems='center' flexDirection='column'>
            <ReactCSSTransitionGroup transitionName='example' transitionEnterTimeout={ 500 } transitionLeaveTimeout={ 300 }>
            { this.state.currentExtruder &&
              <div key='extruderSettings'>
                <Flexbox justifyContent='center' key='main'>
                  <div style={ { marginBottom: '15px' } }> Extruder <font color='red' size={ 4 }> { this.state.currentExtruder || '--' } </font> Profile </div>
                </Flexbox>
                <Flexbox alignItems='baseline'>
                  <Flexbox flexDirection='column'>
                    <Flexbox alignItems='baseline'>
                      <TextField floatingLabelText='Target Temperature (C)' value={ this.state.extruderProfile[this.state.currentExtruder].target_temperature } style={ style.textFieldStyle } inputStyle={ style.inputStyle } floatingLabelStyle={ style.floatingLabelStyle } onChange={ this.curryOnTextFieldChange('target_temperature') } />
                      <PillBox id='target_temperature' mini={ true } indicator='upDownArrows' decreaseHandler={ this.decreaseHandler } increaseHandler={ this.increaseHandler } incrementAmount={ 0.1 } />
                    </Flexbox>
                    { (this.state.currentPrinter && this.state.currentPrinter.content.version === 2) &&
                      <Flexbox alignItems='baseline'>
                        <TextField floatingLabelText='Target Pressure (psi)' value={ this.state.extruderProfile[this.state.currentExtruder].target_pressure } style={ style.textFieldStyle } inputStyle={ style.inputStyle } floatingLabelStyle={ style.floatingLabelStyle } onChange={ this.curryOnTextFieldChange('target_pressure') } />
                        <PillBox id='target_pressure' mini={ true } indicator='upDownArrows' decreaseHandler={ this.decreaseHandler } increaseHandler={ this.increaseHandler } incrementAmount={ 0.1 } />
                      </Flexbox>
                    }
                  </Flexbox>
                  <Flexbox>
                    <Flexbox alignItems='center'>
                      <RaisedButton onMouseDown={ this.curryHandleTestExtruder(true) } onMouseUp={ this.curryHandleTestExtruder(false) } label={ (this.state.isOn ? 'Stop' : 'Test') +  ' Extrude ' + (this.state.currentExtruder || '--') } primary={ this.state.isOn } />
                    </Flexbox>
                  </Flexbox>
                </Flexbox>
              </div>
            }
            </ReactCSSTransitionGroup>
          </Flexbox>
        </Flexbox>
        <Flexbox flexBasis='55%' flexDirection='column'>
          <font style={ { marginBottom: '7px' } }> Overview </font>
          <Flexbox flexDirection='column' style={ { height: '175px', display: 'flex', padding: '2em', overflowY: 'scroll' } }>
            { this.extruderProperties().map( (entry, index) => (
              <Flexbox key={ index } justifyContent='space-around' style={ { padding: '6px', borderColor: 'gray', borderStyle: 'solid', borderWidth: '0.5px' } }>
                <Flexbox style={ style.flexboxStyle }>
                  <font size={ 6 }> { entry } </font>
                </Flexbox>
                <Flexbox flexDirection='column' alignItems='flex-start' style={ style.flexboxStyle }>
                  <font size={ 4 } color='red'> Target Temperature: { this.state.properties.extruderProfile[entry].target_temperature } C </font>
                  <div> Current Temperature: { this.state.properties.extruderProfile[entry].current_temperature } </div>
                </Flexbox>
                { (this.state.currentPrinter.content.version === 2) &&
                  <Flexbox flexDirection='column' alignItems='flex-start' style={ style.flexboxStyle }>
                    <font size={ 4 } color='teal'> Target Pressure: { this.state.properties.extruderProfile[entry].target_pressure } psi </font>
                    <div> Current Pressure: { this.state.properties.extruderProfile[entry].current_pressure } </div>
                  </Flexbox>
                }
              </Flexbox>
              ))
            }
          </Flexbox>
          <Flexbox justifyContent='center'>
            <RaisedButton label='Save Profile' disabled={ !_.isUndefined(this.state.properties.loadedExtruderProfile) } onTouchTap={ this.handleOpen } />
          </Flexbox>
        </Flexbox>
        <Dialog title='Save Extruder Profile' actions={ actions } modal={ false } open={ this.state.openProfileName } onRequestClose={ this.handleClose }>
          <Flexbox justifyContent='center'>
            <TextField floatingLabelText='Extruder Profile Name' onChange={ this.handleExtruderProfileName } errorText={ this.errorText } />
          </Flexbox>
        </Dialog>
      </Flexbox>
    )
  }
}

export default (Extruder)


