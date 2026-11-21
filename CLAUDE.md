# CLAUDE.md

Zawsze odpowiadaj po polsku. Teksty UI i komentarze po polsku.

## Projekt

Wordle (PL/EN) w lobby PL3Y: `https://pl3y.pl/wordle/` (repo `egozaur/wordle`, GitHub Pages). Czysty HTML/CSS/JS, bez frameworka i bez builda. Lobby (`egozaur/egozaur.github.io`) wpisuje grę w tablicę `GAMES`; nie edytuj lobby z tego repo.

- `index.html` – bramka `/auth.js` w `<head>`, meta aplikacji (manifest, noindex), link „← PL3Y” widoczny tylko w trybie standalone.
- `app.js` – cała logika: słowo dnia (stała, przetasowana kolejność `seed` + numer dnia), tryb „Graj dalej” (nie wlicza się do statystyk), klawiatura PL z ą/ć/ę/ł/ń/ó/ś/ź/ż, tryb trudny, udostępnianie, statystyki w `localStorage` (`wordle:*`).
- `data/words-pl.js`, `data/words-en.js` – `answers` (po 100 słów 5-literowych) i `allowed` (dozwolone próby). Zmiana kolejności lub liczby `answers` zmienia słowo dnia.
- Dłuższe słowa: `AVAILABLE_LENGTHS` w `app.js` (teraz tylko 5); dla 6 i 7 liter trzeba dodać osobne listy słów.
- Lokalnie: `python3 -m http.server 8088` i `http://localhost:8088`.
