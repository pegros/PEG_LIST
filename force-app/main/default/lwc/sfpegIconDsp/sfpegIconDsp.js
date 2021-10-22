/***
* @author P-E GROS
* @date   July 2021
* @description  LWC Component to display an Icon in a unified way, masking the
*               specificities of standard SLDS vs custom Icons.
*               Custom icons have to be added as SVG sprites within the 
*               sfpegIcons static resource file.
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2021 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

import { LightningElement,track,api } from 'lwc';

import CUSTOM_ICONS from '@salesforce/resourceUrl/sfpegIcons';

export default class SfpegIconDsp extends LightningElement {

    //----------------------------------------------------------------
    // Component parameters  
    //----------------------------------------------------------------   
    // Configuration parameters
    @api iconName;      // Name of the image in a SLDS form (e.g. utility:edit) with a
                        // special resource:xxx domain for custom SVG icons in the sfpegIcons
                        // static resource.
    @api iconSize;      // Size of the image
    @api iconVariant;   // Variant of the icon (for utility ones)
    @api iconTitle;     // Title on the icon
    @api actionName;    // Action name (e.g. to be provided in an onclick triggered)
    @api isDebug;       // Show debug logs

    // Internal technical parameters
    @track isResourceIcon = false;  // Indicates that the iconName is leveraging the custom SVG static resource
    @track iconSrc;                 // Source if the custom SVG to display (with name + size)
    @track iconClass;               // CSS class to apply

    //Widget Labels & Titles from custom labels
    customIconsRsc = CUSTOM_ICONS; // Static resource for custom SVG Icons

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for ', this.iconName);

        this.iconSize = this.iconSize || 'small';
        if (this.isDebug) console.log('connected: iconSize set ', this.iconSize);
        
        if ((this.iconName) && (this.iconName.includes('resource:'))) {
            this.isResourceIcon = true;
            this.iconSrc = this.customIconsRsc + '#' + this.iconName.substring(9) + '-' + this.iconSize;
            if (this.isDebug) console.log('connected: setting custom icon src ',this.iconSrc);
            if (this.iconVariant === "inverse") {
                this.iconClass = "slds-icon_container slds-theme_default";
                if (this.isDebug) console.log('connected: setting inverse icon class ',this.iconClass);
            }
        }
        if (this.actionName) {
            this.iconClass = 'kpiAction';
            if (this.isDebug) console.log('connected: setting custom action class ',this.iconClass);
        }
        if (this.isDebug) console.log('connected: END ');
    }

    //----------------------------------------------------------------
    // Event Handlers 
    //----------------------------------------------------------------      
    handleIconAction(event) {
        if (this.isDebug) console.log('handleIconAction: START');

        if (this.actionName) {
            if (this.isDebug) console.log('handleIconAction: processing ',this.actionName);

            let parentEvt = new CustomEvent('action', { detail: this.actionName });
            if (this.isDebug) console.log('handleIconAction: parentEvt init', JSON.stringify(parentEvt));
    
            this.dispatchEvent(parentEvt);
            if (this.isDebug) console.log('handleIconAction: END / click event triggered');
        }
        else {
            if (this.isDebug) console.log('handleIconAction: END / ignoring click');
        }
    }
}