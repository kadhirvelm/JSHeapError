import React from 'react'
import { shallow } from 'enzyme'

import expect from 'expect'
import { NewEntryDialog } from '../../../../Components/Private/Global/NewEntryDialog'

describe('Entry list renderers properly', () => {
	
	it('Entry list renders without crashing', () => {

		const open = false
		const handleClose = () => {
			console.log('On selection')
		}
		const all_templates = []
		const createNewEntry = { test: 'test' }

		const entryList = shallow(<NewEntryDialog
			open={ open }
			handleClose={ handleClose } 
			templates={ all_templates }
			createNewEntry={ createNewEntry }
			/>)

		expect(entryList.find({ id: 'Dialog' }).length).toBe(1)
		expect(entryList.find({ id: 'GridList' }).length).toBe(1)
	})

})