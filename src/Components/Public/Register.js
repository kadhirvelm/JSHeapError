import React from 'react'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import { Checkbox } from 'redux-form-material-ui'
import Flexbox from 'flexbox-react'
//import Recaptcha from 'react-recaptcha'

import { prop } from 'ramda'
import { red600 } from 'material-ui/styles/colors'

const validate = values => {
  const errors = {}
  const requiredFields = [ 'first', 'last', 'email', 'password', 're-password', 'agree' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = 'Required'
    }
  })
  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address'
  }
  if (prop('re-password', values) !== prop('password', values)) {
    errors.password = 'Passwords do not match'
  }
  return errors
}

const textFieldRegisterStyle = {
  width: '100%',
  minWidth: '304px',
}

const registerButtonStyle = {
  marginTop: '10px',
}

class RegisterForm extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      error: props.errorMessage,
    }
  }

  componentWillMount() {
    this.props.reset()
  }

  componentWillReceiveProps(nextProps){
    this.setState({ error: nextProps.errorMessage })
  }

  first = ({ input, meta: { touched, error } }) => (
      <TextField id='first'
      floatingLabelText="First Name"
      style={ textFieldRegisterStyle }
      inputStyle={ textFieldRegisterStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  last = ({ input, meta: { touched, error } }) => (
      <TextField id='last'
      floatingLabelText="Last Name"
      style={ textFieldRegisterStyle }
      inputStyle={ textFieldRegisterStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  email = ({ input, meta: { touched, error } }) => (
      <TextField id='email'
      floatingLabelText="Email"
      style={ textFieldRegisterStyle }
      inputStyle={ textFieldRegisterStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  password = ({ input, meta: { touched, error } }) => (
      <TextField id='password'
      type="password"
      floatingLabelText="Password"
      style={ textFieldRegisterStyle }
      inputStyle={ textFieldRegisterStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  rePassword = ({ input, meta: { touched, error } }) => (
      <TextField id='re-password'
      type="password"
      floatingLabelText="Re-enter Password"
      style={ textFieldRegisterStyle }
      inputStyle={ textFieldRegisterStyle } 
      errorText={ touched && error }
      { ...input }
      />
    )

  errors(errors) {
    switch (errors) {
      case 'Internal Server Error':
        return 'Invalid Email Address'
      case 'Bad Request':
        return 'Cannot Leave Fields Blank'
      default:
        return errors
    }
  }

  // captcha = () => (
  //   <Recaptcha sitekey={ process.env.REACT_APP_RECAPTCHA_SITE_KEY } />
  // )

  checkBox = (value) => { value ? this.setState({ checkError: '' }) : this.setState({ checkError: 'Required' }) }

  render() {
    const { handleSubmit } = this.props
    return (
      <form onSubmit={ handleSubmit }>
        <div>
          <Field name='first' component={ this.first } label='First' />
        </div>
        <div>
          <Field name='last' component={ this.last } label='Last' />
        </div>
        <div>
          <Field name='email' component={ this.email } label='Email' />
        </div>
        <div>
          <Field name='password' component={ this.password } label='Password' />
        </div>
        <div>
          <Field name='re-password' component={ this.rePassword } label='Re-password' />
        </div>
        <div>
          <Field name='agree' component={ Checkbox } label='Agree to terms and conditions' validate={ this.checkBox } />
          <font color={ red600 } size={ 2 } > { this.state.checkError } </font>
        </div>
        <Flexbox justifyContent='center'>
          <font color={ red600 } > { this.errors(this.state.error) } </font>
        </Flexbox>
        <RaisedButton id='submit'
              type="submit"
              label="Register"
              fullWidth={ true }
              style={ registerButtonStyle }
              />
      </form>
    )
  }
}

export default reduxForm({
  form: 'Register',
  validate,
})(RegisterForm)