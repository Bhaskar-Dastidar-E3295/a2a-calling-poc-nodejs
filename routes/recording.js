const express = require('express');
const router = express.Router();



// GET /record webhooks
router.post('/', function (req, res) {
  console.log('Event receieved : ', req.body);
  res.send("OK");
});

module.exports = router;
