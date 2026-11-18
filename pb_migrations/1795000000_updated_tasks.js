/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748");

  collection.fields.add(new Field({
    "hidden": false,
    "id": "text5731984201",
    "max": 0,
    "min": 1,
    "name": "title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }));
  collection.fields.add(new Field({
    "hidden": false,
    "id": "text5731984202",
    "max": 0,
    "min": 0,
    "name": "notes",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));
  collection.fields.add(new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation5731984203",
    "maxSelect": 1,
    "minSelect": 1,
    "name": "owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }));
  collection.fields.add(new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_121574967",
    "hidden": false,
    "id": "relation5731984204",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "animal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }));
  collection.fields.add(new Field({
    "hidden": false,
    "id": "date5731984205",
    "max": "",
    "min": "",
    "name": "dueDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }));
  collection.fields.add(new Field({
    "hidden": false,
    "id": "bool5731984206",
    "name": "completed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }));

  collection.listRule = "owner = @request.auth.id";
  collection.viewRule = "owner = @request.auth.id";
  collection.createRule = "@request.auth.id != '' && owner = @request.auth.id";
  collection.updateRule = "owner = @request.auth.id";
  collection.deleteRule = "owner = @request.auth.id";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748");

  collection.fields.removeById("text5731984201");
  collection.fields.removeById("text5731984202");
  collection.fields.removeById("relation5731984203");
  collection.fields.removeById("relation5731984204");
  collection.fields.removeById("date5731984205");
  collection.fields.removeById("bool5731984206");
  collection.listRule = null;
  collection.viewRule = null;
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;

  return app.save(collection);
})
