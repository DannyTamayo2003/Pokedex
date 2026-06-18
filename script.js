const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const API_TYPE_BASE_URL = "https://pokeapi.co/api/v2/type";
const BATCH_SIZE = 20;

/*
  HOME PAGE
  Questo file gestisce la griglia principale del Pokedex:
  - scarica i pokemon dalla PokeAPI;
  - crea filtri per tipo;
  - applica la ricerca testuale;
  - apre la pagina dettaglio quando clicchi una card.
*/

// Riferimenti agli elementi HTML della home
const inputRicerca = document.getElementById("inputRicerca");
const contatorePokemon = document.getElementById("contaPokemon");
const boxCategorie = document.getElementById("boxCategorie");
const boxPokemon = document.getElementById("boxPokemon");
const loadMoreButton = document.getElementById("loadMoreButton");

// Cache in memoria: evita di scaricare due volte lo stesso pokemon.
const pokemonCache = new Map();

// Stato della vista generale ("tutti i pokemon").
const allPokemonLoaded = [];
const allPokemonLoadedNames = new Set();

// Stato di ogni filtro per tipo: lista completa + quanti pokemon sono gia visibili.
const typeStateMap = new Map();

// Stato UI corrente: usato per sapere se siamo in filtro, paginazione o caricamento.
let tipoSelezionato = "";
let allOffset = 0;
let allTotal = 0;
let isLoading = false;

// Simboli usati nelle icone dei tipi
const simboliTipo = {
  normal: "◯",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🌿",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "⛰️",
  flying: "🪽",
  psychic: "🔮",
  bug: "🪲",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌑",
  steel: "⚙️",
  fairy: "✨"
};

// Colori tema per tipo pokemon (usati in card e filtri)
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

// Scrive i colori del tipo dentro variabili CSS riusabili dal foglio di stile.
function applyColoriTipo(element, tipo) {
  const colori = getColoriTipo(tipo);
  element.style.setProperty("--type-color", colori.base);
  element.style.setProperty("--type-soft", colori.soft);
  element.style.setProperty("--type-deep", colori.deep);
}

// Estrae il nome pokemon dalla URL PokéAPI
function extractNameFromUrl(url) {
  const cleanedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  return cleanedUrl.split("/").pop();
}

// Ritorna i dettagli pokemon usando cache locale
async function getPokemonDetailByUrl(url) {
  const name = extractNameFromUrl(url);

  if (pokemonCache.has(name)) {
    return pokemonCache.get(name);
  }

  const response = await fetch(url);
  const data = await response.json();
  pokemonCache.set(data.name, data);
  return data;
}

// Crea tutte le icone categoria nella home
function creaCardCategorie() {
  boxCategorie.innerHTML = "";

  // Ordine alfabetico: la UI resta stabile a ogni caricamento della pagina.
  const tipi = Object.keys(simboliTipo).sort((a, b) => a.localeCompare(b));

  tipi.forEach(tipo => {
    const cardCategoria = document.createElement("div");
    cardCategoria.classList.add("cardCategoria");
    cardCategoria.dataset.type = tipo;
    cardCategoria.title = tipo;
    cardCategoria.setAttribute("aria-label", tipo);
    applyColoriTipo(cardCategoria, tipo);

    const iconCategoria = document.createElement("span");
    iconCategoria.classList.add("categoryIcon");
    iconCategoria.textContent = simboliTipo[tipo];
    cardCategoria.appendChild(iconCategoria);

    const nomeCategoria = document.createElement("span");
    nomeCategoria.classList.add("srOnly");
    nomeCategoria.textContent = tipo;
    cardCategoria.appendChild(nomeCategoria);

    cardCategoria.addEventListener("click", () => {
      onClickCategoria(tipo);
    });

    boxCategorie.appendChild(cardCategoria);
  });
}

// Evidenzia graficamente la categoria attualmente selezionata
function setCategoriaAttiva() {
  const allCards = document.querySelectorAll(".cardCategoria");

  allCards.forEach(card => {
    if (card.dataset.type === tipoSelezionato) {
      card.classList.add("is-active");
    } else {
      card.classList.remove("is-active");
    }
  });
}

// Al primo click su un tipo, scarica la lista completa pokemon di quel tipo
async function initializeTypeState(tipo) {
  if (!typeStateMap.has(tipo)) {
    const response = await fetch(`${API_TYPE_BASE_URL}/${tipo}`);
    const data = await response.json();

    // La risposta del tipo contiene oggetti annidati: qui teniamo solo nome + url.
    const entries = data.pokemon.map(item => item.pokemon);
    typeStateMap.set(tipo, {
      entries,
      loadedCount: 0,
      loadedPokemon: []
    });
  }
}

// Quando entri in un tipo, riparti da zero con il suo caricamento paginato
function resetTypeLoadedData(tipo) {
  const typeState = typeStateMap.get(tipo);
  if (!typeState) {
    return;
  }

  typeState.loadedCount = 0;
  typeState.loadedPokemon = [];
}

// Carica 20 pokemon della vista generale (senza filtro tipo)
async function caricaPokemonBatchAll() {
  if (isLoading) {
    return;
  }

  isLoading = true;
  aggiornaStatoPulsante();

  try {
    const response = await fetch(`${API_BASE_URL}?offset=${allOffset}&limit=${BATCH_SIZE}`);
    const data = await response.json();

    allTotal = data.count;

    // La lista base non contiene immagini/tipi, quindi servono fetch di dettaglio.
    const detailPromises = data.results.map(async pokemon => getPokemonDetailByUrl(pokemon.url));
    const pokemonDetails = await Promise.all(detailPromises);

    pokemonDetails.forEach(pokemonData => {
      if (allPokemonLoadedNames.has(pokemonData.name)) {
        return;
      }

      allPokemonLoadedNames.add(pokemonData.name);
      allPokemonLoaded.push(pokemonData);
    });

    allOffset += data.results.length;

    if (!tipoSelezionato) {
      renderListaPokemon(allPokemonLoaded);
    }
  } catch (error) {
    console.error("Errore:", error);
  } finally {
    isLoading = false;
    aggiornaStatoPulsante();
  }
}

// Carica 20 pokemon del tipo selezionato.
async function caricaPokemonBatchTipo(tipo) {
  if (isLoading) {
    return;
  }

  const typeState = typeStateMap.get(tipo);
  if (!typeState) {
    return;
  }

  if (typeState.loadedCount >= typeState.entries.length) {
    aggiornaStatoPulsante();
    return;
  }

  isLoading = true;
  aggiornaStatoPulsante();

  try {
    const nuoviPokemon = [];

    // Carica finché non ottieni 20 pokemon del tipo principale selezionato
    while (nuoviPokemon.length < BATCH_SIZE && typeState.loadedCount < typeState.entries.length) {
      const start = typeState.loadedCount;
      const end = start + BATCH_SIZE;
      const nextEntries = typeState.entries.slice(start, end);

      const detailPromises = nextEntries.map(async entry => getPokemonDetailByUrl(entry.url));
      const pokemonDetails = await Promise.all(detailPromises);

      typeState.loadedCount += nextEntries.length;

      pokemonDetails.forEach(pokemonData => {
        // Scelta di progetto: mostriamo solo pokemon con questo tipo come tipo principale.
        const tipoPrincipale = pokemonData.types[0].type.name;
        if (tipoPrincipale === tipo) {
          nuoviPokemon.push(pokemonData);
        }
      });
    }

    typeState.loadedPokemon = typeState.loadedPokemon.concat(nuoviPokemon);

    if (tipoSelezionato === tipo) {
      renderListaPokemon(typeState.loadedPokemon);
    }
  } catch (error) {
    console.error("Errore:", error);
  } finally {
    isLoading = false;
    aggiornaStatoPulsante();
  }
}

// Gestione click sulle categorie
// - click su categoria nuova: apre quel filtro
// - click su categoria attiva: torna alla vista generale
async function onClickCategoria(tipo) {
  if (isLoading) {
    return;
  }

  if (tipoSelezionato === tipo) {
    tipoSelezionato = "";
    setCategoriaAttiva();
    renderListaPokemon(allPokemonLoaded);
    aggiornaStatoPulsante();
    return;
  }

  tipoSelezionato = tipo;
  setCategoriaAttiva();

  try {
    // Prepara il filtro, svuota la griglia e carica il primo gruppo filtrato.
    await initializeTypeState(tipo);
    resetTypeLoadedData(tipo);
    renderListaPokemon([]);
    await caricaPokemonBatchTipo(tipo);
  } catch (error) {
    console.error("Errore:", error);
    renderListaPokemon([]);
    aggiornaStatoPulsante();
  }
}

// Renderizza la lista ricevuta dentro la griglia
function renderListaPokemon(listaPokemon) {
  boxPokemon.innerHTML = "";

  listaPokemon.forEach(pokemonData => {
    creaCardPokemon(pokemonData);
  });

  applyRicerca();
}

// Mostra/nasconde il messaggio "nessun risultato"
function aggiornaEmptyState(count) {
  const existingEmptyState = document.getElementById("emptyState");

  if (count > 0) {
    if (existingEmptyState) {
      existingEmptyState.remove();
    }
    return;
  }

  if (existingEmptyState) {
    return;
  }

  const emptyState = document.createElement("p");
  emptyState.id = "emptyState";
  emptyState.classList.add("emptyState");
  emptyState.textContent = "Nessun Pokémon trovato con i filtri attuali.";
  boxPokemon.appendChild(emptyState);
}

// Filtra solo per testo della ricerca sui pokemon attualmente renderizzati
function applyRicerca() {
  const valore = inputRicerca.value.toLowerCase();
  const allCards = document.querySelectorAll(".cardPokemon");
  let count = 0;

  allCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();

    if (name.includes(valore)) {
      card.style.display = "flex";
      count++;
    } else {
      card.style.display = "none";
    }
  });

  contatorePokemon.textContent = `${count} Pokémon trovati`;
  aggiornaEmptyState(count);
}

// Crea una card pokemon nella griglia
function creaCardPokemon(pokemonData) {
  const name = pokemonData.name;
  const pokemonImg = pokemonData.sprites.front_default;
  const type = pokemonData.types[0].type.name;

  const cardPokemon = document.createElement("div");
  cardPokemon.dataset.name = name;
  cardPokemon.dataset.type = type;
  cardPokemon.classList.add("cardPokemon");
  applyColoriTipo(cardPokemon, type);

  boxPokemon.appendChild(cardPokemon);

  const nomePokemon = document.createElement("h2");
  nomePokemon.textContent = name;
  nomePokemon.classList.add("pokemonName");
  cardPokemon.appendChild(nomePokemon);

  const imgPokemon = document.createElement("img");
  imgPokemon.src = pokemonImg;
  imgPokemon.alt = "immagine Pokemon";
  imgPokemon.classList.add("pokemonImg");
  cardPokemon.appendChild(imgPokemon);

  const tipoPokemon = document.createElement("p");
  tipoPokemon.textContent = type;
  tipoPokemon.classList.add("pokemonType");
  applyColoriTipo(tipoPokemon, type);
  cardPokemon.appendChild(tipoPokemon);

  cardPokemon.addEventListener("click", () => {
    // encodeURIComponent protegge la URL da eventuali caratteri speciali nel nome.
    window.location.href = `detailPage.html?name=${encodeURIComponent(name)}`;
  });
}

// Aggiorna stato del pulsante "Carica altri" in base al contesto corrente.
function aggiornaStatoPulsante() {
  if (!loadMoreButton) {
    return;
  }

  if (isLoading) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Caricamento...";
    return;
  }

  if (!tipoSelezionato) {
    if (allTotal > 0 && allOffset >= allTotal) {
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = "Hai visto tutti i Pokémon";
      return;
    }

    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Carica altri 20";
    return;
  }

  const typeState = typeStateMap.get(tipoSelezionato);
  if (!typeState) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Caricamento...";
    return;
  }

  if (typeState.entries.length === 0) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Nessun Pokémon per questo tipo";
    return;
  }

  if (typeState.loadedCount >= typeState.entries.length) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Fine categoria";
    return;
  }

  loadMoreButton.disabled = false;
  loadMoreButton.textContent = "Carica altri 20";
}

// Click su "Carica altri": decide se caricare vista generale o filtro tipo
async function onClickCaricaAltri() {
  if (tipoSelezionato) {
    await caricaPokemonBatchTipo(tipoSelezionato);
    return;
  }

  await caricaPokemonBatchAll();
}

function functionRicerca() {
  applyRicerca();
}

// Eventi principali della home
inputRicerca.addEventListener("input", functionRicerca);
loadMoreButton.addEventListener("click", onClickCaricaAltri);

// Bootstrap pagina
creaCardCategorie();
caricaPokemonBatchAll();
