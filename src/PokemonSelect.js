import React from "react";

export default class PokemonSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let usedIds = [];

        return (
            <select
                id="pokemon-select"
                value={this.props.value}
                onChange={this.props.onChange}
            >
                {this.props.pokemonList.map(pokemon => {
                    //alternate forms are differentiated by an indent
                    let indent = '';
                    if (usedIds.includes(pokemon.species.id)) {
                        indent = '\xA0\xA0\xA0';
                    } else {
                        usedIds.push(pokemon.species.id);
                    }

                    //capitalize first letter of pokemon's name
                    let fixedName = pokemon.name.replace(/(^\w{1})|(-\w{1})/g, letter => letter.toUpperCase());

                    //fix specific pokemon names with non-alphanumeric characters that don't appear in the api
                    fixedName = fixedName.replace(/fetchd/g, 'fetch\'d');
                    fixedName = fixedName.replace(/Mr-/g, 'Mr. ');
                    fixedName = fixedName.replace(/-Jr/g, ' Jr.');
                    fixedName = fixedName.replace(/Flabebe/g, 'Flab\xE9b\xE9');
                    fixedName = fixedName.replace(/Type-/g, 'Type: ');
                    fixedName = fixedName.replace(/mo-O/g, 'mo-o');
                    fixedName = fixedName.replace(/Tapu-/g, 'Tapu ');
                    fixedName = fixedName.replace(/-10/g, '-10%');
                    fixedName = fixedName.replace(/-50/g, '-50%');
                    fixedName = fixedName.replace(/-Pau/g, '-Pa\'u');
                    fixedName = fixedName.replace(/Great-/g, 'Great ');
                    fixedName = fixedName.replace(/Scream-/g, 'Scream ');
                    fixedName = fixedName.replace(/Brute-/g, 'Brute ');
                    fixedName = fixedName.replace(/Flutter-/g, 'Flutter ');
                    fixedName = fixedName.replace(/Slither-/g, 'Slither ');
                    fixedName = fixedName.replace(/Sandy-/g, 'Sandy ');
                    fixedName = fixedName.replace(/Roaring-/g, 'Roaring ');
                    fixedName = fixedName.replace(/Walking-/g, 'Walking ');
                    fixedName = fixedName.replace(/Gouging-/g, 'Gouging ');
                    fixedName = fixedName.replace(/Raging-/g, 'Raging ');
                    fixedName = fixedName.replace(/Iron-/g, 'Iron ');

                    return (
                        <option 
                            key={pokemon.id} 
                            value={pokemon.name}
                        >
                            {indent}#{pokemon.species.id}: {fixedName}
                        </option>
                    )
                })}
            </select>
        );
    }
}