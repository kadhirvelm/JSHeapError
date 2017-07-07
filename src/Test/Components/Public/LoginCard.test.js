import React from 'react'
import $ from 'jquery'
import { mount } from 'enzyme'

import { Login } from '../../../Components/Public/Login'
import { Register } from '../../../Components/Public/Register'
import LoginCard from '../../../Components/Public/LoginCard'

import injectTapEventPlugin from 'react-tap-event-plugin'
import configureMockStore from 'redux-mock-store'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import expect from 'expect'

const mockStore = configureMockStore([])

describe('LoginCard components and functionality', function() {
	
	let props = {}
	const dispatch = expect.createSpy()

	const mountWithContext = {
		context: {
			muiTheme: getMuiTheme(),
		},
		childContextTypes: {
			muiTheme: React.PropTypes.object.isRequired,
		},
	}

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

		props = {
			auth: {
				login_error: null,
				register_error: null,
			},
			dispatch: dispatch,
		}
	})

	it('Headers in small', function() {
		window.testMediaQueryValues = { width: 750 }
		const application = mount(<LoginCard appProps={ props } store={ mockStore({}) } muiTheme= { getMuiTheme() } />, mountWithContext)
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find({ id:'Login Box' }).length).toBe(1)
		expect(application.find({ id:'Register Box' }).length).toBe(1)
	})

	it('Components in small', function() {
		window.testMediaQueryValues = { width: 750 }
		const application = mount(<LoginCard appProps={ props } store={ mockStore({}) } muiTheme= { getMuiTheme() } />, mountWithContext)
		expect(application.find(Login).length).toBe(1)
		expect(application.find(Register).length).toBe(1)
	})

	it('Headers in large size', function() {
		window.testMediaQueryValues = { width: 1250 }
		const application = mount(<LoginCard appProps={ props } store={ mockStore({}) } muiTheme= { getMuiTheme() } />, mountWithContext)
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find({ id:'Login Box' }).length).toBe(1)
		expect(application.find({ id:'Register Box' }).length).toBe(1)
	})

	it('Components in large size', function() {
		window.testMediaQueryValues = { width: 1250 }
		const application = mount(<LoginCard appProps={ props } store={ mockStore({}) } muiTheme= { getMuiTheme() } />, mountWithContext)
		expect(application.find(Login).length).toBe(1)
		expect(application.find(Register).length).toBe(1)
	})

	it('Components and Headers in both sizes', function() {
		window.testMediaQueryValues = { width: 500 }
		const application = mount(<LoginCard appProps={ props } store={ mockStore({}) } muiTheme= { getMuiTheme() } />, mountWithContext)
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find(Login).length).toBe(1)
		expect(application.find(Register).length).toBe(1)
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find({ id:'Login Box' }).length).toBe(1)
		expect(application.find({ id:'Register Box' }).length).toBe(1)

		window.testMediaQueryValues = { width: 1250 }
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find(Login).length).toBe(1)
		expect(application.find(Register).length).toBe(1)
		expect(application.find({ id:'LoginCard Box' }).length).toBe(1)
		expect(application.find({ id:'Login Box' }).length).toBe(1)
		expect(application.find({ id:'Register Box' }).length).toBe(1)
	})
})