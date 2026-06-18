const urlParams = new URLSearchParams(window.location.search);
const pokemonName = urlParams.get('name');
const URLspecificPokemon = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
console.log("Nome del pokémon richiesto:", URLspecificPokemon);

if (!pokemonName) {
    console.error('Nessun nome di pokémon specificato nella query string.');
    // Optionally, you could redirect the user or display a message on the page
}

// fetch API PokéAPI per il pokémon specifico
fetch(URLspecificPokemon)

    .then(response => response.json())
    .then(pokemonData => {
        console.log(pokemonData);

        //nome pokémon, tipo e immagine ufficiale
        const pokemonName = pokemonData.name;
        const types1 = pokemonData.types[0].type.name;// Prende il primo tipo del pokémon
        const types2 = pokemonData.types[1].type.name;// Prende il secondo tipo del pokémon (se esiste)
        const officialArtwork = pokemonData.sprites.other['official-artwork'].front_default;
        const height = pokemonData.height / 10; // Converti decimetri in metri
        const weight = pokemonData.weight / 10; // Converti ettogrammi in chilogrammi

        //statistiche del pokémon
        pokemonData.stats.forEach(element => {
            console.log(element.stat.name, element.base_stat);
            const statName = element.stat.name;
            const statValue = element.base_stat;

            statistichePokemon(statName, statValue);

        });

        displayPokemonDetails(pokemonName, types1, types2, officialArtwork, height, weight);


        console.log("URL della specie del pokémon:", pokemonData.species.url);
        const URLspecies = pokemonData.species.url;
        fetch(URLspecies)
            .then(response => response.json())
            .then(speciesData => {
                console.log(speciesData.evolution_chain.url);
                const URevolutionChain = speciesData.evolution_chain.url;
                fetch(URevolutionChain)
                    .then(response => response.json())
                    .then(evolutionData => {

                        const evolutionChain = evolutionData.chain;
                        console.log(evolutionChain.evolves_to[0].evolves_to[0]);

                        const evoltion2 = evolutionChain.evolves_to[0].species.name;
                        console.log(evoltion2);

                        const evoltion3 = evolutionChain.evolves_to[0].evolves_to[0].species.name;
                        console.log(evoltion3);

                        displayEvolutionChain(evoltion2, evoltion3);

                    })
                    .catch(error => console.error('Errore:', error));
                // Qui puoi elaborare i dati dell'evoluzione come preferisci


            })
            .catch(error => console.error('Errore:', error));


    })



    .catch(error => console.error('Errore:', error));


function displayPokemonDetails(pokemonName, types1, types2, officialArtwork, height, weight) {

    // Imposta il nome del pokémon  
    const nameElement = document.getElementById('pokemonName');
    nameElement.textContent = pokemonName;

    // Imposta l'immagine del pokémon
    const imgPokemon = document.getElementById('imgPokemon');
    imgPokemon.src = officialArtwork;
    imgPokemon.alt = `Immagine di ${pokemonName}`;

    // Puoi aggiungere ulteriori dettagli del pokémon qui, ad esempio tipi, abilità, statistiche, ecc.
    const types1Element = document.getElementById('types1Element');
    types1Element.textContent = types1;

    const types2Element = document.getElementById('types2Element');
    types2Element.textContent = types2;

    if (!types2) {
        types2Element.style.display = 'none'; // Nascondi l'elemento se non c'è un secondo tipo
    }

    const heightElement = document.getElementById('heightElement');
    heightElement.textContent = `Altezza: ${height} m`;

    const weightElement = document.getElementById('weightElement');
    weightElement.textContent = `Peso: ${weight} kg`;


}

function statistichePokemon(statName, statValue) {
    const statsList = document.getElementById('statsList');
    const li = document.createElement('li');
    li.textContent = `${statName}: ${statValue}`;
    li.classList.add('liClassStyle'); // Aggiungi la classe CSS per rimuovere i bullet points
    statsList.appendChild(li);
}

function displayEvolutionChain(evoltion2, evoltion3) {
    console.log("QuestA evolutionChain:", evoltion2, evoltion3);
}

