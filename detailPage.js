const urlParams = new URLSearchParams(window.location.search);
const pokemonName = urlParams.get("name");

/*
  PAGINA DETTAGLIO
  Questa pagina riceve il nome del pokemon dalla query string:
  detailPage.html?name=bulbasaur

  Da quel nome carica:
  - dati principali del pokemon;
  - statistiche;
  - dati specie;
  - prossime evoluzioni.
*/

// Mappa colori condivisa dalla UI: ogni tipo ha colore base, soft e deep.
const coloriTipo = {
    normal: { base: "#a8a77a", soft: "rgba(168, 167, 122, 0.20)", deep: "#6d6c49" },
    fire: { base: "#ee8130", soft: "rgba(238, 129, 48, 0.20)", deep: "#9b4f12" },
    water: { base: "#6390f0", soft: "rgba(99, 144, 240, 0.20)", deep: "#244a9e" },
    electric: { base: "#f7d02c", soft: "rgba(247, 208, 44, 0.22)", deep: "#8a7100" },
    grass: { base: "#7ac74c", soft: "rgba(122, 199, 76, 0.20)", deep: "#3e7a1f" },
    ice: { base: "#96d9d6", soft: "rgba(150, 217, 214, 0.22)", deep: "#2b7f7a" },
    fighting: { base: "#c22e28", soft: "rgba(194, 46, 40, 0.20)", deep: "#7b1c18" },
    poison: { base: "#a33ea1", soft: "rgba(163, 62, 161, 0.20)", deep: "#6f1e6d" },
    ground: { base: "#e2bf65", soft: "rgba(226, 191, 101, 0.24)", deep: "#8b6e2f" },
    flying: { base: "#a98ff3", soft: "rgba(169, 143, 243, 0.22)", deep: "#5e45a2" },
    psychic: { base: "#f95587", soft: "rgba(249, 85, 135, 0.22)", deep: "#a01f4a" },
    bug: { base: "#a6b91a", soft: "rgba(166, 185, 26, 0.22)", deep: "#5f6e0b" },
    rock: { base: "#b6a136", soft: "rgba(182, 161, 54, 0.22)", deep: "#6d5f1d" },
    ghost: { base: "#735797", soft: "rgba(115, 87, 151, 0.22)", deep: "#463065" },
    dragon: { base: "#6f35fc", soft: "rgba(111, 53, 252, 0.18)", deep: "#3e169e" },
    dark: { base: "#705746", soft: "rgba(112, 87, 70, 0.22)", deep: "#3e2e24" },
    steel: { base: "#b7b7ce", soft: "rgba(183, 183, 206, 0.26)", deep: "#65657c" },
    fairy: { base: "#d685ad", soft: "rgba(214, 133, 173, 0.24)", deep: "#8a3f64" }
};

function getColoriTipo(tipo) {
    return coloriTipo[tipo] || { base: "#2a75bb", soft: "rgba(42, 117, 187, 0.20)", deep: "#1a4f87" };
}

// Applica al singolo elemento le variabili CSS legate al tipo pokemon.
function applyColoriTipo(element, tipo) {
    const colori = getColoriTipo(tipo);
    element.style.setProperty("--type-color", colori.base);
    element.style.setProperty("--type-soft", colori.soft);
    element.style.setProperty("--type-deep", colori.deep);
}

// Se manca il nome nella query string, la pagina non puo mostrare i dettagli
if (!pokemonName) {
    console.error("Nessun nome di pokémon specificato nella query string.");
}

// Avvio caricamento pagina dettaglio
initDetailPage();

async function initDetailPage() {
    if (!pokemonName) {
        return;
    }

    try {
        // 1) Dati principali del pokemon selezionato
        const pokemonData = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        // La PokeAPI usa decimetri/ettogrammi: sotto convertiamo in metri/kg.
        const currentPokemonName = pokemonData.name;
        const types1 = pokemonData.types[0]?.type?.name || "";
        const types2 = pokemonData.types[1]?.type?.name;
        const officialArtwork = pokemonData.sprites.other["official-artwork"].front_default;
        const height = pokemonData.height / 10;
        const weight = pokemonData.weight / 10;

        displayPokemonDetails(currentPokemonName, types1, types2, officialArtwork, height, weight);
        renderStats(pokemonData.stats);

        // 2) Dati specie + catena evolutiva
        const speciesData = await fetchJson(pokemonData.species.url);
        const evolutionData = await fetchJson(speciesData.evolution_chain.url);

        // Prende solo le prossime evoluzioni rispetto al pokemon attuale
        const nextEvolutionStages = getNextEvolutionStages(evolutionData.chain, currentPokemonName);

        displayEvolutionChain(nextEvolutionStages);
    } catch (error) {
        console.error("Errore:", error);
    }
}

// Helper fetch con check errore HTTP
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request fallita: ${url}`);
    }
    return response.json();
}

// Render dati testuali e immagine nel pannello dettaglio
function displayPokemonDetails(pokemonNameValue, types1, types2, officialArtwork, height, weight) {
    const nameElement = document.getElementById("pokemonName");
    nameElement.textContent = pokemonNameValue;

    const imgPokemon = document.getElementById("imgPokemon");
    imgPokemon.src = officialArtwork;
    imgPokemon.alt = `Immagine di ${pokemonNameValue}`;

    const types1Element = document.getElementById("types1Element");
    types1Element.textContent = types1;
    applyColoriTipo(types1Element, types1);

    const types2Element = document.getElementById("types2Element");
    if (types2) {
        // Alcuni pokemon hanno due tipi: il secondo badge appare solo se esiste.
        types2Element.textContent = types2;
        types2Element.style.display = "block";
        applyColoriTipo(types2Element, types2);
    } else {
        types2Element.textContent = "";
        types2Element.style.display = "none";
    }

    // Accent colore generale della pagina dettagli basato sul tipo principale
    const detailsPanel = document.getElementById("details");
    const evoluzioniPanel = document.getElementById("evoluzioniContainer");
    const boxImg = document.getElementById("boxImg");
    applyColoriTipo(detailsPanel, types1);
    applyColoriTipo(evoluzioniPanel, types1);
    applyColoriTipo(boxImg, types1);

    const heightElement = document.getElementById("heightElement");
    heightElement.textContent = `Altezza: ${height} m`;

    const weightElement = document.getElementById("weightElement");
    weightElement.textContent = `Peso: ${weight} kg`;
}

// Render lista statistiche
function renderStats(stats) {
    const statsList = document.getElementById("statsList");
    statsList.replaceChildren();

    // Il fragment evita di aggiornare il DOM a ogni singola statistica.
    const fragment = document.createDocumentFragment();
    stats.forEach(element => {
        const li = document.createElement("li");
        li.textContent = `${element.stat.name}: ${element.base_stat}`;
        li.classList.add("liClassStyle");
        fragment.appendChild(li);
    });

    statsList.appendChild(fragment);
}

// Dalla catena completa evoluzioni prende max 2 step successivi
function getNextEvolutionStages(chainRoot, currentName) {
    const currentNode = findEvolutionNode(chainRoot, currentName);
    if (!currentNode) {
        return [];
    }

    const stages = [];
    let cursor = currentNode;

    // Prendiamo al massimo due evoluzioni successive per tenere la UI compatta.
    while (cursor.evolves_to && cursor.evolves_to.length > 0 && stages.length < 2) {
        const nextNode = cursor.evolves_to[0];
        stages.push({
            name: nextNode.species.name,
            speciesUrl: nextNode.species.url
        });
        cursor = nextNode;
    }

    return stages;
}

// Ricerca ricorsiva del nodo corrente nella catena evolutiva
function findEvolutionNode(node, targetName) {
    if (!node) {
        return null;
    }

    // Caso base della ricorsione: abbiamo trovato il pokemon richiesto.
    if (node.species?.name === targetName) {
        return node;
    }

    // Caso ricorsivo: controlla ogni possibile evoluzione successiva.
    for (const nextNode of node.evolves_to || []) {
        const found = findEvolutionNode(nextNode, targetName);
        if (found) {
            return found;
        }
    }

    return null;
}

// Ricava URL artwork ufficiale partendo dalla species URL (id numerico)
function getArtworkUrlFromSpeciesUrl(speciesUrl) {
    const match = speciesUrl.match(/\/pokemon-species\/(\d+)\/?$/);
    if (!match) {
        return "";
    }

    const pokemonId = match[1];
    // GitHub espone gli artwork ufficiali usando lo stesso id numerico della specie.
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

// Render card evoluzioni cliccabili
function displayEvolutionChain(evolutionStages) {
    const evoluzioniContainer = document.getElementById("evoluzioniContainer");
    evoluzioniContainer.replaceChildren();

    // Se non ci sono evoluzioni, mostra un messaggio
    if (!evolutionStages || evolutionStages.length === 0) {
        const noEvolutionText = document.createElement("p");
        noEvolutionText.classList.add("noEvolutionText");
        noEvolutionText.textContent = "Non si evolve";
        evoluzioniContainer.appendChild(noEvolutionText);
        return;
    }

    const fragment = document.createDocumentFragment();

    evolutionStages.forEach(stage => {
        // Ogni evoluzione e una card cliccabile che riapre questa pagina con un nuovo nome.
        const evolutionCard = document.createElement("div");
        evolutionCard.classList.add("evolutionCard");

        const imgEvolution = document.createElement("img");
        const artworkUrl = getArtworkUrlFromSpeciesUrl(stage.speciesUrl);
        imgEvolution.src = artworkUrl;
        imgEvolution.alt = stage.name;
        evolutionCard.appendChild(imgEvolution);

        const nameEvolution = document.createElement("p");
        nameEvolution.textContent = stage.name;
        evolutionCard.appendChild(nameEvolution);

        evolutionCard.addEventListener("click", () => {
            // Naviga ai dettagli del pokemon evoluto
            window.location.href = `detailPage.html?name=${encodeURIComponent(stage.name)}`;
        });

        fragment.appendChild(evolutionCard);
    });

    evoluzioniContainer.appendChild(fragment);
}

