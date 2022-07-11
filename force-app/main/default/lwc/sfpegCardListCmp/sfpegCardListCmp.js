/***
* @author P-E GROS
* @date   Oct 2021
* @description  LWC Component to display a list of Cards, leveraging the LDS for each record
*               (with a configurable list of fields).
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

import { LightningElement, wire , api, track} from 'lwc';
import getConfiguration     from '@salesforce/apex/sfpegCardList_CTL.getConfiguration';
import currentUserId        from '@salesforce/user/Id';
import { getRecord }        from 'lightning/uiRecordApi';
import sfpegJsonUtl         from 'c/sfpegJsonUtl';
import sfpegMergeUtl        from 'c/sfpegMergeUtl';

var CARDLIST_CONFIGS = {};

export default class SfpegCardListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardTitle;             // Title of the wrapping Card
    @api cardIcon;              // Icon of the wrapping Card
    @api mainCardClass;         // CSS Classes for the main wrapping card div
    @api cardClass;             // CSS Classes for each card in the list
    @api cardSize = 12;         // Width of each card displayed (on a 12 unit range)
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)
    @api maxSize = 100;         // Header Action list overflow limit
    @api maxCardSize = 100;     // Card Action list overflow limit
    @api showCount = 'right';   // Items Count display
    @api showRefresh = false;   // Show global refresh button (for the record list, not the cards themselves)

    @api configName;            // DeveloperName fo the sfpegCardList__mdt record to be used
    @api actionConfigName;      // DeveloperName fo the sfpegAction__mdt record to be used for header actions

    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    @api displayHeight = 0;     // Max-height of the content Div (0 meaning no limit)
    @api isReadOnly = false;    // Flag to set all cards in Read-Only mode


    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    @track isReady = false;         // Initialization state of the component (to control spinner)
    @track configDetails = null;    // Global configuration of the component

    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields = null; // List of Field API Names for current page record (if any) required as Query Input
    recordData = null;          // Data of the current page record (if any) required for Query Input

    userId = currentUserId;     // ID of current User
    @track userFields = null;   // List of Field API Names for current User (if any) required as Query Input
    userData = null;            // Data of the current User (if any) required for Query Input

    // Internal Display Parameter
    @track errorMsg = null;     // Error message (if any for end user display)
    @track recordList = null;   // Current List of results displayed.


    //----------------------------------------------------------------
    // Custom UI Display getters
    //----------------------------------------------------------------
    get hasErrorMsg() {
        if (this.errorMsg) return true;
        return false;
    }
    get hasConfig() {
        if (this.configDetails) return true;
        return false;
    }
    get formatTitle() {
        let rcdCount = (this.recordList ? this.recordList.length : 0);
        if (this.showCount) {
            switch(this.showCount) {
                case 'right' :
                    return (this.cardTitle || '') + " (" + rcdCount + ")";
                case 'left' :
                    return rcdCount + " " + (this.cardTitle || '');
                default:
                    return (this.cardTitle || '');
            }
        }
        return (this.cardTitle || '');
    }
    

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');
        if (this.isDebug) console.log('connected: recordId provided ',this.recordId);
        if (this.isDebug) console.log('connected: objectApiName provided ',this.objectApiName);
        if (this.isDebug) console.log('connected: userId provided ',this.userId);
        //this.errorMsg = 'Component initialized.';

        if (this.isReady) {
            console.warn('connected: END / already ready');
            return;
        }

        if ((!this.configName) || (this.configName === 'N/A')){
            console.warn('connected: END / missing configuration');
            this.errorMsg = 'Missing configuration!';
            this.isReady = true;
            return;
        }

        if (this.isDebug) console.log('connected: config name fetched ', this.configName);
        if (CARDLIST_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            this.configDetails = CARDLIST_CONFIGS[this.configName];
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                try {
                    CARDLIST_CONFIGS[this.configName] = {
                        label: result.MasterLabel,
                        query: result.Query__c,
                        record: {"idField": result.RecordIdField__c, "nameField": result.RecordNameField__c},
                        object: {"name": result.ObjectName__c, "field": result.ObjectNameField__c},
                        icon: {"name": result.IconName__c, "field": result.IconNameField__c},
                        card: {"name": result.CardConfig__c, "field": result.CardConfigField__c},
                        actions : {"name": result.CardActions__c, "field": result.CardActionsField__c }
                    };
                    this.configDetails = CARDLIST_CONFIGS[this.configName];
                    this.isReady = true;
                    if (this.isDebug) console.log('connected: END / configuration parsed');
                }
                catch (parseError){
                    console.warn('connected: END / configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                    this.isReady = true;
                }
            })
            .catch( error => {
                console.warn('connected: END / configuration fetch error ',error);
                this.errorMsg = 'Configuration fetch error: ' + error;
                this.isReady = true;
            });
            if (this.isDebug) console.log('connected: request sent');
        }
    }

    renderedCallback() {
        if (this.isDebug) console.log('renderedCallback: START');
        if (this.isDebug) console.log('renderedCallback: END');
    }


    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START');

        if (event.detail) {
            if (this.isDebug) console.log('handleRecordLoad: event details ',JSON.stringify(event.detail));
            if (this.isDebug) console.log('handleRecordLoad: config ',JSON.stringify(this.configDetails));

            let records = [];
            event.detail.forEach(iter => {
                if (this.isDebug) console.log('handleRecordLoad: processing iter ',JSON.stringify(iter));
                let iterRcd = {
                    id: iter[this.configDetails.record.idField],
                    name: iter[this.configDetails.record.nameField],
                    object: (this.configDetails.object.field ? iter[this.configDetails.object.field] : this.configDetails.object.name),
                    icon: (this.configDetails.icon.field ? iter[this.configDetails.icon.field] : this.configDetails.icon.name),
                    card: (this.configDetails.card.field ? iter[this.configDetails.card.field] : this.configDetails.card.name),
                    actions: (this.configDetails.actions.field ? iter[this.configDetails.actions.field] : this.configDetails.actions.name) || "N/A",
                }
                if (this.isDebug) console.log('handleRecordLoad: iterRcd init ',JSON.stringify(iterRcd));
                records.push(iterRcd);
            });
            this.recordList = records;
            if (this.isDebug) console.log('handleRecordLoad: recordList (re)set ',JSON.stringify(this.recordList));
        }
        else {
            if (this.isDebug) console.warn('handleRecordLoad: no load detail received');
        }

        if (this.isDebug) console.log('handleRecordLoad: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Refresh action handling
    handleRefresh(event){
        if (this.isDebug) console.log('handleRefresh: START with ',JSON.stringify(event.detail));

        let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
        console.log('handleRefresh: listCmp fetched ',listCmp);

        try {
            if (this.isDebug) console.log('handleRefresh: triggering refresh');
            listCmp.doRefresh();
            if (this.isDebug) console.log('handleRefresh: END / refresh triggered');
        }
        catch (error) {
            console.warn('handleRefresh: END KO / refresh execution failed!', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
    }

}