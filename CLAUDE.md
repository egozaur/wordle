# CLAUDE.md

Zawsze odpowiadaj po polsku. Teksty UI i komentarze po polsku.

## Projekt

Wordle (PL/EN) w lobby PL3Y: `https://pl3y.pl/wordle/` (repo `egozaur/wordle`, GitHub Pages). Czysty HTML/CSS/JS, bez frameworka i bez builda. Lobby (`egozaur/egozaur.github.io`) wpisuje grę w tablicę `GAMES`; nie edytuj lobby z tego repo.

- `index.html` – bramka `/auth.js` w `<head>`, meta aplikacji (manifest, noindex), link „← PL3Y” widoczny tylko w trybie standalone.
- `app.js` – cała logika: słowo dnia (stała, przetasowana kolejność `seed` + numer dnia), tryb „Graj dalej” (nie wlicza się do statystyk), klawiatura PL z ą/ć/ę/ł/ń/ó/ś/ź/ż, tryb trudny, udostępnianie, statystyki w `localStorage` (`wordle:*`).
- `data/words-pl.js`, `data/words-en.js` – `answers` (słowa dnia) i `allowed` (dozwolone próby: tablica albo jeden napis rozdzielony spacjami). Zmiana kolejności lub liczby `answers` zmienia słowo dnia.
  - PL: `allowed` = wszystkie 5-literowe słowa ze **Słownika SJP.pl do gier słownych** (licencja CC BY 4.0, informacja o źródle w „Jak grać”; ~28,6 tys. słów, bez Q/V/X), `answers` = ~420 popularnych rzeczowników w mianowniku wybranych ręcznie. Plik jest generowany skryptem `dev/build-words-pl.mjs <slowa.txt>` (instrukcja w pliku); nie edytuj `allowed` ręcznie.
  - `dict(lang)` buduje `Set` ze słownika przy pierwszym użyciu (nie używaj `includes` na liście).
- Autokorekta ogonków (`fold`, `variants` w `app.js`): słowo spoza słownika z jednym wariantem z ogonkami jest poprawiane (ZOLTY → ŻÓŁTY), z kilkoma wariantami gracz wybiera z listy (`chooseVariant`). Słowo bez ogonków, które istnieje, ale nie jest słowem dnia, a ma popularny wariant z ogonkami (LODKA / ŁÓDKA), też otwiera wybór.
- **Słowo dnia PL na serwerze** (na pl3y.pl, gdy jest `/auth.js` z graczami): `startServerDaily()` wymaga gracza (nick + PIN, `PL3Y.player.ask()`), stan i próby idą do `POST /api/wd/state|guess` (`srv()`), kolory przychodzą z serwera (`G.results`, `resOf(i)`), słowo dopiero po końcu gry. Ranking: `GET /api/wd/rank` (`openRanking`, link „Ranking” na starcie, przycisk po grze). Serwer: `mafia/worker/src/wordle/daily.js`. Lokalnie (bez `/auth.js`) i w wersji EN słowo dnia liczy przeglądarka jak dawniej (`dailyWord`). `dev/build-words-pl.mjs` zapisuje tę samą listę także do `../mafia/worker/src/wordle/words-pl.js` (po zmianie listy commit w obu repo).
- Wygląd PL3Y: tokeny z `/pl3y.css?v=1` (z wartościami zapasowymi), domyślnie ciemny motyw (migracja `settings.v = 2`), jasny = ciepły papier.
- Klawiatura PL: normalny układ QWERTY, Q/V/X wyszarzone (`off`), rząd ą ć ę ł ń ó ś ź ż na dole (`extraRow`).
- Dłuższe słowa: `AVAILABLE_LENGTHS` w `app.js` (teraz tylko 5); dla 6 i 7 liter trzeba dodać osobne listy słów.
- Lokalnie: `python3 -m http.server 8088` i `http://localhost:8088`.
