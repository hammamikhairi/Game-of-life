
let Width = window.innerWidth
let Height = window.innerHeight
let columns;
let rows;
let res;
let board;
let next;
let colors = ['#e011ab', '#11e04f', '#11d5e0', 'green', '#9b11e0', '#b511e0', '#e03611', '#11e0b9', '#cbe011']
// colors = ['#000000']
let drawing = false
let start = true
let strokeColor = 255

class Cell {
  constructor(state, position, color){
    this.state = state;
    this.position = position;
    this.color = color;
    this.nextState = state;
    this.nextColor = color;
    if (state == 0)
      this.color = getWhiteColor();
    this.deathGen = 0;
  }

  update(){
    this.state = this.nextState;
    this.color = this.nextColor;
  }

  nextGen(){
    let neighbors = this.getNeighbors();
    let aliveNeighbors = 0;
    for(let i = 0; i < neighbors.length; i++){
      if(neighbors[i].state == 1){
        aliveNeighbors++;
      }
    }
    if(this.state == 1){
      if(aliveNeighbors < 2 || aliveNeighbors > 3){
        this.nextState = 0;
        this.deathGen = 1;
        let prev = getColorHex(this.color);
        this.nextColor = this.fadeCurrentColor();
        // this.nextColor = getWhiteColor();
      }else{
        this.deathGen = 0;
        this.nextState = 1;
        this.nextColor = this.getDominantColor(false);
      }
    } else {
      if(aliveNeighbors == 3) {
        this.nextState = 1;
        this.deathGen = 0
        this.nextColor = this.getDominantColor()
      } else {
        this.deathGen++;
        this.nextState = 0;
        this.nextColor = this.fadeCurrentColor();
      }
    }
  }

  fadeCurrentColor(){
    let prev = getColorHex(this.color);
    if (255 - this.deathGen * 150 < 0)
      return color(prev[0], prev[1], prev[2], 20)
    return color(prev[0], prev[1], prev[2], 255 - this.deathGen * 150);
  }

  getDominantColor(skipSelf = true){
    let neighbors = this.getNeighbors();
    let colors = {};
    for(let i = 0; i < neighbors.length; i++){
      if (neighbors[i].state == 1 ){
        let neighColor = stringToColor(neighbors[i].color)
        if(colors[neighColor]){
          colors[neighColor]++;
        } else {
          colors[neighColor] = 1;
        }
      }
    }
    if(!skipSelf){
      colors[stringToColor(this.color)] += 1;
    }
    let dominantColor = Object.keys(colors).reduce(function(a, b){ return colors[a] > colors[b] ? a : b });
    if (colors[dominantColor] == colors[this.color])
      return this.color;
    else
      return dominantColor;
  }

  getNeighbors(){
    let neighbors = [];
    let x = this.position.x;
    let y = this.position.y;
    for(let i = -1; i <= 1; i++){
      for(let j = -1; j <= 1; j++){
        if(i == 0 && j == 0){
          continue;
        }
        let xIndex = (x + i + columns) % columns;
        let yIndex = (y + j + rows) % rows;
        neighbors.push(board[xIndex][yIndex]);
      }
    }
    return neighbors;
  }

}

const randomBit = () => Math.floor(Math.random() * 2);
const getColorHex = (color) => {
  color = stringToColor(color)
  let red = color.levels[0];
  let green = color.levels[1];
  let blue = color.levels[2];
  return [red, green, blue]
}
const stringToColor = (str) => {
  //check if it's already a color
  if (typeof str !== 'string')
    return str;
  let values = str.split('(')[1].split(')')[0].split(',')
  return color(values[0], values[1], values[2])
}
const randomColor = () => {
  let randomIndex = Math.floor(Math.random() * colors.length)
  return color(colors[randomIndex])
}
const getWhiteColor = () => color(255, 255, 255)
const getRedColor = () => color(255, 0, 0)

const GridInit = (empty = false) => {
  let grid = new Array(rows);


  for (let i= 0; i < columns; i++)
    grid[i] = new Array(rows).fill(1)


  for (let i=0; i<columns; i++)
    for ( let j=0; j<rows; j++)
      grid[i][j] = new Cell(empty ? 0 : randomBit(), createVector(i,j), randomColor())

  return grid
}
function generate() {

  for (let x = 0; x < columns; x++)
    for (let y = 0; y < rows; y++)
      board[x][y].nextGen()
  for (let x = 0; x < columns; x++)
    for (let y = 0; y < rows; y++)
      board[x][y].update()

}

//!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!
let drawButton = document.getElementById('draw');
let startButton = document.getElementById('start');
let regenButton = document.getElementById('regen');
let resetButton = document.getElementById('reset');

function setup() {
  createCanvas(Width, Height);
  startButton.addEventListener('click', toggleSimulation)
  drawButton.addEventListener('click', drawCells)
  regenButton.addEventListener('click', regenBoard)
  resetButton.addEventListener('click', resetBoard)


  res = 20;
  columns = floor(Width / res);
  rows = floor(Height / res);

  board = GridInit()

  next = GridInit(true)
}



function draw() {
  background(255);
  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      let cell = board[i][j];
      fill(cell.color)
      stroke(strokeColor)
      rect(i * res, j * res, res, res);
    }
  }
  
  // if (frameCount % 20 == 0)
    if (start)
      generate();

}



const toggleSimulation = () => {
  start = !start
  startButton.innerHTML = start ? 'Stop' : 'Start'
}


const regenBoard = () => board = GridInit()

const resetBoard = () => board = GridInit(true)

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    toggleSimulation()
  } else if (keyCode === UP_ARROW) {
    drawCells()
  }
}
const drawCells = () => {
  if (drawButton.innerHTML == 'Draw') {
    // board = GridInit(true)
    // start = false
    drawButton.innerHTML = 'Done'
    strokeColor = 150
    drawing = true
  } else {
    drawButton.innerHTML = 'Draw'
    strokeColor = 255
    drawing = false
    // start = true
  }
}

function mouseClicked(event) {
  if (event.target.nodeName == "BUTTON")
    return

  // check if its lsft or right
  let left = event.button == 0;
  let x = floor(mouseX / res);

  if (!drawing)
    return
  let cell = board[Math.floor(mouseX / res)][Math.floor(mouseY / res)]
  cell.state = 1
  if (left)
  cell.color = color(0, 0, 0)
  else
  cell.color = randomColor()

}

function mouseDragged(){
  if (!drawing)
    return
  // create an object as empty point


  let cell = board[Math.floor(mouseX / res)][Math.floor(mouseY / res)]
  cell.state = 1
  cell.color = randomColor()
}