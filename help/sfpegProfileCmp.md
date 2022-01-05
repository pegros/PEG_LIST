---
# sfpegProfileCmp Component
---

## Introduction

The **sfpegProfileCmp** component displays an actionable graphical summary of a record.
it enables to highlight main record information in an explicit (via field values) or
more graphical (background / avatar) way.

It provides an alternate, more graphical option to the standard Lightning **Highlights Panel**
component, emphasizing some parameters via graphical elements (background / avatar / badge),
optimising screen real estate (via condensed field value sets) and supporting the  
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** action framework (instead of quick actions).

Its appearance may be tailored to a variety of use cases, such as:
* Complete profile

![Complete Profile](/media/sfpegProfile.png) 

* Details only Profile

![Profile with only details](/media/sfpegProfileDetails.png)

* Profile in Brand Variant

![Profile with variant](/media/sfpegProfileInverse.png) 


The **sfpegProfileCmp** component exclusively relies on the
[Lightning Data Service (LDS)](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_ui_api)
to fetch all data necessary to display the profile. This thus requires all data to be defined on accessible
fields of the current record.


---

## Component Configuration

### Global Layout

The **sfpegProfileCmp** components displays an actionable summary of the current page record by providing 
the following display widgets:
* an optional banner background image (blue zone)
* an optional avatar image (black zone)
* an optional header content (orange zone), with a top badge, a title and a set of detail fields below
* an optional action bar (grey zone)
* an optional detailed content section (red zone) containing a set of detail fields with various possible layout variants

![Profile Component Layout](/media/sfpegProfileLayout.png) 


### App Builder Configuration

In the App Builder, the configuration is straightforward, most of it consisting in selecting the
appropriate **sfpegProfile__mdt** custom metadata record in the _Profile Configuration_ property.<br/>
![Profile Component App Builder Configuration](/media/sfpegProfileConfig.png) 

Various styling options are also available, such as _Wrapping CSS_, _Display Size_, _Padding Size_,
_Action Alignment_, _Inverse Mode?_ (for text color).


### Metadata Configuration

The **sfpegProfile__mdt** custom metadata provides most if not all configuration for the
**sfpegProfileCmp** components.<br/>
![Profile Configuration](/media/sfpegProfileConfigMeta.png)

The following properties are available to configure the different profile widgets:
* _Profile Banner_ defines the name of the background image to display
    * Its value may be a static text (i.e. same value for all component instances)
    * A dynamic behaviour (i.e. value depending on the page record) may be defined instead, in which case its value should be a JSON object providing the record _fieldName_ (e.g. a formula field) used to get the image name (as `{"fieldName":"<fieldApiName>"}`)
    * The resulting image name should match one of the files available within the **sfpegBanners** static resource.
    * Custom `.jpg` or `.png` image files may added to this static resources and later referenced in this configuration.
    * No value hides the background widget.
* _Profile Avatar_ defines the name of the avatar image to display
    * It follows the same principles as _Profile Banner_ but uses the **sfpegAvatars** static resource instead.
     or sfpegAvatars* static resources
* _Profile Header_ configures the header section, as a JSON object with the following optional properties
    * _title_: record field API name to use to set header title (no value hiding the title)
    * _badge_: record field API name to use to set the badge label (no value hiding the badge)
    * _badgeClass_: SLDS classes to apply on the badge (e.g. to change its background color)
    * _details_: JSON list of record field API names to be displayed in the header details (below the title) 
    * No value hides the whole header section. 
* _Profile Actions_ enables to add a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component
    * It should contain the name of the **sfpegAction__mdt** custom metadata record to be used
    * No value hides the action bar.
* _Profile Details_ configures the content of the details section, as a JSON object with the following properties
    * _variant_: display variant, which should have one of the following possible values
        * _list_ for horizontal list of field values
        * _base_ for standard [lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) display in a grid,
        * _table_ to display field labels next to their values in a [SLDS description list](https://www.lightningdesignsystem.com/utilities/description-list/#Horizontal)
        * _media_ to display icons instead of field labels next to their values in a [SLDS media object](https://www.lightningdesignsystem.com/utilities/media-objects/)
    * _columns_: number of fields displayed per row (for all variant but _list_)
        * It should be divider of 12, as fields are displayed in a [SLDS grid](https://www.lightningdesignsystem.com/utilities/grid/).
    * _iconSize_: size of the icons displayed (for the _media_ variant)
        * it should be one of the 
    * _fields_: JSON list of record fields to be displayed
        * for all variants but _media_, it should contain field API names (i.e. JSON list of strings)
        * for the _media_ variant, it should contain JSON field definition objects with the following properties
            * _fieldName_: API name of the field
            * _iconName_: name of the icon to display (as a name supported by the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component for non-dynamic icons)

---

## Configuration Examples

### Profile Banner

Hereafter is a static configuration example for the Profile banner
```
banner4.png
```

Hereafter is a dynamic configuration example for the Profile banner
```
{ "fieldName": "Banner__c" }
```


### Profile Avatar

Hereafter is a static configuration example for the Profile avatar
```
avatar1.jpg
```

Hereafter is a dynamic configuration example for the Profile avatar
```
{ "fieldName": "Avatar__c" }
```


### Profile Header

Hereafter is a full configuration example for the Profile header
```
{
    "title": "Name",
    "badge":"KPI3__c",
    "badgeClass":"slds-badge slds-badge_inverse slds-text-color_inverse",
    "details":["KPI1__c","KPI2__c"]
}
```


### Profile Details

Hereafter is a configuration example for the Profile details in ***list*** display mode
```
{
    "variant":"list",
    "fields":["KPI4__c","Account__c","Account2__c","OwnerId","Precision__c"]
}
```

Hereafter is a configuration example for the Profile details in ***table*** display mode (with _columns_ property set)
```
{
    "variant":"table",
    "columns":3,
    "fields":["KPI4__c","Account__c","Account2__c","OwnerId","Precision__c"]
}
```

Hereafter is a configuration example for the Profile details in ***media*** display mode (with _iconName_ properties set)
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

---

## Technical Details

The **sfpegProfileCmp** component exclusively relies on the [lightning-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation) standard component to fetch all 
necessary data to display the required field values, image and icon names. This requires all data to be defined on accessible (possibly formula) fields of the current record to be displayed or fetched via [lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) standard components.

It also relies on 
* a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component to display the action bar 
* **[sfpegIconDsp](/help/sfpegIconDsp.md)** components to display field icons instead of names if needed.
