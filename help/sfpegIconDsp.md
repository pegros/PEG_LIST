---
# sfpegIconCmp Component
---

## Introduction

The **sfpegIconDsp** component is a pure display and interaction components enabling
to easily display various types of icons while masking the underlying technical
implementation variations.

It mainly relies on the standard [lightning-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-icon/documentation) component to display standard [SLDS icons](https://www.lightningdesignsystem.com/icons/) or custom SVG icons from the **sfpegIcons** static resource if the _resource:_ prefix is used in the
icon name.

If the _dynamic:_ prefix is used, it may also use the [lightning-dynamic-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-dynamic-icon/documentation) standard component (in score, strength or trend types, e.g. as _dynamic:score_) or the [lightning-progress-ring](https://developer.salesforce.com/docs/component-library/bundle/lightning-progress-ring/documentation) one (if _dynamic:progress_ name is used).
In such a case, a _iconValue_ property should be set to control the actual display state of the icon/progress bar.
 
This component is used in the following components:
* **[sfpegListCmp](/help/sfpegListCmp.md)**
* **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)**
* **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)**

## Display Configuration Options

The following display parameters may be set on a **sfpegIconDsp** component
* _iconName_ to provide the actual icon name to display as _prefix:name_ as in SLDS
* _iconSize_ to provide its size (small being default if applicable)
* _iconVariant_ to provide its variant (if applicable, depending on the icon type)
* _iconTitle_ to set a title on the icon (displayed upon hovering)
* _iconValue_ to set the current value state of the icon (for dynamic icon type)
* _isDebug_ to activate the console logs of the component (for debug)

## Action Configuration

If the _actionName_ property in set of the component, an _action_ LWC event is triggered each time the
user clicks on the icon. Te CSS is then adapted to highlight that the iccon is clickable.

Such an event should be handled by setting the _onaction_ handler on the component.

```
<c-sfpeg-icon-dsp   icon-name={iconName}
                    action-name={iconAction}
                    onaction={handleIconAction}  >
</c-sfpeg-icon-dsp>
```
