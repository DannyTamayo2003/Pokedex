# Pokédex 2.0

A web app built with vanilla JavaScript that lets you browse, search and filter Pokémon using the [PokéAPI](https://pokeapi.co/).

## Features

**Home page**
- Grid of Pokémon cards loaded in batches of 20 with a "Load more" button
- Real-time search by name
- Filter by type (18 types with SVG icons) — click a type to filter, click again to clear
- Pokémon count shown live as you search

**Detail page**
- Official artwork
- Type badges with per-type color theming
- Base stats, height and weight
- Evolution stage badge (Stage 1 / 2 / 3)
- Full evolution chain — shows both previous and next stages as clickable cards

## Tech stack

- HTML, CSS, vanilla JavaScript — no frameworks or build tools
- [PokéAPI](https://pokeapi.co/) for all Pokémon data
- In-memory cache to avoid duplicate fetches

## How to run

Open `index.html` in a browser. No install or build step needed.

## Live demo

[https://dannytamayo2003.github.io/Pokedex/](https://dannytamayo2003.github.io/Pokedex/)
