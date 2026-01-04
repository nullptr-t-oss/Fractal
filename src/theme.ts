import { hue, updateFractal } from './canvas';

const fab = document.getElementById('theme-fab');
const dialog = document.getElementById('theme-dialog');
const chips = document.querySelectorAll('.theme-chip');
const hueSlider = document.getElementById('hue-slider');

fab.addEventListener('click', () => {
  dialog.show();
});

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
    const theme = chip.getAttribute('value'); // chip.value not working
    document.documentElement.classList.remove('theme-blue', 'theme-red', 'theme-purple');

    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    if(theme == 'default') { 
      // 0.772 
      hueSlider.value = 0.772;
      hueSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if(theme == 'red') { 
      // 0.281 
      hueSlider.value = 0.281;
      hueSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if(theme == 'blue') { 
      // 0.574
      hueSlider.value = 0.574;
      hueSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if(theme == 'purple') { 
      // 0.482
      hueSlider.value = 0.482;
      hueSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    
  });
});