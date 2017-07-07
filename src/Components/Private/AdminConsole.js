import React from 'react'
import './Private.css'

import { createTemplate, createNewEntry, updateTemplate, updateEntry, getAllTemplates, getAllEntries } from '../../State/EntryActions'
import { allTemplates } from './Global/Creation/TemplateCreations/TemplateCreation'
import { createPrintProtocolEntries, instantiatePrintProtocol } from './Global/Creation/TemplateCreations/ProtocolCreation'
import createPrinters from './Global/Creation/TemplateCreations/PrinterCreation'

import Flexbox from 'flexbox-react'
import RaisedButton from 'material-ui/RaisedButton'

import { map, prop, filter, head, curry, forEach } from 'ramda'

const style = {
  margin: 12,
}

export class AdminConsole extends React.Component{

	selectTemplate = (templateName, template) => template.name === templateName
  currSelectTemplate = curry(this.selectTemplate)
	returnID = (array) => prop('_id', head(array))
	returnIDTemplate = (all_templates, templateName) => this.returnID(filter(this.currSelectTemplate(templateName), all_templates))
	returnTemplate = (all_templates, templateName) => head(filter(this.currSelectTemplate(templateName), all_templates))

	constructor(props) {
		super(props)
		this.state = {
			token: this.props.token,
			curr_templates: {},
			dispatch: this.props.dispatch,
			returnTemplate: this.returnTemplate,
		}
	}

	componentWillMount() {
		this.updateStateTemplatesAndProtocols()
	}

	updateStateTemplatesAndProtocols = () => {
		var all_templates

		const getPublicProtocols = (entry) => entry.access === 'DEFAULT' && entry.templateId === this.returnIDTemplate(all_templates, 'Protocol')
		const getAllPrinters = (entry) => entry.access === 'DEFAULT' && entry.templateId === this.returnIDTemplate(all_templates, 'Printer')
		const setAllEntries = (entries) => this.setState({ all_protocols: filter(getPublicProtocols, entries), all_printers: filter(getAllPrinters, entries),  all_templates: all_templates })

		const setAllTemplates = (templates) => {
			all_templates = templates
			this.state.dispatch(getAllEntries(this.state.token, {}, setAllEntries))
		}
		this.state.dispatch(getAllTemplates(this.state.token, {}, setAllTemplates))
	}

	handlePrints = () => {
		console.log('Templates', this.state.all_templates)
		console.log('Protocols', this.state.all_protocols)
	}

	handleTemplatesCreation = () => this.handleTemplate(allTemplates)

	handleTemplate = (allTemplatesArray) => {
		if (allTemplatesArray.length === 0 ) {
			this.updateStateTemplatesAndProtocols()
			return
		}
		
		const templatePromise = this.createTemplates(allTemplatesArray.shift(), this.state)
		templatePromise.then( (values) => {
			console.log(map((template) => template.template, values))
			const removeId = (template) => prop('_id', template.template)
			allTemplatesArray[0] = allTemplatesArray[0]( ...map(removeId, values) )
			this.handleTemplate(allTemplatesArray)
		})
	}

	createTemplates = (templateArray, state) => { 
		return new Promise( function(resolve) {
			const templates = []
			const addTemplates = (template) => {
				templates.push(template)
				if ( templates.length === templateArray.length) {
					resolve(templates)
				}
			}
			for (let template in templateArray) {
				if (templateArray.hasOwnProperty(template)) {
					state.dispatch(
						createTemplate(
							state.token, 
							templateArray[template],
							addTemplates
							)
					)
				}
			}
		})
	}

	updateTemplates = () => this.handleTemplateUpdates(allTemplates)

	handleTemplateUpdates = (allTemplatesArray) => {
		if (allTemplatesArray.length === 0 ) {
			return
		}

		const templatePromise = this.updateTemplatesPromises(allTemplatesArray.shift(), this.state)

		templatePromise.then( (values) => {
			console.log(values)
			const removeId = (template) => prop('_id', template)
			allTemplatesArray[0] = allTemplatesArray[0]( ...map(removeId, values) )
			this.handleTemplateUpdates(allTemplatesArray)
		})
	}

	updateTemplatesPromises = (templateArray, state) => { 
		return new Promise( function(resolve) {
			const templates = []
			const addTemplates = (template) => {
				templates.push(template)
				if ( templates.length === templateArray.length) {
					resolve(templates)
				}
			}
			const addNewTemplate = (template) => {
				templates.push(template.template)
				if ( templates.length === templateArray.length) {
					resolve(templates)
				}
			}

			for (let template in templateArray) {
				if (templateArray.hasOwnProperty(template)) {
					template = templateArray[template]

					const originalTemplate = state.returnTemplate(state.all_templates, template.name)

					console.log(originalTemplate, state.all_templates, template.name)

					if (originalTemplate) {
						originalTemplate.content = template.content
						originalTemplate.createdBy = template.createdBy
						originalTemplate.description = template.description
						originalTemplate.icon = template.icon

						state.dispatch(
							updateTemplate(
								state.token, 
								originalTemplate,
								addTemplates
								)
						)
					} else {
						console.log('New template', template)
						state.dispatch(
							createTemplate(
								state.token, 
								template,
								addNewTemplate
								)
						)
					}
				}
			}
		})
	}

	handleProtocols = () => {
		const printProtocol = (entry) => console.log(entry)
		const createProtocol = (entry) => this.state.dispatch(createNewEntry(this.state.token, entry, printProtocol ))
		const getProtocol = (templates) => instantiatePrintProtocol(templates, this.state.dispatch, this.state.token, createProtocol)
		this.state.dispatch(getAllTemplates(this.state.token, {}, getProtocol))
	}

	handleUpdateProtocols = () => {
		const printProtocol = (updatedProtocol) => console.log('Update protocol', updatedProtocol)
		const updateProtocol = (entries) => { 
			const stlPrintProtocol = head(filter( (protocol) => protocol.content.Title === 'STL Print', this.state.all_protocols))
			stlPrintProtocol.content.Entries = entries
			this.state.dispatch(updateEntry(this.state.token, stlPrintProtocol, printProtocol))
		}
		createPrintProtocolEntries(this.props.all_templates, this.state.dispatch, this.state.token, updateProtocol)
	}

	handlePrinterCreation = () => {
		const printPrinter = (entry) => console.log(entry)
		const createPrinter = (entry) => this.state.dispatch(createNewEntry(this.state.token, entry, printPrinter ))
		const loopThroughPrinters = (entries) => forEach(createPrinter, entries)
		const getProtocol = (templates) =>  createPrinters(templates, this.state.dispatch, this.state.token, loopThroughPrinters)
		this.state.dispatch(getAllTemplates(this.state.token, {}, getProtocol))
	}

	render() {
		return(
			<Flexbox id='AdminConsole' flexDirection='row' justifyContent='center'>
				<Flexbox flexDirection='column' justifyContent='center'>
					<Flexbox justifyContent='center'>
						<RaisedButton id='Print' style={ style } label='Print' onClick={ this.handlePrints } /> 
					</Flexbox>
					{ this.state.all_templates &&
						<div>
							<Flexbox justifyContent='center'>
								<RaisedButton id='Create' style={ style } primary={ true } onClick={ this.handleTemplatesCreation } label='Template Creation' disabled={ this.state.all_templates.length !== 0 } />
								<RaisedButton id='Update Templates' style={ style } secondary={ true } onClick={ this.updateTemplates } label='Update Templates' disabled={ this.state.all_templates.length === 0 } />
							</Flexbox>
							<Flexbox justifyContent='center'>
								<RaisedButton id='Protocols' style={ style } primary={ true } onClick={ this.handleProtocols } label='Create Protocols' disabled={ this.state.all_protocols.length !== 0 } />
								<RaisedButton id='Update Protocols' style={ style } secondary={ true } onClick={ this.handleUpdateProtocols } label='Update Protocols' disabled={ this.state.all_protocols.length === 0 } />
							</Flexbox>
							{ process.env.REACT_APP_DEBUG === 'true' &&
								<Flexbox justifyContent='center'>
									<RaisedButton id='Printers' style={ style } primary={ true } onClick={ this.handlePrinterCreation } label='Instantiate Printers' disabled={ this.state.all_printers.length !== 0 } />
								</Flexbox>
							}
						</div>
					}
					<Flexbox justifyContent='center'>
						Ignore this tab - only admins can access it.
					</Flexbox>
				</Flexbox>
			</Flexbox>
		)
	}

}

export default AdminConsole
