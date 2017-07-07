import React from 'react'

import Flexbox from 'flexbox-react'

import RaisedButton from 'material-ui/RaisedButton'
import ProtocolCreationFields from './ProtocolCreationFields'

import { adjustPrintProperties } from '../../../../../State/WebsiteActions'
import { prop } from 'ramda'

export class ProtocolCreationWizard extends React.Component{

	constructor(props){
		super(props)
		this.state= Object.assign({}, this.propsConst(props))
	}

	propsConst = (props) => {
		return({
			protocol: props.protocol,
			cancel: props.cancel,
			properties: this.state ? this.state.properties : props.properties,
			dispatch: props.dispatch,
			token: props.token,
			allTemplates: props.allTemplates,
			awsHandler: props.awsHandler,
			handleCreation: props.handleCreation,
			email: props.email,
			socketManager: props.socketManager,
		})
	}

	componentDidMount(){
		this.state.socketManager.reconnectSocket(this.state.email)
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	setProperties = (key, value) => {
		var currProperties = this.state.properties
		currProperties[key] = value
		this.setState({ properties: currProperties })
		this.state.dispatch(adjustPrintProperties(true, currProperties))
	}

	componentWillUnmount(){
		this.state.socketManager.disconnectFromPrinter()
	}

	render() {
		return(
			<Flexbox flexDirection='column' style={ { marginTop: '8px' } }>
			{ this.state.protocol && 
				<div>
					<Flexbox flexDirection='row'>
						<Flexbox flexDirection='column' flexShrink={ 1 }>
							<Flexbox justifyContent='flex-start' flexShrink={ 1 }>
								<RaisedButton
									label='Cancel Print'
									onClick={ this.state.cancel }
									/>
							</Flexbox>
						</Flexbox>
						<Flexbox flexDirection='column'flexGrow={ 1 }>
							<Flexbox flexGrow={ 1 } justifyContent='center'>
								<h2> { this.state.protocol.name } </h2>
							</Flexbox>
						</Flexbox>
					</Flexbox>
					<Flexbox flexDirection='column'>
						<ProtocolCreationFields fields={ prop('Entries', this.state.protocol.content) } sendProperties={ this.setProperties } properties={ this.state.properties }
						dispatch={ this.state.dispatch } token={ this.state.token } allTemplates={ this.state.allTemplates } awsHandler={ this.state.awsHandler } 
						handleCreation={ this.state.handleCreation } socketManager={ this.state.socketManager } email={ this.state.email } />
					</Flexbox>
				</div>
			}
			</Flexbox>
		)
   }
}

export default ProtocolCreationWizard

