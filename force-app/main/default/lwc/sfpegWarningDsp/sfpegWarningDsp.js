/***
* @author P-E GROS
* @date   Sept 2021
* @description  LWC Component to display an error message in a standard way.
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

const DISPLAY_VARIANTS = {
    info: {
        "iconName"   : "utility:info_alt",
        "iconVariant": null,
        "textColor"  : "slds-text-color_default"
    },
    warning: {
        "iconName"   : "utility:warning",
        "iconVariant": "warning",
        "textColor"  : "slds-text-color_default"
    },
    errorLight: {
        "iconName"   : "utility:error",
        "iconVariant": "error",
        "textColor"  : "slds-text-color_error"
    },
    success: {
        "iconName"   : "utility:success",
        "iconVariant": "inverse",
        "textColor"  : "slds-text-color_success"
    }
}

export default class SfpegWarningDsp extends LightningElement {

    //----------------------------------------------------------------
    // Component parameters  
    //----------------------------------------------------------------   
    // Configuration parameters
    @api message;               // Error message to display
    @api variant = "warning";   // Variant of the display
    @track variantConfig = {};  // configuration corresponding to the variant

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        this.variantConfig = DISPLAY_VARIANTS[this.variant] || DISPLAY_VARIANTS.warning;
    }
}