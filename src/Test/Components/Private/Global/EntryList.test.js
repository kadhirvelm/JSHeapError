import React from 'react'
import { shallow } from 'enzyme'

import expect from 'expect'
import { EntryList } from '../../../../Components/Private/Global/EntryList'

describe('Entry list renderers properly', () => {
	
	it('Entry list renders without crashing', () => {

		const dispatch = expect.createSpy()
		const height = 75
		const entries = []
		const onSelection = () => {
			console.log('On selection')
		}

		const entryList = shallow(<EntryList
			dispatch={ dispatch }
			height={ height } 
			entries={ entries }
			onSelection={ onSelection }
			/>)

		expect(entryList.find({ id: 'Table' }).length).toBe(1)
		expect(entryList.find({ id: 'TableBody' }).length).toBe(1)
	})

})