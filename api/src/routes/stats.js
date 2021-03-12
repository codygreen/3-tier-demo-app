import express from "express";
import axios from "axios";
import Products from "../models/products";

const router = express.Router();

const getService = (services, serviceName) =>
  services.find((service) => service.name === serviceName);

const getMongoDbLatency = async () => {
  const dbStart = new Date();
  await Products.find();
  return new Date() - dbStart;
};

const getUrlLatency = async (url) => {
  const urlStart = new Date();
  await axios.get(url, { timeout: 15 });
  return new Date() - urlStart;
};

router.get("/", (req, res) => {
  res.status(200).json({});
});

router.get("/:serviceName", async (req, res) => {
  try {
    const { url } =
      getService(req.app.get("services"), req.params.serviceName) || {};
    if (!url) res.status(404).json({});

    let latency = null;
    switch (req.params.serviceName) {
      case "database":
        latency = await getMongoDbLatency();
        break;
      case "inventory":
      default:
        latency = await getUrlLatency(`${url}/api/stats`);
    }
    res.status(200).json({
      host: url,
      latency,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
