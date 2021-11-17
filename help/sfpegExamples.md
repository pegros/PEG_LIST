---
# Additional Configuration / Customisation Examples
---

## Action Bar Examples

### Flow Action Launch (leveraging the PEG_FlowEmbed_CMP addressable component)

[Image: Screenshot 2021-09-23 at 16.46.07.png]In this example, a **sfpegListCmp** component is  used to display a set of promoted ongoing Tasks related to the current record and directly, from a drop-down menu,

* open a Flow in a new tab to execute the Flow corresponding to the displayed Task
* trigger a **dmlForm** action to set a close reason before closing the task.

The configuration of the action to open the Flow is provided hereafter.

```
{
    "name": "Action", 
    "label": "Action", "iconName": "utility:success",
    "action": {
        "type": "navigation",
        "params": {
            "type": "standard__component",
            "attributes": { "componentName": "c__PEG_FlowEmbed_CMP" },
            "state": {
                "c__flow": "{{{ROW.TECH_Processus__c}}}",
                "c__recordId": "{{{ROW.Id}}}",
                "c__target": "recordId",
                "c__label": "Execution de tâche"
            }
        }
    }
}
```


FYI, the configuration of the “*close*” action is the following:

```
{
    "name": "abandon",
    "action": {
        "type": "dmlForm",
        "params": {
            "title": "Abandon de tâche NBA",
            "message": "Veuillez sélectionner un motif de clôture.",
            "formRecord": { "ObjectApiName": "TECH_TaskProxy__c" },
            "formFields": [{ "name": "Motif__c", "required": true }],
            "record": {
                "ObjectApiName": "Task",
                "Id": "{{{ROW.Id}}}",
                "Status": "Annulée"
            },
            "next": { "type": "done", "params": { "type": "refresh" } }
        }
    }
}
```


### OpenURL Action with Rework 

In that example, the **sfpegListCmp** component is configured in *DataTable* mode and leverages an Apex Class to fetch metadata about the different attributes of a given SObject.It is displayed in a Knowledge Article and leverages a custom field identifying a given SObject.
[Image: Screenshot 2021-09-23 at 18.40.32.png]
The Query is configured as an Apex fetch, with a class fetches leveraging the *Schema.describe()* methods to provide the proper information.

[Image: Screenshot 2021-09-23 at 18.48.54.png]
The display is configured as follows:

```
{
    "keyField":"QualifiedApiName",
    "widthMode":"auto",
    "columns":[
        {"label":"Label","fieldName":"Label","sortable":true},
        {"label":"Description","fieldName":"Description","sortable":true},
        {"label":"Type","fieldName":"DataType","sortable":true},
        {"label":"Status","fieldName":"BusinessStatus","sortable":true},
        {"label":"Compliance","fieldName":"ComplianceGroup","sortable":true}
        {"label":"Security","fieldName":"SecurityClassification","sortable":true},
        {"label":"API Name","fieldName":"QualifiedApiName","sortable":true},
        {"type": "button-icon", "initialWidth": 50,
            "typeAttributes": {
                "name": "open", "variant":"bare","iconName": "utility:open"}
        }
    ]
}
```


The row action provides a direct link to the Setup page for each attribute (via an **openURL** action with rework feature activated).

```
{
    "name":"open",
    "action":{
        "type":"openURL",
        "params":{
            "url":"/lightning/setup/ObjectManager/{{{ROW.EntityDefinitionId}}}/FieldsAndRelationships/SUBSTR({{{ROW.DurableId}}},'.',1)/view",
            "reworkURL":true
        }
    }
}
```

### Utility Bar specific Actions

Utility main menu with closeAll


```
{
    "label": "Close All Tabs", "variant": "base","iconName": "utility:close",
    "action": {
        "type": "done",
        "params": {
            "type": "closeTabs",
            "params": {
                "closeAll": true
            }
        },
        "next": {
            "type": "done",
            "params": {
                "type": "minimize"
            }
        }
    }
},
{
    "label": "Close All Other Tabs ", "variant": "base", "iconName": "utility:close",
    "action": {
        "type": "done",
        "params": {
            "type": "closeTabs",
            "params": {
                "closeAll": false
            }
        },
        "next": {
            "type": "done",
            "params": {
                "type": "minimize"
            }
        }
    }
}
```


## List Component Examples

### DataTree Display Configuration & Apex Data Fetch

In that example, the **sfpegListCmp** component is configured in *TreeGrid* mode and relies on an Apex class to fetch the whole sub-hierarchy of the current record.
[Image: Screenshot 2021-09-23 at 16.41.36.png]
The Query configuration in the **sfpegList** custom metadata record is done as follows:

[Image: Screenshot 2021-09-23 at 17.52.57.png]

Data are fetched via a custom Apex class implementing the **sfpegListQuery_SVC** virtual class:

* The main method to implement is “*getData*”.
* Its Object input parameter contains the “Query Input” JSON object configured above
* It returns a list of BranchUnit SObjects fetched via an optimised recursive subtree fetch and cast as a standard list of Object (enabling to return whatever data structure to the list component).

```
public with sharing class BranchUnitListQueries_SVC extends sfpegListQuery_SVC {
            
    public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START BranchUnitListQueries_SVC implementation');
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        ID recordId = (ID)(inputData.get('GEN.recordId'));
        System.debug('getData: recordId fetched ' + recordId);
        
        Set<ID> baseSet = new set<ID>();
        baseSet.add(recordId);
        Map<ID,Object> resultMap = fetchDetails(baseSet,0);

        System.debug('getData: END with #records on 1st level ' + resultMap.size());
        return resultMap.values();
    }
    
    private Map<ID,Object> fetchDetails(Set<ID> buIdSet, Integer depth) {
    ...
    }
}
```


The *TreeGrid* layout configuration looks as follows:

```
{
    "keyField":"Id",
    "hierarchyFields":["BranchUnitParentBranchUnit"],
    "widthMode":"auto",
    "columns": [
        {"label":"Name", "fieldName": "Name", "type": "button", "sortable": "true", "initialWidth": 250,
            "typeAttributes":{"label":{"fieldName": "Name"},"name":"open","variant":"base"}},
        { "label": "BranchCode", "fieldName": "BranchCode"},
        { "label": "Type", "fieldName": "Type","sortable": true},
        { "label": "IsActive?", "fieldName": "IsActive", "type":"boolean"},
        { "label": "#Children", "fieldName": "BranchUnitParentBranchUnit._length", "sortable": true},
        {"type":"action","typeAttributes":{"class":"slds-scrollable_none",
            "rowActions": [
                {"label":"Open","iconName":"utility:open","name":"open"},
                {"label":"Edit","iconName":"utility:edit","name":"edit"},
                {"label":"Delete","iconName":"utility:delete","name":"delete"}],
            "menuAlignment":"auto"}
        }
    ]
}
```



