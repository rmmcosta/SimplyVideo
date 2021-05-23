const socket = io('/'); // Create our socket
const peer = new Peer(); // Creating a peer element which represents the current user
let localStream;

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoElement(stream, true);
    localStream = stream;
}).catch(err => {
    console.error(err);
});

peer.on('open', id => { // When we first open the app, have us join a room
    console.log('peer open');
    socket.emit('join-room', ROOM_ID, id);
});

peer.on('call', call => {
    call.answer(localStream); // Answer the call with an A/V stream.
    call.on('stream', remoteStream => {
        addVideoElement(remoteStream, false);
    });
});

addVideoElement = (stream, muted) => {
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.muted = muted;
    videoElement.srcObject = stream;
    const parentElement = document.getElementById('video-grid');
    parentElement.appendChild(videoElement);
};
