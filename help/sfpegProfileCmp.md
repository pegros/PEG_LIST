---
# sfpegProfileCmp Component
---

## Introduction

The **sfpegProfileCmp** component displays an actionable graphical summary of a record, with various lists of fields. Its appearance may be tailored to various use cases:
* Complete profile

![Complete Profile!](/media/sfpegProfile.png) 

* Details only Profile

![Profile with only details!](/media/sfpegProfileDetails.png)

* Profile in Brand Variant

![Profile with variant!](/media/sfpegProfileInverse.png) 

**sfpegProfile** custom metadata records provide the main configurations for the this component, **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** action configuration records being possibly used as well.

The **sfpegProfileCmp** component exclusively relies on the [lightning-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation) standard component to fetch all 
necessary data to display the required field values, image and icon names. This requires all data to be defined on accessible (possibly formula) fields of the current record to be displayed or fetched via [lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) standard components.

It also relies on the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component to display field icons instead of names if needed.


## Component Configuration

**sfpegProfile** custom metadata records provide the configuration for the **sfpegProfileCmp** components
* the optional banner background image (blue zone)
* the optional avatar image (black zone)
* the optional header content (orange zone), with a top badge, a title and a set of detail fields below
* the optional action bar (grey zone)
* the optional detailed content (red zone) containing a set of detail fields with various possible layout variants

![Profle Component Layout!](/media/sfpegProfileLayout.png) 

Some elements are configurable directly in the App Builder, mainly the custom metadata record to use but also various general layout options (such as size, padding, actions alignment, inverse text display mode...). 
[Image: Screenshot 2021-09-13 at 19.01.24.png]
Within the custom metadata, each profile element has its own configuration field:

* profile “banner” and “avatar” may be static (i.e. same value for all instances) or dynamic (leveraging e.g. a record formula field) 
    * In any case, the attribute should contain the name of a file available within the *sfpegBanners or sfpegAvatars* static resources
    * Custom .jpg or .png image files need to be added to these static resources prior to being referenced in this configuration.
* profile “header” is a simple JSON object containing 3 possible properties:
    * the record field API name to use for the badge
    * the record field API name for the title
    * the list of record field API names for the header details (below the title) 
* profile “actions” is the name of a *pegAction__mdt* record providing the action bar configuration to be used
* profile “details” ia a JSON object containing
    * a display variant, which may be “list”, “base”, “media” or “table”
    * the list of fields to display
        * as a list of record field API names for all variants but “media”
        * as a list of JSON objects with  “iconName” and “fieldName” properties set, mandatory for the “media” variant.
    * other display configuration options,  such as the number of columns for field layout (for all variants but “list”)

![Profle Component CConfiguration!](/media/sfpegProfileConfigMeta.png) 

Hereafter is a configuration example for Profile details in “media” display mode
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


