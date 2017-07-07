import React from 'react'
import { shallow } from 'enzyme'

import { Private } from '../../../Components/Private/Private'
import { Home } from '../../../Components/Private/Home'
import { Feed } from '../../../Components/Private/Feed'
import { Help } from '../../../Components/Private/Help'


describe('Private has everything needed', () => {
	let props = {}

	beforeEach( () => {
		props = { 
			auth: { 
				isAuthenticated: true,
				auth_token: 'BioBots',
			}, 
			dispatch: undefined, 
			biobots: { 
				all_templates: [],
				all_entries: [], 
			},
		}
	})

	it('Checks for the and the three tabs', () => {

		const privateApp = shallow(<Private appProps={ props } />)

		expect(privateApp.find(Home).length).toBe(1)
		expect(privateApp.find(Feed).length).toBe(1)
		expect(privateApp.find(Help).length).toBe(1)
		expect(privateApp.find({ label: 'Logout' }).length).toBe(1)
	})

	it('Checks that the state was properly setup', () => {

		const privateApp = shallow(<Private appProps={ props } />)

		expect(privateApp.state).not.toBe(undefined)
		const privateAppState = privateApp.state()
		expect(privateAppState.dispatch).toBe(undefined)
		expect(privateAppState.auth_token).toBe('BioBots')
		expect(privateAppState.appProps).toBe(props)
		expect(privateAppState.all_templates).toHaveLength(0)
		expect(privateAppState.all_entries).toHaveLength(0)
	})

	it('Checks that the logout button works', () => {

		const dispatch = () => { return true }
		props['dispatch'] = dispatch

		const privateApp = shallow(<Private appProps={ props } />)
		privateApp.find({ label: 'Logout' }).simulate('click')
	})

})