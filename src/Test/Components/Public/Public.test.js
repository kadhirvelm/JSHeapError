import React from 'react'
import { shallow } from 'enzyme'

import { Public } from '../../../Components/Public/Public'
import LoginCard from '../../../Components/Public/LoginCard'

describe('Public has all the components it needs', () => {

	it('Checks for login and register', () => {
		const publicApp = shallow(<Public appProps='test' />)
		expect(publicApp.find(LoginCard).length).toBe(1)
		expect(publicApp.find({ id:'Public Flexbox' }).length).toBe(1)
	})

})