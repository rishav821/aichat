const mongoose  = require('mongoose');
mongoose   
.connect('mongodb+srv://rishavshrsth:z7Hd5rnHdu7UAScu@cluster0.9c40hov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Database Connected!'))
.catch(err => console.log(err));