import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

import productsRoutes from './routes/products';
import usersRoutes from './routes/users';
import inventoryRoutes from './routes/inventory'

const mongoose = require('mongoose');

var services = [
  {
    name: "database",
    url: process.env.MONGO_URL ?? "localhost"
  },
  {
    name: "inventory",
    url: process.env.INVENTORY_URL ?? "http://localhost:8002"
  }
]

const getService = function(serviceName) {
  return services.find(service => service.name === serviceName);
};

mongoose.connect(`mongodb://${getService("database").url}/vue-db`, {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.set('inventoryUrl', getService("inventory").url); 

app.use('/images', express.static(path.join(__dirname, '../assets')));
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inventory', inventoryRoutes);

// get the remote services urls
app.get('/api/config', async (req, res) => {
  res.status(200).json(services);
})

app.get('/api/config/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const service = getService(serviceName)
  if(service)
    res.status(200).json(service);
  else 
    res.status(404).json({"error": "service not found"});
})

app.post('/api/config/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const { url } = req.body;

  if(!url)
    res.status(404).json({"error": "a service url is required"});

  const service = getService(serviceName)

  if(service) {
    service.url = url;
    res.status(200).json(service);
  } else {
    res.status(404).json({"error": "service not found"});
  }
});

app.get('/api/stats', async (req, res) => {
  res.status(200).json({});
})

app.get('/api/stats/database', async (req, res) => {
  var payload = {};
  
  try {
    const db_start = new Date()
    const client = await MongoClient.connect(
      `mongodb://${getService("database").url}:27017`,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    const db = client.db('vue-db');
    const products = await db.collection('products').find({}).toArray();
    client.close();
    payload["host"] = `mongodb://${getService("database").url}:27017`;
    payload["latency"] = new Date() - db_start;
  } catch(err) {
    console.log(err);
  }
  res.status(200).json(payload);
})

app.get('/api/stats/inventory', async (req, res) => {
  var payload = {};

  try {
    const inv_start = new Date();
    const service = getService("inventory");
    const inv_resp = await axios.get(
      `${service.url}/api/stats`, {timeout:15}
    );
    payload["host"] = service.url;
    payload["latency"] = new Date() - inv_start;

  } catch(err) {
    console.log(err);
  }
  res.status(200).json(payload);
})

app.listen(8000, () => {
    console.log('Server is listening on port 8000');
});