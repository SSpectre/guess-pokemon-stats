import React from 'react';
import { isMobile } from 'react-device-detect';
import PokemonSelect from './PokemonSelect'
import StatSliderContainer from './StatSliderContainer'

export default class GuessPokemonStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			pokemonList: [],
			currentPokemon: null,
			realTotal: 0,
			average: 0,
			adjustedAverage: Array(6).fill(0),
			currentStats: Array(6).fill(1),
			currentTotal: 6,
			guessed: false,
			correctness: 0,
		};

		this.selectPokemonFromDropdown = this.selectPokemonFromDropdown.bind(this);
		this.selectRandomPokemon = this.selectRandomPokemon.bind(this);
		this.updateStat = this.updateStat.bind(this);
		this.guess = this.guess.bind(this);
	}

	componentDidMount() {
		(async () => {
			//fetch urls to pokemon objects from apis
			const json = await this.fetchJson('https://pokeapi.co/api/v2/pokemon?limit=2000');
			const pokemonUrls = await json.results;
			const pokemonList = await Promise.all(pokemonUrls.map(pokemon => this.fetchJson(pokemon.url)));
			this.setState({
				pokemonList: pokemonList,
			});

			//api's pokemon object doesn't include national dex number
			//fetch from pokemon-species and associate it with pokemon
			const species = await Promise.all(this.state.pokemonList.map(pokemon => this.fetchJson(pokemon.species.url)));
			const speciesId = species.map(pokemon => pokemon.id);
			let tempPokemon = this.state.pokemonList.slice();

			for (let i = 0; i < speciesId.length; i++) {
				tempPokemon[i].species.id = speciesId[i];
			}

			//filter out forms that have no pokemondb artwork
			let filteredPokemon = tempPokemon.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/castform-/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/-eternal$/g);
				result = result && !tempName.match(/(pumpkaboo|gourgeist)-(?!average)/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-eternamax$/g);
				result = result && !tempName.match(/-dada$/g);

				return result;
			})

			//change form names to how pokemondb formats them
			for (let i = 0; i < filteredPokemon.length; i++) {
				let tempName = filteredPokemon[i].name;

				tempName = tempName.replace(/gmax/g, 'gigantamax');
				tempName = tempName.replace(/alola/g, 'alolan');
				tempName = tempName.replace(/galar/g, 'galarian');
				tempName = tempName.replace(/hisui/g, 'hisuian');
				tempName = tempName.replace(/starter/g, 'lets-go');
				tempName = tempName.replace(/-average$/g, '');
				tempName = tempName.replace(/-red$/g, '-core');
				tempName = tempName.replace(/-red-meteor$/g, '-meteor');
				tempName = tempName.replace(/-disguised$/g, '');
				tempName = tempName.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				tempName = tempName.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				tempName = tempName.replace(/amped-/g, '');
				tempName = tempName.replace(/zacian$/g, 'zacian-hero');
				tempName = tempName.replace(/zamazenta$/g, 'zamazenta-hero');
				tempName = tempName.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				tempName = tempName.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');

				filteredPokemon[i].name = tempName;
			}

			//place alternate forms after base forms
			filteredPokemon.sort((a, b) => a.species.id - b.species.id);

			this.setState({
				pokemonList: filteredPokemon,
			});
			this.selectRandomPokemon();
		})();
	}

	async fetchJson(url) {
		const response = await fetch(url);
		return response.json();
	}

	selectPokemonFromDropdown(event) {
		this.selectPokemon(event.target.options.selectedIndex);
	}

	selectRandomPokemon() {
		let random = Math.floor(Math.random() * this.state.pokemonList.length);
		this.selectPokemon(random);
	}

	async selectPokemon(index) {
		this.setState({
			currentPokemon: await this.state.pokemonList[index],
			guessed: false,
		})
		
		let total = 0;
		for (const stat of this.state.currentPokemon.stats) {
			total += stat.base_stat;
		}

		let average = total / 6;

		//adjust stats to match total when average is a decimal number
		let adjustedAverage = Array(6).fill(Math.round(average));
		let adjustedTotal = adjustedAverage[0] * 6;

		let i = 0;
		while (adjustedTotal < total) {
			adjustedAverage[i]++;
			adjustedTotal++;
			i++;
		}

		i = adjustedAverage.length - 1;
		while (adjustedTotal > total) {
			adjustedAverage[i]--;
			adjustedTotal--;
			i--;
		}

		this.setState({
			realTotal: total,
			average: average,
			adjustedAverage: adjustedAverage,
		})

		//automatically set sliders to average when new pokemon is selected
		this.updateCurrentTotal(adjustedAverage);
	}

	updateCurrentTotal(stats) {
		let value = stats.reduce((total, stat) => total = total + stat, 0);
		this.setState({
			currentStats: stats,
			currentTotal: value,
		})
	}

	updateStat(i, newValue) {
		let stats = this.state.currentStats.slice();
		stats[i] = Number(newValue);
		this.setState({
			currentStats: stats,
		})

		this.updateCurrentTotal(stats);
	}

	guess() {
		let correctnessValues = [];
		for (let i = 0; i < this.state.currentStats.length; i++) {
			let difference = Math.abs(this.state.currentStats[i] - this.state.currentPokemon.stats[i].base_stat)
			let percentage = 100 - (difference / (this.state.average / 3) * 100);
			correctnessValues.push(percentage > 0 ? percentage : 0);
		}

		let correctness = correctnessValues.reduce((total, value) => total = total + value, 0) / correctnessValues.length;

		this.setState({
			guessed: true,
			correctness: correctness,
		})
	}

	render() {
		let loaded = this.state.currentPokemon;
		let answers = loaded ? this.state.currentPokemon.stats.map(stat => stat.base_stat) : Array(6).fill(1);

		let selection;
		if (loaded) {
		 	selection = (
				<div>
					<div>
						<img
							className={isMobile ? 'pokemon-img-mobile' : 'pokemon-img'}
							src={'https://img.pokemondb.net/artwork/' + this.state.currentPokemon.name + '.jpg'}
							alt={this.state.currentPokemon.name}
						/>
					</div>
					<div>
						<PokemonSelect
							pokemonList={this.state.pokemonList.slice()}
							onChange={this.selectPokemonFromDropdown}
							value={this.state.currentPokemon.name}
						/>
						<button
							className="random"
							onClick={this.selectRandomPokemon}
						>
							Random
						</button>
					</div>
				</div>
			);
		} else {
			selection = (
				<h1>Loading...</h1>
			);
		}

		return (
			<div>
				{selection}
				<div>
					<StatSliderContainer
						answers={answers}
						onChange={this.updateStat}
						guessed={this.state.guessed}
						average={this.state.adjustedAverage}
						disabled={!loaded}
						pokemon={loaded ? this.state.currentPokemon.name : null}
					/>
				</div>
				<div>
					<table className="totals">
						<tbody>
							<tr className="totals">
								<td className={isMobile ? 'total-mobile' : 'total'}>{this.state.realTotal}</td>
								<td className={isMobile ? 'total-mobile' : 'total'}>{Number(this.state.average.toFixed(1))}</td>
								<td className={isMobile ? 'total-mobile' : 'total'}>{this.state.currentTotal}</td>
							</tr>
							<tr className="totals">
								<td className="total-label">Total</td>
								<td className="total-label">Average</td>
								<td className="total-label">Current</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div>
					<button
						className="guess"
						disabled={this.state.realTotal !== this.state.currentTotal || this.state.guessed}
						onClick={this.guess}
					>
						Guess!
					</button>
				</div>
				<div>
					<p className={this.state.realTotal === this.state.currentTotal ? 'invisible' : 'visible'}>
						(Current total must match the Pok&eacute;mon's total before guessing)
					</p>
					<p className={"correctness " + (this.state.guessed ? 'visible' : 'invisible')}>
						You guessed <b>{this.state.correctness.toFixed(1)}%</b> correct!
					</p>
					<p className={loaded && this.state.currentPokemon.name.match(/gigantamax/g) ? 'visible' : 'invisible'}>
						*Gigantamax Pok&eacute;mon have double HP, but this doesn't affect base stats
					</p>
				</div>
			</div>
		);
	}
}