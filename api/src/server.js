import express from "express";
import path from "path";
import cors from "cors";

import productsRoutes from "./routes/products";
import usersRoutes from "./routes/users";
import inventoryRoutes from "./routes/inventory";
import configRoutes from "./routes/config";
import statsRoutes from "./routes/stats";

const mongoose = require("mongoose");

const services = [
  {
    name: "database",
    url: process.env.MONGO_URL ?? "localhost",
  },
  {
    name: "inventory",
    url: process.env.INVENTORY_URL ?? "http://localhost:8002",
  },
];

mongoose.connect(
  `mongodb://${
    services.find((service) => service.name === "database").url
  }/vue-db`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();
app.use(cors());
app.set("services", services);

app.use("/images", express.static(path.join(__dirname, "../assets")));
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/config", configRoutes);
app.use("/api/stats", statsRoutes);

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
