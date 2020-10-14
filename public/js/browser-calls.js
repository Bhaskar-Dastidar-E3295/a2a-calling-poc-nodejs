
var callStatus = $("#call-status");
var answerButton = $(".answer-button");
var callSupportButton = $(".call-support-button");
var hangUpButton = $(".hangup-button");
var callCustomerButtons = $(".call-customer-button");
var muteButton = $(".call-mute-button");
var muteAgentButton = $(".call-mute1-button");

function updateCallStatus(status) {
  callStatus.text(status);
}

console.log("Requesting Access Token...");
$(document).ready(function() {
  $.post("/token/generate", {page: window.location.pathname})
    .then(function(data){

      device = new Twilio.Device(data.token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true
      });

      device.on("ready", function(device) {
        console.log("Twilio.Device Ready!");
        updateCallStatus("Ready");
      });

      device.on("error", function(error) {
        console.log("Twilio.Device Error: " + error.message);
        updateCallStatus("ERROR: " + error.message);
      });

      device.on("connect", function( conn) {
        console.log("Successfully established call!");
        console.log('Muted call ',conn.isMuted());
        
        muteButton.click(function(){
          if(conn.isMuted()){
            conn.mute(false);
            updateCallStatus(" You are un muted ");
          }
          else{
            conn.mute(true);
            updateCallStatus(" You are muted ");
          }
          console.log('Muted call ',conn.isMuted());
        });
        
        hangUpButton.prop("disabled", false);
        callCustomerButtons.prop("disabled", true);
        callSupportButton.prop("disabled", true);
        answerButton.prop("disabled", true);

        if ("phoneNumber" in conn.message) {
          updateCallStatus(" Customer call" + conn.message.phoneNumber);
        } else {
          // This is a call from a website user to a support agent
          updateCallStatus("Agent call");
        }
      });

      device.on("disconnect", function(conn) {
        hangUpButton.prop("disabled", true);
        callCustomerButtons.prop("disabled", false);
        callSupportButton.prop("disabled", false);
        
        updateCallStatus("Ready");
      });

      device.on("mute", function(ismuted, conn){
        console.log('muting');
        conn.mute();
        console.log('is muted?', ismuted);
      });

      device.on("incoming", function(conn) {
        updateCallStatus("Incoming a2a call");

        conn.accept(function() {
          updateCallStatus("ongoing");
        });

        answerButton.click(function() {
          conn.accept();
        });

        muteAgentButton.click(function(){
          if(conn.isMuted()){
            conn.mute(false);
            updateCallStatus(" You are un muted ");
          }
          else{
            conn.mute(true);
            updateCallStatus(" You are muted ");
          }
          console.log('Muted call ',conn.isMuted());
        });
        answerButton.prop("disabled", false);
      });

    })
    .catch(function(err) {
      console.log(err);
      console.log("Could not get a token from server!");
    });

  initNewTicketForm();
});

function callCustomer(phoneNumber) {
  updateCallStatus("Calling " + phoneNumber + "...");

  var params = {"phoneNumber": phoneNumber};
  device.connect(params);
}

function callSupport() {
  updateCallStatus("Agent call");

  device.connect();
}

function mute(){
  updateCallStatus("Muting");
  device.connect(true);
  console.log('Muted');
}

function hangUp() {
  device.disconnectAll();
}

function initNewTicketForm() {
  var formEl = $(".new-ticket");
  var buttonEl = formEl.find(".btn.btn-primary");

  // button handler
  formEl.find("[type='button']").click(function(e) {
    $.ajax({
        url: '/tickets/new',
        type: 'post',
        data: formEl.serialize()
    })
    .done(function(){
      showNotification("Support ticket was created successfully.", "success")
      // clear form
      formEl.find("input[type=text], textarea").val("");
    })
    .fail(function(res) {
      showNotification("Support ticket request failed. " + res.responseText, "danger")
    });
  });
}

function showNotification(text, style) {
  var alertStyle = "alert-"+style;
  var alertEl = $(".alert.ticket-support-notifications");

  if (alertEl.length == 0) {
    alertEl = $("<div class=\"alert ticket-support-notifications\"></div>");
    $("body").before(alertEl);
  }

  alertEl.removeClass (function (index, css) {
    return (css.match (/(^|\s)alert-\S+/g) || []).join(' ');
  });

  alertEl.addClass(alertStyle);
  alertEl.html(text);

  setTimeout(clearNotifications, 4000)
}

function clearNotifications() {
  var alertEl = $(".alert.ticket-support-notifications");
  alertEl.remove();
}
