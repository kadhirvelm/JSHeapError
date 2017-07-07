export const DISPLAY_ENTRY_REQUEST = 'DISPLAY_ENTRY_REQUEST'
export const DISPLAY_ENTRY_SUCCESS = 'DISPLAY_ENTRY_SUCCESS'

function displayEntryRequest(entry) {
	return {
		type: DISPLAY_ENTRY_REQUEST,
		isRendering: true,
		entry: entry,
	}
}

function displayEntrySuccess() {
	return {
		type: DISPLAY_ENTRY_SUCCESS,
		isRendering: false,
	}
}

export function displayEntry(entry) {
	return dispatch => {
		dispatch(displayEntryRequest(entry))
		dispatch(displayEntrySuccess())
	}
}

export const DATA_FIELD_SET = 'DATA_FIELD_SET'

function dataSet(data){
	return{
		type: DATA_FIELD_SET,
		set: data,
	}
}

export function dataFieldSet(data){
	return dispatch => {
		dispatch(dataSet(data))
	}
}

export const RESIZE = 'RESIZE'

function resizeRequest(){
	return {
		type: RESIZE,
		resize: true,
	}
}

export function resize(){
	return dispatch => {
		dispatch(resizeRequest())
	}
}

export const SAVE_PRINT_PROPERTIES = 'SAVE_PRINT_PROPERTIES'
export const DELETE_PRINT_PROPERTIES = 'DELETE_PRINT_PROPERTIES'

function savePrintProperties(properties) {
	return {
		type: SAVE_PRINT_PROPERTIES,
		properties,
	}
}

function deletePrintProperties() {
	return {
		type: DELETE_PRINT_PROPERTIES,
	}
}

export function adjustPrintProperties(isSave, properties) {
	return dispatch => {
		dispatch( isSave ? savePrintProperties(properties) : deletePrintProperties())
	}
}

export const OPEN_PROTOCOL_CREATION_WIZARD = 'OPEN_PROTOCOL_CREATION_WIZARD'
export const CLOSE_PROTOCOL_CREATION_WIZARD = 'CLOSE_PROTOCOL_CREATION_WIZARD'

function openProtocolCreationWizard(protocolCreationTemplate, all_templates) {
	return {
		type: OPEN_PROTOCOL_CREATION_WIZARD,
		protocolCreationTemplate: protocolCreationTemplate,
		all_templates: all_templates,
	}
}

function closeProtocolCreationWizard() {
	return {
		type: CLOSE_PROTOCOL_CREATION_WIZARD,
	}
}

export function changeProtocolCreationWizard(isOpen, protocolCreationTemplate, all_templates) {
	return dispatch => {
		dispatch( isOpen ? openProtocolCreationWizard(protocolCreationTemplate, all_templates) : closeProtocolCreationWizard())
	}
}
