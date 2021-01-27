let n = 0;
function addVideoStream(streamId) {
    let which = "remoteStream1";
    if (n==1)
    {
        which = "remoteStream2";
    }
    else if (n==2)
    {
        which = "remoteStream3";
    }
    else if (n==3)
    {
        which = "remoteStream4";
    }

    console.log(which);

    let remoteContainer = document.getElementById(which);
    let newDiv = document.createElement("div");
    newDiv.id = streamId;
    newDiv.style.transform = "rotateY(180deg)";
    newDiv.style.height = "100%";
    newDiv.style.alignItems = "flex-start";
    remoteContainer.appendChild(newDiv);
    n++;
}

function addName(name) {
    let list = document.getElementById("names");
    let newName = document.createTextNode(name);
    list.appendChild(newName);
    var linebreak = document.createElement('br');
    list.appendChild(linebreak);
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
            var clientStream = AgoraRTC.createStream({video: true, audio: true});
            
            clientStream.init(function (){
                clientStream.play("selfStream");
                console.log("client streaming");
                client.publish(clientStream);
                addName(username);
            })
        },
        () => console.log(err)
    )

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
}

