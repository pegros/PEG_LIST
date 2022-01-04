---
# sfpegActionHandlerCmp Component
---

## Introduction

The **sfpegActionHandlerCmp** component is bascially the same as the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
but includes some specific behaviours specific to the utility bar.<br/>
![Action utility](/media/sfpegActionUtility.png) 

This LWC component is dedicated to the utility bar and enables to execute actions from this context.
* its primary purpose is to execute _navigate_ actions from the utility bar, which
automatically enforces the Navigation Rules configured for the console App
instead of systematically opening the new page as a subtab of the current main tab
* it is also used to forward actions to the Aura **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)**
component providing additional action types only supported in Aura.

As a baseline, it also enables to display a vertical action menu from the utility bar. 


## Component Configuration

When configuring a Lightning App, the **sfpegActionHandlerCmp** component may be added within the 
**Utilities** of the app. It basically requires to select one of the available **sfpegAction__mdt** 
custom metadata records to define the set of actions to be displayed in the utility bar.

Such a configuration remains optional, only _utility_ action types (see herefafter) being handled by
the component by default. Please opt for automatic component launch in the App Builder, in order to
properly support this feature even before having opened the action menu in the utility bar.


## Configuration Examples

### Interoperation with Tab Actions (via _utility_ action type)

In order to invoke an action in the **sfpegActionHandlerCmp** component from any
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component (standalone or embedded in another
component of the **[PEG_LIST](https://github.com/pegros/PEG_LIST)**  package),
the _utility_ action type should be used.

The _params_ property of this action should then include the configuration of the actual action
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
