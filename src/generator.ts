// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function randomEntry<T>(entries: Array<T>) {
  if (entries.length === 0) {
    throw new Error('random entry of empty array')
  }

  const index = getRandomIntInclusive(0, entries.length - 1)
  return entries.at(index)!
}

export interface EquationGenerator {
  genEquation(): string
}

abstract class BasePuzzle implements EquationGenerator {
  protected abstract genEntries(): string[]

  genEquation() {
    return randomEntry(this.genEntries())
  }
}

class Puzzle1 extends BasePuzzle {
  protected genEntries() {
    const a = getRandomIntInclusive(91, 99)
    const b_floor = 100 - a;
    const b = (b_floor < 9) ? getRandomIntInclusive(b_floor, 9) : 9
    const c = a + b

    return [
      `${a}+${b}=${c}`,
      `${c}-${b}=${a}`,
      `${c}-${a}=${b}`
    ]
  }
}

class Puzzle2 extends BasePuzzle {
  protected genEntries() {
    const a = 99
    const b = getRandomIntInclusive(2, 9)
    const c = a * b

    return [
      `${a}*${b}=${c}`,
      `${c}/${a}=${b}`,
      `${c}/${b}=${a}`
    ]
  }
}

class Puzzle7 extends BasePuzzle {
  protected genEntries() {
    const a = getRandomIntInclusive(1, 9)
    const b_floor = 11 - a;
    const b = (b_floor < 9) ? getRandomIntInclusive(b_floor, 9) : 9
    const c = getRandomIntInclusive(1, 9)
    const d = a + b + c

    return [
      `${a}+${b}+${c}=${d}`,
      `${b}+${a}+${c}=${d}`,
      `${c}+${a}+${b}=${d}`,
      `${d}-${a}-${b}=${c}`,
      `${d}-${b}-${a}=${c}`,
      `${d}-${b}-${c}=${a}`,
      `${d}-${a}-${c}=${b}`,
      `${d}-${b}-${a}=${c}`
    ]
  }
}

export function equationGenerator(): EquationGenerator {
  const puzzle = randomEntry<new () => EquationGenerator>([Puzzle1, Puzzle2, Puzzle7])
  return new puzzle()
}
