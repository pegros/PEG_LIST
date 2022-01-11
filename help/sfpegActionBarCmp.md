---
# sfpegActionBarCmp Component
---

## Introduction

The **sfpegActionBarCmp** component displays a button/menu bar component enabling to
trigger a wide variety of actions, integrated within the various components of
the **[SF PEG LIST](https://github.com/pegros/PEG_LIST)** package but also available
for standalone use in Lightning pages.

The following snapshot displays a standalone button bar example combining actions
and menu items. 

![Action bar!](/media/sfpegActionBar.png) 

It offers a wide range of actions, from basic navigation requests (e.g. to open a
related record) to more complex ones (such as mass actions with form popup user interaction).

The underlying **sfpegAction__mdt** custom metadata is also used in other
**[SF PEG LIST](https://github.com/pegros/PEG_LIST)** package components to
define row level actions, in which case its display properties become irrelevant.

---

## Component Configuration

### Global Layout

The action bar basically consists in a single list of buttons and menus (within a
[lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation) 
container).
* A button contains a single action configuration
* A menu contains a drop-down list of multiple action configuration items. 

![Standlone Action Bar Example!](/media/sfpegActionMenu.png)

Display of a **sfpegActionBarCmp** component within a page (with 1 button followed by 2 menus).

### App Builder Configuration

In the App Builder, the configuration of the **sfpegActionBarCmp** component basically
consists in selecting one of the available **sfpegAction__mdt** custom metadata record
containing the details of the buttons and menus to display.

![Standalone Action Bar Configuration!](/media/sfpegActionConfiguration.png)

Additional properties enable to control the CSS of the wrapping div and activate debug mode.
Via the CSS, it is possible to control the background if the component and the position of the
[lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation).
They are set to `slds-theme_shade slds-grid slds-grid_align-end` by default but may
easily be overriden.

Only **sfpegAction__mdt** custom metadata record applicable to the page _scope_ may be selected
in the dropdown displayed for the _Action configuration_ property (see configuration principles in
[SF PEG LIST](https://github.com/pegros/PEG_LIST) introduction).


### Metadata Configuration

The **sfpegAction__mdt** custom metadata provides most of the configuration of the **sfpegActionBarCmp**
components (buttons & menus in an action bar, with underlying actions triggered). Its most important property
is _Actions_ which provides all the required information to properly display and execute a set of actions.

Context merge is systematically applied upon load/refresh (see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)**
component) to adapt the set of actions to the display environment.

![Standalone Action Bar Metadata!](/media/sfpegActionConfigMeta.png)


Hereafter is a typical configuration for a standalone mix of buttons and menus,
containing first a menu with 3 options leading to a report, a dashboard and a folder,
then 2 buttons to create Accounts via a Flow (launched within an addressable Aura
Lightning component) or via a standard creation page.

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
                    "componentName": "c__PEG_FlowEmbed_CMP"
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

For buttons, at least _iconName_ or _label_ should be specified, whereas for menu items,
_label_ is mandatory and _iconName_ optional.

Multiple other display properties are available:
* _variant_ to change the display style (see [lightning-button](https://developer.salesforce.com/docs/component-library/bundle/lightning-button/specification) for possible values).
* _iconPosition_ to set the icon on the left or right of the label
* _iconSize_ to act on the button icon size (see [lightning-button-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-icon/specification) or [button-menu](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-menu/specification) for info)

It is also possible to dynamically activate/disable buttons and menu items via the _disabled_ property, e.g. leveraging current user’s custom permissions via custom formula fields on the _User_ object.
```
[
    {
        "name":"warn", "label":"Warn (if not permission)",
        "disabled":{{{NPERM.TST_Perm}}},
        "action":{
            "type":"toast",
            "params":{
                "title":"Beware {{{USR.Name}}}!",
                "message":"This is a warning message for {{{RCD.Name}}}.",
                "variant":"warning"
            }
        }
    },
    {
        "label":"Menu",
        "align":"auto",
        "items":[
            {
                "name":"toast", "label":"Info (if permission)",
                "disabled":{{{PERM.TST_Perm}}},
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
                "name":"toast", "label":"Error (always)",
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

At last, there is a main _action_ property for each button or menu item, which enabless to specify the actual action to be executed when clicking/selecting the item, the action being chosen among a set of possible action types described hereafter.

---

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

Both types are shortcuts for the **navigation** one.

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


### **openURL** Action Type

The **openURL** action type enables to open a page URL in a different browser tab (via _window.open()_ javascript primitive instead of the Lightning navigation service).
    * _url_ is the main property to define with the target URL to be used
    * some URL rework directives are available but still pending actual large scale use cases to be officially supported (and documented)
```
{
    "name":"search",
    "label":"{{{LBL.TST_Search}}}",
    "action":{
        "type":"openURL",
        "params":{
            "url":"https://www.google.com/search?q={{{[RCD.Name](https://rcd.name/)}}}"
        }
    }
}
```


### **showDetails** Action Type

The **showDetails** action type enables to open a read-only popup presenting details about a record.<br/>
![ShowDetails Action Popup Example](/media/sfpegActionBarShowDetails.png) 

It is a solution to easily replace the record summary on hover for standard lookup fields in standard list components.

The action should be configured as follows:
* _title_ and _message_ for the popup header
* _columns_ to indicate how many fields should be displayed per row
* _fields_ to list the fields to display (with their _value_, _type_ and _label_)
```
[
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
_Note_: this example is used as a row action in a **[sfpegListCmp](/help/sfpegListCmp.md)** component
to present information fetched by the query but not displayed in the layout.


### **LDS** and **DML** Action Types 

Two Action Types are available to execute direct record operation (create, update, delete), either via the Ligthning Data Service (LDS, preferrable) or via direct database operaion (DML, for non LDS supported objects). 

* **LDS** to trigger a single record direct create/update/delete via the Lightning Data Service
    * “*title*” and “*message*“ properties enable to change the corresponding text elements in the top part of the displayed popup.
    * “*params*” property should define the “*type*” of the LDS action to execute (“*create*”, “*update*” or “*delete*”) and provide the parameters to be provided to the corresponding [uiRecordApi](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_record) primitive, i.e. create, update or delete.
    * Hereafter are 3 possible examples.
```
{
    "name": "newRelated", "label": "Add new Item", "iconName": "utility:add",
    "action": {
        "type": "LDS",
        "params": {
            "type": "create",
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

* **DML** to trigger a DML operation (insert, update, delete) via a dedicated Apex controller instead.
    * The DML operation is designed to possibly work on multiple records (see mass actions hereafter)
    therefore the “records” property should be configured with a list containing the single record to update.
```
{
    "name": "clone", "label": "Clone",
    "action": {
        "type": "DML",
        "params": {
            "title": "Clone Task",
            "message": "Adding a new Task",
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
                    "ObjectApiName": "Task",
                    "Status": "Done"
                }]
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

### **Form** Action Types (**ldsForm** and **dmlForm**)

Two Action Types are available to execute record operation (create, update) via a popup form,
either via the Lightning Data Service (LDS, preferrable) or via direct database operation
(DML, for non LDS supported objects). 

![Standalone Action Bar Configuration!](/media/sfpegActionPopup.png)

* **ldsForm** opens a popup to create / edit a record leveraging the standard
[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)
base component (updates being then made via LDS)
    * _title_ and _message_ properties enable to change the corresponding text elements in the top part of the
    displayed popup.
    * _columns_ property defines how many fields are displayed per line in the popup form,
    * _record_ property enables to set contextual elements for the form,
        * _Id_, _RecordTypeId_ and _ObjectApiName_ sub-properties are a must to initialize the appropriate form
        * _edit_ vs _create_ mode is automatically derived from the presence of the “Id” sub-property
        * Other sub-properties may be used to set default values for the form fields (according to their API names)
    * _fields_ property enables to list the set of fields to be displayed in the popup form and consists in a
    list of form field definitions
        * each form field definition needs a “name” containing the API name of the field to be displayed
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
    * In such a case, the popup form works with the “formRecord” and “formFields” instead of _record_ and
    _fields_ and the LDS standard submission is replaced by a DML on the _record_.
    * All output form field values are applied on the “record” before the DML (with the same API name unless
    a _fieldMapping_ JSON object property is provided { "formFieldName": "recordFieldName",....}).
    * In the example below, a _TST_TaskProxy__c_ custom object has been created with a single _Reason__c_ field leveraging the same API name & picklist global value set as the _Reason__c_ field configured on the Task object.
```
{
    "name": "close",
    "label": "Close",
    "action": {
        "type": "dmlForm",
        "params": {
            "title": "Closing the Task",
            "message": "Please select a task close reason.",
            "record": {
                "ObjectApiName": "Task",
                "Id": "{{{ROW.Id}}}",
                "Status": "Cancelled"
            },
            "formRecord": { "ObjectApiName": "TST_TaskProxy__c" },
            "formFields": [{ "name": "Reason__c", "required": true }]
        }
    }
}
```

* **apexForm** : PLANNED
    * Same behaviour as the ldsForm but with the ability to fetch/update data via Apex calls
    instead of LDS (e.g. to perform callouts to external systems).


### **Mass** Action Types (**massForm** and **massDML**)

Two Action Types are available to execute operations (create, update, delete) on a selection of records, either
directly or via a first popup form.

They are not available for standalone **sfpegActionBarCmp** usage but only when a parent Lightning component, such as
**sfpegListCmp** provides a list of (selected) records.

* **massForm** opens an edit form in a popup leveraging the standard
[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)
base component and apply the corresponding changes via a mass DML update on the list of record
provided by a parent component.
    * e.g. the **sfpegListCmp** provides the set of selected records as input (when selection is enabled on this component)
    * The configuration is similar to the **ldsForm** action, the main difference being that the output of the LDS form displayed is cloned and applied to all records selected.
    * The _removeRT_ flag enables to avoid applying to the selected records the Record Type defined in the “record” property (which may be useful to control picklist values in the displayed form)
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

* **massDML** to execute a predefined mass operation via DML (update or delete) on the selected records
    * A confirmation popup is displayed, the header _title_ and _message_ of which may be customised by
    dedicated properties.
    * The _bypassConfirm_ property enables to bypass this ste and directly execute the DML.
    * For the _update_ operation, the _record_ property must be defined with the set of field values to
    be applied on all the selected records. The generated DML contains clones of this JSON object with
    the _Id_ property set from the value available on each selected record.
```
{
    "name": "close", "label": "Close", "iconName": "utility:close",
    "action": {
        "type": "massDML",
        "params": {
            "operation": "update",
            "title": "Close the Tasks",
            "message": "Please confirm the closing of the selected tasks",
            "record": {
                "Status": "Completed"
            },
            "next": {
                "type": "done",
                "params": {
                    "type": "refresh"
                }
            }
        }
    }
},
{
    "name": "delete", "label": "Delete", "iconName": "utility:delete",
    "action": {
        "type": "massDML",
        "params": {
            "operation": "delete",
            "title": "Delete the Tasks",
            "message": "Please confirm the deletion of the selected Tasks",
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

* **massApex** : PLANNED
    * Same behaviour as the **massDML** but with the ability to call an Apex logic instead of simple DMLs.


### Record Data LDS **Reload** Type (**reload**)

The **reload** action type enables to trigger a LDS reload of a single record
* This is typically useful to refresh the LDS cache data of a record modified via Apex or DML (via the “next” property).
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
* This is typically used to trigger a _refresh_ on the parent component once another operation has
been executed (e.g. refresh of the **[sfpegListCmp](/help.sfpegListCmp.md)** displayed records
after a record creation/update/deletion)
* Such a behaviour is usually specified within the _next_ property of an action.
* In the example below, the _refresh_ action type is actually provided by the
**[sfpegListCmp](/help.sfpegListCmp.md)** parent component containing the action bar.
```
    "next": {
        "type": "done",
        "params": {
            "type": "refresh"
        }
    }
```

### **toast** Action Type

The **toast** action type enables to display a simple toast message, e.g. once another operation is complete.
    * It relies on the standard [platform-show-toast-event](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-show-toast-event/documentation) event.
```
{
    "name": "warn", "label": "Warn",
    "action": {
        "type": "toast",
        "params": {
            "title": "Beware {{{USR.Name}}}!",
            "message": "There is a problem with {{{RCD.Name}}}.",
            "variant": "warning"
        }
    }
}
```

### Custom **apex** Action Type

The **apex** action type enables to execute any operation implemented in a custom Apex class.
* This Apex class should implement the **sfpegAction_SVC** virtual class.
* The _params_ are then provided as input to the configured Apex class.
```
{
    "name": "apexAction", "label": "apexAction",
    "action": {
        "type": "apex",
        "params": {
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


### **Notification** Action Types (**utility**, **action** and **notify**)

Three Action Types are available to relay actions to other components leveraging the the
[Lightning Message Service]
(https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation) 
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
    * It relies on the **sfpegCustomAction** message channel, on which the custom LWC component should register.

* **notify** enables to notify **sfActionBarCmp** component instances to execute an action.
    * This is typically used to ask other LWC components embedding the **sfActionBarCmp** component to refresh 
    themselves once an action has been executed.
    * It relies on the **sfpegCustomNotification** message channel and leverages the _Notification Channels_ 
    attribute of the metadata record.
    * the target components need to set the _Notification Channel_ fields of the **sfpegAction** records they use
    (for the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** components they embed)
    * e.g. the following example triggers a _refresh_ action on all **[sfpegListCmp](/help/sfpegListCmp.md)**
    instances having header actions configured to listen to the _RefreshList_ channel. 
```
{
  "label": "Refresh", "name": "refresh",qfd
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

The _Notification Channels_ attribute is to be set only if **notify** action types are used to filter
which actions should be actually executed by the Action Bar component instance.
* It is a JSON list of strings containing the labels of the channels used within
**sfpegCustomNotification** message channel events.
* When a value is set, the Action Bar registers to these events.
* e.g. for an action header bar, the following text should be provided to register to the custom _RefreshList_ channel

![Action Notification Registration!](/media/sfpegActionNotifConfig.png)

---

## Configuration Examples

### Flow Action Launch (leveraging the PEG_FlowEmbed_CMP addressable component, see FLW package)

![Flow Tab Open Action!](/media/sfpegActionFlowLaunch.png)

In this example, a **sfpegListCmp** component is  used to display a set of promoted ongoing Tasks
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

### OpenURL Action with Rework 

see [Apex List Retrieval and OpenURL Action with Rework](/help/sfpegListCmp.md)

---

## Technical Details

***TO BE CONTINUED***