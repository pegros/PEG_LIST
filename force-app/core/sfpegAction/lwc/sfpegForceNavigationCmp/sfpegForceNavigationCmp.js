/***
* @author P-E GROS
* @date   Sept 2025
* @description  LWC Component to force navigation to another record or same record in different tab.
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

import { LightningElement, wire, api } from 'lwc';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// To get information about console mode
import { EnclosingTabId, getTabInfo, IsConsoleNavigation } from 'lightning/platformWorkspaceApi';

// To notify the utility bar handler if required
import { publish, MessageContext }  from 'lightning/messageService';
import sfpegAction                  from '@salesforce/messageChannel/sfpegAction__c';           // for Utility bar communication (outgoing)

export default class SfpegForceNavigationCmp extends LightningElement {

    // Main configuration fields (for App Builder)
    @api isMainTab = false;     // Boolean flag indicating if the current record should be open in Main or Subtab (in console mode)"/>
    @api parentField;           // API Name of the lookup field providing the record parent ID (for sub-tab in console)
    @api targetPage;            // Page reference to navigate to

    @api isDebug = false;       // Boolean flag indicating if the current record should be open in Main or Subtab (in console mode)"/>

    // technical internal properties
    recordFields = null;        // List of Field API Names for current page record (if any) required as Query Input
    targetPageJSON;             // Target page ref to navigate to.
    errorMessage;

    // Context data
    @api    objectApiName;      // Object API Name for current page record (if any)
    @api    recordId;           // ID of current page record (if any)

    // Console mode handling
    @wire(IsConsoleNavigation) isConsoleNavigation;
    @wire(EnclosingTabId) enclosingTabId;
    isSubTab;
    mainTabRecordId;
    lookupId;
    isTabReady = false;
    isRcdReady = false;

    // Notification handling
    @wire(MessageContext) messageContext;


    //################################################################
    // Component Initialization
    //################################################################

    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START force navigation with main tab?',this.isMainTab);
            console.log('connected: parentField set ',this.parentField);
            console.log('connected: targetPage set ',this.targetPage);
            console.log('connected: recordId context ',this.recordId);
            console.log('connected: objectApiName context ',this.objectApiName);
        }

        if (this.parentField) {
            if (this.isDebug) console.log('connected: processing parentField', this.parentField);
            this.recordFields = [];
            this.recordFields.push(this.objectApiName + '.' + this.parentField);
            if (this.isDebug) console.log('connected: recordFields init',JSON.stringify(this.recordFields));
        }
        else if (this.targetPage) {
            try {
                if (this.isDebug) console.log('connected: processing targetPage', this.targetPage);
                this.targetPageJSON = JSON.parse(this.targetPage);
                if (this.isDebug) console.log('connected: targetPage parsed');

                if ((this.targetPageJSON?.type === 'standard__recordPage') && (this.targetPageJSON?.attributes?.recordId)){
                    if (this.isDebug) console.log('connected: processing targetPage recordId', this.targetPageJSON.attributes.recordId);
                    this.recordFields = this.recordFields || [];
                    this.recordFields.push(this.objectApiName + '.' + this.targetPageJSON.attributes.recordId);
                    if (this.isDebug) console.log('connected: recordFields init',JSON.stringify(this.recordFields));
                }
            }
            catch (error) {
                if (this.isDebug) console.log('connected: targetPage parsing failed ',JSON.stringify(error));
                this.errorMessage = 'targetPage parsing failed!';
            }
        }
        else {
            if (this.isDebug) console.log('connected: no parentField nor targetPage to consider');
            this.isRcdReady = true;
        }

        if (this.isConsoleNavigation) {
            if (this.isDebug) console.log('connected: console mode detected');
            if (this.enclosingTabId) {
                if (this.isDebug) console.log('connected: fetching current Tab infos',this.enclosingTabId);
                getTabInfo(this.enclosingTabId)
                .then((tabInfo) => {
                    if (this.isDebug) console.log('connected: tabInfo received',JSON.stringify(tabInfo));
                    this.isSubTab = tabInfo.isSubtab;
                    if (this.isDebug) console.log('connected: isSubTab init',this.isSubTab);

                    if (this.isSubTab) {
                        if (this.isDebug) console.log('connected: fetching parentTab infos',tabInfo.parentTabId);
                        return getTabInfo(tabInfo.parentTabId)
                        .then((parentTabInfo) => {
                            if (this.isDebug) console.log('connected: parentTabInfo received',JSON.stringify(parentTabInfo));
                            this.mainTabRecordId = parentTabInfo.recordId;
                            if (this.isDebug) console.log('connected: mainTabRecordId init',this.mainTabRecordId);
                            this.isTabReady = true;
                        })
                    }
                    else {
                        if (this.isDebug) console.log('connected: already main tab');
                        this.isTabReady = true;
                        return Promise.resolve();
                    }
                })
                .then(() => {
                    if ((this.isRcdReady) && (this.isTabReady)) {
                        if (this.isDebug) console.log('connected: notifying utility bar');
                        this.notifyUtilityBar();
                        if (this.isDebug) console.log('connected: END force navigation / utility bar notified');
                    }
                    else {
                        if (this.isDebug) console.log('connected: END force navigation / awaiting tab or record info');
                    }
                });
            }
        }
        else {
            if (this.isDebug) console.log('connected: END force navigation / standard mode detected');
        }
    }

    //################################################################
    // Context Initialization
    //################################################################

    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START force navigation with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields ',JSON.stringify(this.recordFields));
        if (data) {
            if (this.isDebug) console.log('wiredRecord: analysing data ', JSON.stringify(data));
            if (this.isDebug) console.log('wiredRecord: extracting field ', this.recordFields.at(0));
            this.lookupId = getFieldValue(data, this.recordFields.at(0));
            if (this.isDebug) console.log('wiredRecord: lookupId init ', this.lookupId);
            this.isRcdReady = true;

            if (this.isTabReady) {
                if (this.isDebug) console.log('wiredRecord: notifying utility bar');
                this.notifyUtilityBar();
                console.log('wiredRecord: END force navigation / utility bar notified');
            }
            else {
                console.log('wiredRecord: END force navigation / awaiting tab info');
            }
        }
        else if (error) {
            console.warn('wiredRecord: END KO force navigation/ error ', error);
        } 
        else {
            if (this.isDebug) console.warn('wiredRecord: END force navigation / no data ');
        }
    }

    notifyUtilityBar() {
        if (this.isDebug) {
            console.log('notifyUtilityBar: START with recordId fetched ', this.recordId);
            console.log('notifyUtilityBar: objectApiName fetched ', this.objectApiName);
            console.log('notifyUtilityBar: isMainTab set ', this.isMainTab);
            console.log('notifyUtilityBar: isSubtab fetched', this.isSubTab);
            console.log('notifyUtilityBar: parentField set ', this.parentField);
            console.log('notifyUtilityBar: mainTabRecordId fetched ', this.mainTabRecordId);
            console.log('notifyUtilityBar: targetPage set ' , this.targetPage);
            console.log('notifyUtilityBar: lookupId fetched ', this.lookupId);
        }

        let doNotify = false;
        if (this.targetPage) {
            if (this.isDebug) console.log('notifyUtilityBar: notifying target page');
            if (this.lookupId) {
                if (this.isDebug) console.log('notifyUtilityBar: contextualising target page');
                this.targetPageJSON.attributes.recordId = this.lookupId;
                if (this.isDebug) console.log('notifyUtilityBar: targetPageJSON target page init',JSON.stringify(this.targetPageJSON));
            }
            doNotify = true;
        }
        else if (this.isConsoleNavigation) {
            if (this.isDebug) console.log('notifyUtilityBar: analysing tab mode in console');
            if ((this.isMainTab && this.isSubTab) || (!this.isMainTab && !this.isSubTab)) {
                if (this.isDebug) console.log('notifyUtilityBar: current tab mode not requested one');
                doNotify = true;
            }
            else if ((this.lookupId) && (this.mainTabRecordId !== this.lookupId)){
                if (this.isDebug) console.log('notifyUtilityBar: current main tab record is not the requested one');
                doNotify = true;
            }
        }

        if (!doNotify) {
            if (this.isDebug) console.log('notifyUtilityBar: END KO / no need to notify utility bar');
            return;
        }
        
        if (this.isDebug) console.log('notifyUtilityBar: reopening tab from utility bar');


        let notifConfig = this.targetPageJSON ?  {  targetPage: this.targetPageJSON, sourceTab: this.enclosingTabId, isTargetMain: this.isMainTab } : { targetId: this.recordId, targetObject: this.objectApiName, isTargetMain :  this.isMainTab};
        if (this.isDebug) console.log('notifyUtilityBar: notifConfig init ', JSON.stringify(notifConfig));
        
        publish(this.messageContext, sfpegAction, { action: { type: "openTab", params: notifConfig }});
        if (this.isDebug) console.log('notifyUtilityBar: END / message sent');
    }

}