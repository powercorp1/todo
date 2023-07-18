const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _=    require("lodash");

var items=["Buy Food","Cook Food"," Eat Food"];
var workItem=[];
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));

mongoose.connect("mongodb+srv://saidelgy94:test123@cluster0.bo3stvr.mongodb.net/todolistDB"); //if todo list is not present it will create a new database called todolistDB

const itemSchema={
  name: String
};
const Item =mongoose.model("item",itemSchema); //item will automatically be formatted to items (lowdash: remember)

const item1= new Item({
  name:"Welcome to your todolist"
});
const item2= new Item({
  name:"hit this to add new"
});
const item3= new Item({
  name:" hit this to delete"
});
const defaultItems=[item1,item2,item3];
const listSchema= {
  name:String,
  items:[itemSchema]
}

const List= mongoose.model("List",listSchema);


app.get("/", function (req, res) {

  Item.find({})
    .then(function(items){

      if(items.length==0)
      {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("saved succesfully");
          })
          .catch(function (err) {
            console.log(err);
          });
          res.redirect(("/"));
      }
      else{
      res.render("list", { listTitle: "Today",newListItem: items });
      }

    })
    .catch(function(err){
      console.log(err);
    });



  
});

app.post("/",function(req,res){
    
    const itemName = req.body.newItem;
    const listName= req.body.list;

    const item= new Item({
      name: itemName
    });
    if(listName=="Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listName})
        .then(function(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        })
    } 
    
});
app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName= req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndDelete(checkedItemId)
    .then(function(){
      console.log("deleted successfully");
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}} })
      .then(function(){
        res.redirect("/"+listName);
      });
  }
  
})
app.get("/:customListname",function(req,res){
  const customListname= _.capitalize(req.params.customListname);
  List.findOne({name: customListname})
    .then(function(foundList){
      if(!foundList){
        const list=new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListname);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItem:foundList.items});
      }
    })
    .catch(function(err){
      console.log(err);
    });

});
app.get("/work",function(req,res){
     res.render("list",{listTitle: "work list", newListItem: workItem});

});

const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
