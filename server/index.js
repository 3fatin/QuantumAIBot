const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const axios = require("axios");

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = process.env.PORT || 4000;

const streamUrl = "https://hipaa.onrender.com/preauditstream";

app.get("/", (req,res) => {
    res.send("Server is running...");
});

io.on("connection", function(socket) {
    socket.on('streamInput', (inputJson) => {   
        console.log(`Entered streamInput. Input is ${inputJson}`)     
    axios.post(streamUrl, inputJson, { responseType: 'stream' })
      .then((res) => {
        // socket.emit('response', res.data)
        res.data.on('data', data => {
            socket.emit('response', data);
            // console.log(`emitted the data ${data}`)
        });

        res.data.on('end', () => {
            console.log("Analysis Complete.");
        });
      })
    })
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
