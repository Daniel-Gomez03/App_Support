// ============================================
// APP: PUNTO DE ENTRADA DEL BACKEND
// Configura Express, Socket.io, middlewares,
// rutas y la conexión a BD.
//
// ESTRATEGIA DE AUTENTICACIÓN EN DOS FASES:
//   Fase 1 — Rutas públicas montadas ANTES del
//   middleware verificarToken: authRoutes,
//   mobileRoutes y /verify-email no requieren
//   token del panel.
//   Fase 2 — app.use("/api", verificarToken)
//   actúa como barrera global; todo lo montado
//   DESPUÉS exige cookie token válida.
//
// SOCKET.IO:
//   Se crea un http.Server para que Express y
//   Socket.io compartan el mismo puerto.
//   app.set("io", io) expone la instancia a los
//   controladores vía req.app.get("io").
//   El evento join_room permite que los clientes
//   del panel se suscriban a notificaciones por
//   user_id sin necesidad de broadcast global.
//
// ASOCIACIONES DE MODELOS:
//   Todos los modelos se importan aquí antes de
//   llamar a associate() para evitar referencias
//   circulares entre archivos de modelo.
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const sequelize = require("./config/database");
const cookieParse = require("cookie-parser");
const { verificarToken } = require("./Middleware/auth");

// Rutas
const faqRoutes = require("./routes/faqsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const productModelRoutes = require("./routes/productModelRoutes");
const customerRoutes = require("./routes/customerRoutes");
const warrantyRoutes = require("./routes/warrantyRoutes");
const ticketStatusRoutes = require("./routes/ticketStatusRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const seccionRoutes = require("./routes/seccionRoutes");
const commentRoutes = require("./routes/commentRoutes");
const historialRoutes = require("./routes/historialRoutes");
const mobileRoutes = require("./routes/mobileRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const salidaRoutes = require("./routes/salidaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerController = require("./Controllers/customerController");
const { initPendingInfoJob } = require("./Utils/pendingInfoJob");

// Modelos — deben importarse todos antes de ejecutar associate()
// para que las referencias cruzadas entre modelos estén disponibles.
const Faqs = require("./models/Faqs");
const Category = require("./models/Category");
const Product = require("./models/Product");
const ProductModel = require("./models/ProductModel");
const Ticket = require("./models/Ticket");
const TicketStatus = require("./models/TicketStatus");
const TicketEvidence = require("./models/TicketEvidence");
const Customer = require("./models/Customer");
const Warranty = require("./models/Warranty");
const User = require("./models/User");
const Seccion = require("./models/Seccion");
const Permission = require("./models/Permission");
const TicketAssignment = require("./models/TicketAssignment");
const TicketComment = require("./models/TicketComment");
const TicketCommentAttachment = require("./models/TicketCommentAttachment");
const Rating = require("./models/Rating");
const Salida = require("./models/Salida");

const models = {
  Faqs,
  Category,
  Product,
  ProductModel,
  Ticket,
  TicketStatus,
  TicketEvidence,
  Customer,
  Warranty,
  User,
  Seccion,
  Permission,
  TicketAssignment,
  TicketComment,
  TicketCommentAttachment,
  Rating,
  Salida,
};
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

// ── Servidor ─────────────────────────────────
// http.Server envuelve Express para que Socket.io
// pueda reutilizar el mismo puerto.
const app = express();
const server = http.createServer(app);

// El origen "*" en Socket.io cubre clientes móviles
// (React Native) cuya IP varía en desarrollo.
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ── Middlewares globales ──────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse());

// ── Archivos estáticos ────────────────────────
// Los directorios se crean al iniciar para que
// multer nunca falle por un path inexistente.
const uploadsPath = path.join(__dirname, "uploads/profiles");
const evidencesPath = path.join(__dirname, "uploads/evidences");

[uploadsPath, evidencesPath].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Expone io a los controladores mediante req.app.get("io").
app.set("io", io);

// ── Socket.io ────────────────────────────────
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // El panel se suscribe a su propio user_id para
  // recibir notificaciones dirigidas sin broadcast global.
  socket.on("join_room", (user_id) => {
    if (user_id) socket.join(user_id.toString());
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// ── Ruta de salud ─────────────────────────────
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

// ── Rutas PÚBLICAS (sin verificarToken) ───────
// authRoutes y mobileRoutes tienen su propia
// autenticación (portal login / mobileAuth).
// /verify-email lo accede el cliente desde su
// correo, no desde el panel autenticado.
app.use("/api", authRoutes);
app.use("/api", mobileRoutes);
app.get("/api/verify-email", customerController.verifyEmail);

// ── Barrera de autenticación ──────────────────
// Todo lo montado a partir de aquí exige
// cookie token válida del panel.
app.use("/api", verificarToken);

// ── Rutas PROTEGIDAS ──────────────────────────
app.use("/api", faqRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", productModelRoutes);
app.use("/api", customerRoutes);
app.use("/api", warrantyRoutes);
app.use("/api", ticketStatusRoutes);
app.use("/api", ticketRoutes);
app.use("/api", userRoutes);
app.use("/api", seccionRoutes);
app.use("/api", commentRoutes);
app.use("/api", historialRoutes);
app.use("/api", ratingRoutes);
app.use("/api", salidaRoutes);
app.use("/api", dashboardRoutes);

// ── Base de datos ─────────────────────────────
sequelize
  .authenticate()
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.log("Error en BD:", err));

// ── Inicio del servidor ───────────────────────
// "0.0.0.0" enlaza a todas las interfaces de red,
// necesario para acceso desde la red local.
// initPendingInfoJob se llama dentro del callback
// para garantizar que io ya está activo.
const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  initPendingInfoJob(io);
});