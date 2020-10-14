const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const config = require('../config');


router.post('/connect', twilio.webhook({validate: false}), function(req, res, next) {
  var phoneNumber = req.body.phoneNumber;
  var callerId = config.twilioPhoneNumber;
  var twiml = new VoiceResponse();

  var dial = twiml.dial({ record: 'record-from-answer',  recordingStatusCallback: 'https://bhaskara2a.ngrok.io/recording'});
  if (phoneNumber) {
    dial.number({}, phoneNumber);
  } else {
    dial.client({statusCallbackEvent: 'initiated ringing answered completed',
                  statusCallback: 'https://bhaskara2a.ngrok.io/events',
                  statusCallbackMethod: 'POST'}, "support_agent");
  }

  res.send(twiml.toString());
});

module.exports = router;
