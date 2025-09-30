/***
* @author P-E GROS
* @date   Sept. 2025
* @description  LWC Component to display a multi-picklist field value in various 
*               custom display options.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2025 pegros
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

import { LightningElement, api } from 'lwc';

export default class SfpegMultiPicklistDsp extends LightningElement {

    //----------------------------------------------------------------
    // Component parameters  
    //----------------------------------------------------------------   
    // Configuration parameters
    @api value;             // Value of the multi-picklist field
    @api variant;           // Variant to display the different individual values (badge, avatar, icon, csv)
    @api iconVariant;       // Variant for the Icon display for Avatar or Icon variants
    @api fallbackIconName = 'standard:file';    // Fallback Icon name for Avatar variant
    @api size = 'small';    // Size of the Icons and Avatars to display
    @api label;             // Title to be set.
    @api isDebug = false;   // Flag to activate debug mode

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get isBadge() {
        return (this.variant === 'badge');
    }
    get isAvatar() {
        return (this.variant === 'avatar');
    }
    get isIcon() {
        return (this.variant === 'icon');
    }
    get valueAsList() {
        return (this.value?.split(';'));
    }
    get valueAsIcons() {
        let valueSplit = this.value?.split(';');
        if (valueSplit) {
            let iconValues = [];
            valueSplit.forEach(item => {
                if (item.includes('#')) {
                    let itemParts = item.split('#');
                    iconValues.push({icon:itemParts[0], label:itemParts[1] || this.label, variant: itemParts[2] || this.iconVariant});
                }
                else {
                    iconValues.push({icon:item,label:this.label, variant:this.iconVariant});
                }
            });
            return iconValues;
        }
        return null;
    }
    get valueAsCsv() {
        return (this.value ? (('' + this.value).replaceAll(';',', ')) : null);
    }

}