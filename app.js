const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
// const date = require(__dirname + '/date.js');

const app = express();

// setting up ejs
app.set('view engine', 'ejs');

// to parse the request body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

// 1 - make connection with mongoose
mongoose.connect('mongodb+srv://admin-sameer:16122000@cluster0.flijlqq.mongodb.net/todolistDB', {
    useNewUrlParser: true
});

// 2 - create a schema/DB
const itemsSchema = new mongoose.Schema({
    name: String
});

// 3 - create a model/table
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Welcome to your todolist!'
});

const item2 = new Item({
    name: 'Hit the + button to add a new task.'
});

const item3 = new Item({
    name: '<= Hit this to delete the task.'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {
    // const day = date.getDay();
    // const day = date.getDate();

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Successfully added default items to DB');
                }
            });
            res.redirect('/');
        } else {
            res.render('list', {
                listTitle: 'Today',
                newListItems: foundItems
            });
        }
    });
});

app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                res.render('list', {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });
});

// to handle the post request coming from the form
app.post('/', function (req, res) {
    const taskName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: taskName
    });

    if (listName === 'Today') {
        item.save();
        res.redirect('/');
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+ listName);
        });
    }



    // if(req.body.list === "Work List"){
    //     workItems.push(task);
    //     res.redirect('/work');
    // }else{
    //     tasks.push(task);
    //     res.redirect('/');
    // } 
});

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === 'Today'){
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Task successfully removed');
            }
            res.redirect('/');
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/' + listName);
            }
        });
    }
});

// app.get('/work', function (req, res) {
//     res.render('list', {
//         listTitle: 'Work List',
//         newListItems: workItems
//     });
// });

app.post('/work', function (req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work');
});

app.listen(3000, function () {
    console.log('App is live on http://localhost:3000');
});