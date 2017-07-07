import React from 'react'

import Flexbox from 'flexbox-react'
import Graph from 'react-graph-vis'

export class Help extends React.Component{
 
	graph = () => {
		return({
			nodes: [
				{ id: 1, label: 'Soft Tissue Kit 5 mL' },
				{ id: 2, label: 'HNDFs 5mil/mL' },
				{ id: 3, label: 'Print 1 at 20 PSI' },
				{ id: 4, label: 'Print 2 at 60 PSI' },
				{ id: 5, shape: 'image', image: 'https://biobots-ui.s3.amazonaws.com/Files/Images/58e6a95801a1f22c00ebd954_maggie%40biobots.io/58e6c30801a1f22c00ebd9bb_LIVE%2520CELLS%2520low%2520pressure-01-01.png' },
				{ id: 6, shape: 'image', image: 'https://biobots-ui.s3.amazonaws.com/Files/Images/58e6a95801a1f22c00ebd954_maggie%40biobots.io/58e6c2f701a1f22c00ebd9b9_DEAD-CELLS_high%2520pressure-01.png' },
			],
			edges: [
				{ from: 1, to: 4 },
				{ from: 1, to: 3 },
				{ from: 2, to: 3 },
				{ from: 2, to: 4 },
				{ from: 3, to: 5 },
				{ from: 4, to: 6 },
			],
		})
	}
 
	options = () => {
		return({
			width: '100%',
			height: '100%',
			layout: {
				hierarchical: true,
			},
			edges: {
				color: '#000000',
			},
			nodes: {
				color: {
					border: '#616161',
					background: '#EB3C40',
				},
				font: {
					color: '#FAFAFA',
				},
			},
		})
	}

	//17 128 128 -- teal: #118080
//235 60 64 -- red: #EB3C40

  render() {
    return(
      <Flexbox id='Help Text' flexDirection="row" justifyContent="center">
				<Graph graph={ this.graph() } options={ this.options() } />
      </Flexbox>
      )
  }

}

export default Help
