const refs = {
  loginForm: document.getElementById("login-form"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("login-error"),
  refreshAppBtn: document.getElementById("refresh-app-btn"),
  refreshAppStatus: document.getElementById("refresh-app-status")
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

async function hardRefreshApp() {
  refs.refreshAppBtn.disabled = true;
  refs.refreshAppStatus.textContent = "Bezig met cache opschonen...";

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    localStorage.removeItem("travelapp-sw-reloaded");
    sessionStorage.removeItem("travelapp-sw-reloaded");

    refs.refreshAppStatus.textContent = "Gelukt. De app wordt opnieuw geladen...";
    setTimeout(() => {
      window.location.href = "./login.html?refresh=1";
    }, 350);
  } catch (error) {
    refs.refreshAppBtn.disabled = false;
    refs.refreshAppStatus.textContent = "Herstel lukte niet. Probeer opnieuw of gebruik een privévenster.";
  }
}

refs.refreshAppBtn?.addEventListener("click", hardRefreshApp);
