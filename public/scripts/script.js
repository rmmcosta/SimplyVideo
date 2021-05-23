console.log("Room id: ", ROOM_ID);

const socket = io();//by default points to the root path /
const peer = new Peer({
    host: 'localhost',
    port: 9000,
    path: '/simplyvideo'
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream('my-video-grid', stream, true) // Display our video to ourselves
    const call = peer.call('another-peers-id', stream);
    call.on('stream', remoteStream => {
        // Show stream in some video/canvas element
        console.log('remote stream');
        addVideoStream('other-video-grid', remoteStream, false);
    });
}).catch(err => {
    console.log('Failed to get local stream', err);
});

peer.on('open', id => {
    console.log('peer open');
    socket.emit('joined-room', ROOM_ID, id);
});

peer.on('error', function (err) {
    console.log(err);
    alert('' + err);
});

peer.on('call', call => {
    console.log('peer call');
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', remoteStream => {
            addVideoStream('other-video-grid', remoteStream, false);
        });
    }).catch(err => {
        console.log('Failed to get local stream', err);
    });
});

socket.on('user-connected', userId => { // If a new user connect
    console.log('user-connected ', userId);
});

addVideoStream = (parentId, stream, muted) => {
    const videoParent = document.getElementById(parentId);
    videoParent.innerHTML = '';
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.muted = muted;
    videoParent.appendChild(videoElement);
};

