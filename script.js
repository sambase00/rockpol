// Destino de las solicitudes de demo. Rellena UNO de los dos:
//  - endpoint: URL de un servicio de formularios (Formspree, Getform, tu propia API…) que acepte POST JSON.
//  - email: dirección a la que se enviará la solicitud abriendo el cliente de correo del visitante.
const CONFIG = {
  endpoint: "",
  email: "",
};

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

document.getElementById("anio").textContent = new Date().getFullYear();

// Formulario de demo
const form = document.getElementById("form-demo");
const statusEl = document.getElementById("form-status");

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "form__status" + (type ? " " + type : "");
}

form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  let firstInvalid = null;
  for (const el of form.elements) {
    if (!el.willValidate) continue;
    const bad = !el.checkValidity();
    el.classList.toggle("invalid", bad);
    if (bad && !firstInvalid) firstInvalid = el;
  }
  if (firstInvalid) {
    setStatus("Revisa los campos marcados: faltan datos obligatorios o el correo no es válido.", "error");
    firstInvalid.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  if (data.web) return; // honeypot: lo ha rellenado un bot
  delete data.web;
  delete data.consentimiento;

  if (CONFIG.endpoint) {
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setStatus("Solicitud enviada. Te contactaremos muy pronto.", "ok");
    } catch {
      setStatus("No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.", "error");
    } finally {
      btn.disabled = false;
    }
    return;
  }

  if (CONFIG.email) {
    const body = [
      `Nombre: ${data.nombre}`,
      `Cargo: ${data.cargo || "-"}`,
      `Municipio / Cuerpo: ${data.municipio}`,
      `Plantilla: ${data.plantilla || "-"}`,
      `Correo: ${data.email}`,
      `Teléfono: ${data.telefono || "-"}`,
      "",
      data.mensaje || "",
    ].join("\n");
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Solicitud de demo ROCKPOL · " + data.municipio)}&body=${encodeURIComponent(body)}`;
    setStatus("Se ha abierto tu programa de correo con la solicitud lista para enviar.", "ok");
    return;
  }

  setStatus("El formulario aún no tiene un destino configurado (ver CONFIG en script.js).", "error");
});
