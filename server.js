let express = require('express');
let app = express();
let port = process.env.port||9516;
const routes = require('./routes/routes');
let bodyParser = require('body-parser');
const cors = require('cors');
const {dbConnect} = require('./utils/db')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

dbConnect();

app.get('/',(req,res)=>{
    res.send('Stein Bies Task APIs');
})

app.use('/api', routes);

app.listen(port,(err)=>{
    console.log(`Hi ${port}`);
    if(err) throw err;
})