---
# sfpegActiontriggerCmp Component
---

## Introduction

The purpose of this LWC component is to automatically trigger an action upon instantiation.

The strategy is to rely on standard Lightning visibility criteria to control its instantiation (and therefore
the action trigger).

Unless in debug mode, this component displays nothing on the page, but it consumes some margin space by default and should
therefore be preferably located at the bottom of a page.  


## Configuration

It has no extensive configuration, with only 3 basic properties:
* _Action Configuration_ chosen among the available and compatible **sfpegAction** custom metadata records
* _Action Name_  chosen among the ones available within the selected _Action Configuration_
* _Debug?_ to activate debug information and logs


## Technical Details

It relies on a hidden LWC **[sfpegActionBarCmp](/force-app/main/default/lwc/sfpegActionBarCmp/sfpegActionBarCmp.md)**
component to register/contextualise a set of available actions and triggers
only the one configured. A same **sfpegAction** custom metadata record may thus be shared by multiple **sfpegActiontriggerCmp**
instances, each one using one specific action registered within it.

