console.log("Room id: ", ROOM_ID);
let myUserId;
let myStream;
let isMyCameraOn = false;
let isMySoundOn = false;
const LOCAL_STORAGE_ITEM_USERSNAME = 'SIMPLYVIDEO_USERSNAME';
const CONTROLS_ACTIVE_STYLE = ' m-2 col-xs gray-dark';
const CONTROLS_INACTIVE_STYLE = ' m-2 transparent col-xs gray-dark';

const socket = io();//by default points to the root path /

window.onload = () => {
    const usersNameModal = new bootstrap.Modal(document.getElementById('usersNameModal'), {
        backdrop: 'static',
        keyboard: false
    });
    usersNameModal.show();
    const usersConfirmButton = document.getElementById('usersNameConfirm');
    const previousName = localStorage.getItem(LOCAL_STORAGE_ITEM_USERSNAME);
    if (previousName !== null) {
        const usersNameInput = document.getElementById('usersName');
        usersNameInput.value = previousName;
    }
    const usersNameElem = document.getElementById('usersName');
    const usersIdentityElem = document.getElementById('usersIdentity');
    usersConfirmButton.onclick = () => {
        const usersName = usersNameElem.value;
        if (usersName === null || usersName.length === 0)
            return;
        if (previousName !== usersName) {
            localStorage.setItem(LOCAL_STORAGE_ITEM_USERSNAME, usersName);
            if (myUserId !== null)
                socket.emit('changed-name', ROOM_ID, myUserId, usersName);
        }
        usersIdentityElem.innerText = usersName;
        usersNameModal.hide();
    };
    usersIdentityElem.onclick = () => {
        usersNameModal.show();
    };
};

const peer = new Peer({
    host: 'rmmcosta.hopto.org',
    port: 9000,
    path: '/myapp'
});

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream('my-video-placeholder', stream, true, 'myvideoid'); // Display our video to ourselves but without outputting sound
    myStream = stream;
    isMyCameraOn = true;
    isMySoundOn = true;
}).catch(err => {
    console.log('Failed to get local stream', err);
});

peer.on('open', id => { // When we first open the app, have us join a room
    console.log('peer open');
    const userName = localStorage.getItem(LOCAL_STORAGE_ITEM_USERSNAME);
    socket.emit('joined-room', ROOM_ID, id, userName === null ? 'Unknown' : userName);
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
            addVideoStream('others-video-placeholder', remoteStream, false, call.peer);
            addCustomControls('othersVideoControls', call.peer, false);
            removeWaiting();
            activateMyControls();
        });
    }).catch(err => {
        console.log('Failed to get local stream', err);
    });
});

socket.on('user-connected', (roomId, userId, usersName) => { // If a new user connect
    if (roomId !== ROOM_ID)
        return;
    console.log('user-connected ', userId);
    if (userId !== myUserId) {
        const call = peer.call(userId, myStream);
        call.on('stream', remoteStream => {
            // Show stream in some video/canvas element
            console.log('remote stream');
            addVideoStream('others-video-placeholder', remoteStream, false, userId);
            addCustomControls('othersVideoControls', call.peer, false);
            addOthersName('othersVideoName', usersName);
            removeWaiting();
            activateMyControls();
        });
    }
});

//on users changed Name
socket.on('changed-name', (roomId, userId, usersName) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
    addOthersName('othersVideoName', usersName);
});

//muteUser, unmuteUser, turnUserCameraOff, turnUserCameraOn
socket.on('muteUser', (roomId, userId) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
});

socket.on('unmuteUser', (roomId, userId) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
});

socket.on('turnUserCameraOff', (roomId, userId) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
});

socket.on('turnUserCameraOn', (roomId, userId) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
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
    audioElement.className = isMuted === true ?
        "fas fa-volume-mute" + CONTROLS_ACTIVE_STYLE : "fas fa-volume-mute" + CONTROLS_INACTIVE_STYLE;
    audioElement.id = "audioOnOff";
    audioElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.muted === true) {
            audioElement.className = "fas fa-volume-mute" + CONTROLS_INACTIVE_STYLE;
            videoElement.muted = false;
        } else {
            audioElement.className = "fas fa-volume-mute" + CONTROLS_ACTIVE_STYLE;
            videoElement.muted = true;
        }
    };
    const volumeUpElement = document.createElement('i');
    volumeUpElement.className = "fas fa-volume-up" + CONTROLS_ACTIVE_STYLE;
    volumeUpElement.id = "volumeUp";
    volumeUpElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.volume <= 0.9)
            videoElement.volume = videoElement.volume + 0.1;
        else
            videoElement.volume = 1;
    };
    const volumeDownElement = document.createElement('i');
    volumeDownElement.className = "fas fa-volume-down" + CONTROLS_ACTIVE_STYLE;
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
    volumeLevelElement.className = CONTROLS_ACTIVE_STYLE;
    volumeLevelElement.id = 'volumeLevel';
    volumeLevelElement.innerText = Math.round((videoElement.volume * 100)) + '%';
    videoElement.onvolumechange = event => {
        const volumeLevelElement = document.getElementById('volumeLevel');
        volumeLevelElement.innerText = Math.round((event.target.volume * 100)) + '%';
    };

    const videoParent = document.getElementById(parentId);
    videoParent.innerHTML = '';
    videoParent.appendChild(audioElement);
    videoParent.appendChild(volumeUpElement);
    videoParent.appendChild(volumeDownElement);
    videoParent.appendChild(volumeLevelElement);
};

addOthersName = (elemId, usersName) => {
    const elem = document.getElementById(elemId);
    elem.innerText = usersName;
}

removeWaiting = () => {
    const othersVideoElement = document.getElementById('other-video-grid');
    const ballsLoaderElement = document.getElementById('waitingOthersVideo');
    othersVideoElement.removeChild(ballsLoaderElement);
};

activateMyControls = () => {
    const muteControl = document.getElementById('muteControl');
    const videoControl = document.getElementById('videoControl');
    muteControl.className = muteControl.className.replace('transparent', '');
    videoControl.className = videoControl.className.replace('transparent', '');
    muteControl.onclick = () => {
        socket.emit(isMySoundOn === true ? 'muteUser' : 'unmuteUser', ROOM_ID, myUserId);
        isMySoundOn = !isMySoundOn;
    };
    videoControl.onclick = () => {
        socket.emit(isMyCameraOn ? 'turnUserCameraOff' : 'turnUserCameraOn', ROOM_ID, myUserId);
        isMyCameraOn = !isMyCameraOn;
    }
};

