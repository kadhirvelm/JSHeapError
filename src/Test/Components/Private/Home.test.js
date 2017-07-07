import React from 'react'
import { shallow } from 'enzyme'

import { Home } from '../../../Components/Private/Home'
import expect from 'expect'

describe('Home has all the components it needs', () => {

	let props = {}
	var dispatch

	beforeEach( () => {
		dispatch = expect.createSpy()
		props = { 
			auth: { 
				isAuthenticated: true,
				auth_token: 'BioBots',
			}, 
			dispatch: dispatch, 
			biobots: {
				all_entries: [
					{
						_id: '58a4f2c2f875eb13009b09b9',
						access: 'DEFAULT',
						children:[],
						content: { Title: 'Hello' },
						createdAt: '2017-02-16T00:30:58.166Z',
						name: 'Temp',
						owner: '58a4f0573c955c1300d72a5c',
						parents:[],
						templateId: '58a4f164f875eb13009b09b4',
						updatedAt: '2017-02-16T00:30:58.166Z',
					},
					{
						_id: '58a5f848c22e7c130018a3e0',
						access: 'DEFAULT',
						children: [],
						content: { Title: 'YAZA' },
						createdAt: '2017-02-16T19:06:48.964Z',
						name: 'Temp',
						owner: '58a4f0573c955c1300d72a5c',
						parents: [],
						templateId: '58a4f1aef875eb13009b09b5',
						updatedAt: '2017-02-16T19:06:48.964Z',
					},
				],
				isFetching: false,
				curr_display: undefined,
				curr_display_entries: undefined, 
			},
			website: {
				entry: undefined,
			},
		}
		window.innerHeight = 750
	})

	afterEach( () => {
		expect.restoreSpies()
	})

	it('Sets the state correctly', () => {
		const homeApp = shallow(<Home appProps={ props } />)
		const homeState = {
			dispatch: dispatch,
			auth_token: 'BioBots',
			entryDisplay: undefined,
			height: 375,
			all_entries: [
					{
						_id: '58a4f2c2f875eb13009b09b9',
						access: 'DEFAULT',
						children:[],
						content: { Title: 'Hello' },
						createdAt: '2017-02-16T00:30:58.166Z',
						name: 'Temp',
						owner: '58a4f0573c955c1300d72a5c',
						parents:[],
						templateId: '58a4f164f875eb13009b09b4',
						updatedAt: '2017-02-16T00:30:58.166Z',
					},
					{
						_id: '58a5f848c22e7c130018a3e0',
						access: 'DEFAULT',
						children: [],
						content: { Title: 'YAZA' },
						createdAt: '2017-02-16T19:06:48.964Z',
						name: 'Temp',
						owner: '58a4f0573c955c1300d72a5c',
						parents: [],
						templateId: '58a4f1aef875eb13009b09b5',
						updatedAt: '2017-02-16T19:06:48.964Z',
					},
				],
			refreshingContents: false,
			curr_display: undefined,
			curr_display_entries: undefined,
		}

		const homeAppState = homeApp.state()

		expect(homeAppState.dispatch).toBe(homeState.dispatch)
		expect(homeAppState.auth_token).toBe(homeState.auth_token)
		expect(homeAppState.entryDisplay).toBe(homeState.entryDisplay)
		expect(homeAppState.height).toBe(homeState.height)
		expect(homeAppState.all_entries).toMatch(homeState.all_entries)
		expect(homeAppState.refreshingContents).toBe(homeState.refreshingContents)
		expect(homeAppState.curr_display).toBe(homeState.curr_display)
		expect(homeAppState.curr_display_entries).toBe(homeState.curr_display_entries)

	})

	it('Renders the components correctly', () => {
		const homeApp = shallow(<Home appProps={ props } />)
		
		expect(homeApp.find({ id: 'Home' }).length).toBe(1)
		
		expect(homeApp.find({ id: 'Drawer Open' }).length).toBe(1)
		expect(homeApp.find({ id: 'Hamburger' }).length).toBe(1)
		expect(homeApp.find({ id: 'Progress' }).length).toBe(0)
		expect(homeApp.find({ id: 'Drawer' }).length).toBe(0)
		expect(homeApp.find({ id: 'EntryDisplay' }).length).toBe(0)
		expect(homeApp.find({ id: 'Select' }).text()).toEqual(' Select or create a Project or Protocol from the menu on the left ')
		
		homeApp.setState({ refreshingContents: true })
		expect(homeApp.find({ id: 'Progress' }).length).toBe(1)
		
		expect(dispatch.calls.length).toEqual(1)
	})

	it('Opens and closes the drawer', () => {
		const homeApp = shallow(<Home appProps={ props } />)

		expect(homeApp.state().drawerOpen).toBe(false)
		homeApp.instance().changeDrawer()
		expect(homeApp.state().drawerOpen).toBe(true)
	})

	it('Sets the projects and protocols properly', () => {
		const entries = {
			entries: [
				{
					_id: '58a4f2c2f875eb13009b09b9',
					access: 'DEFAULT',
					children:[],
					content: { Title: 'Hello' },
					createdAt: '2017-02-16T00:30:58.166Z',
					name: 'Temp',
					owner: '58a4f0573c955c1300d72a5c',
					parents:[],
					templateId: '58a4f164f875eb13009b09b4',
					updatedAt: '2017-02-16T00:30:58.166Z',
				},
				{
					_id: '58a5f848c22e7c130018a3e0',
					access: 'DEFAULT',
					children: [],
					content: { Title: 'YAZA' },
					createdAt: '2017-02-16T19:06:48.964Z',
					name: 'Temp',
					owner: '58a4f0573c955c1300d72a5c',
					parents: [],
					templateId: '58a4f1aef875eb13009b09b5',
					updatedAt: '2017-02-16T19:06:48.964Z',
				},
			],
		}
		const homeApp = shallow(<Home appProps={ props } />)
		homeApp.setState({ 
			projectTemplate: { _id: '58a4f164f875eb13009b09b4' },
			protocolTemplate: { _id: '58a4f1aef875eb13009b09b5' },
		})
		homeApp.instance().setProjectProtocolEntries(entries)
		expect(homeApp.state().projectEntries).toMatch([ entries.entries[0] ])
		expect(homeApp.state().protocolEntries).toMatch([ entries.entries[1] ])
	})

})