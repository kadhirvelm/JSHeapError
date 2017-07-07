import React from 'react'
import { connect } from 'react-redux'
import Home from './Home'
import Help from './Help'
import Feed from './Feed'
import AdminConsole from './AdminConsole'

import Flexbox from 'flexbox-react'

import { svgIcon } from './Global/Display/icons'

import { mapStateToProps } from '../../State/StateMethods'

import { logoutUser } from '../../State/AuthenticateActions'
import { Tabs, Tab } from 'material-ui/Tabs'

export class Private extends React.Component{

  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst(props){
    return({
      dispatch: props.appProps.dispatch,
      auth_token: props.appProps.auth.auth_token,
      isAdmin: props.appProps.auth.isAdmin,
      name: props.appProps.auth.name.first,
      userID: props.appProps.auth.id,
      appProps: props.appProps,
      all_templates: props.appProps.biobots.all_templates,
      all_entries: props.appProps.biobots.all_entries,
      new_template: props.appProps.biobots.new_template,
      tabValue: this.state ? this.state.tabValue : 0,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  componentWillMount() {
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
    this.state.dispatch(logoutUser())
  }

  updateTabValue = (activeTab) => {
    this.setState({ tabValue: activeTab.props.value })
  }

  forceTabSelection = (tabValue) => {
    this.setState({ tabValue: tabValue })
  }

  render() {
    return(
      <Tabs value={ this.state.tabValue }>
        <Tab label='Home' value={ 0 } onActive={ this.updateTabValue }>
          <Home appProps={ this.state.appProps } />
        </Tab>
        <Tab label='Build With Life' value={ 1 } onActive={ this.updateTabValue }>
          <Feed all_templates={ this.state.all_templates } all_entries={ this.state.all_entries } token={ this.state.auth_token } dispatch={ this.state.dispatch } forceTabSelection={ this.forceTabSelection } />
        </Tab>
        <Tab label='Graph' value={ 2 } onActive={ this.updateTabValue }>
          <Help />
        </Tab>
        { this.state.isAdmin && 
          <Tab label='Admin Panel' value={ 3 } onActive={ this.updateTabValue }>
            <AdminConsole all_templates={ this.state.all_templates } all_entries={ this.state.all_entries } token={ this.state.auth_token } new_template={ this.state.new_template } dispatch={ this.state.dispatch } />
          </Tab>
        }
        <Tab value={ 4 } label={ (<Flexbox justifyContent='center' alignItems='center'> { this.state.name } { svgIcon('logout') } </Flexbox>) } onClick={ this.handleLogout } style={ { backgroundColor: '#BF303A' } } />
      </Tabs>
    )
  }

}

export default connect(mapStateToProps)(Private)
