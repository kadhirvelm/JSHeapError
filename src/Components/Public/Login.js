import React from 'react'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

import Flexbox from 'flexbox-react'
import { red600 } from 'material-ui/styles/colors'

const validate = values => {
  const errors = {}
  const requiredFields = [ 'email', 'password' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = 'Required'
    }
  })
  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address'
  }
  return errors
}

const textFieldLoginStyle = {
  width: '100%',
  minWidth: '304px',
}

const loginButtonStyle = {
  marginTop: '10px',
}

class LoginForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = this.resetPass()
  }

  resetPass = () => {
    return { errors: '' }
  }

  componentWillMount() {
    this.props.reset()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errorMessage })
  }

  email = ({ input, meta: { touched, error } }) => (
      <TextField id='email'
      floatingLabelText='Email'
      style={ textFieldLoginStyle }
      inputStyle={ textFieldLoginStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  password = ({ input, meta: { touched, error } }) => (
      <TextField id='password'
      type='password'
      floatingLabelText='Password'
      style={ textFieldLoginStyle }
      inputStyle={ textFieldLoginStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  errors(errors) {
    switch (errors) {
      case 'Unauthorized':
        return 'Invalid Email Or Password'
      case 'Bad Request':
        return 'Cannot Leave Fields Blank'
      default:
        return errors
    }
  }

  render() {
    const { handleSubmit } = this.props
    return (
      <Flexbox flexDirection='column'>
        <form onSubmit={ handleSubmit }>
          <div>
            <Field name='email' component={ this.email } label='Email' />
          </div>
          <div>
            <Field name='password' component={ this.password } label='Password' />
          </div>
          <Flexbox justifyContent='center'>
            <font color={ red600 } > { this.errors(this.state.errors) } </font>
          </Flexbox>
          <RaisedButton id='submit'
                type='submit'
                label='Login'
                fullWidth={ true }
                style={ loginButtonStyle }
                />
        </form>
      </Flexbox>
    )
  }
}

export default reduxForm({
  form: 'Login',
  validate,
})(LoginForm)