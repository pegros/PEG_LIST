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

It mainly relies on the standard [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) component to display standard [SLDS icons](https://www.lightningdesignsystem.com/icons/) or custom SVG icons from the **sfpegIcons** static resource if the `resource:` prefix is used in the
icon name.

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
(with its size) a SVG icon sprite in the **sfpegIcons** static resource (see further below)
* **dynamic icons** either `utility:score`, `utility:strength` or `utility:trend` with a
required `iconValue` (corresponding to the `option` of the underlying **lightning-dynamic-icon**)
but no `iconSize` nor `iconVariant` properties
* dynamic **progress rings** as `utility:progress` with a
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

The content of the static resource is easily accessible via the **sfpegIconCatalog** App page.
![Icon Catalog Page](/media/sfpegIconCatalog.png)

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


## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.