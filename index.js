const express = require('express')
const app = express();
const path = require('path');
const cors = require('cors')


app.use(cors())
app.use(express.static(__dirname + "/public/"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(8000, () => {
  console.log('Geneticars on 8000!')
});
