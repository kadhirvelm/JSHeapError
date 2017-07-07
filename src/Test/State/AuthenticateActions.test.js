import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as authenticateActions from '../../State/AuthenticateActions'
import expect from 'expect'
import $ from 'jquery'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const delay = (ms) => new Promise(resolve =>
	setTimeout(resolve, ms)
)

describe('Register related actions', () => {

	var email = 'test15'
	var password = 'test'
	var name = {
		first: 'test',
		last: 'test2',
	}
	const credentials = {
		email: email,
		password: password,
		name: name,
	}

	const error = {
				'code': 11000,
				'index': 0,
				'errmsg': 'E11000 duplicate key error collection: biobots.users index: email_1 dup key: { : \'kadhir@biobots.io\' }',
				'op': {
					'updatedAt': '2017-02-06T18:59:00.480Z',
					'createdAt': '2017-02-06T18:59:00.480Z',
					'email': email,
					'password': password,
					'access': 'STANDARD',
					name: {
						first: name.first,
						last: name.last,
					},
					'_id': '5898c774ae498d1900b797f5',
					'__v': 0,
				},
			}

	beforeAll(function() {

		var totalCalls = 0

		spyOn($, 'ajax').and.callFake(function(url) {
			var ajaxMock = $.Deferred()

			const replyBody = {
				'user': {
					'__v': 0,
					'updatedAt': '2017-02-03T20:25:03.330Z',
					'createdAt': '2017-02-03T20:25:03.330Z',
					'email': email,
					'password': password,
					'access': 'STANDARD',
					name: {
						first: name.first,
						last: name.last,
					},
					'_id': '5894e71f8f9b5b2c00ca56d5',
				},
			}

			var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/user/new'

			switch(url.url) {
				case undefined:
					ajaxMock.resolve({
						'error': 'Please use POST request',
					})
					break
				case validURL:
					if (totalCalls == 0) {
						url.success(replyBody)
						totalCalls += 1
					} else {
						url.error(null, null, error)
					}
					break
				default:
					ajaxMock.reject()
			}

			return ajaxMock.promise()

		})
	})

	it('successfully registers a new user', () => {

		const expectedActions = [ { type: 'REGISTER_REQUEST',
        isFetching: true,
        credentials:  credentials },
      { type: 'REGISTER_SUCCESS',
        isFetching: false,
        email: 'test15@biobots.io',
        access: 'STANDARD',
        name: { first: 'test', last: 'test2' } },
      { type: 'LOGIN_REQUEST',
        isFetching: true,
        isAuthenticated: false } ]

		const store = mockStore({}, expectedActions)

		store.dispatch(authenticateActions.registerUser(credentials))

		return delay(100).then( () => {
			expect(store.getActions()).toMatch(expectedActions)
		})
	})

	it('unsuccessfully registers a bad user', () => {

		const expectedActions = [
		{ type: authenticateActions.REGISTER_REQUEST, isFetching: true, credentials },
		{ type: authenticateActions.REGISTER_FAILURE, isFetching: false, message: error },
		]

		const store = mockStore()

		store.dispatch(authenticateActions.registerUser(credentials))

		return delay(100).then( () => {
			expect(store.getActions()).toEqual(expectedActions)
		})
	})

})

describe('Login related actions', () => {

	var email = 'test15@biobots.io'
	var password = 'test'
	var token = 'BioBots'
	const name = {
		first: 'Bio',
		last: 'Bots',
	}

	beforeAll(function() {

		spyOn($, 'ajax').and.callFake(function(url) {
			var ajaxMock = $.Deferred()

			const replyBody = {
				'user': {
					'email': email,
					'name': name,
				},
				'token': token,
			}

			const error = 'Unauthorized'

			var validURL = process.env.REACT_APP_BIOBOTS_API_URL + '/user/authenticate'

			switch(url.url) {
				case undefined:
					ajaxMock.resolve({
						'error': 'Please use POST request',
					})
					break
				case validURL:
					if (url.data.password == password) {
						url.success(replyBody)
					} else {
						url.error(null, null, error)
					}
					break
				default:
					ajaxMock.reject()
			}
			return ajaxMock.promise()
		})
	})

	it('successfully logs a user in', () => {

		const credentials = {
			email: email,
			password: password,
		}

		const expectedActions = [
		{ isAuthenticated: false, isFetching: true, type: 'LOGIN_REQUEST' }, 
		{ auth_token: 'BioBots', email: 'test15@biobots.io', isAdmin: undefined, isAuthenticated: true, isFetching: false, name: { first: 'Bio', last: 'Bots' }, type: 'LOGIN_SUCCESS' },
		]
		

		const store = mockStore({}, expectedActions)

		store.dispatch(authenticateActions.loginUser(credentials))

		return delay(100).then( () => {
			expect(store.getActions()).toEqual(expectedActions)
		})
	})

	it('unsuccessfully authenticates a user', () => {

		const credentials = {
			email: email,
			password: password + '1',
		}

		const expectedActions = [
		{ isAuthenticated: false, isFetching: true, type: 'LOGIN_REQUEST' }, 
		{ isAuthenticated: false, isFetching: false, message: 'Unauthorized', type: 'LOGIN_FAILURE' },
		]
		

		const store = mockStore()

		store.dispatch(authenticateActions.loginUser(credentials))

		return delay(100).then( () => {
			expect(store.getActions()).toEqual(expectedActions)
		})
	})

})

describe('Logout related actions', () => {

	it('successfully logs out', () => {

		const expectedActions = [
		{ type: authenticateActions.LOGOUT_REQUEST, isFetching: true, isAuthenticated: true },
		{ type: authenticateActions.LOGOUT_SUCCESS, isFetching: false, isAuthenticated: false },
		]
		
		const store = mockStore({}, expectedActions)

		store.dispatch(authenticateActions.logoutUser())

		return delay(100).then( () => {
			expect(store.getActions()).toEqual(expectedActions)
		})
	})

})