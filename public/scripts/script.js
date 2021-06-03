console.log("Room id: ", ROOM_ID);
let myUserId;
let myStream;
let isMyCameraOn = false;
let isMySoundOn = false;
const LOCAL_STORAGE_ITEM_USERSNAME = 'SIMPLYVIDEO_USERSNAME';
const CONTROLS_BASE_STYLE = ' m-2 col-xs ';
const CONTROLS_ACTIVE_DARK = CONTROLS_BASE_STYLE + 'gray-dark';
const CONTROLS_ACTIVE_RED = CONTROLS_BASE_STYLE + 'text-danger';
const CONTROLS_INACTIVE_STYLE = ' m-2 transparent col-xs gray-dark';

const socket = io();//by default points to the root path /

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker is registered', registration);
            })
            .catch(err => {
                console.error('Registration failed:', err);
            });
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
});

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    hideInstallPromotion();
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    console.log('PWA was installed');
});

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
            socket.emit('changed-name', ROOM_ID, myUserId, localStorage.getItem(LOCAL_STORAGE_ITEM_USERSNAME));
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
            socket.emit('changed-name', ROOM_ID, myUserId, localStorage.getItem(LOCAL_STORAGE_ITEM_USERSNAME));
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
    muteOthersVideo(userId);
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
    turnOffOthersVideo(userId);
});

socket.on('turnUserCameraOn', (roomId, userId) => {
    if (roomId !== ROOM_ID)
        return;
    if (userId === myUserId)
        return;
    turnOnOthersVideo(userId);
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
        "fas fa-volume-mute" + CONTROLS_ACTIVE_RED : "fas fa-volume-mute" + CONTROLS_INACTIVE_STYLE;
    audioElement.id = "audioOnOff";
    audioElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        updateAudioAndVideo(videoElement, audioElement);
    };
    const volumeUpElement = document.createElement('i');
    volumeUpElement.className = "fas fa-volume-up" + CONTROLS_ACTIVE_DARK;
    volumeUpElement.id = "volumeUp";
    volumeUpElement.onclick = () => {
        const videoElement = document.getElementById(videoId);
        if (videoElement.volume <= 0.9)
            videoElement.volume = videoElement.volume + 0.1;
        else
            videoElement.volume = 1;
    };
    const volumeDownElement = document.createElement('i');
    volumeDownElement.className = "fas fa-volume-down" + CONTROLS_ACTIVE_DARK;
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
    volumeLevelElement.className = CONTROLS_ACTIVE_DARK;
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
    if (othersVideoElement && ballsLoaderElement)
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
        muteControl.className = isMySoundOn ? "m-2 col-xs text-success fas fa-microphone" : "m-2 col-xs text-danger fas fa-microphone-slash";
    };
    videoControl.onclick = () => {
        socket.emit(isMyCameraOn ? 'turnUserCameraOff' : 'turnUserCameraOn', ROOM_ID, myUserId);
        isMyCameraOn = !isMyCameraOn;
        videoControl.className = isMyCameraOn ? "m-2 col-xs text-success fas fa-video" : "m-2 col-xs text-danger fas fa-video-slash";
        const myVideoElement = document.getElementById('myvideoid');
        if (isMyCameraOn) {
            myVideoElement.play();
            if (document.getElementById('myVideoPaused'))
                myVideoElement.parentElement.removeChild(document.getElementById('myVideoPaused'));
        }
        else {
            myVideoElement.pause();
            const pausedInfo = document.createElement('span');
            pausedInfo.className = 'my-video-paused';
            pausedInfo.innerText = 'Video Paused';
            pausedInfo.id = 'myVideoPaused';
            myVideoElement.parentElement.appendChild(pausedInfo);
        }
    };
};

muteOthersVideo = userId => {
    const videoElement = document.getElementById(userId);
    videoElement.muted = true;
    const audioControl = document.getElementById('audioOnOff');
    audioControl.className = "fas fa-volume-mute" + CONTROLS_ACTIVE_RED;
    audioControl.onclick = () => { return; };//click does nothing
};

unmuteOthersVideo = userId => {
    const videoElement = document.getElementById(userId);
    videoElement.muted = false;
    const audioControl = document.getElementById('audioOnOff');
    audioControl.className = "fas fa-volume-mute" + CONTROLS_INACTIVE_STYLE;
    audioElement.onclick = () => {
        updateAudioAndVideo(videoElement, audioControl);
    };
};

turnOffOthersVideo = userId => {
    const videoElement = document.getElementById(userId);
    videoElement.pause();
    const pausedInfo = document.createElement('span');
    pausedInfo.className = 'video-paused';
    pausedInfo.innerText = 'Video Paused';
    pausedInfo.id = 'videoPaused';
    videoElement.parentElement.appendChild(pausedInfo);
};

turnOnOthersVideo = userId => {
    const videoElement = document.getElementById(userId);
    videoElement.play();
    if (document.getElementById('videoPaused'))
        videoElement.parentElement.removeChild(document.getElementById('videoPaused'));
};

updateAudioAndVideo = (videoElement, audioElement) => {
    if (videoElement.muted === true) {
        audioElement.className = "fas fa-volume-mute" + CONTROLS_INACTIVE_STYLE;
        videoElement.muted = false;
    } else {
        audioElement.className = "fas fa-volume-mute" + CONTROLS_ACTIVE_RED;
        videoElement.muted = true;
    }
}

