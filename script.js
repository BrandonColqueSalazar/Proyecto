let users = JSON.parse(localStorage.getItem('users') || '{}');
let currentUser = localStorage.getItem('currentUser') || null;
let pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');

const loginForm = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const loginAlert = document.getElementById('login-alert');
const mainSection = document.getElementById('main-section');
const loginSection = document.getElementById('login-section');
const patientForm = document.getElementById('patient-form');
const formAlert = document.getElementById('form-alert');
const patientsTableBody = document.querySelector('#patients-table tbody');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');
const loginBtn = document.getElementById('login-btn');

function showAlert(element, message, type = 'danger') {
  element.textContent = message;
  element.className = `alert alert-${type} mt-3`;
  element.classList.remove('d-none');
  setTimeout(() => element.classList.add('d-none'), 4000);
}

togglePasswordBtn.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePasswordBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    togglePasswordBtn.textContent = '👁️';
  }
});

function validarFormulario(form) {
  form.classList.add('was-validated');
  return form.checkValidity();
}

function mostrarMain() {
  loginSection.style.display = 'none';
  mainSection.style.display = 'block';
  currentUserSpan.textContent = currentUser;
  actualizarTabla();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validarFormulario(loginForm)) return;

  loginBtn.disabled = true;

  const user = loginForm.username.value.trim();
  const pass = loginForm.password.value;

  if (users[user] && users[user] === pass) {
    currentUser = user;
    localStorage.setItem('currentUser', currentUser);
    mostrarMain();
    showAlert(loginAlert, 'Inicio de sesión exitoso.', 'success');
    loginForm.reset();
    loginForm.classList.remove('was-validated');
  } else {
    showAlert(loginAlert, 'Usuario o clave incorrectos.');
  }

  loginBtn.disabled = false;
});

registerBtn.addEventListener('click', () => {
  const user = loginForm.username.value.trim();
  const pass = loginForm.password.value;

  if (user.length < 3) {
    showAlert(loginAlert, 'El usuario debe tener al menos 3 caracteres.');
    return;
  }
  if (pass.length < 4) {
    showAlert(loginAlert, 'La clave debe tener al menos 4 caracteres.');
    return;
  }
  if (users[user]) {
    showAlert(loginAlert, 'El usuario ya existe.');
    return;
  }

  users[user] = pass;
  localStorage.setItem('users', JSON.stringify(users));
  showAlert(loginAlert, 'Cuenta creada con éxito. Ahora inicia sesión.', 'success');
});

logoutBtn.addEventListener('click', () => {
  if (confirm('¿Deseas cerrar sesión?')) {
    currentUser = null;
    localStorage.removeItem('currentUser');
    mainSection.style.display = 'none';
    loginSection.style.display = 'block';
    loginForm.reset();
    loginForm.classList.remove('was-validated');
    showAlert(loginAlert, 'Sesión cerrada.', 'info');
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function actualizarTabla() {
  const prioridad = { critico: 1, urgente: 2, moderado: 3, leve: 4 };
  pacientes.sort((a, b) => prioridad[a.gravedad] - prioridad[b.gravedad]);
  patientsTableBody.innerHTML = '';

  const contadores = { critico: 0, urgente: 0, moderado: 0, leve: 0 };

  pacientes.forEach((p, idx) => {
    contadores[p.gravedad]++;
    const tr = document.createElement('tr');
    tr.className = p.gravedad;
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.genero}</td>
      <td>${p.documento}</td>
      <td>${p.sintomas}</td>
      <td>${capitalize(p.gravedad)}</td>
      <td>${p.tratamiento}</td>
      <td>${p.medicamentos}</td>
      <td>${p.examenes}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${idx})" title="Eliminar paciente">🗑️</button>
      </td>
    `;
    patientsTableBody.appendChild(tr);
  });

  document.getElementById('count-critico').textContent = contadores.critico;
  document.getElementById('count-urgente').textContent = contadores.urgente;
  document.getElementById('count-moderado').textContent = contadores.moderado;
  document.getElementById('count-leve').textContent = contadores.leve;
}

window.eliminarPaciente = function (idx) {
  if (confirm('¿Seguro que quieres eliminar este paciente?')) {
    pacientes.splice(idx, 1);
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    actualizarTabla();
    showAlert(formAlert, 'Paciente eliminado.', 'info');
  }
};

function validarFormularioPaciente(form) {
  form.classList.add('was-validated');
  return form.checkValidity();
}

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validarFormularioPaciente(patientForm)) return;

  const nombre = patientForm.nombre.value.trim();
  const edad = parseInt(patientForm.edad.value);
  const genero = patientForm.genero.value;
  const documento = patientForm.documento.value.trim();
  const sintomas = patientForm.sintomas.value.trim();
  const gravedad = patientForm.gravedad.value;
  const tratamiento = patientForm.tratamiento.value.trim();
  const medicamentos = patientForm.medicamentos.value.trim();
  const examenes = patientForm.examenes.value;

  if (!/^[A-Za-z0-9]{5,}$/.test(documento)) {
    showAlert(formAlert, 'Documento debe tener al menos 5 caracteres alfanuméricos.');
    return;
  }

  const paciente = { nombre, edad, genero, documento, sintomas, gravedad, tratamiento, medicamentos, examenes };
  pacientes.push(paciente);
  localStorage.setItem('pacientes', JSON.stringify(pacientes));
  actualizarTabla();
  patientForm.reset();
  patientForm.classList.remove('was-validated');
  showAlert(formAlert, 'Paciente registrado con éxito.', 'success');

  if (gravedad === 'critico') {
    alert('¡Atención! Paciente crítico registrado.');
  }
});

if (currentUser) {
  mostrarMain();
}
