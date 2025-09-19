# ![Logo](/media/Logo.png) &nbsp; **sfpegActionBarCmp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegActionBarCmp.md).


## Introduction

The **sfpegActionBarCmp** component displays a button/menu bar component enabling to
trigger a wide variety of contextualized actions, integrated within the various
components of the **[SF PEG LIST](/README.md)** package but also available
for standalone use in Lightning pages and Site pages.

The following snapshot displays a standalone button bar example combining actions
and menu items.
![Action bar!](/media/sfpegActionBar.png) 

It offers a wide range of actions, from basic navigation requests (e.g. to open a
related record) to more complex ones (such as mass actions with form popup user interaction).

The underlying **sfpegAction__mdt** custom metadata is also used in other
**[SF PEG LIST](/README.md)** repository components to define row level actions,
in which case its display properties become irrelevant.


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

### Global Layout

The action bar basically consists in a single list of buttons and menus (within a
[lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation) 
container).
* A button contains a single action configuration
* A menu contains a drop-down list of multiple action configuration items. 

The following example displays a **sfpegActionBarCmp** component within a page 
with 1 button followed by 2 menus.

![Standlone Action Bar Example!](/media/sfpegActionMenu.png)


### App Builder Configuration

In the _App Builder_ (or _Site Builder_), the configuration of the **sfpegActionBarCmp** component
basically consists in selecting one of the available **sfpegAction__mdt** custom metadata records
containing the details of the buttons and menus to display.

![Standalone Action Bar Configuration](/media/sfpegActionConfiguration.png)

Additional properties enable to control the CSS of the wrapping div, manage number of displayed
actions (before overflow in menu at the end) and activate debug mode.

Only **sfpegAction__mdt** custom metadata records applicable to the page `scope` may be selected
in the dropdown displayed for the `Action configuration` property (see specific section in the
[Component Configuration](/help/configuration.md)).


#### Action Bar Alignment

Via the `CSS Class` parameter (`barClass` field), it is possible to control the background
of the component and the position of the
[lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation).
It is set to `slds-theme_shade slds-grid slds-grid_align-end` by default but may
easily be overriden (by replacing last class by `slds-grid_align-start` to align left
or `slds-grid_align-center` for center).


#### Action Bar Content Overflow (and Responsiveness)

In a standalone **sfpegActionBarCmp**, the width of the component is constrained and the overflow 
happens automatically upon initial rendering of the page. Only the actually visible actions are taken
into account. Menus are automatically converted to menu entries with dividers and subheaders.

![Action Bar with no oveflow](/media/sfpegActionBarNoOverflow.png)<br/>
_<center>Action Bar with no Overflow</center>_

![Action Bar with oveflow](/media/sfpegActionBarWithOverflow.png)<br/>
_<center>Same Action Bar with Overflow applied</center>_


When used as header actions to **[lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation)** components components, there is no width constraint.
Via the `Max. #Actions` parameter (`maxSize` field), it is howver possible to set the max number  of 
actions displayed in the bar before the overflow is applied.
It has therefore been added as configuration parameter to multiple other components
(e.g. **[sfpegCardCmp](/help/sfpegCardCmp.md)** and **[sfpegListCmp](/help/sfpegListCmp.md)**)
to manually control the set of displayed actions (no automatic responsive behaviour).


### Metadata Configuration

The **sfpegAction__mdt** custom metadata provides most of the configuration of the **sfpegActionBarCmp**
components (buttons & menus in an action bar, with underlying actions triggered). Its most important property
is `Actions` which provides all the required information to properly display and execute a set of actions.

Context merge is systematically applied upon load/refresh (see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)**
component) to adapt the set of actions to the display environment.

![Standalone Action Bar Metadata](/media/sfpegActionConfigMeta.png)

The `Do Evaluation?` boolean checkbox enables to trigger an explicit evaluation of
the `hidden` or `disabled` properties on the different action elements (see dynamic action
activation section).


### Base Action Configuration

Hereafter is a typical configuration for a standalone mix of buttons and menus,
containing first a menu with 3 options leading to a report, a dashboard and a folder,
then 2 buttons to create Accounts via a Flow (launched within the addressable
**[sfpegFlowEmbed_CMP](https://github.com/pegros/PEG_FLW/blob/master/help/sfpegFlowEmbedCmp.md)** 
Aura component) or via a standard creation page.
```
[
    {
        "label": "Monitoring",
        "name": "monitoringMenu",
        "variant": "base",
        "type": "menu",
        "items": [
            {
                "label": "Activities",
                "iconName": "utility:reminder",
                "action": {
                    "type": "navigation",
                    "params": {
                        "type": "standard__recordPage",
                        "attributes": {
                            "recordId": "{{{RPT.ActivityMonitoringReport}}}",
                            "objectApiName": "Report",
                            "actionName": "view"
                        }
                    }
                }
            },
            {
                "label": "Leads & Opportunities",
                "iconName": "utility:high_velocity_sales",
                "action": {
                    "type": "navigation",
                    "params": {
                        "type": "standard__recordPage",
                        "attributes": {
                            "recordId": "{{{DBD.LeadOpportunityDashboard}}}",
                            "objectApiName": "Dashboard",
                            "actionName": "view"
                        }
                    }
                }
            },
            {
                "label": "Others",
                "iconName": "utility:open_folder",
                "action": {
                    "type": "navigation",
                    "params": {
                        "type": "standard__recordPage",
                        "attributes": {
                            "recordId": "{{{FLD.MonitoringFolder}}}",
                            "objectApiName": "Folder",
                            "actionName": "view"
                        }
                    }
                }
            }
        ]
    },
    {
        "label": "New Business",
        "iconName": "utility:new",
        "variant": "base",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__component",
                "attributes": {
                    "componentName": "c__sfpegFlowEmbed_CMP"
                },
                "state": {
                    "c__flow": "CreateBusinessAccount",
                    "c__recordId": "null",
                    "c__target": "NewAccountId",
                    "c__label": "Business Creation"
                }
            }
        }
    },
    {
        "label": "New Individual",
        "iconName": "utility:new",
        "variant": "brand",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__objectPage",
                "attributes": {
                    "objectApiName": "Account",
                    "actionName": "new"
                },
                "state": {
                    "defaultFieldValues": "Agency__c={{{USR.MainAgency__c}}},Status__c=Prospect",
                    "nooverride": "1",
                    "recordTypeId": "{{{RT.Account.Individual}}}"
                }
            }
        }
    }
]
```

For buttons, at least `iconName` or `label` should be specified, whereas for menu items,
`label` is mandatory and `iconName` optional.

Multiple other display properties are available:
* `variant` to change the display style (see [lightning-button](https://developer.salesforce.com/docs/component-library/bundle/lightning-button/specification) for possible values).
* `iconPosition` to set the icon on the left or right of the label
* `iconSize` to act on the button icon size (see [lightning-button-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-icon/specification) or [button-menu](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-menu/specification) for info)

At last, there is a main `action` property for each button or menu item, which enabless to specify the actual action to be executed when clicking/selecting the item (see below for available action types), the action being chosen among a set of possible action types described hereafter.


### Dynamic Action Activation (_hidden_ and _disabled_ Properties)

It is also possible to dynamically hide or disable buttons and menu items via
* their `hidden` property, to completely hide (or display) them
* their `disabled` property, to simply disable (or activate) them

By default, they are assumed to be false (i.e. showing and actiating the action item) but simple
boolean values may be used to let them become dynamic, e.g. leveraging record boolean fields or
current user’s custom permissions (via the dedicated `PERM` and `NPERM` merge tokens, see
**[sfpegMergeUtl](/help/sfpegMergeUtl.md)**) as in the following example.
```
[
    {
        "name":"info", "label":"Info (if record not hidden)",
        "hidden":{{{RCD.IsHidden__c}}},
        "action":{
            "type":"toast",
            "params":{
                "title":"FYI {{{USR.Name}}}!",
                "message":"This is an information message on {{{RCD.Name}}}.",
                "variant":"info"
            }
        }
    },
    {
        "label":"Menu",
        "align":"auto",
        "hidden":{{{RCD.IsMenuHidden__c}}},
        "items":[
            {
                "name":"warn", "label":"Warn (if permission)",
                "disabled":{{{PERM.TST_Perm}}},
                "action":{
                    "type":"toast",
                    "params":{
                        "title":"Warn {{{USR.Name}}}!",
                        "message":"This is a warning message on {{{RCD.Name}}}.",
                        "variant":"warning"
                    }
                }
            },
            {
                "name":"error", "label":"Error (if no permission)",
                "disabled":{{{NPERM.TST_Perm}}},
                "action":{
                    "type":"toast",
                    "params":{
                        "title":"Failure for {{{USR.Name}}}!",
                        "message":"This is an error message on {{{RCD.Name}}}.",
                        "variant":"error"
                    }
                }
           }
        ]
    }
]
```

By default, `hidden` and `disabled` properties are assumed to be directly of boolean type 
(component rendering will fail otherwise). However, when selecting `Do Evaluation?` in the
**sfpegAction** custom metadata configuration, it becomes possible to define more complex
conditions as a string property instead (thus reducing the need for custom formula fields),
e.g. combining the need for a custom permission and the record ownership as in the following
example.
```
"hidden":"{{{NPERM.TST_Perm}}} || '{{{RCD.OwnerId}}}' != '{{{GEN.userId}}}'"
```

_Note_: **Beware** to leverage fields that are safe in your conditions, as a possibly unsecure Javascript
`eval()` statement is executed for each string `hidden` and `disabled` property.


### Action Chaining (`next` Property)

It is possible to chain multiple actions one aftrer the other for a menu / button entry.

It may be done at action level, the second action being systematically launched once the first 
has been launched (not necessarily executed).
```
    "action":{
        "type":"_ACTION_1_",
        "params":{_ACTION_1_PARAMS_},
        "next": {
            "type": "_ACTION_2_",
            "params": {
                _ACTION_2_PARAMS_
            }
        }
```

It may be specified within the action `params` property, in which case the second action is
triggered only if the first action completes successfully. Such a mechanism is supported
by most action types, i.e. those able to detect a successful completion (e.g. not the
**navigation** ones).
```
    action":{
        "type":"_ACTION_1_",
        "params":{
            _ACTION_1_PARAMS_,
            "next": {
                "type": "_ACTION_2_",
                "params": {
                    _ACTION_2_PARAMS_
                }
            }
        }
    }
```

_Note_: For some actions (e.g. for **Apex** types), it is possible to trigger a specific action upon
processing error, leveraging the `error` property similarly to the `next` one. In such a case, no 
error toast is raised. This should be still considered a **beta** feature for very specific use
cases (e.g. trigger a flow when an Apex validation logic fails vs update record status via LDS if OK).


## Available Action Types

### **navigation** Action Type

The **navigation** action type enables to trigger the navigation to a [page reference](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type) leveraging the standard [lightning-navigation](https://developer.salesforce.com/docs/component-library/bundle/lightning-navigation/documentation) base LWC component (e.g. to open a standard record creation/edit/view page).

The example below enables to open a report
```
{
    "name":"ReportXXX", "iconName":"utility:metrics", "label":"{{{LBL.TST_ReportXXX}}}",
    "action": {
        "type":"navigation",
        "params": {
            "type": "standard__recordPage",
            "attributes": {
                "recordId":"{{{RPT.ReportXXX}}}",
                "objectApiName":"Report",
                "actionName":"view"
            }
        }
    }
}
```

### **open** and **edit** Action Types

Both action types are actually shortcuts for usual **navigation** one.

* **open** is a shortcut to simplify the opening of a record (for the selected row in a list)
```
{
    "name":"open", "label":"Open","iconName":"utility:open",
    "action":{"type":"open"}
}
```

* **edit** is a shortcut to open the standard edit popup of a record (for the current page record in header /standalone use case or the selected row in a list).
```
{
    "name":"edit","label":"Edit","iconName":"utility:edit",
    "action":{"type":"edit"}
}
```

⚠️ Beware that these actions do not work in LWR Experience, as the `objectApiName` property of
the navigation field becomes mandatory in that case. Standard **navigation** actions to record pages
are then required.


### **openURL** Action Type

The **openURL** action type enables to force the opening of a Web page in a different browser tab (via a `window.open()` javascript call instead of the Lightning navigation service).
* `url` is the main property to define with the target URL to use
* `target` is optional and enables to set a HTML link target different from the default `_blank` value.
* some URL rework directives are available (e.g. **SUBSTR()** or **LEFT()**) but still pending actual large scale use cases to be officially
supported (and documented).
```
{
    "name":"search",
    "label":"{{{LBL.TST_Search}}}",
    "action":{
        "type":"openURL",
        "params":{
            "url":"https://www.google.com/search?q={{{RCD.Name}}}"
        }
    }
}
```

_Note_: See also [Apex List Retrieval and OpenURL Action with Rework](/help/sfpegListCmp.md)
for an example with the **SUBSTR()** URL rework directive.


### **showDetails** Action Type

The **showDetails** action type enables to open a read-only popup presenting details about a record.<br/>
![ShowDetails Action Popup Example](/media/sfpegActionBarShowDetails.png) 

It is a solution to easily replace the record summary on hover for standard lookup fields in standard
list components.

The action should be configured as follows:
* `title` and `message` for the popup header
* `size` (`standard`, `small`, `medium` or `large`) property enables to control the width of the popup
* `columns` to indicate how many fields should be displayed per row
* `fields` to list the fields to display (with their `value`, `type` and `label`)
```
{
    "name":"showDetails",
    "action":{
        "type":"showDetails",
        "params":{
            "columns":2,
            "title":"Interaction pour {{{ROW.Code_Campagne}}}",
            "message":"Détail de l'interaction",
            "fields":[
                {"label":"Domaine","value":"{{{ROW.Domain}}}"},
                {"label":"Envoi","type":"dateTime","value":"{{{ROW.DateEnvoi}}}"},
                {"label":"Segment","value":"{{{ROW.Segment}}}"},
                {"label":"Type de Canal","value":"{{{ROW.TypeCanal}}}"},
                {"label":"Objectif","value":"{{{ROW.Objectif}}}"}
            ]
        }
    }
}
```

_Note_: this example is used as a row action in a **[sfpegListCmp](/help/sfpegListCmp.md)**
component to present information fetched by the query but not displayed in the layout.

By default, a single **Close** button is displayed to close the popup. By leveraging the action
chaining mechanism (via the `next` property), it is possible to:
* execute an action each time the popup closes or
* display a second button with a configurable label to execute this action (the **close** button
simply closing the popup)

This enables e.g. to redirect the User to the displayed record page, as with the following configuration.
The label of the second button displayed comes then from the `label` property in the `next` configuration.
```
{
    "label": "See Owner",
    "name": "SeeOwner",
    "action": {
        "type": "showDetails",
        "params": {
            "columns":2,
            "title":"Owner of {{{RCD.Name}}}",
            "message":"Detailed information about {{{RCD.Owner.Name}}}",
            "fields":[
                {"label":"Username","value":"{{{RCD.Owner.Username}}}"},
                {"label":"Title","value":"{{{RCD.Owner.Title}}}"},
                {"label":"Profile","value":"{{{RCD.Owner.Profile.Name}}}"}
            ],
            "next": {
                "type": "navigation",
                "label":"See more",
                "params": {
                    "type": "standard__recordPage",
                    "attributes": {
                        "recordId": "{{{RCD.OwnerId}}}",
                        "objectApiName": "User",
                        "actionName": "view"
                    }
                }
            }
        }
    }
}
```
_Note_: Beware that, if no `label`is set on the `next` configuration, this action is systematically
executed upon closing of the popup.


### **LDS** and **DML** Action Types 

Two Action Types are available to execute direct record operation (create, update, delete), either via the Ligthning Data Service (LDS, preferrable) or via direct database operation (DML, for non LDS supported objects). A confirmation
popup is usually displayed to the user before executing the operation. 

* **LDS** to trigger a single record direct create/update/delete via the **Lightning Data Service**
    * `title` and `message` properties enable to set the corresponding text elements in the top part of the displayed user confimation popup (default values being applied otherwise, see **sfpegActionDefault...** custom labels).
    * `bypassConfirm` boolean property enable to bypass the confirmation step 
    * `params` property should define the `type` of the LDS action to execute (`create`, `update` or `delete`) and provide the parameters to be provided to the corresponding [uiRecordApi](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_record) primitive, i.e. create, update or delete.
    * Hereafter are 3 possible examples.
```
{
    "name": "newRelated", "label": "Add new Item", "iconName": "utility:add",
    "action": {
        "type": "LDS",
        "params": {
            "type": "create",
            "title": "Adding a Child record",
            "bypassConfirm":true,
            "params": {
                "apiName": "TST_ChildObject__c",
                "fields": {
                    "Name": "New TEST",
                    "ParentL__c": "{{{GEN.recordId}}}",
                    "state__c":false
                }
            }
        }
    }
},
{
    "name": "activate", "label": "Activate Relation", "iconName": "utility:edit",
    "action": {
        "type": "LDS",
        "params": {
            "type": "update",
            "title": "Updating Row State",
            "message": "Please confirm.",
            "params": {
                "fields": {
                    "Id": "{{{ROW.Id}}}",
                    "state__c":true
                }
            }
        }
    }
},
{
    "name": "delete", "label": "Remove Relation", "iconName": "utility:delete",
    "action": {
        "type": "LDS",
        "params": {
            "type": "delete",
            "title": "Deleting Record",
            "message": "Please confirm.",
            "params": "{{{ROW.Id}}}"
        }
    }
}
```

* **DML** to trigger a DML operation (`insert`, `update`, `delete`) via a dedicated Apex controller instead.
    * The DML operation is designed to possibly work on multiple records (see **mass actions** hereafter)
    therefore the “records” property should be configured with a list containing the single record to update.
```
{
    "name": "clone", "label": "Clone",
    "action": {
        "type": "DML",
        "params": {
            "title": "Clone Task",
            "bypassConfirm": true,
            "params": {
                "operation": "insert",
                "records": [{
                    "sobjectType": "Task",
                    "Subject": "{{{ROW.Name}}}",
                    "Status": "Open",
                    "WhatId": "{{{GEN.recordId}}}"
                }]
            }
        }
    }
},
{
    "name": "close", "label":"Close",
    "action": {
        "type": "DML",
        "params": {
            "title": "Close the Task",
            "message": "Please confirm the closing",
            "params":{
                "operation": "update",
                "records": [{
                    "Id": "{{{ROW.Id}}}",
                    "sobjectType": "Task",
                    "Status": "Done"
                }]
            }
        }
    }
},
{
    "name": "delete", "label": "Delete", 
    "action": {
        "type": "DML",
        "params": {
            "title": "Delete Task",
            "message": "Please confirm the deletion",
            "params": {
                "operation": "delete",
                "records": [{
                    "Id": "{{{ROW.Id}}}"
                }]
            }
        }
    }
}
```

### Custom **apex** Action Type

The **apex** action type enables to execute any operation implemented in a custom Apex class.
* This Apex class should implement the **sfpegAction_SVC** virtual class.
* The `params` are then provided as input to the configured Apex class.
* A confirmation popup is displayed, the header `title` and `message` of which may be customised by
    dedicated properties.
* The `bypassConfirm` property enables to bypass this step and directly execute the DML.

```
{
    "name": "apexAction", "label": "apexAction",
    "action": {
        "type": "apex",
        "params": {
            "title": "Apex Action Execution",
            "message": "Please confirm the execution of the Apex Action.",
            "name": "TST_UserAction_SVC",
            "params": {
                "Id": "{{{GEN.userId}}}"
            }
        }
    }
}
```

There is also a way to group various logic within a single Apex class,
in which case a “method” parameter can be specified after the class name.
```
{
    "name": "apexMethod", "label": "apexMethod",
    "action": {
        "type": "apex",
        "params": {
            "name": "TST_UserAction_SVC.TestMethod",
            "params": {
                "Id": "{{{GEN.userId}}}"
            }
        }
    }
}
```

_Note_: Whenever a error occurs, the error message provided is automatically displayed in an error toast popup. Raising a custom Apex Exception then enables to provide tailored error messages to the end-users.


### **Form** Action Types (**ldsForm** and **dmlForm**)

Two Action Types are available to execute record operation (create, update) via a popup form,
either via the Lightning Data Service (LDS, preferrable) or via direct database operation
(DML, for non LDS supported objects). 

![Standalone Action Bar Configuration!](/media/sfpegActionPopup.png)

* **ldsForm** opens a popup to create / edit a record leveraging the standard
[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)
base component (updates being then made via LDS)
    * `title` and `message` properties enable to set the corresponding text elements in the top part of the displayed form popup (default values being applied otherwise, see **sfpegActionDefault...** custom labels).
    * `size` (`standard`, `small`, `medium` or `large`) property enables to control the width of the popup (`standard` being default)
    * `height` (`auto`, `small`, `medium` or `large`) property enables to control the mininmal height of the popup, e.g. to ensure that picklist dropdown are properly accessible (`auto`being default)
    * `columns` property defines how many fields are displayed per line in the popup form,
    * `record` property enables to set contextual elements for the form,
        * `Id`, `RecordTypeId` and `ObjectApiName` sub-properties are a must to initialize the appropriate form
        * **edit** vs **create** mode is automatically derived from the presence of the `Id` sub-property
        * Other sub-properties may be used to set default values for the form fields (according to their API names)
    * `fields` property enables to list the set of fields to be displayed in the popup form and consists
    in a list of form field definitions
        * each form field definition needs a `name` containing the API name of the field to be displayed
        * display properties may be tuned to set the field as disabled, required or hidden.
        * Only the fields explicitely mentioned in this list are submitted by the form.
```
{
    "name": "editUser",
    "label": "Edit User",
    "action": {
        "type": "ldsForm",
        "params": {
            "title": "User Record Update",
            "message": "Please fill in missing elements",
            "columns": 2,
            "record": {
                "Id": "{{{GEN.userId}}}",
                "ObjectApiName": "User",
                "Title": "Test",
                "Sphere__c": "Compte Principal",
                "Department": "TEST"
            },
            "fields": [
                { "name": "LastName", "disabled": true },
                { "name": "Title", "required": true },
                { "name": "Sphere__c" },
                { "name": "Department", "hidden": true }
            ]
        }
    }
}
```

* **dmlForm** implements the same behaviour but enables to execute the update via a DML call
(useful for object types not supported by LDS, such as Task & Event)
    * In such a case, the popup form works with the `formRecord` and `formFields` instead of `record` and
    `fields` and the LDS standard submission is replaced by a DML on the `record`.
    * All output form field values are applied on the `record` before the DML (with the same API name unless
    a `fieldMapping` JSON object property is provided (`{ "formFieldName": "recordFieldName",....}`).
    * In the example below, a *TST_TaskProxy__c* custom object has been created with a single `Reason__c` field leveraging the same API name & picklist global value set as the `Reason__c` field configured on the Task object (as the **Task** object was not supported by the LDS).
```
{
    "name": "close", "label": "Close",
    "action": {
        "type": "dmlForm",
        "params": {
            "title": "Closing the Task",
            "message": "Please select a task close reason.",
            "record": {
                "sobjectType": "Task",
                "Id": "{{{ROW.Id}}}",
                "Status": "Cancelled"
            },
            "formRecord": { "ObjectApiName": "TST_TaskProxy__c" },
            "formFields": [{ "name": "Reason__c", "required": true }]
        }
    }
}
```

* **upload** : enables to upload one or multiple files as related to a record (useful to upload files
for records displayed in a list or display an upload action on a custom file list), leveraging the standard
**[lightning-file-upload](https://developer.salesforce.com/docs/component-library/bundle/lightning-file-upload/documentation)** component in a popup.
Various properties are available to customise the experience:
    * `title`, main `message` and `size` (`standard`, `small`, `medium` or `large`) of the popup
    * `label` displayed in the upload component (above the buttons)
    * `recordId` providing the Salesforce ID of the record to which the uploaded files should be related
    * `formats` of the files allowed (as a JSON array of file extensions, e.g. `['.pdf','.gif']`)
    * `allowMultiple` to be set to `true` to be able to load more than one file (`false` by default).
```
{
    "name": "file",
    "label": "File",
    "iconName": "utility:upload",
    "action": {
        "type": "upload",
        "params": {
            "title": "Upload PDF files",
            "label": "Multiple files possible",
            "recordId": "{{{GEN.recordId}}}",
            "formats": [".pdf"],
            "allowMultiple": true
        }
    }
}
```

* **apexForm** : 
    * Same behaviour as the **ldsForm** action but executing an Apex logic instead of a LDS creation / update
    from the form displayed in the popup (e.g. to perform callouts to external systems).
    * it relies on a custom object creation form to collect user input, leveraging the same properties
    as **ldsForm** and on an Apex call leveraging the same parameters as the **apex** action.
    * In some cases, it may be necessary to create a custom _proxy_ object just to support the form
    even if no data is stored in the Org.
    * In the Apex class implementing the **sfpegJsonAction_SVC** interface (see  **apex** action),
    the input object then has 2 properties: `input` containing the record data provided by the LDS form
    and `params`containing the `params` configured for the action.
```
{
    "name": "apexFormAction","label": "Action XXX",
    "action": {
        "type": "apexForm",
        "params": {
            "title": "Executing Action XXX",
            "message": "Please fill in the following fields.",
            "columns": 2,
            "formRecord": {
                "ObjectApiName": "ProxyObject__c",
                "Name":"{{{ROW.Name}}}",
                "Status__c": "{{{ROW.Status__c}}}"
            },
            "formFields": [
                {"name": "Name","required": true},
                {"name": "Status__c","required": true}
            ],
            "name": "sfpegJsonAction_SVC",
            "params": {
                "operation": "update",
                "recordId": "{{{GEN.recordId}}}",
                "recordName": {{{RCD.Name}}}
            }
        }
    }
}
```

_Note_: Whenever a error occurs, the error message provided is automatically displayed in an error toast popup.


### **Mass** Action Types (**massForm**, **massDML** and **massApex**)

Two Action Types are available to execute operations (`create`, `update`, `delete`) on a
selection of records, either directly or via a first popup form.

They are not available for standalone **sfpegActionBarCmp** usage but only when a parent
Lightning component, such as **sfpegListCmp**, provides a list of (selected) records.

* **massForm** opens an edit form in a popup leveraging the standard
[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)
base component and apply the corresponding changes via a mass DML update on the list of record
provided by a parent component.
    * e.g. the **sfpegListCmp** provides the set of selected records as input (when selection is enabled on this component)
    * The configuration is similar to the **ldsForm** action, the main difference being that the output of the LDS form displayed is cloned and applied to all records selected.
    * The `removeRT` flag enables to avoid applying to the selected records the Record Type defined in the “record” property (which may be useful to control picklist values in the displayed form)
```
{
    "name": "closeForm", "label": "Close", "iconName": "utility:close",
    "action": {
        "type": "massForm",
        "params": {
            "title": "Close the Actions",
            "message": "Please fill in the following information",
            "removeRT": true,
            "columns": 2,
            "record": {
                "ObjectApiName": "TST_Action__c",
                "RecordTypeId": "RT.TST_Action__c.RT1",
                "Done__c": true
            },
            "fields": [
                { "name": "Reason__c", "required": true},
                { "name": "Done__c", "disabled": true }
            ],
            "next": {
                "type": "done",
                "params": {
                    "type": "refresh"
                }
            }
        }
    }
}
```

* **massDML** to execute a predefined mass operation via DML (`insert`, `update` or `delete`)
on the selected records
    * A confirmation popup is displayed, the header `title` and `message` of which may be customised by
    dedicated properties.
    * The `bypassConfirm` property enables to bypass this step and directly execute the DML.
    
    * For the `update` operation, the `record` property must be defined with the set of field values to
    be applied on all the selected records. The generated DML clones this JSON object and sets
    the `Id` property from the value available on each selected record.
    * For the `insert` operation, the `record` property must be defined with the set of field values to
    be initialized on all the selected records. The generated DML clones of this JSON object with
    the `lookup` property set from the `Id` value available on each selected record.
```
{
    "name": "newTask", "label": "Add Task", "iconName": "utility:add",
    "action": {
        "type": "massDML",
        "params": {
            "operation": "insert",
            "title": "Add new Tasks",
            "message": "Please confirm the addition of callback tasks for the selected records",
            "lookup": "WhatId",
            "record": {
                "Subject": "Customer callback",
                "sobjectType":"Task",
                "Status": "Open",
                "ActivityDate": "{{{GEN.nextWeek}}}"
            },
            "next": {
                "type": "toast",
                "params": {
                    "title": "Operation Success",
                    "message": "Your new tasks were properly created.",
                    "variant": "success"
                }
            }
        }
    }
},
{
    "name": "close", "label": "Close", "iconName": "utility:close",
    "action": {
        "type": "massDML",
        "params": {
            "operation": "update",
            "title": "Close the Records",
            "message": "Please confirm the closing of the selected records",
            "record": {
                "Status": "Completed"
            },
            "next": {"type": "done","params": {"type": "refresh"}}
        }
    }
},
{
    "name": "delete", "label": "Delete", "iconName": "utility:delete",
    "action": {
        "type": "massDML",
        "params": {
            "operation": "delete",
            "title": "Delete the records",
            "message": "Please confirm the deletion of the selected records",
            "next": {"type": "done","params": {"type": "refresh"}}
        }
    }
}
```

* **massApex** : to execute a predefined mass operation via Apex based on the selected records
    * it behaves exactly as the the **apex** unitary action (see above)
    * the selected records are added automatically as `_selection` property in the input
    sent to the Apex class. 

```
{
    "name": "register","label": "Register", "iconName": "utility:add",
    "action": {
        "type": "massApex",
        "params": {
            "name": "sfpegMassAction_SVC",
            "title": "Course Registration",
            "message": "Please confirm the registration to the selected Courses",
            "params": {
                "CurrentRcd": "{{{GEN.recordId}}}"
            },
            "next": {"type": "done","params": {"type": "refresh"}}
        }
    }
}
```

_Note_: Whenever a error occurs, the error message provided is automatically displayed in an error toast popup.


### File Download Type (**download**)

The **download** action type enables to easily trigger a download of one or many files given their `ContentDocumentId` or `ContentVersionId`
leveraging the `[shepherd](https://salesforce.stackexchange.com/questions/203030/content-document-download-url-params)` URLs.

It works in unitary mode for a `ContentDocumentId` or `ContentVersionId`, as presented in the configuration below.
```
{
    "name": "downloadDocument",
    "action": {
        "type": "download",
        "params": {
            "documentId": "{{{ROW.ContentDocumentId}}}"
        }
    }
},
{
    "name": "downloadVersion",
    "action": {
        "type": "download",
        "params": {
            "versionId": "{{{ROW.ContentDocument.LatestPublishedVersionId}}}"
        }
    }
}
```

It may also be used as a mass action on a record selection of a **sfpegListCmp** component,
in which case only ContentVersion IDs are supported). The configuration then reslies on the `selectedVersions` property which should give the API Name of the field providing the
**ContentVersion** Ids on the selected rows.
```
{
    "title": "Download selection",
    "iconName": "utility:download",
    "name": "downloadSelection",
    "action": {
        "type": "download",
        "params": {
            "selectedVersions": "ContentDocument.LatestPublishedVersionId"
        }
    }
}
```


### Record Data LDS **Reload** Type (**reload**)

The **reload** action type enables to trigger a LDS reload of a single record
* This is typically useful to refresh the LDS cache data of a record modified via Apex or DML
(via the `next` property) or to the content of a list after an insertion.
* It relies on the standard [getRecordNotifyChange](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/reference_get_record_notify) method.

```
{
  "name": "Assign2me", "label": "Assign2me",
    "action": {
      "type": "DML",
      "params": {
        "title": "Please confirm update",
        "message": "Assigning current record to current User",
        "params": {
          "operation": "update",
          "records": [{
            "ObjectApiName": "{{{GEN.objectApiName}}}",
            "Id": "{{{GEN.recordId}}}",
            "OwnerId": "{{{GEN.userId}}}"
          }]
       },
       "next": {
         "type":"reload",
         "params":{"recordId":"{{{GEN.recordId}}}"}
       }
    }
  }
}
```


### Parent Action Trigger Type (**done**) 

The **done** action type enables to trigger an action on a parent component.
* This is typically used to trigger a **refresh** on the parent component once another operation has
been executed (e.g. refresh of the **[sfpegListCmp](/help.sfpegListCmp.md)** displayed records
after a record creation/update/deletion)
* Such a behaviour is usually specified within the `next` property of an action.
* In the example below, the **refresh** action type is actually provided by the
**[sfpegListCmp](/help.sfpegListCmp.md)** parent component containing the action bar.
```
    ...
    "next": {
        "type": "done",
        "params": {
            "type": "refresh"
        }
    }
    ...
```


### **toast** Action Type

The **toast** action type enables to display a simple toast message, e.g. once another operation is complete
(e.g. as part of a `next` action property).
    * It relies on the standard [platform-show-toast-event](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-show-toast-event/documentation) event.
```
    ...
    "next": {
        "type": "toast",
        "params": {
            "title": "Operation Success",
            "message": "Your new record was properly created.",
            "variant": "success"
        }
    }
    ...
```


### **Notification** Action Types (**utility**, **action** and **notify**)

Three Action Types are available to relay actions to other components leveraging the the
[Lightning Message Service](https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation) 
in default scope. 

* **utility** enables to notify the **sfpegActionHandlerCmp** utility bar component and let it execute an operation.
    * This is typically useful when navigating to a record when wishing to enforce the console tab configuration instead of the default console behaviour (opens target in a subtab of current main tab)
    * It also enables to trigger some specific console related actions implemented only in the **sfpegActionUtilityCmp** Aura component (embedding a **sfpegActionHandlerCmp** component instance).
    * It relies on the **sfpegAction** message channel

```
{
    "name": "reportXXX",
    "iconName":"utility:metrics", "label":"{{{LBL.TST_ReportXXX}}}",
    "action": {
        "type": "utility",
        "params": {
            "type":"navigation",
            "params": {
                "type": "standard__recordPage",
                "attributes": {
                    "recordId":"{{{RPT.ReportXXX}}}",
                    "objectApiName":"Report",
                    "actionName":"view"
                }
            }
        }
    }
}
```

* **action** enables to notify any external LWC components in the same tab with any parameters required,
enabling to trigger any custom browser side LWC logic via the **sfActionBarCmp** component.
    * this may be helpful to e.g. display a complex custom form popup.
    * it relies on the **sfpegCustomAction** message channel, on which the custom LWC component should register.

* **notify** enables to notify **sfpegActionBarCmp** component instances to execute an action.
    * This is typically used to ask other LWC components embedding the **sfpegActionBarCmp** component
    to refresh themselves once an action has been executed.
    * It relies on the **sfpegCustomNotification** message channel and leverages the `Notification Channels`
    attribute of the metadata record.
    * the target components need to set the `Notification Channel` fields of the **sfpegAction** records
    they use (for the **sfpegActionBarCmp** components they embed)
    * e.g. the following example triggers a **refresh** action on all **[sfpegListCmp](/help/sfpegListCmp.md)**
    instances having their **sfpegAction** header actions configuration record set to listen to the `RefreshList` channel. 
```
{
  "label": "Refresh", "name": "refresh",
  "action": {
    "type": "notify",
    "channel": "RefreshList",
    "params": {
      "type": "done",
      "params": {
        "type": "refresh"
      }
    }
  }
}
```

The `Notification Channels` attribute of a **sfpegAction** custom metadata record defines which channels
the **sfpegActionBarCmp** components using it should be listening to. 
* It should be be set only if **notify** action types are used and have to be handled by the corresponding **sfpegActionCmp** component instances.
* If set, it filters the actions actually executed by the **sfpegActionBarCmp** component instances, these instances then registering to these events.
* It is a JSON list of strings containing the labels of the channels used within **sfpegCustomNotification** message channel events.
* e.g. for an action header bar, the following text should be provided to register to the custom _RefreshList_ channel

![Action Notification Registration!](/media/sfpegActionNotifConfig.png)

Please refer to **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** to see an
example combining a flow popup triggering via a `utility` action type followed by a `notify` one
to refresh the originating **[sfpegListCmp](/help/sfpegListCmp.md)** component.


### **clipboard** Action Type

The **clipboard** action type enables to copy a preconfigured string to the user clipboard, enabling
to paste it in other applications (or emails).

The `params` property should be a standard text string providing the content to be written in the user
clipboard.

Typical use cases are to copy a record name or a link to a given record to be pasted in an email or
message.
```
[
{
    "label": "Clip Name",
    "name": "ClipName",
    "action": {
        "type": "clipboard",
        "params": "{{{RCD.Name}}}"
    }
},
{
    "label": "Clip URL",
    "name": "ClipUrl",
    "action": {
        "type": "clipboard",
        "params": "{{{GEN.baseUrl}}}/lightning/r/{{{GEN.objectApiName}}}/{{{GEN.recordId}}}/view"
    }
}
]
```


### Action Types from Other Components (Flow Popup, Aura Application Event, List Refresh, List Filter...)

Other action types (or triggering contexts) are available from other components via various triggering mechanisms:
* **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** actions may be triggered within a **utility bar** in native LWC
* **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** actions may be triggered within a **utility bar** in Aura
* **[sfpegListCmp](/help/sfpegListCmp.md)** actions may be triggered within a **done** action type



## Configuration Examples

### Flow Action Launch (leveraging the PEG_FlowEmbed_CMP addressable component, see FLW package)

![Flow Tab Open Action!](/media/sfpegActionFlowLaunch.png)

In this example, a **sfpegListCmp** component is used to display a set of promoted ongoing Tasks
related to the current record and directly, from a drop-down menu,
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


### Custom Action Notification Implementation

In order to send a custom `action` notification to an external custom LWC component via a dedicated
`TEST_CHANNEL` channel, the following action configuration may be used.
```
{
    "label": "Remote Action",
    "name": "RemoteAction",
    "action": {
        "type": "action",
        "channel": "TEST_CHANNEL",
        "params": {
            "param1": "Hello",
            "param2": "World"
        }
    }
}
```

In the custom LWC component, the following code should be used to subscribe to the
action notifications and handle messages sent on the `TEST_CHANNEL` channel.
* In the javascripts imports
```
// To notify the utility bar handler if required
import {
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import sfpegCustomAction from '@salesforce/messageChannel/sfpegCustomAction__c';
```
* In the class definition
```
    // Notification handling
    subscription = null;
    @wire(MessageContext)
    messageContext;

    // Component Initialization
    connectedCallback() {
        this.subscribeToMessageChannel();
    }
    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    // Handler for message received by component
    handleMessage(message) {
        if ((message.channel) && (message.channel == "TEST_CHANNEL")) {
            console.log('handleMessage: processing TEST_CHANNEL message');
            ...
        }
        else {
            console.log('handleMessage: ignoring message on channel',message.channel);
        }
    }

    // Notification subscription 
    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleMessage(message));
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
```

Please refer to the **[Lightning Message Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel)** for more technical details.

It is then also possible to propagate the received event to an Aura parent component via a
simple custom event dispatch, as between the **sfpegActionHandlerCmp** (LWC) and
the **sfpegActiuonUtilityCmp** (Aura) utility components.
* in the child LWC even handling
```
let doneEvent = new CustomEvent('done', {
    "detail": message.action});
this.dispatchEvent(doneEvent);
```
* in the parent HTML
```
<c:chilCmp
    aura:id="messageHandler"
    ondone="{!c.handleDone}">
</c:chilCmp>
```

Similarly, it is also possible to generate back a custom `notify` notification back to 
the different **sfpegActionBarCmp** components having registered to the a `TEST_FEEDBACK` channel.
* In the javascripts imports, include also the `publish` action and the 
`sfpegCustomNotification` message channel
```
// To notify the utility bar handler if required
import {
    subscribe,
    unsubscribe,
    publish,
    MessageContext
} from 'lightning/messageService';
import sfpegCustomAction from '@salesforce/messageChannel/sfpegCustomAction__c';
import sfpegCustomNotification from '@salesforce/messageChannel/sfpegCustomNotification__c';
```
* In the class definition, simply publish a `sfpegCustomNotification` message
```
let actionNotif = {
    'channel': "TEST_FEEDBACK",
    'action': {
        "type":"toast",
        "params":{"title":"Notified Back!"}
    }
};
publish(this.messageContext, sfpegCustomNotification, actionNotif);
```


### Dynamic Rendering for ***Next*** Action

Leveraging the dynamic action activation feature, it is possible to implement
a `next` button to move ahead in a process controlled by a picklist field.

By activating the global `Do Evaluation?` parameter and carefully setting the `hidden`
`disabled` properties of each individual action, it is possible to trigger
a picklist field value change via LDS depending on the process stage and let it 
become active only when certain conditions are met.
* Before executing the stage actions, the ***Next*** button remains inactive

![Dynamic Next Buttons (inactive)](/media/sfpegActionBarNext2.png)

* After executing them, it becomes active and enables a LDS update on the current record
towards the next stage value

![Dynamic Next Buttons (active)](/media/sfpegActionBarNext.png)


The button `label` remains the same at all stages but its name and action change,
only one of each being displayed at each stage. A possible configuration is:
```
[
    {
        "name": "go2selection",
        "label": "Suivant",
        "iconName": "utility:chevronright",
        "variant":"brand",
        "hidden": "'{{{RCD.Stage__c}}}' != 'CHANNEL'",
        "disabled": "'{{{RCD.SelectedChannels__c}}}' == ''",
        "action": {
            "type": "LDS",
            "params": {
                "type": "update",
                "bypassConfirm": true,
                "params": {
                    "fields": {
                        "Id": "{{{GEN.recordId}}}",
                        "Stage__c": "TARGET"
                    }
                }
            }
        }
    },
    {
        "name": "go2personnalisation",
        "label": "Suivant",
        "iconName": "utility:chevronright",
        "variant":"brand",
        "hidden": "'{{{RCD.Stage__c}}}' != 'TARGET'",
        "disabled": "{{{RCD.TargetNumber__c}}} == 0",
        "action": {
            "type": "LDS",
            "params": {
                "type": "update",
                "bypassConfirm": true,
                "params": {
                    "fields": {
                        "Id": "{{{GEN.recordId}}}",
                        "Stage__c": "CUSTOMIZE"
                    }
                }
            }
        }
    },
    {
        "name": "go2synthèse",
        "label": "Suivant",
        "iconName": "utility:chevronright",
        "variant":"brand",
        "hidden": "'{{{RCD.Stage__c}}}' != 'CUSTOMIZE'",
        "action": {
            "type": "LDS",
            "params": {
                "type": "update",
                "bypassConfirm": true,
                "params": {
                    "fields": {
                        "Id": "{{{GEN.recordId}}}",
                        "Stage__c": "SEND"
                    }
                }
            }
        }
    }
]
```

_Notes_:
* The same may be done for a ***Previous*** action (combined in the same **sfpegCard__mdt** record).
* These buttons may be combined with dynamic ***process validation*** messages
(see **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)**) to notify users about missing information.


### Reload and Refresh Action Chaining

As mentioned in the Configuration section, it is possible to leverage `next` properties to 
execute a chain of actions. In the following example, a `delete` DML mass action is first 
triggered on a record selection provided by the parent component (e.g. **[sfpegListCmp](/help/sfpegListCmp.md)**) 
and then 2 successive actions happen:
* LDS reload of the page record (e.g. to refresh rollup sumary fields)
* refresh of the parent component (e.g. to reload a custom related list)

```
    {
        "label": "Supprimer",
        "iconName": "utility:delete",
        "name": "delete",
        "action": {
            "type": "massDML",
            "title": "Suppression des membres de campagnes",
            "message": "Confirmer la suppression",
            "params": {
                "operation": "delete",
                "next": {
                    "type":"reload",
                    "params":{"recordId":"{{{GEN.recordId}}}"},
                    "next": {
                        "type": "done",
                        "params": {
                            "type": "refresh"
                        }
                    }
                }
            }
        }
    }
```


### ActionBar Contextualisation

It is possible to leverage the `parentContext` parameter of the component to implement custom
contextualisation of the action list. All data provided in this property get then automatically 
available as `CTX` merge tokens in the action configuration metadata.

For example, the following `toast` action leverages the `CTX.label` token.
```
{
    "label":"Context Data",
    "name":"ContextToast",
    "action":{
        "type": "toast",
        "params": {
            "title": "Test Message",
            "message": "Selected context is {{{CTX.label}}}."
        }
    }
}
```

Data for this token has to be provided by theh parent component (here and example of Aura embedding).
```
<c:sfpegActionBarCmp
    configName="{#v.config}"
    userId="{!v.userId}"
    recordId="{!v.recordId}"
    objectApiName="{!v.sObjectName}"
    ondone="{!c.handleAction}"
    parentContext="{!v.context}" />
```

Data must be a simple JSON record containing the field names included as the **CTX** tokens in the configuration.
```
{
    "label":  "TEST LABEL"
}
```

_Note_: The `handleAction` controller method enables to handle custom actions configured as `done` ones.


### Hidden Mode Usage

Multiple components (e.g. **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** or **[sfpegListCmp](/help/sfpegListCmp.md)**)
use the **sfpegActionBarCmp** in hidden mode to execute the action logic, while displaying buttons or menus
in a specific way (in messages, data-table rows, tiles).

For these components, a specific `isHidden` boolean parameter is available at the component interface to 
skip HTML rendering logic of the **sfpegActionBarCmp** component and optimise performances.
They may also apply the `slds-hide` SLDS class to ensure no HTML overhead is applied.
```
<c-sfpeg-action-bar-cmp
    bar-class= "slds-hide"
    config-name={configDetails.rowActions}
    object-api-name={objectApiName}
    record-id={recordId}
    user-id={userId}
    is-hidden="true"
    is-debug={isDebugFine}
    ondone={handleActionDone}
    data-my-id="rowActions">
</c-sfpeg-action-bar-cmp>
```

They can later invoke action execution on the instantiated **sfpegActionBarCmp** component by:
* finding the component
```
let rowActionBar = this.template.querySelector('c-sfpeg-action-bar-cmp[data-my-id=rowActions]');
```
* invoking one of the available methods:
    * `executeAction` when the parent component has already all the details of the action
    tpo execute (e.g. when handling a `next` action after a `done` one)
    * `executeBarAction` when the parent wishes to trigger one of the actions defined
    in the action bar configuration (by the `name` defined in the metadata configuration)


### Special Feature for Lookup Filter Handling

In record creation forms, there is currently a limitation in the standard **lightning-input-field**
components concerning the lookup filters (they are ignored). This is especially applicable to 
**ldsForm**, **DmlForm** and **massForm** actions.

As a workaround, a specific `dataSource` property is proposed when configuring lookup fields for the forms
in order to limit the set of records to choose from.

In such a case, the standard lookup input is replaced by a combobox, the set of values of which is
fetched through a standard **[sfpegListCmp](/help/sfpegListCmp.md)** component.

Hereafter, the `dataSource`property is specified for the `ProxyOwner__c` input field
(also a work-around to be able to change the OwnerId of the record in Apex trigger).
```
{
    "name": "changeOwner", "label": "Change Owner",
    "action": {
        "type": "massForm",
        "params": {
            "title": "Change the Owner",
            "message": "Please fill in the following information",
            "removeRT": true,
            "columns": 1,
            "record": {
                "ObjectApiName": "{{{GEN.objectApiName}}}"
            },
            "fields": [
                { "name": "ProxyOwner__c", "dataSource": "AllowedOwnersList" }
            ]
        },
        "next": {
            "type": "done",
            "params": {
                "type": "refresh"
            }
        }
    }
}
```

The referenced **sfpegList** metadata record `AllowedOwnersList` needs simply to return 
the `Id` and the `Name` of the **User** records to choose from.
* Query Input: `{"AGENCY":"{{{RCD.Branch__c}}}"}`
* Query Template:  `select Name, Id from User where (Branch__c like '%{{{AGENCY}}}%')`
* Display Configuration: `{ "keyField":"Id", "columns": [{"label":"Name", "fieldName": "Name"}]}`

**Beware** to keep the list short to fit into a small combobox!

By default, the picklist relies on the `Id` and `Name` of each record to provide the value and label
of each picklist option. If the targeted object has another naming field (e.g. `Subject`or `Title`),
it is still possible to override this default behaviour by setting an aditional `dataLabel` property
with the name of the field to be used as label, e.g.
```
{ "name": "MyLookup__c", "dataSource": "AllowedRecords",  "dataLabel": "Title" }
```


## Technical Details

The **sfpegActionBarCmp** heavily relies on the following components:
* the standard [lightning-navigation](https://developer.salesforce.com/docs/component-library/bundle/lightning-navigation/documentation) service  for ***navigation*** actions
* the standard [platform-show-toast-event](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-show-toast-event/documentation) for ***toast*** actions or error notifications
* the standard **Lightning Data Service** (see [uiRecordApi](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_record)) for LDS operations
* the **sfpegAction_CTL** Apex controller for Apex actions and DML executions
* the **sfpegPopupDsp** component for confirmation, record form or spinner popup display
* the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component for action configuration contextualisation

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.