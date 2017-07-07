import { saveState, loadState } from '../../State/StateStoreLoad'

describe('Testing out the state saving mechanisms', function() {

	beforeAll(function() {
		var mock = (function() {
        var store = {}
        return {
            getItem: function(key) {
                return store[key]
            },
            setItem: function(key, value) {
                store[key] = value.toString()
            },
            clear: function() {
                store = {}
            },
        }
    })()
    Object.defineProperty(window, 'localStorage', { value: mock, configurable: true, enumerable: true, writable: true })
    })

	it('saves the state without errors', function() {
		const state = {
			test: 'example',
		}
		saveState(state)
	})

	it('loads the state without errors', function() {
		loadState()
	})

	it('saves, then loads the state', function() {
		const state = {
			test: 'example',
		}
		saveState(state)
		expect(loadState()).toEqual(state)
	})
})