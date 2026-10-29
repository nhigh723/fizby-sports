// Every line the mascot says (static strings, collected by scripts/voice-lines.mjs). The name comes from brand.ts.
import { MASCOT_NAME } from './brand';
/** Lines that say the mascot's name (re-clone these after a rename). */
export const NAMED = { title: `Hi! I'm ${MASCOT_NAME}. Let's play sports!` };
export const NAMED_LINES = Object.values(NAMED);
export const NUM = ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'];
export const COLOR_NAME: Record<string, string> = { '#ff3b6b': 'red', '#1fb6ff': 'blue', '#ffd60a': 'yellow', '#3ddc4a': 'green' };
export const SPORT_NAME = ['Soccer!', 'Basketball!', 'Bowling!'];
export const hoopLine = (col: string) => `Shoot in the ${COLOR_NAME[col]} hoop!`;
export const L = {
  ...NAMED,
  hub: 'Pick a sport!', locked: 'Ask a grown-up to open more levels!',
  soccerGo: 'Swipe the ball into the goal!', soccerKeeper: 'Kick it where the keeper is not!', soccerCount: 'Let us count the goals!',
  soccerLeft: 'Kick to the left goal!', soccerRight: 'Kick to the right goal!', wrongSide: 'Oops, other side!',
  goal: 'Goal!', soClose: 'So close! Try again!', saved: 'The keeper caught it! Try the other side!',
  basketGo: 'Pull the ball back, then let go!', tooShort: 'Too short! Pull a little more!', tooFar: 'Too far! Pull a little less!', swish: 'Swish!', wrongHoop: 'That is a different color hoop!',
  bowlGo: 'Swipe the ball to the pins!', allDown: 'All the pins fell down!', gutter: 'Oops! Aim for the pins!', bowlLeft: 'The pins are on the left!', bowlRight: 'The pins are on the right!',
  yes: 'Yes!', great: 'Great job!', champ: 'You are a champion!', sticker: 'You got a sticker!', trophy: 'You won a trophy!',
  shelfHi: 'Look at your trophies and stickers!', shelfEmpty: 'Play a sport to win stickers!',
};
export function allLines(): string[] {
  const s = new Set<string>([...Object.values(L), ...NUM, ...SPORT_NAME]); Object.keys(COLOR_NAME).forEach(c => s.add(hoopLine(c))); return [...s];
}
