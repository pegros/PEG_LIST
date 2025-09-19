# ![Logo](/media/Logo.png) &nbsp; **sfpegFieldDsp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegFieldDsp.md).


## Introduction

The **sfpegFieldDsp** component is a pure display component enabling
to easily display various types of fields while masking the underlying technical
implementation variations.

It mainly relies on the different standard base ***lightning-formated-...*** components to display
field values according to their types, with a possible title displayed upon hovering.

It is used in many components, especially the **sfpegTileDsp** and **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)**
ones.


## Supported Field Types

The supported type values are very similar to the ones listed for the standard 
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) component:
* `boolean` displays a [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) depending on the value (`utility:check` if true, `utility:step` if false)
* `email` displays a [lightning-formatted-email](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-email/documentation) with hidden icon.
* `phone` displays a [lightning-formatted-phone](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-phone/documentation)
* `number` displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in decimal style
* `percent` displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in percent style, the provided value being divided by 100
* `currency` displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in currency style with the user currency
* `date` and `dateLocal` displays a [lightning-formatted-date-time](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-date-time/documentation) 
* `dateTime` displays a [lightning-formatted-date-time](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-date-time/documentation) with day, month, year in numeric format and hour, minute in 2 digit format
* `richText` displays a [lightning-formatted-rich-text](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-rich-text/documentation) 
* `text` (default) displays a [lightning-formatted-text](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-text/documentation) 


## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.