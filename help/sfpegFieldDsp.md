# ![Logo](/media/Logo.png) &nbsp; **sfpegFieldDsp** Component

## Introduction

The **sfpegFieldDsp** component is a pure display component enabling
to easily display various types of fields while masking the underlying technical
implementation variations.

It mainly relies on the different standard base ***lightning-formated-...*** components to display
field values according to their types, with a possible title displayed upon hovering.

It is used in many components, especially the **sfpegTileDsp** and **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)**
ones.


---

## Supported Field Types

The supported type values are very similar to the ones listed for the standard 
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) component:
* _boolean_ displays a [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) depending on the value (`utility:check` if true, `utility:step` if false)
* _email_ displays a [lightning-formatted-email](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-email/documentation) with hidden icon.
* _phone_ displays a [lightning-formatted-phone](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-phone/documentation)
* _number_ displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in decimal style
* _percent_ displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in percent style, the provided value being divided by 100
* _currency_ displays a [lightning-formatted-number](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-number/documentation) in currency style with the user currency
* _date_ and _dateLocal_ displays a [lightning-formatted-date-time](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-date-time/documentation) 
* _dateTime_ displays a [lightning-formatted-date-time](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-date-time/documentation) with day, month, year in numeric format and hour, minute in 2 digit format
* _richText_ displays a [lightning-formatted-rich-text](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-rich-text/documentation) 
* _text_ (default) displays a [lightning-formatted-text](https://developer.salesforce.com/docs/component-library/bundle/lightning-formatted-text/documentation) 
