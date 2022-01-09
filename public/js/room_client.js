/*modal launch event */
/*
var launch_modal = document.getElementById('launch_modal')
window.onload = launch_modal.click();
*/
const port = 3000 || process.env.PORT;
const socket = io(`http://localhost:${port}`)
// const socket = io("/");
const videoGrid = document.getElementById('video-grid')
const ul = document.querySelector("ul")
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000' /* while deployment change it to 443*/
})
var myVideoStream;
var screenStream;
var screenSharing = false;
var currentPeer = null;
const myVideo = document.createElement('video');
myVideo.muted = true;// user will not listen its own voice
const peers = {}
/**username part for chat using modal */
/*
const username_input = document.getElementById('username_input')
const save_modal = document.getElementById('save_modal')
const close_modal = document.getElementById('close_modal')
let user;
save_modal.addEventListener('click', async (e) => {
    user = await username_input.value;
    close_modal.click();
})*/
const user = prompt("Enter user name")
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;// to store stream for further ref 
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            currentPeer = call// for screen share
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        // user is joining
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)// pass the stream to the new user so that it can see us 
        }, 1000)
    })

    let text = document.getElementById('message_input')
    document.querySelector('html').addEventListener('keydown', function (e) {
        if (e.key == "Enter" && text.value.length !== 0) {
            socket.emit('message', text.value);
            text.value = "";
        }
    });

    socket.on('createMessage', (message, userName) => {
        ul.insertAdjacentHTML("beforeend", `<li class="message "><i class="fas fa-user"></i><u><b>${userName === user ? "me" : userName
            }</b></u><br/>${message}</li>`);
        scrollToBottom();
    })

})
socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close() //CALL CLOSE ONLY IF THERE IS A USER

    }
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, user)
})
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        currentPeer = call

    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call// so that every userId is connected to call that we make so that when it disconnects then it videos get removed
}
function addVideoStream(video, stream) {
    video.srcObject = stream;// will allow to play our video
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video)
}
const scrollToBottom = () => {
    var container_chat = document.getElementById('container_chat')
    container_chat.scrollTop = container_chat.scrollHeight;
};
//Toggle fnc for  microphone button
const microphone_button = document.getElementById('microphone_button');
microphone_button.addEventListener('click', () => {
    let microphone_icon_class = microphone_button.getElementsByTagName("i")[0].classList[1]
    if (microphone_icon_class == 'fa-microphone-slash') {
        microphone_button.getElementsByTagName("i")[0].classList.value = 'fa fa-microphone';
        microphone_button.getElementsByTagName("span")[0].innerText = 'Mute';
        myVideoStream.getAudioTracks()[0].enabled = true;
        microphone_button.getElementsByTagName("i")[0].style = "color:black";
    }
    else {
        microphone_button.getElementsByTagName("i")[0].classList.value = ' fa fa-microphone-slash';
        microphone_button.getElementsByTagName("span")[0].innerText = 'Unmute';
        myVideoStream.getAudioTracks()[0].enabled = false;
        microphone_button.getElementsByTagName("i")[0].style = "color:rgb(168, 25, 25)";
    }
})
//Toggle fnc for  video button
const video_button = document.getElementById('video_button');
video_button.addEventListener('click', () => {
    let video_icon_class = video_button.getElementsByTagName("i")[0].classList[1]
    if (video_icon_class == 'fa-video-camera') {
        video_button.getElementsByTagName("i")[0].classList.value = 'fa fa-video-slash';
        video_button.getElementsByTagName("span")[0].innerText = 'Start Video';
        myVideoStream.getVideoTracks()[0].enabled = false;
        video_button.getElementsByTagName("i")[0].style = "color:rgb(168, 25, 25)";

    }
    else {
        video_button.getElementsByTagName("i")[0].classList.value = 'fa fa-video-camera';
        video_button.getElementsByTagName("span")[0].innerText = 'Stop Video';
        myVideoStream.getVideoTracks()[0].enabled = true;
        video_button.getElementsByTagName("i")[0].style = "color:black";

    }
})
//Toggle fnc for  recording button
/*
const recording_button = document.getElementById('recording_button');
recording_button.addEventListener('click', () => {
    let recording_icon_class = recording_button.getElementsByTagName("i")[0].classList[1]
    if (recording_icon_class == 'fa-play-circle') {
        recording_button.getElementsByTagName("i")[0].classList.value = ' fas fa-stop-circle';
        recording_button.getElementsByTagName("span")[0].innerText = 'Stop Recording';
        recording_button.getElementsByTagName("i")[0].style = "color:rgb(168, 25, 25)";
        //startRecording();
    }
    else {
        recording_button.getElementsByTagName("i")[0].classList.value = 'fa fa-play-circle';
        recording_button.getElementsByTagName("span")[0].innerText = 'Start Recording';
        recording_button.getElementsByTagName("i")[0].style = "color:green";
        //stopRecording()
    }
})
*/
// copy meet link
const copy_link = document.getElementById('copy_link')
copy_link.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);

    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
})

// share screen fnc
const shareScreen = document.getElementById('shareScreen');
shareScreen.addEventListener('click', (e) => {
    if (screenSharing) {
        stopScreenShare()
    }
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always"
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
        }
    }).then((stream) => {

        screenStream = stream;

        let videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = function () {
            stopScreenShare();
        }
        if (myPeer) {

            let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind
            })
            sender.replaceTrack(videoTrack);
            screenSharing = true;
        }

    }).catch((err) => {
        console.log("Unable to get dislpay media " + err)
    })
})

function stopScreenShare() {
    if (!screenSharing) return;
    let videoTrack = myVideoStream.getVideoTracks()[0];
    if (myPeer) {

        var sender = currentPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });
    screenSharing = false;
};