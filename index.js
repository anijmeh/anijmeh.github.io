let n = 0;
let stack = ["RemoteStream4", "RemoteStream3", "RemoteStream2", "RemoteStream1"];
let globalClientStream;
let globalClient;
let globalScreenStream;
let globalScreenClient;
let videoMute = false;
let audioMute = false;

function addVideoStream(streamId) {
    let which = stack.pop();

    let remoteContainer = document.getElementById(which);
    let newDiv = document.createElement("div");
    newDiv.id = streamId;
    newDiv.style.transform = "rotateY(180deg)";
    newDiv.style.height = "100%";
    remoteContainer.appendChild(newDiv);
    n++;
}

function removeVideoStream() {
    globalClientStream.stop();
    let parent = document.getElementById("names"); 
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    document.getElementById("name").value = "";
    document.getElementById("address").value = "";
    globalScreenStream.stop();
}

function removeRemoteVideoStream(evt) {
    let stream = evt.stream;
    stream.stop();
    let removediv = document.getElementById(stream.getId());
    stack.push(removediv.parentNode.id);
    removediv.parentNode.removeChild(removediv);
}

function addName(name) {
    let list = document.getElementById("names");
    let newName = document.createTextNode(name);
    list.appendChild(newName);
    var linebreak = document.createElement('br');
    list.appendChild(linebreak);
}

function validate () {
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    if(email.value.match(/\S+@\S+/)) {
        if(password.value.length > 0) {
            window.location.replace("videoCall.html");
            email.value = "";
            password.value = "";
        }
        else {
            email.value = "invalid password";
            password.value = "";
        }
    }
    else {
        if (password.value.length > 0) {
            email.value = "invalid email";
            password.value = "";
        }
        else {
            email.value = "invalid email and password";
            password.value = "";
        }
    }

}

document.getElementById("joinButton").onclick = function () {
    let username = document.getElementById("name").value;
    let chataddress = document.getElementById("address").value;
    let appID = "94244625cc3341eaa32095131f15da69";
    
    var config = {mode: "live", codec: "h264"};
    let client = AgoraRTC.createClient(config);
    client.init(appID, () => {console.log("client initialized")}, 
        () => {console.log("client uninitialized", err)});

    globalClient = client;
        
    client.join(null, chataddress, username, 
                () => {
                    console.log("join successful")
                    var stream = {audio:true, video:true, screen:false}
                    let clientStream = AgoraRTC.createStream(stream);

                    clientStream.init(() => {
                        console.log("client stream initialized");
                        clientStream.play("SelfStream");
                        client.publish(clientStream);
                        addName(username);
                    })

                    globalClientStream = clientStream;
                }, 
                () => {console.log("join unsuccessful", err)});
    
    client.on("stream-added", function (evt){
        console.log("Added Stream");
        client.subscribe(evt.stream,() => console.log(err))
    })
    
    client.on("stream-subscribed", function(evt){
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId());  
        addName(stream.getId());
        stream.play(stream.getId());
    })

    client.on("peer-leave", function (evt) {
        console.log("peer left");
        removeRemoteVideoStream(evt);
        removeName(evt);
    })
}

document.getElementById("leaveButton").onclick = function () {
    globalClient.leave(() => {console.log("client left")}, 
                    () => {console.log("leave failed", err)});
    removeVideoStream();
}

document.getElementById("share").onclick = function () {
    let chataddress = document.getElementById("address").value;
    let appID = "94244625cc3341eaa32095131f15da69";

    var config = {mode: "live", codec: "h264"};
    let streamClient = AgoraRTC.createClient(config);
    

    streamClient.init(appID, () => {console.log("screen client initialized")}, 
                    () => {console.log("screen uninitialized", err)});

    streamClient.join(null, chataddress, null, 
                () => {
                    console.log("screen join successful");
                    var stream = {audio: false, video: false, screen: true}
                    let screenStream = AgoraRTC.createStream(stream);

                    screenStream.init(() => {
                        console.log("screen stream initialized");
                        screenStream.play("VideoStream");
                        streamClient.publish(screenStream);
                    })

                    globalScreenStream = screenStream;
                },
                () => {
                    console.log("screen join not successful", err);
                })

    globalScreenClient = streamClient;
}

document.getElementById("muteAudio").onclick = function () {
    if (audioMute) {
        globalClientStream.unmuteAudio();
        audioMute = false;
        document.getElementById("muteAudio").textContent = "Mute Audio";
    }
    else {
        globalClientStream.muteAudio();
        audioMute = true;
        document.getElementById("muteAudio").textContent = "Unmute Audio";
    }
}

document.getElementById("muteVideo").onclick = function () {
    if (videoMute) {
        globalClientStream.unmuteVideo();
        videoMute = false;
        document.getElementById("muteVideo").textContent = "Mute Video";
    }
    else {
        globalClientStream.muteVideo();
        videoMute = true;
        document.getElementById("muteVideo").textContent = "Unmute Video";
    }
}