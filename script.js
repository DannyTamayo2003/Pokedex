//url full pokemon "https://pokeapi.co/api/v2/pokemon?offset=0&limit=2000"

const url = "https://pokeapi.co/api/v2/pokemon/";

const inputRicerca = document.getElementById("inputRicerca");
const contatorePokemon = document.getElementById("contaPokemon");
const boxPokemon = document.getElementById("boxPokemon");

// fetch API PokéAPI + creazione card pokémon
fetch(url)
  .then(response => response.json())
  .then(data => {

    let conteggioIniziale = data.results.length;
    console.log("Numero totale di pokémon:", conteggioIniziale);
    contatorePokemon.textContent = `${conteggioIniziale} Pokémon trovati`;

    data.results.forEach(pokemon => {

      fetch(pokemon.url)
        .then(response => response.json())
        .then(pokemonData => {
          console.log(pokemonData);

          creaCardPokemon(pokemonData);

        });

      // contatore iniziale

    });
  })
  .catch(error => console.error('Errore:', error));
//-------------------------------------

// crea card pokémon usando i dati della fetch
function creaCardPokemon(pokemonData) {
  const name = pokemonData.name;
  const pokemonImg = pokemonData.sprites.front_default;
  const type = pokemonData.types[0].type.name;

  // card pokémon
  const cardPokemon = document.createElement("div");
  cardPokemon.dataset.name = name;
  cardPokemon.classList.add("cardPokemon");

  boxPokemon.appendChild(cardPokemon);

  // nome pokémon
  const nomePokemon = document.createElement("h2");
  nomePokemon.textContent = name;
  nomePokemon.classList.add("pokemonName");
  cardPokemon.appendChild(nomePokemon);

  // immagine pokémon
  const imgPokemon = document.createElement("img");
  imgPokemon.src = pokemonImg;
  imgPokemon.alt = "immagine Pokemon";
  imgPokemon.classList.add("pokemonImg");
  cardPokemon.appendChild(imgPokemon);

  // tipo pokémon
  const tipoPokemon = document.createElement("p");
  tipoPokemon.textContent = type;
  tipoPokemon.classList.add("pokemonType");
  cardPokemon.appendChild(tipoPokemon);

  // evento click sulla card
  cardPokemon.addEventListener("click", () => {
    window.location.href = `detailPage.html?name=${name}`;
  });
}
//-------------------------------------

// funzione di ricerca pokémon
function functionRicerca() {
  const valore = inputRicerca.value.toLowerCase();

  // tutte le card pokémon
  const allCards = document.querySelectorAll(".cardPokemon");

  // contatore trovati
  let count = 0;

  // ciclo su tutte le card
  allCards.forEach(card => {
    const nameCardPokemon = card.dataset.name.toLowerCase();

    if (nameCardPokemon.includes(valore)) {
      card.style.display = "flex";
      count++;
    } else {
      card.style.display = "none";
    }
  });

  contatorePokemon.textContent = `${count} Pokémon trovati`;

}
inputRicerca.addEventListener("input", functionRicerca);
//-------------------------------------