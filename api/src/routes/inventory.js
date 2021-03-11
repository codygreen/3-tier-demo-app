import express from 'express';
import axios from 'axios';
const router = express.Router();

const getService = (services, serviceName) => {
    return services.find(service => service.name === serviceName)
};

router.get('/', async (req, res) => {
  try {
    const { url: inventoryUrl} = getService(req.app.get('services'), "inventory");
    const { data: inventory } = await axios.get(`${inventoryUrl}/api/inventory`);
    res.status(200).json(inventory);
  } catch(error) {
    console.log(error)
  }
});

module.exports = router