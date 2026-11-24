import { firebaseConfig, isConfigured } from './firebase-config.js';

const notConfiguredNotice = document.getElementById('not-configured-notice');
const loginCard = document.getElementById('login-card');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutLink = document.getElementById('logout-link');
const productForm = document.getElementById('product-form');
const formError = document.getElementById('form-error');
const saveBtn = document.getElementById('save-btn');
const listingsEl = document.getElementById('listings');
const progressBar = document.getElementById('upload-progress');
const progressSpan = progressBar.querySelector('span');

if (!isConfigured) {
  notConfiguredNotice.hidden = false;
} else {
  initAdmin();
}

async function initAdmin() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
  const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } =
    await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
  const { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } =
    await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');
  const { getStorage, ref, uploadBytesResumable, getDownloadURL } =
    await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginCard.hidden = true;
      adminPanel.hidden = false;
      logoutLink.hidden = false;
      watchListings();
    } else {
      loginCard.hidden = false;
      adminPanel.hidden = true;
      logoutLink.hidden = true;
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      loginError.textContent = 'Could not log in — check your email and password.';
      console.error(err);
    }
  });

  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const name = document.getElementById('p-name').value.trim();
    const category = document.getElementById('p-category').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const description = document.getElementById('p-description').value.trim();
    const stripeLink = document.getElementById('p-stripe-link').value.trim();
    const file = document.getElementById('p-photo').files[0];

    try {
      let photoURL = '';
      if (file) {
        const path = `products/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        photoURL = await new Promise((resolve, reject) => {
          progressBar.style.display = 'block';
          uploadTask.on('state_changed', (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressSpan.style.width = `${pct}%`;
          }, reject, async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          });
        });
      }

      await addDoc(collection(db, 'products'), {
        name, category, price, description, stripeLink, photoURL,
        status: 'available',
        createdAt: serverTimestamp(),
      });

      productForm.reset();
      progressBar.style.display = 'none';
      progressSpan.style.width = '0%';
    } catch (err) {
      formError.textContent = 'Something went wrong saving this listing. Try again.';
      console.error(err);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Listing';
    }
  });

  function watchListings() {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      renderListings(items);
    });
  }

  function renderListings(items) {
    if (items.length === 0) {
      listingsEl.innerHTML = '<p>No listings yet — add your first piece above.</p>';
      return;
    }
    listingsEl.innerHTML = items.map(p => `
      <div class="listing-row" data-id="${p.id}">
        <img src="${p.photoURL || ''}" alt="${escapeHtml(p.name)}">
        <div class="listing-info">
          <strong>${escapeHtml(p.name)}</strong>
          <span>$${Number(p.price).toFixed(2).replace(/\.00$/, '')} &middot; <span class="status-pill ${p.status}">${p.status}</span></span>
        </div>
        <div class="listing-actions">
          <button data-action="toggle">${p.status === 'sold' ? 'Mark Available' : 'Mark Sold'}</button>
          <button data-action="delete" class="danger">Delete</button>
        </div>
      </div>
    `).join('');

    listingsEl.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.listing-row');
        const id = row.dataset.id;
        const item = items.find(p => p.id === id);
        if (btn.dataset.action === 'toggle') {
          await updateDoc(doc(db, 'products', id), {
            status: item.status === 'sold' ? 'available' : 'sold',
          });
        } else if (btn.dataset.action === 'delete') {
          if (confirm(`Delete "${item.name}"? This can't be undone.`)) {
            await deleteDoc(doc(db, 'products', id));
          }
        }
      });
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
