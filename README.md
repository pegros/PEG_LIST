# sfpegListComponents
Set of configurable/actionable list components to enhance Lightning UX

![SF PEG Components!](/media/sfpegLogo.png) 

Author: [Pierre-Emmanuel Gros](https://github.com/pegros)
Date: Oct. 2021

This package contains a set of LWC components built as contributions/examples for former & ongoing Advisory assignments by [Pierre-Emmanuel Gros](https://github.com/pegros), porting in LWC and optimising (for end-user performances and easier configuration mutualisation among page layouts) some components previously available in a former Aura component package (known as **PEG Components** not available on GitHub). 


* * *

### Component Scope

These components are primarily dedicated to displaying custom lists of information (related records, KPIs, messages, fields...) but are based on some common powerful features required to easily customise the end-user experience (context information merge, action framework, apex logic extension).

They heavily rely on standard Lightning framework features such as the Lightning Data Service (LDS) or the Lightning Message Service (LMS) and try to apply as much as possible the standard Design System (SLDS). The goal was to make them appear as much as possible as standard native Salesforce platform components but override usual limitations of the standard platform.

Experience Cloud is currently not supported but this is in the roadmap and happens mainly for testing reasons than actual technical constraints. Adding support for these usage cases should be relatively easy.

They are not available for Flow Designer but another package with components explicitly dedicated to these use cases is available (see [PEG_FLW](https://github.com/pegros/PEG_FLW) package).

As much attention as possible has been paid to internationalisation requirements (at least languages), leveraging standard mechanisms to translate labels, field names, picklist values...


### Objectives of the Document

As LWC does not provide embedded documentation for the components, this readme file provides an overview of the different elements available within this project, as well as configuration guidelines and examples for the different App Builder components.

Most component may also be embedded in other custom LWC components as well but these use cases are currently not documented here for the time being. You may however look at the source code to see how to reuse some of them (main action bar component, or display or utility ones) or reach out to the author for more informations.


### Package Availability

The package is freely available for use under the MIT license from this GiHub repository.
Periodic upgrades will be posted depending on fixes/evolutions implemented as part of assignments & personal interactions.
For now, all commits are made exclusively by the author.

You may easily deploy it to your Org via a simple SFDX deploy command from the project folder.

```
sfdx force:source:deploy -u <yourOrgAlias> -w 10 --verbose -p force-app
```



* * *

## Package Overview

Although the main purpose of the package is to provide a set of LWC components for the App Builder, a wide variety of other supporting items are included as well


### App Builder Components 

5 main LWC components are available for use in Lightning App Builder

* **sfpegListCmp**  displays a contextualised and actionable list of records in 3 main formats (data table, data tree or tile list), data being retrieved via SOQL or Apex.

![List as tiles!](/media/sfpegListTiles.png) 
![List as cards!](/media/sfpegListCards.png)
![List as data table!](/media/sfpegListTable.png) 
![List as tree grid!](/media/sfpegListTree.png) 


* **sfpegMessageListCmp** displays a conditional, contextualised and actionable list of end-user messages with customisable styles.

![List of messages!](/media/sfpegMessages.png)


* **sfpegKpiListCmp** displays an actionable list of KPI field values in a structured and  graphical way.

![List of KPIs!](/media/sfpegKpis.png)


* **sfpegProfileCmp** displays an actionable graphical summary of a record, with various lists of fields

![Complete Profile!](/media/sfpegProfile.png) 
![Profile with only details!](/media/sfpegProfileDetails.png)
![Profile with variant!](/media/sfpegProfileInverse.png) 

* **sfpegActionBarCmp** displays an button/menu bar component enabling to trigger a wide variety of  actions, integrated within the previous list components but also available for standalone use in Lightning pages.

![Action bar!](/media/sfpegActionBar.png) 


2  additional components are available for use in the Lightning Utility bar

* **sfpegActionHandlerCmp** (LWC) is primarily the same as the **sfActionBarCmp** but handles messages triggered by other components to execute actions from the utility bar instead of within tab (e.g. to enforce the console configuration when opening a page).
*  **sfpegActionUtilityCmp** (Aura) is an Aura wrapper of **sfpegActionHandlerCmp** to handle a few additional actions & utility bar specific behaviours currently not possible from LWC : automatic closing of the utility upon action Trigger, console tab operations (close all tabs, close tab and open another one...), custom/flow popup open...

[Image: Screenshot 2021-09-08 at 13.02.08.png]
A last special LWC component (**sfpegActionTriggerCmp**) is also available to be included in Lightning page layouts to trigger a specific action automatically upon instantiation. Leveraging conditional display, it enables to enforce the user to execute a certain operation when opening the page (e.g. opening an Edit popup or a flow). 


### Display Components

There are 5 LWC display components used by the App Builder ones:

* **sfpegCardDsp** displays a record card (for the **sfpegListCmp** in tile mode)
* **sfpegFieldDsp** displays a field with the proper lightning-formatted-XXX according to its type (for the **sfpegCardDsp)**
* **sfpegIconDsp** displays an lightning-icon 
* **sfpegPopupDsp** to display various pop ups, leveraging promises to await user interaction result
* **sfpegWarningDsp** to display error messages

A single Aura display component is used by other Aura components:

* **sfpegFlowDsp** displays a Flow within a modal popup triggered by the **sfpegActionUtilityCmp** utility component

The **sfpegActionBarCmp** component is also included in most other App Builder components to display an action bar.


### Utility Components

There are 3 LWC utility components used by the App Builder ones:

* **sfpegJsonUtl** to execute various operations on JSON objects and lists (flattening, hierarchy init for lightning-datatree component, sorting, filtering, formatting...)
* **sfpegMergeUtl** to manage context merge within text variables, extracting tokens, fetching/caching required data and replacing tokens by data.
* **sfpegCsvUtl** to generate and download a CSV file out of JSON list

The **sfpegActionBarCmp** component is also included in all other App Builder components to provide the customisable action execution utility. It may be explicitely displayed or not.


### LWC Message Channels

3 Messages Channels are available to trigger actions remotely on the **sfActionBarCmp** component family:

* **sfpegAction** enables to trigger an action on the **sfpegActionHandlerCmp** utility component (typically to request the enforcement of the Console configuration when navigating to a record)
* **sfpegCustomAction** to trigger an action on custom LWC components from a **sfActionBarCmp c**omponent (e.g. to trigger a custom action not supported by its framework).
* **sfpegCustomNotification** to trigger an action on **sfActionBarCmp c**omponents configured to subscribe to channels (e.g. to trigger **sfpegListCmp** refreshes) 



### Apex Controllers

For configuration retrieval and possible server side logic execution, a set of Apex classes has been defined:

* **sfpegAction_CTL** enables to retrieve **sfpegAction__mdt** record configuration details and execute DML operations or Apex actions (implementing the **** virtual interface defined by the **sfpegAction_SVC** class)
* **sfpegKpiListSelector__CTL** enables to retrieve **sfpegKpiList__mdt** record configuration details
* **sfpegListSelector_CTL** enables to retrieve  **sfpegListCmp__mdt**  record configuration details and execute DML operations or Apex actions (implementing the **** virtual interface defined by the **sfpegListQuery_SVC** class)
* **sfpegMessageSelector_CTL** enables to retrieve **sfpegMessage__mdt**  record configuration details
* **sfpegProfileSelector_CTL** enables to retrieve **sfpegProfileCmp__mdt** record configuration details


For App Builder configuration user experience, various “***datasource”*** selector classes are also available to select th configuration custom medatata records applicable to the page context:

* **sfpegActionSelector_CTL** provides the configuration of the **sfpegAction__mdt** components (standalone or embedded within other components)
* **sfpegKpiListSelector__CTL** provides configuration for the  **sfpegKpiList__mdt** components (basically the list of fields and how they should be displayed)
* **sfpegListSelector_CTL** provides the configuration for the **sfpegListCmp__mdt**  components (context data required, data request to execute via SOQL / Apex, how list results should be displayed)
* **sfpegMessageSelector_CTL** provides the configuration for the **sfpegMessage__mdt**  components (list of messages with display style, activation conditions and actions)
* **sfpegProfileSelector_CTL** provides the configuration for the **sfpegProfileCmp__mdt** components (basically what is displayed in their banners, avatars


Custom metadata records are systematically filtered by these selector classes according to their ***scope*** ** value (see ***Custom Metadata*** section hereafter) depending on the page type (App/Home page vs Record page) and possible object API Name.


### Apex Service Classes

To implement custom Apex logic, 2 virtual service classes are available:

* **sfpegAction_SVC** to implement custom action logic called via the **sfpegAction_CTL** controller
* **sfpegListQuery_SVC** to implement custom query logic called via the **sfpegListSelector_CTL**  controller.



### Custom Metadata

6 Custom Metadata are defined to store base configuration for the main App Builder components.

* **sfpegAction__mdt** provides the configuration of the **sfActionBarCmp** components (standalone or embedded within other components)
* **sfpegConfiguration__mdt** provides configuration for custom merge tokens to be supported by the **sfpegMergeUtl** utility component (to retrieve and merge Salesforce IDs for specific Object records, such as Dashboards, Reports, Knowledge Articles...)
* **sfpegKpiList__mdt** provides configuration for the  **sfpegKpiListCmp** components (basically the list of fields and how they should be displayed)
* **sfpegList__mdt** provides the configuration for the **sfpegListCmp**  components (context data required, data request to execute via SOQL / Apex, how list results should be displayed)
* **sfpegMessage__mdt** provides the configuration for the **sfpegMessageListCmp**  components (list of messages with display style, activation conditions and actions)
* **sfpegProfileCmp__mdt** provides the configuration for the **sfpegProfileCmp** components (basically what is displayed in their banners, avatars, titles, detail fields, actions)


All custom metadata objects include the following common fields:

* ***description*** to document the usage of each configuration record
* ***scope*** to define the pages for which the configuration record is applicable, i.e. a set of comma separated strings
    * “GLOBAL” keyword  (for all pages),
    * “RECORDS” keyword (for all record pages)
    * *<ObjectApiName>* (for a specific Salesforce Object) 


For each custom metadata, some useful default (or test) records are included (prefixed with 


### Static Resources

3 static resources are included to provide graphical details for the **sfpegIconDsp** and the **sfpegProfileCmp** components**:**

* **sfpegIcons** is a SVG sprite file providing the definition of various icons (in various sizes) to be used as custom icons within the **sfpegIconDsp** component**.**
* **sfpegBanners** is a zip archive containing the set of .png or .jpg files to be used as banner background within the **sfpegProfileCmp** component**.**
* **sfpegAvatars** is a zip archive containing the set of .png or .jpg files to be used as avater image within the **sfpegProfileCmp** component**.**

A base set of elements is provided, which may be extended.


### Custom Labels

Various **sfpegXXX** custom labels are defined to let administrators customise/translate various component messages and labels used by the LWC components. The label names generally start with the name of the LWC component they are used in. 


### Custom Object

A single object (**sfpegTestObject__c**) is included but only used for test purposes (in Apex test classes).
This object has 2 record types.


### Permission Sets

2 Permission sets are included:

* **sfpegListUsage** for standard end-users (to give them access to all necessary controller classes and VF page)
* **sfpegListTest** for apex test (dynamically given to the running user to be able to properly execute the tests)


* * *

## Component Configuration

Configuration is done at 2 levels:

* in the App Builder, to set simple high level configuration elements (such as card title & icon, debug mode activation...) and select one of the available detailed configuration records (see below)
* via custom metadata records, respectively to provide detailed configuration of the components (e.g. layouts, queries & actions to be used in the components), often containing complex JSON configuration stored in richtext fields.

Such an approach enables to easily reuse the same detailed configuration in multiple Lightning page layouts and enables a more efficient local configuration caching (for better performances)
[Image: Screenshot 2021-09-15 at 11.33.23.png]*Example of the **sfpegListCmp** component configuration in the App Builder, referencing 2 custom metadata records (orange zones) respectively for the data fetch/display configuration and for the header actions.*

In the main of metadata records, context merge tokens may be used to dynamically set some values based on the applicable record(s) and user. See the **sfpegMergeUtl** for more details about the applicable syntax and all the possible tokens.

“*Debug xxx ?”* properties enable to display some configuration information within the component and activate the debug logs within the browser console.

* “*Debug ?*” applies only to the current component
* “*Debug (fine) ?*” applies to all sub-components used  within the component (e.g. the action bar or the merge utility).


* * *

### Action Configuration (**sfpegAction__mdt)**

**pegAction__mdt** provides the configuration of the **sfActionBarCmp** components (buttons & menus in an action bar, with underlying actions triggered).

The action bar basically consists in a single list of buttons and menus (within a [lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation)container).

* A button contains a single action configuration
* A menu contains a drop-down list of multiple action configuration items. 

[Image: Screenshot 2021-09-13 at 17.15.41.png]*Display of a **sfActionBarCmp** component within a page (with 1 button followed by 2 menus).*
[Image: Screenshot 2021-09-13 at 18.10.50.png]*Configuration of the **sfActionBarCmp** component in the App Builder*
Most of its configuration  is done via the **"***Actions*" attribute of the metadata record, upon which context merge (see **sfpegMergeUtl** component) is applied/refreshed within each use case.

[Image: Screenshot 2021-09-13 at 18.43.56.png]

Hereafter is a typical configuration for a standalone mix of buttons and menus, containing first a menu with 3 options leading to a report, a dashboard and a folder, then 2 buttons to create Accounts via a Flow (launched within a addressable Lightning component) or a standard creation page.

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

For buttons, at least “*iconName*” or “*label*” should be specified, whereas for menu items, “*label*“ is mandatory and ”“*iconName*” optional.

Multiple other display properties are available:

*  “*variant*” to change the display style (see [lightning-button](https://developer.salesforce.com/docs/component-library/bundle/lightning-button/specification) for possible values).
* “*iconPosition*” to set the icon on the left or right of the label
* “*iconSize*” to act on the button icon size (see [lightning-button-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-icon/specification) or[button-menu](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-menu/specification) for info)


It is also possible to dynamically activate/disable buttons and menu items via the “*disabled*” property, e.g. leveraging current user’s custom permissions via custom formula fields on the “User” object.

```
[
    {
        "name":"warn", "label":"Warn (if not permission)",
        "disabled":{{{NPERM.TST_Perm}}},
        "action":{
            "type":"toast",
            "params":{
                "title":"Beware {{{[USR.Name](https://usr.name/)}}}!",
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


Each button or menu item has an “*action*” property to specify one of the following action types :

* _**navigation**_ to trigger the navigation to a [page reference](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type) leveraging the standard [lightning-navigation](https://developer.salesforce.com/docs/component-library/bundle/lightning-navigation/documentation) base LWC component (e.g. to open a standard record creation/edit/view page).
    * The example below enables to open a report

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



* _**open**_ is a shortcut to simplify the opening of a record (for the selected row in a list)

```
{
    "name":"open", "label":"Open","iconName":"utility:open",
    "action":{"type":"open"}
}
```



* _**edit**_ is a shortcut to open the standard edit popup of a record (for the current page record in header /standalone use case or the selected row in a list).

```
{
    "name":"edit","label":"Edit","iconName":"utility:edit",
    "action":{"type":"edit"}
}
```



* _**openURL**_ to open a page URL in a different browser tab (via window.open() javascript primitive instead of the Lightning navigation service).
    * “*url*” is the main property to define with the target URL to be used
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



* _**LDS**_ to trigger a single record direct create/update/delete via the Lightning Data Service
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
        "title": "Updating Row State",
        "message": "Please confirm.",
        "params": {
            "type": "update",
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
        "title": "Deleting Record",
        "message": "Please confirm.",
        "params": {
            "type": "delete",
            "params": "{{{ROW.Id}}}"
        }
    }
}
```



* **DML** to trigger a DML operation (insert, update, delete) via a dedicated Apex controller instead.
    * The DML operation is designed to possibly work on multiple records (see mass actions hereafter) therefore the “records” property should be configured with a list containing the single record to update.

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



* _**ldsForm**_ to open a popup to create / edit a record leveraging the standard [lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation) base component (updates being then made via LDS)


[Image: Screenshot 2021-09-16 at 16.14.04.png]

    * “*title*” and “*message*“ properties enable to change the corresponding text elements in the top part of the displayed popup.
    * “*columns*” property defines how many fields are displayed per line in the popup form,
    * “*record*” property enables to set contextual elements for the form,
        * “Id”, “RecordTypeId” and “ObjectApiName” sub-properties are a must to initialize the appropriate form
        * “*edit*” vs “*create*” mode is automatically derived from the presence of the “*Id*” sub-property
        * Other sub-properties may be used to set default values for the form fields (according to their API names)
    * “*fields*” property enables to list the set of fields to be displayed in the popup form and consists in a list of form field definitions
        * each form field definition needs a “*name*” containing the API name of the field to be displayed
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



* _**dmlForm**_ implements the same behaviour but enables to execute the update via a DML call (useful for object types not supported by LDS, such as Task & Event)
    * In such a case, the popup form works with the “*formRecord*” and “*formFields*” instead of “*record*” and “*fields*” and the LDS standard submission is replaced by a DML on the “*record*”.
    * All output form field values are applied on the “*record*” before the DML (with the same API name unless a “fieldMapping” JSON object property is provided `{ "formFieldName": "recordFieldName",....}`).
    * In the example below, a “*TST_TaskProxy__c*” custom object has been created with a single **“***Reason__c***”** field leveraging the same API name & picklist global value set as the "*Reason__c*" field configured on the Task object.

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



* _**apexForm**_ : PLANNED
    * Same behaviour as the ldsForm but with the ability to fetch/update data via Apex calls instead of LDS (e.g. to perform callouts to external systems).



* _**massForm**_ to open an edit form in a popup leveraging the standard [lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation) base component and apply the corresponding changes via a mass DML update on the list of record provided by a parent component.
    * e.g. the **sfpegListCmp** provides the set of selected records as input (when selection is enabled on this component)
    * The configuration is similar to the **ldsForm** action, the main difference being that the output of the LDS form displayed is cloned and applied to all records selected.
    * The “*removeRT*”  flag enables to avoid applying to the selected records the Record Type defined in the “record” property (which may be useful to control picklist values in the displayed form)

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
    * A confirmation popup is displayed, the header “*title*” and “*message*” of which may be customised by dedicated properties.
    * The “*bypassConfirm*” property enables to bypass this ste and directly execute the DML.
    * For the “*update*” operation, the “*record*” property must be defined with the set of field values to be applied on all the selected records. The generated DML contains clones of this JSON object with the “Id” property set from the value available on each selected record.

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
    * Same behaviour as the massDML but with the ability to call an Apex logic instead of simple DMLs.



* _**done**_ to trigger an action on a parent component.
    * This is typically used to trigger a refresh on the parent component after another operation has been executed (e.g. refresh of the **sfpegListCmp** displayed records after a record creation/update/deletion)
    * Such a behaviour is usually specified within the “*next*” property of an action.
    * In the example below, the “*refresh*” action type is actually provided by the **sfpegListCmp** parent component containing the action bar.

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



* _**toast**_ to display a simple toast message, e.g. once another operation is complete.
    * It relies on the standard [platform-show-toast-event](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-show-toast-event/documentation)event.

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



* _**apex**_ to execute a custom operation implemented in a custom Apex class
    * This Apex class should implement the **sfpegAction_SVC** virtual class.

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

    * There is also a way to group multiple logics within a single Apex class, in which case a “method” parameter can be specified after the class name

```
{
    "name": "apexMethod", "label": "apexMethod",
    "action": {
        "type": "apex",
        "params": {
            "name": "TST_UserAction_SVC.TestMethod",
            "params": "TestString"
        }
    }
}
```



* _**utility**_ to notify the **sfpegActionHandlerCmp** utility bar component and let it execute an operation.
    * This is typically useful when navigating to a record when wishing to enforce the console tab configuration instead of the default console behaviour (opens target in a subtab of current main tab)
    * It also enables to trigger some specific console related actions implemented only in the **sfpegActionUtilityCmp** Aura component.
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



* _**action**_ to notify external LWC components in the same tab (via the [Lightning Message Service](https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation) in default scope) with any parameters required, enabling to trigger any custom browser side LWC logic via the **sfActionBarCmp** component.
    * this may be helpful to e.g. display a complex custom form popup.
    * It relies on the **sfpegCustomAction** message channel



* _**notify**_ to notify **sfActionBarCmp** component instances to execute an action.
    * This is typically used to ask other LWC components embedding the **sfActionBarCmp** component to refresh themselves once an action has been executed.
    * It relies on the **sfpegCustomNotification** message channel and leverages the “*Notification Channels*” attribute of the metadata record.

EXAMPLE TO ADD

The “*Notification Channels*” attribute is to be set only if notify **action** types are used to filter which actions should be actually executed by the Action Bar component instance.

* It is a JSON list of strings containing the labels of the channels used within **sfpegCustomNotification** message channel events.
* When a value is set, the Action Bar registers to these events.

EXAMPLE TO ADD

Additional actions are available on certain wrapping components and may be triggered via a first “*done*” action:

* **refresh** on the **sfpegListCmp** may be called from the header or row actions to refersh the displayed list (same action as the default “*refresh*” button displayed in the component header).
    * It is typically called via the “*next*” property of another action.

```
{
    "name": "addLds",
    "label": "Add LDS",
    "action": {
        "type": "ldsForm",
        "params": {
            "title": "New TST_PEG__c",
            "message": "Please fill in missing elements",
            "columns": 2,
            "record": {
                "ObjectApiName": "TST_PEG__c",
                "RecordTypeId": "{{{RT.TST_PEG__c.RT2}}}",
                "Name": "Clone of {{{ROW.Name}}}",
                "TST_ACL__c": "{{{ROW.TST_ACL__c}}}"
            },
            "fields": [
                { "name": "RecordTypeId", "disabled": true },
                { "name": "Name", "required": true },
                { "name": "Motif__c" },
                { "name": "TST_ACL__c", "hidden": true }
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



* **openTab,** **closeAllTabs, minimize, openPopup, openFlow** on the Aura **sfpegActionUtilityCmp** utility component
    * when called from an action bar within a tab, they need to be called first via a “*utility*” action type (to reach the utility bar handler) then via a “*done*” one (to move up from the LWC handler to the Aura container)
    * The following example illustrates how to open a Flow or a custom Aura component in a modal popup from an action bar.
        * for **openFlow**, the ultimate “*params*“ property should follow the input syntax for the ”*runFlow*“ method of the [lightning:flow](https://developer.salesforce.com/docs/component-library/bundle/lightning:flow/documentation) component 
        * for **openTab**, it should contain a JSON object with the different public attributes of the component instantiated. The component should also include the [lightning:overlay](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation) utility to leverage its “*notifyClose*” method to automatically close the popup upon operation completion.

```
[
    {
        "name": "Flow", "label":"Flow",
        "action": {
            "type": "utility",
            "params": {
                "type":"done",
                "params": {
                    "type": "openFlow",
                    "params": {
                        "name":"TEST_TST_Flow",
                        "params":[{"name" : "recordId", "type" : "String", "value" : "{{{GEN.recordId}}}"}],
                        "header":"Test Flow Header",
                        "doRefresh":true,
                        "class": "slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large"
                    }
                }
            }
        }
    },
    {
        "name": "Component", "label":"Component",
        "action": {
            "type": "utility",
            "params": {
                "type":"done",
                "params": {
                    "type": "openPopup",
                    "params": {
                        "name": "c:TST_Component",
                        "params":{"recordId":"{{{GEN.recordId}}}"},
                        "header":"Test Popup Header",
                        "doRefresh":true
                    }
                }
            }
        }
    }
]
```

    * when called from the utility menu, they need to be called via a “*done*” action type (to move up from the LWC handler to the Aura container), e.g. to automatically minimize the utility menu popup after having triggered an action.
        * The example below also shows how to use  the **closeAllTabs** and **minimize** action types, actions triggered from the LWC menu but executed in the Aura container (to leverage the standard [lightning:workspaceApi](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation) and [lightning:utilityBarAPI](https://developer.salesforce.com/docs/component-library/bundle/lightning:utilityBarAPI/documentation) components)

```
[
    {
        "label": "New Individual", "name": "NewPA",
        "iconName": "utility:new", "variant": "base",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__objectPage",
                "attributes": {
                    "objectApiName": "Account",
                    "actionName": "new"
                },
                "state": {
                    "defaultFieldValues": "Code_Intermediaire__c={{{USR.GRC_CodeIntermediaire_Principal__c}}},Code_Point_de_vente__c={{{USR.Point_de_vente_Principal__c}}},HC_CodePointDeVente__c={{{USR.BranchUnitPointDeVente__c}}},HC_CodeIntermediaire__c={{{USR.BranchUnitIntermediaire__c}}}",
                    "nooverride": "1",
                    "recordTypeId": "{{{RT.Account.Individual}}}"
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
        "label":"Close Tabs", "name":"closeAllTabs",
        "action":{
            "type":"done",
            "params":{
                "type":"closeTabs",
                "params":{
                    "closeAll":true
                }
            },
            "next":{
                "type":"done",
                "params":{
                    "type":"minimize"
                }
            }
        }
   },
   {
        "label":"Close All other tabs", "name":"closeAllTabsButCurrent",
        "action":{
            "type":"done",
            "params":{
                "type":"closeTabs",
                "params":{
                    "closeAll":false
                }
            },
            "next":{
                "type":"done",
                "params":{
                    "type":"minimize"
                }
            }
        }
    }
]
```

TO BE CONTINUED
openTab + refreshTab in the roadmap


For the **sfpegActionTrigger** component, the configuration relies on the same custom metadata and is really simple:

* select a **sfpegAction** metadata record
* specify the “*name*” of the action to be triggered (beware that there is no “*ROW*” context for this action)
* set the component visibility according to the action trigger condition (here a simple boolean flag).


[Image: Screenshot 2021-10-07 at 11.57.52.png]
Note: in debug mode, the component is displayed with some configuration details. Otherwise, it remains completely hidden (it is then preferable to put it at the bottom of the page layout as it consumes some empty margin/padding space).

* * *

### Custom Merge Usage & Configuration (**sfpegConfiguration__mdt)**

The **sfpegMergeUtl** component bascially enables to merge contextual data within a string. It

* identifies the tokens within the string using a predefined `{{{TOKEN}}}` format
* fetches the data (or uses contextual data provided by the calling component) depending on the type of token (see below for available ones).
* replaces all found tokens by their appropriate values.


As a baseline, the **** component provides the following set of token types:

* **GEN.xxx** to fetch some generic elements :
    * *GEN.objectApiName* and *GEN.recordId* for the Object name and Salesforce record Id of the current page (when applicable)
    * *GEN.userId* for the Salesforce record Id fo the current User
    * *GEN.now t*o get current timestamp (in ISO format)
    * *GEN.today, GEN.yesterday, GEN.tomorrow, GEN.lastWeek, GEN.nextWeek,  GEN.lastMonth, GEN.nextMonth,  GEN.lastQuarter, GEN.nextQuarter,  GEN.lastYear, GEN.nextYear* to get dates in delta to current day, value being provided in ISO format
        * To get these values in user local format, “*Local*” should be appended to the token name (e.g. *GEN.todayLocal*).
* **RCD.fieldName** for data about the current record (if its object is supported by the Lightning Data Service)
    * *fieldName* should correspond to the API name of the field value to fetch, e.g. *RCD.Name* for the record *Name*
    * Lookups may be leveraged, e.g. *RCD.Owner.Profile.Name*
    * Note: *GEN.recordId* is far more efficient than *RCD.Id* to fetch the current record Id
* **USR.fieldName** for data about the current user
    * It behaves exactly like the **RCD** token
* **ROW.fieldName** for data about a specific record context
    * This usually applies to a given record displayed in a list component, typically to contextualise row-level actions
    * Syntax is similar to **RCD** and **USR** tokens**.**
* **LBL.labelName** to retrieve a custom label value in the user language
* **RT.objectApiName.developerName** to retrieve the Salesforce ID for a given Record Type of an Object
* **PERM.permissionName** to check if the current user has a given custom permission in its habilitations
    * The result is boolean and is usually used to control the activation of an action/menu
    * The **NPERM** may be used instead of **PERM** to check the opposite (user has not the permission)
* **VFP.pageName** to get the full URL of a VF page, i.e. with the security token
    * This is required when the target page has CSRF protection activated


This base set of token types may be extended by leveraging the **sfpegConfiguration__mdt** custom metadata. These records enable to easily retrieve and merge Salesforce IDs for specific Object records, facilitating the deployment of Salesforce configuration artefacts between environments. By default a set of predefined metadata records is provided : 

* **RPT** for report IDs (→ the merge token being then *RPT.DeveloperName*)
* **DBD** for Dashboard IDs  (→ the merge token being then DBD*.DeveloperName*)
* **FLD** for Folder IDs  (→ the merge token being then *FLD.DeveloperName*)

Specific Org records may then be added to the configuration (e.g. the *Knowledge Articles* or  FSC *Reciprocal Roles* in the example below).

[Image: Screenshot 2021-09-13 at 17.26.00.png]

[Image: Screenshot 2021-09-13 at 17.27.46.png]
In this example, roles may be referenced in creation actions with the {{{`ROLE.<SourceSystemId__c>`}}} keyword.

* “*Name*” should contain the token prefix (here “*ROLE*”).
* “*Field*” should indicate which field identifies the token value in the merge syntax for the considered token prefix (here `SourceSystemId__c`).
* “*Query*” should provide the SOQL query template to be used by the **sfpegMergeUtl** component to fetch the values (the list of field values requested being automatically added after the “in” keyword).


* * *

### KPI List Configuration (**sfpegKpiList__mdt)**

**sfpegKpiList__mdt** provides configuration for the  **sfpegKpiListCmp** components. A KPI list os basically a list of KPI groups, each group consisting in:

* a group header (orange zone) with an Icon, a Title and a an actions group.
* a list of KPI elements (e.g. blue zone) with an icon, a main KPI (in bold), a main KPI label above) and a set of details (on the right of the main KPI)


[Image: Screenshot 2021-09-14 at 14.45.09.png]

Configuration is quite straigthforward both in the App Builder, basically selecting a **sfpegConfiguration__mdt** record.
[Image: Screenshot 2021-09-14 at 18.15.38.png]In the metadata record, the main confguration relies in the “*DisplayConfig*“ parameter, containing a list of KPI groups as displayed above, each group consisting in:

* a header (with a label, icon and actions)
* a set of KPI elements consisting main KPI (via the “*name*”  property with a record filed API name), a “iconName“, an optional “label”, an optional action (triggered via the icon, referencing an action name available in the main “actions” property) and a list of “*related*” KPIs (API names of record fields displayed next to the main KPI).


[Image: Screenshot 2021-09-14 at 18.23.19.png]

* * *

### List Configuration (**sfpegList__mdt)**

For the **sfpegListCmpt** component, a lot of properties may be set directly in the App Builder:

* Wrapping card customisation properties (title, icon, CSS, max-height, built-in action button size, display of record number...)
* Built-in actions activation (filter, sort, export, debug...)

However, most of the configuration lies in two custom metadata referenced records (see orange zones below):

* a **sfpegList__mdt** record for the data fetch & display
* a  **sfpegAction__mdt** record for the custom header actions (see dedicated section for details)

[Image: Screenshot 2021-09-16 at 10.06.36.png]
The **sfpegList__mdt** custom metadata records basically configure:

* How data are retrieved
    * SOQL query or Apex class (implementing the **sfpegListQuery_SVC** virtual class) to be applied
        * “*Query Type*” to select a fetch mode
        * “*Query Class*” to specify the name of the Apex class (implementing **sfpegListQuery_SVC** virtual class) to call
        * “*Query SOQL*” to specify the SOQL query to execute.
    * Inputs required to contextualise the fetch 
        * “*Query Input*” to specify a single JSON context object to contextualise the SOQL query or be passed as input to the Apex class fetch method
        * For the SOQL query, the properties of this JSON object are to be merged via `{{{propertyName}}}` in the query string  (e.g. `{{{ID}}}` in the example below to fetch the ID property value of the input object)
        * The values of this JSON object may be initialized via any `{{{mergeToken}}}` supported by the **sfpegMergeUtl** utility component (e.g. `{{{GEN.recordId}}}` in the example below to fetch the Salesforce ID of the current page record)
    * Possible activation of pagination for large data sets (with an additional global *count()* query)  
        * “D*o Pagination ?*” to check to activate pagination
        * “*Query Count*” to provide a SOQL count() query corresponding to the “Query SOQL” if SOQL mode retrieval is used (a single number being returned instead of a record list)
        * “*Query Order By Field*” and “*Order Direction*” to let the component property manage the pagination (the feature not relying in the SOQL offset feature but on explicit where clause statements).
        * Beware that, when using pagination,  the configured “*Query SOQL*” property must include:
            *  a `{{{PAGE}}}` merge token within its WHERE clause to set the page limit (lower or higher depending on direction)
            * a LIMIT clause to set the page size (in number of records)
            * an ORDER BY clause corresponding to the specified “*Query Order By Field*” and “*Order Direction*”
    * → probable later addition of security related parameters, such as “enforce FLS” and “bypass sharing“ for the SOQL mode.
* How they are displayed

    * Choosing among the four display modes supported (*DataTable*, *DataTree*, *CardList*, *TileList*), most of the configuration element being shared among them (or simply ignored)
    * Configuring the display via a single JSON object within the “*Display Configuration*” attribute, the leveraging (and extending) the JSON configuration of the standard [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and[lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation) base components.
        * This is especially applicable to the “*columns*” property
        * Additional root properties have been added for the “*CardList”* and *“TileList”* modes to tune their display:
            * “*title*” and “*icon*” to configure the title and optional icon for each tile displayed in these modes
                * icon name being either static (by providing a “*name*” property) or dynamic (by providing a “*fieldName*“ property, this field containing the actual icon name to be used) 
            * “*cardNbr*” and “*fieldNbr*” to respectively set the number of tiles and fields (within a tile, if “*CardList”* mode is used) per row
            * Other options to check
    * Possibly “*flattening*” the JSON data fetched in order to let related record data being properly displayed within *DataTree* or *TreeGrid* components (which do not support displaying data from JSON sub-objects)
* Which actions are available at row level
    * leveraging a **sfpegAction__mdt** custom metadata record containing only actions (no menus) identified by their names within the “*Display Configuration*” property.
        * within “*button*” or “*action*” items of the “*columns*” property (see  [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) documentation)
        * within a dedicated “*menu*” property defining the menu for the “*TileList”* and *“CardList”* display modes or an appended last column menu in “*DataTable”* and “*TreeGrid”* modes, a display configuration being required in such a cas (with label / icon)
        * within the “*action*” sub-property of the “*title*” property for the “*TileList”* and *“CardList”* display modes
    * Beware that conditional activation of actions does not work for “*action*” entries in the  “*DataTable”* and “*TreeGrid”* columns (i.e. only for “*button*” ones), while they properly work in the menu for the “*TileList”* and *“CardList”* modes*.*


[Image: Screenshot 2021-09-24 at 09.56.40.png]*Main **sfpegList** record*
[Image: Screenshot 2021-09-24 at 09.57.26.png] *Referenced **sfpegAction** record for row level actions*



When using the pagination, this example should be modified the following way:

* “*Query SOQL*” should be modified to :

`SELECT...  WHERE  WhatId = '{{{RECORD}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA' and {{{PAGE}}} order by Id desc limit 5`

* “*Query Count*” should be set to : 

`SELECT count() FROM Task WHERE  WhatId = '{{{ID}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA'`

* “*Query OrderBy Field*” should be set to “Id”
* “*Order Direction*” should be set to “Descending“


* * *

### Message List Configuration (**sfpegMessage__mdt)**

**sfpegMessage__mdt** provides the configuration for the **sfpegMessageListCmp**  components (list of messages with display style, activation conditions and actions). Each message consists in:

* a title text (blue zone)
* an optional message text (green zone)
* a optional/frequent icon (red zone)
* an optional action button (orange zone)


[Image: test.jpg]

As a baseline, a message list is configured in the “*Message Display*” attribute as a JSON list of message configuration items, each consisting in:

* a “*header*” property containing the main message to display 
* a “*message*“ property containing additional detailed information about the  message
* a “*variant*” property to set the style to apply to the message (base, notif, info, infoLight, warning, warningLight, error, errorLight, success, successLight)
* some additional properties to override the default variant settings (“*iconName*”, “*iconSize*”, “*iconVariant*“)
* a possible fixed “*size*” in number of columns within a 12 column grid (12 meaning 100% of the width, no size letting the message grow according to its content)
* an optional action button via an “action” property containing at least  the “*name*“ of an action (registered in the **pegAction__mdt** record referenced via the ”message actions” attribute) and a ”*label*“ or "*iconName*"
* optional display conditions via the “*isHidden*” property which may include formulas evaluated at runtime by the component (no need to define custom formula fields on the User or current Object).


[Image: Screenshot 2021-09-13 at 17.47.01.png]If actions are used in the message list, a **pegAction__mdt** record name must be specified in the “*Message Actions*” attribute. This record should contain all the actions possibly triggered by the message list.

This component leverages the **sfpegIconDsp** base component to display icons. Custom SVG icons may then be referenced within the message configuration (via the “*resource:<iconName>*” naming scheme) after they have been added within the **sfpegIcons** static resource.

* * *

### Profile Configuration (**sfpegProfileCmp__mdt)**

**sfpegProfileCmp__mdt** provides the configuration for the **sfpegProfileCmp** components

* the optional banner background image (blue zone)
* the optional avatar image (black zone)
* the optional header content (orange zone), with a top badge, a title and a set of detail fields below
* the optional action bar (grey zone)
* the optional detailed content (red zone) containing a set of detail fields with various possible layout variants


[Image: Screenshot 2021-09-13 at 18.31.47.png]
Some elements are configurable directly in the App Builder, mainly the custom metadata record to use but also various general layout options (such as size, padding, actions alignment, inverse text display mode...). 
[Image: Screenshot 2021-09-13 at 19.01.24.png]
Within the custom metadata, each profile element has its own configuration field:

* profile “*banner*” and “*avatar*” may be static (i.e. same value for all instances) or dynamic (leveraging e.g. a record formula field) 
    * In any case, the attribute should contain the name of a file available within the **sfpegBanners or sfpegAvatars** static resources
    * Custom .jpg or .png image files need to be added to these static resources prior to being referenced in this configuration.
* profile “*header*” is a simple JSON object containing 3 possible properties:
    * the record field API name to use for the badge
    * the record field API name for the title
    * the list of record field API names for the header details (below the title) 
* profile “*actions*” is the name of a **pegAction__mdt** record providing the action bar configuration to be used
* profile “*details*” ia a JSON object containing
    * a display variant, which may be “*list*”, “*base*”, “*media*” or “*table*”
    * the list of fields to display
        * as a list of record field API names for all variants but “*media*”
        * as a list of JSON objects with  “iconName” and “fieldName” properties set, mandatory for the “media” variant.
    * other display configuration options,  such as the number of columns for field layout (for all variants but “*list*”)


[Image: Screenshot 2021-09-13 at 19.00.02.png]
Hereafter is a configuration example for Profile details in “*media*” display mode

```
{
    "variant":"media",
    "columns":3,
    "iconSize":"small",
    "fields":[
        {"iconName":"utility:activity","fieldName":"Account__c"},
        {"iconName":"standard:user","fieldName":"OwnerId"},
        {"iconName":"resource:total","fieldName":"KPI1__c"}
    ]
}
```


The **sfpegIconDsp** base component is used to display the detail field icons. Custom SVG icons may then be referenced (via the “*resource:<iconName>*” naming scheme) after they have been added within the **sfpegIcons** static resource.


### Custom Icons Configuration

The **sfpegIcon.svg** static resource contains all the custom SVG icons usable in the other components via the “*resource:xxxx*” syntax. If new icons are required, new SVG definitions may be added in the static resource for the new icon in all target sizes 

In the following example, the `resource:total` icon is defined in both *medium* and *small* formats.

* the id of the sprite is built as “`<iconName>-<iconSize>`”
* In order to reuse an original SVG defined in other sizes, a transformation is applied to scale and translate the original SVG directives for a proper display. The general viewBox is in a “`0 0 100 100`“ configuration and target sizes for medium and small sizes are respectively 32px and 24px.
* The draw color has to be explicitely specified (as it is not inherited from the containers) and the stroke-width may also be adapted to the size.

```
<g id="total-medium" transform="scale(0.08) translate(-256.6798,-531.7963)" stroke="#a42a25">
    <g fill="none" fill-rule="evenodd" stroke-width="10" >
        <path d="m 340.80927,575.52393 h 198.63281 l 5.27344,66.60156 h -7.42188 q -1.36719,-19.72656 -6.64062,-30.07813 -5.27344,-10.54687 -14.45313,-15.23437 -9.17969,-4.6875 -29.10156,-4.6875 h -90.42969 l 80.66406,103.51562 -91.79687,108.39844 h 100.58594 q 27.34375,0 41.79687,-8.78906 14.45313,-8.78906 21.67969,-36.71875 l 7.42187,1.75781 -11.32812,80.07813 H 340.80927 v -7.03125 L 442.76239,713.02393 340.80927,582.55518 Z" />
    </g>
</g>
<g id="total-small" transform="scale(0.06) translate(-256.6798,-531.7963)" stroke="#a42a25">
    <g fill="none" fill-rule="evenodd" stroke-width="10" >
        <path d="m 340.80927,575.52393 h 198.63281 l 5.27344,66.60156 h -7.42188 q -1.36719,-19.72656 -6.64062,-30.07813 -5.27344,-10.54687 -14.45313,-15.23437 -9.17969,-4.6875 -29.10156,-4.6875 h -90.42969 l 80.66406,103.51562 -91.79687,108.39844 h 100.58594 q 27.34375,0 41.79687,-8.78906 14.45313,-8.78906 21.67969,-36.71875 l 7.42187,1.75781 -11.32812,80.07813 H 340.80927 v -7.03125 L 442.76239,713.02393 340.80927,582.55518 Z" />
    </g>
</g>
```

Please refer to the standard [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) page for more details about how custom icons work.

* * *

## Implementation Examples

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


* * *

## Technical Details

Hereafter are provided various technical details about the way the components have been implemented, which may help better understand their behaviours.


### Aura vs LWC

Most of the logic is implemented in LWC components.

However, in order to be able to leverage some interesting APIs or components not yet available in LWC (workspaceAPI, overlayApi, utilityBarApi, flow...) or some behaviours not supported by LWC (dynamic component instantiation via `$A.createComponent()`), some logic still had to be implemented in the legacy Aura technology for various action types.

All this custom Aura logic has been centralised in the **sfpegActionUtilityCmp** component and its supporting **sfpegFlowDsp** component.


### Local Initialisation Cache of Configuration

In order to optimise initialisation time of the different components, a 2 stage approach has been used:

* cacheable AuraEnabled Apex methods have been used to fetch custom metadata records (leveraging the standard Lightning cache)
* any fetched / parsed configuration is also stored in a static map variable per component (enabling to execute the initialisation only once and only fetch the missing elements or initialise the specific items)

This approach enables to dramatically reduce initialisation times when the same configuration is used in multiple pages. E.g. when opening Account pages

* the configuration is loaded first then all contextual data requested when opening the first Account page 
* the configuration is reused and contextual data directly fetched when opening the later Account pages.



### Lightning Data Service vs DMLs

Lightning Data Service (via `@wire` methods or `lightning-record-form` components) is heavily used in the components to execute actions or fetch/display record data.

* It is used also to display input forms for mass actions (as temporary creation forms), although no LDS operation is actually executed, mass operations being done via DMLs.
* This works perfectly for all objects supported by LDS, usual exceptions being Task, Event and Knowledge for which DML actions are always required (unless opening the standard creation / edit pages)
* LDS updates are very useful as they automatically propagate to other components and avoid reloading/refreshing the page.



### Lightning Message Service Based Communication

In order to integrate the action framework with custom LWC components, the[Lightning Message Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel) has been leveraged to support bi-directional communication between components in this package and custom external logic.
This mechanism relies on a set of “*message channels*“ for inbound / outbound communication with the package components.

This mechanism is also used internally to communicate from a tab component to the utility **sfpegActionHandlerCmp** component via “*utility*” actions and may be used to propagate “*refresh*” requests to multiple **sfpegListCmp** in a tab after an update action via “*notify*” actions.


### Apex Extensibility

In order to extend the standard capabilities made available in the package, an extension framework (via virtual classes and` forname()` class instantiation) has been implemented to let developers implement and integrate additional custom Apex logic.

This applies to the following features:

* actions (see **sfpegAction** configuration) leveraging the **sfpegAction_SVC** virtual class
* list queries (see **sfpegList** configuration) leveraging the **sfpegListQuery_SVC** virtual class