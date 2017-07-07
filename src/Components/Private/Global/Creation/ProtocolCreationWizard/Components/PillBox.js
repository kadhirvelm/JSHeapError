import React from 'react'
import PropTypes from 'prop-types'

import Flexbox from 'flexbox-react'

import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../../../Display/icons'

const border = {
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: '#E0E0E0',
	borderRadius: '15%',
}

class PillBox extends React.Component{

	constructor(props){
		super(props)
		this.state = this.propsConst(props)
	}

	propsConst = (props) => {
		return({
			id: props.id,
			increaseHandler: props.increaseHandler,
			decreaseHandler: props.decreaseHandler,
			incrementAmount: props.incrementAmount || 1,
			indicator: props.indicator || 'plusMinus',
			mini: props.mini || false,
			stallPeriod: props.stallPeriod || 0.09,
			flipIncreaseDecrease: props.flipIncreaseDecrease || false,
			rightDisable: props.rightDisable || false,
			leftDisable: props.leftDisable || false,
			increaseLabel: props.increaseLabel || 'Increase',
			decreaseLabel: props.decreaseLabel || 'Decrease',
		})
	}

	componentWillReceiveProps(nextProps){
		this.setState(this.propsConst(nextProps))
	}

	iconStyle = () => {
		if(this.state.mini) {
			return ({ width: '15px', height: '15px' })
		} else {
			return ({ width: '21px', height: '21px' })
		}
	}

	style = () => {
		if (this.state.mini) {
			return ({ width: '36px', height: '36px', padding: '5px' })
		} else {
			return ({ width: '42px', height: '42px', padding: '6px' })
		}
	}

	startIncreasing = () => {
		if (!this.isButtonDisabled(false)) {
			this.increasing = true
			this.increment(this.increase, this.state.increaseHandler)
		}
	}

	stopIncrease = () => {
		this.increasing = false
	}

	increase = () => this.increasing

	startDecrease = () => {
		if (!this.isButtonDisabled(true)) {
			this.decreasing = true
			this.increment(this.decrease, this.state.decreaseHandler)
		}
	}

	stopDecrease = () => {
		this.decreasing = false
	}

	decrease = () => this.decreasing

	increment = (shouldContinue, handler) => {
		if ( shouldContinue() ){
			handler(this.state.id, this.state.incrementAmount)
			var increment = this.increment
			setTimeout( () => {
				increment(shouldContinue, handler)
			}, this.state.stallPeriod * 1000)
		}
	}

	leftHandSide = () => {
		switch(this.state.indicator) {
			case 'upDownArrows':
				return 'down_arrow'
			case 'leftRightArrows':
				return 'left_arrow'
			case 'platforms':
				return 'down_platform'
			default:
				return 'minus'
		}
	}

	rightHandSide = () => {
		switch(this.state.indicator) {
			case 'upDownArrows':
				return 'up_arrow'
			case 'leftRightArrows':
				return 'right_arrow'
			case 'platforms':
				return 'up_platform'
			default:
				return 'plus'
		}
	}

	buttonBorderStyle = (isDecrease) => {
		return (isDecrease === !this.state.flipIncreaseDecrease) ? { borderRight: 'solid 1px #E0E0E0' } : {}
	}

	isButtonDisabled = (isDecrease) => {
		return (isDecrease !== this.state.flipIncreaseDecrease) ? this.state.leftDisable : this.state.rightDisable
	}

	returnDecrease = () => {
		return(
			<Flexbox flexBasis='content' justifyContent='center' alignItems='center' style={ this.buttonBorderStyle(true) } onMouseDown={ this.startDecrease } onMouseUp={ this.stopDecrease }>
				<IconButton disabled={ this.isButtonDisabled(true) } tooltip={ this.state.decreaseLabel } style={ this.style() } iconStyle={ this.iconStyle() }>
					{ svgIcon( this.leftHandSide() ) }
				</IconButton>
			</Flexbox>
		)
	}

	returnIncrease = () => {
		return(
			<Flexbox flexBasis='content' onMouseDown={ this.startIncreasing } style={ this.buttonBorderStyle(false) } onMouseUp={ this.stopIncrease }>
				<IconButton disabled={ this.isButtonDisabled(false) } tooltip={ this.state.increaseLabel } style={ this.style() } iconStyle={ this.iconStyle() }>
					{ svgIcon( this.rightHandSide() ) }
				</IconButton>
			</Flexbox>
		)
	}

	render() {
		return(
			<Flexbox justifyContent='space-around' alignItems='center'>
				{ this.state.flipIncreaseDecrease ?
					<Flexbox alignItems='center' flexBasis='content' style={ border }>
						{ this.returnIncrease() }
						{ this.returnDecrease() }
					</Flexbox>
					:
					<Flexbox alignItems='center' flexBasis='content' style={ border }>
						{ this.returnDecrease() }
						{ this.returnIncrease() }
					</Flexbox>
				}
			</Flexbox>
		)
   }
}

PillBox.propTypes = {
	id: PropTypes.string.isRequired,
	decreaseHandler: PropTypes.func.isRequired,
	increaseHandler: PropTypes.func.isRequired,
}

export default PillBox