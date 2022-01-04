---
# sfpegMessageListCmp Component
---

## Introduction

The **sfpegMessageListCmp** component displays a conditional, contextualised and actionable list of end-user messages with customisable styles.

![List of messages](/media/sfpegMessages.png)

It may even be used to keep track of process progress via dynamic icons and progress bar.

![List of messages with dynamic icons](/media/sfpegMessageExample.png)

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component to contextualise
the messages via merge tokens and on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** display component
to display a wide range of static or dynamic icons.

It also uses the standard [lightning-progress-indicator](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-indicator/documentation) and [lightning-progress-bar](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-bar/documentation) components to respectively display a progress indicator (/path) and bar.


## Component Configuration

The **sfpegMessage__mdt** custom metadata provides the configuration for the components (list of 
messages with display style, activation conditions and actions). Each message consists in:
* a title contextualised text (blue zone)
* an optional progress bar or indicator (not shown here, between title and message)
* an optional contextualised message text (green zone)
* a optional (possibly dynamic) icon (red zone)
* an optional action button (orange zone)

![Message List Layout!](/media/sfpegMessageLayout.jpg)

As a baseline, a message list is configured in the _Message Display_ attribute of a **sfpegMessage** 
custom metadata record attribute as a JSON list of message configuration items, each consisting in:
* a _header_ property containing the main message to display 
* a _message_ property containing additional detailed information about the  message
* a _variant_ property to set the style to apply to the message (i.e. one of the following ones:
_base_, _notif_, _info_, _infoLight_, _warning_, _warningLight_, _error_, _errorLight_, _success_,
_successLight_)
* some additional properties to override the default variant settings (_iconName_, _iconSize_,
_iconVariant_, _iconValue_)
* a possible fixed _size_ in number of columns within a 12 column grid (12 meaning 100% of the width, no size letting the message grow according to its content)
* an optional _path_ or _progress_ property to display a progress bar / indicator between header and message
* an optional action button via an _action_ property containing at least  the _name_ of an action (registered in the **[sfpegAction](/help/sfpegActionBarCmp.md)** custom metadata record referenced via the _Message Actions_ attribute) and a _label_ or _iconName_
* optional display conditions via the _isHidden_ property which may include formulas evaluated at runtime by the component (no need to define custom formula fields on the User or current Object).

![Message List Configuration!](/media/sfpegMessageConfigMeta.png)

If actions are used in the message list, a ***pegAction** custom metadata record name must be specified in the _Message Actions_ attribute. This record should contain all the actions possibly triggered by the message list.

This component leverages the **sfpegIconDsp** base component to display icons. Custom SVG icons or dynamic pnes may then be referenced within the message configuration in additional to all standard SLDS ones.

## Configuration Example

For the following example

![List of messages with dynamic icons!](/media/sfpegMessageExample.png)

the _Message Display_  of the custom metadata record should be configured as follows:

```
[
    {
        "iconVariant":"base-autocomplete",
        "iconName":"dynamic:progress",
        "iconValue":{{{RCD.ViewsRatio__c}}},
        "iconTitle":"Current value is {{{RCD.Views__c}}}",
        "header":"This is a progress ring option at {{{RCD.ViewsRatio__c}}}%",
        "message":"Current value is {{{RCD.Views__c}}}",
        "iconSize":"large",
        "action":{"name":"edit","title":"EDIT","iconName":"utility:edit"},
        "path": {
            "value": "{{{RCD.Status__c}}}", "title": "Current value is {{{RCD.Status__c}}}",
            "type": "base", "variant":"shaded",
            "steps": [
                {"label":"Draft","value":"Draft"},
                {"label":"Under Review","value":"Under Review"},
                {"label":"Live","value":"Live"},
                {"label":"Archived","value":"Archived"}
            ]
        },  
        "size":12
    },
    {
        "iconName":"dynamic:score",
        "iconValue":"positive",
        "iconSize":"large",
        "header":"This is a score option",
        "size":6,
        "iconTitle":"Current score is positive"
    },
    {
        "iconName":"dynamic:strength",
        "iconSize":"large",
        "iconValue":"{{{RCD.ViewScore__c}}}",
        "header":"This is a strength option",
        "iconTitle":"Current strength is {{{RCD.ViewScore__c}}}",
        "size":6
    },
    {
        "iconName":"dynamic:trend",
        "iconSize":"large",
        "iconValue":"up",
        "header":"This is a trend option",
        "iconTitle":"Current trend is neutral",
        "progress":{
            "value":"{{{RCD.ViewsRatio__c}}}",
            "variant":"circular",
            "title":"Current value is {{{RCD.ViewsRatio__c}}}%",
            "class":"slds-progress-bar__value_success"
        },
        "message":"These elements are still missing",
        "action":{"name":"edit","iconName":"utility:edit","title":"EDIT","iconSize":"small","variant":"brand"},"size":12
    }
]
```