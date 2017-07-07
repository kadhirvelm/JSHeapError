import React from 'react'
import $ from 'jquery'
import { mount, shallow } from 'enzyme'
import { App } from '../App'
import { Public } from '../Components/Public/Public'
import { Private } from '../Components/Private/Private'
import { Provider } from 'react-redux'

import injectTapEventPlugin from 'react-tap-event-plugin'

import biobotsApp from '../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import expect, { spyOn } from 'expect'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares, biobotsApp)

describe('Testing the main application page', () => {

	let auth = {}

	beforeAll(function() {
		injectTapEventPlugin()
		auth = {
			isAuthenticated: false,
		}
	})

	it('renders a public component, sets props, then renders a private', () => {
		const application = shallow( <App auth={ auth } /> )
		expect(application.find(Public).length).toBe(1)
		
		application.setProps({ auth: { isAuthenticated: true } } )
		expect(application.find(Private).length).toBe(1)
	})

	it('renders public when auth is undefined', () => {
		const application = shallow( <App auth={ auth } /> )
		application.setProps({ auth: { isAuthenticated: undefined } } )
		expect(application.find(Public).length).toBe(1)
	})

	it('Registers then checks to ensure login', function() {

		var email = 'test15@biobots.io'
		var password = 'test'
		var replies = 0

		spyOn($, 'ajax').andCall(function(url) {
			var ajaxMock = $.Deferred()
			const registerReplyBody = {
				'user': {
					'__v': 0,
					'updatedAt': '2017-02-03T20:25:03.330Z',
					'createdAt': '2017-02-03T20:25:03.330Z',
					'email': email,
					'password': password,
					'access': 'ADMIN',
					'_id': '5894e71f8f9b5b2c00ca56d5',
				},
			}
			const loginReplyBody = {
				'user': {
					'email': 'test15@biobots.io',
				},
				'token': 'BioBots',
			}

			var registerURL = process.env.REACT_APP_BIOBOTS_API_URL + '/user/new'
			var loginURL = process.env.REACT_APP_BIOBOTS_API_URL + '/user/authenticate'

			switch(url.url) {
				case registerURL:
					if (url.data != null) {
						url.success(registerReplyBody)
						replies += 1
					}
					break
				case loginURL:
					if (url.data != null) {
						url.success(loginReplyBody)
						replies += 10
					}
					break
				default:
					break
			}

			return ajaxMock.promise()
		})

		const store = mockStore(biobotsApp)
		const application = mount(
			<Provider store={ store } >
				<App dispatch={ store.dispatch } auth={ auth } />
			</Provider>
		)

		application.find({ id: 'first' }).get(0).value = 'Bio'
		application.find({ id: 'last' }).get(0).value = 'Bots'
		application.find({ id: 'email' }).get(0).value = 'test@biobots.io'
		application.find({ id: 'password' }).get(0).value = 'test'


		application.find({ id: 'Register Form' }).simulate('submit')
		expect(replies).toBe(11)
	})

})