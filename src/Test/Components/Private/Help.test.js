import React from 'react'
import { shallow } from 'enzyme'

import { Help } from '../../../Components/Private/Help'


describe('Help has everything', () => {
	it('Checks for headers', () => {

		const entries = shallow(<Help />)

		expect(entries.find({ id: 'Help Text' }).length).toBe(1)
	})
})