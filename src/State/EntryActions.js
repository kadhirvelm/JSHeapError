import $ from 'jquery'
import { logoutUser } from './AuthenticateActions'
import { contains, keys, head, prop, values } from 'ramda'

export const REQUEST_FAILURE = 'REQUEST_FAILURE'

function requestFailed(message) {
	if (message === 'Unauthorized') {
		return dispatch => {
			dispatch(logoutUser())
		}
	}
	return {
		type: REQUEST_FAILURE,
		isFetching: false,
		message,
	}
}

/** Entry Related Actions */

export const ALL_ENTRIES_REQUEST = 'ALL_ENTRIES_REQUEST'
export const ALL_ENTRIES_SUCCESS = 'ALL_ENTRIES_SUCCESS'

function requestEntries() {
	return {
		type: ALL_ENTRIES_REQUEST,
		isFetching: true,
	}
}

function receiveEntries(entries) {
	return {
		type: ALL_ENTRIES_SUCCESS,
		isFetching: false,
		all_entries: entries,
	}
}

export function getAllEntries(token, predicate, callback) {
	
	const filters ={}
	predicate['sortBy'] = head(keys(predicate)) 
	filters['filters'] = predicate

	return dispatch => {
		dispatch(requestEntries())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(receiveEntries(data))
				if (callback) {
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const NEW_ENTRY_REQUEST = 'NEW_ENTRY_REQUEST'
export const NEW_ENTRY_SUCCESS = 'NEW_ENTRY_SUCCESS'

function newEntryRequest() {
	return {
		type: NEW_ENTRY_REQUEST,
		isFetching: true,
	}
}

function newEntrySuccess(data) {
	return {
		type: NEW_ENTRY_SUCCESS,
		isFetching: false,
		new_entry: data,
	}
}

export function createNewEntry(token, data, callback) {
	return dispatch => {
		dispatch(newEntryRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/new',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(data),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(newEntrySuccess(data.entry))
				if (callback) {
					callback(data.entry)
				}
			},
			error: function(xhr, status, err) {
				console.log(err)
				dispatch(requestFailed(err))
			},
		})
	}
}

export const UPDATE_ENTRY_REQUEST = 'UPDATE_ENTRY_REQUEST'
export const UPDATE_ENTRY_SUCCESS = 'UPDATE_ENTRY_SUCCESS'

function updateEntryRequest() {
	return {
		type: UPDATE_ENTRY_REQUEST,
		isFetching: true,
	}
}

function updateEntrySuccess() {
	return {
		type: UPDATE_ENTRY_SUCCESS,
		isFetching: false,
	}
}

export function updateEntry(token, data, callback) {
	data['id'] = data['_id']
	return dispatch => {
		dispatch(updateEntryRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/update',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(data),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function() {
				dispatch(updateEntrySuccess())
				if (callback) {
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const ENTRY_DELETE_REQUEST = 'ENTRY_DELETE_REQUEST'
export const ENTRY_DELETE_SUCCESS = 'ENTRY_DELETE_SUCCESS'

function entryDeleteRequest(){
	return {
		type: ENTRY_DELETE_REQUEST,
		isFetching: true,
	}
}

function entryDeleteSuccess(){
	return {
		type: ENTRY_DELETE_SUCCESS,
		isFetching: true,
	}
}

export function deleteEntry(token, entryId, callback) {
	const filters = {
		_id: entryId,
	}
	return dispatch => {
		dispatch(entryDeleteRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/delete',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function() {
				dispatch(entryDeleteSuccess())
				if(callback){
					callback()
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

//remove these two

export const GET_ENTRY_DISPLAY_REQUEST = 'GET_ENTRY_DISPLAY_REQUEST'
export const GET_ENTRY_DISPLAY_SUCCESS = 'GET_ENTRY_DISPLAY_SUCCESS'

function getEntryDisplayRequest() {
	return {
		type: GET_ENTRY_DISPLAY_REQUEST,
		isFetching: true,
		curr_display: undefined,
		curr_display_entries: undefined,
	}
}

function getEntryDisplaySuccess(curr_display, curr_display_entries) {
	return {
		type: GET_ENTRY_DISPLAY_SUCCESS,
		isFetching: false,
		curr_display: curr_display,
		curr_display_entries: curr_display_entries,
	}
}

export function getEntryDisplay(token, entryDisplayId, callback) {
	const filters = {
		entryId: entryDisplayId,
	}
	return dispatch => {
		dispatch(getEntryDisplayRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(getDisplayEntries(token, data.entry, callback)) //change to getAllEntries
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export function getDisplayEntries(token, entry, callback) {

	let ids

	if (entry && contains('Entries', keys(entry.content))) {
		ids = values(prop('Entries', entry.content))
	} else if (contains('Included_data_points', keys(entry.content))) {
		ids = prop('Included_data_points', entry.content)
	} else {
		return dispatch => {
			dispatch(getEntryDisplaySuccess(entry, []))
			if (callback) {
				callback([])
			}
		}
	}

	const filters = {
		filters: {
			_id: ids,
			sortBy: '_id',
		},
	}
	
	return dispatch => {
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(getEntryDisplaySuccess(entry, data))
				if (callback) {
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

/** Template Related Actions */

export const ALL_TEMPLATES_REQUEST = 'ALL_TEMPLATES_REQUEST'
export const ALL_TEMPLATES_SUCCESS = 'ALL_TEMPLATES_SUCCESS'

function requestTemplates() {
	return {
		type: ALL_TEMPLATES_REQUEST,
		isFetching: true,
	}
}

function receiveTemplates(data) {
	return {
		type: ALL_TEMPLATES_SUCCESS,
		isFetching: false,
		all_templates: data,
	}
}

export function getAllTemplates(token, predicate, callback) {
	const filters = {}
	predicate['sortBy'] = head(keys(predicate)) 
	filters['filters'] = predicate
	return dispatch => {
		dispatch(requestTemplates())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/template/all',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			type:'POST',
			data: JSON.stringify(filters),
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(receiveTemplates(data))
				if (callback){
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const TEMPLATE_CREATION_REQUEST = 'TEMPLATE_CREATION_REQUEST'
export const TEMPLATE_CREATION_SUCCESS = 'TEMPLATE_CREATION_SUCCESS'

function requestTemplateCreation() {
	return {
		type: TEMPLATE_CREATION_REQUEST,
		isFetching: true,
	}
}

function receiveTemplateCreation(data) {
	return {
		type: TEMPLATE_CREATION_SUCCESS,
		isFetching: false,
		new_template: data,
	}
}

export function createTemplate(token, data, callback) {
	return dispatch => {
		dispatch(requestTemplateCreation())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/template/new',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			type:'POST',
			data: JSON.stringify(data),
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(receiveTemplateCreation(data))
				if (callback){
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const UPDATE_TEMPLATE_REQUEST = 'UPDATE_TEMPLATE_REQUEST'
export const UPDATE_TEMPLATE_SUCCESS = 'UPDATE_TEMPLATE_SUCCESS'

function updateTemplateRequest() {
	return {
		type: UPDATE_TEMPLATE_REQUEST,
		isFetching: true,
	}
}

function updateTemplateSuccess() {
	return {
		type: UPDATE_TEMPLATE_SUCCESS,
		isFetching: false,
	}
}

export function updateTemplate(token, data, callback) {
	data['id'] = data['_id']
	return dispatch => {
		dispatch(updateTemplateRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/template/update',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(data),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function() {
				dispatch(updateTemplateSuccess())
				if (callback) {
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const TEMPLATE_DELETE_REQUEST = 'TEMPLATE_DELETE_REQUEST'
export const TEMPLATE_DELETE_SUCCESS = 'TEMPLATE_DELETE_SUCCESS'

function templateDeleteRequest(){
	return {
		type: TEMPLATE_DELETE_REQUEST,
		isFetching: true,
	}
}

function templateDeleteSuccess(){
	return {
		type: TEMPLATE_DELETE_SUCCESS,
		isFetching: true,
	}
}

export function deleteTemplate(token, templateId, callback) {
	const filters = {
		_id: templateId,
	}
	return dispatch => {
		dispatch(templateDeleteRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/template/delete',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function() {
				dispatch(templateDeleteSuccess())
				if(callback){
					callback()
				}
			},
			error: function(xhr, status, err) {
				dispatch(requestFailed(err))
			},
		})
	}
}

export const NEW_ENTRY_TRANSFER_FAILURE = 'NEW_ENTRY_TRANSFER_FAILURE'
export const NEW_ENTRY_TRANSFER_REQUEST = 'NEW_ENTRY_TRANSFER_REQUEST'
export const NEW_ENTRY_TRANSFER_SUCCESS = 'NEW_ENTRY_TRANSFER_SUCCESS'

function newEntryTransferFailure(){
	return {
		type: NEW_ENTRY_TRANSFER_FAILURE,
		isFetching: false,
	}
}

function newEntryTransferRequest() {
	return {
		type: NEW_ENTRY_TRANSFER_REQUEST,
		isFetching: true,
	}
}

function newEntryTransferSuccess(response) {
	return {
		type: NEW_ENTRY_TRANSFER_SUCCESS,
		isFetching: false,
		response,
	}
}

export function entryTransfer(token, email, entryId, callback, access) {
	const data = {
		targetUser: email,
		access: access || 'PRIVATE',
		entryId: entryId,
	}
	return dispatch => {
		dispatch(newEntryTransferRequest())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/transfer',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(data),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(response) {
				dispatch(newEntryTransferSuccess(response))
				if (callback) {
					callback(response)
				}
			},
			error: function(xhr, status, err) {
				console.log(err)
				dispatch(newEntryTransferFailure())
			},
		})
	}
}

export const SLICING_FAILURE = 'SLICING_FAILURE'
export const SLICING_REQUEST = 'SLICING_REQUEST'
export const SLICING_SUCCESS = 'SLICING_SUCCESS'

function slicingFailure(){
	return {
		type: SLICING_FAILURE,
		isFetching: false,
	}
}

function slicingRequest() {
	return {
		type: SLICING_REQUEST,
		isFetching: true,
	}
}

function slicingSuccess(response) {
	return {
		type: SLICING_SUCCESS,
		isFetching: false,
		response,
	}
}

export function sliceSTL(token, gcodeTemplateId, file, printer, welltype, callback) {
	const data = {
		token: token,
		gcodeTemplateId: gcodeTemplateId,
		file: file,
		printer: printer,
		welltype: welltype,
	}
	return dispatch => {
		dispatch(slicingRequest())
		$.ajax({
			url: 'http://dispatch.biobots.io/slice',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(data),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(response) {
				dispatch(slicingSuccess(response))
				if (callback) {
					callback(response)
				}
			},
			error: function(xhr, status, err) {
				console.log(xhr, status, err)
				dispatch(slicingFailure())
			},
		})
	}
}

export const GET_SLICING_STATUS_FAILURE = 'GET_SLICING_STATUS_FAILURE'
export const GET_SLICING_STATUS_REQUEST = 'GET_SLICING_STATUS_REQUEST'
export const GET_SLICING_STATUS_SUCCESS = 'GET_SLICING_STATUS_SUCCESS'

function checkOnSliceFailure(){
	return {
		type: GET_SLICING_STATUS_FAILURE,
		isFetching: false,
	}
}

function checkOnSliceRequest() {
	return {
		type: GET_SLICING_STATUS_REQUEST,
		isFetching: true,
	}
}

function checkOnSliceSuccess(response) {
	return {
		type: GET_SLICING_STATUS_SUCCESS,
		isFetching: false,
		response,
	}
}

export function checkOnSlice(taskId, callback) {
	return dispatch => {
		dispatch(checkOnSliceRequest())
		$.ajax({
			url: 'http://dispatch.biobots.io/check/' + taskId,
			type:'GET',
			success: function(response) {
				dispatch(checkOnSliceSuccess(response))
				if (callback) {
					callback(response)
				}
			},
			error: function(xhr, status, err) {
				console.log(xhr, status, err)
				dispatch(checkOnSliceFailure())
			},
		})
	}
}