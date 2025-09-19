/***
* @author P-E GROS
* @date   Dec 2023
* @description  LWC Component to display a Record Card in an App page
*               by fetching the recordId from a Custom Label or a
*               sfpegMergeUtl expression.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2023 pegros
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

import { LightningElement, wire , api, track} from 'lwc';
import currentUserId    from '@salesforce/user/Id';
import sfpegMergeUtl    from 'c/sfpegMergeUtl';

export default class SfpegAppCardCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardTitle;             // Title of the wrapping Card
    @api cardIcon;              // Icon of the wrapping Card
    @api cardClass;             // CSS Classes for the wrapping card div
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)

    @api configName;            // DeveloperName for the sfpegCard__mdt record to be used
    @api actionConfigName;      // DeveloperName for the sfpegAction__mdt record to be used for header actions
    @api maxSize = 100;         // Header Action list overflow limit

    @api isReadOnly = false;    // Display card in readonly mode
    @api isCollapsible = false; // Collapsible mode activation
    @api isCollapsed = false;   // Collapsible mode state (initial state may be configured)

    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    @api useDML = false;        // DML (instead of LDS) mode activation 
    @api isConfirmed = false;   // Confirmation popup activation in case of component disconnection with pending changes
                                // Only works in console mode for now.

    @api objectApiName;         // Object API Name of the card record
    @api recordIdStr;           // String ptoviding the way to fetch the ID of the card record (directly
                                // from a Custom Label or via a sfpegMergeUtl expression.

    //----------------------------------------------------------------
    // Technical Parameters
    //----------------------------------------------------------------
    mergedRecordId;
    userId = currentUserId;
 
    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for App Card ',this.cardTitle);
        if (this.isDebug) console.log('connected: objectApiName provided ', this.objectApiName);
        if (this.isDebug) console.log('connected: recordIdStr provided ', this.recordIdStr);

        if (this.recordIdStr?.includes('{{{')) {
            if (this.isDebug) console.log('connected: triggering context merge');
            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;

            let tokens = sfpegMergeUtl.sfpegMergeUtl.extractTokens(this.recordIdStr, this.objectApiName);
            if (this.isDebug) console.log('connected: tokens extracted ',tokens);

            sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.recordIdStr,tokens,this.userId,null,this.objectApiName,null,null,null,null)
            .then( value => {
                sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
                if (this.isDebug) console.log('connected: merged data received ',value);
                this.mergedRecordId = value;
                if (this.isDebug) console.log('connected: END for App Card / recordId initialized');
            }).catch( error => {
                if (this.isDebug) console.warn('connected: END for App Card / merge KO ', JSON.stringify(error));
            });
            if (this.isDebug) console.log('connected: context merge triggered');
        }
        else {
            this.mergedRecordId = this.recordIdStr;
            if (this.isDebug) console.log('connected: initializing recordId directly ', this.mergedRecordId);
            if (this.isDebug) console.log('connected: END for App Card' + this.cardTitle);
        }
    }
}