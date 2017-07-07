import React from 'react'
import { shallow } from 'enzyme'

import expect from 'expect'
import { EntryDisplay } from '../../../../Components/Private/Global/EntryDisplay'

describe('Entry display renderers properly', () => {
	
	it('Entry display renders without crashing', () => {

		const entryDisplay = { content: { Title: 'test', Content: [] } }
		const curr_display = { content: { Title: 'test', Content: [] } }
		const curr_display_entries = { test: [ 'curr_display_entries' ] }
		const dispatch = expect.createSpy()
		const token = 'BioBots'
		const appendable_templates = []
		const refreshingContents = false

		const entries = shallow(<EntryDisplay entryDisplay={ entryDisplay } 
			curr_display={ curr_display } 
			curr_display_entries={ curr_display_entries }
			dispatch={ dispatch }
			token={ token } 
			appendable_templates={ appendable_templates }
			refreshingContents={ refreshingContents }
			/>)

		expect(entries.find({ id: 'ContentAdd' }).length).toBe(1)
		expect(entries.find({ id: 'NewEntryDialog' }).length).toBe(1)
	})

})