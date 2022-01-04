---
# sfpegMessageListCmp Component
---

## Introduction

The **sfpegMessageListCmp** component displays a conditional, contextualised and actionable list
of end-user messages with customisable styles.

It may be used to display conditional contextual warnings or information messages, with a possible
call-to-action via a dedicated action button.<br/>
![List of messages](/media/sfpegMessages.png)

It may be also used to highlight a gradation in a KPI and track the progress of a process,
via dynamic icons and embedded progress bar.<br/>
![List of messages with dynamic icons](/media/sfpegMessageExample.png)


## Component Configuration

### Global Layout

The **sfpegMessageListCmp** component displays a variable list of messages (depending on
conditions evaluated within the component), each message consisting in:
* a title contextualised text (blue zone)
* an optional progress bar or progress indicator (not shown here, between title and message)
* an optional contextualised message text (green zone)
* a optional (and possibly dynamic) icon (red zone)
* an optional action button (orange zone)

![Message List Layout](/media/sfpegMessageLayout.jpg)


### App Builder Configuration

In the App Builder, the configuration of the **sfpegMessageListCmp** component is pretty simple
and mainly relies on selecting an applicable **sfpegMessage__mdt** custom metadata configuration
record in the _Message Configuration_ property.<br/>
![App Builder Message List Configuration](/media/sfpegMessageConfig.png)

Additional properties enables to fine tune its display
* setting a CSS for the wrapping div (leveraging standard SLDS classes)
* activating debug mode


### Metadata Configuration

The **sfpegMessage__mdt** custom metadata provides most if not all configuration items for 
the **sfpegMessageListCmp** components.

Its main property is _Message Display_ which contains a JSON list of message definitions.<br/>
![Message List Configuration](/media/sfpegMessageConfigMeta.png)

Each message definition is a JSON object with the following properties:
* _header_: main rich text message to display 
* _message_: additional rich text message information
* _variant_: global style to apply to the message
    * i.e. _base_, _notif_, _info_, _infoLight_, _warning_, _warningLight_, _error_, _errorLight_, _success_, _successLight_)
    * variant settings being possibly overriden by explicit specific properties, such as _iconName_, _iconSize_,_iconVariant_, _iconValue_
* _size_ (optional): width of the message as part of a 12 column grid (12 meaning 100% of the width, no size letting the message grow dynamically according to its content)
* _path_ or _progress_ (optional): activates the display of a progress bar / indicator between header and message
    * see examples below for details, configuration being based on the standard Lightning base component displayed
* _action_ (optional): activates the display of an action button via a JSON action definition containing:
    * the _name_ of one action registered in the **sfpegAction__mdt** referenced in the main _Message Actions_ property
    * a _label_ or _iconName_ for the button
* _isHidden_ (optional): display condition for message, which should have a boolean value but may be defined as a Javascript formula evaluated at runtime by the component (no need to define custom formula fields on the User or current Object).

If actions are used in the message list (via the _action_ message property), a ***pegAction__mdt** custom metadata record name must be specified in the _Message Actions_ property.
* This record should contain all the actions possibly triggered by the message list.
* see **[sfpegAction](/help/sfpegActionBarCmp.md)** for details about available actions

_Notes_: 
* Context merge is systematically applied to the _query input_ property upon initial load/refresh (see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component) to adapt the query context to the display environment.
* This component leverages the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component to display icons. Custom SVG icons or dynamic ones may thus be referenced within the message configuration in addition to all standard SLDS ones.


## Configuration Example

### Message with Dynamic Icons

For the following example<br/>
![List of messages with dynamic icons](/media/sfpegMessageExample.png)

the _Message Display_ property of the custom metadata record should be configured as follows:
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

## Technical Details

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component to contextualise
the messages via _merge tokens_ and on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** display component
to display a wide range of static or dynamic icons.

It also uses the standard
[lightning-progress-indicator](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-indicator/documentation) and
[lightning-progress-bar](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-bar/documentation)
base components to respectively display a progress indicator (steps or path) and progress bar.
