export class Sudoku {
  constructor(container, { controls = true, pauseOnGuess = false } = {}) {
    this.container = container;
    this._pauseOnGuess = pauseOnGuess;
    this.init(controls);

    if (controls) {
      container
        .querySelector(".js-examples-select")
        .addEventListener("change", (ev) => {
          this.writeBoard(ev.target.value.split(",").map(parseFloat), true);
        });
      container
        .querySelector(".js-examples-select")
        .addEventListener("click", (ev) => {
          this.writeBoard(ev.target.value.split(",").map(parseFloat), true);
        });
      container
        .querySelector(".js-solve")
        .addEventListener("click", (ev) => this.solve());
      // container.querySelector(".js-play").addEventListener("click", ev => this.stepSolve());
      // container.querySelector(".js-pause").addEventListener("click", ev => this.pause());
      // container.querySelector(".js-continue").addEventListener("click", ev => this.continue());
      container
        .querySelector(".js-reset")
        .addEventListener("click", (ev) => this.reset());
      container
        .querySelector(".js-clear")
        .addEventListener("click", (ev) => this.clearBoard());
      container
        .querySelector(".js-submit")
        .addEventListener("click", (ev) => this.dataSubmit());
        container
        .querySelector(".js-result")
        .addEventListener("click", (ev) => this.gotoresult());
    }
  }

  init(controls = true) {
    let container = this.container;
    let html = `\
  <div class="sudoku">
    
    <div class="sudoku-board">
      ${[...Array(81).keys()]
        .map((i) => {
          let { row, col } = i2rc(i);
          return `<input class="js-field" maxlength="1" min="1" max="9" type="number" data-index="${i}" data-row="${row}" data-col="${col}" />`;
        })
        .join("")}
    </div>
    <div class="controls">
    ${
      !controls
        ? ""
        : `
        <select class="js-examples-select">
          <option selected disabled hidden>Examples</option>
          ${examples
            .map(
              (example) => `
              <option value="${example.slice(1).join(",")}">${
                example[0]
              }</option>
            `
            )
            .join("")}
        </select>
        <div class="puzzleBtns">
        <button class="js-solve">Solve!</button>        
        <button class="js-reset">Reset</button>
        <button class="js-clear">Clear</button>
        </div>
        `
    }
        <div class="stats js-console"></div>
        <div class="verdict"></div>

        <div class="submitResult hidden">
            <input type="text" name="signature" placeholder="Enter your name"/>
            <button class="js-submit">Submit Result</button>            
        </div>
        <div class="submitAck"></div>
        <div class="navigationLnk js-result">Show Saved Results</div>
    </div>
    
  </div>`;
    container.innerHTML = html;
    let fields = container.querySelectorAll("input.js-field");
    fields.forEach((input) => {
      input.addEventListener("click", (ev) => {
        input.focus();
        input.select();
      });
      input.addEventListener("focus", (ev) => {
        let index = +input.dataset.index;
        log(
          container,
          `Allowed digits:
      ${b2ds(analyze(this.readBoard()).allowed[index]).join(", ")}`
        );
      });
      input.addEventListener("keydown", (ev) => {
        let idx = +input.dataset.index;
        if (ev.keyCode >= 48 && ev.keyCode <= 57) {
          input.value = String.fromCharCode(ev.keyCode);
          if (input.value == "0") input.value = "";
          input.select();
          ev.preventDefault();
        } else {
          let parent = input.parentNode;
          let next;
          switch (ev.keyCode) {
            case 38: // ↑
              next = idx - 9;
              break;
            case 40: // ↓
              next = idx + 9;
              break;
            case 39: // →
              next = idx + 1;
              break;
            case 37: // ←
              next = idx - 1;
              break;
          }
          if (next != null) {
            if (next < 0) next += 81;
            next %= 81;
            next = parent.querySelector(`input[data-index="${next}"]`);
            next.focus();
            next.select();
            ev.preventDefault();
          }
        }
      });
    });
  }

  pause() {
    clearTimeout(this._playTimer);
    this.container.classList.add("paused");
  }

  continue() {
    this.container.classList.remove("paused");
    this._playCont();
  }

  readBoard(init = false) {
    return [...this.container.querySelectorAll("input.js-field")].map((el) => {
      if (init) el.classList.toggle("init", el.value);
      return el.value ? d2b(parseInt(el.value, 10)) : 0;
    });
  }

  writeBoard(values, init = false) {
    let el = this.container;
    [...el.querySelectorAll("input.js-field")].forEach((el, i) => {
      el.value = values[i] || "";
      el.classList.remove("current");
      if (init) {
        el.classList.toggle("init", values[i]);
      }
    });
    if (init) {
      this._initBoard = values;
      this._reset();
    }
  }

  gotoresult() {
    var base_url = window.location.origin;
    window.location = base_url + "/scoreboard";
  }

  writeBytes(values, init = false) {
    this.writeBoard(values.map(b2d), init);
  }

  clearBoard() {
    let el = this.container;
    [...el.querySelectorAll("input.js-field")].forEach((el) => {
      el.value = "";
      el.classList.remove("init");
    });
    this._reset();
    el.querySelector(".submitResult").classList.add("hidden");
    el.querySelector('[name="signature"]').value = "";
    el.querySelector(".submitAck").innerHTML = "";
  }

  reset() {
    this.writeBoard(this._initBoard || [], true);
    let el = this.container;
    el.querySelector(".submitResult").classList.add("hidden");
    el.querySelector('[name="signature"]').value = "";
    el.querySelector(".submitAck").innerHTML = "";
  }

  _reset() {
    let el = this.container;
    clearTimeout(this._playTimer);
    el.classList.remove("solved", "playing", "paused");
    log(el, "");
  }

  solve() {
    let self = this;
    let el = self.container;
    let board = self.readBoard(true);
    let backtrack = 0;
    let guesswork = 0;
    let dcount = 0;
    let time = Date.now();
    let sloveStat = "";
    if (solve()) {
      sloveStat = "Solved";
      stats();
      self.writeBytes(board);
      el.classList.add("solved");
      el.querySelector(".submitResult").classList.remove("hidden");
    } else {
      sloveStat = "Unsolvable";
      stats();
      console.log("no solution");
      //alert("no solution");
    }
    function solve() {
      let { index, moves, len } = analyze(board);
      if (index == null) return true;
      if (len > 1) guesswork++;
      for (let m = 1; moves; m <<= 1) {
        if (moves & m) {
          dcount++;
          board[index] = m;
          if (solve()) return true;
          moves ^= m;
        }
      }
      board[index] = 0;
      ++backtrack;
      return false;
    }
    function stats() {
      log(el, `Puzzel Stat: <span>${sloveStat}</span>`);
    }
  }

  dataSubmit() {
    let self = this;
    let el = self.container;
    let inputs = el.querySelector(".sudoku-board").querySelectorAll("input");
    let values = [];
    for (const input of inputs) {
      values.push(input.value);
    }
    let solutionString = values.toString();
    let signatureName = el.querySelector('[name="signature"]').value;

    let requestPaylLoad = {
      solvedString: solutionString,
      name: signatureName,
      date: new Date(),
    };

    console.log(el.querySelector(".js-console span").innerHTML);

    if (
      el.querySelector(".js-console span").innerHTML === "Solved" &&
      signatureName != ""
    ) {
      fetch("http://localhost:5147/api/Sudoku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPaylLoad),
      })
        .then((response) => response.json())
        .then((data) => {
          el.querySelector(".submitAck").innerHTML =
            "Data Saved Successfully ...";
          el.querySelector(".submitResult").classList.add("hidden");
          el.querySelector('[name="signature"]').value = "";          
        })
        .catch((err) => (el.querySelector(".submitAck").innerHTML = err));
    } else {
      el.querySelector(".submitAck").innerHTML =
        "Please solve the puzzle and enter your name to submit ...";
    }
  }
}

function i2rc(index) {
  return { row: (index / 9) | 0, col: index % 9 };
}

function rc2i(row, col) {
  return row * 9 + col;
}

function d2b(digit) {
  return 1 << (digit - 1);
}

function b2d(byte) {
  for (var i = 0; byte; byte >>= 1, i++);
  return i;
}

function b2ds(byte) {
  let digits = [];
  for (let i = 1; byte; byte >>= 1, i++) if (byte & 1) digits.push(i);
  return digits;
}

function log(el, txt) {
  let out = el.querySelector(".js-console");
  if (out) out.innerHTML = txt;
}

function getMoves(board, index) {
  let { row, col } = i2rc(index);
  let r1 = 3 * ((row / 3) | 0);
  let c1 = 3 * ((col / 3) | 0);
  let moves = 0;
  for (let r = r1, i = 0; r < r1 + 3; r++) {
    for (let c = c1; c < c1 + 3; c++, i++) {
      moves |= board[rc2i(r, c)] | board[rc2i(row, i)] | board[rc2i(i, col)];
    }
  }
  return moves ^ 511;
}

function unique(allowed, index, value) {
  let { row, col } = i2rc(index);
  let r1 = 3 * ((row / 3) | 0);
  let c1 = 3 * ((col / 3) | 0);
  let ir = 9 * row;
  let ic = col;
  let uniq_row = true,
    uniq_col = true,
    uniq_3x3 = true;
  for (let r = r1; r < r1 + 3; ++r) {
    for (let c = c1; c < c1 + 3; ++c, ++ir, ic += 9) {
      if (uniq_3x3) {
        let i = rc2i(r, c);
        if (i != index && allowed[i] & value) uniq_3x3 = false;
      }
      if (uniq_row) {
        if (ir != index && allowed[ir] & value) uniq_row = false;
      }
      if (uniq_col) {
        if (ic != index && allowed[ic] & value) uniq_col = false;
      }
      if (!(uniq_3x3 || uniq_row || uniq_col)) return false;
    }
  }
  return uniq_row || uniq_col || uniq_3x3;
}

function analyze(board) {
  let allowed = board.map((x, i) => (x ? 0 : getMoves(board, i)));
  let bestIndex,
    bestLen = 100;
  for (let i = 0; i < 81; i++)
    if (!board[i]) {
      let moves = allowed[i];
      let len = 0;
      for (let m = 1; moves; m <<= 1)
        if (moves & m) {
          ++len;
          if (unique(allowed, i, m)) {
            allowed[i] = m;
            len = 1;
            break;
          }
          moves ^= m;
        }
      if (len < bestLen) {
        bestLen = len;
        bestIndex = i;
        if (!bestLen) break;
      }
    }
  return {
    index: bestIndex,
    moves: allowed[bestIndex],
    len: bestLen,
    allowed: allowed,
  };
}

export const examples = [
  [
    "Level 1",
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    0,
    3,
    0,
    0,
    7,
    1,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    0,
    0,

    0,
    0,
    0,
    9,
    0,
    8,
    0,
    7,
    1,
    1,
    0,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    3,
    0,
    9,
    0,
    0,

    5,
    0,
    7,
    0,
    0,
    6,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    1,
    8,
    0,
    0,
    0,
    0,
    2,
  ],
  [
    "Level 2",
    0,
    0,
    0,
    0,
    1,
    7,
    2,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    3,
    0,
    0,
    0,

    4,
    0,
    0,
    7,
    8,
    0,
    5,
    0,
    0,
    0,
    2,
    5,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    0,
    0,

    6,
    0,
    1,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    0,
    3,
    0,
    2,
    0,
    0,
    0,
    0,
    1,
    7,
    0,
    4,
  ],
  [
    "Level 3",
    9,
    0,
    0,
    5,
    0,
    1,
    7,
    0,
    0,
    2,
    0,
    1,
    0,
    0,
    9,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    7,
    0,
    0,
    9,
    0,

    0,
    8,
    0,
    0,
    6,
    4,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    1,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    0,

    7,
    0,
    6,
    2,
    4,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
  ],
  [
    "Level 4",
    0,
    0,
    0,
    0,
    3,
    0,
    5,
    7,
    0,
    0,
    0,
    2,
    0,
    0,
    8,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,

    0,
    3,
    0,
    5,
    7,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    5,
    6,
    0,
    0,
    7,
    1,
    8,

    0,
    7,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    7,
    0,
    9,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
  ],
  [
    "Level 5",
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    0,
    0,
    9,
    0,
    2,
    0,
    0,

    0,
    5,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    5,
    7,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    0,

    0,
    0,
    1,
    0,
    0,
    0,
    0,
    6,
    8,
    0,
    0,
    8,
    5,
    0,
    0,
    0,
    1,
    0,
    0,
    9,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
  ],
  [
    "Level 6",
    0,
    0,
    3,
    9,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    3,
    6,
    0,
    0,
    8,
    0,
    0,
    0,
    1,
    0,
    0,

    0,
    4,
    0,
    0,
    6,
    0,
    0,
    7,
    3,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,

    0,
    0,
    4,
    0,
    7,
    0,
    0,
    6,
    8,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
  ],
  [
    "Level 7",
    0,
    0,
    0,
    8,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    3,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,

    0,
    0,
    0,
    0,
    7,
    0,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    3,
    0,
    0,
    0,
    0,

    6,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    5,
    0,
    0,
    3,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    6,
    0,
    0,
  ],
];
