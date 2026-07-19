const fs = require('fs');
const text = fs.readFileSync('src/App.tsx', 'utf-8');

const quotesStart = text.indexOf('const QUOTES: Quote[] = [');
const arrayEnd = text.indexOf('];', quotesStart);

if (quotesStart === -1) { console.log('QUOTES not found'); process.exit(1); }

const newQuotes = `const QUOTES: Quote[] = [
  { text: "Fear can hold you prisoner. Hope can set you free.", movie: "The Shawshank Redemption", year: 1994 },
  { text: "Life is like a box of chocolates. You never know what you're gonna get.", movie: "Forrest Gump", year: 1994 },
  { text: "We look up at the stars not for answers, but for beauty.", movie: "Interstellar", year: 2014 },
  { text: "You jump, I jump.", movie: "Titanic", year: 1997 },
  { text: "Even the smallest person can change the course of the future.", movie: "The Lord of the Rings", year: 2003 },
  { text: "We buy things we don't need with money we don't have.", movie: "Fight Club", year: 1999 },
  { text: "A dream is real as long as you are in it.", movie: "Inception", year: 2010 },
  { text: "Why so serious?", movie: "The Dark Knight", year: 2008 },
  { text: "Game rule: never cry no matter what.", movie: "Life is Beautiful", year: 1997 },
  { text: "Some things become different once spoken.", movie: "Drive My Car", year: 2021 },
]`

const result = text.substring(0, quotesStart) + newQuotes + text.substring(arrayEnd + 2);
fs.writeFileSync('src/App.tsx', result, 'utf-8');
console.log('Done');
