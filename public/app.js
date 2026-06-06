/* =========================================================================
   CHAT UMG - Logica del frontend (Series I y II)
   ========================================================================= */

const $ = (id) => document.getElementById(id);

const vistaLogin = $("vistaLogin");
const vistaChat = $("vistaChat");
const loginMsg = $("loginMsg");
const chatMsg = $("chatMsg");
const lista = $("listaMensajes");

const KEY_TOKEN = "umg_token";
const KEY_USER = "umg_usuario";

// Mensajes enviados en esta sesion (solo para verlos en pantalla)
let enviados = [];

/* ------------------------------------------------------------------ */
function setMsg(el, texto, tipo) {
  el.textContent = texto || "";
  el.className = "msg" + (tipo ? " " + tipo : "") + (el === chatMsg ? " msg-chat" : "");
}
function getToken() { return localStorage.getItem(KEY_TOKEN); }
function getUsuario() { return localStorage.getItem(KEY_USER); }

function extraerToken(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  return data.token || data.Token || data.access_token ||
         data.accessToken || data.bearer || data.Bearer || null;
}

function escapar(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ================================================================== */
/*  SERIE I  -  LOGIN                                                  */
/* ================================================================== */
async function login() {
  const usuario = $("usuario").value.trim();
  const password = $("password").value;

  if (!usuario || !password) {
    setMsg(loginMsg, "Ingresa usuario y contrasena.", "error");
    return;
  }

  const btn = $("btnLogin");
  btn.disabled = true;
  setMsg(loginMsg, "Verificando credenciales...");

  try {
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username: usuario, Password: password })
    });

    const data = await r.json();

    if (!r.ok) {
      setMsg(loginMsg, data.error || "No fue posible iniciar sesion.", "error");
      btn.disabled = false;
      return;
    }

    const token = extraerToken(data);
    if (!token) {
      setMsg(loginMsg, "La API respondio pero no se encontro el token.", "error");
      btn.disabled = false;
      return;
    }

    // Serie I, paso 5: guardar el token de forma segura
    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_USER, usuario);

    setMsg(loginMsg, "Acceso correcto.", "ok");
    entrarAlChat();
  } catch (err) {
    setMsg(loginMsg, "Error de conexion con el servidor.", "error");
  } finally {
    btn.disabled = false;
  }
}

/* ================================================================== */
/*  SERIE II  -  ENVIAR MENSAJE                                        */
/* ================================================================== */
async function enviarMensaje() {
  const contenido = $("contenido").value.trim();
  if (!contenido) return;

  const btn = $("btnEnviar");
  btn.disabled = true;
  setMsg(chatMsg, "Enviando...");

  try {
    const r = await fetch("/api/mensajes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // CRITICO Serie II: token Bearer en la cabecera Authorization
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({
        Cod_Sala: 0,
        Login_Emisor: getUsuario(),
        Contenido: contenido
      })
    });

    const data = await r.json();

    if (!r.ok) {
      if (r.status === 401) {
        setMsg(chatMsg, "Tu sesion expiro. Vuelve a iniciar sesion.", "error");
      } else {
        setMsg(chatMsg, data.error || "No se pudo enviar el mensaje.", "error");
      }
      btn.disabled = false;
      return;
    }

    // Mensaje enviado con exito: lo mostramos en pantalla
    enviados.push({ texto: contenido, hora: new Date() });
    pintarEnviados();

    $("contenido").value = "";
    autoResize($("contenido"));
    setMsg(chatMsg, "Mensaje enviado.", "ok");
    setTimeout(() => setMsg(chatMsg, ""), 2000);
  } catch (err) {
    setMsg(chatMsg, "Error de conexion al enviar.", "error");
  } finally {
    btn.disabled = false;
  }
}

// Dibuja en pantalla los mensajes enviados en esta sesion
function pintarEnviados() {
  if (enviados.length === 0) {
    lista.innerHTML = `<p class="vacio">Escribe abajo y envia tu primer mensaje.</p>`;
    return;
  }
  const yo = getUsuario();
  lista.innerHTML = enviados.map((m) => `
    <div class="burbuja mia">
      <div class="autor">${escapar(yo)}</div>
      <div class="texto">${escapar(m.texto)}</div>
      <div class="hora">${m.hora.toLocaleTimeString("es-GT")}</div>
    </div>`).join("");
  lista.scrollTop = lista.scrollHeight;
}

/* ================================================================== */
/*  Navegacion entre vistas                                           */
/* ================================================================== */
function entrarAlChat() {
  $("nombreUsuario").textContent = getUsuario();
  vistaLogin.hidden = true;
  vistaChat.hidden = false;
  pintarEnviados();
}

function logout() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  enviados = [];
  vistaChat.hidden = true;
  vistaLogin.hidden = false;
  $("password").value = "";
  setMsg(loginMsg, "");
}

function autoResize(t) {
  t.style.height = "auto";
  t.style.height = Math.min(t.scrollHeight, 120) + "px";
}

/* ------------------------------------------------------------------ */
$("btnLogin").addEventListener("click", login);
$("password").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
$("btnEnviar").addEventListener("click", enviarMensaje);
$("btnLogout").addEventListener("click", logout);

const ta = $("contenido");
ta.addEventListener("input", () => autoResize(ta));
ta.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
});

if (getToken() && getUsuario()) {
  entrarAlChat();
}
