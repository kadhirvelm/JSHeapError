import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as entryActions from '../../State/EntryActions'
import expect from 'expect'
import $ from 'jquery'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const delay = (ms) => new Promise(resolve =>
	setTimeout(resolve, ms)
)

describe('Testing all entry actions', () => {

	const token = 'BioBots'

	describe('Entries', () => {

		it('Successfully fetches all entries', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all'

				const replyBody = { test: 'test' }

				switch(url.url) {
					case validURL:
						url.success(replyBody)
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'ALL_ENTRIES_REQUEST' }, 
			{ all_entries: undefined, isFetching: false, type: 'ALL_ENTRIES_SUCCESS' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getAllEntries(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesfully fetches entries', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all'

				switch(url.url) {
					case validURL:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'ALL_ENTRIES_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getAllEntries(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})
	})

	describe('Templates', () => {

		it('Successfully fetches all templates', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/template/all'

				const replyBody = { test: 'test' }

				switch(url.url) {
					case validURL:
						url.success(replyBody)
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'ALL_TEMPLATES_REQUEST' }, 
			{ all_templates: { test: 'test' }, isFetching: false, type: 'ALL_TEMPLATES_SUCCESS' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getAllTemplates(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesfully fetches templates', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/template/all'

				switch(url.url) {
					case validURL:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'ALL_TEMPLATES_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getAllTemplates(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})
	})

	describe('Entry Requests', () => {

		it('Successful entry request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/new'

				const replyBody = { test: 'test' }

				switch(url.url) {
					case validURL:
						url.success(replyBody)
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'NEW_ENTRY_REQUEST' }, 
			{ isFetching: false, new_entry: { test: 'test' }, type: 'NEW_ENTRY_SUCCESS' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.createNewEntry(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesful entry request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/new'

				switch(url.url) {
					case validURL:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'NEW_ENTRY_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.createNewEntry(token, ''))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})
	})

	describe('Update Entry', () => {

		it('Successful update entry request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/update'

				const replyBody = { test: 'test' }

				switch(url.url) {
					case validURL:
						url.success(replyBody)
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'UPDATE_ENTRY_REQUEST' }, 
			{ isFetching: false, type: 'UPDATE_ENTRY_SUCCESS' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.updateEntry(token, {}))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesful update entry request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/update'

				switch(url.url) {
					case validURL:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ isFetching: true, type: 'UPDATE_ENTRY_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.updateEntry(token, {}))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})
	})

	describe('Entry display request', () => {

		it('Successful get entry display request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURLEntry = process.env.REACT_APP_BIOBOTS_API_URL + '/entry'
				var validURLEntryAll = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all'

				const replyBody = { entry: { content: { Content: [ '00' ] } } }
				const replies = { entries: [] }

				switch(url.url) {
					case validURLEntry:
						url.success(replyBody)
						break
					case validURLEntryAll:
						url.success(replies)
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ curr_display: undefined, curr_display_entries: undefined, isFetching: true, type: 'GET_ENTRY_DISPLAY_REQUEST' }, 
			{ curr_display: { content: { Content: [ '00' ] } }, curr_display_entries: [], isFetching: false, type: 'GET_ENTRY_DISPLAY_SUCCESS' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getEntryDisplay(token, '00'))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesful get entry display request', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry'

				switch(url.url) {
					case validURL:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ curr_display: undefined, curr_display_entries: undefined, isFetching: true, type: 'GET_ENTRY_DISPLAY_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getEntryDisplay(token, {}))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})

		it('Unsuccesful get entry display request from /entry/all', () => {

			spyOn($, 'ajax').and.callFake(function(url) {
				var ajaxMock = $.Deferred()
				var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/entry'
				var validURLAll = process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all'

				const replyBody = { entry: { content: { Content: [ '00' ] } } }

				switch(url.url) {
					case validURL:
						url.success(replyBody)
						break
					case validURLAll:
						url.error('Error')
						break
					default:
						ajaxMock.reject()
				}

				return ajaxMock.promise()

			})

			const expectedActions = [
			{ curr_display: undefined, curr_display_entries: undefined, isFetching: true, type: 'GET_ENTRY_DISPLAY_REQUEST' }, 
			{ isFetching: false, message: undefined, type: 'REQUEST_FAILURE' },
			]

			const store = mockStore({}, expectedActions)

			store.dispatch(entryActions.getEntryDisplay(token, {}))

			return delay(100).then( () => {
				expect(store.getActions()).toEqual(expectedActions)
			})
		})
	})

})