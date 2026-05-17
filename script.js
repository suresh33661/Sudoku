// ================================================================
// PUZZLE LIBRARY
// ================================================================
const PUZZLES = {
  easy: {
    given: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  },
  medium: {
    given: [
      [0,0,0,2,6,0,7,0,1],
      [6,8,0,0,7,0,0,9,0],
      [1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],
      [0,0,4,6,0,2,9,0,0],
      [0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],
      [0,4,0,0,5,0,0,3,6],
      [7,0,3,0,1,8,0,0,0]
    ],
    solution: [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [3,7,4,6,8,2,9,1,5],
      [9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],
      [2,4,8,9,5,7,1,3,6],
      [7,6,3,4,1,8,2,5,9]
    ]
  },
  hard: {
    given: [
      [0,0,0,6,0,0,4,0,0],
      [7,0,0,0,0,3,6,0,0],
      [0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],
      [0,5,0,1,8,0,0,0,3],
      [0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],
      [9,0,3,0,0,0,0,0,0],
      [0,2,0,0,0,0,1,0,0]
    ],
    solution: [
      [5,8,1,6,7,2,4,3,9],
      [7,9,2,8,4,3,6,5,1],
      [3,6,4,5,9,1,7,8,2],
      [4,3,8,9,5,7,2,1,6],
      [2,5,6,1,8,4,9,7,3],
      [1,7,9,3,2,6,8,4,5],
      [8,4,5,2,1,9,3,6,7],
      [9,1,3,7,6,8,5,2,4],
      [6,2,7,4,3,5,1,9,8]
    ]
  },
  expert: {
    given: [
      [8,0,0,0,0,0,0,0,0],
      [0,0,3,6,0,0,0,0,0],
      [0,7,0,0,9,0,2,0,0],
      [0,5,0,0,0,7,0,0,0],
      [0,0,0,0,4,5,7,0,0],
      [0,0,0,1,0,0,0,3,0],
      [0,0,1,0,0,0,0,6,8],
      [0,0,8,5,0,0,0,1,0],
      [0,9,0,0,0,0,4,0,0]
    ],
    solution: [
      [8,1,2,7,5,3,6,4,9],
      [9,4,3,6,8,2,1,7,5],
      [6,7,5,4,9,1,2,8,3],
      [1,5,4,2,3,7,8,9,6],
      [3,6,9,8,4,5,7,2,1],
      [2,8,7,1,6,9,5,3,4],
      [5,2,1,9,7,4,3,6,8],
      [4,3,8,5,2,6,9,1,7],
      [7,9,6,3,1,8,4,5,2]
    ]
  }
};

// ================================================================
// STATE
// ================================================================
let currentDiff = 'easy';
let GIVEN, SOLUTION;
let board, sandboxBoard, candidates, notes;
let selected = null, hoveredCell = null;
let selectedNum = null, noteMode = false, sandboxMode = false;
let overlays = { entropy: true, influence: false };
let propLog = [];
let moveCount = 0, mistakeCount = 0, startTime = Date.now();
let gameLocked = false;
let detectedPatterns = [];

function initPuzzle(diff) {
  currentDiff = diff;
  GIVEN = PUZZLES[diff].given;
  SOLUTION = PUZZLES[diff].solution;
  board = GIVEN.map(r => [...r]);
  sandboxBoard = null;
  candidates = computeCandidates(board);
  notes = Array.from({length:9},()=>Array.from({length:9},()=>new Set()));
  selected = null; hoveredCell = null;
  propLog = []; moveCount = 0; mistakeCount = 0; startTime = Date.now();
  gameLocked = false;
  detectedPatterns = [];
  sandboxMode = false;
  document.getElementById('sandbox-banner').classList.remove('visible');
  document.getElementById('btn-sandbox').classList.remove('active');
}

// ================================================================
// CONSTRAINT ENGINE
// ================================================================
function getRow(r) { return Array.from({length:9},(_,c)=>({r,c})); }
function getCol(c) { return Array.from({length:9},(_,r)=>({r,c})); }
function getBox(r,c) {
  const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
  const p=[];
  for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) p.push({r:br+dr,c:bc+dc});
  return p;
}
function getBoxIdx(r,c) { return Math.floor(r/3)*3+Math.floor(c/3); }
function getPeers(r,c) {
  const set=new Set();
  [...getRow(r),...getCol(c),...getBox(r,c)].forEach(({r:pr,c:pc})=>{
    if(pr!==r||pc!==c) set.add(pr*9+pc);
  });
  return [...set].map(k=>({r:Math.floor(k/9),c:k%9}));
}

function computeCandidates(b) {
  const cands = Array.from({length:9},()=>Array.from({length:9},()=>new Set([1,2,3,4,5,6,7,8,9])));
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
    if(b[r][c]!==0) { cands[r][c]=new Set(); continue; }
    getPeers(r,c).forEach(({r:pr,c:pc})=>{ if(b[pr][pc]!==0) cands[r][c].delete(b[pr][pc]); });
  }
  return cands;
}

// ================================================================
// MATH / ENTROPY ENGINE
// ================================================================
function cellEntropy(r,c,cands) {
  const sz = cands[r][c].size;
  return sz<=1 ? 0 : Math.log2(sz);
}
function totalEntropy(cands) {
  let s=0;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) s+=cellEntropy(r,c,cands);
  return s;
}
function regionEntropy(region, cands) {
  let s=0; region.forEach(({r,c})=>s+=cellEntropy(r,c,cands)); return s;
}
function constraintDensity(r,c) {
  return getPeers(r,c).filter(({r:pr,c:pc})=>board[pr][pc]!==0).length;
}
function influenceScore(r,c,cands) {
  if(board[r][c]!==0) return 0;
  let score=0;
  getPeers(r,c).forEach(({r:pr,c:pc})=>{ if(board[pr][pc]===0) score+=cands[pr][pc].size; });
  return Math.min(99, Math.round(score/1.5));
}
function branchingFactor(r,c,cands) {
  // product of candidate counts of direct empty peers
  let prod=1, count=0;
  getPeers(r,c).forEach(({r:pr,c:pc})=>{
    if(board[pr][pc]===0){ prod*=Math.max(1,cands[pr][pc].size); count++; }
  });
  return count===0 ? 0 : Math.round(Math.pow(prod,1/count)*10)/10;
}
function propagationDepth(r,c,val,b) {
  if(val===0) return 0;
  const tmpB = b.map(row=>[...row]);
  tmpB[r][c]=val;
  const tmpC = computeCandidates(tmpB);
  let depth=0, queue=[{r,c}], visited=new Set([r*9+c]);
  while(queue.length>0) {
    const {r:cr,c:cc}=queue.shift();
    getPeers(cr,cc).forEach(({r:pr,c:pc})=>{
      if(tmpB[pr][pc]===0&&tmpC[pr][pc].size===1&&!visited.has(pr*9+pc)){
        visited.add(pr*9+pc); depth++; queue.push({r:pr,c:pc});
      }
    });
  }
  return depth;
}
function avgCandidates() {
  let sum=0,count=0;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) { if(board[r][c]===0){ sum+=candidates[r][c].size; count++; } }
  return count===0 ? 0 : (sum/count).toFixed(1);
}
function openCount() {
  let n=0;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
    if(board[r][c]===0 || (GIVEN[r][c]===0 && board[r][c]!==SOLUTION[r][c])) n++;
  }
  return n;
}
function placedCount() {
  let n=0;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
    if(board[r][c]!==0 && GIVEN[r][c]===0 && board[r][c]===SOLUTION[r][c]) n++;
  }
  return n;
}

// ================================================================
// PATTERN DETECTION ENGINE
// ================================================================
function detectPatterns() {
  const patterns=[];
  // naked singles
  let ns=0;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(board[r][c]===0&&candidates[r][c].size===1) ns++;
  if(ns>0) patterns.push({text:`${ns} naked single${ns>1?'s':''} - only one candidate remains`, color:'#639922'});
  // hidden singles in rows
  let hs=0;
  for(let r=0;r<9;r++) {
    for(let n=1;n<=9;n++) {
      const cells=getRow(r).filter(({r:pr,c:pc})=>board[pr][pc]===0&&candidates[pr][pc].has(n));
      if(cells.length===1) hs++;
    }
  }
  if(hs>0) patterns.push({text:`${hs} hidden single${hs>1?'s':''} detected in rows`, color:'#534AB7'});
  // locked candidates
  let locked=0;
  for(let box=0;box<9;box++) {
    const br=Math.floor(box/3)*3, bc=(box%3)*3;
    const boxCells=getBox(br,bc);
    for(let n=1;n<=9;n++) {
      const hasCand=boxCells.filter(({r,c})=>board[r][c]===0&&candidates[r][c].has(n));
      if(hasCand.length>=2&&hasCand.length<=3) {
        const rows=new Set(hasCand.map(p=>p.r));
        const cols=new Set(hasCand.map(p=>p.c));
        if(rows.size===1||cols.size===1) locked++;
      }
    }
  }
  if(locked>0) patterns.push({text:`${locked} locked candidate group${locked>1?'s':''} - box-line intersection`, color:'#EF9F27'});
  // high-entropy region
  let maxRowEnt=0, maxRow=0;
  for(let r=0;r<9;r++) { const e=regionEntropy(getRow(r),candidates); if(e>maxRowEnt){maxRowEnt=e;maxRow=r;} }
  if(maxRowEnt>5) patterns.push({text:`Row ${maxRow+1} most unstable - H=${maxRowEnt.toFixed(1)}`, color:'#E24B4A'});
  detectedPatterns=patterns;
  return patterns;
}

// ================================================================
// DOM BUILD
// ================================================================
const gridEl = document.getElementById('sudoku-grid');
const cells = [];

function buildGrid() {
  gridEl.innerHTML=''; cells.length=0;
  for(let r=0;r<9;r++) {
    cells[r]=[];
    for(let c=0;c<9;c++) {
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.r=r; cell.dataset.c=c;
      if(c===2||c===5) cell.classList.add('box-sep-right');
      if(r===2||r===5) cell.classList.add('box-sep-bottom');
      if(GIVEN[r][c]!==0) cell.classList.add('given');
      cell.addEventListener('click',()=>selectCell(r,c));
      cell.addEventListener('mouseenter',()=>hoverCell(r,c));
      cell.addEventListener('mouseleave',()=>{ hoveredCell=null; clearHighlights(); clearInfluenceLines(); updateRightPanel(null,null); });
      const dot=document.createElement('div'); dot.className='entropy-dot'; dot.id=`edot-${r}-${c}`;
      cell.appendChild(dot);
      cells[r][c]=cell;
      gridEl.appendChild(cell);
    }
  }
}

function buildNumPicker() {
  const np=document.getElementById('num-picker');
  np.innerHTML='';
  for(let n=1;n<=9;n++) {
    const btn=document.createElement('button');
    btn.className='num-btn'+(n===selectedNum?' sel':'')+(noteMode?' note-mode-on':'');
    btn.textContent=n; btn.id=`nBtn-${n}`;
    btn.addEventListener('click',()=>chooseNumber(n));
    np.appendChild(btn);
  }
  const eb=document.createElement('button');
  eb.className='num-btn erase-btn'; eb.textContent='X'; eb.title='Erase (Del)';
  eb.addEventListener('click',()=>{ selectedNum=0; updateNumPicker(); if(selected&&GIVEN[selected.r][selected.c]===0) removeNumber(selected.r,selected.c); });
  np.appendChild(eb);
}

function chooseNumber(n) {
  selectedNum=n;
  updateNumPicker();
  if(!selected) {
    setCoach('Pick a cell first.', 'Choose an empty square, then enter a number to test that decision.', 'warning');
    return;
  }
  if(GIVEN[selected.r][selected.c]!==0) {
    setCoach('That cell is fixed by the puzzle.', 'Select an empty cell to make your own reasoning move.', 'warning');
    return;
  }
  if(noteMode) {
    const ns=notes[selected.r][selected.c];
    if(ns.has(n)) ns.delete(n); else ns.add(n);
    renderCell(selected.r,selected.c);
    setCoach(`Note ${n} ${ns.has(n)?'added':'removed'}.`, 'Notes are temporary possibilities. They help you compare combinations before committing.', '');
  } else {
    placeNumber(selected.r,selected.c,n);
  }
}

function updateNumPicker() {
  for(let n=1;n<=9;n++) {
    const btn=document.getElementById(`nBtn-${n}`);
    if(!btn) continue;
    btn.className='num-btn'+(n===selectedNum?' sel':'')+(noteMode?' note-mode-on':'');
  }
}

// ================================================================
// RENDER
// ================================================================
function renderAll() {
  candidates=computeCandidates(board);
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) renderCell(r,c);
  updateEntropyDots();
  updateBottomStats();
  updateComboPanel();
  updatePatternPanel();
  checkComplete();
}

function renderCell(r,c) {
  const cell=cells[r][c];
  const dot=cell.querySelector('.entropy-dot');
  cell.innerHTML='';
  if(dot) cell.appendChild(dot);
  const val=board[r][c];
  const isWrong=!sandboxMode&&GIVEN[r][c]===0&&val!==0&&val!==SOLUTION[r][c];
  cell.classList.toggle('wrong',isWrong);
  if(val!==0) {
    const v=document.createElement('div');
    v.className='cell-val '+(GIVEN[r][c]!==0?'given-val':isWrong?'wrong-val':sandboxMode?'sandbox-val':'user-val');
    v.textContent=val;
    v.style.animation='ripple-in .2s ease-out';
    cell.appendChild(v);
  } else if(notes[r][c].size>0) {
    const grid=document.createElement('div');
    grid.className='cand-grid';
    for(let n=1;n<=9;n++) {
      const note=document.createElement('span');
      note.className='cand-num';
      note.textContent=notes[r][c].has(n)?n:'';
      grid.appendChild(note);
    }
    cell.appendChild(grid);
  }
}

function updateEntropyDots() {
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
    const dot=document.getElementById(`edot-${r}-${c}`);
    if(!dot) continue;
    if(!overlays.entropy||board[r][c]!==0){ dot.style.opacity='0'; continue; }
    const e=cellEntropy(r,c,candidates);
    const maxE=Math.log2(9);
    const ratio=e/maxE;
    dot.style.opacity='0.75';
    if(ratio>0.65) dot.style.background='var(--red-mid)';
    else if(ratio>0.35) dot.style.background='var(--amber-mid)';
    else dot.style.background='var(--green-mid)';
  }
}

// ================================================================
// INFLUENCE CANVAS
// ================================================================
const canvas=document.getElementById('influence-canvas');
const ctx=canvas.getContext('2d');

function resizeCanvas() {
  const wr=document.getElementById('grid-wrap').getBoundingClientRect();
  canvas.width=wr.width; canvas.height=wr.height;
}
function clearInfluenceLines() { ctx.clearRect(0,0,canvas.width,canvas.height); }
function getCellCenter(r,c) {
  const wr=document.getElementById('grid-wrap').getBoundingClientRect();
  const cr=cells[r][c].getBoundingClientRect();
  return { x:cr.left-wr.left+cr.width/2, y:cr.top-wr.top+cr.height/2 };
}
function drawInfluenceLines(r,c) {
  resizeCanvas(); clearInfluenceLines();
  if(!overlays.influence) return;
  const isDark=matchMedia('(prefers-color-scheme: dark)').matches;
  const origin=getCellCenter(r,c);
  const peers=getPeers(r,c);
  // draw structural peer lines
  peers.forEach(({r:pr,c:pc})=>{
    const peer=getCellCenter(pr,pc);
    ctx.beginPath();
    ctx.moveTo(origin.x,origin.y);
    ctx.lineTo(peer.x,peer.y);
    const alpha=board[pr][pc]!==0?0.28:0.1;
    ctx.strokeStyle=isDark?`rgba(127,119,221,${alpha})`:`rgba(83,74,183,${alpha})`;
    ctx.lineWidth=board[pr][pc]!==0?1:0.5;
    ctx.setLineDash([]);
    ctx.stroke();
  });
  // shared candidate links
  if(board[r][c]===0) {
    const myCands=candidates[r][c];
    myCands.forEach(n=>{
      peers.forEach(({r:pr,c:pc})=>{
        if(board[pr][pc]===0&&candidates[pr][pc].has(n)) {
          const peer=getCellCenter(pr,pc);
          ctx.beginPath();
          ctx.moveTo(origin.x,origin.y);
          ctx.lineTo(peer.x,peer.y);
          ctx.strokeStyle=isDark?`rgba(239,159,39,0.18)`:`rgba(186,117,23,0.18)`;
          ctx.lineWidth=0.5;
          ctx.setLineDash([3,4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    });
  }
}

function setCoach(main, sub, tone='') {
  const panel=document.getElementById('learning-panel');
  const mainEl=document.getElementById('coach-main');
  const subEl=document.getElementById('coach-sub');
  if(!panel||!mainEl||!subEl) return;
  panel.classList.remove('warning','danger','success');
  if(tone) panel.classList.add(tone);
  mainEl.textContent=main;
  subEl.textContent=sub;
}

// ================================================================
// INTERACTION
// ================================================================
function selectCell(r,c) {
  if(selected){ cells[selected.r][selected.c].classList.remove('selected'); }
  selected={r,c};
  cells[r][c].classList.add('selected');
  updateRightPanel(r,c);
  if(GIVEN[r][c]!==0) {
    setCoach('This is a fixed clue.', 'Use it as evidence. Fixed numbers reduce the choices around them.', '');
    return;
  }
  const options=[...candidates[r][c]].sort().join(', ')||'none';
  setCoach(`Cell r${r+1}c${c+1} has ${candidates[r][c].size} possible value${candidates[r][c].size!==1?'s':''}.`, `Possible values: ${options}. Choose a number only after checking how it affects the row, column, and box.`, '');
}

function placeNumber(r,c,val) {
  if(gameLocked) {
    setCoach('Training paused.', 'You reached 5 mistakes. Reset the puzzle or change difficulty to start a fresh run.', 'danger');
    return;
  }
  if(GIVEN[r][c]!==0) return;
  if(board[r][c]===val) {
    setCoach(`You already placed ${val} here.`, 'Try inspecting a different cell or use erase if you want to reopen this decision.', '');
    return;
  }
  const entropyBefore=totalEntropy(candidates);
  const prevCandsCopy=candidates.map(row=>row.map(s=>new Set(s)));
  board[r][c]=val;
  notes[r][c]=new Set();
  moveCount++;

  if(!sandboxMode&&val!==SOLUTION[r][c]) {
    mistakeCount++;
    candidates=computeCandidates(board);
    renderAll();
    cells[r][c].classList.add('conflict','wrong');
    setTimeout(()=>cells[r][c].classList.remove('conflict'),450);
    const remaining=Math.max(0,5-mistakeCount);
    if(mistakeCount>=5) {
      gameLocked=true;
      setCoach('Mistake limit reached.', 'This run is locked after 5 mistakes. Reset and try again with slower candidate checking.', 'danger');
      document.getElementById('complete-card').querySelector('h2').textContent='Training paused';
      document.getElementById('complete-stats').textContent='You reached 5 mistakes. Reset the puzzle to practice the reasoning path again.';
      document.querySelector('#complete-card button').textContent='Review board';
      setTimeout(()=>document.getElementById('complete-overlay').classList.add('visible'),250);
    } else {
      setCoach(`Not this number. ${remaining} mistake${remaining!==1?'s':''} left.`, `${val} is now shown in the cell so you can see the attempt. Use erase or enter another number after rechecking the candidates.`, 'warning');
    }
    return;
  }

  const newCands=computeCandidates(board);
  const entropyAfter=totalEntropy(newCands);
  // calculate eliminated candidates
  const eliminated=[];
  for(let pr=0;pr<9;pr++) for(let pc=0;pc<9;pc++) {
    const lost=[...prevCandsCopy[pr][pc]].filter(n=>!newCands[pr][pc].has(n));
    if(lost.length>0&&(pr!==r||pc!==c)) eliminated.push({r:pr,c:pc,lost});
  }
  logPropagation(r,c,val,eliminated);
  candidates=newCands;
  renderAll();
  const reduced=Math.max(0,entropyBefore-entropyAfter).toFixed(1);
  const totalElim=eliminated.reduce((a,e)=>a+e.lost.length,0);
  setCoach(`Correct: ${val} fits r${r+1}c${c+1}.`, `Decision impact: ${totalElim} possibilities removed across ${eliminated.length} cells. System uncertainty dropped by ${reduced}.`, 'success');
  if(overlays.influence&&hoveredCell) drawInfluenceLines(hoveredCell.r,hoveredCell.c);
}

function removeNumber(r,c) {
  if(board[r][c]!==0) {
    board[r][c]=0;
    candidates=computeCandidates(board);
    renderAll();
    setCoach(`Cell r${r+1}c${c+1} cleared.`, 'Removing a number reopens possibilities, so uncertainty can rise again.', '');
  }
}

function hoverCell(r,c) {
  hoveredCell={r,c,val:board[r][c]};
  clearHighlights();
  // highlight row/col/box
  getRow(r).forEach(p=>cells[p.r][p.c].classList.add('hl-peer'));
  getCol(c).forEach(p=>cells[p.r][p.c].classList.add('hl-peer'));
  getBox(r,c).forEach(p=>cells[p.r][p.c].classList.add('hl-peer'));
  cells[r][c].classList.add('selected');
  // same value highlight
  const val=board[r][c];
  if(val!==0) {
    for(let pr=0;pr<9;pr++) for(let pc=0;pc<9;pc++) if(board[pr][pc]===val&&(pr!==r||pc!==c)) cells[pr][pc].classList.add('hl-same');
  }
  // dependency links (shared candidates)
  if(board[r][c]===0) {
    const myCands=candidates[r][c];
    getPeers(r,c).forEach(({r:pr,c:pc})=>{
      if(board[pr][pc]===0) {
        const shared=[...myCands].filter(n=>candidates[pr][pc].has(n));
        if(shared.length>0) cells[pr][pc].classList.add('dep-linked');
      }
    });
    myCands.forEach(n=>{
      getPeers(r,c).forEach(({r:pr,c:pc})=>{
        if(board[pr][pc]===0&&candidates[pr][pc].has(n)) cells[pr][pc].classList.add('cand-match');
      });
    });
  }
  if(overlays.influence) drawInfluenceLines(r,c);
  updateRightPanel(r,c);
}

function clearHighlights() {
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) {
    cells[r][c].classList.remove('hl-peer','hl-same','dep-linked','cand-match','selected');
  }
  if(selected) cells[selected.r][selected.c].classList.add('selected');
}

// ================================================================
// RIGHT PANEL
// ================================================================
function updateRightPanel(r,c) {
  const hi=document.getElementById('hover-info');
  if(r===null) {
    hi.innerHTML='<h3>Cell inspector</h3><div style="color:var(--ink3);font-size:11px">Hover a cell to inspect its state</div>';
    ['m-cands','m-entropy','m-influence','m-density','m-prop','m-branch'].forEach(id=>document.getElementById(id).textContent='-');
    return;
  }
  const val=board[r][c];
  const cset=candidates[r][c];
  const ent=cellEntropy(r,c,candidates).toFixed(2);
  const inf=influenceScore(r,c,candidates);
  const density=constraintDensity(r,c);
  const branch=branchingFactor(r,c,candidates);
  const propVal=val===0&&cset.size===1?[...cset][0]:0;
  const propD=val===0?propagationDepth(r,c,propVal,board):0;
  const entPct=Math.round(parseFloat(ent)/Math.log2(9)*100);
  const infPct=Math.min(100,inf);

  hi.innerHTML=`
    <h3>Cell inspector</h3>
    <div class="hi-top">
      <span class="hi-val">${val!==0?val:'?'}</span>
      <span class="hi-coord">r${r+1} / c${c+1} / box${getBoxIdx(r,c)+1}</span>
    </div>
    ${val===0?`<div class="hi-cands">Candidates: <strong>${[...cset].sort().join(' ')||'none'}</strong></div>`:'<div class="hi-cands" style="color:var(--ink3)">Cell is filled</div>'}
    <div class="hi-tags">
      <span class="hi-tag">H = ${ent}</span>
      <span class="hi-tag">${density} peers filled</span>
      <span class="hi-tag">${cset.size} option${cset.size!==1?'s':''}</span>
      ${propD>0?`<span class="hi-tag" style="border-color:var(--purple);color:var(--purple)">${propD} forced</span>`:''}
    </div>
  `;

  document.getElementById('m-cands').textContent=val!==0?'-':cset.size;
  document.getElementById('m-entropy').innerHTML=`${ent} <span class="bar-wrap"><span class="bar-fill" style="width:${entPct}%;background:${entPct>65?'var(--red-mid)':entPct>35?'var(--amber-mid)':'var(--green-mid)'}"></span></span>`;
  document.getElementById('m-influence').innerHTML=`${inf} <span class="bar-wrap"><span class="bar-fill" style="width:${infPct}%;background:var(--purple)"></span></span>`;
  document.getElementById('m-density').textContent=density+' / 20';
  document.getElementById('m-prop').textContent=propD>0?propD+' cells':'-';
  document.getElementById('m-branch').textContent=val!==0?'-':branch.toFixed(1);
}

function updateBottomStats() {
  const ent=totalEntropy(candidates);
  document.getElementById('stat-entropy').textContent=ent.toFixed(1);
  document.getElementById('stat-open').textContent=openCount();
  document.getElementById('stat-placed').textContent=placedCount();
  document.getElementById('stat-avg').textContent=avgCandidates();
  const mistakeEl=document.getElementById('stat-mistakes');
  if(mistakeEl) mistakeEl.textContent=`${mistakeCount}/5`;
}

function updateComboPanel() {
  const list=document.getElementById('combo-list');
  list.innerHTML='';
  const rowData=[];
  for(let r=0;r<9;r++) {
    const region=getRow(r);
    const ent=regionEntropy(region,candidates);
    rowData.push({label:`Row ${r+1}`,ent});
  }
  rowData.sort((a,b)=>b.ent-a.ent);
  const maxEnt=Math.log2(9)*9;
  rowData.slice(0,7).forEach(({label,ent})=>{
    const pct=Math.round(ent/maxEnt*100);
    const div=document.createElement('div'); div.className='combo-row';
    div.innerHTML=`<span class="combo-label">${label}</span>
      <span class="combo-right">
        <span class="combo-val">${ent.toFixed(1)}</span>
        <span class="combo-bar"><span class="combo-fill" style="width:${pct}%;background:${pct>65?'var(--red-mid)':pct>35?'var(--amber-mid)':'var(--green-mid)'}"></span></span>
      </span>`;
    list.appendChild(div);
  });
}

function updatePatternPanel() {
  const patterns=detectPatterns();
  const pl=document.getElementById('pattern-list');
  pl.innerHTML='';
  if(patterns.length===0){
    pl.innerHTML='<div style="color:var(--ink3);font-size:10px">No significant patterns detected yet</div>';
    return;
  }
  patterns.forEach(({text,color})=>{
    const div=document.createElement('div'); div.className='pattern-item';
    div.innerHTML=`<div class="pattern-dot" style="background:${color};margin-top:3px;flex-shrink:0"></div><span>${text}</span>`;
    pl.appendChild(div);
  });
}

// ================================================================
// PROPAGATION LOG
// ================================================================
function logPropagation(r,c,val,eliminated) {
  const totalElim=eliminated.reduce((a,e)=>a+e.lost.length,0);
  const entry={
    text:`r${r+1}c${c+1} <- ${val}: -${totalElim} candidates, ${eliminated.length} cells affected`,
    color:totalElim>6?'var(--red-mid)':totalElim>3?'var(--amber-mid)':'var(--green-mid)'
  };
  propLog.unshift(entry);
  if(propLog.length>8) propLog.pop();
  const log=document.getElementById('prop-log');
  log.innerHTML='';
  propLog.forEach(e=>{
    const div=document.createElement('div'); div.className='prop-entry';
    div.innerHTML=`<div class="prop-dot" style="background:${e.color}"></div><span>${e.text}</span>`;
    log.appendChild(div);
  });
}

// ================================================================
// COMPLETION CHECK
// ================================================================
function checkComplete() {
  let complete=true;
  for(let r=0;r<9;r++) for(let c=0;c<9;c++) { if(board[r][c]!==SOLUTION[r][c]){ complete=false; break; } }
  if(complete) {
    const elapsed=Math.round((Date.now()-startTime)/1000);
    const mins=Math.floor(elapsed/60), secs=elapsed%60;
    document.getElementById('complete-card').querySelector('h2').textContent='Puzzle solved';
    document.getElementById('complete-stats').textContent=
      `Puzzle resolved in ${mins>0?mins+'m ':''}${secs}s / ${moveCount} moves / final entropy 0`;
    document.querySelector('#complete-card button').textContent='Continue exploring';
    setTimeout(()=>document.getElementById('complete-overlay').classList.add('visible'),400);
  }
}

// ================================================================
// OVERLAYS / MODES
// ================================================================
function toggleOverlay(name) {
  overlays[name]=!overlays[name];
  document.getElementById(`btn-${name}`).classList.toggle('active',overlays[name]);
  if(name==='entropy') updateEntropyDots();
  if(name==='influence') {
    if(!overlays.influence) clearInfluenceLines();
    else if(hoveredCell) drawInfluenceLines(hoveredCell.r,hoveredCell.c);
  }
}
function toggleNoteMode() {
  noteMode=!noteMode;
  document.getElementById('btn-note-mode').classList.toggle('active',noteMode);
  updateNumPicker();
}
function toggleSandbox() {
  if(sandboxMode){ exitSandbox(); return; }
  sandboxMode=true;
  sandboxBoard=board.map(r=>[...r]);
  document.getElementById('sandbox-banner').classList.add('visible');
  document.getElementById('btn-sandbox').classList.add('active');
}
function exitSandbox() {
  sandboxMode=false;
  board=sandboxBoard.map(r=>[...r]);
  sandboxBoard=null;
  document.getElementById('sandbox-banner').classList.remove('visible');
  document.getElementById('btn-sandbox').classList.remove('active');
  candidates=computeCandidates(board);
  renderAll();
  setCoach('Sandbox closed.', 'Your hypothetical moves were removed. You are back to the real reasoning path.', '');
}
function resetPuzzle() {
  if(sandboxMode) exitSandbox();
  board=GIVEN.map(r=>[...r]);
  notes=Array.from({length:9},()=>Array.from({length:9},()=>new Set()));
  propLog=[]; moveCount=0; mistakeCount=0; startTime=Date.now(); selected=null; hoveredCell=null; gameLocked=false;
  clearHighlights(); clearInfluenceLines();
  candidates=computeCandidates(board);
  renderAll();
  setCoach('Fresh board loaded.', 'Select an empty cell, inspect the possibilities, then choose a number.', '');
}
function changeDifficulty(diff) {
  if(sandboxMode) exitSandbox();
  initPuzzle(diff);
  clearHighlights(); clearInfluenceLines();
  renderAll();
  document.getElementById('btn-note-mode').classList.remove('active');
  noteMode=false; selectedNum=null; updateNumPicker();
  setCoach('New difficulty loaded.', 'Start by finding cells with fewer possibilities. Low uncertainty cells are usually safer decisions.', '');
}

// ================================================================
// KEYBOARD
// ================================================================
document.addEventListener('keydown',e=>{
  const tag=e.target.tagName;
  if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA') return;
  if(e.key>='1'&&e.key<='9') {
    chooseNumber(parseInt(e.key));
  }
  if(e.key==='Backspace'||e.key==='Delete'||e.key==='0') {
    if(selected&&GIVEN[selected.r][selected.c]===0) removeNumber(selected.r,selected.c);
  }
  if(e.key==='n'||e.key==='N') toggleNoteMode();
  if(e.key==='e'||e.key==='E') toggleOverlay('entropy');
  if(e.key==='i'||e.key==='I') toggleOverlay('influence');
  if(e.key==='z'&&(e.ctrlKey||e.metaKey)) resetPuzzle();
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    let r=selected?selected.r:4, c=selected?selected.c:4;
    if(e.key==='ArrowUp') r=Math.max(0,r-1);
    if(e.key==='ArrowDown') r=Math.min(8,r+1);
    if(e.key==='ArrowLeft') c=Math.max(0,c-1);
    if(e.key==='ArrowRight') c=Math.min(8,c+1);
    selectCell(r,c);
  }
});

// ================================================================
// INIT
// ================================================================
initPuzzle('easy');
buildGrid();
buildNumPicker();
renderAll();
