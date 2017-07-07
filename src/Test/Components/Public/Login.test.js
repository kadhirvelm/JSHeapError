import React from 'react'
import $ from 'jquery'
import { mount, shallow } from 'enzyme'
import Login from '../../../Components/Public/Login'
import injectTapEventPlugin from 'react-tap-event-plugin'

describe('Login components', function() {

	beforeAll(function() {
		injectTapEventPlugin()

		spyOn($, 'ajax').and.callFake(function(url) {
			var ajaxMock = $.Deferred()
			const replyBody = {
				'user': {
					'email': 'test15@biobots.io',
				},
				'token': 'BioBots',
			}
			url.success(replyBody)
			return ajaxMock.promise()
		})
	})

	it('Displays the headers', function() {
		const application = shallow(<Login />)
		expect(application.find({ id:'Login Form' }).length).toBe(1)
		expect(application.find({ id:'Login Flexbox' }).length).toBe(1)
	})

	it('Displays the entry fields', function() {
		const application = shallow(<Login />)
		expect(application.find({ id:'email' }).length).toBe(1)
		expect(application.find({ id:'password' }).length).toBe(1)
		expect(application.find({ id:'submit' }).length).toBe(1)
	})

	it('The functionality calls on the login user', function() {
		const application = mount(<Login />)

		function test(credentials) {
			const expectedCredentials = {
				email: 'test@biobots.io',
				password: 'test',
			}
			expect(credentials).toEqual(expectedCredentials)
		}

		const props = {
			onLoginClick: test,
		}

		application.setProps(props)
		application.find({ id: 'email' }).get(0).value = 'test@biobots.io'
		application.find({ id: 'password' }).get(0).value = 'test'

		application.find({ id: 'Login Form' }).simulate('submit')
	})
})