/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
*/

//PART 1: Settings Section...
var dimensions = document.querySelector('#dimensions');
var stream;
var qvgaButton = document.querySelector('#qvga');
var vgaButton = document.querySelector('#vga');
var hdButton = document.querySelector('#hd');
var fullHdButton = document.querySelector('#full-hd');
var fourKButton = document.querySelector('#fourK');
var eightKButton = document.querySelector('#eightK');
var videoblock = document.querySelector('#videoblock');
var messagebox = document.querySelector('#errormessage');
var widthInput = document.querySelector('div#width input');
var widthOutput = document.querySelector('div#width span');
var aspectLock = document.querySelector('#aspectlock');
var sizeLock = document.querySelector('#sizelock');
var currentWidth = 0;
var currentHeight = 0;
var qvgaConstraints = {
    localVideo: {width: {exact: 320}, height: {exact: 240}}
};
var vgaConstraints = {
    localVideo: {width: {exact: 640}, height: {exact: 480}}
};
var hdConstraints = {
    localVideo: {width: {exact: 1280}, height: {exact: 720}}
};
var fullHdConstraints = {
    localVideo: {width: {exact: 1920}, height: {exact: 1080}}
};
var fourKConstraints = {
    localVideo: {width: {exact: 4096}, height: {exact: 2160}}
};
var eightKConstraints = {
    localVideo: {width: {exact: 7680}, height: {exact: 4320}}
};
var snapshotButton = document.querySelector('button#snapshot');
var filterSelect = document.querySelector('select#filter');
var localVideo = window.video = document.querySelector('video#localVideo'); //In global scope to make them available to the browser console.
var recordedVideo = document.querySelector('video#recorded');
var canvas = window.canvas = document.querySelector('canvas');

vgaButton.onclick = function() {
    getMedia(vgaConstraints);
};
qvgaButton.onclick = function() {
    getMedia(qvgaConstraints);
};
hdButton.onclick = function() {
    getMedia(hdConstraints);
};
fullHdButton.onclick = function() {
    getMedia(fullHdConstraints);
};
fourKButton.onclick = function() {
    getMedia(fourKConstraints);
};
eightKButton.onclick = function() {
    getMedia(eightKConstraints);
};
snapshotButton.onclick = function() {
    canvas.className = filterSelect.value;
    canvas.getContext('2d').drawImage(localVideo, 0, 0, canvas.width, canvas.height);
};
filterSelect.onchange = function() {
    localVideo.className = filterSelect.value;
    recordedVideo.className = filterSelect.value;
};
localVideo.onloadedmetadata = function() {
    displayVideoDimensions('loadedmetadata');
};
localVideo.onresize = function() {
    displayVideoDimensions('resize');
};
widthInput.onchange = constraintChange;
sizeLock.onchange = function() {
    if (sizeLock.checked) {
        console.log('Setting fixed size');
        localVideo.style.width = '100%';
    } else {
        console.log('Setting auto size');
        localVideo.style.width = 'auto';
    }
};

function gotVideoStream(mediaStream) {
    window.stream = mediaStream; // stream available to console
    messagebox.style.display = 'none';
    videoblock.style.display = 'block';
    var track = mediaStream.getVideoTracks()[0];
    var constraints = track.getConstraints();
    console.log('Result constraints: ' + JSON.stringify(constraints));
    if (constraints && constraints.width && constraints.width.exact) {
        widthInput.value = constraints.width.exact;
        widthOutput.textContent = constraints.width.exact;
    } else if (constraints && constraints.width && constraints.width.min) {
        widthInput.value = constraints.width.min;
        widthOutput.textContent = constraints.width.min;
    }
    // Streaming to peer connection part...
    trace('Received local stream');
    localVideo.srcObject = mediaStream;
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
}

function errorMessage(who, what) {
    var message = who + ': ' + what;
    messagebox.innerText = message;
    messagebox.style.display = 'block';
    console.log(message);
}

function clearErrorMessage() {
    messagebox.style.display = 'none';
}

function displayVideoDimensions(whereSeen) {
    if (localVideo.videoWidth) {
        dimensions.innerText = 'Actual video dimensions: ' + localVideo.videoWidth +
            'x' + localVideo.videoHeight + 'px.';
        if (currentWidth !== localVideo.videoWidth
            || currentHeight !== localVideo.videoHeight) {
            console.log(whereSeen + ': ' + dimensions.innerText);
            currentWidth = localVideo.videoWidth;
            currentHeight = localVideo.videoHeight;
        }
    } else {
        dimensions.innerText = 'Video not ready';
    }
}

function constraintChange(e) {
    widthOutput.textContent = e.target.value;
    var track = window.stream.getVideoTracks()[0];
    var constraints;
    if (aspectLock.checked) {
        constraints = {width: {exact: e.target.value},
            aspectRatio: {
                exact: localVideo.videoWidth / localVideo.videoHeight
            }};
    } else {
        constraints = {width: {exact: e.target.value}};
    }
    clearErrorMessage();
    console.log('applying ' + JSON.stringify(constraints));
    track.applyConstraints(constraints)
        .then(function() {
            console.log('applyConstraint success');
            displayVideoDimensions('applyConstraints');
        })
        .catch(function(err) {
            errorMessage('applyConstraints', err.name);
        });
}

function getMedia(constraints) {
    if (stream) {
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
    clearErrorMessage();
    videoblock.style.display = 'none';
    navigator.mediaDevices.getUserMedia(constraints)
        .then(gotVideoStream)
        .catch(function(e) {
            errorMessage('getUserMedia', e.name);
        });
}

//PART 2: Recording section...
var mediaSource = new MediaSource();
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
if (!isSecureOrigin) {
    alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
        '\n\nChanging protocol to HTTPS');
    location.protocol = 'HTTPS';
}

mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;
recordedVideo.addEventListener('error', function(ev) {
    console.error('MediaRecording.recordedMedia.error()');
    alert('Your browser can not play\n\n' + recordedVideo.src
        + '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);

function handleSuccess(stream) {
    recordButton.disabled = false;
    console.log('getUserMedia() got stream: ', stream);
    window.stream = stream;
    localVideo.srcObject = stream;
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

//start recorder...
var constraints = { audio: true, video: true };
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function handleStop(event) {
    console.log('Recorder stopped: ', event);
}

function toggleRecording() {
    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Continue Recording';
        playButton.disabled = false;
        downloadButton.disabled = false;
    }
}

function startRecording() {
    recordedBlobs = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: ''};
            }
        }
    }
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
    recordedVideo.controls = true;
}

function play() {
    var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    // workaround for non-seekable video taken from
    // https://bugs.chromium.org/p/chromium/issues/detail?id=642012#c23
    recordedVideo.addEventListener('loadedmetadata', function() {
        if (recordedVideo.duration === Infinity) {
            recordedVideo.currentTime = 1e101;
            recordedVideo.ontimeupdate = function() {
                recordedVideo.currentTime = 0;
                recordedVideo.ontimeupdate = function() {
                    delete recordedVideo.ontimeupdate;
                    recordedVideo.play();
                };
            };
        }
    });
}

function download() {
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'record.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

//PART 3: Devices section...
var audioInputSelect = document.querySelector('select#audioSource');
var audioOutputSelect = document.querySelector('select#audioOutput');
var videoSelect = document.querySelector('select#videoSource');
var selectors = [audioInputSelect, audioOutputSelect, videoSelect];

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);
audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;
videoSelect.onchange = start;

function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    var values = selectors.map(function(select) {
        return select.value;
    });
    selectors.forEach(function(select) {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label ||
                'microphone ' + (audioInputSelect.length + 1);
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
            option.text = deviceInfo.label || 'speaker ' +
                (audioOutputSelect.length + 1);
            audioOutputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
            videoSelect.appendChild(option);
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }
    selectors.forEach(function(select, selectorIndex) {
        if (Array.prototype.slice.call(select.childNodes).some(function(n) {
                return n.value === values[selectorIndex];
            })) {
            select.value = values[selectorIndex];
        }
    });
}

function attachSinkId(element, sinkId) {
    // Attach audio output device to video element using device/sink ID.
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(function() {
                console.log('Success, audio output device attached: ' + sinkId);
            })
            .catch(function(error) {
                var errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = 'You need to use HTTPS for selecting audio output ' +
                        'device: ' + error;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

function changeAudioDestination() {
    var audioDestination = audioOutputSelect.value;
    attachSinkId(localVideo, audioDestination);
}

// uncomment the line below to start the navigator...
start();
function start() {
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;
    var constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
    navigator.mediaDevices.getUserMedia(constraints).
    then(gotVideoStream).then(gotDevices).catch(handleError);
}

//Part 4: File-Transfer section
var localConnection;
var remoteConnection;
var sendChannel;
var receiveChannel;
var bitrateDiv = document.querySelector('div#bitrate');
var fileInput = document.querySelector('input#fileInput');
var downloadAnchor = document.querySelector('a#download');
var sendProgress = document.querySelector('progress#sendProgress');
var receiveProgress = document.querySelector('progress#receiveProgress');
var statusMessage = document.querySelector('span#status');
var receiveBuffer = [];
var receivedSize = 0;
var bytesPrev = 0;
var timestampPrev = 0;
var timestampStart;
var statsInterval = null;
var bitrateMax = 0;

function createConnection(peer) {
    var servers = null;
    localConnection = new RTCPeerConnection(servers);
    trace('Created local peer connection object localConnection');

    sendChannel = localConnection.createDataChannel('sendDataChannel');
    sendChannel.binaryType = 'arraybuffer';
    trace('Created send data channel');

    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;
    localConnection.onicecandidate = function(e) {
        onIceCandidate(localConnection, e);
    };

    localConnection.createOffer().then(
        gotDescription1,
        onCreateSessionDescriptionError
    );
    remoteConnection = remoteConnection = new RTCPeerConnection(peer);
    trace('Created remote peer connection object remoteConnection');

    remoteConnection.onicecandidate = function(e) {
        onIceCandidate(remoteConnection, e);
    };
    remoteConnection.ondatachannel = receiveChannelCallback;

    fileInput.disabled = true;
}

function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
}

function sendData() {
    var file = fileInput.files[0];
    trace('File is ' + [file.name, file.size, file.type,
        file.lastModifiedDate
    ].join(' '));

    // Handle 0 size files.
    statusMessage.textContent = '';
    downloadAnchor.textContent = '';
    if (file.size === 0) {
        bitrateDiv.innerHTML = '';
        statusMessage.textContent = 'File is empty, please select a non-empty file';
        closeDataChannels();
        return;
    }
    sendProgress.max = file.size;
    receiveProgress.max = file.size;
    var chunkSize = 16384;
    var sliceFile = function(offset) {
        var reader = new window.FileReader();
        reader.onload = (function() {
            return function(e) {
                sendChannel.send(e.target.result);
                if (file.size > offset + e.target.result.byteLength) {
                    window.setTimeout(sliceFile, 0, offset + chunkSize);
                }
                sendProgress.value = offset + e.target.result.byteLength;
            };
        })(file);
        var slice = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
}

function closeDataChannels() {
    trace('Closing data channels');
    sendChannel.close();
    trace('Closed data channel with label: ' + sendChannel.label);
    if (receiveChannel) {
        receiveChannel.close();
        trace('Closed data channel with label: ' + receiveChannel.label);
    }
    localConnection.close();
    remoteConnection.close();
    localConnection = null;
    remoteConnection = null;
    trace('Closed peer connections');

    // re-enable the file select
    fileInput.disabled = false;
}

function gotDescription1(desc) {
    localConnection.setLocalDescription(desc);
    trace('Offer from localConnection \n' + desc.sdp);
    remoteConnection.setRemoteDescription(desc);
    remoteConnection.createAnswer().then(
        gotDescription2,
        onCreateSessionDescriptionError
    );
}

function gotDescription2(desc) {
    remoteConnection.setLocalDescription(desc);
    trace('Answer from remoteConnection \n' + desc.sdp);
    localConnection.setRemoteDescription(desc);
}

function receiveChannelCallback(event) {
    trace('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.binaryType = 'arraybuffer';
    receiveChannel.onmessage = onReceiveMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;

    receivedSize = 0;
    bitrateMax = 0;
    downloadAnchor.textContent = '';
    downloadAnchor.removeAttribute('download');
    if (downloadAnchor.href) {
        URL.revokeObjectURL(downloadAnchor.href);
        downloadAnchor.removeAttribute('href');
    }
}

function getOtherPc(pc) {
    return (pc === localConnection) ? remoteConnection : localConnection;
}

function getName(pc) {
    return (pc === localConnection) ? 'localPeerConnection' :
        'remotePeerConnection';
}

function onIceCandidate(pc, event) {
    getOtherPc(pc).addIceCandidate(event.candidate)
        .then(
            function() {
                onAddIceCandidateSuccess(pc);
            },
            function(err) {
                onAddIceCandidateError(pc, err);
            }
        );
    trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
        event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess() {
    trace('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    trace('Failed to add Ice Candidate: ' + error.toString());
}

function onReceiveMessageCallback(event) {
    trace('Received Message ' + event.data.byteLength);
    receiveBuffer.push(event.data);
    receivedSize += event.data.byteLength;

    receiveProgress.value = receivedSize;

    // we are assuming that our signaling protocol told
    // about the expected file size (and name, hash, etc).
    var file = fileInput.files[0];
    if (receivedSize === file.size) {
        var received = new window.Blob(receiveBuffer);
        receiveBuffer = [];

        downloadAnchor.href = URL.createObjectURL(received);
        downloadAnchor.download = file.name;
        downloadAnchor.textContent =
            'Click to download \'' + file.name + '\' (' + file.size + ' bytes)';
        downloadAnchor.style.display = 'block';

        var bitrate = Math.round(receivedSize * 8 /
            ((new Date()).getTime() - timestampStart));
        bitrateDiv.innerHTML = '<strong>Average Bitrate:</strong> ' +
            bitrate + ' kbits/sec (max: ' + bitrateMax + ' kbits/sec)';

        if (statsInterval) {
            window.clearInterval(statsInterval);
            statsInterval = null;
        }
        closeDataChannels();
    }
}

function onSendChannelStateChange(peer, file) {
    var readyState = sendChannel.readyState;
    trace('Send channel state is: ' + readyState);
    if (readyState === 'open') {
        sendData();
        var sender = peer.sendFile(file);
    }
}

function onReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    trace('Receive channel state is: ' + readyState);
    if (readyState === 'open') {
        timestampStart = (new Date()).getTime();
        timestampPrev = timestampStart;
        statsInterval = window.setInterval(displayStats, 500);
        window.setTimeout(displayStats, 100);
        window.setTimeout(displayStats, 300);
    }
}

function displayStats() {
    // display bitrate statistics.
    var display = function(bitrate) {
        bitrateDiv.innerHTML = '<strong>Current Bitrate:</strong> ' +
            bitrate + ' kbits/sec';
    };

    if (remoteConnection && remoteConnection.iceConnectionState === 'connected') {
        if (adapter.browserDetails.browser === 'chrome') {
            // TODO: once https://code.google.com/p/webrtc/issues/detail?id=4321
            // lands those stats should be preferrred over the connection stats.
            remoteConnection.getStats(null, function(stats) {
                for (var key in stats) {
                    var res = stats[key];
                    if (timestampPrev === res.timestamp) {
                        return;
                    }
                    if (res.type === 'googCandidatePair' &&
                        res.googActiveConnection === 'true') {
                        // calculate current bitrate
                        var bytesNow = res.bytesReceived;
                        var bitrate = Math.round((bytesNow - bytesPrev) * 8 /
                            (res.timestamp - timestampPrev));
                        display(bitrate);
                        timestampPrev = res.timestamp;
                        bytesPrev = bytesNow;
                        if (bitrate > bitrateMax) {
                            bitrateMax = bitrate;
                        }
                    }
                }
            });
        } else {
            // Firefox currently does not have data channel stats. See
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1136832
            // Instead, the bitrate is calculated based on the number of
            // bytes received.
            var bytesNow = receivedSize;
            var now = (new Date()).getTime();
            var bitrate = Math.round((bytesNow - bytesPrev) * 8 /
                (now - timestampPrev));
            display(bitrate);
            timestampPrev = now;
            bytesPrev = bytesNow;
            if (bitrate > bitrateMax) {
                bitrateMax = bitrate;
            }
        }
    }
}

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}

//Part 5: Livestreaming section...
var room = location.search && location.search.split('?')[1]; // grab the room from the URL
if (room) {
    setRoom(room);
}
else {
    $('#createRoom').submit(function () {
        var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
        //alert('Value of value 1: '+val);
        webrtc.createRoom(val, function (err, name) {
            console.log(' create room cb', arguments);

            var newUrl = location.pathname + '?' + name;
            if (!err) {
                history.replaceState({foo: 'bar'}, null, newUrl);
                setRoom(name);
            } else {
                console.log(err);
            }
        });
        return false;
    });
    $('#joinConference').submit(function () {
        var val = $('#sessionJoinInput').val();
        var newUrl = location.pathname + '?' + val;
        alert('Value of new URL: '+ newUrl);
        window.location.href = newUrl;
        return false;
    });
}

var webrtc = new SimpleWebRTC({
    // create our webrtc connection
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true
    /*
    // dont negotiate media
    receiveMedia: {
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 0
    }
    */
});
var button = $('#screenShareButton');
var setButton = function (bool) {
    button.text(bool ? 'Share Screen' : 'Stop Sharing');
};

webrtc.on('readyToCall', function () {
    // when it's ready, join if we got a room from the URL
    // you can name it anything
    if (room) webrtc.joinRoom(room);
});
webrtc.on('channelMessage', function (peer, label, data) {
    if (data.type == 'volume') {
        showVolume(document.getElementById('volume_' + peer.id), data.volume);
    }
});
webrtc.on('videoAdded', function (video, peer) {
    console.log('video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + webrtc.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        video.onclick = function () {
            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';
        };
        //d.appendChild(vol);
        remotes.appendChild(d);
    }
    if (peer && peer.pc) {
        var connstate = document.createElement('div');
        connstate.className = 'connectionstate';
        d.appendChild(connstate);
        peer.pc.on('iceConnectionStateChange', function (event) {
            switch (peer.pc.iceConnectionState) {
                case 'checking':
                    connstate.innerText = 'Connecting to peer...';
                    break;
                case 'connected':
                    connstate.innerText = 'Connected.';
                    break;
                case 'completed': // on caller side
                    connstate.innerText = 'Connected.';
                    break;
                case 'disconnected':
                    connstate.innerText = 'Disconnected.';
                    break;
                case 'failed':
                    break;
                case 'closed':
                    connstate.innerText = 'Connection closed.';
                    break;
            }
        });
    }
});
webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById('container_' + webrtc.getDomId(peer));
    if (remotes && el) {
        remotes.removeChild(el);
    }
});
webrtc.on('volumeChange', function (volume, treshold) {
    //console.log('changed volume', volume);
    showVolume(document.getElementById('localVolume'), volume);
});
webrtc.on('localScreenStopped', function () {
    setButton(true);
});
webrtc.on('localScreenAdded', function (video) {
    video.onclick = function () {
        video.style.width = video.videoWidth + 'px';
        video.style.height = video.videoHeight + 'px';
    };
    document.getElementById('localScreenContainer').appendChild(video);
    $('#localScreenContainer').show();
});
webrtc.on('localScreenRemoved', function (video) {
    document.getElementById('localScreenContainer').removeChild(video);
    $('#localScreenContainer').hide();
});
button.click(function () {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
        setButton(true);
    } else {
        webrtc.shareScreen(function (err) {
            if (err) {
                setButton(true);
                trace('Screen sharing error: ' + err);
            } else {
                setButton(false);
            }
        });
    }
});

function setRoom(name) {
    $('#createRoom').remove();
    $('#heading').text(name);
    $('#subTitle').html('URL To Join Conference: <input type="text" value="'+location.href+'" id="myInput">\n' +
        '<button onclick="copyToClipborad()">Copy text</button>');
    $('#container').addClass('active');
}
setButton(true);

//Part 6: Audiorecording section...
$(function($){
    $.audioRecorder = function(options){
        var settings = $.extend({
            bufferLen:4096,
            workerSrc:{
                wav:'javascript/audiorecorder_worker_wav.js',
                mp3:'javascript/audiorecorder_worker_mp3.js'
            },
            getFileName:null,
            onaccept:function(){},
            onerror:function(){},
            onstart:function(){},
            onstop:function(){},
            onencode:function(){},
            onsuccess:function(){}
        }, options );

        // Get cross browser audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        this.uuid = 0;
        var audioContext = new AudioContext();
        var audioInput = null;
        var realAudioInput = null;
        var inputPoint = null;
        var audioRecorder = null;
        //var rafID = null;
        //var analyserContext = null;
        //var audioDownloads = [];
        var worker = new Worker( settings.workerSrc.wav );
        var mp3Worker = new Worker( settings.workerSrc.mp3 );

        document.querySelector('#sendvoicemsg').addEventListener('click', function() {
            // The AudioContext was not allowed to start.
            // It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
            //audioContext = new AudioContext();
        });

        this.init = init;
        function init(){
            // Browser targeting
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            navigator.cancelAnimationFrame = navigator.cancelAnimationFrame || navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
            navigator.requestAnimationFrame = navigator.requestAnimationFrame || navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

            // Get access to user media
            navigator.getUserMedia({
                audio:true
            }, gotAudioStream, function(e){
                settings.onerror(e);
                $(window).trigger('audiorecorder:error', [e]);
            });
        }

        function gotAudioStream(stream){
            // Run accept event
            settings.onaccept(stream);
            $(window).trigger('audiorecorder:accept', [stream]);
            inputPoint = audioContext.createGain();

            // Create an AudioNode from the stream.
            realAudioInput = audioContext.createMediaStreamSource(stream);
            audioInput = realAudioInput;
            audioInput.connect(inputPoint);
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            inputPoint.connect( analyserNode );
            audioRecorder = new Recorder( inputPoint );
            var zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            inputPoint.connect( zeroGain );
            zeroGain.connect( audioContext.destination );
        }

        this.Recorder = Recorder;
        function Recorder( source ){
            var uuid;
            var bufferLen = settings.bufferlen;
            var recording = false, currCallback;

            this.context = source.context;
            this.context.createJavaScriptNode = this.context.createJavaScriptNode || this.context.createScriptProcessor;
            this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);

            worker.postMessage({
                command: 'init',
                config: {
                    sampleRate: this.context.sampleRate
                },
                uuid:uuid
            });

            this.node.onaudioprocess = function(e){
                if(!recording) return;
                worker.postMessage({
                    command: 'record',
                    buffer: [ e.inputBuffer.getChannelData(0) ], //, e.inputBuffer.getChannelData(1) ]
                    uuid:uuid
                });
            };

            this.configure = function(cfg){
                for (var prop in cfg){
                    if (cfg.hasOwnProperty(prop)){
                        config[prop] = cfg[prop];
                    }
                }
            };

            this.setUuid = function(id){
                uuid = id;
            };

            this.record = function(){
                settings.onstart();
                $(window).trigger('audiorecorder:start');
                recording = true;
            };

            this.stop = function(){
                settings.onstop();
                $(window).trigger('audiorecorder:stop');
                recording = false;
            };

            this.cancel = function(){
                recording = false;
            };

            this.clear = function(){
                worker.postMessage({ command: 'clear', uuid:uuid });
            };

            this.getBuffers = function(cb){
                currCallback = cb;
                worker.postMessage({ command: 'getBuffers', uuid:uuid })
            };

            this.exportWAV = function(cb, type){
                currCallback = cb;
                type = type || 'audio/wav';
                worker.postMessage({
                    command: 'exportWAV',
                    type: type,
                    uuid:uuid
                });
            };

            this.exportMonoWAV = function(uuid, cb, type){
                currCallback = cb;
                type = type || 'audio/wav';
                worker.postMessage({
                    command: 'exportMonoWAV',
                    type: type,
                    uuid: uuid
                });
            };

            worker.onmessage = function(e){
                currCallback( e.data );
            };

            source.connect(this.node);
            this.node.connect(this.context.destination);
        }

        this.start = start;
        function start(){
            if(!audioRecorder) return;
            this.uuid++;
            audioRecorder.setUuid(this.uuid);
            audioRecorder.clear();
            audioRecorder.record();
        }

        this.cancel = cancel;
        function cancel(){
            audioRecorder.cancel();
        }

        this.stop = stop;
        function stop(){
            audioRecorder.stop();
            audioRecorder.getBuffers( gotBuffers );
        }

        function gotBuffers( data ){
            var buffers = data.buffers;
            audioRecorder.exportMonoWAV( this.uuid, doneEncoding );
        }

        function doneEncoding( data ){
            var uuid = data.uuid;
            var blob = data.blob;
            settings.onencode(uuid, blob);
            $(window).trigger('audiorecorder:encode', [uuid, blob]);

            var arrayBuffer;
            var fileReader = new FileReader();
            fileReader.onload = function(){
                arrayBuffer = this.result;
                var buffer = new Uint8Array(arrayBuffer);
                var data = parseWav(buffer);

                mp3Worker.postMessage({ cmd: 'init', config:{
                    mode : 3,
                    channels:1,
                    samplerate: data.sampleRate,
                    bitrate: data.bitsPerSample
                }, uuid:uuid});
                mp3Worker.postMessage({ cmd: 'encode', buf: Uint8ArrayToFloat32Array(data.samples), uuid:uuid });
                mp3Worker.postMessage({ cmd: 'finish', uuid:uuid });
                mp3Worker.onmessage = function(e) {
                    if (e.data.cmd == 'data') {
                        var mp3Blob = new Blob([new Uint8Array(e.data.buf)], {type: 'audio/mp3'});
                        var mp3base64 = encode64(e.data.buf);
                        settings.onsuccess(e.data.uuid, mp3Blob, mp3base64);
                        $(window).trigger('audiorecorder:success', [e.data.uuid, mp3Blob, mp3base64]);
                    }
                }
            };
            fileReader.readAsArrayBuffer(blob);
        }

        this.saveAudio = saveAudio;
        function saveAudio(){
            audioRecorder.exportMonoWAV( doneEncoding );
        }

        this.encode64 = encode64;
        function encode64(buffer) {
            var binary = '',
                bytes = new Uint8Array( buffer ),
                len = bytes.byteLength;

            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( bytes[ i ] );
            }
            return window.btoa( binary );
        }

        this.parseWav = parseWav;
        function parseWav(wav) {
            function readInt(i, bytes) {
                var ret = 0,
                    shft = 0;

                while (bytes) {
                    ret += wav[i] << shft;
                    shft += 8;
                    i++;
                    bytes--;
                }
                return ret;
            }
            return {
                sampleRate: readInt(24, 4),
                bitsPerSample: readInt(34, 2),
                samples: wav.subarray(44)
            };
        }

        function Uint8ArrayToFloat32Array(u8a){
            var f32Buffer = new Float32Array(u8a.length);
            for (var i = 0; i < u8a.length; i++) {
                var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
                if (value >= 0x8000) value |= ~0x7FFF;
                f32Buffer[i] = value / 0x8000;
            }
            return f32Buffer;
        }

        return this;
    }
});

//Part 7: Logging section...
function trace(arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
}

//Part 8: Other useful functions section...
function copyToClipborad() {
    var copyText = document.getElementById("myInput");
    copyText.select();
    document.execCommand("Copy");
    alert("Copied the text: " + copyText.value);
}

function dropEvent(evt, functionName) {
    //for settings dropdowns
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("streamtabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("streamtablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(functionName).style.display = "block";
    evt.currentTarget.className += " active";
}

//Part 9: Other functions pending user interaction section...
$(function() {
    //On hover events...
    $('#new_conference2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'New Conference...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#apply_filter2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Apply Filter...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#take_snapshot2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Take Snapshot...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#take_recording2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Record Video...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#share_file2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Share...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#stream_settings2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Settings...'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#stream_close2')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Close'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#createNewConference')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Create a New Video Conference'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });

    $('#joinNewConference')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Join an Existing Video Conference'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
});