---
# sfpegKpiListCmp Component
---

## Introduction

The **sfpegKpiListCmp** component displays an actionable list of KPI field values in a structured and  graphical way.

![List of KPIs!](/media/sfpegKpis.png)


## Global KPI List Configuration (**sfpegKpiList__mdt)**

**sfpegKpiList__mdt** custom metadata records provide the main configurations for the **sfpegKpiListCmp** components (content and display of groups of individual KPI widgets), **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** action configuration records being possibly referenced in them if group or KPI level actions are needed.

A **sfpegKpiListCmp** basically displays :
* a list of KPI groups having their own header (orange zone) containing optional icons, titles and a actions
* a sublist of KPI display widgets (e.g. blue zone) displaying an icon (possibly dynamic), a main KPI (in bold), a main KPI label (above) and a set of details (on the right of the main KPI).
![KPI List Layout!](/media/sfpegKpiLayout.png)

This component exclusively relies on the [lightning-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation) standard component to fetch all 
necessary data to display KPI values and icons. This requires all data to be defined on accessible 
(possibly formula) fields of the current record to be displayed or fetched via[lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) standard components.

It also relies on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component to display KPI icons and
supports most if not all of its display options (including action trigger).

Configuration is quite straigthforward in the App Builder, basically requiring to select a 
**sfpegKpiList__mdt** record and setting some additional display parameters (e.g. warpping CSS class).
![KPI List App Builder Configuration!](/media/sfpegKpiConfiguration.png)

In the **sfpegKpiList__mdt** custom metadata record, most of the confguration relies in the _DisplayConfig_ property, containing a list of KPI group configurations, each one consisting in:
* a _header_ with
    * _label_ and _icon_ properties to display in the header title
    * a _size_ property to control the width of the component (in sub-units of a 12 column grid)
    * an optional _actions_ property to display a set of actions (with the name of an applicable 
    **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** ccustom metadata record)
* a list of _kpis_ configuration items containing
    * a main KPI (via the _name_  property containing a record field API name),
    * an _icon_ object with
        * with either _name_ (for a static icon name) or _fieldName_ (for a dynamic name provided by a record field) property set to 
        * with similar optional _variant_/_variantField_ and _value_/_valueField_ properties to 
        customise the icon appearance (availability depending on the icon type)
        property 
        * an optional _size_ property to tune its display size
    * an optional _label_ (static) displayed above the 
    * an optional _action_  name (triggered via the icon, referencing an action _name_ which should be in 
    the list configured in the _actions_ property of the group)
    * an optional list of _related” KPIs displayed next to teh main KAPI in a small font size (as
    a list of record field API names).


## Full Configuration Example (**sfpegKpiList__mdt)**

To implement a layout the one below, the following configuration actions should be applied
![KPI List Example!](/media/sfpegKpiListExample.png)

* create a *sfpegKpiList* custom metadata record with the following DisplayConfig property
```
{
  "groups": [
  {
    "label": "Situation",
    "icon":{"name":"custom:custom18"},
    "iconName": "custom:custom19",
    "border": true,
    "size":"12",
    "actions":"newsActions",
    "kpis": [
    {
      "name": "Ratio__c",
      "label": "Ratio",
      "icon":{
        "name":"dynamic:strength",
        "valueField":"ViewScore__c"},
      "title": "Ratio",
      "action":"edit",
      "related":["ViewScore__c"]
    },
    {
      "name": "Views__c",
      "label": "Views",
      "icon":{
        "name":"dynamic:progress",
        "valueField":"ViewsRatio__c",
        "size":"large",
        "variant":"base-autocomplete"},
      "title": "Views"
    },
    {
      "name": "Ratio__c",
      "label": "Ratio #2",
      "icon":{
        "fieldName":"RatioIcon__c",
        "variantField":"RatioVariant__c",
        "size":"large"},
      "title": "Views"
    },
    {
      "name": "Ratio__c",
      "label": "Ratio #3",
      "icon":{
        "name":"utility:record",
        "variantField":"RatioVariant__c",
        "size":"large"},
      "title": "Views"
    }]
  }]
}
```

* define the *sfpegAction* record with the name referenced in the _actions_ property ("newsActions" here)
needed for the KPI groups with the following _DisplayConfig_ property. Each action mentioned on a KPI
should be a valid action _name_ of the referenced action configuration.
```
[
  { "name":"open", "iconName":"utility:open", "title":"Open",
    "action":{"type":"open"}},
  { "name":"edit","iconName":"utility:edit", "title":"Edit",
    "action":{"type":"edit"}},
  { "name":"openArticle","iconName":"utility:preview","title":"View Article",
    "action":{
      "type":"navigation",
      "params":{
        "type": "standard__recordPage",
        "attributes": {
          "recordId": "{{{ROW.Article__c}}}",
          "actionName": "view"
        }
      }
    }
  },...
 ]
```

* drag and drop the *SF PEG KPI List* component and select the proper *sfpegKpiList* record in the cconfiguration dropdown (here newsKpis).
![KPI List App Builder Configuration!](/media/sfpegKpiConfiguration.png)
