// alert("ws://" + location.hostname + ":" + wsPort + "/");
var connection;

connection = new WebSocket("ws://" + location.hostname + ":" + wsPort + "/");
connection.onopen = function () {
  let m = JSON.stringify({type: "message", message: 'Connesso!!'});
  connection.send(m);
};
connection.onerror = function(error) {console.log("WebSocket error: ", error)};
connection.onmessage = function(e) {
  let m = JSON.parse(e.data);
  console.log(m.message);
};

fetch("http://" + location.hostname + ":" + httpPort + "/graph_config.json").then(response => {
  return response.json();
}).then(data => {
    // Work with JSON data here
    console.log(data);
    loadCombo(data);
  }).catch(err => {
    // Do something for an error here
    console.log(err);
  });

function loadCombo(data) {
  var select = document.getElementById("lines");
  for(let sp of data) {
    var el = document.createElement("option");
    el.textContent = sp.name;
    el.value = sp.name;
    select.appendChild(el);
  }

}

function sendMessage() {
  let msg = document.getElementById("message").value;
  let sLine = document.getElementById("lines").value;
  let m = JSON.stringify({type: "message", message: msg, line: sLine});
  connection.send(m);
}
