// Every line the mascot says (static strings, collected by scripts/voice-lines.mjs). The name comes from brand.ts.
import { MASCOT_NAME } from './brand';
/** Lines that say the mascot's name (re-clone these after a rename). */
export const NAMED = { title: `Hi! I'm ${MASCOT_NAME}. Let's play sports!` };
export const NAMED_LINES = Object.values(NAMED);
export const NUM = ['One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'];
export const COLOR_NAME: Record<string, string> = { '#ff3b6b': 'red', '#1fb6ff': 'blue', '#ffd60a': 'yellow', '#3ddc4a': 'green', '#ff9f1c': 'orange', '#9b5cff': 'purple', '#ff5fd2': 'pink' };
export const SPORT_NAME = ['Soccer!', 'Basketball!', 'Bowling!', 'Batter up!', 'Swimming!', 'Mini-golf!', 'Tennis!', 'Racing!', 'Hockey!', 'Gymnastics!', 'Let us do some painting!'];
/** Teaching moment after a win (F&L learn.ts style): Fizby names what the child practised. One per sport. */
export const FACT = ['You kicked with your feet!', 'Soft or hard, you found it!', 'Ten pins! You counted them!', 'Watch, wait, then hit!', 'Left, right, left, right!',
  'The wall can help you!', 'You watched the ball!', 'You steered left and right!', 'Pass, then shoot!', 'You remembered every move!', 'Lovely colors!'];
/** Paint: Fizby names the colour to find (single colour words come from the shared Fizby voice library). */
export const colorLine = (col: string) => `${COLOR_NAME[col][0].toUpperCase()}${COLOR_NAME[col].slice(1)}!`;
export const gateLine = (col: string) => `Drive through the ${COLOR_NAME[col]} gate!`;
export const hoopLine = (col: string) => `Shoot in the ${COLOR_NAME[col]} hoop!`;
export const L = {
  bigGame: 'Big game! The crowd is here!', book: 'A new sticker for your book!',
  ...NAMED,
  hub: 'Pick a sport!', locked: 'Ask a grown-up to open more levels for you!',
  soccerGo: 'Swipe the ball into the goal!', soccerKeeper: 'Kick it where the keeper is not!', soccerCount: 'Let us count the goals!',
  soccerLeft: 'Kick to the left goal!', soccerRight: 'Kick to the right goal!', wrongSide: 'Oops! Try the other side!',
  goal: 'Goal!', soClose: 'So close! Try again!', saved: 'The keeper caught it! Try the other side!',
  basketGo: 'Pull the ball back, then let go!', tooShort: 'Too short! Pull a little more!', tooFar: 'Too far! Pull a little less!', swish: 'Swish!', wrongHoop: 'That is a different color hoop!',
  bowlGo: 'Swipe the ball to the pins!', allDown: 'Wow, all the pins fell down!', gutter: 'Oops! Aim for the pins!', bowlLeft: 'The pins are on the left!', bowlRight: 'The pins are on the right!',
  teeGo: 'Tap when the ring hugs the ball!', teeEarly: 'Wait for the ring!', homeRun: 'Home run!', runBases: 'Now run! Tap the bases!', teeLeft: 'Hit it to the left!', teeRight: 'Hit it to the right!',
  swimGo: 'Tap to swim!', swimAlt: 'Left arm, right arm! Take turns!', left: 'Left!', right: 'Right!', splash: 'Splash! You made it!', otherArm: 'Now the other arm!',
  golfGo: 'Pull back and let go to putt!', golfBank: 'Bounce it off the wall!', holeIn: 'Yes! It went in the hole!', golfMore: 'Pull a little more!', golfLess: 'A little softer!',
  tennisGo: 'Tap the ball when it comes to you!', tennisMiss: 'Here comes another one!', rally: 'What a rally!', point: 'Point!',
  raceGo: 'Tap left or right to steer! Grab the stars!', cone: 'Bonk! Go around the cones!', finish: 'You won the race!', wrongGate: 'That gate is a different color!',
  hockeyGo: 'Swipe the puck into the net!', hockeyBank: 'Bounce it off the wall!', hockeyPass: 'Pass to your friend first!', hockeyShoot: 'Now shoot!',
  gymGo: 'Watch me first, then copy my moves!', gymYour: 'Your turn!', gymOops: 'Watch me again!', star: 'Star!', ball: 'Ball!', arms: 'Put your arms up high!', split: 'Splits!', bravo: 'Bravo!',
  paintGo: 'Pick a color, then tap the picture to paint!', paintMatch: 'Paint it to match the dots!', paintDone: 'What a beautiful picture!', paintWrong: 'Try the color on the dot!',
  yes: 'Yes!', great: 'Great job!', champ: 'You are a champion!', sticker: 'You got a sticker!', trophy: 'You won a trophy!',
  shelfHi: 'Look at your trophies and stickers!', shelfEmpty: 'Play a sport to win stickers!',
};
export function allLines(): string[] {
  const s = new Set<string>([...Object.values(L), ...NUM, ...SPORT_NAME, ...FACT]); Object.keys(COLOR_NAME).forEach(c => { s.add(hoopLine(c)); s.add(colorLine(c)); s.add(gateLine(c)); }); return [...s];
}
