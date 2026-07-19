import fs from 'fs';

// Fix gen.mjs - add import and replace QUOTES block
let g = fs.readFileSync('scripts/gen.mjs', 'utf-8');
g = g.replace(
  "sec(`import { fetchGenres, fetchDiscover, fetchTrending, fetchMovieDetail, tmdbImgUrl, tmdbToMovieMinimal, enrichMovieWithDetail } from './api/tmdb'`)",
  "sec(`import { fetchGenres, fetchDiscover, fetchTrending, fetchMovieDetail, tmdbImgUrl, tmdbToMovieMinimal, enrichMovieWithDetail } from './api/tmdb'`)\nsec(`import quotes from './data/quotes.json'`)"
);
g = g.replace(
  "const QUOTES: Quote[] = [",
  "const QUOTES: Quote[] = quotes;"
);
// Remove the old quote entries before the ] closes
const a = g.indexOf("const QUOTES: Quote[] = quotes;");
const b = g.indexOf("`);", a);
if (a >= 0 && b >= 0) {
  // The block from 'const QUOTES...' to '`);' might include the old entries
  // Find the first ` after const QUOTES
  const backtickStart = g.indexOf("`", a) + 1;
  const backtickEnd = g.indexOf("`", backtickStart);
  if (backtickStart > 0 && backtickEnd > backtickStart) {
    const oldContent = g.substring(backtickStart, backtickEnd);
    // Replace old content between backticks
    g = g.substring(0, backtickStart) + "const QUOTES: Quote[] = quotes" + g.substring(backtickEnd);
  }
}
fs.writeFileSync('scripts/gen.mjs', g, 'utf-8');
console.log('gen.mjs fixed');

// Fix App.tsx - add import and replace QUOTES
let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(
  "import { fetchGenres, fetchDiscover, fetchTrending, fetchMovieDetail, tmdbImgUrl, tmdbToMovieMinimal, enrichMovieWithDetail } from './api/tmdb'",
  "import { fetchGenres, fetchDiscover, fetchTrending, fetchMovieDetail, tmdbImgUrl, tmdbToMovieMinimal, enrichMovieWithDetail } from './api/tmdb'\nimport quotes from './data/quotes.json'"
);
// Remove old QUOTES array
const qs = c.indexOf("const QUOTES: Quote[] = [");
const qe = c.indexOf("];", qs) + 2;
if (qs >= 0 && qe >= 2) {
  c = c.substring(0, qs) + "const QUOTES: Quote[] = quotes;\n" + c.substring(qe);
}
fs.writeFileSync('src/App.tsx', c, 'utf-8');
console.log('App.tsx fixed');

// Build
import { execSync } from 'child_process';
const r = execSync('npx vite build 2>&1', {encoding:'utf-8', cwd: '.'});
console.log(r.split('\n').filter(l => l.includes('transformed') || l.includes('built') || l.includes('error')).join('\n'));
