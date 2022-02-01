/***
* @author P-E GROS
* @date   Oct 2021
* @description  LWC Component to automatically trigger an action.
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

import { LightningElement, api } from 'lwc';

import currentUserId    from '@salesforce/user/Id';

export default class SfpegActionTriggerCmp extends LightningElement {

    // Configuration parameters
    @api configName = 'N/A';
    @api actionName = null;
    @api isDebug    = false;

    // Context parameters
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @api userId = currentUserId;// ID of current User

    // Initialisation - Trigger of action
    renderedCallback() {
        if (this.isDebug) console.log('rendered: START with ', this.configName);

        /*if ((this.configName) && (this.actionName))  {
            if (this.isDebug) console.log('rendered: triggering action ',this.actionName);

            let rowActionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
            console.log('rendered: actionBar fetched ',rowActionBar);

            try {
                if (this.isDebug) console.log('rendered: triggering action');
                //rowActionBar.executeBarAction(this.actionName,null);
                //if (this.isDebug) console.log('rendered: END / action triggered');
                setTimeout(() => { 
                    rowActionBar.executeBarAction(this.actionName,null);
                    if (this.isDebug) console.log('rendered: END / action triggered');
                }, 1000);
                if (this.isDebug) console.log('rendered: delaying for action bar init');
            }
            catch (error) {
                console.warn('rendered: END KO / action execution failed!', JSON.stringify(error));
            }
        }
        else {
            console.warn('rendered: END KO / name not configured on action');
        }*/

        if (this.isDebug) console.log('rendered: END');
    }

    // Action finalisation
    handleConfigReady(event) {
        if (this.isDebug) console.log('handleConfigReady: START with ',JSON.stringify(event.detail));

        if ((this.configName) && (this.actionName))  {
            if (this.isDebug) console.log('handleConfigReady: triggering action ',this.actionName);

            let rowActionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
            console.log('handleConfigReady: actionBar fetched ',rowActionBar);

            try {
                if (this.isDebug) console.log('handleConfigReady: triggering action');
                rowActionBar.executeBarAction(this.actionName,null);
                if (this.isDebug) console.log('handleConfigReady: END / action triggered');
            }
            catch (error) {
                console.warn('handleConfigReady: END KO / action execution failed!', JSON.stringify(error));
            }
        }
        else {
            console.warn('handleConfigReady: END KO / name not configured on action');
        }
    }
}