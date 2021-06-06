const LOCAL_STORAGE_ITEM_USERSNAME = 'SIMPLYVIDEO_USERSNAME';
const LOCAL_STORAGE_ITEM_ROOM = 'SIMPLYVIDEO_ROOM';
const LOCAL_STORAGE_ITEM_AVATAR = 'SIMPLYVIDEO_AVATAR';

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
    let inmemoryUsersName = localStorage.getItem(LOCAL_STORAGE_ITEM_USERSNAME);
    const inputUsersName = document.getElementById('usersName');
    if (inmemoryUsersName !== null) {
        inputUsersName.value = inmemoryUsersName;
    } else {
        localStorage.setItem(LOCAL_STORAGE_ITEM_USERSNAME, 'Unknown');
        inmemoryUsersName = 'Unknown';
    }
    const confirmUsersName = document.getElementById('confirmUsersName');
    inputUsersName.onkeyup = event => {
        if (event.target.value !== inmemoryUsersName) {
            confirmUsersName.disabled = false;
            confirmUsersName.className = '';
        } else {
            confirmUsersName.disabled = true;
            confirmUsersName.className = 'invisible';
        }
    };
    confirmUsersName.onclick = event => {
        event.preventDefault();
        localStorage.setItem(LOCAL_STORAGE_ITEM_USERSNAME, inputUsersName.value);
        inmemoryUsersName = inputUsersName.value;
        confirmUsersName.disabled = true;
        confirmUsersName.className = 'invisible';
    }
    const optionUsersName = document.getElementById('optionUsersName');
    const optionRoomId = document.getElementById('optionRoomId');
    const optionAvatar = document.getElementById('optionAvatar');
    const divUsersName = document.getElementById('divUsersName');
    const divRoomId = document.getElementById('divRoomId');
    const divChangeAvatar = document.getElementById('divChangeAvatar');

    const activateOptionUsersName = () => {
        divUsersName.className = divUsersName.className.replace(' invisible', '');
        if (!divRoomId.className.includes('invisible')) {
            divRoomId.className = divRoomId.className + ' invisible';
        }
        if (!divChangeAvatar.className.includes('invisible')) {
            divChangeAvatar.className = divChangeAvatar.className + ' invisible';
        }
    };

    const activateOptionRoomId = () => {
        divRoomId.className = divRoomId.className.replace(' invisible', '');
        if (!divUsersName.className.includes('invisible')) {
            divUsersName.className = divUsersName.className + ' invisible';
        }
        if (!divChangeAvatar.className.includes('invisible')) {
            divChangeAvatar.className = divChangeAvatar.className + ' invisible';
        }
    };

    const activateOptionAvatar = () => {
        divChangeAvatar.className = divChangeAvatar.className.replace(' invisible', '');
        if (!divUsersName.className.includes('invisible')) {
            divUsersName.className = divUsersName.className + ' invisible';
        }
        if (!divRoomId.className.includes('invisible')) {
            divRoomId.className = divRoomId.className + ' invisible';
        }
    };

    let divUsersNameBeforeMouseEntermId = '';
    let divRoomIdBeforeMouseEnter = '';
    let divAvatarBeforeMouseEnter = '';

    optionUsersName.onmouseenter = () => {
        divUsersNameBeforeMouseEntermId = divUsersName.className;
        divRoomIdBeforeMouseEnter = divRoomId.className;
        divAvatarBeforeMouseEnter = divChangeAvatar.className;
        activateOptionUsersName();
    }
    optionRoomId.onmouseenter = () => {
        divUsersNameBeforeMouseEntermId = divUsersName.className;
        divRoomIdBeforeMouseEnter = divRoomId.className;
        divAvatarBeforeMouseEnter = divChangeAvatar.className;
        activateOptionRoomId();
    };
    optionAvatar.onmouseenter = () => {
        divUsersNameBeforeMouseEntermId = divUsersName.className;
        divRoomIdBeforeMouseEnter = divRoomId.className;
        divAvatarBeforeMouseEnter = divChangeAvatar.className;
        activateOptionAvatar();
    };

    optionUsersName.onmouseleave =
        optionRoomId.onmouseleave =
        optionAvatar.onmouseleave = () => {
            if (divUsersNameBeforeMouseEntermId !== '')
                divUsersName.className = divUsersNameBeforeMouseEntermId;
            if (divRoomIdBeforeMouseEnter !== '')
                divRoomId.className = divRoomIdBeforeMouseEnter;
            if (divAvatarBeforeMouseEnter !== '')
                divChangeAvatar.className = divAvatarBeforeMouseEnter;
        };

    optionUsersName.onclick = () => {
        if (!optionUsersName.className.includes('home-option-selected')) {
            optionUsersName.className += ' home-option-selected';
        }
        if (optionRoomId.className.includes('home-option-selected')) {
            optionRoomId.className = optionRoomId.className.replace(' home-option-selected', '');
        }
        if (optionAvatar.className.includes('home-option-selected')) {
            optionAvatar.className = optionAvatar.className.replace(' home-option-selected', '');
        }
        activateOptionUsersName();
        divUsersNameBeforeMouseEntermId = '';
        divRoomIdBeforeMouseEnter = '';
        divAvatarBeforeMouseEnter = '';
    };

    optionRoomId.onclick = () => {
        if (!optionRoomId.className.includes('home-option-selected')) {
            optionRoomId.className += ' home-option-selected';
        }
        if (optionUsersName.className.includes('home-option-selected')) {
            optionUsersName.className = optionUsersName.className.replace(' home-option-selected', '');
        }
        if (optionAvatar.className.includes('home-option-selected')) {
            optionAvatar.className = optionAvatar.className.replace(' home-option-selected', '');
        }
        activateOptionRoomId();
        divUsersNameBeforeMouseEntermId = '';
        divRoomIdBeforeMouseEnter = '';
        divAvatarBeforeMouseEnter = '';
    };

    optionAvatar.onclick = () => {
        if (!optionAvatar.className.includes('home-option-selected')) {
            optionAvatar.className += ' home-option-selected';
        }
        if (optionRoomId.className.includes('home-option-selected')) {
            optionRoomId.className = optionRoomId.className.replace(' home-option-selected', '');
        }
        if (optionUsersName.className.includes('home-option-selected')) {
            optionUsersName.className = optionUsersName.className.replace(' home-option-selected', '');
        }
        divUsersNameBeforeMouseEntermId = '';
        divRoomIdBeforeMouseEnter = '';
        divAvatarBeforeMouseEnter = '';
        const avatarModal = new bootstrap.Modal(document.getElementById('avatarModal'));
        avatarModal.show();
    };

    const go2Room = document.getElementById('go2Room');
    const previousRoom = localStorage.getItem(LOCAL_STORAGE_ITEM_ROOM);
    if (previousRoom !== null) {
        const roomInputId = document.getElementById('roomInputId');
        roomInputId.value = previousRoom;
    }
    go2Room.onclick = event => {
        event.preventDefault();
        const room = roomInputId.value;
        if (room !== null) {
            window.location.pathname = '/SimplyVideo/room/' + room;
            localStorage.setItem(LOCAL_STORAGE_ITEM_ROOM, room);
        }
        else {
            window.location.pathname = '/SimplyVideo/room';
        }
    };

    let savedAvatar = localStorage.getItem(LOCAL_STORAGE_ITEM_AVATAR);

    if (savedAvatar === null) {
        localStorage.setItem(LOCAL_STORAGE_ITEM_AVATAR, 'avatar-male-3.png');
        savedAvatar = 'avatar-male-3.png';
    }
    else {
        const avatarPicture = document.getElementById('avatarPicture');
        if (!avatarPicture.src.includes(savedAvatar)) {
            avatarPicture.src = '/images/avatars/' + savedAvatar;
        }
    }

    const carouselAvatars = document.getElementsByClassName('carousel-item');
    carouselAvatars.onclick = event => {
        console.log(event);
        console.log(this);
    };
};