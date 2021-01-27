function addVideoStream(streamId) {
    let remoteContainer = document.getElementById("remoteStream");
    let newDiv = document.createElement("div");
    newDiv.id = streamId;
    newDiv.style.transform = "rotateY(180deg)";
    newDiv.style.height = "250px";
    remoteContainer.appendChild(newDiv);
}

document.getElementById("join-button").onclick = function () {
    let channel = document.getElementById("chat-address").value;
    let username = document.getElementById("username").value;
    let appId = "94244625cc3341eaa32095131f15da69";

    let client = AgoraRTC.createClient({mode: "live", codec: "h264"});

    client.init(appId, () => console.log("Connection Success"), () => console.log(err));

    client.join(
        null,
        channel,
        username,
        () => {
            var clientStream = AgoraRTC.createStream({video: true, audio: true, });
            
            clientStream.init(function (){
                clientStream.play("selfStream");
                console.log("client streaming");
                client.publish(clientStream);
            })
        }
    )

    client.on("stream-added", function (evt){
        console.log("Added Stream");
        client.subscribe(evt.stream,() => console.log(err))
    })

    client.on("stream-subscribed", function(evt){
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId());  
        stream.play(stream.getId());
    })
}

