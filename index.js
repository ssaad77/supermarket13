const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const session = require('express-session');

const ContactUs = mongoose.model('ContactUs', {
    name: String,
    email: String,
    phone: String,
    message: String
});
const Contact = mongoose.model('Contact', {
    name: String,
    admin: Boolean,
    email: String,
    password: String,
    phone: String,
    address: String,
    city: String,
    postCode: String,
    province: String
});
const Order = mongoose.model('Order', {
    product1: Number,
    product2: Number,
    product3: Number,
    delivery: Number,
    subtotal: Number,
    tax: Number,
    total: Number
});

const Admin = mongoose.model('Admin', {
    username: String,
    password: String
});

var myApp = express();
myApp.use(session({
    secret: 'sam',
    resave: false,
    saveUninitialized: true
}));

myApp.use(bodyParser.urlencoded({ extended: false }));
myApp.use(bodyParser.json())
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

myApp.get('/', function (req, res) {
    res.render('index', { user: req.session.loggedInUser });
});

myApp.get('/order', function (req, res) {
    if (req.session.userLoggedIn) {
        res.render('orderForm', { user: req.session.loggedInUser });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/contactUs', function (req, res) {
    res.render('contactUsForm', { user: req.session.loggedInUser });
});

myApp.get('/store', function (req, res) {
    if (req.session.userLoggedIn) {
        res.render('store', { user: req.session.loggedInUser });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/register', function (req, res) {
    if (!req.session.userLoggedIn) {
        res.render('registerForm');
    } else {
        res.render('alreadyLoggedIn', { user: req.session.loggedInUser });
    }
});

myApp.get('/login', function (req, res) {
    if (!req.session.userLoggedIn) {
        res.render('loginForm', { attemptFailed: false });
    } else {
        res.render('alreadyLoggedIn', { user: req.session.loggedInUser });
    }
});
myApp.get('/logout', function (req, res) {
    const ssn = req.session;
    if (ssn.userLoggedIn) {
        const name = ssn.loggedInUser.name;
        ssn.userLoggedIn = false;
        ssn.loggedInUser = undefined;

        res.render('logout', { name: name });
    } else {
        res.render('notLoggedIn');
    }
});
myApp.get('/allcontacts', function (req, res) {
    if (req.session.userLoggedIn) {
        Contact.find({}).exec(function (err, contacts) {
            res.render('allcontacts', { user: req.session.loggedInUser, contacts: contacts });
        });
    } else {
        res.redirect('/login');
    }
});
myApp.get('/allorders', function (req, res) {
    if (req.session.userLoggedIn) {
        Order.find({}).exec(function (err, contacts) {
            res.render('allorders', { user: req.session.loggedInUser, contacts: contacts });
        });
    } else {
        res.redirect('/login');
    }
});
myApp.get('/allmessages', function (req, res) {
    if (req.session.userLoggedIn) {
        ContactUs.find({}).exec(function (err, s_contacts) {
            res.render('allmessages', { user: req.session.loggedInUser, contacts: s_contacts });
        });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/allcontacts/edit/:id', function (req, res) {
    var id = req.params.id;
    Contact.findOne({ _id: id }).exec(function (err, contact) {
        res.render('editContact', { user: req.session.loggedInUser, contact: contact })
    });
});

myApp.post('/allcontacts/edit/:id', function (req, res) {
    var id = req.params.id;

    var updateData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        city: req.body.city,
        province: req.body.province,
        phone: req.body.phone
    }
    Contact.updateOne({ _id: id }, updateData).then(() => {
        res.redirect('/allcontacts');
    });
});

myApp.get('/allcontacts/delete/:id', function (req, res) {
    var id = req.params.id;

    Contact.findByIdAndDelete({ _id: id }).exec(function (err, contact) {
        res.render('contactDeleted', { user: req.session.loggedInUser, deletedUserName: contact.name });
    });
});

myApp.get('/allorders/edit/:id', function (req, res) {
    var id = req.params.id;
    Order.findOne({ _id: id }).exec(function (err, order) {
        res.render('editOrder', { user: req.session.loggedInUser, order: order })
    });
});
myApp.post('/allorders/edit/:id', function (req, res) {
    var id = req.params.id;
    var updateOrderData = {
        product1: req.body.product1,
        product2: req.body.product2,
        product3: req.body.product3,
        delivery: req.body.delivery,
        subtotal: req.body.subtotal,
        tax: req.body.tax,
        total: req.body.total
    }
    Order.updateOne({ _id: id }, updateOrderData).then(() => {
        res.redirect('/allorders');
    });
});

myApp.get('/allorders/delete/:id', function (req, res) {
    var id = req.params.id;
    Order.findByIdAndDelete({ _id: id }).exec(function (err, contact) {
        res.render('orderDeleted', { user: req.session.loggedInUser, deletedOrderName: contact.name });
    });
});


myApp.get('/allmessages/edit/:id', function (req, res) {
    var id = req.params.id;
    ContactUs.findOne({ _id: id }).exec(function (err, s_contacts) {
        console.log(s_contacts);
        res.render('editMessages', { user: req.session.loggedInUser, contacts: s_contacts })
    });
});

myApp.post('/allmessages/edit/:id', function (req, res) {
    var id = req.params.id;
    var updateMessagesData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
    }
    ContactUs.updateOne({ _id: id }, updateMessagesData).then(() => {
        res.redirect('/allmessages');
    });
});
myApp.get('/allmessages/delete/:id', function (req, res) {
    var id = req.params.id;

    ContactUs.findByIdAndDelete({ _id: id }).exec(function (err, Contacts) {
        res.render('messagesDeleted', { user: req.session.loggedInUser, deletedMessageName: Contacts.name });
    });
});
////
myApp.get('/:name', function (req, res) {
    var name = req.params.name;
    Contact.findOne({ name: name }).exec(function (err, contact) {
    });
});
myApp.post('/contactUs', [
    check('name', 'Enter Your Name,Only letters no Number Allowed').matches(/^[a-zA-Z]+$/),
    check('email', 'Enter a valid Email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    check('phone').custom(value => {
        const reg = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}/
        if (!reg.test(value)) {
            throw new Error('Enter a correct phone Number like 000-000-0000');
        }
        return true;
    }),

],
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var errorsData = {
                errors: errors.array(),
                user: req.session.loggedInUser
            }
            res.render('contactUsForm', errorsData);
        }
        else {
            var name = req.body.name;
            var email = req.body.email;
            var phone = req.body.phone;
            var message = req.body.message;

            var pageData = {
                name: name,
                email: email,
                phone: phone,
                message: message,
                user: req.session.loggedInUser
            };
            var myContactUs = new ContactUs(pageData);

            myContactUs.save().then(function () {
                console.log('New contact us request created');
            });

            res.render('contactUsThank', pageData);
        }
    });
myApp.post('/order', [
    check('product1', 'Enter a Number for Product1').isNumeric(),
    check('product2', 'Enter a Number for Product2').isNumeric(),
    check('product3', 'Enter a Number for Product 3').isNumeric(),
    check('product1').custom(value => {
        value = parseInt(value)
        if (value < 0) {
            throw new Error('Negative value found for Product 1');
        }
        return true;
    }),
    check('product1').custom((value, { req }) => {
        value = parseInt(value)
        if ((value + parseInt(req.body.product2) + parseInt(req.body.product3)) == 0) {
            throw new Error('you have to buy one product at least');
        }
        return true;
    }),

    check('product2').custom(value => {
        value = parseInt(value)
        if (value < 0) {
            throw new Error('Negative value found for Product 2');
        }
        return true;
    }),
    check('product3').custom(value => {
        value = parseInt(value)
        if (value < 0) {
            throw new Error('Negative value found for Product 3');
        }
        return true;
    }),
],
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var data = {
                errors: errors.array(),
                user: req.session.loggedInUser
            }
            res.render('orderForm', data);
        }
        else {
            var product1 = req.body.product1;

            var product2 = req.body.product2;

            var product3 = req.body.product3;

            var product1T = parseInt(product1) * .55;
            product1T = product1T.toFixed(2);
            var product2T = parseInt(product2) * .70;
            product2T = product2T.toFixed(2);
            var product3T = parseInt(product3) * .80;
            product3T = product3T.toFixed(2);
            var myUsername = req.session.loggedInUser.name;
            var delivery = parseInt(req.body.delivery[1]);
            var shippingExpenses = 0;
            if (req.body.delivery[0] == 'yes') {
                if (delivery == 1) {
                    shippingExpenses = 10;
                }
                if (delivery == 2) {
                    shippingExpenses = 7;
                }
                if (delivery == 3) {
                    shippingExpenses = 5;
                }
                if (delivery == 4) {
                    shippingExpenses = 3;
                }
            }
            var subtotal = parseFloat(product1T) + parseFloat(product2T) + parseFloat(product3T) + parseFloat(shippingExpenses);
            var tax = subtotal * .13;
            tax = parseFloat(tax.toFixed(2));
            var total = subtotal + tax;
            total = total.toFixed(2);
            var pageData = {
                name: myUsername,
                product1: product1T,
                product2: product2T,
                product3: product3T,
                delivery: shippingExpenses,
                subtotal: subtotal,
                tax: tax,
                total: total,
                user: req.session.loggedInUser
            };
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'yahoo',
                auth: {
                    user: 'supermarketgroup13@yahoo.com',
                    pass: 'jkepnftkttuxmxhc',
                }
            });

            var mailOptions = {
                from: 'supermarketgroup13@yahoo.com',
                to: req.session.loggedInUser.email,
                subject: 'Your invoice',
                text: 'Hi ' + req.session.loggedInUser.name + '\n' + 'your invoice \n' + 'product1 :' + '' + product1T.toString() + '\n' + 'product2 :' + '' + product2T.toString() + '\n' + 'product3 :' + '' + product3T.toString() + '\n' + 'Shipping Charge :' + '' + shippingExpenses.toString() + '\n' + 'Sub Total Charge :' + '' + subtotal.toString() + '\n' + ' Tax :' + '' + tax.toString() + '\n' + 'Total :' + '' + total.toString()
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            var myOrder = new Order(pageData);
            myOrder.save().then(function () {
                console.log('New order created');
            });
            res.render('orderThanks', pageData);
        }
    });

myApp.post('/register', [
    check('name', 'Enter Your Name,Only letters no Number Allowed').matches(/^[a-zA-Z]+$/),
    check('email', 'Enter a valid Email').matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    check('password').custom(value => {
        const passW = /^[A-Za-z]\w{7,15}$/;
        if (!passW.test(value)) {
            throw new Error('your password have to start with letter, and not include Symbol, between 7 and 15');
        }
        return true;
    }),
    check('phone').custom(value => {
        const reg = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}/
        if (!reg.test(value)) {
            throw new Error('Enter a correct phone Number like 000-000-0000');
        }
        return true;
    }),
    check('address', 'Enter your Address').not().isEmpty(),
    check('city', 'Enter a City').not().isEmpty(),
    check('postCode').custom(value => {
        const reg = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
        if (!reg.test(value)) {
            throw new Error('Enter a correct postal code like X0X 0X0');
        }
        return true;
    })
],
    function (req, res) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
        }
        if (!errors.isEmpty()) {
            var errorsData = {
                errors: errors.array(),
                user: req.session.loggedInUser
            }
            res.render('registerForm', errorsData);
        } else {
            var name = req.body.name;
            var email = req.body.email;
            var password = req.body.password;
            var phone = req.body.phone;
            var address = req.body.address;
            var city = req.body.city;
            var postCode = req.body.postCode;
            var province = req.body.province;
            var myContact = new Contact({
                name: name,
                email: email,
                password: password,
                phone: phone,
                address: address,
                city: city,
                postCode: postCode,
                province: province
            });
            myContact.save().then(() => {
                console.log('New contact created: ' + name);
            });
            res.render('registerationThank', myContact);
        }
    });

myApp.post('/login', function (req, res) {
    var email = req.body.username;
    var password = req.body.password;

    Contact.findOne({ email: email, password: password }).exec(function (err, contact) {
        if (err) return handleError(err);

        if (contact) {
            req.session.userLoggedIn = true;
            req.session.loggedInUser = contact;
            if (contact.admin) {
                res.redirect('/');
            } else {
                res.redirect('/store');
            }
        } else {
            console.log('Login Not Successful - User Not Found!');
            res.render('loginForm', { attemptFailed: true });
        }
    });
});

myApp.listen(8080);
console.log('Server started at 8080 for project...');