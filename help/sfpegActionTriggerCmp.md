---
# sfpegActiontriggerCmp Component
---

## Introduction

The purpose of this LWC component is to automatically trigger an action upon instantiation.
See **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for available action types.

The strategy is to rely on standard Lightning visibility criteria to control its instantiation (and therefore
the action trigger). E.g. as long as an _isComplete_ boolean flag is not set to true, an edit popup requesting to 
fill the missing fields may be automatically displayed to the user when opening a record page.

Unless in debug mode, this component displays nothing on the page, but it consumes some margin space by default and should
therefore be preferably located at the bottom of a page layout.  


## Component Configuration

It has no extensive configuration, with only 3 basic properties:
* _Action Configuration_ chosen among the available and compatible **sfpegAction__mdt** custom metadata records
* _Action Name_  chosen among the button/menu item names available within the selected _Action Configuration_
* _Debug?_ to activate debug information and logs

![Action Trigger Configuration!](/media/sfpegActionTriggerConfig.png) 


## Technical Details

It relies on a hidden LWC **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component to register/contextualise a set
of available actions and triggers only the one configured. A same **sfpegAction** custom metadata record may thus be shared
by multiple **sfpegActiontriggerCmp** instances, each one using one specific action registered within it.
