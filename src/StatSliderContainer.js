import React from 'react'
import StatSlider from './StatSlider'
import {isMobile} from 'react-device-detect';

export default class StatSliderContainer extends React.Component {
    constructor(props) {
        super(props);

        if (isMobile) {
            this.state = {
                stats: ['HP', "Atk", "Def", "SpA", "SpD", "Spe"],
            }
        } else {
            this.state = {
                stats: ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'],
            }
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
                    average={this.props.average[i]}
                    disabled={this.props.disabled}
                    pokemon={this.props.pokemon}
                />)}
            </div>
        );
    }
}