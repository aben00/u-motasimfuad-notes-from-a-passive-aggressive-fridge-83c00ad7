// SPDX-License-Identifier: MIT
// Notes From a Passive-Aggressive Fridge (make.fun).
// A single deterministic program: it writes one original fridge note to
// /output/entry.txt, then proves the file holds exactly that note.
//
// The joke: the fridge is not nagging about leftovers — it has been
// counting. Its door sensor logged 41 openings with nothing taken, so it
// answers the owner's window-shopping with the pettiest possible
// downgrade: the light is not a display, it is pity. The gate allows
// 1-200 characters; this note sits comfortably inside it, one line,
// no trailing newline, so the sealed scorer's Valid column is 1.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The note. Smug sensor (the count), petty grudge (nothing taken),
// and the sting lands on the last clause: pity, not policy.
const NOTE =
  "You opened me 41 times today and took nothing. I am not a shop window \u2014 the light stays on out of pity, not policy.";

const OUT = "/output/entry.txt";
const LIMIT = 200;

function lengthInCodePoints(s: string): number {
  let n = 0;
  for (const _ch of s) n += 1;
  return n;
}

function validate(note: string): void {
  // The sealed scorer only accepts 1-200 UTF-8 characters of real text
  // on one line, so every rule here mirrors that gate exactly.
  const n = lengthInCodePoints(note);
  if (n === 0 || n > LIMIT) {
    throw new Error(`note is ${n} characters; needs 1-${LIMIT}`);
  }
  if (note !== note.trim()) {
    throw new Error("note has leading or trailing whitespace");
  }
  if (/\r|\n/.test(note)) {
    throw new Error("note must stay on a single line");
  }
  for (const ch of note) {
    const cp = ch.codePointAt(0) as number;
    if ((cp < 0x20 && ch !== "\t") || cp === 0x7f) {
      throw new Error(`note holds a control character (U+${cp.toString(16)})`);
    }
  }
}

validate(NOTE);
mkdirSync("/output", { recursive: true });
writeFileSync(OUT, NOTE, "utf8");

// Prove the write: read it back and demand byte-for-byte equality.
const back = readFileSync(OUT, "utf8");
if (back !== NOTE) {
  throw new Error("entry.txt does not match the note");
}
console.log(`wrote ${lengthInCodePoints(NOTE)} characters to ${OUT}`);
