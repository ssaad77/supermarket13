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
const { Template } = require('ejs');

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
    carrots: Number,
    lemon: Number,
    apple: Number,
    whitePotato: Number,
    melon: Number,
    redPepper: Number,
    yellowPepper: Number,
    kiwi: Number,
    flatCabbage: Number,
    orange: Number,
    banana: Number,
    eggPlant: Number,
    mango: Number,
    whiteCarrot: Number,
    pomegranate: Number,
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
//var temp_contact = [1];
//temp_val = "hi";
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
        res.render('store', { user: '' });
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
        carrots: req.body.carrots,
        lemon: req.body.lemon,
        apple: req.body.apple,
        whitePotato: req.body.whitePotato,
        melon: req.body.melon,
        redPepper: req.body.redPepper,
        yellowPepper: req.body.yellowPepper,
        kiwi: req.body.kiwi,
        flatCabbage: req.body.flatCabbage,
        orange: req.body.orange,
        banana: req.body.banana,
        eggPlant: req.body.eggPlant,
        mango: req.body.mango,
        whiteCarrot: req.body.whiteCarrot,
        pomegranate: req.body.pomegranate,
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

myApp.post('/order',[
    check('carrots').custom((value, { req }) => {
        value = parseInt(value)
        if ((value + parseInt(req.body.lemon) +
        parseInt(req.body.apple)+
        parseInt(req.body.whitePotato)+
        parseInt(req.body.melon)+
        parseInt(req.body.redPepper)+
        parseInt(req.body.yellowPepper)+
        parseInt(req.body.kiwi)+
        parseInt(req.body.flatCabbage)+
        parseInt(req.body.orange)+
        parseInt(req.body.banana)+
        parseInt(req.body.eggPlant)+
        parseInt(req.body.mango)+
        parseInt(req.body.whiteCarrot)+
        + parseInt(req.body.pomegranate)) == 0) {
            throw new Error('you have to buy one product at least');
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
            var carrots = req.body.carrots;
            var lemon = req.body.lemon;
            var apple = req.body.apple;
            var whitePotato = req.body.whitePotato;
            var melon = req.body.melon;
            var redPepper = req.body.redPepper;
            var yellowPepper = req.body.yellowPepper;
            var kiwi = req.body.kiwi;
            var flatCabbage = req.body.flatCabbage;
            var orange = req.body.orange;
            var banana = req.body.banana;
            var eggPlant = req.body.eggPlant;
            var mango = req.body.mango;
            var whiteCarrot = req.body.whiteCarrot;
            var pomegranate = req.body.pomegranate;
            var carrotsT = parseInt(carrots) * .40;
            carrotsT = carrotsT.toFixed(2);
            var lemonT = parseInt(lemon) * .50;
            lemonT = lemonT.toFixed(2);
            var appleT = parseInt(apple) * .60;
            appleT = appleT.toFixed(2);
            var whitePotatoT = parseInt(whitePotato) * .70;
            whitePotatoT = whitePotatoT.toFixed(2);
            var melonT = parseInt(melon) * .80;
            melonT = melonT.toFixed(2);
            var redPepperT = parseInt(redPepper) * .60;
            redPepperT = redPepperT.toFixed(2);
            var yellowPepperT = parseInt(yellowPepper) * .70;
            yellowPepperT = yellowPepperT.toFixed(2);
            var kiwiT = parseInt(kiwi) * .50;
            kiwiT = kiwiT.toFixed(2);
            var flatCabbageT = parseInt(flatCabbage) * .50;
            flatCabbageT = flatCabbageT.toFixed(2);
            var orangeT = parseInt(orange) * .60;
            orangeT = orangeT.toFixed(2);
            var bananaT = parseInt(banana) * .70;
            bananaT = bananaT.toFixed(2);
            var eggPlantT = parseInt(eggPlant) * .90;
            eggPlantT = eggPlantT.toFixed(2);
            var mangoT = parseInt(mango) * .40;
            mangoT = mangoT.toFixed(2);
            var whiteCarrotT = parseInt(whiteCarrot) * .50;
            whiteCarrotT = whiteCarrotT.toFixed(2);
            var pomegranateT = parseInt(pomegranate) * .99;
            pomegranateT = pomegranateT.toFixed(2);
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

            var subtotal = parseFloat(carrotsT) + parseFloat(lemonT) + parseFloat(appleT) +  parseFloat(whitePotatoT) +  parseFloat(melonT) + +  parseFloat(redPepperT) +  parseFloat(yellowPepperT) +  parseFloat(kiwiT) + parseFloat(flatCabbageT) + parseFloat(orangeT) + parseFloat(bananaT) +parseFloat(eggPlantT) +parseFloat(mangoT) +parseFloat(whiteCarrotT) +parseFloat(pomegranateT) +
            parseFloat(shippingExpenses);
            var tax = subtotal * .13;
            tax = parseFloat(tax.toFixed(2));
            var total = subtotal + tax;
            total = total.toFixed(2);
            var pageData = {
                name: myUsername,
                carrots: carrotsT,
                lemon: lemonT,
                apple: appleT,
                whitePotato: whitePotatoT,
                melon: melonT,
                redPepper: redPepperT,
                yellowPepper: yellowPepperT,
                kiwi: kiwiT,
                flatCabbage: flatCabbageT,
                orange: orangeT,
                banana: bananaT,
                eggPlant: eggPlantT,
                mango: mangoT,
                whiteCarrot: whiteCarrotT,
                pomegranate: pomegranateT,
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
                text: 'Hi ' + req.session.loggedInUser.name + '\n' + 'your invoice \n' + 'carrots :' + '' + carrotsT + '\n' + 'lemon :' + '' + lemonT + '\n' + 'apple :' + '' + appleT +'\n' + 'whitePotato :' + '' + whitePotatoT + '\n' + 'melon :' + '' + melonT + '\n'  + 'redPepper :' + '' + redPepperT +'\n' + 'yellowPepper :' + '' + yellowPepperT +'\n'+ 'kiwi :' + '' + kiwiT +'\n' +'flatCabbage :' + '' + flatCabbageT +'\n' +'orange :' + '' + orangeT +'\n'+'banana :' + '' + bananaT +'\n' +
                'eggPlant :' + '' + eggPlantT +'\n' +'mango :' + '' + mangoT +'\n' +'whiteCarrot :' + '' + whiteCarrotT +'\n' +'pomegranate :' + '' + pomegranateT +'\n' +

                'Shipping Charge :' + '' + shippingExpenses.toString() + '\n' + 'Sub Total Charge :' + '' + subtotal.toString() + '\n' + ' Tax :' + '' + tax.toString() + '\n' + 'Total :' + '' + total.toString()
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            var myOrder = new Order(pageData);
            console.log('email');
            console.log(req.session.loggedInUser.email);
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

    ///////

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

        console.log('errors before db call: ', errors);

        // check unique email
        Contact.findOne({ email: req.body.email }).exec((err, e_contact) => {
            if (err) return handleError(err);

            console.log('errors after db call: ', errors);

            if (e_contact != null) {
                console.log("email already exists");

                // if email exists
                errors.errors.push({
                    value: 'the email',
                    msg: 'this email already exists, please choose another email',
                    param: 'email',
                    location: 'body'
                });
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