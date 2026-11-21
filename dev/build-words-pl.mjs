// Odświeża listę dozwolonych słów PL ze Słownika SJP.pl do gier słownych.
// 1. Pobierz i rozpakuj sjp-RRRRMMDD.zip z https://sjp.pl/sl/growy/ (plik slowa.txt).
// 2. node dev/build-words-pl.mjs <ścieżka do slowa.txt> [nazwa wydania, np. sjp-20261101]
// Słowa dnia (answers) zostają bez zmian (kolejność wpływa na słowo dnia).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [src, edition = 'sjp'] = process.argv.slice(2);
if (!src) { console.error('Podaj ścieżkę do slowa.txt'); process.exit(1); }
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'words-pl.js');

const OK = /^[aąbcćdeęfghijklłmnńoóprsśtuwyzźż]{5}$/; // bez q, v, x
const all = new Set();
for (const line of fs.readFileSync(src, 'utf8').split(/\r?\n/)) { const w = line.trim(); if (OK.test(w)) all.add(w.toLocaleUpperCase('pl')); }

const old = fs.readFileSync(out, 'utf8');
const answers = JSON.parse(old.match(/answers:(\[[^\]]*\])/)[1]);
const missing = answers.filter(a => !all.has(a));
if (missing.length) console.warn('Słowa dnia spoza nowego słownika (zostają):', missing.join(' '));

const words = [...all].sort((a, b) => a.localeCompare(b, 'pl'));
fs.writeFileSync(out,
  `// Wygenerowane z: Słownik SJP.pl do gier słownych (${edition}), licencja CC BY 4.0, https://sjp.pl/sl/growy/\n` +
  `// answers: słowa dnia (wybrane ręcznie), allowed: wszystkie 5-literowe słowa z SJP (bez Q, V, X), rozdzielone spacją.\n` +
  `window.WORDS_PL={answers:${JSON.stringify(answers)},\nallowed:"${words.join(' ')}"};\n`);
console.log('dozwolone:', words.length, 'słowa dnia:', answers.length);

// Ta sama lista dla serwera (słowo dnia i sprawdzanie prób w Workerze, repo mafia obok).
const srv = path.join(path.dirname(out), '..', '..', 'mafia', 'worker', 'src', 'wordle', 'words-pl.js');
if (fs.existsSync(path.dirname(srv))) {
  fs.writeFileSync(srv,
    `// Wygenerowane przez wordle/dev/build-words-pl.mjs – nie edytuj ręcznie. Źródło: Słownik SJP.pl do gier słownych (${edition}), CC BY 4.0.\n` +
    `export const ANSWERS = ${JSON.stringify(answers)};\nexport const ALLOWED = "${words.join(' ')}";\n`);
  console.log('zapisano też', srv);
} else console.warn('Brak repo mafia obok – pomijam listę dla serwera:', srv);
