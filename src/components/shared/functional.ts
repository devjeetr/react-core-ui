/**
 * Clamps a given number to the range (inclusive).
 * If the number is greater than the end of the range,
 * returns start of range,  and vice versa.
 *
 * @param {number} n
 * @param {[number, number]} range
 * @returns number
 */
 export const circularClamp = (n: number, range: [number, number]) => {
    if (n > range[1]) return range[0];
    if (n < range[0]) return range[1];
  
    return n;
  };