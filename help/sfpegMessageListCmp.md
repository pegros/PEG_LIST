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

---

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
* `header`: main rich text message to display 
* `message`: additional rich text message information
* `variant`: global style to apply to the message
    * i.e. _base_, _notif_, _info_, _infoLight_, _warning_, _warningLight_, _error_, _errorLight_, _success_, _successLight_
    * variant settings being possibly overriden by explicit specific properties, such as `iconName`, `iconSize`, `iconVariant`, `iconValue`, `msgClass`
* `size` (optional): width of the message as part of a 12 column grid (12 meaning 100% of the width, no size letting the message grow dynamically according to its content)
* `path` or `progress` (optional): activates the display of a progress bar / indicator between header and message
    * see examples below for details, configuration being based on the standard Lightning base component displayed
* `action` (optional): activates the display of an action button via a JSON action definition containing:
    * the `name` of one action registered in the **sfpegAction__mdt** referenced in the main _Message Actions_ property
    * a `label` or `iconName` for the button
* `isHidden` (optional): display condition for message, which should have a boolean value but may be alternatively defined as a string containing a Javascript formula evaluated at runtime by the component (no need then to define custom formula fields on the User or current Object).

If actions are used in the message list (via the _action_ message property), a **sfpegAction__mdt** custom metadata record name
must be specified in the `Message Actions` property.
* This record should contain all the actions possibly triggered by the message list.
* see **[sfpegAction](/help/sfpegActionBarCmp.md)** for details about available actions

_Notes_: 
* Context merge is systematically applied to the _Message Display_ property upon initial load/refresh (see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component) to adapt the messages / display conditions to the display environment.
* This component leverages the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component to display icons. Custom SVG icons or dynamic ones may thus be referenced within the message configuration in addition to all standard SLDS ones.
* **Beware** to leverage fields that are safe in your `isHidden` conditions, as a possibly unsecure Javascript `eval()` statement when a string property is provided.

---

## Configuration Example

### Dynamic Process Validation Messages

One typical use case in a process oriented record page is to display warnings each time a stage
is reached without all recommended or mandatory data filled in.

![Missing Data Warnings in Process](/media/sfpegMessageProcess.png)

By carefully setting `isHidden` properties according to the process stage and validation
conditions to move ahead, it is possible to rapidly inform users about important missing
information to finalize the process. 
```
[
    {
        "variant": "warningLight",
        "size": "12",
        "header": "Attention: Canaux non sélectionnés!",
        "message": "Veuillez sélectionner a minima un canal principal à l'étape <b>Canaux</b>.",
        "isHidden": "'{{{RCD.Stage__c}}}' == 'CHANNEL' || '{{{RCD.SelectedChannels__c}}}' == ''"
    },
    {
        "variant": "warningLight",
        "size": "12",
        "header": "Attention: Date d'envoi invalide!",
        "message": "Merci de renseigner une date inférieure à la date de fin de la campagne mère et supérieure à la date du jour",
        "isHidden": "'{{{RCD.Stage__c}}}' != 'SEND' || '{{{RCD.ScheduledDate__c}}}' ==''"
    },
    {
        "variant": "warningLight",
        "size": "12",
        "header": "Attention: Pas de cibles sélectionnées!",
        "message": "Veuillez ajouter a minima un membre à la campagne à l'étape <b>Sélection cible</b>.",
        "isHidden": "'{{{RCD.Stage__c}}}' != 'SEND' || '{{{RCD.Stage__c}}}' != 'TARGET' || {{{RCD.TargetNumber__c}}} > 0"
    }
]
```

_Note_: These messages may be combined with a dynamic ***Next*** Action (see **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**)
to navigate between process stages.


### Message with Dynamic Icons

For the following example,<br/>
![List of messages with dynamic icons](/media/sfpegMessageExample.png)

the `Message Display` property of the custom metadata record should be configured as follows:
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

_Note_: the `value` of a _progress_ or _path_ widget and the `iconValue` of a _dynamic icon_ may be computed
via a formula field but should follow the format expected by the underlying Lightning base component.
See technical section for links to the appropriate sub-component used to get more detailed information.
Beware that some values are text ones and others numbers.


### Simple Custom Page Header

In the following test example, there is a single message presenting a summary of the current record, e.g.
for a Community in which the Record Type of the object should be emphasized instead of the Salesforce 
Object Name.<br/>
![Simple Header Message](/media/sfpegMessageHeader.png)

the `Message Display` property of the custom metadata record should be configured as follows:
```
[{
    "variant":"base",
    "header":"{{{RCD.RecordType.Name}}} > {{{RCD.Name}}}",
    "iconName":"standard:account",
    "iconSize":"medium",
    "size":12,
    "msgClass":"slds-text-heading_large slds-text-title_bold"
}]
```

The `Wrapping CSS` Builder configuration parameter is set to the following value:
```
slds-box slds-box_small slds-theme_default 
```


---

## Technical Details

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component to contextualise
the messages via ***merge tokens*** and on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** display component
to display a wide range of static or dynamic icons.

It also uses the standard
[lightning-progress-indicator](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-indicator/documentation) and
[lightning-progress-bar](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-bar/documentation)
base components to respectively display a progress indicator (steps or path) and progress bar.
