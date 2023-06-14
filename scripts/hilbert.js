"use strict";

/**
 * Hilbert Curve: Generate points on a Hilbert curve.
 * @borrows Borrows from Marcin Chwedczuk work on an iterative (non-recursive) 
 * algorithm.
 * @see https://blog.marcinchwedczuk.pl/iterative-algorithm-for-drawing-hilbert-curve
 */
class HilbertCurve {
  order;    /** Hilbert curve order (1, 2, ...) */

  /** Hilbert curve dimension (2, 4, 8, 16, ...); derived from "order"
   * Hilbert curve will be contained in square N x N space
   */
  N;
  
  constructor(order) {
    this.order = order;
    this.N = 2 ** order;
  }

  hindex2xy(hindex) {

    function last2bits(x) { return (x & 3); }

    // 1. coordinates of order 1 Hilbert curve (N=2)
    const order1coords = [
      [0, 0], /* last2bits=0: */
      [0, 1], /* last2bits=1: */
      [1, 1], /* last2bits=2: */
      [1, 0]  /* last2bits=3: */
    ];

    // 2. iteratively compute coords
    let coords = order1coords[last2bits(hindex)];
    hindex = (hindex >>> 2);
    let x = coords[0]; // inital x
    let y = coords[1]; // inital y

    for (let n = 4; n <= this.N; n *= 2) {
      let tmp;
      let half_n = n / 2;

      switch (last2bits(hindex)) {
        case 0: /* left-bottom case: swap x & y */
          tmp = x; x = y; y = tmp;
          break;

        case 1: /* left-upper case: move up */
          x = x;
          y = y + half_n;
          break;

        case 2: /* right-upper case: move right, up  */
          x = x + half_n;
          y = y + half_n;
          break;

        case 3: /* right-bottom case */
          tmp = y;
          y = (half_n - 1) - x;
          x = (half_n - 1) - tmp;
          x = x + half_n;
          break;
      }

      hindex = (hindex >>> 2);
    }
    return [x, y];
  }
}