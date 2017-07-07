import React from 'react'
import { shallow } from 'enzyme'

import { CreationWizard } from '../../../../Components/Private/Global/CreationWizard'
import expect from 'expect'

describe('Creation Field renderers properly', () => {
	
	it('Creation Wizard renders without crashing', () => {

		const template = { name: 'test' }

		const handleSubmit = (values) => {
			console.log(values)
		}

		const entries = shallow(<CreationWizard fields={ template } handleSubmit={ handleSubmit } />)
		expect(entries.find({ id: 'submit' }).length).toBe(1)
	})

})