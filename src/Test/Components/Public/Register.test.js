import React from 'react'
import $ from 'jquery'
import { mount, shallow } from 'enzyme'
import Register from '../../../Components/Public/Register'
import injectTapEventPlugin from 'react-tap-event-plugin'

describe('Register components', function() {

	beforeAll(function() {
		injectTapEventPlugin()

		var email = 'test15@biobots.io'
		var password = 'test'

		spyOn($, 'ajax').and.callFake(function(url) {
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

			var registerURL = process.env.REACT_APP_BIOBOTS_API_URL + '/user/new'
			url.success(registerReplyBody)

			return ajaxMock.promise()
		})
	})

	it('Displays the headers', function() {
		const application = shallow(<Register />)
		expect(application.find({ id:'Register Form' }).length).toBe(1)
		expect(application.find({ id:'Register Flexbox' }).length).toBe(1)
	})

	it('Displays the all fields', function() {
		const application = shallow(<Register />)
		expect(application.find({ id:'first' }).length).toBe(1)
		expect(application.find({ id:'last' }).length).toBe(1)
		expect(application.find({ id:'email' }).length).toBe(1)
		expect(application.find({ id:'password' }).length).toBe(1)
		expect(application.find({ id:'captcha' }).length).toBe(1)
		expect(application.find({ id:'submit' }).length).toBe(1)
	})

	it('The functionality calls on the login user', function() {
		const application = mount(<Register />)

		function test(credentials) {
			const expectedCredentials = {
				first: 'Bio',
				last: 'Bots',
				email: 'test@biobots.io',
				password: 'test',
			}
			expect(credentials).toEqual(expectedCredentials)
		}

		const props = {
			onRegisterClick: test,
		}

		application.setProps(props)
		application.find({ id: 'first' }).node.value = 'Bio'
		application.find({ id: 'last' }).node.value = 'Bots'
		application.find({ id: 'email' }).node.value = 'test@biobots.io'
		application.find({ id: 'password' }).node.value = 'test'

		expect(application.find({ id: 'Register Form' }).length).toBe(1)
		expect(application.find({ id: 'submit' }).length).toBe(1)
		application.find({ id: 'submit' }).simulate('click')
	})

})