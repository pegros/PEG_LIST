# ![Logo](/media/Logo.png) &nbsp; **sfpegProfileCmp** Component

This component is part of the [`sfpegList-extensions`](/help/sfpegListPkgExtensions.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegProfileCmp.md).


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


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 


### Global Layout

The **sfpegProfileCmp** components displays an actionable summary of the current page record by providing 
the following display widgets:
* an optional banner background image (blue zone)
* an optional avatar image (black zone)
* an optional header content (orange zone), with a top badge, a title and a set of detail fields below
* an optional action bar (grey zone) which may be actually located next to the header title, 
as well as a possible max. number of actions displayed to control its width
* an optional detailed content section (red zone) containing a set of detail fields with various possible layout variants

![Profile Component Layout](/media/sfpegProfileLayout.png) 

Banner and avatar images may either come from standard static resources provided by the package (**sfpegAvatars** or
**sfpegBanners**) or from standard asset files or even any related file.


### App Builder Configuration

In the App Builder, the configuration is straightforward, most of it consisting in selecting the
appropriate **sfpegProfile__mdt** custom metadata record in the `Profile Configuration` property.<br/>
![Profile Component App Builder Configuration](/media/sfpegProfileConfig.png) 

Various styling options are also available, such as `Wrapping CSS`, `Display Size`, `Padding Size`,
`Action Alignment`, `Inverse Mode?` (for text color).

_Note_: one of the possible values for the `Action Alignment` property enables to set the action bar within the header section next to the title. This is useful to optimise vertical screen consumption.


### Metadata Configuration

The **sfpegProfile__mdt** custom metadata provides most if not all configuration for the
**sfpegProfileCmp** components.<br/>
![Profile Configuration](/media/sfpegProfileConfigMeta.png)

The following properties are available to configure the different profile widgets:
* `Profile Banner` defines the name of the background image to display
    * Its value may be a static text (i.e. same value for all component instances)
    * A dynamic behaviour (i.e. value depending on the page record) may be defined instead, in which case its value should be a JSON object providing the record specific image to display via two possible properties: 
        * `fileFieldName` defines the API Name of a field providing the Salesforce ID of the file (ContentDocument) to use
        * `assetFieldName` defines the API Name of a field providing the name of and asset file to use
        * `fieldName` defines the API Name of a field providing the image file name (within the **sfpegBanners** static resource) to use
        (e.g. via a formula field based on other record properties)
        * All may be set simultaneously (e.g. as `{"fieldName":"avatar__c", "fileFieldName":"avatarFileId__c", "assetFieldName":"avatarAssetName__c"}`) in which
        case the displayed banner comes from `fileFieldName` if its value is not null on the record, then from `assetFieldName` and `fieldName` otherwise (kind of fallback mechanism).
    * Custom `.jpg` or `.png` image files may added to the **sfpegBanners**  static resource and later referenced in this configuration.
    * The **sfpegFileManagerCmp** component (see **[PEG_MISC](https://github.com/pegros/PEG_MISC)** package) may be leveraged
    to upload and register ContentDocument files on the records.
    * No value hides the background widget.
* `Profile Avatar` defines the name of the avatar image to display
    * It follows the same principles as `Profile Banner` but uses the **sfpegAvatars** static resource instead.
     or sfpegAvatars* static resources
* `Profile Header` configures the header section, as a JSON object with the following optional properties
    * `title`: record field API name to use to set header title (no value hiding the title)
    * `badge`: record field API name to use to set the badge label (no value hiding the badge)
    * `badgeClass`: SLDS classes to apply on the badge (e.g. to change its background color)
    * `details`: JSON list of record field API names to be displayed in the header details (below the title) 
    * No value hides the whole header section. 
* `Profile Actions` enables to add a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component
    * It should contain the name of the **sfpegAction__mdt** custom metadata record to be used
    * No value hides the action bar.
* `Profile Details` configures the content of the details section, as a JSON object with the following properties
    * `variant_: display variant, which should have one of the following possible values
        * `list` for horizontal list of field values
        * `base` for standard [lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation) display in a grid,
        * `table` to display field labels next to their values in a [SLDS description list](https://www.lightningdesignsystem.com/utilities/description-list/#Horizontal)
        * `media` to display icons instead of field labels next to their values in a [SLDS media object](https://www.lightningdesignsystem.com/utilities/media-objects/)
    * `columns`: number of fields displayed per row (for all variant but `list`)
        * It should be divider of 12, as fields are displayed in a [SLDS grid](https://www.lightningdesignsystem.com/utilities/grid/).
    * `iconSize`: size of the icons displayed (for the `media` variant)
        * it should be one of the 
    * `fields`: JSON list of record fields to be displayed
        * for all variants but `media`, it should contain field API names (i.e. JSON list of strings)
        * for the `media` variant, it should contain JSON field definition objects with the following properties
            * `fieldName`: API name of the field
            * `iconName`: name of the icon to display (as a name supported by the **[sfpegIconDsp](/help/sfpegIconDsp.md)** component for non-dynamic icons)


## Configuration Examples

### Profile Banner

To set the Profile banner background image, a value must be provided in the `Profile Banner` property
of the **sfpegProfile_mdt** custom metadata record. Hereafter are examples for the possible cases:
* for a static configuration (`banner4.png` being the name of one of the default image files
provided in the **sfpegBanners** static resource)
```
banner4.png
```
* for a dynamic configuration (`Banner__c` being the API name of one field, possibly a formula one,
on the current record providing the name of the image to display)
```
{ "fieldName": "Banner__c" }
```
* for no banner, simply leave the field blank.


### Profile Avatar

To set the Avatar image, a value must be provided in the `Profile Avatar` property
of the **sfpegProfile_mdt** custom metadata record. Hereafter are examples for the possible cases:
* for a static configuration (`avatar1.jpg` being the name of one of the default image files
provided in the **sfpegAvatars** static resource)
```
avatar1.jpg
```
* for a dynamic configuration (`Avatar__c` being the API name of one field, possibly a formula one,
on the current record providing the name of the image to display)
```
{ "fieldName": "Avatar__c" }
```
* for no avatar, simply leave the field blank.


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

Hereafter is a configuration example for the Profile details in `list` display mode
```
{
    "variant":"list",
    "fields":["KPI4__c","Account__c","Account2__c","OwnerId","Precision__c"]
}
```

Hereafter is a configuration example for the Profile details in `table` display mode (with `columns` property set)
```
{
    "variant":"table",
    "columns":3,
    "fields":["KPI4__c","Account__c","Account2__c","OwnerId","Precision__c"]
}
```

Hereafter is a configuration example for the Profile details in `media` display mode (with `iconName` properties set)
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


## Technical Details

The **sfpegProfileCmp** component exclusively relies on the **[lightning-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)** standard component to fetch all 
necessary data to display the required field values, image and icon names.
* This requires all data to be defined on accessible (possibly formula) fields of the current record to be displayed or fetched via **[lightning-output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation)** standard components.
* Even avatar and banner fields (for dynamic configuration) are fetched this way via hidden **lightning-output-field**.
* It is therefore not available for some specific standard Objects (see [LDS Doc](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/data_service_considerations.htm)).


It also relies on 
* a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component to display the action bar 
* **[sfpegIconDsp](/help/sfpegIconDsp.md)** components to display field icons instead of names if needed.
* the **sfpegBanners** and **sfpegAvatars** static resources respectively for banner background and avatar image display, these resources being easily extended to include any addditional custom `.jpg` or `.png` image files.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.