const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

let whiteBoardDB = [];


app.post('/saveProject', function (req, res) {
    if ('data' in req.body){
        whiteBoardDB = req.body.data;
        console.log(req.body);
        res.status(200).send('Database Updated!');
    } else{
        res.status(500).send('Paramaters missing');
    }
});

app.get('/getProject', function (req, res) {
    res.status(200).send(whiteBoardDB);
});



app.listen(3001, () => {
    console.log(`Yey, your server is running on port ${3001}`);
});