/***
* @author P-E GROS
* @date   April 2024
* @description  LWC Component to display Lists of records in a datatable, a list of tiles or
*               cards only after user explicit user demand.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2024 pegros
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

import { LightningElement, api} from 'lwc';
import currentUserId    from '@salesforce/user/Id';

import EXPAND_TITLE     from '@salesforce/label/c.sfpegOnDemandListExpandTitle';

export default class SfpegOnDemandListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardTitle;             // Title of the wrapping Card
    @api cardIcon;              // Icon of the wrapping Card
    @api cardClass;             // CSS Classes for the wrapping card div
    @api buttonLabel;           // Label of the first expand header button
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)

    @api configName;            // DeveloperName of the sfpegList__mdt record to be used
    @api actionConfigName;      // DeveloperName of the sfpegAction__mdt record to be used for header actions
    @api footerConfigName;      // DeveloperName of the sfpegAction__mdt record to be used for footer actions
    @api contextString;         // Context data to be provided as additional CONTEXT input to query 

    @api showCount = 'right';   // Flag to display the items count.
    @api showSearch = false;    // Flag to show Filter action in header.
    @api showExport = false;    // Flag to show Export action in header.
    @api displayHeight = 0;     // Max-height of the content Div (0 meaning no limit)
    @api maxSize = 100;         // Header Action list overflow limit
    @api isCollapsible = false; // Flag to set the list details as collapsible 
    @api isCollapsed = false;   // Flag inddicating the initial/current collapsed state

    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    isOpen = false;             // Flag tracking the display state of the sfpegListCmp component

    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    userId = currentUserId;     // ID of current User
   
    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------

    expandTitle = EXPAND_TITLE;

    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for OnDemand List ',this.cardTitle);
        if (this.isDebug) console.log('connected: configName provided ', this.configName);
        if (this.isDebug) console.log('connected: actionConfigName provided ', this.actionConfigName);
        if (this.isDebug) console.log('connected: footerConfigName provided ', this.footerConfigName);
        if (this.isDebug) console.log('connected: END for OnDemand List ',this.cardTitle);
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    handleOpen(event) {
        if (this.isDebug) console.log('handleOpen: START with isOpen ',this.isOpen);
        this.isOpen = true;
        if (this.isDebug) console.log('handleOpen: END with isOpen ',this.isOpen);
    }
}