const express = require("express");
const Payment = require("../models/Payments");
const router = express.Router();
const mongoose = require("mongoose");
const Cart = require("../models/Carts");
const ObjectId = mongoose.Types.ObjectId;

const verifyToken = require("../middleware/verifyToken");

// post payment information to db
router.post("/", async (req, res) => {
  const payment = req.body;
  try {
    const paymentRequest = await Payment.create(payment);

    //delete cart after payments
    const cartIds = payment.cartItems.map((id) => new ObjectId(id));
    const deletedCartRequest = await Cart.deleteMany({ _id: { $in: cartIds } });
    res.status(200).json({ paymentRequest, deletedCartRequest });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  // console.log(query);
  try {
    const decodedEmail = req.decoded.email;
    // console.log(decodedEmail);
    // console.log(email);
    if (email !== decodedEmail) {
      res.status(403).json({ message: "Forbidden Access" });
    }
    const result = await Payment.find(query).sort({ createdAt }).exec();
    // console.log(res.status(200).json(result));
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
