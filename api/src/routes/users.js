import express from "express";
import Users from "../models/users";
import Products from "../models/products";

const router = express.Router();

async function getCartItems(userId) {
  try {
    const user = await Users.findOne({ id: userId });
    if (!user) return null;

    const products = await Products.find();

    const cartItems = user.cartItems.map((id) =>
      products.find((product) => product.id === id)
    );
    return cartItems;
  } catch (err) {
    throw new Error(err);
  }
}

router.get("/:userId/cart", async (req, res) => {
  try {
    const cartItems = await getCartItems(req.params.userId);
    res.status(cartItems !== null ? 200 : 404).json(cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/:userId/cart", async (req, res) => {
  try {
    if (!req.body.productId) res.status(500).json("A productId is required");
    await Users.updateOne(
      { id: req.params.userId },
      { $addToSet: { cartItems: req.body.productId } }
    );

    const cartItems = await getCartItems(req.params.userId);
    res.status(cartItems !== null ? 200 : 404).json(cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:userId/cart/:productId", async (req, res) => {
  try {
    await Users.updateOne(
      { id: req.params.userId },
      { $pull: { cartItems: req.params.productId } }
    );

    const cartItems = await getCartItems(req.params.userId);
    res.status(cartItems !== null ? 200 : 404).json(cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
