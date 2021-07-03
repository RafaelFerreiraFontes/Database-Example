const express = require('express');
const nunjucks = require('nunjucks');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 8000;

let users = [];

function loadUsersFromDB(){
    let db = new sqlite3.Database('./database/users.sqlite', (err) => {
        if(err)
        {
            return console.log(err.message);
        }

        console.log('Connected to the SQlite Database, for load users data.');
    });

    db.serialize( () => {
        db.each(`SELECT * FROM users`, (err, row) => {
            if (err)
            {
                return console.log(err.message);
            }
            
            users.push(
            { 
                'Username' : row.username,
                'Email' : row.email,
                'Date' :  row.userDate,
                'Password' : row.pass,
                'PasswordConf':  row.passConf 
            }); 
        });
    });

    db.close( (err) => {
        if (err) 
        {
            return console.log(err.message);
        }
    
        console.log('Close the database connection.');
    });
}

loadUsersFromDB();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use( express.urlencoded({ extended: true }) );

app.use(express.static('public'));

app.set('view engine', 'html');

app.get('/', (req, res) =>{

    res.render('index.html');
});

app.get('/users', (req, res) =>{

    res.render('users.html', { users });
});

app.post('/', (req, res) => {

    let data = {
        'Username' : '',
        'Email' : '',
        'Date' : '',
        'Password' : '',
        'PasswordConf' : ''
    };

    data['Username'] = req.body.username;
    data['Email'] = req.body.email;
    data['Date'] = req.body.date;
    data['Password'] = req.body.pass;
    data['PasswordConf'] = req.body.passConf;

    users.push(data);
    
    let db = new sqlite3.Database('./database/users.sqlite', (err) => {
        if(err)
        {
            return console.log(err.message);
        }

        console.log('Connected to the SQlite Database, for insert user data');
    });

    db.serialize( () => {

        let index = 1;

        console.log('Users in sqlite database, users table: \n')

        db.run(`INSERT Into users (username, email, userDate, 
            pass, passConf) values ("${data['Username']}", "${data['Email']}", 
            "${data['Date']}", "${data['Password']}", "${data['PasswordConf']}");`)
        .each(`SELECT * FROM users`, (err, row) => {
            if (err)
            {
                return console.log(err.message);
            }
            
            console.log(`id: ${index++} -> ${row.username} | ${row.email} | ${row.userDate} | ${row.pass} | ${row.passConf} \n`); 
        });
    });

    db.close( (err) => {
        if (err) 
        {
            return console.log(err.message);
        }
    
        console.log('Close the database connection.');
    });

    res.render('index.html');
});

app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
});
