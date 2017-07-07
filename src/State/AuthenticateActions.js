import $ from 'jquery'

export const REGISTER_REQUEST = 'REGISTER_REQUEST'
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
export const REGISTER_FAILURE = 'REGISTER_FAILURE'

function requestRegister(credentials) {
    return {
        type: REGISTER_REQUEST,
        isFetching: true,
        credentials,
    }

}

function registerSuccess(user) {
	return {
		type: REGISTER_SUCCESS,
		isFetching: false,
		email: user.email,
		access: user.access,
		name: user.name,
	}
}

function registerFailure(message) {
    return {
        type: REGISTER_FAILURE,
        isFetching: false,
        message,
    }
}

export function registerUser(credentials) {
	return dispatch => {
		dispatch(requestRegister(credentials))

		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/user/new',
			data: {
				'first': credentials.first,
				'last': credentials.last,
				'email': credentials.email,
				'password': credentials.password,
				'access': 'STANDARD',
			},
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(registerSuccess(data.user))
				dispatch(loginUser(credentials))
			},
			error: function(xhr, status, err) {
				dispatch(registerFailure(err))
			},
		})
	}
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

function requestLogin() {
	return {
		type: LOGIN_REQUEST,
		isFetching: true,
		isAuthenticated: false,
	}
}

function receivedLogin(user, token) {
	return {
		type: LOGIN_SUCCESS,
		isFetching: false,
		isAuthenticated: true,
		id: user._id,
		email: user.email,
		isAdmin: user.access === 'ADMIN',
		name: user.name,
		auth_token: token,
	}
}

function loginFailure(message) {
    return {
        type: LOGIN_FAILURE,
        isFetching: false,
        isAuthenticated: false,
        message,
    }
}

export function loginUser(credentials) {
	return dispatch => {
		dispatch(requestLogin())

		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/user/authenticate',
			data: {
				'email': credentials.email,
				'password': credentials.password,
			},
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
        //dispatch(connectToSocketManager(credentials.email))
				dispatch(receivedLogin(data.user, data.token))
			},
			error: function(xhr, status, err) {
				dispatch(loginFailure(err))
			},
		})
	}
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

function requestLogout() {
    return {
        type: LOGOUT_REQUEST,
        isFetching: true,
        isAuthenticated: true,
    }
}

function receiveLogout() {
    return {
        type: LOGOUT_SUCCESS,
        isFetching: false,
        isAuthenticated: false,
    }
}

export function logoutUser() {
    return dispatch => {
        dispatch(requestLogout())
        dispatch(receiveLogout())
    }
}

export const USER_REQUEST = 'USER_REQUEST'
export const USER_REQUEST_SUCCESS = 'USER_REQUEST_SUCCESS'
export const USER_REQUEST_FAILURE = 'USER_REQUEST_FAILURE'

function requestUser() {
    return {
        type: USER_REQUEST,
        isFetching: true,
    }
}

function receivedUser(user) {
    return {
        type: USER_REQUEST_SUCCESS,
        isFetching: false,
        user,
    }
}

function failedUser(message) {
	return {
		type: USER_REQUEST_FAILURE,
		isFetching: false,
		message,
	}
}

export function getUser(token, id, callback) {
	const filters = {}
	filters['id'] = id
  return dispatch => {
		dispatch(requestUser())
		$.ajax({
			url: process.env.REACT_APP_BIOBOTS_API_URL + '/user/get',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			data: JSON.stringify(filters),
			type:'POST',
			dataType: 'json',
			cache: false,
			success: function(data) {
				dispatch(receivedUser(token, data.entry))
				if (callback) {
					callback(data)
				}
			},
			error: function(xhr, status, err) {
				dispatch(failedUser(err))
			},
		})
	}
}
