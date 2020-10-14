const express = require('express');
const router = express.Router();



// GET /events webhooks
router.post('/', function (req, res) {
  console.log('Event receieved : ', req.body.CallStatus);
  res.send("OK");
});

module.exports = router;
