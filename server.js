/* =========================================================================
   CHAT UMG  -  Backend (Node.js + Express)
   -------------------------------------------------------------------------
   - Sirve el frontend estatico (carpeta /public)
   - Serie I  : POST /api/auth      -> reenvia a la API de login de Azure
   - Serie II : POST /api/mensajes  -> reenvia a la API de mensajes de Azure
                (incluye el token Bearer en la cabecera Authorization)
   ========================================================================= */

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* URLs de la API proporcionada por el curso */
const API_LOGIN = "https://backcvbgtmdesa.azurewebsites.net/api/login/authenticate";
const API_MENSAJES = "https://backcvbgtmdesa.azurewebsites.net/api/Mensajes";

/* ================================================================== */
/*  SERIE I  -  Autenticacion (proxy hacia la API de Azure)           */
/* ================================================================== */
app.post("/api/auth", async (req, res) => {
  try {
    const { Username, Password } = req.body || {};
    if (!Username || !Password) {
      return res.status(400).json({ error: "Username y Password son obligatorios." });
    }

    const r = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Username, Password })
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!r.ok) {
      return res.status(r.status).json({ error: "Credenciales invalidas o error de la API.", detalle: data });
    }
    return res.json(data);
  } catch (err) {
    console.error("Error en /api/auth:", err);
    return res.status(500).json({ error: "No se pudo contactar la API de autenticacion.", detalle: String(err) });
  }
});

/* ================================================================== */
/*  SERIE II  -  Envio de mensajes (proxy con token Bearer)           */
/* ================================================================== */
app.post("/api/mensajes", async (req, res) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth) {
      return res.status(401).json({ error: "Falta la cabecera Authorization (token Bearer)." });
    }

    const r = await fetch(API_MENSAJES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth // se reenvia el "Bearer xxxx" tal cual
      },
      body: JSON.stringify(req.body)
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!r.ok) {
      return res.status(r.status).json({ error: "La API rechazo el mensaje.", detalle: data });
    }
    return res.json(data);
  } catch (err) {
    console.error("Error en /api/mensajes (POST):", err);
    return res.status(500).json({ error: "No se pudo enviar el mensaje.", detalle: String(err) });
  }
});

/* ------------------------------------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
