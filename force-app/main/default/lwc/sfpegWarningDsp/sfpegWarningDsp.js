/***
* @author P-E GROS
* @date   Sept 2021
* @description  LWC Component to display an error message in a standard way.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
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
    // Component configuration parameters  
    //----------------------------------------------------------------   
    @api message;               // Text message to display
    @api error;                 // Error object for which message properties should be displayed
    @api variant = "warning";   // Variant of the display
    @api isDebug = false;       // Flag to trigger debug logs

    //----------------------------------------------------------------
    // Component internal parameters  
    //----------------------------------------------------------------  
    @track errorDetails;        // Concatenated error message properties for display
    @track variantConfig = {};  // configuration corresponding to the variant

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        this.variantConfig = DISPLAY_VARIANTS[this.variant] || DISPLAY_VARIANTS.warning;
        if (this.isDebug) console.log('connected: variantConfig init ', this.variantConfig);

        if (this.error) {
            if (this.isDebug) console.log('connected: parsing error object', JSON.stringify(this.error));

            let regexp = /message":"(.*?)"/gi;
            //if (this.isDebug) console.log('connected: regexp init ', regexp);

            let messageList = (JSON.stringify(this.error)).match(regexp);
            if (this.isDebug) console.log('connected: messageList extracted ', messageList);

            this.errorDetails = messageList?.reduce((previous ,current) => {
                let newCurrent = current.slice(10,-1);
                if (previous) return previous + '\n' + newCurrent;
                return newCurrent;
            },'');
            if (!this.errorDetails) {
                if (this.isDebug) console.log('connected: using full error content');
                this.errorDetails =  JSON.stringify(this.error);
            }
            //this.errorMessage = messageList.join('\n');
            if (this.isDebug) console.log('connected: errorDetails init ', this.errorDetails);
        }

        if (this.isDebug) console.log('connected: END');
    }
}