# ![Logo](/media/Logo.png) &nbsp; **sfpegJsonList_SVC** and **sfpegJsonAction_SVC** Extensions

These components are part of the [`sfpegList-examples`](/help/sfpegListPkgExamples.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same classes [here](/blob/v0/help/sfpegJson.md).


## Introduction

The **sfpegJsonList_SVC** and **sfpegJsonAction_SVC** Apex Classes are extensions
to the **[sfpegListCmp](/help/sfpegListCmp.md)** and **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
components capabilities.

They enable to store a stringified list of JSON objects within a Salesforce record text/richtext field
(to avoid a custom child object and related list) and display it as a related list via the
**sfpegListCmp** component, while providing add/update/remove capabilities via the **sfpegActionBarCmp** component.

For instance,
```
[
    {"index":0,"DateFiliation__c":"2024-07-10","LienFiliation__c":"Du conjoint",
    "DateNaissance__c":"2024-07-10","Prenom__c":"aaa","Name":"AAA"},
    {"index":1,"DateFiliation__c":"2021-06-01","LienFiliation__c":"Du conjoint",
    "DateNaissance__c":"2021-06-01","Prenom__c":"bbb","Name":"BBB"}
]
```

ℹ️ The only constraints are that:
* an `index` property is systematically added / managed by this framework
to uniquely identify each JSON object in the list.
* a custom _proxy_ custom object may be required for the _add_ and _update_ 
`apexForm` actions, property names in the JSON objects being directly the
API Names of the fields used in these forms (e.g. `Name` and `DateFiliation__c`)
* updates to the text field are done server side by the Apex **sfpegJsonAction_SVC** service
and `next` actions may be required to refresh client side information.


## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

These Apex classes may be leveraged within standard **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
and **[sfpegListCmp](/help/sfpegListCmp.md)** configuration.

Hereafter are provided 3 different configurations for the 2 Apex classes
* one for the **sfpegListCmp** displaying the JSON data in a table
* one for a **sfpegActionBarCmp** header action menu for the list to add new elements
* one for row level **sfpegActionBarCmp** actions to update or remove elements in the list


### List Query Configuration

![JSON List](/media/sfpegJsonList.png)
_<center>Display text field as list of JSON objects</center>_

Configuration relies on standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration principles.
The main constraints are to :
* provide the name of the text field storing the stringified JSON object list
in the `FIELD`property of the `Query Input`
* make sure max 1 record is returned by the query*

Configuration should be set e.g. as follows:
* `Query Input` property
```
{
    "RCD":"{{{GEN.recordId}}}",
    "FIELD":"EnfantsCandidat__c"
}
```
* `Query Class` property: `sfpegJsonList_SVC`
* `Query Template` property: `SELECT EnfantsCandidat__c FROM Candidature__c WHERE Id='{{{RCD}}}'`
* `Display Type`property: `DataTable`
* `Display Configuration`property:
```
{
    "keyField": "index",
    "widthMode": "auto",
    "columns": [
        {"label": "Nom","fieldName": "Name","sortable": true},
        {"label": "Prénom","fieldName": "Prenom__c","sortable": true},
        {"label": "Date de naissance","fieldName": "DateNaissance__c","sortable": true,"type": "date"},
        {"label": "Lien de filiation","fieldName": "LienFiliation__c","sortable": true},
        {"label": "Date de filiation","fieldName": "DateFiliation__c","sortable": true,"type": "date"}
    ],
    "menu": [
        {"label": "Retirer","iconName": "utility:delete","name": "rmvEnfant"},
        {"label": "Modifier","iconName": "utility:edit","name": "majEnfant"}
    ]
}
```
* `Row Actions` property: Developer name of the row action **sfpegAction** metadata record (see below).


### Header Add Action Configuration 

![JSON Add Popup](/media/sfpegJsonActionAdd.png)
_<center>Header Add Action of a new JSON Object in the list</center>_

Configuration relies on standard **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** configuration principles.
The main constraints are to:
* have a _proxy_ object to manage the input fields in the Apex form popup.
* specify the following mandatory properties in the `params`:
    * `operation`: with the `add` value in this case
    * `objectApiName`: with the API name of the object to update
    * `fieldName`: with the Object field API Name containing the stringified JSON Object list
    * `recordId`: with the ID of the record to update
    * `value`: with the current field value to which teh new value should be added 

Configuration should be set e.g. as follows:
```
[{
    "name": "addEnfant", "label": "Ajouter",
    "action": {
        "type": "apexForm",
        "params": {
            "title": "Ajouter un enfant à charge",
            "message": "Merci de renseigner tous les champs obligatoires.",
            "columns": 2,
            "formRecord": {"ObjectApiName": "EnfantProxy__c"},
            "formFields": [
                {"name": "Name","required": true},
                {"name": "Prenom__c","required": true},
                {"name": "DateNaissance__c"},
                {"name": "LienFiliation__c","required": true},
                {"name": "DateFiliation__c"}
            ],
            "name": "sfpegJsonAction_SVC",
            "params": {
                "operation": "add",
                "fieldName": "EnfantsCandidat__c",
                "objectApiName": "Candidature__c",
                "recordId": "{{{GEN.recordId}}}"
            },
            "next": {
                "type": "reload",
                "params": {"recordId": "{{{GEN.recordId}}}"},
                "next": {
                    "type": "done",
                    "params": {"type": "refresh"}
                }
            }
        }
    }
}]
```


### Row Level Update and Remove Actions Configuration

![JSON Update/Remove Menu](/media/sfpegJsonActionMenu.png)<br/>
_<center>Row Level Actions to edit or remove JSON Objects in the list</center>_

Configuration relies on standard **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** configuration principles. 

Two `operation` values are available: `update` and `remove`.The same constraints apply toas  constraint is to have a _proxy_ object to manage the input fields in the Apex form popup.

Configuration should be set e.g. as follows:
```
[{
    "name": "majEnfant", "label": "Editer",
    "action": {
        "type": "apexForm",
        "params": {
            "title": "Mettre à jour un enfant à charge",
            "message": "Merci de renseigner tous les champs obligatoires.",
            "columns": 2,
            "formRecord": {
                "ObjectApiName": "EnfantProxy__c",
                "Name":"{{{ROW.Name}}}",
                "Prenom__c": "{{{ROW.Prenom__c}}}",
                "DateNaissance__c": "{{{ROW.DateNaissance__c}}}",
                "LienFiliation__c": "{{{ROW.LienFiliation__c}}}",
                "DateFiliation__c": "{{{ROW.DateFiliation__c}}}"
            },
            "formFields": [
                {"name": "Name","required": true},
                {"name": "Prenom__c","required": true},
                {"name": "DateNaissance__c"},
                {"name": "LienFiliation__c","required": true},
                {"name": "DateFiliation__c"}
            ],
            "name": "sfpegJsonAction_SVC",
            "params": {
                "operation": "update",
                "index": "{{{ROW.index}}}",
                "fieldName": "EnfantsCandidat__c",
                "objectApiName": "Candidature__c",
                "recordId": "{{{GEN.recordId}}}"
            },
            "next": {
                "type":"reload",
                "params":{"recordId":"{{{GEN.recordId}}}"},
                "next": {
                    "type": "done",
                    "params": {"type": "refresh"}
                }
            }
        }
    }
},
{
    "name": "rmvEnfant", "label": "Enlever",
    "action": {
        "type": "apex",
        "params": {
            "title": "Retirer un enfant à charge",
            "message": "Merci de confirmer le retrait.",
            "name": "sfpegJsonAction_SVC",
            "params": {
                "operation": "remove",
                "index": "{{{ROW.index}}}",
                "fieldName": "EnfantsCandidat__c",
                "objectApiName": "Candidature__c",
                "recordId": "{{{GEN.recordId}}}"
            },
            "next": {
                "type":"reload",
                "params":{"recordId":"{{{GEN.recordId}}}"},
                "next": {
                    "type": "done",
                    "params": {"type": "refresh"}
                }
            }
        }
    }
}]
```

## Technical Details

The **sfpegJsonList_SVC** class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. This means that pagination is (currently) not supported.

The **sfpegJsonAction_SVC** class implements only the `execute()` method of the **sfpegAction_SVC** interface class. It may be used both for `apexForm` and `apex` **sfpegAction** types.

They come with their related  **sfpegJsonList_TST** and **sfpegJsonAction_TST** test classes
relying on the **sfpegTestObject__c** custom test object with its `TextArea__c` field.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.