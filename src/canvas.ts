import { GPU } from 'gpu.js';
import { addLog, initLogger, removeLastLog } from './logs.ts';

const itrSlider = document.getElementById('itr-slider');
const hueSlider = document.getElementById('hue-slider');
const cxSlider = document.getElementById('cx-slider');
const cySlider = document.getElementById('cy-slider');

const canvas = document.getElementById('mesh');

const gpu = new GPU({
  canvas: canvas,
  mode: 'gpu',
  webGlAttributes: { 
    highp: true // Request high precision floats
  }
});

// deprecated (using camera instead)
// let min = -2.0;
// let max = 2.0;

let inf = 10.0;
let initial_zx = 0.0;
let initial_zy = 0.0;

// warning ! for julia sets only 
let cx = 0.0;
let cy = 0.0;

let itr = 1000;
let spread = 15.0
export let hue = 0.772 // export for theme
let mode = 1 // 1 for Mandelbrot and 0 for Julia

/*

Camera Logic 

Ignore! I wrote this so that if I ever comeback to maintain or update it, I won't be completely zoned out 😅

Basically assume the canvas as a window (camera or canvas)  moving inside the fractal World
and we calculate min max on the fly using center of camera and windowWidth 
(we don't need windowHeight becoz in this case window/canvas is a square), 
decreasing or increasing windowWidth causes zoom in or zoom out

Analogy (for Minecraft players)
it's like overworld and nether. afaik travelling 1 block in nether = 8 blocks in overworld 
or we can say scale from nether to overworld is 8 
and for overworld to nether is 1/8 

let's assume y is const (elevation)

then x and z will change depending on pos of players
let's say player is at (x,z) ≡ (1,2) in nether and (x,z) ≡ (3,5) in overworld

now let's say the player had moved 
1 block in x dirn and 3 blocks in z dirn in NETHER
now in overworld that would translate to :
1 * 8 blocks in x dirn and 3 * 8 blocks in z dirn

so final coordinate in overworld (x,z) ≡ (3+8 , 5+24) ≡ (11,29)

or we can say : 
new_overworldX = overworldX + (dist_nether_X) * scale
new_overworldZ = overworldZ + (dist_nether_Z) * scale

for panning we'll use this 
for zooming , we'll modify worldWidth variable

min = center - (worldWidth / 2)
max = center + (worldWidth / 2)

worldWidth/2 for equal distribution


NOTE : when swiping right, world is moving right or camera is moving left
*/

let cameraX = 0.0;    // Center of the screen (World X)
let cameraY = 0.0;    // Center of the screen (World Y)
let worldWidth = 4.0; // How wide the view is (Zoom level)

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;


// Panning for PCs
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const pixel_dx = lastMouseX - e.clientX;
  
  // reverse for y becoz in Canvas y increases as we go down but in world it increases as we go up
  const pixel_dy = e.clientY - lastMouseY;
    
  const scale = worldWidth / canvas.width; // units per pixel
    
  // translate to woorld coords 
  const world_dx = pixel_dx * scale;
  const world_dy = pixel_dy * scale;

  // update camera pos (move window)
  cameraX += world_dx;
  cameraY += world_dy;
   
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  
  updateFractal();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

//Panning for Mobiles
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) { // Single tap or panning
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  // pan if it's one finger !
  if (!isDragging || e.touches.length !== 1) return;

  // Stop the browser from scrolling the page
  e.preventDefault();
  
  const pixel_dx = lastMouseX - e.touches[0].clientX;
  // reverse for y becoz in Canvas y increases as we go down but in world it increases as we go up
  const pixel_dy = e.touches[0].clientY - lastMouseY;
    
  const scale = worldWidth / canvas.width; // units per pixel
    
  // translate to woorld coords 
  const world_dx = pixel_dx * scale;
  const world_dy = pixel_dy * scale;

  // update camera pos (move window)
  cameraX += world_dx;
  cameraY += world_dy;
   
  lastMouseX = e.touches[0].clientX;
  lastMouseY = e.touches[0].clientY;
  
  updateFractal();
  
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isDragging = false;
});


/* 

Deprecated zoom implementation since it just zooms relative to the center of canvas or camera coords and not to the cursor position

Zooming? 
just decrease the worldWidth for zooming in and increase for zooming out
Let's say we want to zoom by 2x then decrease worldWidth by 2
input : 
initial dist b/w fingers : a (let's say)
final dist b/w fingers : 2a 

if scale = final / initial  = 2 ; then new_worldWidth = worldWidth / scale
or 
if scale = initial / final = 1/2 ; then new_worldWidth = worldWidth * scale

// Zooming 
let initialPinchDist = 0;
let initialWorldWidth = 0; // Snapshot of worldWidth when pinch starts

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    isDragging = false; // Disable panning to avoid jitters
        
    // Calculate distance between fingers
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    initialPinchDist = Math.sqrt(dx * dx + dy * dy);
        
    // Save the current width so we scale relative to the START of the pinch
    initialWorldWidth = worldWidth;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const currentDist = Math.sqrt(dx * dx + dy * dy);

    if (currentDist === 0) return; // prevent div by 0

    // If fingers spread (current > initial), scale < 1 (Zoom In)
    const scale = initialPinchDist / currentDist;

    worldWidth = initialWorldWidth * scale;
        
    updateFractal();
  }
}, { passive: false });

End initial implementation 

*/

/*
New zoom implementation 

when two fingers are touched for the first time, take the mid pt between them (anchor points)
and as we zoom pan the world such that the anchor point doesn't move in the canvas

*/

let initialPinchDist = 0;
let initialWorldWidth = 0;

let anchorWorldX = 0;
let anchorWorldY = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    isDragging = false; 

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    initialPinchDist = Math.sqrt(dx*dx + dy*dy);
    initialWorldWidth = worldWidth;

    // calc mid points between finger (Canvas)
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    // now convert pixel coord to fractal/world coord
    const unitsPerPixel = worldWidth / canvas.width;
    
    
    // note that we are using canvas.width and not worldWidth because midX and midY are pixel coords so use Canvas center and not world center (camerX and Y)
    const offsetX = midX - (canvas.width / 2); // Distance from center X
    const offsetY = midY - (canvas.width / 2); // Distance from center Y

    anchorWorldX = cameraX + (offsetX * unitsPerPixel);
    // Note: subtracting because y in Canvas is inverted (down is +) relative to world y
    anchorWorldY = cameraY - (offsetY * unitsPerPixel);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  
  if (e.touches.length === 2) {
    
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const currentDist = Math.sqrt(dx*dx + dy*dy);

    if (currentDist === 0) return;

    const scale = initialPinchDist / currentDist;
    worldWidth = initialWorldWidth * scale;

    // re align camera to acnhor
    // We calculate where the camera MUST be so that anchorWorldX is still under the fingers.
        
    const newUnitsPerPixel = worldWidth / canvas.width;

    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    const offsetX = midX - (canvas.width / 2);
    const offsetY = midY - (canvas.height / 2);

    // Reverse the Anchor formula: Camera = Anchor - Offset
    cameraX = anchorWorldX - (offsetX * newUnitsPerPixel);
    cameraY = anchorWorldY + (offsetY * newUnitsPerPixel); // Add here because of double negative logic

    updateFractal();
    }
}, { passive: false });


// Zooming for PCs
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();

  // Calculate the Anchor (World Point under mouse)
  const unitsPerPixel = worldWidth / canvas.width;
  const offsetX = e.clientX - (canvas.width / 2);
  const offsetY = e.clientY - (canvas.height / 2);

  const mouseWorldX = cameraX + (offsetX * unitsPerPixel);
  const mouseWorldY = cameraY - (offsetY * unitsPerPixel);

  const zoomFactor = 1.1;
  if (e.deltaY < 0) {
    worldWidth /= zoomFactor; // Zoom In
  } else {
    worldWidth *= zoomFactor; // Zoom Out
  }

  const newUnitsPerPixel = worldWidth / canvas.width;
    
  cameraX = mouseWorldX - (offsetX * newUnitsPerPixel);
  cameraY = mouseWorldY + (offsetY * newUnitsPerPixel);

  updateFractal();
}, { passive: false });



/*


Start test functions


*/

const initCanvas = gpu.createKernel(function() {
  this.color(this.thread.x / this.output.x, this.thread.y / this.output.y, this.thread.x / this.output.x, 1);
})
.setOutput([window.innerWidth, window.innerWidth])
.setGraphical(true)


function runGpuTest() {
  addLog("Starting GPU Matrix Test😪");
    
  if(GPU.isGPUSupported) {
    addLog(`GPU is supported! 😆`);
  } else {
    addLog(`GPU is not supported! 😭`);
  }
  try {
  
    addLog("Initializing GPU...😴");
    const gpu = new GPU();
    
    const size = 512;
    addLog(`Generating ${size}x${size} matrices⚡`);
    
    const generateMatrix = (r, c) => new Array(r).fill(0).map(() => new Array(c).fill(0).map(() => Math.random()));
    const a = generateMatrix(size, size);
    const b = generateMatrix(size, size);
    
    const multiplyMatrix = gpu.createKernel(function(a, b) {
      let sum = 0;
      for (let i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
      }
      return sum;
    }).setOutput([size, size]);

    const start = performance.now();
    const result = multiplyMatrix(a, b);
    const end = performance.now();

    const duration = (end - start).toFixed(2);
    addLog(`Calculation finished in ${duration}ms🕑`); // Using 'warn' color to make it pop
    addLog(`Result [0][0]: ${result[0][0]}😎`);

    addLog("GPU Matrix Test Complete!✅");
  } catch (error) {
    console.error(error);
    addLog(` ⚠️CRASH: ${error.message}❌`);
  }
}

/*



Main rendering part of Fractal !





*/


const renderFractal = gpu.createKernel(function(initial_zx, initial_zy, minX, maxX, minY, maxY, itr, inf, spread, hue, initial_cx, initial_cy, mode) {
  // NOTE: this.thread.x and .y are the pixel coordinates
  // NOTE: this.output.x and .y are the total width/height
 
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const coord_x = ((this.thread.x / this.output.x) * rangeX) + minX;
  const coord_y = ((this.thread.y / this.output.y) * rangeY) + minY;
 
  let zx = initial_zx;
  let zy = initial_zy;
  let cx = coord_x;
  let cy = coord_y;  
  
  if(mode == 0) {
    zx = coord_x;
    zy = coord_y;
    cx = initial_cx;
    cy = initial_cy;
  }
  
  let val = itr;
  
  for(let i = 0; i <= 1000; i++) {
    if(i > itr) {
      val = itr;
      break;
    }
    
    let new_zx = (zx * zx - zy * zy) + cx;
    let new_zy = 2.0 * zx * zy + cy;
    
    zx = new_zx;
    zy = new_zy;
    
    if ((zx * zx + zy * zy) > inf) {
     val = i;
     break;
    }
  }
  
  if(val < itr) {
    let smoothVal = val + 1.0 - Math.log((Math.log(zx * zx + zy * zy) / 2.0) / Math.log(2.0)) / Math.log(2.0);
    let color_idx = (smoothVal / itr) * spread + hue;
    
    // 2. Use 2.09 (approx 2π/3) to separate RGB phases
    const r = Math.sin(color_idx * 6.28 + 0.0) * 0.5 + 0.5;
    const g = Math.sin(color_idx * 6.28 + 2.09) * 0.5 + 0.5;
    const b = Math.sin(color_idx * 6.28 + 4.18) * 0.5 + 0.5;

    this.color(r, g, b, 1); 
  } else {
    this.color(0, 0, 0, 1);
  }

})
.setPrecision('unsigned')
.setOutput([window.innerWidth, window.innerWidth])
.setGraphical(true);

export function updateFractal() {
  try {
    
    const halfWidth = worldWidth / 2;
    const minX = cameraX - halfWidth;
    const maxX = cameraX + halfWidth;
    const minY = cameraY - halfWidth;
    const maxY = cameraY + halfWidth;
    
    removeLastLog();
    const start = performance.now();
    renderFractal(initial_zx, initial_zy, minX, maxX, minY, maxY, itr, inf, spread, hue, cx, cy, mode);
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    addLog(`Fractal Rendering Complete in ${duration}ms🔥`);
  } catch (error) {
    console.error("Render error:", error);
  }
}


try {
  initCanvas();
} catch (error) {
    console.error(error);
    addLog(` ⚠️CRASH: ${error.message}❌`);
}
addLog("Canvas Init Complete ✅");
runGpuTest();
addLog("Starting Fractal Rendering...😙");
try {

  const halfWidth = worldWidth / 2;
  const minX = cameraX - halfWidth;
  const maxX = cameraX + halfWidth;
  const minY = cameraY - halfWidth;
  const maxY = cameraY + halfWidth;
  
  const start = performance.now();
  renderFractal(initial_zx, initial_zy, minX, maxX, minY, maxY, itr, inf, spread, hue, cx, cy, mode);
  const end = performance.now();
  const duration = (end - start).toFixed(2);
  addLog(`Fractal Rendering Complete in ${duration}ms🔥`);
} catch (error) {
    console.error(error);
    addLog(`⚠️CRASH: ${error.message}❌`);
}


/*


Start slider and other dynamic variable logics
TODO : KEEP in a seperate file


*/

// Iteration Slider logic
itrSlider.addEventListener('input', (e) => {
    itr = parseInt(e.target.value);
    spread = (itr / 1000 ) * (14.0) + 1.0;
    updateFractal();
});

// Hue Slider logic
hueSlider.addEventListener('input', (e) => {
    hue = parseFloat(e.target.value);
    updateFractal();
});

// cx Slider logic
cxSlider.addEventListener('input', (e) => {
    cx = parseFloat(e.target.value);
    updateFractal();
});

// cy Slider logic
cySlider.addEventListener('input', (e) => {
    cy = parseFloat(e.target.value);
    updateFractal();
});



// Download Image from Canvas
window.downloadImage = function() {
    updateFractal();
    
    const link = document.createElement('a');
    link.download = `fractal-${Date.now()}.png`; // Unique filename
    link.href = canvas.toDataURL('image/png');
    
    link.click();
    
    addLog("Image Downloaded! 📸");
};

window.resetSettings = function() {
    itr = 1000;
    hue = 0.772;

    if (itrSlider) itrSlider.value = itr;
    if (hueSlider) hueSlider.value = hue;

    updateFractal();

    addLog("Settings Reset ⚙️"); 
};


// change set type
const chips = document.querySelectorAll('.set-chip');

chips.forEach(chip => {
  chip.addEventListener('click', (e) => {
    
    if (!chip.selected) {
      e.preventDefault(); 
      chip.selected = true;
      return;
    }

    chips.forEach(c => {
      if (c != chip) {
        c.selected = false;
      }
    });
    mode = chip.getAttribute('value'); // chip.value not working
    updateFractal();
  });
});