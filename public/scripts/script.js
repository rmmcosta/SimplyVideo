console.log("Room id: ", ROOM_ID);
let myUserId;
let myStream;

const socket = io();//by default points to the root path /
const peer = new Peer({
    host: '109.49.167.65',
    port: 9000,
    path: '/myapp'
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream('my-video-grid', stream, true, 'myvideoid'); // Display our video to ourselves
    addMuteUnmuteOption('my-video-grid', 'myvideoid');
    myStream = stream;
}).catch(err => {
    console.log('Failed to get local stream', err);
});

peer.on('open', id => {
    console.log('peer open');
    socket.emit('joined-room', ROOM_ID, id);
    myUserId = id;
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
    if (userId !== myUserId) {
        const call = peer.call(userId, myStream);
        call.on('stream', remoteStream => {
            // Show stream in some video/canvas element
            console.log('remote stream');
            addVideoStream('other-video-grid', remoteStream, false, userId);
        });
    }
});

addVideoStream = (parentId, stream, muted, videoId) => {
    const videoParent = document.getElementById(parentId);
    videoParent.innerHTML = '';
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.muted = muted;
    videoElement.id = videoId;
    videoParent.appendChild(videoElement);
};

addMuteUnmuteOption = (parentId, videoId) => {
    const muteElement = document.createElement('i');
    muteElement.className = "fas fa-microphone-slash";
    muteElement.id = "muteUnmute";
    muteElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.muted === true) {
            muteElement.className = "fas fa-microphone";
            videoElement.muted = false;
        } else {
            muteElement.className = "fas fa-microphone-slash";
            videoElement.muted = true;
        }
    };
    const videoParent = document.getElementById(parentId);
    videoParent.appendChild(muteElement);
};

