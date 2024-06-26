// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Domena, z której będą akceptowane żądania
    credentials: true // Umożliwia wysyłanie i odbieranie cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: '3b4f4e8d-9c7b-4c8e-95f1-8d3b3f7a8f3c-1a2b3c4d5e6f7g8h9i0j',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Importowanie modeli
const User = require('./models/User');
const Book = require('./models/Book');
const Loan = require('./models/Loan');
const Reservation = require('./models/Reservation');

const  userRoutes = require('./routes/user');
const  bookRoutes = require('./routes/book');
const loanRoutes = require('./routes/loan');
const reservationRoutes = require('./routes/reservation');

User.hasMany(Reservation, { foreignKey: 'id_user' });
Reservation.belongsTo(User, { foreignKey: 'id_user' });

Book.hasMany(Reservation, { foreignKey: 'id_book' });
Reservation.belongsTo(Book, { foreignKey: 'id_book' });

User.hasMany(Loan, { foreignKey: 'id_user' });
Loan.belongsTo(User, { foreignKey: 'id_user' });

Book.hasMany(Loan, { foreignKey: 'id_book' });
Loan.belongsTo(Book, { foreignKey: 'id_book' });
app.use('/reservations', reservationRoutes);
app.use('/loans', loanRoutes);

app.use('/users', userRoutes);
app.use('/books', bookRoutes);

// Endpoint testowy połączenia z bazą danych
app.get('/test-db-connection', async (req, res) => {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        res.status(200).json({
            message: 'Połączenie z bazą danych działa',
            users: users
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        res.status(500).json({
            message: 'Nie udało się połączyć z bazą danych',
            error: error.message
        });
    }
});

// Synchronizacja modeli z bazą danych
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
