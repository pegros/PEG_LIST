# ![Logo](/media/Logo.png) &nbsp; **sfpegIconDsp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegIconDsp.md).


## Introduction

The **sfpegIconDsp** component is a pure display and interaction component enabling
to easily display various types of icons while masking the underlying technical
implementation variations.

It mainly relies on the standard [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) component to display standard [SLDS icons](https://www.lightningdesignsystem.com/icons/) or custom SVG icons from:
* the **sfpegIcons** static resource if the `resource:` prefix is used in the
icon name
* the **sfpegFlagIcons** static resource if the `flag:` prefix is used in the
icon name

If the _dynamic:_ prefix is used, it may also use the
[lightning-dynamic-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-dynamic-icon/documentation)
standard component (in _score_, _strength_ or _trend_ types, e.g. as `dynamic:score`) or the
[lightning-progress-ring](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-ring/documentation)
one (if `dynamic:progress` name is used).
In such a case, a _iconValue_ property should be set to control the actual display state of the icon/progress bar.
 
This component is used in the following components:
* **[sfpegListCmp](/help/sfpegListCmp.md)**
* **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)**
* **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)**


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 


### Display Configuration Options

The following display parameters may be set on a **sfpegIconDsp** component
* `iconName` to provide the actual icon name to display as _prefix:name_ as in SLDS
* `iconSize` to provide its size (small being default if applicable)
* `iconVariant` to provide its variant (if applicable, depending on the icon type)
* `iconTitle` to set a title on the icon (displayed upon hovering)
* `iconValue` to set the current value state of the icon (for dynamic icon type)
* `isDebug` to activate the console logs of the component (for debug)

```
<c-sfpeg-icon-dsp   icon-name={iconName}
                    icon-title={iconTitle}
                    icon-size={iconSize}
                    icon-variant={iconVariant}
                    icon-value={iconValue}          
                    is-debug={isDebugFine}>
</c-sfpeg-icon-dsp>
```

As icon names, the following options are supported
* **SLDS icons** such as `utility:check`, `custom:custom12`, `standard:account`...,
`iconVariant` property being available only for `utility` ones
* **custom icons** as `resource:<iconName>` where each `<iconName>` should reference
a SVG icon sprite in the **sfpegIcons** static resource (see further below)
* **custom flag icons** as `flag:<countryCode>` where each `<countryCode>` should reference
a valid ISO2 country code or a custom registered for specific flags in the **sfpegFlagIcons** static resource (see further below)
* **dynamic icons** either `dynamic:score`, `dynamic:strength` or `dynamic:trend` with a
required `iconValue` (corresponding to the `option` of the underlying **lightning-dynamic-icon**)
but no `iconSize` nor `iconVariant` properties
* dynamic **progress rings** as `dynamic:progress` with a
required `iconValue` and optional `iconSize` and `iconVariant` properties.


### Action Configuration

If the `actionName` property in set of the component, an `action` LWC event is triggered each time the
user clicks on the icon. The CSS is then adapted to highlight that the icon is clickable.

Such an event should be handled by setting the `onaction` handler on the component.<br/>
```
<c-sfpeg-icon-dsp   icon-name={iconName}
                    action-name={iconAction}
                    onaction={handleIconAction}  >
</c-sfpeg-icon-dsp>
```


### Custom Icons Extension (via Static Resource)

The **sfpegIcons** static resource contains all the custom SVG icons usable in the other components
via the `resource:xxxx` syntax. If new icons are required, new SVG definitions may be added in the
static resource for the new icon in all target sizes.

⚠️ **Beware** when deploying new versions of the package on an Org where your have modified this 
static resource as it will be overridden!
Please retrieve first a copy of the previous version before deploying the new package version and
redeploy the first copy (or a merge with the new version) afterwards.

The content of the static resource is easily accessible via the first tab of the
**sfpegIconCatalog** App page.
![Icon Catalog Page](/media/sfpegIconCatalogIcons.png)

In the following example, the `resource:total` icon is defined in both medium and small formats.
* the id of the sprite is built following the `<iconName>-<iconSize>` format
* In order to reuse an original SVG defined in other sizes, a transformation is applied to scale and
translate the original SVG directives for a proper display. The general viewBox is in a `0 0 100 100`
configuration and target sizes for medium and small sizes are respectively `32px` and `24px`.
* The stroke color has to be explicitely specified (as it is not inherited from the containers) and
the stroke-width may also be adapted to the size.

```
<g id="total-medium" transform="scale(0.08) translate(-256.6798,-531.7963)" stroke="#a42a25">
    <g fill="none" fill-rule="evenodd" stroke-width="10" >
        <path d="m 340.80927,575.52393 h 198.63281 l 5.27344,66.60156 h -7.42188 q -1.36719,-19.72656 -6.64062,-30.07813 -5.27344,-10.54687 -14.45313,-15.23437 -9.17969,-4.6875 -29.10156,-4.6875 h -90.42969 l 80.66406,103.51562 -91.79687,108.39844 h 100.58594 q 27.34375,0 41.79687,-8.78906 14.45313,-8.78906 21.67969,-36.71875 l 7.42187,1.75781 -11.32812,80.07813 H 340.80927 v -7.03125 L 442.76239,713.02393 340.80927,582.55518 Z" />
    </g>
</g>
<g id="total-small" transform="scale(0.06) translate(-256.6798,-531.7963)" stroke="#a42a25">
    <g fill="none" fill-rule="evenodd" stroke-width="10" >
        <path d="m 340.80927,575.52393 h 198.63281 l 5.27344,66.60156 h -7.42188 q -1.36719,-19.72656 -6.64062,-30.07813 -5.27344,-10.54687 -14.45313,-15.23437 -9.17969,-4.6875 -29.10156,-4.6875 h -90.42969 l 80.66406,103.51562 -91.79687,108.39844 h 100.58594 q 27.34375,0 41.79687,-8.78906 14.45313,-8.78906 21.67969,-36.71875 l 7.42187,1.75781 -11.32812,80.07813 H 340.80927 v -7.03125 L 442.76239,713.02393 340.80927,582.55518 Z" />
    </g>
</g>
```

Please refer to the standard [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) component for more details about how custom icons work.


### Custom Flag Icons Extension (via Static Resource)

The **sfpegFlagIcons** static resource contains SVG flag icons usable
in the other components via the `flag:XX` syntax. By default, it includes
the flags for all official ISO countries in `small`, `medium`and `large` sizes.
SVG flag icons are indexed by ISO2 country code  and size (e.g. `FR-medium`
for the medium French flag).

If new flags are required, new SVG definitions may be added in the static
resource for the new icon in all target sizes.

The list of countries is available in 2 `Global Value Sets`:
* **sfpegCountries** enables to define custom country picklists (as the standard
Salesforce ne may not be reused),only English labels being provided for now.
* **sfpegCountryCodes** enables to convert ISO3 to ISO2 codes (e.g. when ISO3
codes are used in a system integration)

A few non ISO standard country codes (with 3 or 4 digits instead of 2) have been
added to support special flags:
* for organisations such as the UNO or the European Union 
* for England, Wales and Scotland
* for some special islands having separate flags but teh same ISO code

The content of the static resource is easily accessible via the first tab of the
**sfpegIconCatalog** App page.
![Icon Catalog Page](/media/sfpegIconCatalogFlags.png)

ℹ️ ISO2 country codes have been used for flag icon identification as it matches
the values stored for address country fields when enabling the standard Salesforce
_State and Country/Territory Picklists_.


## Usage Example

### Address with Flag

Leveraging the **[Message List](/help/sfpegMessageListCmp.md)** component of the 
**[sfpegList-extensions](/help/sfpegListPkgExtensions.md)** unlocked package, it is
easy to display an address with the flag corresponding to the country displayed next
to it.
![Country Flag of Address](/media/sfpegIconDspFlag.png)

After having activated the standard Salesforce country and state picklists, the message
configuration is the following (e.g. for the Account object):
```
{
    "size":"12",
    "header":"Billing Address",
    "message":"{{{RCD.BillingStreet}}}<BR/>{{{RCD.BillingPostalCode}}} {{{RCD.BillingCity}}}<BR/>{{{RCD.BillingCountryCode.LBL}}}",
    "iconName":"flag:{{{RCD.BillingCountryCode}}}",
    "iconSize":"large"
}
```


## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.