import React from 'react';
import { isMobile } from 'react-device-detect';
import PokemonSelect from './PokemonSelect';
import StatSliderContainer from './StatSliderContainer';

export default class GuessPokemonStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			//pulls images from Pokemon Database if true and PokeAPI if false
			//Database is preferred since it uses jpg instead of png, but API has more complete and up-to-date art, so it will more likely be used
			useDBForImages: false,
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

		this.fetchJson = this.fetchJson.bind(this);
		this.getImageUrl = this.getImageUrl.bind(this);
		this.selectPokemonFromDropdown = this.selectPokemonFromDropdown.bind(this);
		this.selectRandomPokemon = this.selectRandomPokemon.bind(this);
		this.updateStat = this.updateStat.bind(this);
		this.guess = this.guess.bind(this);
	}

	componentDidMount() {
		(async () => {
			const query = `query getPokemon {
				pokemon(
					  order_by: {id: asc}
				) {
					name
					id
					pokemon_species_id
					stats: pokemonstats {
						base_stat
						stat {
						name
						}
					}
					pokemonsprites {
						sprites
					}
				}
			}`;
	
			const json = await this.fetchJson("https://graphql.pokeapi.co/v1beta2", query)
			let pokemonList = json.data.pokemon;

			this.setState({
				pokemonList: pokemonList,
			});

			//PokeAPI GraphQL stores its sprites heavily nested, so we move them up the hierarchy
			for (const pokemon of pokemonList) {
				pokemon.sprites = pokemon.pokemonsprites[0].sprites;
				const {pokemonsprites, ...newPokemon} = pokemon;
			}

			let filteredPokemon = this.filterAndFormat(pokemonList);

			for (const pokemon of filteredPokemon) {
				//associate an image URL with each Pokemon
				let imageUrl = this.getImageUrl(pokemon);
				pokemon.image_url = imageUrl
			}

			//place alternate forms after base forms
			filteredPokemon.sort((a, b) => a.pokemon_species_id - b.pokemon_species_id);

			this.setState({
				pokemonList: filteredPokemon,
			});
			this.selectRandomPokemon();
		})();
	}

	fetchJson(url, query) {
		let response = fetch(url, {
			method: 'POST',
			header: {'Content-Type': 'application/json'},
			body: JSON.stringify({query})
		})
		.then(
			async (result) => {
				try {
					const response = result.json();
					return response;
				} catch (e) {
					console.error(e);
					return {};
				}
			}
		);

		return response;
	}

	filterAndFormat(originalList) {
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
				result = result && !tempName.match(/magearna-original/g);
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
				result = result && !tempName.match(/-female-mega$/g);

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
				pokemon.name = pokemon.name.replace(/male-mega$/g, 'mega');
			}
		} else {
			//filter out forms that have no artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let imageBase = value.sprites.other;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/magearna-original/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);
				result = result && !tempName.match(/-female-mega$/g);

				result = result && imageBase['official-artwork']['front_default'];

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
				pokemon.name = pokemon.name.replace(/male-mega$/g, 'mega');
			}
		}

		return filteredPokemon;
	}

	getImageUrl(pokemon) {
		let imageUrl;
	
		//PokemonDB uses jpg instead of png, but PokeAPI has more complete and up-to-date art
		if (this.state.useDBForImages) {
			imageUrl = 'https://img.pokemondb.net/artwork/' + pokemon.name + '.jpg'
		} else {
			let imageBase = pokemon.sprites.other
			imageUrl = imageBase['official-artwork']['front_default'];
		}
	
		return imageUrl;
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
		let value = stats.reduce((total, stat) => total + stat, 0);
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

		let correctness = correctnessValues.reduce((total, value) => total + value, 0) / correctnessValues.length;

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
							src={this.state.currentPokemon.image_url}
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