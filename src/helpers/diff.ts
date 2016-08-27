// Implementation of the Hirschberg algorithm
// Time: O(mn)
// Space: O(min(m, n))
// See: https://en.wikipedia.org/wiki/Hirschberg%27s_algorithm


/*
 * Levenshtein distance
 *
 * The distance is calculate with a grid of n+1 columns and m+1 lines.
 *
 * The top row is initialized with integers from 0 to `n`, the left column with
 * integers from 0 to `m`.
 *
 * Then, we fill the grid with the following equation:
 *
 * ```
 * ┼─┼─┼   r = min(a + 1, d + 1, isMatch ? m : m + 1)                   [eq. 01]
 * │m│a│           └─┬─┘  └─┬─┘            │   └─┬─┘
 * ┼─┼─┼            ADD    DEL          MATCH   MUT
 * │d│r│
 * ┼─┼─┼
 * ```
 *
 * The result distance can be obtained from the distances of prefixes.
 * The value obtained from the distance `m` depends on the comparison of the
 * current items (isMatch means that the items are equal). The equality test can
 * be expensive so we want to avoid it when possible.
 * We can avoid the test if the following equality is true:
 * ```
 * min(a + 1, d + 1) <= m                                               [eq. 02]
 * ```
 * (In this case, even if we get a match it will not change the value of `r`)
 *
 */

interface Region {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface Action {
  type: "source" | "target" | "update" | "match",
  value: number;
}

function relToAbs(start: number, end: number, relIdx: number, reverse: boolean) {
  if (reverse) {
    return (end - 1) - relIdx;
  } else {
    return start + relIdx;
  }
}

// Adaptation of the Needleman–Wunsch algorithm for the Levenshtein distance
function minDistIdxSync(seq1: string | any[], seq2: string | any[], start1: number,
                        end1: number, start2: number, end2: number, reverse: boolean): [number, number] {
  const len1 = end1 - start1;
  const len2 = end2 - start2;
  let oldScore = Array(len2 + 1);
  let curScore = Array(len2 + 1);

  // Initialize with the bottom left value
  let minCol = 0;

  for (let col = 0; col <= len2; col++) { // Initialize first row from 0 to len2
    oldScore[col] = col;
  }
  for (let row = 1; row <= len1; row++) {
    const rowItemIdx = relToAbs(start1, end1, row - 1, reverse);
    const rowItem = seq1[rowItemIdx];

    curScore[0] = row; // Initialize first column;
    for (let col = 1; col <= len2; col++) {
      // Nearest distance in case of add / del
      const addDelDist = Math.min(oldScore[col] + 1, curScore[col - 1] + 1);
      // Nearest distance in case of match
      const matchDist = oldScore[col - 1];

      if (addDelDist <= matchDist) {
        // See the comment above about skipping the test `colItem === rowItem`.
        curScore[col] = addDelDist;
      } else {
        const colItemIdx = relToAbs(start2, end2, col - 1, reverse);
        const colItem = seq2[colItemIdx];
        curScore[col] = colItem === rowItem ? matchDist : matchDist + 1;
      }
    }
    if (row == len1) { // Scan the last row to get the minIdx
      for (let col = 1; col <= len2; col++) {
        if (curScore[col] <= curScore[minCol]) { // Go the farthest possible
          minCol = col;
        }
      }
    } else { // Swap the active row (we do not need to store the whole matrix)
      [curScore, oldScore] = [oldScore, curScore];
    }
  }
  return [relToAbs(start2, end2, minCol - 1, reverse), curScore[minCol]];
}

function relativeIndexOf(item: any, seq: string | any[], start: number, end: number): number {
  for (let i = start; i < end; i++) {
    if (seq[i] === item) {
      return i - start;
    }
  }
  return -1;
}

function hirschbergSync (seq1: string | any[], seq2: string | any[], start1: number, end1: number, start2: number, end2: number): any[] {
  const len1 = end1 - start1;
  const len2 = end2 - start2;
  if (len1 == 0) {
    return [{type: "target", value: len2}];
  } else if (len2 == 0) {
    return [{type: "source", value: len1}];
  } else if (len1 === 1) {
    const idx = relativeIndexOf(seq1[start1], seq2, start2, end2);
    let result: any[];
    if (idx < 0) {
      result = [{type: "mut", source: len1, target: len2}]
    } else {
      result = [];
      if (idx > 0) {
        result.push({type: "target", value: idx});
      }
      result.push({type: "match", value: 1});
      if (len2 - idx - 1 > 0) {
        result.push({type: "target", value: len2 - idx - 1});
      }
    }
    return result;
  } else if (len2 === 1) {
    const idx = relativeIndexOf(seq2[start2], seq1, start1, end1);
    let result: any[];
    if (idx < 0) {
      result = [{type: "mut", source: len1, target: len2}]
    } else {
      result = [];
      if (idx > 0) {
        result.push({type: "source", value: idx});
      }
      result.push({type: "match", value: 1});
      if (len1 - idx - 1 > 0) {
        result.push({type: "source", value: len1 - idx - 1});
      }
    }
    return result;
  } else {
    const mid1 = start1 + Math.floor(len1 / 2);
    const [leftMinDistIdx, leftMinVal] = minDistIdxSync(seq1, seq2, start1, mid1, start2, end2, false);
    const [rightMinDistIdx, rightMinVal] = minDistIdxSync(seq1, seq2, mid1, end1, start2, end2, true);
    // We add + 1 to the left index because it becomes the right end of
    // the range (which is exclusive)
    const mid2 = leftMinVal <= rightMinVal ? leftMinDistIdx + 1 : rightMinDistIdx;
    const left: any[] = hirschbergSync(seq1, seq2, start1, mid1, start2, mid2);
    const right: any[] = hirschbergSync(seq1, seq2, mid1, end1, mid2, end2);
    return [].concat(left, right);
  }
}

export function diffSync (seq1: string | any[], seq2: string | any[]) {
  return hirschbergSync(seq1, seq2, 0, seq1.length, 0, seq2.length);
}

// R0 SETTAC O DE
// =##===####=+=-
// RAISETHYSWORD

/*
 * Structure of the Levenshtein matrix
 *
 * Let's see which information about the grid we can get from the equation
 * of `r`.
 * By definition of `min`, we have:
 *
 * ```
 * ┼─┼─┼
 * │m│a│   r <= m + 1  (This is true independently of `isMatch`)        [eq. 03]
 * ┼─┼─┼   r <= a + 1                                                   [eq. 04]
 * │d│r│   r <= d + 1                                                   [eq. 05]
 * ┼─┼─┼
 * ```
 *
 * This means that growth of the distance when we go to the right or down is
 * bounded. You cannot increase of more than 1 when going to the right or down.
 *
 * It means that the following configurations are impossible:
 *
 * ```
 * ┼─┼─┼
 * │5│ │   IMPOSSIBLE, breaks: r <= m + 1
 * ┼─┼─┼
 * │ │7│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │5│   IMPOSSIBLE, breaks: r <= a + 1
 * ┼─┼─┼
 * │ │7│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │ │   IMPOSSIBLE, breaks: r <= d + 1
 * ┼─┼─┼
 * │5│7│
 * ┼─┼─┼
 * ```
 *
 * Since these inequalities are relative to a `r`, we can translate them:
 * ```
 * ┼─┼─┼
 * │m│a│   d <= m + 1   (from [eq. 4])                                  [eq. 06]
 * ┼─┼─┼   a <= m + 1   (from [eq. 5])                                  [eq. 07]
 * │d│r│
 * ┼─┼─┼
 * ```
 *
 * We can also add a lower bound to the growth when going to the right or down:
 * ```
 * a - 1 <= r                                                           [eq. 08]
 * d - 1 <= r                                                           [eq. 09]
 * ```
 * So `r` cannot grow faster than `1` per cell, but also cannot decrease faster.
 *
 * This means that the following configuration are impossible:
 *
 * ```
 * ┼─┼─┼
 * │ │7│   IMPOSSIBLE, breaks: a - 1 <= r
 * ┼─┼─┼
 * │ │5│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │ │   IMPOSSIBLE, breaks: d - 1 <= r
 * ┼─┼─┼
 * │7│5│
 * ┼─┼─┼
 * ```
 *
 * We will only prove the first inequality `a - 1 <= r` since both inequalities
 * are in fact equivalent due to the symmetry of the problem.
 *
 * To demonstrate it, we'll use a proof by contradiction: we will show that it
 * simply cannot be otherwise.
 * The opposite of `a - 1 <= r` is:
 * ```
 * a - 1 > r                                                            [eq. 10]
 * ```
 * This inequality is incompatible with the value of `r` whether it comes from
 * a MATCH, MUT, ADD or DEL:
 *
 *
 * MATCH:
 * ```
 * r = m              (definition of MATCH)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint [eq. 07])
 * ```
 * We can transform it:
 * ```
 * r = m
 * a > r + 1          (move `-1` to the right side)
 * a <= r + 1         (substitute `m` for `r`)
 * ```
 * This system does not have any solution.
 *
 * MUT:
 * ```
 * r = m + 1          (definition of MUT)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint [eq. 07])
 * ```
 * We can transform it:
 * ```
 * r = m
 * a > r + 1          (move `-1` to the right side)
 * a <= r             (substitute `m + 1` for `r`)
 * ```
 * This system does not have any solution.
 *
 *
 * ADD:
 * ```
 * r = a + 1          (definition of ADD)
 * a - 1 > r          (hypothesis)
 * ```
 * This system does not have any solution.
 *
 *
 * DEL:
 * So far we've seen that the MATCH, MUT and ADD for `r` are incompatible
 * with `a - 1 > r`. Let's check the last case: DEL.
 *
 * ```
 * r = d + 1          (definition of DEL)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint)
 * ```
 * We can transform it:
 * ```
 * r - 1 = d          (move `1` to the left)
 * a > r + 1          (move `-1` to the right)
 * m + 1 >= a         (swap)
 * ```
 * And again:
 * ```
 * d = r - 1          (swap)
 * a > r + 1
 * m + 1 >= a
 * m + 1 > r + 1      (transitivity with line 2 and 3: m + 1 >= a > r + 1)
 * ```
 * And again:
 * ```
 * d = r - 1          (swap)
 * a > r + 1
 * m + 1 >= a
 * m > r              (cancel `1`)
 * ```
 * And again:
 * ```
 * d = r - 1
 * a > r + 1
 * m + 1 >= a
 * m > d + 1          (Substitute `r` for `d+1`)
 * ```
 * We can place these equations on the grid to better visualize the situation.
 * ```
 * ┼─────┼─────┼
 * │> d+1│> r+1│
 * ┼─────┼─────┼
 * │  d  │  r  │
 * ┼─────┼─────┼
 *
 * ```
 *
 * If we recap what we know:
 *
 * The cell above `r` can have a value (strictly) greater than `r + 1`
 * IF
 * The cell above `d` has a value (strictly) greater than `d + 1`.
 *
 * So to have a decrease of 2 or more between one cell and the cell below, we
 * have to have a decrease of 2 or more on the column to the left.
 * Recursively, to have a decrease of 2 or more on the column `j-1`, we need
 * this decrease on `j-2` so also on `j-3` and also on `j-4` and so on until we
 * reach the leftmost column...
 *
 * > The top row is initialized with integers from 0 to `n`, the left column
 * > with integers from 0 to `m`.
 *
 * The leftmost column is strictly increasing so it does not contain any
 * decrease of two or more. This means that the pattern described above is
 * impossible and `a - 1 > r` is not possible with a DEL operation.
 *
 * `a - 1 > r` is not possible with any operation, it is always false.
 * So, its opposite `a - 1 <= r` is always true. Or we could just have said that
 * the problem is symmetric if we reverse both strings.
 */
