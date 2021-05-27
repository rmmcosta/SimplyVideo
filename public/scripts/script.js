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
    addVideoStream('my-video-grid', stream, true, 'myvideoid'); // Display our video to ourselves but without outputting sound
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
        console.log('answer call from the user:', call.peer);
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', remoteStream => {
            addVideoStream('other-video-grid', remoteStream, false, call.peer);
            addCustomControls('other-video-grid', call.peer, false);
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
            addCustomControls('other-video-grid', call.peer, false);
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
    videoElement.volume = 0.5;
    videoElement.id = videoId;
    videoParent.appendChild(videoElement);
};

addCustomControls = (parentId, videoId, isMuted) => {
    const audioElement = document.createElement('i');
    audioElement.className = isMuted === true ? "fas fa-volume-mute" : "fas fa-volume-mute transparent";
    audioElement.id = "audioOnOff";
    audioElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.muted === true) {
            audioElement.className = "fas fa-volume-mute transparent";
            videoElement.muted = false;
        } else {
            audioElement.className = "fas fa-volume-mute";
            videoElement.muted = true;
        }
    };
    const volumeUpElement = document.createElement('i');
    volumeUpElement.className = "fas fa-volume-up ml-2";
    volumeUpElement.id = "volumeUp";
    volumeUpElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.volume <= 0.9)
            videoElement.volume = videoElement.volume + 0.1;
        else
            videoElement.volume = 1;
    };
    const volumeDownElement = document.createElement('i');
    volumeDownElement.className = "fas fa-volume-down ml-2";
    volumeDownElement.id = "volumeDown";
    volumeDownElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.volume >= 0.1)
            videoElement.volume = videoElement.volume - 0.1;
        else
            videoElement.volume = 0;
    };
    const videoElement = document.getElementById(videoId);
    const volumeLevelElement = document.createElement('span');
    volumeLevelElement.className = 'ml-2';
    volumeLevelElement.id = 'volumeLevel';
    volumeLevelElement.innerText = (videoElement.volume * 100) + '%';
    videoElement.onvolumechange = event => {
        const volumeLevelElement = document.getElementById('volumeLevel');
        volumeLevelElement.innerText = (event.target.volume * 100) + '%';
    };

    const videoParent = document.getElementById(parentId);
    videoParent.appendChild(audioElement);
    videoParent.appendChild(volumeUpElement);
    videoParent.appendChild(volumeDownElement);
    videoParent.appendChild(volumeLevelElement);
};

