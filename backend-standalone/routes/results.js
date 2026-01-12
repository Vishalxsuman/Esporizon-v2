const express = require("express");
const router = express.Router();
const { getLatestResult, getHistory } = require("../engine/resultGenerator");

router.get("/latest", (req, res) => {
    const { gameType } = req.query;
    res.json(getLatestResult(gameType));
});

router.get("/history", (req, res) => {
    const { gameType } = req.query;
    res.json(getHistory(gameType));
});

module.exports = router;
