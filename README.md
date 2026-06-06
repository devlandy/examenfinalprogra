# Chat UMG — Autenticación y Mensajería

Aplicación web full-stack para las tres series del laboratorio:

- **Serie I — Login:** `POST /api/login/authenticate`, guarda el token Bearer en `localStorage`.
- **Serie II — Enviar mensaje:** `POST /api/Mensajes` con el token en la cabecera `Authorization`.
- **Serie III — Ver mensajes:** consulta directa a SQL Server (tabla `[dbo].[Chat_Mensaje]`) en orden cronológico.

> Un navegador **no** puede conectarse directo a SQL Server, por eso se incluye un pequeño backend en **Node.js + Express** que: (1) sirve el frontend, (2) hace de puente con la API de Azure (evita CORS) y (3) consulta la base de datos para la Serie III.

## Estructura
```
chat-umg/
├── server.js          backend (Express + mssql)
├── package.json
├── public/
│   ├── index.html     interfaz (login + chat)
│   ├── style.css
│   └── app.js
└── README.md
```

## Ejecutar localmente
```bash
npm install
npm start
```
Luego abre http://localhost:3000

- Usuario: la parte antes de `@miumg.edu.gt` (ej. `ctezop`)
- Contraseña de prueba: `123456a`

## Variables de entorno (opcional, recomendado en producción)
`DB_SERVER`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`. Si no se definen, se usan los valores del enunciado.
