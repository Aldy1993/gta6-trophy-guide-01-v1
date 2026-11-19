[![make.fun — gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Aldy1993/gta6-trophy-guide-01-v1/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Aldy1993/gta6-trophy-guide-01-v1/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# LEONIDA LEDGER — GTA VI Trophy Guide

**LEONIDA LEDGER — GTA 6 trophy guide: all 55 trophies, cited own-words guides, 7-stage platinum roadmap, missable watchlist, offline tracker**

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** — official names, descriptions and grades exactly as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation).
- **A cited guide for every trophy**, written in our own words. Each guide names its source beside it (mainly the OutputLag GTA 6 trophy list and GGRecon's list). Five trophies had no confirmed method at launch — their guides say so instead of guessing.
- **7-stage platinum roadmap** built from the official descriptions: chapters and missions in story order, post-game cleanup, then 100% completion.
- **Missable watchlist** — exactly 1 trophy can be missed (Positive Mental Attitude: Lucia's Chapter 1 balcony meditation), with the save rules that protect the whole run (no mission replay, no New Game Plus).
- **Tracker** — checklist saved in localStorage, export to file / import back, filters (story, missable, collectibles, activities, online — 0 online trophies, the whole list is single-player), and a spoiler mode that hides story trophies until earned.
- **Offline** — static files under `app/`, no build step, no network requests at run time, no Rockstar logo or official artwork. First load is 3 files, ~8.4 kB gzip.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
