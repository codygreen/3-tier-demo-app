import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

const productsRoutes = require("./routes/products");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vue-db', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(bodyParser.json());
app.use(cors());

var services = [
  {
    name: "database",
    url: process.env.MONGO_URL
  },
  {
    name: "inventory",
    url: process.env.INVENTORY_URL
  }
]

const getService = function(serviceName) {
  return services.find(service => service.name === serviceName);
};

app.use('/images', express.static(path.join(__dirname, '../assets')));
app.use('/api/products', productsRoutes);

app.get('/api/users/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  const client = await MongoClient.connect(
    `mongodb://${getService("database").url}:27017`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );
  const db = client.db('vue-db');  
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return res.status(404).json('Could not find user!');
  const products = await db.collection('products').find({}).toArray();
  const cartItemIds = user.cartItems;
  const cartItems = cartItemIds.map(id =>
    products.find(product => product.id === id));
  res.status(200).json(cartItems);
  client.close();
});

app.post('/api/users/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  const client = await MongoClient.connect(
    `mongodb://${getService("database").url}:27017`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );
  const db = client.db('vue-db');
  await db.collection('users').updateOne({ id: userId }, {
    $addToSet: { cartItems: productId },
  });
  const user = await db.collection('users').findOne({ id: userId });
  const products = await db.collection('products').find({}).toArray();
  const cartItemIds = user.cartItems;
  const cartItems = cartItemIds.map(id =>
    products.find(product => product.id === id));
  res.status(200).json(cartItems);
  client.close();
});

app.delete('/api/users/:userId/cart/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const client = await MongoClient.connect(
    `mongodb://${getService("database").url}:27017`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );
  const db = client.db('vue-db');

  await db.collection('users').updateOne({ id: userId }, {
    $pull: { cartItems: productId },
  });
  const user = await db.collection('users').findOne({ id: userId });
  const products = await db.collection('products').find({}).toArray();
  const cartItemIds = user.cartItems;
  const cartItems = cartItemIds.map(id =>
    products.find(product => product.id === id));

  res.status(200).json(cartItems);
  client.close();
});

app.get('/api/inventory', async (req, res) => {
  try {
    const { data: inventory } = await axios.get(
    `${getService("inventory").url}/api/inventory`
    );

    res.status(200).json(inventory);
  } catch(error) {
    console.log(error)
  }
});

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