const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => res.render("legal/privacy"));
router.get("/terms", (req, res) => res.render("legal/terms"));

module.exports = router;
