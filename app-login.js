const refs = {
  loginForm: document.getElementById("login-form"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("login-error")
};

TravelApp.ensureDefaultUsers();
if (TravelApp.getCurrentUser()) {
  window.location.href = "index.html";
}

refs.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const ok = TravelApp.authenticate(refs.username.value.trim(), refs.password.value);
  if (!ok) {
    refs.loginError.textContent = "Inloggen mislukt. Controleer gebruikersnaam of wachtwoord.";
    return;
  }

  window.location.href = "index.html";
});
