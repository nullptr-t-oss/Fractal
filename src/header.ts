const menuAnchor = document.getElementById('menu-anchor');
const menu = document.getElementById('app-menu') as any;
if (menuAnchor && menu) menuAnchor.addEventListener('click', () => { menu.open = !menu.open; });
