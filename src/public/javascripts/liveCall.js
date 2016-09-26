  // Set up the Twilio "Device" (think of it as the browser's phone) with
        // our server-generated capability token, which will be inserted by the
        // EJS template system:
        Twilio.Device.setup(twilioToken);

// Register an event handler to be called when there is an incoming
// call:
Twilio.Device.incoming(function(connection) {
  connection.accept();
  $('p').html('Call in progress...');
});

// Register an event handler for when a call ends for any reason
Twilio.Device.disconnect(function(connection) {
  $('p').html('Awaiting incoming call...');
});

// Add a click event for the button, which will hang up the current
// call when clicked:
$('#hangup').click(function() {
  Twilio.Device.disconnectAll();
});
// Make an outbound call to the number given in the text field:
$('#call').on('click', function() {
  // The properties of this object will be sent as POST
  // Parameters to URL which generates TwiML.
  Twilio.Device.connect({
    CallerId: '+13197742149',
    PhoneNumber: $('#number').val(),
  });
});