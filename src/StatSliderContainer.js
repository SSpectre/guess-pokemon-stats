import React from 'react'
import StatSlider from './StatSlider'

export default class StatSliderContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stats: ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'],
        }
    }

    render() {
        return (
            <div className="stat-container">
                {this.state.stats.map((stat, i) => <StatSlider
                    key={stat}
                    index={i}
                    name={stat}
                    answer={this.props.answers[i]}
                    onChange={this.props.onChange}
                    guessed={this.props.guessed}
                    average={this.props.average}
                    disabled={this.props.disabled}
                />)}
            </div>
        );
    }
}