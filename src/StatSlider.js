import React, { useRef } from "react";
import {isMobile} from 'react-device-detect';

export default class StatSlider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 1,
        }

        this.updateValue = this.updateValue.bind(this);
        this.correctValue = this.correctValue.bind(this);

        this.sliderRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.pokemon !== this.props.pokemon || prevProps.average !== this.props.average) {
            this.setState({
                value: this.props.average,
            })
        }
    }

    updateValue(event) {
        this.setState({
            value: event.target.value,
        })

        this.props.onChange(this.props.index, event.target.value);
    }

    //prevents invalid numbers from being typed in
    correctValue(event) {
        let value = Math.round(Number(event.target.value));
        event.target.value = value;

        if (value > 255) {
            event.target.value = 255;
        }
    }

    render() {
        let sliderWidth = this.sliderRef.current ? this.sliderRef.current.offsetWidth : 100;
        let answerPercentage = (this.props.answer - 1) / 254;
        let answer = ((answerPercentage * sliderWidth) - 10 * answerPercentage) / sliderWidth * 100;

        if (isMobile) {
            return (
                <div className="stat-row-mobile">
                    
                    <div className="slider-container-mobile">
                        <input
                            id={'slider-' + this.props.index}
                            className="slider"
                            type="range"
                            min="1"
                            max="255"
                            value={this.state.value}
                            onChange={this.updateValue}
                            ref={this.sliderRef}
                            disabled={this.props.disabled}
                        />
                        <div className={this.props.guessed ? 'answer-container' : 'answer-container-hidden'}>
                            <span
                                className="answer"
                                style={{left: answer + '%'}}
                            />
                            <label className="slider-label-mobile">
                                {this.props.name}
                            </label>
                        </div>
                    </div>
                    <input
                        className="slider-number-mobile"
                        type="number"
                        min="1"
                        max="255"
                        step="1"
                        value={this.state.value}
                        disabled={this.props.guessed || this.props.disabled}
                        onChange={this.updateValue}
                        onInput={this.correctValue}
                    />
                    <label className={this.props.guessed ? 'answer-label-mobile' : 'answer-label-mobile-hidden'}>
                        {this.props.answer}
                    </label>
                </div>
            )
        } else {
            return (
                <div className="stat-row">
                    <label className="slider-label">
                        {this.props.name}:
                    </label>
                    <div className="slider-container">
                        <input
                            id={'slider-' + this.props.index}
                            className="slider"
                            type="range"
                            min="1"
                            max="255"
                            value={this.state.value}
                            onChange={this.updateValue}
                            ref={this.sliderRef}
                            disabled={this.props.disabled}
                        />
                        <div className={this.props.guessed ? 'answer-container' : 'answer-container-hidden'}>
                            <span
                                className="answer"
                                style={{left: answer + '%'}}
                            />
                        </div>
                    </div>
                    <input
                        className="slider-number"
                        type="number"
                        min="1"
                        max="255"
                        step="1"
                        value={this.state.value}
                        disabled={this.props.guessed || this.props.disabled}
                        onChange={this.updateValue}
                        onInput={this.correctValue}
                    />
                    <label className={this.props.guessed ? 'answer-label' : 'answer-label-hidden'}>
                        {this.props.answer}
                    </label>
                </div>
            );
        }
    }
}