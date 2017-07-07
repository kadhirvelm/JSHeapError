var shouldSave = true

export const saveState = (state) => {
	try {
		if (shouldSave) {
			const serializedState = JSON.stringify(state)
			localStorage.setItem('state', serializedState)
		}
		shouldSave = state.auth.isAuthenticated ? state.auth.isAuthenticated : false
	} catch (err) {
		console.log('Writing state error -> ', err, state)
	}
}

export const loadState = () => {
	try {
		const serializedState = localStorage.getItem('state')
		if (serializedState === null) {
			return undefined
		}
		return JSON.parse(serializedState)
	} catch (err) {
		return undefined
	}
}