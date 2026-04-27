require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sequelize = require("./config/database");
const cookieParse = require("cookie-parser");
const { verificarToken } = require("./Middleware/auth");

//Rutas
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
const customerController = require("./Controllers/customerController");

// Importar modelos
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

// Asociar modelos
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
};
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse());

const path = require("path");
const fs = require("fs");

const uploadsPath = path.join(__dirname, "uploads/profiles");
const evidencesPath = path.join(__dirname, "uploads/evidences");

[uploadsPath, evidencesPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("join_room", (user_id) => {
    if (user_id) {
      socket.join(user_id.toString());
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

//Rutas
app.use("/api", authRoutes);

app.use("/api", mobileRoutes);
app.get("/api/verify-email", customerController.verifyEmail);
app.use("/api", verificarToken);

//RUTAS PROTEGIDAS
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

// Conectar a BD
sequelize
  .authenticate()
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.log("Error en BD:", err));

// Iniciar servidor
const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
