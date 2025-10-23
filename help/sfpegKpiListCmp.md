# ![Logo](/media/Logo.png) &nbsp; **sfpegKpiListCmp** Component

This component is part of the [`sfpegList-extensions`](/help/sfpegListPkgExtensions.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegKpiListCmp.md).


## Introduction

The **sfpegKpiListCmp** component displays an actionable list of KPI field values in a structured
and graphical way. It enables to display key information in a very dense format, grouping KPIs
by business/functional domains.

![List of KPIs](/media/sfpegKpis.png)

Such a grouping is optional and a single list of KPIs may be used.

![Simple List of KPIs](/media/sfpegKpisSingle.png)

Actions may be defined per group and activated on a per KPI basis (the icon next to the main KPI
becomes actionable), e.g. to redirect the user to a related list or a filtered report.

For each KPI, custom or dynamic icons may be chose, leveraging the features offered by the
**[sfpegIconDsp](/help/sfpegIconDsp.md)** display component.

For performance purposes, the **sfpegKpiListCmp** component exclusively relies on the standard
[lightning-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)
base component to fetch all necessary data to display KPI values and icons.
This requires all data to be defined on accessible (possibly formula) fields of the current record
to be displayed or fetched via standard
[lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) base components.


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

### Global Layout

A **sfpegKpiListCmp** basically displays :
* a list of KPI groups having their own header (orange zone) containing optional icons, titles and a actions
* a sublist of KPI display widgets (e.g. blue zone) displaying an icon (possibly dynamic), a main KPI (in bold), a main KPI label (above) and a set of details (on the right of the main KPI).

![KPI List Layout](/media/sfpegKpiLayout.png)


### App Builder Configuration

Configuration is quite straigthforward in the App Builder, basically requiring to select an
existing **sfpegKpiList__mdt** custom metadata configuration record and setting some additional
display parameters (e.g. SLDS CSS classes for the wrapping div).
![KPI List App Builder Configuration](/media/sfpegKpiConfiguration.png)


### Metadata Configuration

**sfpegKpiList__mdt** custom metadata records provide the main configurations for the **sfpegKpiListCmp**
components.

All of the confguration lies in the `Display Config` property, which should contain a JSON list
of KPI group definitions, each one consisting in:
* a `header` with
    * `label` and `iconName` properties to display in the header title
    * a `size` property to control the width of the group container within the component (in sub-units of a 12 column grid)
    * an optional `kpiAlign` property to override the layout of the list of individual
    KPIs within the group (`middle` by default but may be set to `start` to align left or
    `end` to align right) 
    * an optional `actions` property to display an action bar in the group header (with the name of an applicable 
    **sfpegAction__mdt** custom metadata record, see **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for details),
    with additional `actionMaxSize` and `actionHidden` parameters to control actual display of the action bar.
* a list of `kpis` configuration items containing
    * a main KPI (via the `name`  property containing a record field API name),
    * an `icon` object with
        * with either `name` (for a static icon name) or `fieldName` (for a dynamic name provided by a record field) property set to determine the icon to display. 
        * with similar optional `variant`/`variantField` and `value`/`valueField` properties to 
        customise the icon appearance (availability depending on the icon type) 
        * an optional `size` property to tune its display size
    * an optional `label` (static) displayed above the KPI value.
    * an optional `action`  name (triggered via the icon, referencing an action `name` registered in 
    the **sfpegAction__mdt** custom metadata record configured in the `actions` property of the group)
    * an optional list of `related` KPIs displayed next to the main KPI in a smaller font size (as
    a list of record field API names).

_Note_: **LBL** and **FLBL** merge tokens may be used to translate labels used in the configurations, see
dedicated section in **[sfpegMergeUtl](/help/sfpegMergeUtl.md)**.


## Additional Examples

### Full Configuration Example

To implement a layout like the one below, leveraging dynamic icons, the following configuration
actions should be applied.
![KPI List Example](/media/sfpegKpiListExample.png)

* create a **sfpegKpiList__mdt** custom metadata record with the following `Display Config` property
```
{
  "groups": [
  {
    "label": "Situation",
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
        "size":"small"},
      "title": "Views"
    },
    {
      "name": "Ratio__c",
      "label": "Ratio #3",
      "icon":{
        "name":"utility:record",
        "variantField":"RatioVariant__c",
        "size":"medium"},
      "title": "Views"
    }]
  }]
}
```

* define the **sfpegAction__mdt** record with the name referenced in the `actions` property
(`newsActions` here) needed for the KPI groups with the following `Display Config` property.
Each action mentioned on a KPI should be a valid action `name` of the referenced action configuration.
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
          "recordId": "{{{RCD.Article__c}}}",
          "actionName": "view"
        }
      }
    }
  },...
 ]
```

* drag and drop the **SF PEG KPI List** component and select the proper **sfpegKpiList__mdt** record in the configuration dropdown (here `newsKpis`).
![KPI List App Builder Configuration](/media/sfpegKpiConfiguration.png)


## Technical Details

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component to contextualise
the messages via _merge tokens_ and on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** display component
to display a wide range of static or dynamic icons.

**LBL** and **FLBL** merge tokens may be used to translate labels used in the configurations, see
dedicated section in **[sfpegMergeUtl](/help/sfpegMergeUtl.md)**.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.