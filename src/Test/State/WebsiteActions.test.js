import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as websiteActions from '../../State/WebsiteActions'
import expect from 'expect'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const delay = (ms) => new Promise(resolve =>
	setTimeout(resolve, ms)
)

describe('Tests all the website actions', () => {

	it('display entry success', () => {

		const expectedActions = [
		{ entry: { test: 'test' }, isRendering: true, type: 'DISPLAY_ENTRY_REQUEST' }, 
		{ isRendering: false, type: 'DISPLAY_ENTRY_SUCCESS' },
		]

		const store = mockStore({}, expectedActions)
		const entry = { test: 'test' }
		store.dispatch(websiteActions.displayEntry(entry))

		return delay(100).then( () => {
			expect(store.getActions()).toEqual(expectedActions)
		})
	})
})