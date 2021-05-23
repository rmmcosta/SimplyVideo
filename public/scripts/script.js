//# sourceMappingURL=https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.3.2/peerjs.min.js.map

const socket = io('/'); // Create our socket
let peer = new Peer(); // Creating a peer element which represents the current user

if (peer) {
    console.log('peer is defined!');
}

peer.on('open', id => {
    console.log('My peer ID is: ' + id);
    //socket.emit('join-room', ROOM_ID, id);
});
