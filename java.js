console.log("Holis es el avance dos");

import { getToken, removeToken } from './token.js';

const token = getToken();
if (!token) {
  window.location.replace('login.html'); 
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    removeToken();
    window.location.replace('login.html');
  });
}
