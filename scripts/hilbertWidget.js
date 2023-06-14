/**
 * Graphical "widget" for drawing Hilbert curves
 */


let _hilbertCurve; /** The handle to the Hilbert class object */

/**
 * Default and larger sizes of the canvas on which the Hilbert curve is drawn:
 * a square canvas with each side = a power of 2, in pixels
 */
const DEFAULT_CANVAS_SIZE = 2 ** 8;
const LARGE_CANVAS_SIZE = 2 ** 9; // larger canvas
let _canvasSize = DEFAULT_CANVAS_SIZE;

let _canvasCtx; /** The canvas context used to draw the Hilbert curve */

let _lineLth; /**  computed line length */

let _hindex; /** the Hilbert index, converted to a coordinate */

let _timeOut; /** time in mils between drawing lines */

let _prevPoint; /** track endpoint of prior drawn line */

/** The GUI control that allows the user to specify the order of the Hilbert curve */
let _orderControl;

/** The GUI control that allows the user to set the size of the canvas */
let _sizeControl;

/** The GUI control that allows the user to set the drawing speed */
let _speedControl;

/** Values for delay/timeout when adjusting drawnig speed */
const SHORTEST_TIMEOUT = 0;
const LONGEST_TIMEOUT = 100;
const TIMEOUT_RANGE = LONGEST_TIMEOUT - SHORTEST_TIMEOUT;
const SPEED_RANGE = 2; // speed control max-min

let _button; /** The Draw/Stop button */
let _stopDrawing; /** async stop drawing flag */

/** Handler called when HTML DOM is fully loaded */
window.addEventListener("DOMContentLoaded", loadedHandler);

function afterDrawCleanup() {
  _orderControl.disabled = false;
  _sizeControl.disabled = false;
  _speedControl.disabled = false;
  _button.innerHTML = "Draw";
}

function drawLine() {
  // Traverse N x N space
  if ((_hindex < _hilbertCurve.N * _hilbertCurve.N) && !_stopDrawing) {
    let curPoint = _hilbertCurve.hindex2xy(_hindex);

    /* Hilbert curve returns "unit" coordinates.
     * Transform them by multiplying each by the line length.
     */
    curPoint[0] *= _lineLth;
    curPoint[1] *= _lineLth;

    // calculate line color by indexing into HSL color space
    let colorIndex = Math.ceil(360 / _hilbertCurve.N);
    _canvasCtx.strokeStyle = "hsl(" + _hindex + "deg 50% 50%)";

    _canvasCtx.beginPath();
    _canvasCtx.moveTo(_prevPoint[0], _prevPoint[1]);
    _canvasCtx.lineTo(curPoint[0], curPoint[1]);
    _canvasCtx.stroke();

    // _canvasCtx.closePath(); // closePath creates a closed shape - no need

    _prevPoint = curPoint;
    _hindex++;
    setTimeout(drawLine, _timeOut);

  } else {
    afterDrawCleanup();
  }
}

/** Map speed value to timeout/delay value
 *     Speed     |  Timeout (in milliseconds)
 *  0 (slowest)  |  100 (longest delay)
 *    ...        |    ...
 *  2 (fastest)  |   20(shortest delay)
 */
function mapSpeedToTimeout(speed) {
  return LONGEST_TIMEOUT - ((speed * TIMEOUT_RANGE) / SPEED_RANGE);
}

function drawHilbertCurve() {
  _hilbertCurve = new HilbertCurve(parseInt(_orderControl.value)); // Hilbert class object instance

  /* The length of each line that connects 2 hilbert points is a function of
   * the size of the canvas (in pixels) and the size/dimension of the Hilbert
   * curve:
   */
  _lineLth = _canvasSize / _hilbertCurve.N;
  if (_lineLth < 4) _lineLth = 4;

  // Clear any prior drawing. Do this before translate() below.
  _canvasCtx.clearRect(0, 0, _canvasCtx.canvas.width, _canvasCtx.canvas.height);
  _canvasCtx.reset();
  _canvasCtx.translate(_lineLth / 2, _lineLth / 2); // Move origin to middle, center of 1st square

  _canvasCtx.lineWidth = 2;

  // Map value from speed control to timeout/delay value
  _timeOut = mapSpeedToTimeout(_speedControl.value);
  _hindex = 1;
  _prevPoint = [0, 0];
  setTimeout(drawLine, _timeOut);
}

function setCanvasSize(canvasSize) { canvas.width = canvas.height = canvasSize; }

function sizeClickHandler() {
  _canvasSize = (this.checked) ? LARGE_CANVAS_SIZE : DEFAULT_CANVAS_SIZE;
  setCanvasSize(_canvasSize);
}

function buttonClickHandler() {
  if (this.innerHTML === "Draw") {
    this.innerHTML = "Stop";
    _orderControl.disabled = true;
    _sizeControl.disabled = true;
    _speedControl.disabled = true;
    _stopDrawing = false;

    drawHilbertCurve();
  } else {
    _stopDrawing = true;
  }
}

/**
 * INITIALIZATION
 * 
 * This is called when the DOM for the HTML page is fully loaded
 */
function loadedHandler() {
  _orderControl = document.querySelector("div#hilbertWidget #controls #order");
  _sizeControl = document.querySelector("div#hilbertWidget #controls #size");
  _speedControl = document.querySelector("div#hilbertWidget #speed");
  _button = document.querySelector("div#hilbertWidget button");

  _sizeControl.onchange = sizeClickHandler;
  _button.onclick = buttonClickHandler;

  /* Initialize canvas */
  _canvasCtx = document.querySelector("div#hilbertWidget #canvas").getContext("2d");
  setCanvasSize(_canvasSize);
}