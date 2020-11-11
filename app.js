const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const passport = require('passport')
const connectDB = require('./config/db')
const exphbs = require('express-handlebars')
const morgan = require('morgan')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

//Load config
dotenv.config({path:'./config/config.env'})

//Passport config
require('./config/passport')(passport)



connectDB()

const app = express()

//Body parser middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Method override for POST
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))


//Logginh
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//Handlebars helpers

const {formatDate, stripTags, truncate, editIcon,select} = require('./helpers/hbs')

//Handlebars
//TODO CAN CAUSE FAILS
app.engine('hbs', exphbs.create({helpers: {formatDate,truncate, stripTags, editIcon,select}, defaultLayout:'main',extname:'.hbs'}).engine);
app.set('view engine', 'hbs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))


//Passports middleware
app.use(passport.initialize())
app.use(passport.session())


//Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//Static folder

app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT||5000

app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))