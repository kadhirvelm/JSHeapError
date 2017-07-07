import React from 'react'
import { mount } from 'enzyme'

import { CreationWizard } from '../../../../Components/Private/Global/CreationWizard'

import injectTapEventPlugin from 'react-tap-event-plugin'
import configureMockStore from 'redux-mock-store'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { Provider } from 'react-redux'

const mockStore = configureMockStore([])

describe('Creation Wizard renderers properly', () => {
	
	it('Creation Wizard renders without crashing', () => {

		injectTapEventPlugin()

		const template = { 
			_id: '58b4cfd0eeb1531300982bd0',
			access: 'DEFAULT',
			content: {
				entries: {
					display: 'none',
					order: '2',
					required: false,
					type: 'object',
				},
				title: {
					default: '',
					display: 'line',
					order: '1',
					required: true,
					type: 'string',
				},
			},
			createdAt: '2017-02-28T01:18:08.070Z',
			createdBy: [],
			description: 'Common procedures',
			icon: 'Protocol',
			name: 'Protocol',
			owner: '58b4cfcceeb1531300982bcf',
			updatedAt: '2017-02-28T01:18:08.070Z',
			}

		const open = true
		const close = () => {
			console.log('close')
		}

		const mountWithContext = {
			context: {
				muiTheme: getMuiTheme(),
			},
			childContextTypes: {
				muiTheme: React.PropTypes.object.isRequired,
			},
		}

		const entries = mount(
			<Provider store={ mockStore({}) }>
				<CreationWizard open={ open } close={ close } muiTheme= { getMuiTheme() } template={ template } />
			</Provider>, mountWithContext)

		expect(entries.find({ id: 'Dialog' }).length).toBe(1)
	})

})