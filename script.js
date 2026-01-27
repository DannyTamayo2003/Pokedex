const url = "https://pokeapi.co/api/v2/pokemon/";

//-------------------------------------
// STILI GLOBALI BODY
//-------------------------------------
document.body.style.cssText = `
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e5e7eb;
`;

//-------------------------------------
// creazione header, main, footer
//-------------------------------------
// header
const header = document.createElement("header");
header.style.cssText = `
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  background: radial-gradient(circle at top, #fbbf24, #b91c1c);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  position: sticky;
  top: 0;
  z-index: 10;
`;
document.body.appendChild(header);

// main
const main = document.createElement("main");
main.style.cssText = `
  min-height: 100vh;
  padding: 24px 16px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;
document.body.appendChild(main);

// footer
const footer = document.createElement("footer");
footer.textContent = "Pokédex demo – Full JS";
footer.style.cssText = `
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  background-color: #020617;
  color: #94a3b8;
  font-size: 0.85rem;
  border-top: 1px solid rgba(148,163,184,0.3);
`;
document.body.appendChild(footer);
//-------------------------------------


//----------------- contenuto header ---------------------
// titolo / logo
const logo = document.createElement("img");
logo.id = "logo";
logo.className = "titoloStyle";
logo.src = "immagini/International_Pokémon_logo.svg";
logo.alt = "International Pokémon logo";
logo.style.cssText = `
  width: 260px;
  max-width: 80%;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
`;
header.appendChild(logo);
//-------------------------------------


//----------------- contenuto main ----------------------

// box ricerca
const boxRicerca = document.createElement("div");
boxRicerca.style.cssText = `
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 24px;
  border-radius: 999px;
  background: rgba(15,23,42,0.85);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
`;
main.appendChild(boxRicerca);

// input di ricerca
const inputRicerca = document.createElement("input");
inputRicerca.type = "text";
inputRicerca.id = "inputRicerca";
inputRicerca.placeholder = "Cerca un Pokémon...";
inputRicerca.style.cssText = `
  flex: 1 1 220px;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.6);
  outline: none;
  font-size: 0.95rem;
  background-color: #0f172a;
  color: #e5e7eb;
  box-shadow: inset 0 0 0 1px rgba(15,23,42,0.9);
`;
boxRicerca.appendChild(inputRicerca);

// contatore pokémon trovati
const contatorePokemon = document.createElement("p");
contatorePokemon.id = "contaPok";
contatorePokemon.textContent = "0 Pokémon trovati";
contatorePokemon.style.cssText = `
  margin: 0;
  font-size: 0.9rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(30,64,175,0.25);
  color: #bfdbfe;
`;
boxRicerca.appendChild(contatorePokemon);

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

} inputRicerca.addEventListener("input", functionRicerca);
//-------------------------------------

// sezione dove mostrare le card pokémon
const boxPokemon = document.createElement("div");
boxPokemon.style.cssText = `
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 16px;
`;
main.appendChild(boxPokemon);

//-------------------------------------
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

          const name = pokemonData.name;
          const pokemonImg = pokemonData.sprites.front_default;
          const type = pokemonData.types[0].type.name;

          // card pokémon
          const cardPokemon = document.createElement("div");
          cardPokemon.dataset.name = pokemonData.name;
          cardPokemon.classList.add("cardPokemon");
          cardPokemon.style.cssText = `
                        background: radial-gradient(circle at top, #1d4ed8, #020617);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        width: 160px;
                        padding: 12px 10px;
                        border-radius: 16px;
                        box-shadow: 0 10px 22px rgba(0,0,0,0.6);
                        border: 1px solid rgba(148,163,184,0.6);
                        color: #e5e7eb;
                        text-transform: capitalize;
                        transition: transform 0.15s ease, box-shadow 0.15s ease, translate 0.15s ease;
                    `;

          // effetto hover
          cardPokemon.addEventListener("mouseenter", () => {
            cardPokemon.style.transform = "translateY(-4px) scale(1.02)";
            cardPokemon.style.boxShadow = "0 16px 30px rgba(0,0,0,0.8)";
          });
          cardPokemon.addEventListener("mouseleave", () => {
            cardPokemon.style.transform = "translateY(0) scale(1)";
            cardPokemon.style.boxShadow = "0 10px 22px rgba(0,0,0,0.6)";
          });

          boxPokemon.appendChild(cardPokemon);

          // nome pokémon
          const nomePokemon = document.createElement("h2");
          nomePokemon.textContent = name;
          nomePokemon.style.cssText = `
                        margin: 4px 0 8px;
                        font-size: 1rem;
                        letter-spacing: 0.03em;
                    `;
          cardPokemon.appendChild(nomePokemon);

          // immagine pokémon
          const imgPokemon = document.createElement("img");
          imgPokemon.src = pokemonImg;
          imgPokemon.alt = "immagine Pokemon";
          imgPokemon.style.cssText = `
                        width: 96px;
                        height: 96px;
                        image-rendering: pixelated;
                        margin-bottom: 8px;
                    `;
          cardPokemon.appendChild(imgPokemon);

          // tipo pokémon
          const tipoPokemon = document.createElement("p");
          tipoPokemon.textContent = type;
          tipoPokemon.style.cssText = `
                        margin: 0;
                        font-size: 0.85rem;
                        padding: 4px 10px;
                        border-radius: 999px;
                        background-color: rgba(15,23,42,0.8);
                        border: 1px solid rgba(148,163,184,0.7);
                    `;
          cardPokemon.appendChild(tipoPokemon);

          // evento click sulla card
          cardPokemon.addEventListener("click", () => {
            window.location.href = `https://wiki.pokemoncentral.it/${name}`;
          });

        });

      // contatore iniziale

    });
  })
  .catch(error => console.error('Errore:', error));

