import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import {
	LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, 
	REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE, 
	LOGOUT_SUCCESS,
} from './AuthenticateActions'

import {
	REQUEST_FAILURE, ALL_ENTRIES_REQUEST, ALL_ENTRIES_SUCCESS,
	ALL_TEMPLATES_REQUEST, ALL_TEMPLATES_SUCCESS,
	TEMPLATE_CREATION_REQUEST, TEMPLATE_CREATION_SUCCESS,
	NEW_ENTRY_REQUEST, NEW_ENTRY_SUCCESS,
	UPDATE_ENTRY_REQUEST, UPDATE_ENTRY_SUCCESS,
	GET_ENTRY_DISPLAY_REQUEST, GET_ENTRY_DISPLAY_SUCCESS,
	NEW_ENTRY_TRANSFER_FAILURE, NEW_ENTRY_TRANSFER_REQUEST, NEW_ENTRY_TRANSFER_SUCCESS,
	SLICING_FAILURE, SLICING_REQUEST, SLICING_SUCCESS,
	GET_SLICING_STATUS_FAILURE, GET_SLICING_STATUS_REQUEST, GET_SLICING_STATUS_SUCCESS,
} from './EntryActions'

import {
	DISPLAY_ENTRY_REQUEST, DISPLAY_ENTRY_SUCCESS,
	RESIZE, DATA_FIELD_SET,
	SAVE_PRINT_PROPERTIES, DELETE_PRINT_PROPERTIES,
	OPEN_PROTOCOL_CREATION_WIZARD, CLOSE_PROTOCOL_CREATION_WIZARD,
} from './WebsiteActions'

import { reducer as formReducer } from 'redux-form'

function auth(state = {
	isFetching: false,
	isAuthenticated: false,
}, action) {
	if ((action !== undefined) && (action.type !== undefined)) {
		const fetchAndAuth = {
			isFetching: action.isFetching,
			isAuthenticated: action.isAuthenticated,
			auth_token: null,
			name: null,
		}
	switch (action.type) {
		case LOGIN_REQUEST:
			return Object.assign({}, state, fetchAndAuth)
		case LOGIN_SUCCESS:
			return Object.assign({}, state, fetchAndAuth, {
				id: action.id,
				email: action.email,
				isAdmin: action.isAdmin,
				name: action.name,
				auth_token: action.auth_token,
			})
		case LOGIN_FAILURE:
			return Object.assign({}, state, fetchAndAuth, {
				login_error: action.message,
			})
		case REGISTER_REQUEST:
			return Object.assign({}, state, {
				isFetching: true,
				requesting: action.credentials,
			})
		case REGISTER_SUCCESS:
			return Object.assign({}, state, fetchAndAuth, {
				email: action.email,
				isAdmin: action.access,
				auth_token: action.auth_token,
				name: action.name,
			})
		case REGISTER_FAILURE:
			return Object.assign({}, state, {
				register_error: action.message,
			})
		case LOGOUT_SUCCESS:
			return Object.assign({}, undefined)
		default:
			return state
	}
	} else {
		return state
	}
}

//GET_SLICING_STATUS_FAILURE, GET_SLICING_STATUS_REQUEST, GET_SLICING_STATUS_SUCCESS,

function biobots(state = {
	errorMessage: '',
}, action) {
	if ((action !== undefined) && (action.type !== undefined)) {
		const mainActions = {
			isFetching: action.isFetching,
		}
		switch(action.type) {
		case REQUEST_FAILURE:
			return Object.assign({}, state, mainActions, {
				errorMessage: action.message,
			})
		case ALL_ENTRIES_REQUEST:
			return Object.assign({}, state, mainActions)
		case ALL_ENTRIES_SUCCESS:
			return Object.assign({}, state, mainActions, {
				all_entries: action.all_entries,
			})
		case ALL_TEMPLATES_REQUEST:
			return Object.assign({}, state, mainActions)
		case ALL_TEMPLATES_SUCCESS:
			return Object.assign({}, state, mainActions, {
				all_templates: action.all_templates,
			})
		case TEMPLATE_CREATION_REQUEST:
			return Object.assign({}, state, mainActions)
		case TEMPLATE_CREATION_SUCCESS:
			return Object.assign({}, state, mainActions, {
				new_template: action.new_template,
			})
		case NEW_ENTRY_REQUEST:
			return Object.assign({}, state, mainActions)
		case NEW_ENTRY_SUCCESS:
			return Object.assign({}, state, mainActions, {
				new_entry: action.new_entry,
			})
		case UPDATE_ENTRY_REQUEST:
			return Object.assign({}, state, mainActions)
		case UPDATE_ENTRY_SUCCESS:
			return Object.assign({}, state, mainActions)
		case GET_ENTRY_DISPLAY_REQUEST:
			return Object.assign({}, state, mainActions, {
				curr_display: action.curr_display,
				curr_display_entries: action.curr_display_entries,
			})
		case GET_ENTRY_DISPLAY_SUCCESS:
			return Object.assign({}, state, mainActions, {
				curr_display: action.curr_display,
				curr_display_entries: action.curr_display_entries,
			})
		case NEW_ENTRY_TRANSFER_FAILURE:
			return Object.assign({}, state, mainActions, {
				entryTransferResponse: { message: 'Failed to register device. Contact BioBots support.' },
			})
		case NEW_ENTRY_TRANSFER_REQUEST:
			return Object.assign({}, state, mainActions)
		case NEW_ENTRY_TRANSFER_SUCCESS:
			return Object.assign({}, state, mainActions, {
				entryTransferResponse: action.response,
			})
		case SLICING_FAILURE:
			return Object.assign({}, state, mainActions)
		case SLICING_REQUEST:
			return Object.assign({}, state, mainActions)
		case SLICING_SUCCESS:
			return Object.assign({}, state, mainActions, {
				slicingSuccessResponse: action.response,
			})
		case GET_SLICING_STATUS_FAILURE:
			return Object.assign({}, state, mainActions)
		case GET_SLICING_STATUS_REQUEST:
			return Object.assign({}, state, mainActions)
		case GET_SLICING_STATUS_SUCCESS:
			return Object.assign({}, state, mainActions, {
				getSlicingStatus: action.response,
			})
		case LOGOUT_SUCCESS:
			return Object.assign({}, undefined)
		default:
			return state
		}
	} else {
		return state
	}
}

function website(state = {}, action) {
	if ((action !== undefined) && (action.type !== undefined)) {
		const mainActions = {
			isRendering: action.isRendering,
		}
		switch(action.type) {
			case DISPLAY_ENTRY_REQUEST:
				return Object.assign({}, state, mainActions, {
					entry: action.entry,
				})
			case DISPLAY_ENTRY_SUCCESS:
				return Object.assign({}, state, mainActions)
			case RESIZE:
				return Object.assign({}, state, {
					resize: action.resize,
				})
			case DATA_FIELD_SET:
				return Object.assign({}, state, {
					set: action.set,
				})
			case SAVE_PRINT_PROPERTIES:
				return Object.assign({}, state, {
					properties: action.properties,
				})
			case DELETE_PRINT_PROPERTIES:
				return Object.assign({}, state, {
					properties: {},
				})
			case OPEN_PROTOCOL_CREATION_WIZARD:
				return Object.assign({}, state, {
					openProtocolCreationWizard: true,
					protocolCreationTemplate: action.protocolCreationTemplate,
					all_templates: action.all_templates,
				})
			case CLOSE_PROTOCOL_CREATION_WIZARD:
				return Object.assign({}, state, {
					openProtocolCreationWizard: false,
					protocolCreationTemplate: undefined,
					all_templates: undefined,
				})
			case LOGOUT_SUCCESS:
				return Object.assign({}, undefined)
			default:
				return state
		}
	}
	return state
}

const biobotsApp = combineReducers({
	auth,
	biobots,
	website,
	routing: routerReducer,
	form: formReducer,
})

export default biobotsApp
