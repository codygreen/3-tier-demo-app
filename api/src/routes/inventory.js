import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: inventory } = await axios.get(
    `${req.app.get('inventoryUrl')}/api/inventory`
    );

    res.status(200).json(inventory);
  } catch(error) {
    console.log(error)
  }
});

module.exports = router