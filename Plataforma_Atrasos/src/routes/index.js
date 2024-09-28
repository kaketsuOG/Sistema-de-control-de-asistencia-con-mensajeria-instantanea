const express = require('express');
const router = express.Router();


router.get("/invoice", (req, res) =>{
    res.send("invoice");
});

module.exports = router;