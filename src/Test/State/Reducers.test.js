import biobotsApp from '../../State/Reducers'
import * as authenticateActions from '../../State/AuthenticateActions'
import * as entryActions from '../../State/EntryActions'
import * as websiteActions from '../../State/WebsiteActions'

import expect from 'expect'

describe('BioBots UI Reducers', () => {

	it('should return the initial state', () => {
		var initialState = biobotsApp({}, {})
		expect(initialState.auth).toEqual( { isFetching: false, isAuthenticated: false } )
		expect(initialState.biobots).toEqual({ errorMessage: '' } )
		expect(initialState.website).toEqual({ } )
		expect(initialState.controlPanel).toEqual({ isFetching: false, printers: [] })
		expect(initialState.routing).toEqual( { locationBeforeTransitions: null })
	})

	describe('BioBots Authenticate Actions', () => {

		describe('Register actions', () => {
			it('register request', () => {
				var registerRequest = biobotsApp({}, { type: authenticateActions.REGISTER_REQUEST } )
				expect(registerRequest.auth).toEqual( { isFetching: true, isAuthenticated: false, requesting: undefined } )
				expect(registerRequest.biobots).toEqual({ errorMessage: '' } )
				expect(registerRequest.website).toEqual({ } )
				expect(registerRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(registerRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('register success', () => {
				var registerSuccess = biobotsApp({}, { type: authenticateActions.REGISTER_SUCCESS, auth_token: 'BioBots', email: 'BioBots@bio.io', name: 'BioBots', isFetching: false } )
				expect(registerSuccess.auth).toEqual( { auth_token: 'BioBots', email: 'BioBots@bio.io', isAdmin: undefined, isAuthenticated: undefined, isFetching: false, name: 'BioBots' } )
				expect(registerSuccess.biobots).toEqual({ errorMessage: '' } )
				expect(registerSuccess.website).toEqual({ } )
				expect(registerSuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(registerSuccess.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('register request', () => {
				var registerFailure = biobotsApp({}, { type: authenticateActions.REGISTER_FAILURE, message: 'error' } )
				expect(registerFailure.auth).toEqual( { isAuthenticated: false, isFetching: false, register_error: 'error' } )
				expect(registerFailure.biobots).toEqual({ errorMessage: '' } )
				expect(registerFailure.website).toEqual({ } )
				expect(registerFailure.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(registerFailure.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('login actions', () => {
			it('login request', () => {
				var loginRequest = biobotsApp({}, { type: authenticateActions.LOGIN_REQUEST, isFetching: true, isAuthenticated: false } )
				expect(loginRequest.auth).toEqual( { auth_token: null, isAuthenticated: false, isFetching: true, name: null } )
				expect(loginRequest.biobots).toEqual({ errorMessage: '' } )
				expect(loginRequest.website).toEqual({ } )
				expect(loginRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(loginRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('login success', () => {
				var loginSuccess = biobotsApp({}, { type: authenticateActions.LOGIN_SUCCESS, auth_token: 'BioBots', email: 'BioBots@bio.io', name: 'BioBots', isFetching: false } )
				expect(loginSuccess.auth).toEqual( { auth_token: 'BioBots', email: 'BioBots@bio.io', isAdmin: undefined, isAuthenticated: undefined, isFetching: false, name: 'BioBots' } )
				expect(loginSuccess.biobots).toEqual({ errorMessage: '' } )
				expect(loginSuccess.website).toEqual({ } )
				expect(loginSuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(loginSuccess.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('login failure', () => {
				var loginFailure = biobotsApp({}, { type: authenticateActions.LOGIN_FAILURE, message: 'error', isFetching: false, isAuthenticated: false } )
				expect(loginFailure.auth).toEqual( {  auth_token: null, isAuthenticated: false, isFetching: false, login_error: 'error', name: null } )
				expect(loginFailure.biobots).toEqual({ errorMessage: '' } )
				expect(loginFailure.website).toEqual({ } )
				expect(loginFailure.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(loginFailure.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('logout actions', () => {
			it('logout request', () => {
				var logoutRequest = biobotsApp({}, { type: authenticateActions.LOGOUT_REQUEST, isFetching: true, isAuthenticated: true } )
				expect(logoutRequest.auth).toEqual( { isAuthenticated: false, isFetching: false } )
				expect(logoutRequest.biobots).toEqual({ errorMessage: '' } )
				expect(logoutRequest.website).toEqual({ } )
				expect(logoutRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(logoutRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('logout success', () => {
				var logoutSuccess = biobotsApp({}, { type: authenticateActions.LOGOUT_SUCCESS, isFetching: false, isAuthenticated: false } )
				expect(logoutSuccess.auth).toEqual( { } )
				expect(logoutSuccess.biobots).toEqual({ } )
				expect(logoutSuccess.website).toEqual({ } )
				expect(logoutSuccess.controlPanel).toEqual({ })
				expect(logoutSuccess.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('logout failure', () => {
				var logoutFailure = biobotsApp({}, { type: authenticateActions.LOGOUT_FAILURE } )
				expect(logoutFailure.auth).toEqual( {  isAuthenticated: false, isFetching: false } )
				expect(logoutFailure.biobots).toEqual({ errorMessage: '' } )
				expect(logoutFailure.website).toEqual({ } )
				expect(logoutFailure.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(logoutFailure.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

	})

describe('BioBots Entry Actions', () => {

		it('entry failure', () => {
			var entryFailure = biobotsApp({}, { type: entryActions.REQUEST_FAILURE, isFetching: false, message: 'error' } )
			expect(entryFailure.auth).toEqual( { isFetching: false, isAuthenticated: false } )
			expect(entryFailure.biobots).toEqual({ errorMessage: 'error', isFetching: false } )
			expect(entryFailure.website).toEqual({ } )
			expect(entryFailure.controlPanel).toEqual({ isFetching: false, printers: [] })
			expect(entryFailure.routing).toEqual( { locationBeforeTransitions: null })
		})

		describe('entry actions', () => {
			it('entry request', () => {
				var entryRequest = biobotsApp({}, { type: entryActions.ALL_ENTRIES_REQUEST, isFetching: true } )
				expect(entryRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(entryRequest.biobots).toEqual({ errorMessage: '', isFetching: true } )
				expect(entryRequest.website).toEqual({ } )
				expect(entryRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(entryRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('entry success', () => {
				var entrySuccess = biobotsApp({}, { type: entryActions.ALL_ENTRIES_SUCCESS, isFetching: false, all_entries: [] } )
				expect(entrySuccess.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(entrySuccess.biobots).toEqual({ all_entries: [], errorMessage: '', isFetching: false } )
				expect(entrySuccess.website).toEqual({ } )
				expect(entrySuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(entrySuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('template actions', () => {
			it('template request', () => {
				var templateRequest = biobotsApp({}, { type: entryActions.ALL_TEMPLATES_REQUEST, isFetching: true } )
				expect(templateRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(templateRequest.biobots).toEqual({ errorMessage: '', isFetching: true } )
				expect(templateRequest.website).toEqual({ } )
				expect(templateRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(templateRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('template success', () => {
				var templateSuccess = biobotsApp({}, { type: entryActions.ALL_TEMPLATES_SUCCESS, isFetching: false, all_templates: [] } )
				expect(templateSuccess.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(templateSuccess.biobots).toEqual({ all_templates: [], errorMessage: '', isFetching: false } )
				expect(templateSuccess.website).toEqual({ } )
				expect(templateSuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(templateSuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('new entry actions', () => {
			it('new entry request', () => {
				var newEntryRequest = biobotsApp({}, { type: entryActions.NEW_ENTRY_REQUEST, isFetching: true } )
				expect(newEntryRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(newEntryRequest.biobots).toEqual({ errorMessage: '', isFetching: true } )
				expect(newEntryRequest.website).toEqual({ } )
				expect(newEntryRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(newEntryRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('new entry success', () => {
				var newEntrySuccess = biobotsApp({}, { type: entryActions.NEW_ENTRY_SUCCESS, isFetching: false, new_entry: { test: 'test' } } )
				expect(newEntrySuccess.auth).toEqual( { isAuthenticated: false, isFetching: false } )
				expect(newEntrySuccess.biobots).toEqual( { errorMessage: '', isFetching: false, new_entry: { test: 'test' } } )
				expect(newEntrySuccess.website).toEqual({ })
				expect(newEntrySuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(newEntrySuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('update entry actions', () => {
			it('update entry request', () => {
				var updateEntryRequest = biobotsApp({}, { type: entryActions.UPDATE_ENTRY_REQUEST, isFetching: true } )
				expect(updateEntryRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(updateEntryRequest.biobots).toEqual({ errorMessage: '', isFetching: true } )
				expect(updateEntryRequest.website).toEqual({ } )
				expect(updateEntryRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(updateEntryRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('update entry success', () => {
				var updateEntrySuccess = biobotsApp({}, { type: entryActions.UPDATE_ENTRY_SUCCESS, isFetching: false } )
				expect(updateEntrySuccess.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(updateEntrySuccess.biobots).toEqual({ errorMessage: '', isFetching: false } )
				expect(updateEntrySuccess.website).toEqual({ } )
				expect(updateEntrySuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(updateEntrySuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})

		describe('get entry display actions', () => {
			it('get entry display request', () => {
				var getEntryDisplayRequest = biobotsApp({}, { type: entryActions.GET_ENTRY_DISPLAY_REQUEST, isFetching: true, curr_display: undefined, curr_display_entries: undefined } )
				expect(getEntryDisplayRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(getEntryDisplayRequest.biobots).toEqual({ curr_display: undefined, curr_display_entries: undefined, errorMessage: '', isFetching: true } )
				expect(getEntryDisplayRequest.website).toEqual({ } )
				expect(getEntryDisplayRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(getEntryDisplayRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('get entry display success', () => {
				var getEntryDisplaySuccess = biobotsApp({}, { type: entryActions.GET_ENTRY_DISPLAY_SUCCESS, isFetching: false, curr_display: { test: 'display' }, curr_display_entries: { test: 'entries' } } )
				expect(getEntryDisplaySuccess.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(getEntryDisplaySuccess.biobots).toEqual({ curr_display: { test: 'display' }, curr_display_entries: { test: 'entries' }, errorMessage: '', isFetching: false })
				expect(getEntryDisplaySuccess.website).toEqual({ } )
				expect(getEntryDisplaySuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(getEntryDisplaySuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})
		
	})

describe('BioBots Website Actions', () => {
		describe('display entry actions', () => {
			it('display entry request', () => {
				var displayEntryRequest = biobotsApp({}, { type: websiteActions.DISPLAY_ENTRY_REQUEST, isRendering: true, entry: { test: 'test' } } )
				expect(displayEntryRequest.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(displayEntryRequest.biobots).toEqual({ errorMessage: '' } )
				expect(displayEntryRequest.website).toEqual({ entry: { test: 'test' }, isRendering: true })
				expect(displayEntryRequest.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(displayEntryRequest.routing).toEqual( { locationBeforeTransitions: null })
			})

			it('display entry success', () => {
				var getEntryDisplaySuccess = biobotsApp({}, { type: websiteActions.DISPLAY_ENTRY_SUCCESS, isRendering: false } )
				expect(getEntryDisplaySuccess.auth).toEqual( { isFetching: false, isAuthenticated: false } )
				expect(getEntryDisplaySuccess.biobots).toEqual({ errorMessage: '' })
				expect(getEntryDisplaySuccess.website).toEqual({ isRendering: false })
				expect(getEntryDisplaySuccess.controlPanel).toEqual({ isFetching: false, printers: [] })
				expect(getEntryDisplaySuccess.routing).toEqual( { locationBeforeTransitions: null })
			})
		})
	})

})