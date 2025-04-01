const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const pg= require('pg');
const { Pool } = pg;
require('dotenv').config(); 
const PGHOST = process.env.PGHOST;
const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGDATABASE = process.env.PGDATABASE;
const pool = new Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
        require: true
    }
})


// app.use(cors());
app.use(cors({ origin: '*' }));
app.use(express.json());

function generateString(){
    charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let i = 0;
    let k=0;
    let s1="";
    let s2="";
    for (i = 0; i < 5; i++){
        k= Math.floor(Math.random()*(charList.length));
        s2= charList.charAt(k);
        s1+=s2;
    }
    // console.log(s1);
    return s1;
}




app.get('/', async (req, res) => {
  res.send('Hello World!');
});

app.post('/api/upload', async (req,res) => { 
    const { link } = req.body;
    // console.log(link);
    //First we generate a random 5 letter string and then we check if its there in db, if not add to db along with the actual link. If there then rerun the random string part
    let randomString = generateString();
    let checkQuery = `SELECT * FROM urls WHERE short_url = '${randomString}'`;
    let checkResult = await pool.query(checkQuery);
    if (checkResult.rows.length > 0){
        // console.log("Already present in db, rerun the random string part")
        randomString = generateString();
    }
    await pool.query(`INSERT INTO urls (short_url, long_url) VALUES ('${randomString}', '${link}')`)
    .then(result => {
        // console.log("Inserted into db")
        res.status(200).json({short_url: randomString});
    })
    .catch(err => {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    });
 });



app.get('/:short_url', async (req, res) => {
    const { short_url } = req.params;
    // console.log(short_url);
    const query = `SELECT long_url FROM urls WHERE short_url = '${short_url}'`;
    pool.query(query)
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json({ long_url: result.rows[0].long_url });
            } else {
                res.status(404).json({ error: 'URL not found' });
            }
        })
        .catch(err => {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal server error' });
        });
});


// pool.query('SELECT NOW()').then(res => console.log(res.rows[0])).catch(err => console.error('Error executing query', err.stack));
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
//  generateString();
