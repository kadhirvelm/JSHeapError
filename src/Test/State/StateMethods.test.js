import checkAuthorization from '../../State/StateMethods'
import mapStateToProps from '../../State/StateMethods'

describe('Testing out checkAuthorization', function() {
	it('Fail authorization', function() {
		const props = {
			auth: {
				isAuthenticated: false,
			},
			router: [],
		}
		checkAuthorization(props)
		expect(props.router).toEqual( [ '/' ] )
	})

	it('Succeeds authorizing', function() {
		const props = {
			auth: {
				isAuthenticated: true,
			},
			router: [],
		}
		checkAuthorization(props)
		expect(props.router).toEqual( [ ] )
	})
})

describe('Map State to Props', function() {
	it('Changes the state successfully', () => {
		const state = {
			biobots: {},
			auth: {
				auth_test: 'test',
			},
			router: [],
		}

		const mappedState = mapStateToProps(state)
	})
})