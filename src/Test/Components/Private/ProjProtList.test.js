import React from 'react'
import { shallow } from 'enzyme'

import { ProjProtList } from '../../../Components/Private/ProjProtList'
import expect from 'expect'

describe('ProjProtList renders correctly', () => {
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
				all_templates: [
					{ 
						_id: '58a4f164f875eb13009b09b4',
						access: 'DEFAULT',
						content: { Title: { type: 'string', required: true, default: '' }, Content: { type: 'object', required: false } },
						createdAt: '2017-02-16T00:25:08.503Z',
						name: 'Project',
						updatedAt: '2017-02-16T00:25:08.503Z',
					},
					{
						_id: '58a4f1aef875eb13009b09b5',
						access: 'DEFAULT',
						content: { Title: { type: 'string', required: true, default: '' }, Content: {  type: 'object', required: false } },
						createdAt: '2017-02-16T00:26:22.609Z',
						name: 'Protocol',
						updatedAt: '2017-02-16T00:26:22.609Z',
					},
				],
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
			},
		}
		window.innerHeight = 750
	})

	it('Checks for headers and rendering', () => {

		const onSelection = expect.createSpy()

		const entries = shallow(<ProjProtList dispatch={ props.dispatch } auth_token={ props.auth.auth_token }
			onSelection={ onSelection } height={ window.innerHeight/2 } projectTemplate={ props.biobots.all_templates[0] }
			protocolTemplate={ props.biobots.all_templates[1] } projectEntries={ props.biobots.all_entries[0] }
			protocolEntries={ props.biobots.all_entries[1] } />)

		expect(entries.find({ id: 'Projects ID' }).length).toBe(1)
		expect(entries.find({ id: 'Projects Subheader' }).length).toBe(1)
		expect(entries.state().openProject).toBe(false)
		entries.find({ label: 'New Project' }).simulate('click')
		expect(entries.state().openProject).toBe(true)
		expect(entries.find({ id: 'Project Creation Wizard' }).length).toBe(1)
		expect(entries.find({ id: 'Project List' }).length).toBe(1)

		expect(entries.find({ id: 'Protocols ID' }).length).toBe(1)
		expect(entries.find({ id: 'Protocols Subheader' }).length).toBe(1)
		expect(entries.state().openProtocol).toBe(false)
		entries.find({ label: 'New Protocol' }).simulate('click')
		expect(entries.state().openProtocol).toBe(true)
		expect(entries.find({ id: 'Protocol Creation Wizard' }).length).toBe(1)
		expect(entries.find({ id: 'Protocol List' }).length).toBe(1)
	})
	
})