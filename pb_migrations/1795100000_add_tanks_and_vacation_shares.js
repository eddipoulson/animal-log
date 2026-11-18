/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const animals = app.findCollectionByNameOrId("pbc_121574967");
  const feedings = app.findCollectionByNameOrId("pbc_960135471");
  const tasks = app.findCollectionByNameOrId("pbc_2602490748");

  animals.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2876557598",
    "maxSelect": 7,
    "name": "dates",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }));

  const habitats = new Collection({
    "id": "pbc_8057421196",
    "name": "habitats",
    "type": "base",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text6217743901",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text6217743902",
        "max": 100,
        "min": 1,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text6217743903",
        "max": 0,
        "min": 0,
        "name": "notes",
        "pattern": "",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation6217743904",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "owner",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "listRule": "owner = @request.auth.id",
    "viewRule": "owner = @request.auth.id",
    "createRule": "@request.auth.id != '' && owner = @request.auth.id",
    "updateRule": "owner = @request.auth.id && @request.body.owner:changed = false",
    "deleteRule": "owner = @request.auth.id"
  });
  app.save(habitats);

  animals.fields.add(new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_8057421196",
    "hidden": false,
    "id": "relation6217743905",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "habitat",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }));
  animals.fields.add(new Field({
    "hidden": false,
    "id": "number6217743906",
    "max": 10000,
    "min": 1,
    "name": "quantity",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));
  animals.listRule = "owner = @request.auth.id";
  animals.viewRule = "owner = @request.auth.id";
  animals.createRule = "@request.auth.id != '' && owner = @request.auth.id && (habitat = '' || habitat.owner = @request.auth.id)";
  animals.updateRule = "owner = @request.auth.id && @request.body.owner:changed = false && (habitat = '' || habitat.owner = @request.auth.id)";
  animals.deleteRule = "owner = @request.auth.id";
  app.save(animals);
  app.db().newQuery("UPDATE animals SET quantity = 1 WHERE quantity IS NULL OR quantity <= 0").execute();

  feedings.fields.add(new Field({
    "hidden": false,
    "id": "text6217743907",
    "max": 100,
    "min": 0,
    "name": "fedBy",
    "pattern": "",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }));
  feedings.listRule = "animal.owner = @request.auth.id";
  feedings.viewRule = "animal.owner = @request.auth.id";
  feedings.createRule = "@request.auth.id != '' && animal.owner = @request.auth.id";
  feedings.updateRule = "animal.owner = @request.auth.id";
  feedings.deleteRule = "animal.owner = @request.auth.id";
  app.save(feedings);

  tasks.fields.add(new Field({
    "hidden": false,
    "id": "text6217743908",
    "max": 100,
    "min": 0,
    "name": "completedBy",
    "pattern": "",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }));
  tasks.fields.add(new Field({
    "hidden": false,
    "id": "date6217743909",
    "max": "",
    "min": "",
    "name": "completedAt",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }));
  tasks.createRule = "@request.auth.id != '' && owner = @request.auth.id && (animal = '' || animal.owner = @request.auth.id)";
  tasks.updateRule = "owner = @request.auth.id && @request.body.owner:changed = false && (animal = '' || animal.owner = @request.auth.id)";
  app.save(tasks);

  const shares = new Collection({
    "id": "pbc_7459162830",
    "name": "careShares",
    "type": "base",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text6217743910",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": true,
        "id": "text6217743911",
        "max": 64,
        "min": 64,
        "name": "tokenHash",
        "pattern": "^[a-f0-9]{64}$",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation6217743912",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "owner",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_121574967",
        "hidden": false,
        "id": "relation6217743913",
        "maxSelect": 100,
        "minSelect": 1,
        "name": "sharedAnimals",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "date6217743914",
        "max": "",
        "min": "",
        "name": "expiresAt",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "bool6217743915",
        "name": "revoked",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "select6217743916",
        "maxSelect": 1,
        "name": "permission",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["feeding_and_tasks", "feeding_only", "view_only"]
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "indexes": ["CREATE UNIQUE INDEX idx_care_shares_token_hash ON careShares (tokenHash)"],
    "listRule": "owner = @request.auth.id",
    "viewRule": "owner = @request.auth.id",
    "createRule": "@request.auth.id != '' && owner = @request.auth.id && sharedAnimals:length > 0",
    "updateRule": "owner = @request.auth.id && @request.body.owner:changed = false && @request.body.tokenHash:changed = false && @request.body.sharedAnimals:changed = false && @request.body.expiresAt:changed = false && @request.body.permission:changed = false",
    "deleteRule": "owner = @request.auth.id"
  });
  app.save(shares);
}, (app) => {
  const shares = app.findCollectionByNameOrId("pbc_7459162830");
  app.delete(shares);

  const tasks = app.findCollectionByNameOrId("pbc_2602490748");
  tasks.fields.removeById("text6217743908");
  tasks.fields.removeById("date6217743909");
  tasks.createRule = "@request.auth.id != '' && owner = @request.auth.id";
  tasks.updateRule = "owner = @request.auth.id";
  app.save(tasks);

  const feedings = app.findCollectionByNameOrId("pbc_960135471");
  feedings.fields.removeById("text6217743907");
  feedings.listRule = null;
  feedings.viewRule = null;
  feedings.createRule = null;
  feedings.updateRule = null;
  feedings.deleteRule = null;
  app.save(feedings);

  const animals = app.findCollectionByNameOrId("pbc_121574967");
  animals.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2876557598",
    "maxSelect": 2,
    "name": "dates",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }));
  animals.fields.removeById("relation6217743905");
  animals.fields.removeById("number6217743906");
  animals.listRule = null;
  animals.viewRule = null;
  animals.createRule = null;
  animals.updateRule = null;
  animals.deleteRule = null;
  app.save(animals);

  app.delete(app.findCollectionByNameOrId("pbc_8057421196"));
})
