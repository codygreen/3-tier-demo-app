import express from 'express';
import Products from '../models/products';
import axios from 'axios';
const router = express.Router();

const getService = (services, serviceName) => {
    return services.find(service => service.name === serviceName)
};

const getMongoDbLatency = async () => {
    const db_start = new Date();
    await Products.find();
    return new Date() - db_start;
};

const getUrlLatency = async (url) => {
    const url_start = new Date();
    const resp = await axios.get(url, {timeout:15})
    return new Date() - url_start;
};

router.get('/', (req, res) => {
    res.status(200).json({});
})

router.get('/:serviceName', async (req, res) => {
  try {
    const {url} = getService(req.app.get('services'), req.params.serviceName) || {};
    if(!url)
        res.status(404).json({});
    
    var latency = null;
    switch(req.params.serviceName) {
        case "database":
            latency = await getMongoDbLatency();
            break;
        case "inventory":
        default:
            latency = await getUrlLatency(`${url}/api/stats`);
    };
    res.status(200).json({
        "host": url,
        "latency": latency
    });
    
  } catch(error) {
    res.status(500).json(error);
  }
});

module.exports = router