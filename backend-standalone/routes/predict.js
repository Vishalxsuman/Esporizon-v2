const express = require("express");
const router = express.Router();

const { placeBet } = require("../engine/betManager");

router.post("/place-bet", (req, res) => {
    try {
        const result = placeBet(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
