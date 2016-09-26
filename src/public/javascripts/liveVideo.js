var session = TB.initSession(sessionId);
var clock;
var actualTime;
var sendEndSignal = true;
var streamCreatedStatus = false;
var endCallNotTrigger = true;
TB.registerScreenSharingExtension('chrome', chromeID);
// Initialize a Publisher, and place it into the element with id="publisher"
var subscriberOptions = {
  insertMode: 'append',
  width: '100%',
  height: '530px',
};
var publisherOptions = {
  width: '130px',
  height: '130px',
};
var publisherOptionsAudio = {
  width: '100%',
  height: '236px',
  videoSource: null,
  insertMode: 'append',
};
var audio = {
  insertMode: 'append',
  width: '100%',
  height: '150px',
  videoSource: null,
};
var screenPreview = {
  insertMode: 'append',
  width: '100%',
  height: '700px',
  videoSource: 'screen',
};
var pubOptions = {
  videoSource: null, };
if (mode === '1') {
  var publisher = TB.initPublisher(apiKey, 'publisher', publisherOptions);
}else if (mode === '2') {
  var publisher = TB.initPublisher(apiKey, 'pubVideo', publisherOptionsAudio);
}
var subscriber;
var subContainer = document.createElement('div');
// Attach event handlers
session.on({
  sessionConnected: function(event) {
    session.publish(publisher);
    if (mode === '2') {
      publisher.setStyle('backgroundImageURI', pictureUrl);
    }
  },
  streamCreated: function(event) {
    if (event.stream.videoType === 'screen') {
      session.subscribe(event.stream, 'screen-preview', screenPreview);
      $('#screen-preview').removeClass('hide');
      if (mode === '1') {
        buildingShareStructureVideo();
      }else {
        buildingShareStructureAudio();
      }
    }else {
      streamcreateActive();
      subContainer.id = 'stream-' + event.stream.streamId;
      document.getElementById('subVideo').appendChild(subContainer);
      if (mode === '1') {
        subscriber =
        session.subscribe(event.stream, subContainer, subscriberOptions);
      }else if (mode === '2') {
        subscriber = session.subscribe(event.stream, subContainer, audio);
        subscriber.setStyle('backgroundImageURI', pictureUrlSub);
      }
    }
  },
  streamDestroyed: function(event) {
    if (mode === '2') {
      $('.audioUserName').addClass('hide');
      if (event.stream.videoType === 'screen') {
        closeScreenShareStructure();
        $('#screen-preview').addClass('hide');
        $('#screen-preview').html('');
      }else {
        $('.waitingMessage').text('Voice Call disconnected...');
        /* $('.endCall')[0].click();*/
      }
    }else if (mode === '1') {
      if (event.stream.videoType === 'screen') {
        closeScreenShareStructure();
        $('#screen-preview').addClass('hide');
        $('#screen-preview').html('');
        subscriber.element.style.width = '100%';
        subscriber.element.style.height = '530' + 'px';
      }else {
        $('.waitingMessage').text('Voice Call disconnected...');
        /* $('.endCall')[0].click();*/
      }
    }

  },
  connectionDestroyed: function(event) {
    // $('.endCall').trigger('click');
  },
});
function streamcreateActive() {
  streamCreatedStatus = true;
  $('.unlockQuestion').addClass('hidden');
  $('.endCall').removeClass('hidden');
  clock = $('.clock').FlipClock(900, {
    countdown: true,
    callbacks: {
      interval: function() {
        var time = this.factory.getTime().time;
        if (time / 60 === 5) {
          $('#timer div:first').addClass('blink');
        }
        if (time / 60 === 1) {
          // Alert('testing popup');
          $('.commonMesg').fadeIn('200').removeClass('hide');
          $('.commonMesg p')
          .text('Last one minute remaining.');
        }
        if (time / 60 === 0) {
          // Alert('testing popup');
          $('.endCall').trigger('click');
        }
      },
    },
  });
  actualTime = $('.actualTime').FlipClock(172800, {
    countdown: true,
  });
  if (mode === '2') {
    audioConnectedUI();
  }else {
    $('.waitingMessage').addClass('hide');
  }
}

function audioConnectedUI() {
  $('.waitingMessage').text('Voice Call Connected...');
  $('.audioUserName').removeClass('hide');
}

function closeScreenShareStructure() {
  miniCloseShare();
  $('#subVideo').removeAttr('style');
  if (mode === '1') {
    /*$('.compareHeight').css('height', '480px');*/
    $('#subscribers').height('540px');
  }else {
    /*$('.compareHeight').css('height', '380px');*/
    $('#subscribers').height('380px');
    $('.audioUserName,.waitingMessage').removeClass('hide');
  }
  $('.screenShare_hide').show();
  $('#subVideo').removeClass('aduioMove videoMove');
}
function executeAfterInterval() {
  $.ajax({
    url: '/quickSupport/getQuestionAfterInterval',
    type: 'GET',
  })
  .done(function(data) {
    console.log(data);
  });
}
$(document).ready(function() {
  setInterval(function() {
    console.log('here');
    executeAfterInterval();
  }, 840000);
});
function miniCloseShare() {
  $('.screenViewRender').removeClass('col-md-12');
  $('.screenViewRender').addClass('col-md-6');
  $('.question_details').removeClass('col-md-12');
  $('.question_details').addClass('col-md-6');
  $('.greyBox').css('position', 'absolute');
  $('.btn_exitSharing').addClass('hidden');
  $('.endCall').removeClass('hidden');
}

function buildingShareStructureAudio() {
  $('.screenViewRender').removeClass('col-md-6');
  $('.screenViewRender').addClass('col-md-12');
  $('.question_details').removeClass('col-md-6');
  $('.question_details').addClass('col-md-12');
  $('.endCall').removeClass('hidden');
  $('.compareHeight').css('height', 'auto');
  $('.screenShare_hide').hide();
  $('.greyBox').css('position', 'static').css('width', '100%')
  .css('margin-top', '0px');
  $('.screenShare_question').css('height', 'auto');
  $('#subVideo').width('200px');
  $('#subscribers').height('700px');
  $('#subVideo').addClass('aduioMove');
  $('.audioUserName,.waitingMessage').addClass('hide');
}
function buildingShareStructureVideo() {
  $('.screenViewRender').removeClass('col-md-6');
  $('.screenViewRender').addClass('col-md-12');
  $('.question_details,.endCall').removeClass('col-md-6');
  $('.question_details').addClass('col-md-12');
  $('.screenShare_question').css('height', 'auto');
  $('.screenShare_hide').hide();
  $('.compareHeight').css('height', 'auto');
  $('.greyBox').css('position', 'static').css('width', '100%')
  .css('margin-top', '0px');
  $('#subscribers').height('700px');
  $('#subVideo').addClass('videoMove');
  $('.audioUserName,.waitingMessage').addClass('hide');
  subscriber.element.style.width = '130' + 'px';
  subscriber.element.style.height = '130' + 'px';
}

function destroySharedPersonView() {
  $('.screenViewRender').removeClass('col-md-12');
  $('.screenViewRender').addClass('col-md-6');
  $('.question_details').removeClass('col-md-12');
  $('.question_details').addClass('col-md-6');
  $('#subVideo').removeAttr('style');
  $('#subscribers').height('540px');
  $('.greyBox').css('position', 'absolute');
  $('.screenShare_hide').show();
  $('.btnScreen ').removeClass('hidden');
  $('.btn_exitSharing').addClass('hidden');
  $('.endCall').removeClass('hidden');
  $('#subVideo').removeClass('aduioMove videoMove');
  $('.audioUserName').removeClass('hide');
}

$('.btnScreen').click(function(event) {
  if ($('#screen-preview').is(':empty')) {
    screenshare();
  }else {
    $('#screenView').modal('show');
  }
});
$('#install-button').click(function(event) {
  chrome.webstore.install('https://chrome.google.com/webstore/detail/' +
            'lbhinppfgjemckangjaiofhpoajjbfim',
              function() { alert('Sucess');},
              function(detail) { alert('Failure:' + detail);});
});
var screenSharingPublisher;
function screenshare() {
      TB.checkScreenSharingCapability(function(response) {
        if (!response.supported || response.extensionRegistered === false) {
          alert('This browser does not support screen sharing.');
        } else if (response.extensionInstalled === false) {
          $('#installDownload').modal('show');
        } else {
          // Screen sharing is available. Publish the screen.
          screenSharingPublisher =
          TB.initPublisher('screen-preview', screenPreview);
          session.publish(screenSharingPublisher, function(error) {
            if (error) {
              $('#screen-preview').html('');
            }else {
              if (mode === '1') {
                buildingShareStructureVideo();
              }else {
                buildingShareStructureAudio();
              }
              $('#screen-preview').removeClass('hide');
              $('.btnScreen').addClass('hidden');
              $('.btn_exitSharing').removeClass('hidden');

            }
          });
          $('.btn_exitSharing').on('click', function(event) {
            /* Act on the event */
            screenSharingPublisher.destroy();
            exitsharingButton();
            $('.btn_exitSharing').addClass('hidden');
            $('.btnScreen').removeClass('hidden');
          });
          screenSharingPublisher.on('streamDestroyed', function(event) {
            if (event.reason === 'mediaStopped') {
              exitsharingButton();
            } else if (event.reason === 'forceUnpublished') {
              // A moderator forced the user to stop sharing.
            }
          });
        }
      });

    }

function exitsharingButton() {
  destroySharedPersonView();
  $('.btn_exitSharing').addClass('hidden');
  if (mode === '1') {
    subscriber.element.style.width = '100%';
    subscriber.element.style.height = '530' + 'px';
    $('#subscribers').height('540px');
  }else {
    $('.waitingMessage').removeClass('hide');
    $('.screenShare_question').css('height', 'auto');
    $('#subscribers').height('380px');
  } $('#screen-preview').addClass('hide');
}

session.connect(apiKey, token, function(error) {
  if (error) {
  }else {
    $('.controls_bar').removeClass('hide');
  }
});
session.on('signal', function(event) {
  $('.commonMesg').fadeOut('200').addClass('hide');
  if (event.type === 'signal:extendTimeRequest' &&
   event.from.id !== session.connection.id) {
    $('.extendPermisionMesg').fadeIn('200').removeClass('hide');
    $('.mesgExtend').text(event.data);
  }else if (event.type === 'signal:extendTimeReject' &&
    event.from.id !== session.connection.id) {
    $('.commonMesg').fadeIn('200').removeClass('hide');
    setTimeout(function() {
      $('.commonMesg').fadeOut('200').addClass('hide');
    }, 2500);
    $('.commonMesg p')
    .text(event.data + ' has rejected your time request');
  }else if (event.type === 'signal:extendTimeAccepted') {
    if (event.from.id !== session.connection.id) {
      $('.commonMesg').fadeIn('200').removeClass('hide');
      setTimeout(function() {
        $('.commonMesg').fadeOut('200').addClass('hide');
      }, 2500);
      $('.commonMesg p')
      .text(event.data + ' has accepted your time request');
    }
    var time = clock.getTime().time + 900;
    clock.timer._destroyTimer();
    clock = $('.clock').FlipClock(time, {
      countdown: true,
      callbacks: {
        interval: function() {
          var time = this.factory.getTime().time;
          $('#timer div:first').removeClass('blink');
          if (time / 60 === 5) {
            $('#timer div:first').addClass('blink');
          }
          if (time / 60 === 1) {
            // Alert('testing popup');
            $('.commonMesg').fadeIn('200').removeClass('hide');
            $('.commonMesg p')
            .text('Last one minute remaining. Please click to extend.');
          }
          if (time / 60 === 0) {
            // Alert('testing popup');
            $('.endCall').trigger('click');
          }
        },
      },
    });
  }else if (event.type === 'signal:Endcall' &&
    event.from.id !== session.connection.id) {
    sendEndSignalData();
  }
});

function sendEndSignalData() {
  sendEndSignal = false;
  $('.endCall').trigger('click');
}

$('.extendData').click(function(event) {
  if ($(this).attr('getResponder') === 'false') {
    $('.requesterMessage').removeClass('hide');
  }else {
    $('.requesterMessage').addClass('hide');
    session.signal({
    type: 'extendTimeRequest',
    data: $(this).attr('name'),
  },
  function(error) {
    if (error) {
      console.log('signal error: ' + error.message);
    } else {
      console.log('signal sent');
    }
  }
);
  }

});

$('.rejectExtendResponder').click(function(event) {
  $('.requesterMessage').addClass('hide');
});

$('.rejectExtend').click(function(event) {
  $('.extendPermisionMesg').fadeOut('200').addClass('hide');
  $('.requesterMessage').addClass('hide');
  session.signal({
    type: 'extendTimeReject',
    data: formatTextCapitalize($(this).attr('name')),
  },
  function(error) {
    if (error) {
      console.log('signal error: ' + error.message);
    } else {
      console.log('signal sent');
    }
  }
);
});


$('.acceptExtend').click(function(event) {
  $('.extendPermisionMesg').fadeOut('200').addClass('hide');
  $('.requesterMessage').addClass('hide');
  session.signal({
    type: 'extendTimeAccepted',
    data: formatTextCapitalize($(this).attr('name')),
  },
  function(error) {
    if (error) {
      console.log('signal error: ' + error.message);
    } else {
      extendMsg();
      console.log('signal sent');
    }
  }
);
});


function extendMsg() {
  var data = {
  parent: $('#skuValue').attr('skuvalue'),
  id: $('#responderCollection').attr('responderCollection'),
};
  console.log(data);
  $.ajax({
    url: '/quickSupport/postSku',
    type: 'POST',
    data: data,
  })
  .done(function() {
    console.log('success');
  })
  .fail(function() {
    console.log('error');
  })
  .always(function() {
    console.log('complete');
  });
}

$('.endCall').click(function(event) {
  endCallNotTrigger = false;
  var duration = 172800 - actualTime.getTime().time;
  var data;
  var getid = $(this).attr('data-id');
  var questionId = $(this).attr('data-ques-id');
  var url = $(this).attr('href');
  if ($(this).attr('responder') === 'true') {
    data = {finalData: {responderDuration: duration, status: 'pending'},
    id: getid, qId: questionId, };
  }else {
    data = {finalData: {requesterDuration: duration, status: 'pending'},
    id: getid, qId: questionId, };
  }
  $.ajax({
    url: '/quickSupport/postDuration',
    type: 'POST',
    data: data,
  })
  .success(function() {

    if (sendEndSignal) {
      session.signal({
        type: 'Endcall',
        data: 'endcall',
      },
    function(error) {
      if (error) {
        console.log('signal error: ' + error.message);
      } else {
        console.log('signal sent');
      }
    }
    );
    }
    setTimeout(function() {
      window.location.href = url;
    }, 1000);

  });
});

function formatTextCapitalize(x) {
  return x.replace(/\b\w/g, function(m) {
    return m.toUpperCase();
  });
}

window.onbeforeunload = confirmExit;
function confirmExit() {
  if (streamCreatedStatus && endCallNotTrigger) {
    return 'You have attempted to leave this page.  If you leave the page, ' +
    'your call will be ended. ' +
    'Are you sure you want to end the call?';
  }
}

/*$(window).bind('beforeunload', function(e) {
    var message = "Why are you leaving?";
    console.log(e);
   console.log(e.cancelBubble);
    e.returnValue = message; console.log(e.returnValue);
    return message;
});*/