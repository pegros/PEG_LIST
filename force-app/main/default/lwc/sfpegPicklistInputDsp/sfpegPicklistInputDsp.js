/***
* @author P-E GROS
* @date   Oct 2022
* @description  LWC Component to display a picklistinput based on a list configuration
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2022 pegros
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

export default class SfpegPicklistInputDsp extends LightningElement {

    //###########################################################
    // Configuration Parameters
    //###########################################################

    // Input widget display
    @api fieldName;         // API Name of the field (to be recalled in the fieldChange event)
    @api label;             // Label for the input widget
    @api required;          // Flag to mark the input widget as required
    @api value;             // Current value of the field 
    @api configName;        // Name of the sfpegList configuration to be used to fetch the picklist values
    @api valueField = "Id";     // Field name in the list results to be used as code / value for each combo-box option
    @api labelField = "Name";   // Field name in the list results to be used as label for each combo-box option

    // Context Data
    @api userId;            // ID of the current user
    @api objectApiName;     // API name of the current record
    @api recordId;          // ID of the current record

    // Misc. properties
    @api isDebug = false;   // Flag to activate debug logs

    //###########################################################
    // Internal Parameters
    //###########################################################
    //options;                // Options as loaded via the List component
    displayOptions;         // Options as displayed in the combobox

    //###########################################################
    // Error Reporting
    //###########################################################
    @api setError(message) {
        if (this.isDebug) console.log('setError: START with ',message);

        let combobox = this.template.querySelector('lightning-combobox');
        if (this.isDebug) console.log('setError: combobox fetched ',combobox);

        combobox.setCustomValidity(message);
        combobox.reportValidity();
        if (this.isDebug) console.log('setError: END ');
    }

    //###########################################################
    // Component Initialisation
    //###########################################################
    /*connectedCallback(){
        console.log('connectedCallback: START ',this.label);
        console.log('connectedCallback: configName ',this.configName);
        console.log('connectedCallback: objectApiName ',this.objectApiName);
        console.log('connectedCallback: recordId ',this.recordId);
        console.log('connectedCallback: END ');
    }

    renderedCallback(){
        console.log('renderedCallback: START');
        console.log('renderedCallback: END');
    }*/

    handleOptionsLoad(event){
        if (this.isDebug) console.log('handleOptionsLoad: START',event);
        if (this.isDebug)console.log('handleOptionsLoad: details',JSON.stringify(event.detail));
        //this.options = event.detail;
   
        let displayOptions = [];
        event.detail.forEach(item => {
            displayOptions.push({label: item[this.labelField], value: item[this.valueField]});
        });
        this.displayOptions = displayOptions;
        if (this.isDebug) console.log('handleOptionsLoad: END with ',this.displayOptions);
    }


    //###########################################################
    // Event Handling
    //###########################################################
    handleChange(event){
        if (this.isDebug) console.log('handleChange: START with ',event);
        if (this.isDebug) console.log('handleChange: details ',JSON.stringify(event.detail));
        this.value = event.detail.value;
        if (this.isDebug) console.log('handleChange: selected value ',event.detail.value);

        let changeEvt = new CustomEvent('fieldchange', { detail: {fieldName: this.fieldName, value:event.detail.value} });
        if (this.isDebug) console.log('handleChange: triggering load event for parent component ');
        this.dispatchEvent(changeEvt);

        this.setError('');
        if (this.isDebug) console.log('handleChange: END');
    }
}