# ![Logo](/media/Logo.png) &nbsp; **sfpegActionHandlerCmp** Component


This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegActionHandlerCmp.md).


## Introduction

The **sfpegActionHandlerCmp** component is basically the same as the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
but includes some specific behaviours specific to the utility bar.

![Action utility](/media/sfpegActionUtility.png) 

This LWC component is dedicated to the utility bar and enables to execute actions from this context.
* its primary purpose is to execute _navigate_ actions from the utility bar, which
automatically enforces the Navigation Rules configured for the console App
instead of systematically opening the new page as a subtab of the current main tab
* it is also used to __close console tabs_ and provides also a way to automatically
hide the utility bar popup window after user interaction.

ℹ️ It is also compatible with the legacy Aura **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)**
component providing additional action types only supported in Aura, most of which have
been now implemented in LWC at the **sfpegActionBarCmp** or **sfpegActionUtility** level.

As a baseline, it also enables to display a vertical action menu from the utility bar. 


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

When configuring a Lightning App, the **sfpegActionHandlerCmp** component may be added within the 
**Utilities** of the app. It basically requires to select one of the available **sfpegAction__mdt** 
custom metadata records to define the set of actions to be displayed in the utility bar.

Such a configuration remains optional, only `utility` action types (see hereafter) being handled by
the component if the `Handle Notifications?` property is checked.

⚠️ **Beware** to :
* opt for automatic component launch in the App Utility Item Settings (standard `Start automatically`
checkbox in the component configuration) for the component in charge of handling the `utility` action types,
in order to properly support this feature even before having opened the action menu in the utility bar.
* check only once the `Handle Notifications?` checkbox if the component is used multiple times in the
utility bar with different action menus, in order to prevent a same action from being executed multiple
times.


## Available Action Types

In addition to all the action types available for the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
component, it offers a few console and utility bar specific ones leveraging specific LWC APIs:
* [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation) for console specific actions:
    * **openTab** to close the current tab and open a new one
    * **closeTabs** to force the closing of all (or all but current) tabs not pinned
    * **refreshTab** to refresh the content of the current tab
* [utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-utility-bar-api/documentation)
for utility bar specific actions
    * **minimize** to close the **sfpegActionUtilityCmp** component utility bar popup


### **openTab** Action Type

The **openTab** action type enables to open a target page / record according to the utility configuration 
and possibly automatically close the origin tab. 

It relies on the [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation)
to determine if the current application is in console mode and execute the various tab navigation and tab
management operations.

# ![Logo](/media/Logo.png) &nbsp; **sfpegActionHandlerCmp** Component


This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegActionHandlerCmp.md).


## Introduction

The **sfpegActionHandlerCmp** component is basically the same as the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
but includes some specific behaviours specific to the utility bar.

![Action utility](/media/sfpegActionUtility.png) 

This LWC component is dedicated to the utility bar and enables to execute actions from this context.
* its primary purpose is to execute _navigate_ actions from the utility bar, which
automatically enforces the Navigation Rules configured for the console App
instead of systematically opening the new page as a subtab of the current main tab
* it is also used to __close console tabs_ and provides also a way to automatically
hide the utility bar popup window after user interaction.

ℹ️ It is also compatible with the legacy Aura **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)**
component providing additional action types only supported in Aura, most of which have
been now implemented in LWC at the **sfpegActionBarCmp** or **sfpegActionUtility** level.

As a baseline, it also enables to display a vertical action menu from the utility bar. 


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

When configuring a Lightning App, the **sfpegActionHandlerCmp** component may be added within the 
**Utilities** of the app. It basically requires to select one of the available **sfpegAction__mdt** 
custom metadata records to define the set of actions to be displayed in the utility bar.

Such a configuration remains optional, only `utility` action types (see hereafter) being handled by
the component if the `Handle Notifications?` property is checked.

⚠️ **Beware** to :
* opt for automatic component launch in the App Utility Item Settings (standard `Start automatically`
checkbox in the component configuration) for the component in charge of handling the `utility` action types,
in order to properly support this feature even before having opened the action menu in the utility bar.
* check only once the `Handle Notifications?` checkbox if the component is used multiple times in the
utility bar with different action menus, in order to prevent a same action from being executed multiple
times.


## Available Action Types

In addition to all the action types available for the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
component, it offers a few console and utility bar specific ones leveraging specific LWC APIs:
* [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation) for console specific actions:
    * **openTab** to close the current tab and open a new one
    * **closeTabs** to force the closing of all (or all but current) tabs not pinned
    * **refreshTab** to refresh the content of the current tab
* [utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-utility-bar-api/documentation)
for utility bar specific actions
    * **minimize** to close the **sfpegActionUtilityCmp** component utility bar popup


### **openTab** Action Type

The **openTab** action type enables to open a target page / record according to the utility configuration 
and possibly automatically close the origin tab. 
Two options are available:
* opening as main tab and closing previous sub-tab
* opening as sub-tab and closing previous main tab

It relies on the [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation)
to determine if the current application is in console mode and execute the various tab navigation and tab
management operations.

From a **sfpegActionUtilityCmp** component, the following action configuration 
provides the ability to reopen the current record as a main tab of the console (if the object).
```
{
    "label": "Reopen",
    "name": "reopenRecord",
    "action": {
        "type": "utility",
        "params": {
            "type": "openTab",
            "params": {
                "targetId": "{{{GEN.recordId}}}",
                "targetObject": "{{{GEN.objectApiName}}}",
                "isTargetMain": true
            }
        }
    }
}
```

⚠️ The `isTargetMain` property enables to alter the sequence of operations between closing the current
tab and opening the same record in the new tab.
* when `true`, the new tab os opened according to the console navigation setting and the existing tab closed afterwards
(it also works when the existing sub-tab is not sub-tab of the proper main record).
* when `false`, the operations are executed in the other way, to cope with unexpected console behaviour when
the record is originally a main tab (navigation settings being bypassed and the existing main tab being refocused
automatically)

ℹ️ This action type is used by the **[sfpegForceNavigationCmp](/help/sfpegForceNavigationCmp.md)** component,
which enables to trigger automatic reopening of a record when not matching console navigation configuration.
It leverages additional properties also available to provide more flexibility in the the closing of original tab
and opening of target one:
* `sourceTab`: Id of the source tab to close 
* `targetPage`: [page reference](https://developer.salesforce.com/docs/platform/lwc/guide/reference-page-reference-type.html) for the new tab to open 


### **closeTabs** Action Type

The **closeTabs** action type enables to close multiple tabs of a console application at once.
Two options are available:
* closing all tabs
* closing all but the current active one.

ℹ️ In any case, pinned tabs are ignored and never closed.

It relies on the [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api/documentation) to get the list of all open tabs and their
statuses (pinned, active).

From a **sfpegActionUtilityCmp** component, the following action configuration 
provides the two options.
```
{
    "label":"Close Tabs", "name":"closeAllTabs",
    "action":{
        "type":"closeTabs",
        "params":{
            "closeAll":true
        }
    },
    "next":{
        "type":"minimize"
    }
},
{
    "label":"Close All other tabs", "name":"closeAllTabsButCurrent",
    "action":{
        "type":"closeTabs",
        "params":{
            "closeAll":false
        }
    },
    "next":{
        "type":"minimize"
    }
}
```

_Note_: In this example, the **minimize** action type is also used to automatically close the utility
bar menu once the **closeTabs** action is triggered.


### **refreshTab** Action Type

The **refreshTab** action type is mostly used as a _next_ property of another action type to trigger a
refresh of the current tab upon action completion.

Its is a console specific refresh applicable to record pages and has a more global reach than the **reload**
action type available directly in the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component.

It takes no argument and may be configured as follows in the `next` property of an action available
in a utility bar action menu:
```
{
    ...
    "next":{
        "type":"refreshTab"
    }
}
```

When this refresh needs to be called from an action within the pages, the **utility** notification
action may be used to request the refresh to the utility bar component (which should be configured to
receive these messages).
```
{
    ...
    "next":{
        "type": "utility",
        "params": {"type":"refreshTab"}
    }
}
```


### **minimize** Action Type

The **minimize** action type is mostly used as a _next_ property of another action type to automatically close
the utility bar menu of the **sfpegActionUtilityCmp** component once this action has been triggered.

It leverages the [utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-utility-bar-api/documentation) to execute the action.
```
    ...
    "next": {
        "type": "minimize"
    }
    ...
```

_Note_: please see the **closeTabs** action type for a more complete example.


## Configuration Examples

### Interoperation with Tab Actions (via _utility_ action type)

In order to invoke an action in the **sfpegActionHandlerCmp** component from any
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component (standalone or embedded in another
component of the **[PEG_LIST](https://github.com/pegros/PEG_LIST)**  package),
the `utility` action type should be used.

The `params` property of this action should then include the configuration of the actual action
to be executed from the utility bar.

In the following example, the action configured for the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
component of a record tab page enables to open a report within a main tab of a console App instead
of a subtab of the current record. The _navigation_ action is first transmitted to the
**sfpegActionHandlerCmp** component in the utility bar via a _utility_ action before being executed from there.

```
{
    "name": "reportXXX",
    "iconName":"utility:metrics",
    "label":"{{{LBL.TST_ReportXXX}}}",
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


## Technical Details

The **sfpegActionHandlerCmp** component subscribes to the custom **sfpegAction** LWC Message Channel to
receive action requests from **sfpegActionBarCmp** components within the tabs/pages.

It relies on a LWC **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component to display a vertical
menu accessible from the utility bar.

It is included in the Aura **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** component
and provides then additional Aura supported action types. When configuring the utility items of an App,
only one of these two components (**sfpegActionUtilityCmp** or **sfpegActionHandlerCmp**) should thus be
included.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.