const express = require("express");
const router = express.Router();
const wallet = require("../engine/wallet");

router.get("/", (req, res) => {
    res.json(wallet.getWallet());
});

router.post("/deposit", (req, res) => {
    const { amount } = req.body;
    res.json(wallet.deposit(amount));
});

module.exports = router;
