const app = document.getElementById('app');

let currentUser = localStorage.getItem('currentUser');
let users = JSON.parse(localStorage.getItem('users') || '{}');

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function renderLogin() {
  app.innerHTML = `
    <h2>Login</h2>
    <input placeholder="Username" id="loginUser">
    <input placeholder="Password" id="loginPass" type="password">
    <button onclick="login()">Login</button>
    <p>Don't have an account? <a href="#" onclick="renderSignup()">Sign up</a></p>
  `;
}

function renderSignup() {
  app.innerHTML = `
    <h2>Sign Up</h2>
    <input placeholder="Username" id="signupUser">
    <input placeholder="Password" id="signupPass" type="password">
    <button onclick="signup()">Create Account</button>
    <p>Already have an account? <a href="#" onclick="renderLogin()">Login</a></p>
  `;
}

function signup() {
  const user = document.getElementById('signupUser').value;
  const pass = document.getElementById('signupPass').value;
  if (users[user]) {
    alert('User already exists');
    return;
  }
  users[user] = { password: pass, balance: 0, history: [] };
  saveUsers();
  alert('Account created!');
  renderLogin();
}

function login() {
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  if (!users[user] || users[user].password !== pass) {
    alert('Invalid credentials');
    return;
  }
  currentUser = user;
  localStorage.setItem('currentUser', currentUser);
  renderHome();
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  renderLogin();
}

function renderHome() {
  const data = users[currentUser];
  app.innerHTML = `
    <nav>
      <strong>Hello, ${currentUser}</strong> |
      <a href="#" onclick="renderHome()">Home</a>
      <a href="#" onclick="renderDeposit()">Deposit</a>
      <a href="#" onclick="renderTransfer()">Transfer</a>
      <a href="#" onclick="renderHistory()">History</a>
      <a href="#" onclick="clearHistory()">Clear History</a>
      <a href="#" onclick="logout()">Logout</a>
    </nav>
    <h2>Balance: ₹${data.balance.toFixed(2)}</h2>
  `;
}

function renderDeposit() {
  app.innerHTML += `
    <h3>Deposit Money</h3>
    <input type="number" id="depositAmount" placeholder="Enter amount">
    <button onclick="deposit()">Deposit</button>
  `;
}

function deposit() {
  const amt = parseFloat(document.getElementById('depositAmount').value);
  if (amt <= 0) return alert('Enter a valid amount');
  users[currentUser].balance += amt;
  users[currentUser].history.push({ type: 'Deposit', amount: amt, time: new Date().toLocaleString() });
  saveUsers();
  renderHome();
}

function renderTransfer() {
  app.innerHTML += `
    <h3>Transfer Money</h3>
    <input placeholder="To Username" id="toUser">
    <input type="number" id="transferAmount" placeholder="Amount">
    <button onclick="transfer()">Transfer</button>
  `;
}

function transfer() {
  const to = document.getElementById('toUser').value;
  const amt = parseFloat(document.getElementById('transferAmount').value);
  if (!users[to]) return alert('User not found');
  if (amt <= 0 || users[currentUser].balance < amt) return alert('Invalid or insufficient balance');

  users[currentUser].balance -= amt;
  users[to].balance += amt;

  users[currentUser].history.push({ type: 'Transfer to ' + to, amount: -amt, time: new Date().toLocaleString() });
  users[to].history.push({ type: 'Received from ' + currentUser, amount: amt, time: new Date().toLocaleString() });

  saveUsers();
  renderHome();
}

function renderHistory() {
  const history = users[currentUser].history || [];
  app.innerHTML += '<h3>Transaction History</h3>';
  if (!history.length) return app.innerHTML += '<p>No transactions yet.</p>';
  history.forEach(h => {
    app.innerHTML += `<p>${h.time} - ${h.type}: ₹${h.amount}</p>`;
  });
}

function clearHistory() {
  if (confirm('Clear all transaction history?')) {
    users[currentUser].history = [];
    saveUsers();
    renderHome();
  }
}

currentUser ? renderHome() : renderLogin();
