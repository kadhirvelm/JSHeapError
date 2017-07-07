import React from 'react'
import { shallow } from 'enzyme'

import { Feed } from '../../../Components/Private/Feed'


describe('Feed has everything', () => {
	it('Checks for components', () => {

		const entries = shallow(<Feed />)

		expect(entries.find({ id: 'Feed' }).length).toBe(1)
		expect(entries.find({ id: 'Refresh' }).length).toBe(1)
		expect(entries.find({ id: 'Print' }).length).toBe(1)
	})
})