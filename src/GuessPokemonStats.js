import React from 'react';
import { isMobile } from 'react-device-detect';
import PokemonSelect from './PokemonSelect'
import StatSliderContainer from './StatSliderContainer'
import slugma from './slugma.json'

export default class GuessPokemonStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			//pulls images from Pokemon Database if true and PokeAPI if false
			//Database is preferred since it uses jpg instead of png, but API has more complete and up-to-date art, so it will more likely be used
			useDBForImages: false,
			totalLoadingSteps: 1,
			currentLoadingSteps: 0,
			pokemonList: [],
			currentPokemon: null,
			realTotal: 0,
			average: 0,
			adjustedAverage: Array(6).fill(0),
			currentStats: Array(6).fill(1),
			currentTotal: 6,
			guessed: false,
			correctness: 0
		};

		this.selectPokemonFromDropdown = this.selectPokemonFromDropdown.bind(this);
		this.selectRandomPokemon = this.selectRandomPokemon.bind(this);
		this.updateStat = this.updateStat.bind(this);
		this.guess = this.guess.bind(this);
	}

	componentDidMount() {
		(async () => {
			//fetch urls to pokemon objects from apis
			const json = await this.fetchJson('https://pokeapi.co/api/v2/pokemon?limit=2000', false);
			this.setState({
				//there are two steps involved for each pokemon which will contribute to the loading percentage
				totalLoadingSteps: json.count * 2
			});
			const pokemonUrls = await json.results;

			const pokemonList = await Promise.all(pokemonUrls.map(pokemon => this.fetchJson(pokemon.url, true)));
			this.setState({
				pokemonList: pokemonList,
			});

			//api's pokemon object doesn't include national dex number
			//fetch from pokemon-species and associate it with pokemon
			const species = await Promise.all(this.state.pokemonList.map(pokemon => this.fetchJson(pokemon.species.url, true)));
			const speciesId = species.map(pokemon => pokemon.id);
			let tempPokemon = this.state.pokemonList.slice();

			for (let i = 0; i < speciesId.length; i++) {
				tempPokemon[i].species.id = speciesId[i];
			}

			let filteredPokemon = this.filterAndFormat(tempPokemon);

			//place alternate forms after base forms
			filteredPokemon.sort((a, b) => a.species.id - b.species.id);

			this.setState({
				pokemonList: filteredPokemon,
			});
			this.selectRandomPokemon();
		})();
	}

	fetchJson(url, loadingStep) {
		let response = fetch(url)
		.then(
			(result) => {
				if (loadingStep) {
					this.setState(prevState => {
						return {currentLoadingSteps: prevState.currentLoadingSteps + 1}
					});
				}

				const json = result.json();
				return json;
			}
		)
		.catch(
			(error) => {
				//the API page for Slugma specifically returns an empty response only when accessed through the website
				//I can't determine the cause, so Slugma's data is hardcoded for now
				if (url.slice(-13) === "/pokemon/218/") {
					return slugma;
				}
			}
		);

		return response;
	}

	filterAndFormat(originalList, useDB) {
		let filteredPokemon;

		if (this.state.useDBForImages) {
			//filter out forms that have no pokemondb artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/castform-/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/-eternal$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-eternamax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/-bloodmoon$/g);
				result = result && !tempName.match(/-family-of-three$/g);
				result = result && !tempName.match(/squawkabilly-/g);
				result = result && !tempName.match(/-three-segment$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);
				result = result && !tempName.match(/ogerpon-/g);

				return result;
			})

			//change form names to how pokemondb formats them
			for (const pokemon of filteredPokemon) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/alola/g, 'alolan');
				pokemon.name = pokemon.name.replace(/galar/g, 'galarian');
				pokemon.name = pokemon.name.replace(/hisui/g, 'hisuian');
				pokemon.name = pokemon.name.replace(/paldea/g, 'paldean');
				pokemon.name = pokemon.name.replace(/starter/g, 'lets-go');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/zacian$/g, 'zacian-hero');
				pokemon.name = pokemon.name.replace(/zamazenta$/g, 'zamazenta-hero');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/-combat-breed$/g, '');
				pokemon.name = pokemon.name.replace(/paldean-blaze-breed$/g, 'blaze');
				pokemon.name = pokemon.name.replace(/paldean-aqua-breed$/g, 'aqua');
			}
		} else {
			//filter out forms that have no artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);

				return result;
			})

			//change form names to improve formatting
			for (const pokemon of filteredPokemon) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/oinkologne$/g, 'oinkologne-male');
			}
		}

		return filteredPokemon;
	}

	selectPokemonFromDropdown(event) {
		this.selectPokemon(event.target.options.selectedIndex);
	}

	selectRandomPokemon() {
		let random = Math.floor(Math.random() * this.state.pokemonList.length);
		this.selectPokemon(random);
	}

	async selectPokemon(index) {
		//delinter says await has no purpose here, but without it, previous Pokemon's stats are shown
		await this.setState(prevState => {
			return {
				currentPokemon: prevState.pokemonList[index],
				guessed: false,
			}
		});
		
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
			let imageUrl;
			if (this.state.useDBForImages) {
				imageUrl = 'https://img.pokemondb.net/artwork/' + this.state.currentPokemon.name + '.jpg'
			} else {
				let imageBase = this.state.currentPokemon.sprites.other
				imageUrl = imageBase['official-artwork']['front_default'];
			}

		 	selection = (
				<div>
					<div>
						<img
							className={isMobile ? 'pokemon-img-mobile' : 'pokemon-img'}
							src={imageUrl}
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
			let percentage = Math.floor((this.state.currentLoadingSteps / this.state.totalLoadingSteps) * 100);
			selection = (
				<h1>Loading ({percentage}%)...</h1>
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
						</tbody>
						<thead>
							<tr className="totals">
								<th className="total-label">Total</th>
								<th className="total-label">Average</th>
								<th className="total-label">Current</th>
							</tr>
						</thead>
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