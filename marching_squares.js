// Created By Carlo DeFilippis with some help from google and a LOT of coffee
// Credit for Perlin Noise code goes to Joseph Gentle https://github.com/josephg/noisejs

var canvasHeight
var canvasWidth
var canvasWidthRatio = .7
var canvasHeightRatio = .8
var sliderArray
var spaceBetween = 10


const box = document.querySelector('#container')
var slider_parent = document.querySelector('#slider')

//Start Perlin Noise
generate_noise.seed(Math.random())
function getNoise(x, y) {
    let d = new Date()
    return generate_noise.perlin3(x/12,y/12, d.getTime() / 3000)+1
}

function setup() {
    // Create Slider For some adjustment of noise
    slider = createSlider(800, 1250, 950)
    slider.parent('slider')

    // Create the canvas
    canvas = createCanvas(0, 0)
    changeDrawSize()
    canvas.parent('container')
    frameRate(30)
    loop()
}

function draw() {
    // Do not render if scrolled out of view
    if(!isViewing(box)){
        return
    }
    let bias = (slider.value()/1000) ** 3
    clear()
    background(0)
    let square_size = Math.floor(spaceBetween/3)

    // Main Code loop
    for(let x = 0; x < sliderArray.length; x++){
        for(let y = 0; y < sliderArray[x].length; y++){
            // Create an object for the array
            sliderArray[x][y] = {
                data: Math.floor(getNoise(x,y) * bias),
                xpos: x * spaceBetween,
                ypos: y * spaceBetween,
                x: x,
                y: y,
            }

            // If point in array is active draw a square
            fill(48, 101, 172)
            if(sliderArray[x][y].data !== 0){
                square(sliderArray[x][y].xpos - square_size/2, sliderArray[x][y].ypos -square_size/2, square_size)
            }

            // Compare points and only spawn in if conditions are met
            if(x > 0 && y > 0){
                let current_square = [sliderArray[x-1][y-1], sliderArray[x][y-1], sliderArray[x][y], sliderArray[x-1][y]]
                let active_corners = current_square.filter(point => point.data >= 1)
                if     (active_corners.length === 1){oneActiveTrigger(active_corners[0], x, y)}
                else if(active_corners.length === 2){twoActiveTriggers(active_corners, x, y)}
                else if(active_corners.length === 3){
                    let inactive_corners = current_square.filter(point => point.data < 1)
                    oneActiveTrigger(inactive_corners[0], x, y)
                }
            }
        }
    }
}

function windowResized(){
    changeDrawSize()
}

function oneActiveTrigger(point, x, y){
    noFill()
    stroke(color(48, 101, 172))
    let xval = point.x - x
    let yval = point.y - y
    let line_vector = {
        x1: x*spaceBetween - spaceBetween/2,
        y1: (y + yval) * spaceBetween,
        x2: (x + xval) * spaceBetween,
        y2: y*spaceBetween - spaceBetween/2,
    }
    line(line_vector.x1, line_vector.y1, line_vector.x2, line_vector.y2)
}

function twoActiveTriggers(active_corners, x, y){
    noFill()
    stroke(color(48, 101, 172))
    // If points are complements treat them both as solo points
    if (active_corners[0].x === active_corners[1].x){
        xval = x * spaceBetween - spaceBetween/2
        line(xval, y * spaceBetween, xval, (y - 1) * spaceBetween)
    }
    else if (active_corners[0].y === active_corners[1].y){
        yval = y * spaceBetween - spaceBetween/2
        line(x * spaceBetween, yval, (x - 1) * spaceBetween, yval)
    }
    else {
        oneActiveTrigger(active_corners[0], x, y)
        oneActiveTrigger(active_corners[1], x, y)
    }
}
// Check if user is vieing the window so we can determine to animate or not
function isViewing(el) {
    const rect = el.getBoundingClientRect()
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    )
}

function changeDrawSize() {
    canvasHeight = Math.floor(window.innerHeight * canvasHeightRatio)
    canvasHeight -= canvasHeight % spaceBetween
    // canvasWidth = Math.floor(window.innerWidth * canvasWidthRatio)
    if(window.innerWidth > 672){
        canvasWidth = Math.min(window.innerWidth - 128, 832)
    } else {
        canvasWidth = window.innerWidth - 32
    }
    canvasWidth -= canvasWidth % spaceBetween
    sliderArray = Array(canvasWidth/spaceBetween + 1).fill(0).map(() => Array(canvasHeight/spaceBetween + 1).fill(0))
    resizeCanvas(canvasWidth, canvasHeight, false)
    slider_parent.firstChild.style.width = canvasWidth.toString() + "px"
}
