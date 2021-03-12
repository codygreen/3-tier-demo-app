import express from "express";

const router = express.Router();

const getService = (services, serviceName) =>
  services.find((service) => service.name === serviceName);

router.get("/", (req, res) => {
  res.status(200).json(req.app.get("services"));
});

router.get("/:serviceName", (req, res) => {
  const service = getService(req.app.get("services"), req.params.serviceName);
  if (service) res.status(200).json(service);
  else res.status(404).json({});
});

router.post("/:serviceName", (req, res) => {
  if (!req.body.url) {
    res.status(500).json("a service url is required");
    return;
  }

  const service = getService(req.app.get("services"), req.params.serviceName);
  if (!service) res.status(404).json({});

  service.url = req.body.url;
  res
    .status(200)
    .json(getService(req.app.get("services"), req.params.serviceName));
});

module.exports = router;
