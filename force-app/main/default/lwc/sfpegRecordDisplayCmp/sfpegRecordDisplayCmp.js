/***
* @author P-E GROS
* @date   Dec 2021
* @description  LWC Component to display a record as main section and subtabs.
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
import getConfiguration     from '@salesforce/apex/sfpegRecordDisplay_CTL.getConfiguration';
import currentUserId        from '@salesforce/user/Id';
import { getRecord }        from 'lightning/uiRecordApi';
import sfpegJsonUtl         from 'c/sfpegJsonUtl';
import sfpegMergeUtl        from 'c/sfpegMergeUtl';
import INIT_LABEL           from '@salesforce/label/c.sfpegListInit';
import REFRESH_LABEL        from '@salesforce/label/c.sfpegListRefresh';

var RECORD_DISPLAY_CONFIGS = {};

export default class SfpegRecordDisplayCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardClass;             // CSS Classes for the wrapping card 
    @api configName;            // DeveloperName of the sfpegList__mdt record to be used
    @api actionConfigName;      // DeveloperName of the sfpegAction__mdt record to be used for header actions
    @api layoutMode = 'auto';   // Layout mode to be used for field display (auto, inline, stacked)
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)
    @api maxSize = 100;         // Header Action list overflow limit
    @api useLDS = false;        // LDS data fetch activation
    @api showRefresh = false;   // Flag to activate Refresh button display
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.


    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    // Initialization tracking
    @track isReady = false;         // Initialization state of the component (to control spinner)
    @track configDetails = null;    // Global configuration of the component
    @track errorMsg;                // Error message displayed (if applicable)
    
    // Display Parameters
    @track tabVariant = 'standard' // Variant of the tab container
    @track innerClass;          // CSS classes to be applied to the main section
    @track fieldClass = 'slds-form-element formItem' // CSS classes to be applied to field display containers
    @track cardTitle;           // Title of the wrapping Card
    @track cardIcon;            // Icon of the wrapping Card
    @track mainFields;          // Content of the top section
    @track tabList;             // Content of the tabs

    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields = null; // List of Field API Names for current page record (if any) required for display (if LDS flag set) 
    recordData = null;          // Data of the current page record (if any) required for display (if LDS flag set)

    userId = currentUserId;     // ID of current User
    @track userFields = null;   // List of Field API Names for current User (if any) required for display
    userData = null;            // Data of the current User (if any) required for display

    //Widget Labels & Titles from custom labels
    initLabel = INIT_LABEL;
    refreshTitle = REFRESH_LABEL;

    //----------------------------------------------------------------
    // Custom UI Display getters
    //----------------------------------------------------------------
    get hasErrorMsg () {
        if (this.errorMsg) return true;
        return false;
    }
    get hasMainData () {
        if (this.errorMsg) return false;
        if (this.mainFields) return true;
        return false;
    }
    get hasTabData () {
        if (this.errorMsg) return false;
        if (this.tabList) return true;
        return false;
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');
        if (this.isDebug) console.log('connected: recordId provided ',this.recordId);
        if (this.isDebug) console.log('connected: objectApiName provided ',this.objectApiName);
        if (this.isDebug) console.log('connected: userId provided ',this.userId);

        if (this.isReady) {
            console.warn('connected: END / already ready');
            return;
        }

        if (this.layoutMode === 'inline') {
            // slds-form-element_1-col
            this.fieldClass = 'slds-form-element formItem slds-form-element_horizontal';
            if (this.isDebug) console.log('connected: inline mode chosen ');
        }
        else if (this.layoutMode === 'stacked') {
            this.fieldClass = 'slds-form-element formItem';
            if (this.isDebug) console.log('connected: stacked mode chosen ');
        }
        else {
            if (this.isDebug) console.log('connected: auto mode chosen ');
        }

        if ((!this.configName) || (this.configName === 'N/A')){
            console.warn('connected: END / missing configuration');
            this.errorMsg = 'Missing configuration!';
            this.isReady = true;
            return;
        }

        if (this.isDebug) console.log('connected: config name fetched ', this.configName);
        if (RECORD_DISPLAY_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            this.configDetails = RECORD_DISPLAY_CONFIGS[this.configName];
            this.finalizeConfig();
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                try {
                    RECORD_DISPLAY_CONFIGS[this.configName] = {
                        template: result.DisplayConfig__c || '{}',
                        tokens: sfpegMergeUtl.sfpegMergeUtl.extractTokens((result.DisplayConfig__c || '{}'),this.objectApiName)
                    };
                    this.configDetails = RECORD_DISPLAY_CONFIGS[this.configName];
                    this.finalizeConfig();
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

        /*let densityControl = this.template.querySelector('.densityControl');
        if (this.isDebug) console.log('renderedCallback: densityControl ', densityControl);
        if (this.isDebug) console.log('renderedCallback: classes ', densityControl.className);

        if (this.isDebug) console.log('renderedCallback: classes STR ', densityControl.className.toString());

        if (densityControl.className.toString()?.includes('slds-form-element_horizontal')) {
            if (this.isDebug) console.log('renderedCallback: density: compact');
        }
        else {
            if (this.isDebug) console.log('renderedCallback: density: comfy');
        }*/
        if (this.isDebug) console.log('renderedCallback: END');
    }

    handleDensity(event) {
        if (this.isDebug) console.log('handleDensity: START');

        let densityControl = this.template.querySelector('.densityControl');
        if (this.isDebug) console.log('handleDensity: densityControl ', densityControl);
        if (this.isDebug) console.log('handleDensity: classes ', densityControl.className);

        if (this.isDebug) console.log('handleDensity: classes STR ', densityControl.className.toString());

        if (densityControl.className.toString()?.includes('slds-form-element_horizontal')) {
            if (this.isDebug) console.log('handleDensity: density compact --> inline mode ');
            this.fieldClass = 'slds-form-element formItem slds-form-element_horizontal ';
        }
        else {
            if (this.isDebug) console.log('handleDensity: density: comfy --> stacked mode ');
            this.fieldClass = 'slds-form-element formItem';
        }

        if (this.isDebug) console.log('handleDensity: END');
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------
    // Current Record 
    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields fetched ',JSON.stringify(this.recordFields));
        if (this.isDebug) console.log('wiredRecord: tokens fetched ',JSON.stringify(this.configDetails.tokens.RCD));

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.recordData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.tokens.RCD);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredRecord: END / recordData updated ', JSON.stringify(this.recordData));

            if ((this.userFields) && (!this.userData)) {
                if (this.isDebug) console.log('wiredRecord: END waiting for user LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: END finalizing display');
                this.finalizeDisplay();
            }
        }
        else if (error) {
            console.warn('wiredRecord: data fetch KO', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END N/A');
        }
    }

    // Current User 
    @wire(getRecord, { "recordId": '$userId', "fields": '$userFields' })
    wiredUser({ error, data }) {
        if (this.isDebug) console.log('wiredUser: START with ID ', this.userId);
        if (this.isDebug) console.log('wiredUser: userFields fetched ',JSON.stringify(this.userFields));
        if (this.isDebug) console.log('wiredUser: tokens fetched ',JSON.stringify(this.configDetails.tokens.USR));

        if (data) {
            if (this.isDebug) console.log('wiredUser: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.tokens.USR);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredUser: END / userData updated ', JSON.stringify(this.userData));

            //this.userData = data;
            //this.executeQuery();
            if ((this.recordFields) && (!this.recordData)) {
                if (this.isDebug) console.log('wiredUser: END waiting for record LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredUser: END finalizing display');
                this.finalizeDisplay();
            }
        }
        else if (error) {
            console.warn('wiredUser: data fetch KO', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredUser: END N/A');
        }
    }

    //----------------------------------------------------------------
    // Configuration Finalization / Update
    //----------------------------------------------------------------
    //Configuration finalisation
    finalizeConfig = function() {
        if (this.isDebug) console.log('finalizeConfig: START');

        try {
            let ldsFetchRequired = false;

            // User contextual data fetch
            if (this.configDetails.userFields) {
                ldsFetchRequired = true;
                this.userFields = this.configDetails.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from previous',JSON.stringify(this.userFields));
            }
            else if (this.configDetails.tokens.USR) {
                ldsFetchRequired = true;
                this.configDetails.userFields = this.configDetails.tokens.USR.ldsFields;
                this.userFields = this.configDetails.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from config',JSON.stringify(this.userFields));
            }

            // Record contextual data fetch
            if (this.objectApiName) {
                if (this.isDebug) console.log('finalizeConfig: analysing record fields for object ',this.objectApiName);

                if (!this.useLDS) {
                    if (this.isDebug) console.log('finalizeConfig: LDS not used to fetch record fields');
                    this.recordData = { recordId: this.recordId, objectApiName: this.objectApiName };
                    if (this.isDebug) console.log('finalizeConfig: recordData init with Object Name & Record Id ', this.recordData);
                }
                else {
                    if (this.isDebug) console.log('finalizeConfig: using LDS to fetch record fields');

                    if (this.configDetails.recordFields) {
                        ldsFetchRequired = true;
                        if (this.configDetails.recordFields[this.objectApiName]) {
                            this.recordFields = this.configDetails.recordFields[this.objectApiName];
                            if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (same object)',JSON.stringify(this.recordFields));
                        }
                        else {
                            this.configDetails.recordFields[this.objectApiName] = [];
                            this.configDetails.tokens.RCD.forEach(item => (this.configDetails.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item.field));
                            this.recordFields = this.configDetails.recordFields[this.objectApiName];
                            if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with different object) ',JSON.stringify(this.recordFields));
                        }
                    }
                    else if (this.configDetails.tokens.RCD) {
                        ldsFetchRequired = true;
                        this.configDetails.recordFields = {};
                        this.configDetails.recordFields[this.objectApiName] = this.configDetails.tokens.RCD.ldsFields;
                        this.recordFields = this.configDetails.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from config',JSON.stringify(this.recordFields));
                    }
                }
            }

            if (ldsFetchRequired) {
                if (this.isDebug) console.log('finalizeConfig: END / waiting for LDS data fetch');
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: END / finalising display');
                this.finalizeDisplay();
            }
        }
        catch(error) {
            this.errorMsg = 'Processing failure: ' + error;
            console.warn('finalizeConfig: END / processing failure', error);
            this.isReady = true;
        }
    }

    //Display finalisation
    finalizeDisplay = function() {
        if (this.isDebug) console.log('finalizeDisplay: START');

        if (this.recordFields && !this.recordData) {
            if (this.isDebug) console.log('finalizeDisplay: END / missing Record Data');
            return;
        }
        if (this.userFields && !this.userData) {
            if (this.isDebug) console.log('finalizeDisplay: END / missing User Data');
            return;
        }

        if (this.isDebug) console.log('finalizeDisplay: configuration ready / triggering message merge');
        this.errorMsg = '';

        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.template,this.configDetails.tokens,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
        .then( value => {
            if (this.isDebug) console.log('finalizeDisplay: context merged within display template ',value);

            let rawTemplate = JSON.parse(value);
            if (this.isDebug) console.log('finalizeDisplay: message template parsed ',JSON.stringify(rawTemplate));

            if (rawTemplate) {
                if (this.isDebug) console.log('finalizeDisplay: setting display properties ');
                this.tabVariant = rawTemplate.variant || 'standard';
                //this.cardTitle = rawTemplate.title || 'NONE';
                this.cardTitle = rawTemplate.title || '';
                this.cardIcon = rawTemplate.icon;
                this.mainFields = rawTemplate.fields;
                this.innerClass = rawTemplate.innerClass || '';
                this.tabList = rawTemplate.tabs;

                let currentKey = 0;
                if (this.mainFields) {
                    if (this.isDebug) console.log('finalizeDisplay: reworking top fields ',JSON.stringify(this.mainFields));
                    this.mainFields.forEach(iterField => {
                        iterField.size = iterField.size || 12;
                        iterField.label = iterField.label || '';
                        iterField._key = currentKey++; 
                    });
                    if (this.isDebug) console.log('finalizeDisplay: top fields reworked ',JSON.stringify(this.mainFields));
                }

                if (this.tabList) {
                    if (this.isDebug) console.log('finalizeDisplay: reworking tabs ',JSON.stringify(this.tabList));
                    this.tabList.forEach(iterTab => {
                        iterTab._key = currentKey++; 
                        if (iterTab.fields) {
                            if (this.isDebug) console.log('finalizeDisplay: reworking tab fields ',JSON.stringify(iterTab.fields));
                            iterTab.fields.forEach(iterField => {
                                iterField.size = iterField.size || 12;
                                iterField.label = iterField.label || '';
                                iterField._key = currentKey++; 
                            });
                            if (this.isDebug) console.log('finalizeDisplay: top fields reworked ',JSON.stringify(iterTab.fields));
                        }
                        else {
                            if (this.isDebug) console.log('finalizeDisplay: no tab fields ');
                            iterTab.fields = [];
                        }
                        if (iterTab.list) {
                            if (this.isDebug) console.log('finalizeDisplay: reworking list ');
                            iterTab.list.actions = iterTab.list.actions || 'N/A';
                        }
                    });
                    if (this.isDebug) console.log('finalizeDisplay: tabs reworked ',JSON.stringify(this.tabList));
                }

                if (this.isDebug) console.log('finalizeDisplay: END / displlay finalized');
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('finalizeDisplay: END / empty parsed message ');
                this.errorMsg = 'No data to display!';
                this.isReady = true;
            }
        })
        .catch( error => {
            console.warn('finalizeDisplay: END / KO ', JSON.stringify(error));
            this.errorMsg = 'Message finalization issue: ' + ((error.body || error).message || error);
            this.isReady = true;
        });
        
        if (this.isDebug) console.log('finalizeDisplay: context merge requested');
    }

    //----------------------------------------------------------------
    // Event Handlers  
    //----------------------------------------------------------------      
    // Standard Action handling
    handleRefresh(event) {
        if (this.isDebug) console.log('handleRefresh: START');
        this.finalizeDisplay();
        if (this.isDebug) console.log('handleRefresh: END');
    }

    // Header action handling
    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START');

        if (this.isDebug) console.log('handleActionDone: END');
    }


}