# ![Logo](/media/Logo.png) &nbsp; **sfpegSearchListCmp** Component

This component is part of the [`sfpegList-utilities`](/help/sfpegListPkgUtilities.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **sfpegSearchListCmp** LWC Component is a LWC wrapper of the standard 
**[sfpegListCmp](/help/sfpegListCmp.md)** component and enables to set 
a filtering context for such lists via a search form above a result list.

Typical use cases is to implement a query page letting users set various 
search criteria before displaying the matching list.

At first, only the search form is displayed.

![sfpegSearchListCmp Initialization](/media/sfpegSearchListCmpInit.png)

Then, once the _Apply_ button has been clicked, the result list is displayed
below the search form.

![sfpegSearchListCmp Completion](/media/sfpegSearchListCmp.png)


## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

This component has almost exactly the same configuration the as the
**[sfpegListCmp](/help/sfpegListCmp.md)** component, the main difference lying
in the `Display Configuration` property of the underlying **sfpegList** custom metadata
record to include the description of the search form.

To define the set of fields to display in the search form, an additional
`searchForm` property is added to define the record form used to enter
criteria values. Such a property should be a JSON object including the following
properties:
* `objectApiName`: API Name of the object for which input fields are used
* `recordTypeId`: (optional) record type ID to use (e.g. for picklist values filtering)
* `size`: default size of each input field (6 corresponding to 50%, 12 to 100%)
* `fields`: list of input fields to display as a JSON list of  field definitions with
the following sub-properties:
    * `name`: API name of the field to disply
    * `required` (optional) boolean flag to set the input as required
    * `disabled` (optional) boolean flag to set the input as disabled
    * `size` to override the default input size.

ℹ️ The search query is usually implemented by leveraging the
**[sfpegSearch_SVC](/help/sfpegSearchQueries.md)** Query Extension,
the search form input field values being pushed into the `Query Input`
property of the **sfpegList** metadata record vie the **CTX** tokens
(see also **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility).


## Configuration Example

For the example presented above, the configuration of the **sfpegList** custom metadate
should be done e.g. as follows:
* `Query Type` set as `Apex`
* `Query Input` set as
```
{
    "TITLE":"{{{CTX.Name}}}",
    "TYPES":"{{{CTX.Types__c}}}",
    "COMMENT":"{{{CTX.Comment__c}}}"
}
```
* `Query Class` set as `sfpegSearch_SVC`
* `Query Template` set as 
```
{
    "soql": {
        "select": "SELECT Id, Title, ContentSize, FileType, FileExtension,
                    TOLABEL(LatestPublishedVersion.Type__c), LatestPublishedVersion.ContentSize, 
                    LatestPublishedVersion.Comment__c, LatestPublishedVersion.LastModifiedDate, 
                    LatestPublishedVersion.VersionNumber, LatestPublishedVersion.DocTypeIcon__c 
                    FROM ContentDocument {{{CLAUSE}}}
                    ORDER BY LatestPublishedVersion.LastModifiedDate desc",
        "where": {
            "CLAUSE": {
                "AND": [
                    { "IN": {"field": "LatestPublishedVersion.Type__c","context": "TYPES"}},
                    { "LK": {"field": "Title","context": "TITLE"}},
                    { "LK": {"field": "LatestPublishedVersion.Comment__c","context": "COMMENT"}}
                ]
            }
        }
    }
}
```
* `Display Type` set as `table`
* `Flatten Results?` set as `true`
* `Display Configuration` set as
```
{
    "keyField": "Id",
    "widthMode": "auto",
    "cardNbr": 1,
    "stacked": false,
    "title": { "label": "Title","fieldName": "Title","sortable": true,"action": "previewFile"   },
    "icon": {"fieldName": "LatestPublishedVersion.DocTypeIcon__c","size": "small"},
    "columns": [
        {"label": "Title","fieldName": "Title","sortable": true},
        {"label": "Type","fieldName": "LatestPublishedVersion.Type__c","sortable": true},
        {"label": "Dernière modification","fieldName": "LatestPublishedVersion.LastModifiedDate","type": "date","sortable": true},
        {"label": "Nombre de versions","fieldName": "LatestPublishedVersion.VersionNumber","sortable": true}
    ],
    "details":[
        {"label": "Comment","fieldName": "LatestPublishedVersion.Comment__c"},
        {"label": "Extension de fichier","fieldName": "FileType","sortable": true}
    ],
    "menu": [
        {"label": "Preview","iconName": "utility:preview","name": "previewFile"},
        { "label": "Edit Meta", "iconName": "utility:edit", "name": "editFile" },
        { "label": "Open", "iconName": "utility:open", "name": "openFile" },
        {"label": "Unlink","iconName": "utility:remove_link","name": "unlinkFile"},
        {"label": "Delete","iconName": "utility:delete","name": "deleteFile"}
    ],
    "searchForm": {
        "objectApiName":"ContentProxy__c",
        "size":6,
        "fields":[
            {"name":"Name"},
            {"name":"Comment__c"},
            {"name":"Types__c","size":12}
        ]
    }
}
```
* `Display Configuration` set as `RelatedFilesRowActions`

The r`RelatedFilesRowActions` ow action **sfpegAction** metadata record then contains
the definition of the different actions mentioned in the menu and the title, e.g.
```
[
    {   "name":"previewFile",
        "action":{
            "type":"navigation",
            "params":{
                "type":"standard__namedPage",
                "attributes":{"pageName":"filePreview"},
                "state":{
                    "recordIds":"{{{ROW.ContentDocumentId}}}",
                    "selectedRecordId":"{{{ROW.ContentDocumentId}}}"
                }
            }
        }
    },
    {   "name":"openFile",
        "action":{
            "type":"navigation",
            "params":{
                "type":"standard__recordPage",
                "attributes":{
                    "recordId":"{{{ROW.ContentDocumentId}}}",
                    "objectApiName":"ContentDocument",
                    "actionName":"view"
                }
            }
        }
    },
    {   "name":"editFile",
        "action":{
            "type":"ldsForm",
            "params":{
                "title":"Modify File Metadata",
                "message":"You may change the following properties.",
                "columns":1,
                "record":{
                    "Id":"{{{ROW.ContentDocument.LatestPublishedVersionId}}}",
                    "ObjectApiName":"ContentVersion"
                },
                "fields":[
                    {"name":"Title","required":true},
                    {"name":"Type__c"}
                ],
                "next":{
                    "type":"reload",
                    "params":{"recordId":"{{{GEN.recordId}}}"},
                    "next":{"type":"done","params":{"type":"refresh"}}
                }
            }
        }
    },
    {   "name":"unlinkFile",
        "action":{
            "type":"LDS",
            "params":{
                "type":"delete",
                "title":"Remove File Link",
                "message":"Please confirm the removal.",
                "params":"{{{ROW.Id}}}",
                "next":{
                    "type":"reload",
                    "params":{"recordId":"{{{GEN.recordId}}}"},
                    "next":{"type":"done","params":{"type":"refresh"}}
                }
            }
        }
    }
]
```

## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.