import React from 'react'
import Flexbox from 'flexbox-react'

import { Card, CardTitle, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import IconButton from 'material-ui/IconButton'
import ArrowUp from 'material-ui/svg-icons/navigation/arrow-upward'
import ArrowLeft from 'material-ui/svg-icons/navigation/arrow-back'
import ArrowRight from 'material-ui/svg-icons/navigation/arrow-forward'
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-downward'
import ActionHome from 'material-ui/svg-icons/action/home'

const CardTitleContentStyle = {
    fontSize: '1.5em',
}

const CardTitleStyle = {
    backgroundColor: '#E53935',
}

const headerStyle = {
  fontSize: '20px',
  flexBasis: '33%',
}

const valueStyle = {
  fontSize: '30px',
  flexBasis: '33%',
}

import { curry } from 'ramda'

//Component
export class JogPanel extends React.Component{

    constructor(props) {
      super(props)
      this.state = Object.assign({}, this.propsConst(props))
    }

    propsConst(props){
      return({
        token: props.token,
        dispatch: props.dispatch,
        socketManager: props.socketManager,
      })
    }

    componentWillReceiveProps(nextProps) {
      this.setState(this.propsConst(nextProps))
    }

    sendCommand = (command, event) => {
      console.log(command)
    }

    currySendCommand = curry(this.sendCommand)

    render() {
      return(
        <Card style={ { width: '350px' } }>
          <CardTitle  
            style={ CardTitleStyle } 
            title="JogPanel" 
            titleColor="white" 
            titleStyle={ CardTitleContentStyle } />
          <CardText>
            <Flexbox flexDirection="row" >
              <Flexbox style={ headerStyle }  justifyContent="center" flexGrow={ 1 }  >
                X Axis
              </Flexbox>
              <Flexbox  style={ headerStyle } justifyContent="center" flexGrow={ 1 } >
                Y Axis
              </Flexbox>
              <Flexbox style={ headerStyle } justifyContent="center" flexGrow={ 1 }  >
                Z Axis
              </Flexbox>
             </Flexbox>
            <Flexbox flexDirection="row" >
              <Flexbox style={ valueStyle }  justifyContent="center" flexGrow={ 1 }  >
                999.99
              </Flexbox>
              <Flexbox  style={ valueStyle } justifyContent="center" flexGrow={ 1 } >
                999.99
              </Flexbox>
              <Flexbox style={ valueStyle } justifyContent="center" flexGrow={ 1 }  >
                999.99
              </Flexbox>
            </Flexbox>
            <Flexbox flexDirection="row" >
              <Flexbox  justifyContent="center" flexGrow={ 1 }  >
                mm
              </Flexbox>
              <Flexbox justifyContent="center" flexGrow={ 1 } >
                mm
              </Flexbox>
              <Flexbox  justifyContent="center" flexGrow={ 1 }  >
                mm
              </Flexbox>
            </Flexbox>
            <br />
            <Divider />
            <Flexbox flexDirection="row" >
              <Flexbox style={ {   flexBasis: '66%' } } justifyContent="center" flexGrow={ 1 }  >
                  <IconButton  >
                  <ArrowUp onTouchTap={ this.currySendCommand('y up') } />
                </IconButton>
              </Flexbox>
              <Flexbox style={ {   flexBasis: '33%' } } justifyContent="center" flexGrow={ 1 }  >
                <IconButton  >
                  <ArrowUp onTouchTap={ this.currySendCommand('z up') } />
                </IconButton>
              </Flexbox>
            </Flexbox>
            <Flexbox flexDirection="row" >
              <Flexbox style={ { flexBasis: '22%' } } justifyContent="flex-end" flexGrow={ 1 }  >
                  <IconButton  >
                  <ArrowLeft onTouchTap={ this.currySendCommand('x left') } />
                </IconButton>
              </Flexbox>
                <Flexbox style={ { flexBasis: '22%' } } justifyContent="center" flexGrow={ 1 }  >
                  <IconButton  >
                  <ActionHome onTouchTap={ this.currySendCommand('xy home') } />
                </IconButton>
              </Flexbox>
                <Flexbox style={ { flexBasis: '22%' } } justifyContent="flex-start" flexGrow={ 1 }  >
                  <IconButton  >
                  <ArrowRight onTouchTap={ this.currySendCommand('x right') } />
                </IconButton>
              </Flexbox>
              <Flexbox style={ { flexBasis: '33%' } } justifyContent="center" flexGrow={ 1 }  >
                <IconButton  >
                  <ActionHome onTouchTap={ this.currySendCommand('z home') } />
                </IconButton>
              </Flexbox>
            </Flexbox>

            <Flexbox flexDirection="row" >
              <Flexbox style={ {  flexBasis: '66%' } } justifyContent="center" flexGrow={ 1 }  >
                  <IconButton  >
                  <ArrowDown onTouchTap={ this.currySendCommand('y down') } />
                </IconButton>
              </Flexbox>
              <Flexbox style={ {  flexBasis: '33%' } } justifyContent="center" flexGrow={ 1 }  >
                <IconButton  >
                  <ArrowDown onTouchTap={ this.currySendCommand('z down') } />
                </IconButton>
              </Flexbox>
            </Flexbox>
            <Divider />
            <br />
            <Flexbox flexDirection="row" >
              <Flexbox  flexGrow={ 1 } >
                <RadioButtonGroup  
                style={ { display: 'flex' } } 
                name="jogPanelMovement" 
                defaultSelected={ 1 }>
                  <RadioButton
                    value={ 0.1 }
                    label="0.1"
                    style={ {  width: 'auto' } } />
                  <RadioButton
                    value={ 1 }
                    label="1"
                    style={ {  width: 'auto' } } />
                  <RadioButton
                    value={ 10 }
                    label="10"
                    style={ {  width: 'auto' } } />
                  <RadioButton
                    value={ 100 }
                    label="100"
                    style={ { width: 'auto' } } />
                </RadioButtonGroup>
              </Flexbox>
            </Flexbox>
          </CardText>
        </Card>)
    }
}

export default JogPanel
