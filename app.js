const express = require("express");
const app = express();
const customerRoutes = require("./routes/customerRoutes");
const kundliRoutes = require("./routes/kundliRoutes")
const adminRoutes = require("./routes/adminRoutes"); 
const ecommerceRoutes = require("./routes/ecommerceRoute"); 
const astrologerRoutes = require("./routes/astrologerRoutes");
// const paymentRoutes = require("./routes/paymentRoutes")
const db = require("./config/db");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { initializeSocketIO } = require("./socket/service");
const { urlencoded } = require("body-parser");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 5018;

// app.use(helmet());

// Set Referrer-Policy to strict-origin-when-cross-origin
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(__dirname + ""));

// rahul
app.use('/gifs', express.static(__dirname + '/public/gifs'));

app.use(express.json());// Parse incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false }));
app.use(cors('*'));
db();
// // Define the API routes
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/astrologer", astrologerRoutes);
app.use('/api/kundli', kundliRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
// app.use("/api/kundli", kundliRoutes)
// app.use('/notification', notificationRoutes);

// app.use('/images', express.static('uploadImage'));

initializeSocketIO(io)

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
