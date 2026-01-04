import './style.css'
import './theme.ts'
import { initLogger } from './logs.js';
import './canvas.ts'
import './header.ts'

// TODO: remove unnecessary imports

// --- Buttons ---
import '@material/web/button/elevated-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

// --- FABs (Floating Action Buttons) ---
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';

// --- Icon Buttons ---
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';

// --- Icons ---
import '@material/web/icon/icon.js';

// --- Checkbox & Radio & Switch ---
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/switch/switch.js';

// --- Text Fields ---
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';

// --- Select / Menus ---
import '@material/web/select/filled-select.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/menu/sub-menu.js';

// --- Lists ---
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

// --- Dialogs ---
import '@material/web/dialog/dialog.js';

// --- Tabs ---
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';

// --- Chips ---
import '@material/web/chips/chip-set.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/chips/suggestion-chip.js';

// --- Progress Indicators ---
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';

// --- Sliders ---
import '@material/web/slider/slider.js';

// --- Divider ---
import '@material/web/divider/divider.js';

// --- Elevation (Optional utility) ---
import '@material/web/elevation/elevation.js';

// --- Focus Ring & Ripple (Usually internal, but exposable) ---
import '@material/web/focus/md-focus-ring.js';
import '@material/web/ripple/ripple.js';

window.addEventListener('load', () => {
  initLogger();
});

const descriptions = {
    iterations: "Controls detail level. Higher values create sharper edges but may slow down rendering.",
    hue: "Rotates the color palette. Adjust this to change the overall color theme of the fractal.",
    cx: "Controls the 'Real' number component of the fractal equation. Changing this dramatically morphs the fractal's overall shape.",
    cy: "Controls the 'Imaginary' number component of the fractal equation. Changing this dramatically morphs the fractal's overall shape.",
    type: "Mandelbrot Set: The classic \"map\" of the fractal universe. It shows where all connected Julia sets live.\nJulia Set: A specific shape defined by the cx and cy coordinates. Changing those sliders transforms the Julia set into infinite variations."
};

window.showInfo = function(type) {
    const dialog = document.getElementById('info-dialog');
    const title = document.getElementById('dialog-title');
    const content = document.getElementById('dialog-content');

    if (type === 'iterations') {
        title.innerText = "Iterations";
        content.innerText = descriptions.iterations;
    } else if (type === 'hue') {
        title.innerText = "Hue Shift";
        content.innerText = descriptions.hue;
    } else if (type === 'cx') {
        title.innerText = "Real Constant (cx)";
        content.innerText = descriptions.cx;
    } else if (type === 'cy') {
        title.innerText = "Imaginary Constant (cy)";
        content.innerText = descriptions.cy;
    } else if (type === 'type') {
        title.innerText = "Fractal Type";
        content.innerText = descriptions.type;
    }
    

    dialog.show(); 
}

window.about = function() {
  const dialog = document.getElementById('info-dialog');
  const title = document.getElementById('dialog-title');
  const content = document.getElementById('dialog-content');
  const action = dialog.querySelector('[slot="actions"]');
  
  title.innerText = "Fractal Generator";
  content.innerText = "This is just a hobby project that I had created when I first learnt about complex numbers 😅\n\nYou can also check out the source code of this website by clicking on the button (GitHub) below!";
  
  const linkBtn = document.createElement('md-outlined-button');
  linkBtn.innerText = "Github";
  linkBtn.onclick = () => window.open("https://github.com/nullptr-t-oss/Fractal", '_blank');
  
  action.insertBefore(linkBtn, action.firstChild);
  
  dialog.addEventListener('close', () => {
    linkBtn.remove();
  }, { once: true });
  
  dialog.show();
}
