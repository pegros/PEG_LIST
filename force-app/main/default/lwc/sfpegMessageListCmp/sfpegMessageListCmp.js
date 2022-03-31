/***
* @author P-E GROS
* @date   Sept 2021
* @description  LWC Component to display lists of conditional and actionable messages in a page.
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

import sfpegMergeUtl        from 'c/sfpegMergeUtl';
import getConfiguration     from '@salesforce/apex/sfpegMessage_CTL.getConfiguration';
import currentUserId        from '@salesforce/user/Id';
import { getRecord }        from 'lightning/uiRecordApi';

var MSG_LIST_CONFIGS = {};

const MSG_VARIANTS = {
    base: {
        "iconName"   : null,
        "iconVariant": null,
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-body_regular"
    },
    notif: {
        "iconName"   : "utility:announcement",
        "iconVariant": "success",
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_default"
    },
    info: {
        "iconName"   : "utility:info_alt",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_info",
        "textVariant": "slds-text-color_inverse"
    },
    infoLight: {
        "iconName"   : "utility:info_alt",
        "iconVariant": null,
        "theme"      : "slds-theme_default",
        "textVariant": "slds-text-color_weak"
    },
    warning: {
        "iconName"   : "utility:warning",
        "iconVariant": "warning",
        "theme"      : "slds-theme_warning",
        "textVariant": "slds-text-color_default"
    },
    warningLight: {
        "iconName"   : "utility:warning",
        "iconVariant": "warning",
        "theme"      : "slds-theme_default warningBox",
        "textVariant": "slds-text-color_weak"
    },
    error: {
        "iconName"   : "utility:error",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_error",
        "textVariant": "slds-text-color_inverse"
    },
    errorLight: {
        "iconName"   : "utility:error",
        "iconVariant": "error",
        "theme"      : "slds-theme_default errorBox",
        "textVariant": "slds-text-color_error"
    },
    success: {
        "iconName"   : "utility:success",
        "iconVariant": "inverse",
        "theme"      : "slds-theme_success",
        "textVariant": "slds-text-color_inverse"
    },
    successLight: {
        "iconName"   : "utility:success",
        "iconVariant": "success",
        "theme"      : "slds-theme_default successBox",
        "textVariant": "slds-text-color_success"
    }
};


export default class SfpegMessageListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Configuration parameters
    //----------------------------------------------------------------
    @api wrappingClass = 'slds-box slds-box_x-small slds-theme_default'; // CSS class for the wrapping div
    @api configName;            // DeveloperName fo the sfpegMessage__mdt record to be used to configure the messages    
    @api isDebug = false;       // Activates logs
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    @track isReady = false;         // Initialization state of the component (to control spinner)
    @track errorMsg = null;         // Initialisation error message

    //----------------------------------------------------------------
    // Internal Configuration & Data Parameters
    //----------------------------------------------------------------
    @track configDetails = null;    // Global configuration of the component
    @track displayedMessages = [];  // Displayed message list (after contextual data merge & condition evaluation)

    //----------------------------------------------------------------
    // Internal Context fetch parameters
    //----------------------------------------------------------------
    
    @api objectApiName; // Object API Name for current page record (if any)
    @api recordId;      // ID of current page record (if any
    recordFields;       // List of record field names for LDS
    recordData;         // Record Data fetched via LDS

    @api userId = currentUserId;// ID of current User
    userFields;         // List of user fields for LDS
    userData;           // User Data


    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------

    get hasActions() {
        if (this.isDebug) console.log('hasActions: START');
        let result = (this.configDetails) && (this.configDetails.actions);
        if (this.isDebug) console.log('hasActions: END with ', result);
        return result;
    }

    //----------------------------------------------------------------
    // Component Initialization
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connected: START');
        if (this.isDebug) console.log('connected: objectApiName ', this.objectApiName);
        if (this.isDebug) console.log('connected: recordId ', this.recordId);
        if (this.isDebug) console.log('connected: configName', this.configName);
        
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
        if (MSG_LIST_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            this.configDetails = MSG_LIST_CONFIGS[this.configName];
            this.finalizeConfig();
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                try {
                    MSG_LIST_CONFIGS[this.configName] = {
                        template: (result.MessageDisplay__c || '{}'),
                        actions: (result.MessageActions__c || 'N/A'),
                        tokens: sfpegMergeUtl.sfpegMergeUtl.extractTokens((result.MessageDisplay__c || '{}'),this.objectApiName)
                    };
                    this.configDetails = MSG_LIST_CONFIGS[this.configName];
                    this.finalizeConfig();
                    if (this.isDebug) console.log('connected: END / configuration parsed');
                }
                catch (parseError){
                    console.warn('connected: END / configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                    this.isReady = true;
                }
                finally {
                    if (this.isDebug) console.log('connected: END');
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

    /*
    renderedCallback(){
        if (this.isDebug) console.log('rendered: START');

        if (this.isDebug) console.log('rendered: recordId ', this.recordId);
        if (this.isDebug) console.log('rendered: recordData ',JSON.stringify(this.recordData));
        if (this.isDebug) console.log('rendered: displayedMessages ',JSON.stringify(this.displayedMessages));

        if (this.isDebug) console.log('rendered: END');
    }
    */
   
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
                if (this.isDebug) console.log('wiredRecord: END / waiting for user LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: END / finalizing messages');
                this.finalizeMessages();
            }
        }
        else if (error) {
            console.warn('wiredRecord: data fetch KO', JSON.stringify(error));
            this.errorMsg = 'Record data fetch error: ' + JSON.stringify(error);
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
        if (this.isDebug) console.log('wiredRecord: tokens fetched ',JSON.stringify(this.configDetails.tokens.USR));

        if (data) {
            if (this.isDebug) console.log('wiredUser: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.tokens.USR);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredUser: END / userData updated ', JSON.stringify(this.userData));

            if ((this.recordFields) && (!this.recordData)) {
                if (this.isDebug) console.log('wiredUser: END / waiting for record LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredUser: END / finalizing messages');
                this.finalizeMessages();
            }
        }
        else if (error) {
            console.warn('wiredUser: data fetch KO', JSON.stringify(error));
            this.errorMsg = 'User data fetch error: ' + JSON.stringify(error);
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
                else if (this.configDetails.tokens.RCD){
                    ldsFetchRequired = true;
                    this.configDetails.recordFields = {};
                    this.configDetails.recordFields[this.objectApiName] = this.configDetails.tokens.RCD.ldsFields;
                    this.recordFields = this.configDetails.recordFields[this.objectApiName];
                    if (this.isDebug) console.log('finalizeConfig: recordFields init from config',JSON.stringify(this.recordFields));
                }
            }

            if (ldsFetchRequired) {
                if (this.isDebug) console.log('finalizeConfig: END / waiting for LDS data fetch');
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: END / finalizing messages');
                this.finalizeMessages();
            }
        }
        catch(error) {
            console.warn('finalizeConfig: END / processing failure',error);
            this.errorMsg = 'Processing failure: ' + JSON.stringify(error);
            this.isReady = true;
        }
    }

    //Message content merge and display conditions evaluation
    finalizeMessages = function() {
        if (this.isDebug) console.log('finalizeMessages: START');

        if (this.recordFields && !this.recordData) {
            if (this.isDebug) console.log('finalizeMessages: END / missing Record Data');
            return;
        }
        if (this.userFields && !this.userData) {
            if (this.isDebug) console.log('finalizeMessages: END / missing User Data');
            return;
        }

        if (this.isDebug) console.log('finalizeMessages: configuration ready / triggering message merge');
        this.errorMsg = '';

        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.template,this.configDetails.tokens,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
        .then( value => {
            if (this.isDebug) console.log('finalizeMessages: context merged within message template ',value);
            let rawMessages = JSON.parse(value);
            if (this.isDebug) console.log('finalizeMessages: message template parsed ',JSON.stringify(rawMessages));
            if (rawMessages) {
                let currentKey = 0;
                if (this.isDebug) console.log('finalizeMessages: evaluating conditions ');
                rawMessages.forEach(message => {
                    if (this.isDebug) console.log('finalizeMessages: processing message ',message);
                    let variantConfig = MSG_VARIANTS[(message.variant || 'base')] || MSG_VARIANTS.base;
                    if (this.isDebug) console.log('finalizeMessages: variantConfig ',variantConfig);

                    message._key = currentKey++;
                    message._msgWrapClass = (message.size ? ' slds-size_' + message.size + '-of-12 ' : ' slds-shrink-none slds-grow ') + ' slds-col  slds-grid_vertical-stretch msgWrapper';
                    //@TODO regex to include before executing eval()
                    message._isHidden = this.evalValue(message.isHidden);
                    message.msgClass = (message.msgClass || 'slds-box slds-box_x-small slds-m-vertical_xx-small') + ' slds-media slds-media_center ' + variantConfig.theme;
                    message.iconName = message.iconName || variantConfig.iconName;
                    message.iconSize = message.iconSize || variantConfig.iconSize || 'small';
                    message.iconVariant = message.iconVariant || variantConfig.iconVariant;
                    message.iconValue = message.iconValue;
                    message.textClass =  "slds-media__body " + variantConfig.textVariant;
                    if (this.isDebug) console.log('finalizeMessages: message updated ',message);
                });
                this.displayedMessages = rawMessages;
                if (this.isDebug) console.log('finalizeMessages: END / message finalized ',JSON.stringify(this.displayedMessages));
                this.isReady = true;
            }
            else {
                if (this.isDebug) console.log('finalizeMessages: END / empty parsed message ');
                this.displayedMessages = [];
                this.isReady = true;
            }
        })
        .catch( error => {
            console.warn('finalizeMessages: END / KO ', JSON.stringify(error));
            this.displayedMessages = [];
            this.errorMsg = 'Message finalization issue: ' + ((error.body || error).message || error);
            this.isReady = true;
        });
        

        if (this.isDebug) console.log('finalizeMessages: message merge triggered');
    }

    // Boolean condition evaluation
    evalValue =  function(condition) {
        //@TODO : check eval() via regex first
        if (typeof condition == "string") {
            if (this.isDebug) console.log('evalValue: String eval ', JSON.stringify(condition));
            return eval(condition);
        }
        return condition || false;
    }

    //----------------------------------------------------------------
    // Event Handlers 
    //----------------------------------------------------------------      
    handleAction(event) {
        if (this.isDebug) console.log('handleAction: START');
        
        if (this.isDebug) console.log('handleAction: button triggered ', event.target);
        let action = event.target.value;
        if (this.isDebug) console.log('handleAction: button action triggered ', JSON.stringify(action));

        if ((action) && (action.name)) {
            if (this.isDebug) console.log('handleAction: triggering action ',action.name);

            let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
            if (this.isDebug) console.log('handleAction: actionBar fetched ',actionBar);

            actionBar.executeBarAction(action.name);
            if (this.isDebug) console.log('handleAction: END / action trigered');
        }
        else {
            console.warn('handleAction: END KO / action not configured on message');
        }
    }

}