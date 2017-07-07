import React from 'react'
import { preRetrievePrintersRequest } from '../../../../../../State/PrinterActions'

import { CardTitle } from 'material-ui/Card'
import { List } from 'material-ui/List'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Dialog from 'material-ui/Dialog'

import BIOBOT_2_LOGO from  '../../../../../../Files/Placeholders/biobot2.jpg'
import BIOBOT_1_LOGO from  '../../../../../../Files/Placeholders/biobot1.jpg'

import Flexbox from 'flexbox-react'

import { svgIcon } from '../../../Display/icons'
import { curry } from 'ramda'

import { _ } from 'underscore'

const CardTitleContentStyle = {
    fontSize: '1.5em',
}

const CardTitleStyle = {
   backgroundColor: '#E53935',
}

const ListStyle = {
  width: '100%',
}

var resin = require('resin-sdk/build/resin-browser.min.js')({
    apiUrl: 'https://api.resin.io/',
})

const FULLY_CONNECTED = 'Opera'

export class PrinterList extends React.Component{

    constructor(props) {
      super(props)
      this.state = Object.assign({}, this.propsConst(props), {
        openSettings: false,
        openTempPrinterStatus: false,
        email: props.email,
      })
    }

    propsConst(props){
      return({
        dispatch: props.dispatch,
        auth_token: props.auth_token,
        properties: props.properties,
        sendProperties: props.sendProperties,
        printerID: props.printerID,
        printerList: this.state ? this.state.printerList : [],
        socketManager: props.socketManager,
      })
    }

    componentWillMount(){
      this.state.socketManager.reconnectSocket(this.email, this.handleSocketManagerCallback)
      const setPrinterList = (value) => {
        const finalValues = (process.env.REACT_APP_DEBUG === 'true') ? value : _.filter(value, function(printer){ return printer.access === 'PRIVATE' })
        this.setState({ printerList: finalValues })
      }
      this.state.dispatch(preRetrievePrintersRequest(this.state.token, { templateId: this.state.printerID }, setPrinterList))
    }

    componentDidMount(){
      this.state.socketManager.updateCallback(this.handleSocketManagerCallback)
    }

    handleSocketManagerCallback = (key, message) => {
      console.log('Printer List', key, message)
      if (key === 'UPDATE' && _.isObject(message.response) && _.isObject(message.response.payload)) {
        const printerStatus = message.response.payload.state && message.response.payload.state.text
        this.state.sendProperties('currentPrinterStatus', printerStatus)
      }
    }

    componentWillReceiveProps(nextProps) {
      this.setState(this.propsConst(nextProps))
    }

    renderLogo(model) {
      switch (model) {
        case 'BioBot-1': return BIOBOT_1_LOGO
        case 'BioBot-2': return BIOBOT_2_LOGO
        case 'BioBot 1': return BIOBOT_1_LOGO
        case 'BioBot 2': return BIOBOT_2_LOGO
        default: break
      }
    }

    setCurrentPrinters = (printer, event) => {
      if (!_.isUndefined(this.state.properties.currentPrinter) && this.state.properties.currentPrinter._id === printer._id && _.isString(this.state.properties.currentPrinterStatus) && this.state.properties.currentPrinterStatus.substring(0, 5) === FULLY_CONNECTED){
        this.disconnectFromPrinter(printer)
      } else if (_.isUndefined(this.state.properties.currentPrinter) || _.isEmpty(this.state.properties.currentPrinter)) {
        this.connectToPrinter(printer)
      } else {
        this.disconnectFromPrinter(this.state.properties.currentPrinter)
        this.connectToPrinter(printer)
      }
    }

    currySetCurrentPrinters = curry(this.setCurrentPrinters)

    disconnectFromPrinter = (printer) => {
      this.state.sendProperties('currentPrinter', {})
      this.state.socketManager.connectToPrinter('PRINTER', printer.content.serialNumber, 'disconnect')
    }

    connectToPrinter = (printer) => {
      this.state.socketManager.connectToPrinter('PRINTER', printer.content.serialNumber)
      this.state.sendProperties('currentPrinter', printer)
      if (process.env.REACT_APP_DEBUG === 'true') {
        this.state.sendProperties('currentPrinterStatus', FULLY_CONNECTED)
      }
    }

    setPrinterIcon = () => {
      switch(this.state.properties.currentPrinterStatus && this.state.properties.currentPrinterStatus.substring(0, 5)){
        case FULLY_CONNECTED:
          return svgIcon( 'checkMarkGreen' )
        case 'Detec':
          return this.refreshIndicator()
        case 'Openi':
          return this.refreshIndicator()
        case 'Conne':
          return this.refreshIndicator()
        case 'Error':
          return svgIcon('redCancel')
        case 'Offli':
          return svgIcon('redCancel')
        default:
          return
      }
    }

    refreshIndicator = () => <RefreshIndicator style={ { position: 'relative' } } size={ 30 } left={ 0 } top={ 0 } status='loading' />

    handleTouchTap = (printer, event) => {
      event.preventDefault()
      this.setState({ tempSelectedPrinter: printer, openSettings: true, anchorEl: event.currentTarget })
    }

    curryHandleTouchTap = curry(this.handleTouchTap)

    handleRequestClose = () => {
      this.setState({ openSettings: false })
    }

    handleMenuSelection = (event, value) => {
      const handleSecondRequest = this.handleSecondRequest
      switch(value){
        case 'Restart':
          resin.models.device.restartApplication(this.state.tempSelectedPrinter['content']['serialNumber']).then( function(errors) {
            handleSecondRequest(errors)
          })
          break
        case 'Status':
          Promise.all([ resin.models.device.get(this.state.tempSelectedPrinter['content']['serialNumber']), resin.models.device.isOnline(this.state.tempSelectedPrinter['content']['serialNumber']) ]).then(
          function(returnedValues) {
            if (returnedValues[1]) {
              handleSecondRequest(returnedValues[0])
            } else {
              handleSecondRequest({ name: 'Offline' })
            }
          }).catch( function(error) {
            handleSecondRequest(error)
          })
          break
        default:
          break
      }
      this.handleRequestClose()
    }

    handleSecondRequest = (device) => {
      this.setState({ openTempPrinterStatus: true, tempSelectedPrinterStatus: device })
    }
   
    printList() {
      return(
        <List style={ ListStyle }>
          { this.state.printerList.map(function(printer){
            return (
              <Flexbox alignItems='center' key={ printer['_id'] } style={ { marginBottom: '15px', padding: '10px' } }>
                <Flexbox flexDirection='column' onTouchTap={ this.currySetCurrentPrinters(printer) }>
                  <Avatar src={ this.renderLogo(printer.content.model) } />
                </Flexbox>
                <Flexbox flexDirection='column' alignItems='flex-start' style={ { marginLeft: '15px' } } onTouchTap={ this.currySetCurrentPrinters(printer) }>
                  <font size={ 3.5 }> { printer.content.name } </font>
                  <font size={ 1 } color='grey'> { printer['content']['serialNumber']  } </font>
                </Flexbox>
                <Flexbox flexDirection='column' alignItems='flex-end' style={ { marginLeft: '15px' } }>
                  { printer._id === ( this.state.properties.currentPrinter ? this.state.properties.currentPrinter._id : '' ) ? 
                    <Flexbox> { this.setPrinterIcon() } </Flexbox>
                    :
                    <IconButton tooltip='Options' style={ { width: 35, height: 35, padding: 8 } } iconStyle={ { width: 20, height: 20 } } onTouchTap={ this.curryHandleTouchTap(printer) }>
                      { svgIcon('rightSettings') }
                    </IconButton>
                  }
                </Flexbox>
              </Flexbox>
            )
          }, this) }
        </List>
      )
    }

    handleTempPrinterStatusClose = () => {
      this.setState({ openTempPrinterStatus: false })
    }

    createCurrentPrinterStatus = () => {
      if(this.state.tempSelectedPrinterStatus) {
        switch(this.state.tempSelectedPrinterStatus.name) {
          case 'Offline':
            return (<div> Your printer: { this.state.tempSelectedPrinter.content.name } seems to be offline. Contact BioBots if you think this is an error. 
              If you just restarted your device, wait until the green light is off to check the device status again. </div>)
          case 'ResinDeviceNotFound':
            return (<div> Your printer: { this.state.tempSelectedPrinter.content.name } is not registered with us. Contact BioBots if there is an error. { process.env.REACT_APP_DEBUG && 'Also note that you are currently in debug mode' }</div> )
          default:
            return (
              <Flexbox flexDirection='row' justifyContent='flex-start' alignItems='baseline'>
                <Flexbox flexDirection='column' style={ { marginRight: '20px' } }>
                  <div> Name </div>
                  <div> Status </div>
                  <div> UUID </div>
                  <div> Device Type </div>
                  <div> Downloading Progress </div>
                  <div> Is Online </div>
                  <div> Connected to VPN </div>
                  <div> Location </div>
                  <div> OS Version </div>
                  <div> Provisioning Progress </div>
                  <div> Commit ID </div>
                  <div> Supervisor Version </div> 
                </Flexbox>
                <Flexbox flexDirection='column'>
                  <div> { this.state.tempSelectedPrinterStatus.name } - { this.state.tempSelectedPrinterStatus.id } </div>
                  <div> { this.state.tempSelectedPrinterStatus.status } </div>
                  <div> { this.state.tempSelectedPrinterStatus.uuid } </div>
                  <div> { this.state.tempSelectedPrinterStatus.device_type } </div>
                  <div> { this.state.tempSelectedPrinterStatus.download_progress || 'Completed' } </div>
                  <div> { this.state.tempSelectedPrinterStatus.is_online.toString() } </div>
                  <div> { this.state.tempSelectedPrinterStatus.is_connected_to_vpn.toString() } </div>
                  <div> { this.state.tempSelectedPrinterStatus.location } </div>
                  <div> { this.state.tempSelectedPrinterStatus.os_version } </div>
                  <div> { this.state.tempSelectedPrinterStatus.provisioning_progress || 'Completed' } </div>
                  <div> { this.state.tempSelectedPrinterStatus.commit.substring(0, 7) } </div>
                  <div> { this.state.tempSelectedPrinterStatus.supervisor_version } </div>
                </Flexbox>
              </Flexbox>
            )
        }
      } 
    }

    render() {
      const actions = [
        <RaisedButton key='return' label='Return' primary={ true } onTouchTap={ this.handleTempPrinterStatusClose } />,
      ]
      return(
        <Flexbox flexGrow={ 1 } flexBasis='max-content' flexDirection='column' style={ { background: 'white', zDepth: 2, maxWidth: '400px' } }>
          <CardTitle  
          style={ CardTitleStyle } 
          title='Available Printers' 
          titleColor='white' 
          titleStyle={ CardTitleContentStyle } />
          { this.printList() }
          <Popover
            open={ this.state.openSettings }
            anchorEl={ this.state.anchorEl }
            anchorOrigin={ { horizontal: 'right', vertical: 'center' } }
            targetOrigin={ { horizontal: 'left', vertical: 'center' } }
            onRequestClose={ this.handleRequestClose }
            animation={ PopoverAnimationVertical }>
            <Menu onChange={ this.handleMenuSelection }>
              <MenuItem value='Status' primaryText='Status' rightIcon={ svgIcon('status') } />
              <MenuItem value='Restart' primaryText='Restart' rightIcon={ svgIcon('power') } />
            </Menu>
          </Popover>
          <Dialog title='Printer Status' modal={ false } open={ this.state.openTempPrinterStatus } onRequestClose={ this.handleTempPrinterStatusClose }
          actions={ actions }>
            { this.createCurrentPrinterStatus() }
          </Dialog>
        </Flexbox>
      )
    }
}

export default (PrinterList)
    