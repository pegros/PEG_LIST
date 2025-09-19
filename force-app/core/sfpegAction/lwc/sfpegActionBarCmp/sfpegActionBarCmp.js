/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display Lists of actions in a button/menu bar.
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
import { NavigationMixin } from 'lightning/navigation';
import getConfiguration from '@salesforce/apex/sfpegAction_CTL.getConfiguration';
import currentUserId from '@salesforce/user/Id';
import { getRecord, getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import sfpegMergeUtl from 'c/sfpegMergeUtl';

// Action Interaction Popup Modals
import sfpegConfirmPopupDsp from "c/sfpegConfirmPopupDsp";
import sfpegActionPopupDsp from "c/sfpegActionPopupDsp";
import sfpegFlowPopupDsp from "c/sfpegFlowPopupDsp";
import sfpegFormPopupDsp from "c/sfpegFormPopupDsp";
import sfpegFilePopupDsp from "c/sfpegFilePopupDsp";
import sfpegDisplayPopupDsp from "c/sfpegDisplayPopupDsp";
import sfpegRecordPopupDsp from "c/sfpegRecordPopupDsp";

// To notify the utility bar handler if required
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegAction              from '@salesforce/messageChannel/sfpegAction__c';           // for Utility bar communication (outgoing)
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';// for sfpegActionBarCmp component invocation (incoming/outgoing)

// Custom labels for default values
import DEFAULT_CONFIRM_HEADER   from '@salesforce/label/c.sfpegActionDefaultConfirmHeader';
import DEFAULT_CONFIRM_MESSAGE  from '@salesforce/label/c.sfpegActionDefaultConfirmMessage';

import DEFAULT_FORM_HEADER      from '@salesforce/label/c.sfpegActionDefaultFormHeader';
import DEFAULT_FORM_MESSAGE     from '@salesforce/label/c.sfpegActionDefaultFormMessage';

import DEFAULT_EXEC_HEADER      from '@salesforce/label/c.sfpegActionDefaultExecHeader';
import DEFAULT_EXEC_MESSAGE     from '@salesforce/label/c.sfpegActionDefaultExecMessage';

import DEFAULT_MASS_CONFIRM_HEADER   from '@salesforce/label/c.sfpegActionDefaultMassConfirmHeader';
import DEFAULT_MASS_CONFIRM_MESSAGE  from '@salesforce/label/c.sfpegActionDefaultMassConfirmMessage';
import DEFAULT_MASS_FORM_HEADER      from '@salesforce/label/c.sfpegActionDefaultMassFormHeader';
import DEFAULT_MASS_FORM_MESSAGE     from '@salesforce/label/c.sfpegActionDefaultMassFormMessage';
import DEFAULT_MASS_EXEC_HEADER      from '@salesforce/label/c.sfpegActionDefaultMassExecHeader';
import DEFAULT_MASS_EXEC_MESSAGE     from '@salesforce/label/c.sfpegActionDefaultMassExecMessage';

import DEFAULT_FILE_HEADER          from '@salesforce/label/c.sfpegActionDefaultFileUploadHeader';
import DEFAULT_FILE_FORM_MESSAGE    from '@salesforce/label/c.sfpegActionDefaultFileUploadFormMessage';
import DEFAULT_FILE_MESSAGE         from '@salesforce/label/c.sfpegActionDefaultFileUploadMessage';

import DEFAULT_DISPLAY_HEADER       from '@salesforce/label/c.sfpegActionDefaultDisplayHeader';
import DEFAULT_DISPLAY_MESSAGE      from '@salesforce/label/c.sfpegActionDefaultDisplayMessage';

//import DEFAULT_POPUP_HEADER     from '@salesforce/label/c.sfpegActionDefaultPopupHeader';

import EXECUTION_ERROR          from '@salesforce/label/c.sfpegActionExecutionError';
import NO_RECORD_ERROR          from '@salesforce/label/c.sfpegActionNoRecordError';
import TOO_MANY_RECORDS_ERROR   from '@salesforce/label/c.sfpegActionTooManyRecordsError';


var ACTION_CONFIGS = {};

export default class SfpegActionBarCmp extends NavigationMixin(LightningElement) {

    //################################################################
    // Component Properties
    //################################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------

    @api barClass;              // CSS Classes for the wrapping div
    @api maxSize = 100;         // Action list overflow limit
    @api isVertical = false;    // Flag to display the action bar vertically
    @api isHidden = false;      // Flag to hide the action bar and use the component as an action utility
    @api configName;            // DeveloperName fo the sfpegAction__mdt record to be used
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Merge Debug mode activation


    //----------------------------------------------------------------
    // Record List Context (for mass operations) 
    //----------------------------------------------------------------

    _recordList = null;         // parent record list contextual data (for mass operations)
    // Implementation with setter to handle context changes.
    @api
    get recordList() {
        return this._recordList;
    }
    set recordList(value) {
        if (this.isDebug) console.log('setRecordList: START set ');
        this._recordList = value;
        if (this.isDebug) console.log('setRecordList: _recordList updated ', this._recordList);
        if (this.isDebug) console.log('setRecordList: END set ');
    }
    

    //----------------------------------------------------------------
    // Custom Context (e.g. to provide default additional context for CTX merge tokens) 
    //----------------------------------------------------------------

    _parentContext = {};
    // Implementation with setter to handle context changes.
    @api
    get parentContext() {
        return this._parentContext;
    }
    set parentContext(value) {
        this._parentContext = value;
        if (this.isDebug) console.log('set Action ParentContext: START with new value ', JSON.stringify(this._parentContext));

        if (this.isDebug) console.log('set Action ParentContext: is ready ?? ', this.isReady);

        if (!this.isReady) {
            if (this.isDebug) console.log('set Action ParentContext: END / waiting for initial init completion');
        }
        else if (!this.errorMsg) {
            if (this.isDebug) console.log('set Action ParentContext: END / calling merge');
            this.doMerge();
        }
        else {
            if (this.isDebug) console.log('set Action ParentContext: END / no merge because of error state ',this.errorMsg);
        }
        if (this.isDebug) console.log('set Action ParentContext: END (final) ');
    }


    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------

    @track isReady = false;     // Initialization state of the component (to control spinner)
    @track configDetails = null;// Global applicable action configuration
    @api actionList = [];       // Contextualised action list
    
    // Internal Query Control Parameters
    @track isExecuting = false; // Ongoing Action state  (to control spinner)

    @api    objectApiName;      // Object API Name for current page record (if any)
    @api    recordId;           // ID of current page record (if any)
    @track  recordFields = null;// List of Field API Names for current page record (if any) required as Query Input
    recordData;                 // Record Data fetched via LDS

    @api    userId = currentUserId; // ID of current User
    @track  userFields = null;      // List of Field API Names for current User (if any) required as Query Input
    userData;                       // Current User Data fetched via LDS

    // Internal Display Parameter
    @track  errorMsg = null;        // Error message (if any for end user display)
    @track  mainActions = [];       // Main actions displayed (responsive & max. items)
    @track  overflowActions = [];   // Content of the overflow action menu (responsive & max. items)
    @track  overflowVariant; // Styling of the overflow action menu (based on last action included)
    
    // To notify the utility bar handler if required / receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;


    //################################################################
    // Custom Getters for UI
    //################################################################

    //----------------------------------------------------------------
    // Custom Getters for UI
    //----------------------------------------------------------------

    get hasErrorMsg () {
        return (this.configName !== 'N/A') && (this.errorMsg != null);
    }
    get hasConfig () {
        return (this.configDetails) && (this.configDetails.actions) && (this.configDetails.actions.length > 0);
    }
    get configHelp () {
        let helpString = 'Configuration ' + this.configName
                        + ((this.configDetails == null) ? ' not loaded.' :
                          ' loaded with ' + (this.actionList?.length || 0) + ' main action(s). ')
                        + '(Record ID : ' + this.recordId  + ')';
        return helpString;
    }
    get configUrl () {
        if (this.isDebug) console.log('configUrl: analysing config ', JSON.stringify(this.configDetails));
        if (this.isDebug) console.log('configUrl: extracting config ID ', this.configDetails?.id);
        return (this.configDetails?.id ? '/lightning/setup/CustomMetadata/page?address=%2F' + this.configDetails?.id : '#');
    }
    get buttonGroupClass() {
        return (this.isVertical ? '' : 'slds-button-group-list');
    }
    get buttonClass() {
        return (this.isVertical ? 'slds-m-around_xx-small' : '');
    }
    get showMainActions() {
        if (this.isDebug) console.log('showMainActions: returning ', (this.mainActions && this.mainActions.length > 0));
        return (this.mainActions && this.mainActions.length > 0);
    }
    get showOverflowMenu() {
        if (this.isDebug) console.log('showOverflowMenu: returning ', (this.overflowActions && this.overflowActions.length > 0));
        return (this.overflowActions && this.overflowActions.length > 0);
    }

    //----------------------------------------------------------------
    // Custom Getters for Parent components
    //----------------------------------------------------------------

    @api get actionConfig() {
        if (this.isDebug) console.log('actionConfig: returning ', JSON.stringify(this.actionList));
        return this.actionList;
    }


    //################################################################
    // Component Initialization / deletion
    //################################################################

    connectedCallback() {
        if (this.isDebug) console.log('connected: START for ActionBar ',this.configName);
        if (this.isDebug) console.log('connected: recordId ',this.recordId);

        //this.errorMsg = 'Component initialized.';
        if (this.isReady) {
            console.warn('connected: END for ActionBar / already ready');
            return;
        }

        if ((!this.configName) || (this.configName === 'N/A')){
            console.warn('connected: END for ActionBar / missing configuration');
            this.errorMsg = 'Missing configuration!';
            this.isReady = true;
            return;
        }

        if (this.isDebug) console.log('connected: config name fetched ', this.configName);
        if (ACTION_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END for ActionBar / configuration already available');
            //this.errorMsg = 'Local configuration fetched: ' + ACTION_CONFIGS[this.configName].label;
            this.configDetails = ACTION_CONFIGS[this.configName];
            this.finalizeConfig();
            //this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) {
                    console.log('connected: action configuration received  ',result);
                    console.log('connected: for config ',this.configName);
                }
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                try {
                    ACTION_CONFIGS[this.configName] = {
                        id:         result.Id,
                        label:      result.MasterLabel,
                        actions:    result.Actions__c,
                        doEval:     result.DoEvaluation__c,
                        channels:   JSON.parse(result.NotificationChannels__c || "[]"),
                        input:      sfpegMergeUtl.sfpegMergeUtl.extractTokens(result.Actions__c,this.objectApiName)
                    };
                    this.configDetails = ACTION_CONFIGS[this.configName];
                    if (this.isDebug) console.log('connected: action configuration parsed ',JSON.stringify(this.configDetails));
                    this.finalizeConfig();
                    //this.errorMsg = 'Configuration fetched and parsed: ' + ACTION_CONFIGS[this.configName].label;
                }
                catch(parseError){
                    console.warn('connected: action configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                }
                finally {
                    this.isReady = true;
                    if (this.isDebug) console.log('connected: END for ActionBar');
                    //this.isReady = true;
                }
            })
            .catch( error => {
                console.warn('connected: END for ActionBar / configuration fetch error ',JSON.stringify(error));
                this.errorMsg = 'Configuration fetch error: ' + error;
                this.isReady = true;
            });
            if (this.isDebug) console.log('connected: action configuration request sent');
        }
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for ActionBar ',this.configName);
        if (this.isDebug) console.log('disconnected: recordId ',this.recordId);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END for ActionBar');
    }

    renderedCallback(){
        if (this.isDebug) console.log('rendered: START for ActionBar', this.configName);
        if (this.isDebug) console.log('rendered: recordId ', this.recordId);
        //if (this.isDebug) console.log('rendered: configDetails ',JSON.stringify(this.configDetails));

        // Responsive handling in horizontal (and constrained mode)
        if (!this.isVertical) {
            let actionGroup = this.template.querySelectorAll("[data-type='containGroup']");
            if (this.isDebug) console.log('rendered: actionGroup queried ',actionGroup);
            if (this.isDebug) console.log('rendered: actionGroup[0] fetched ',actionGroup[0]);
            if (this.isDebug) console.log('rendered: actionGroup[0] offsetHeight fetched ',(actionGroup[0])?.offsetHeight);

            if ((actionGroup) && (actionGroup[0])) {
                //console.log('renderedCallback: actionGroup width determined ',actionGroup[0]?.offsetWidth);
                let groupHeight = (actionGroup[0])?.offsetHeight || 0;
                if (this.isDebug) console.log('rendered: actionGroup height determined ',groupHeight);
                //setTimeout(() => console.log('rendered: actionGroup height refetched ', (actionGroup[0])?.offsetHeight), 0);
                //if (this.isDebug) console.log('rendered: actionGroup offset height fetched ',actionGroup[0].offsetHeight);
                // 35 instead of 32
                if (groupHeight > 35) {
                    if (this.isDebug) console.log('rendered: reviewing action group size');
                    if (this.mainActions.length > 0) {
                        let lastAction =  this.mainActions.pop();
                        if (this.isDebug) console.log('rendered: lastAction popped ', lastAction);
                        this.overflowActions.unshift(lastAction);
                        if (this.isDebug) console.log('rendered: mainActions updated ', this.mainActions);
                        if (this.isDebug) console.log('rendered: overflowActions updated ', this.overflowActions);
                    }
                }
                //@Todo: refactor this part (work-around because offsetHeight not available directly.)
                else if (groupHeight == 0) {
                    if (this.isDebug) console.log('rendered: null size --> waiting for actual rendering');
                    setTimeout(() => {
                        if (this.isDebug) console.log('rendered: actionGroup height refetched ', (actionGroup[0])?.offsetHeight);
                        groupHeight = (actionGroup[0])?.offsetHeight || 0;
                        if (this.isDebug) console.log('rendered: actionGroup height re-determined ',groupHeight);
                        if (groupHeight > 35) {
                            if (this.isDebug) console.log('rendered: reviewing action group size');
                            if (this.mainActions.length > 0) {
                                let lastAction =  this.mainActions.pop();
                                if (this.isDebug) console.log('rendered: lastAction popped ', lastAction);
                                if (this.isDebug) console.log('rendered: mainActions updated ', this.mainActions);
                                this.overflowActions.unshift(lastAction);
                                if (this.isDebug) console.log('rendered: overflowActions updated ', this.overflowActions);
                            }
                        }
                    }, 0);
                }
                else {
                    if (this.isDebug) console.log('rendered: no action rework required ');
                }
            }
            else {
                if (this.isDebug) console.log('rendered: no action directly in action group (yet)');
            }
        }

        if (this.isDebug) console.log('rendered: END for ActionBar');
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------

    // Current Record 
    //@wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' }) recordData;
    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields ',JSON.stringify(this.recordFields));
        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK ', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.recordData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.RCD);
            if (this.isDebug) console.log('wiredRecord: recordData updated ', JSON.stringify(this.recordData));

            //if ((this.configDetails.input.USR) && (!this.userData)) {
            if ((this.userFields) && (!this.userData)) {
                if (this.isDebug) console.log('wiredRecord: END waiting for user LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: END calling merge');
                this.doMerge();
            }
        }
        else if (error) {
            this.recordData = null;
            console.warn('wiredRecord: END KO / data fetch failed ', JSON.stringify(error));
            console.warn('wiredRecord: for record fields ', JSON.stringify(this.recordFields));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END N/A');
        }
    };

    // Current User 
    //@wire(getRecord, { "recordId": '$userId', "fields": '$userFields' }) userData;
    @wire(getRecord, { "recordId": '$userId', "fields": '$userFields' })
    wiredUser({ error, data }) {
        if (this.isDebug) console.log('wiredUser: START with ID ', this.userId);
        if (this.isDebug) console.log('wiredUser: userFields ',JSON.stringify(this.userFields));
        if (data) {
            if (this.isDebug) console.log('wiredUser: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.USR);
            if (this.isDebug) console.log('wiredUser: userData updated ', JSON.stringify(this.userData));

            //if ((this.configDetails.input.RCD) && (!this.recordData)) {
            if ((this.recordFields) && (!this.recordData)) {
                if (this.isDebug) console.log('wiredUser: END waiting for record LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredUser: END calling merge');
                this.doMerge();
            }
        }
        else if (error) {
            this.userData = null;
            console.warn('wiredUser: END / data fetch KO ', JSON.stringify(error));
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
        if (this.isDebug) console.log('finalizeConfig: recordId ',this.recordId);

        try {
            // Subscription management
            if (this.configDetails.channels.length > 0) {
                if (!this.notificationSubscription) {
                    if (this.isDebug) console.log('finalizeConfig: subscribing to notification channels ', JSON.stringify(this.configDetails.channels));
                    this.notificationSubscription = subscribe(
                        this.messageContext,
                        sfpegCustomNotification,
                        (message) => this.handleNotification(message));
                        //{ scope: APPLICATION_SCOPE });
                }
                else {
                    if (this.isDebug) console.log('finalizeConfig: notification channels already subscribed ', JSON.stringify(this.configDetails.channels));
                }
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: no notification subscription required');
            }

            // Context fetch management
            let ldsFetchRequired = false;
            // fetching User data
            if (this.configDetails.userFields) {
                ldsFetchRequired = true;
                this.userFields = this.configDetails.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from previous',JSON.stringify(this.userFields));
            }
            else if (this.configDetails.input.USR) {
                ldsFetchRequired = true;
                //this.configDetails.userFields = [];
                //this.configDetails.input.USR.forEach(item => (this.configDetails.userFields).push('User.' + item));
                this.configDetails.userFields = this.configDetails.input.USR.ldsFields;
                this.userFields = this.configDetails.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from config',JSON.stringify(this.userFields));
            }

            // Fetching Record data
            if (this.objectApiName) {
                if (this.isDebug) console.log('finalizeConfig: analysing record fields for object ',this.objectApiName);
                //if (this.isDebug) console.log('finalizeConfig: input data ',JSON.stringify(this.configDetails.input));
                if (this.configDetails.recordFields) {
                    if (this.isDebug) console.log('finalizeConfig: analysing existing recordFields ', JSON.stringify(this.configDetails.recordFields));
                    ldsFetchRequired = true;
                    if (this.configDetails.recordFields[this.objectApiName]) {
                        this.recordFields = this.configDetails.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with same object) ',JSON.stringify(this.recordFields));
                    }
                    else {
                        this.configDetails.recordFields[this.objectApiName] = [];
                        this.configDetails.input.RCD.tokens.forEach(item => (this.configDetails.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item.field));
                        this.recordFields = this.configDetails.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with different object) ',JSON.stringify(this.recordFields));
                    }
                }
                else if (this.configDetails.input.RCD) {
                    if (this.isDebug) console.log('finalizeConfig: registering new recordFields ');
                    ldsFetchRequired = true;
                    this.configDetails.recordFields = {};
                    //this.configDetails.recordFields[this.objectApiName] = [];
                    //this.configDetails.input.RCD.forEach(item => (this.configDetails.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item));
                    this.configDetails.recordFields[this.objectApiName] = this.configDetails.input.RCD.ldsFields;
                    this.recordFields = this.configDetails.recordFields[this.objectApiName];
                    if (this.isDebug) console.log('finalizeConfig: recordFields init from config',JSON.stringify(this.recordFields));
                }
            }

            // Triggering Merge if no USR nor RCD data expected
            if (ldsFetchRequired) {
                if (this.isDebug) console.log('finalizeConfig: END / waiting for LDS data fetch');
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: END / calling merge');
                this.doMerge();
            }
        }
        catch(error) {
            console.warn('finalizeConfig: END / processing failure',error);
            this.isReady = true;
        }
    }

    // Configuration data merge
    doMerge = function(){
        if (this.isDebug) console.log('doMerge: START with ',this.configDetails.actions);
        if (this.isDebug) console.log('doMerge: recordId ',this.recordId);
        if (this.isDebug) console.log('doMerge: parent Context ',JSON.stringify(this._parentContext));

        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.actions,this.configDetails.input,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null,this._parentContext)
        .then( value => {
            if (this.isDebug) console.log('doMerge: context merged within configuration ',value);
            let actionList = JSON.parse(value);
            if (this.isDebug) console.log('doMerge: configuration updated', JSON.stringify(actionList));
            if (this.configDetails.doEval) {
                //@TODO put in subfunction
                if (this.isDebug) console.log('doMerge: evaluating complex hidden/disabled flags');
                actionList.forEach(iterAction => {
                    if (this.isDebug) console.log('doMerge: processing action ', iterAction.name);
                    if (iterAction.hasOwnProperty('hidden'))    iterAction.hidden = this.evalValue(iterAction.hidden);
                    if (iterAction.hasOwnProperty('disabled'))  iterAction.disabled = this.evalValue(iterAction.disabled);
                    if (iterAction.params) iterAction.params.name = iterAction.params.name || iterMenu.name;
                    if (this.isDebug) console.log('doMerge: hidden / disabled reevaluated',JSON.stringify(iterAction));
                    if (iterAction.items) {
                        iterAction.items.forEach(iterMenu => {
                            if (this.isDebug) console.log('doMerge: processing menu item ', iterMenu.name);
                            if (iterMenu.hasOwnProperty('hidden'))    iterMenu.hidden = this.evalValue(iterMenu.hidden);
                            if (iterMenu.hasOwnProperty('disabled'))  iterMenu.disabled = this.evalValue(iterMenu.disabled);
                            if (iterMenu.params) iterMenu.params.name = iterMenu.params.name || iterMenu.name;
                            if (this.isDebug) console.log('doMerge: hidden / disabled reevaluated',JSON.stringify(iterMenu));
                        });
                    }
                });
            }
            else {
                if (this.isDebug) console.log('doMerge: basic init');
                actionList.forEach(iterAction => {
                    if (this.isDebug) console.log('doMerge: processing action ', iterAction.name);
                    if (iterAction.params) iterAction.params.name = iterAction.params.name || iterMenu.name;
                    if (this.isDebug) console.log('doMerge: name reevaluated',JSON.stringify(iterAction));
                    if (iterAction.items) {
                        iterAction.items.forEach(iterMenu => {
                            if (this.isDebug) console.log('doMerge: processing menu item ', iterMenu.name);
                            if (iterMenu.params) iterMenu.params.name = iterMenu.params.name || iterMenu.name;
                            if (this.isDebug) console.log('doMerge: name reevaluated',JSON.stringify(iterMenu));
                        });
                    }
                });
            }
            if (this.isDebug) console.log('doMerge: priori overflowVariant ', this.overflowVariant);
            if (this.isDebug) console.log('doMerge: overflowVariant actionList ', JSON.stringify(actionList));
            this.overflowVariant = (actionList[0]?.variant || 'border');
            this.overflowVariant = this.overflowVariant === 'base' ? 'container' : this.overflowVariant;
            if (this.isDebug) console.log('doMerge: overflowVariant init ', this.overflowVariant);
            this.actionList = actionList;

            //Responsive Handling (horizontal)
            if (!this.isVertical) {
                if (this.isDebug) console.log('doMerge: maxSize', this.maxSize);
                if (this.maxSize) {
                    if (this.isDebug) console.log('doMerge: splitting according to maxSize');
                    this.mainActions = actionList.slice(0,this.maxSize);
                    if (this.isDebug) console.log('doMerge: mainActions init ', this.mainActions);
                    this.overflowActions = actionList.slice(this.maxSize);
                    if (this.isDebug) console.log('doMerge: overflowActions init ', this.overflowActions);
                }
                else if (this.maxSize == 0) {
                    if (this.isDebug) console.log('doMerge: all actions set in overflow');
                    this.mainActions = null;
                    if (this.isDebug) console.log('doMerge: mainActions init ', this.mainActions);
                    this.overflowActions = actionList;
                    if (this.isDebug) console.log('doMerge: overflowActions init ', this.overflowActions);
                }
                else {
                    if (this.isDebug) console.log('doMerge: no split to maxSize required');
                    this.mainActions = actionList;
                    if (this.isDebug) console.log('doMerge: mainActions init ', this.mainActions);
                }
            }

            //Ready Notification
            let readyEvt = new CustomEvent('ready', null);
            if (this.isDebug) console.log('doMerge: END / triggering readyEvt', JSON.stringify(readyEvt));
            this.dispatchEvent(readyEvt);
        }).catch( error => {
            console.warn('doMerge: KO ',JSON.stringify(error));
            //console.warn('doMerge: KO ',error);
            this.displayMsg = JSON.stringify(error);
        }).finally( () => {
            //sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            this.isReady = true;
        });

        if (this.isDebug) console.log('doMerge: merge requested ');
    }

    // Boolean condition evaluation
    evalValue =  function(condition) {
        //@TODO : check eval() via regex first
        if (typeof condition == "string") {
            if (this.isDebug) console.log('evalValue: string condition ', JSON.stringify(condition));
            return eval(condition);
        }
        return condition || false;
    } 

    //################################################################
    // Interface actions
    //################################################################

    // Parent action execution service (for Action Handler parent component, no merge done)
    @api executeAction(action,context) {
        if (this.isDebug) console.log('executeAction: START', JSON.stringify(action));
        if (this.isDebug) console.log('executeAction: with context ', JSON.stringify(context));
        this.processAction(action,context);
        if (this.isDebug) console.log('executeAction: END');
    }

    // Component action execution service (for misc parent components, e.g. list ones, with context merge done)
    @api executeBarAction(actionName, context) {
        if (this.isDebug) console.log('executeBarAction: START with ', actionName);
        if (this.isDebug) console.log('executeBarAction: and context ', JSON.stringify(context));
        if (this.isDebug) console.log('executeBarAction: configName fetched ', this.configName);
        if (this.isDebug) console.log('executeBarAction: configDetails fetched ', JSON.stringify(this.configDetails));
        if (this.isDebug) console.log('executeBarAction: actionList fetched ', JSON.stringify(this.actionList));
        
        if (!this.actionList) {
            console.warn('executeBarAction: END KO / Action initialisation failed');
            throw new Error("Cannot execute action due to initialisation failure!");
        }

        /*let action = (this.configDetails.actionList).find(item => {
            if (this.isDebug) console.log('executeBarAction: analysing ', JSON.stringify(item));
            return item.name === actionName;
        });*/
        // Replaced to be able to call action on menu entries
        let action = null;
        (this.actionList).forEach(item => {
            if (this.isDebug) console.log('executeBarAction: analysing ', JSON.stringify(item));
            if (item.items) {
                if (this.isDebug) console.log('executeBarAction: processing menu entries ');
                (item.items).forEach(menuItem => {
                    if (this.isDebug) console.log('executeBarAction: processing menu entry ',JSON.stringify(menuItem));
                    if (menuItem.name === actionName) {
                        if (this.isDebug) console.log('executeBarAction: action found');
                        action = menuItem;
                    }
                });
            }
            else {
                if (this.isDebug) console.log('executeBarAction: processing button entry');
                if (item.name === actionName) {
                    if (this.isDebug) console.log('executeBarAction: action found');
                    action = item;
                }
            }
        });

        if (action) {
            if (this.isDebug) console.log('executeBarAction: launching action',JSON.stringify(action));

            if (action.disabled) {
                console.warn('executeBarAction: END KO / Action disabled');
                throw new Error("Cannot execute disabled action!");
            }

            if (context) {
                if (this.isDebug) console.log('executeBarAction: merging context data in action ');
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                sfpegMergeUtl.sfpegMergeUtl.mergeTokens(JSON.stringify(action.action),this.configDetails.input,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,context,this._parentContext)
                .then( value => {
                    if (this.isDebug) console.log('executeBarAction: action contextualised ',value);
                    let mergedAction = JSON.parse(value);
                   
                    if (mergedAction) {
                        if (this.isDebug) console.log('executeBarAction: calling contextualised action ');
                        this.processAction(mergedAction,context);
                        if (this.isDebug) console.log('executeBarAction: END / call after context merge');
                    }
                    else {
                        console.warn('executeBarAction: calling contextualised action ');
                        throw new Error("Parsing of contextualised action failed!");
                    }
                }).catch( error => {
                    this.displayMsg = JSON.stringify(error);
                    console.warn('executeBarAction: KO while merging context ',error);
                });
            }
            else {
                if (this.isDebug) console.log('executeBarAction: no context merge required for action ');
                this.processAction(action.action,context);
                if (this.isDebug) console.log('executeBarAction: END / direct call ');
            }
        }
        else {
            console.warn('executeBarAction: END KO / action not found in config ',actionName);
        }
    }

    // Action execution handler for notifications from external components (no merge done)
    handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START with message ',JSON.stringify(message));

        if (message.channel) {
            if (this.configDetails.channels.includes(message.channel)) {
                if (message.context) {
                    if (this.isDebug) console.log('handleNotification: overriding current recordList context ',JSON.stringify(message.context));
                    this._recordList = message.context;
                }
                if (this.isDebug) console.log('handleNotification: END / processing message on subscribed channel ',message.channel);
                this.processAction(message.action,null);
            }
            else {
                if (this.isDebug) console.log('handleNotification: END / message ignored as on unsubscribed channel ',message.channel);
            }
        }
        else {
            console.warn('handleNotification: END / channel information missing in notification');
        }
    }

    //################################################################
    // Event Handlers
    //################################################################

    //----------------------------------------------------------------
    // Action triggers
    //----------------------------------------------------------------
    handleButtonClick(event){
        if (this.isDebug) console.log('handleButtonClick: START with ',JSON.stringify(event.target.value));
        if (this.isDebug) console.log('handleButtonClick: recordId ',this.recordId);
        //this.executeAction(event.target.value.action);
        this.processAction(event.target.value.action,null);
        if (this.isDebug) console.log('handleButtonClick: END');
    }

    handleMenuSelect(event){
        if (this.isDebug) console.log('handleMenuSelect: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleMenuSelect: recordId ',this.recordId);
        //this.executeAction(event.detail.value.action);
        this.processAction(event.detail.value.action,null);
        if (this.isDebug) console.log('handleMenuSelect: END');
    }

    handleOverflowMenuSelect(event) {
        if (this.isDebug) console.log('handleOverflowMenuSelect: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleOverflowMenuSelect: recordId ',this.recordId);
        //this.executeAction(event.detail.value.action);
        this.processAction(event.detail.value.action,null);
        if (this.isDebug) console.log('handleOverflowMenuSelect: END');
    }

    //################################################################
    // Action Processing Utilities
    //################################################################

    //----------------------------------------------------------------
    // Main Action Processing Utility
    //----------------------------------------------------------------

    processAction = function(action,context) {
        // context is kept in the signature only for the "open" and "edit" action
        if (this.isDebug) console.log('processAction: START');
        if (this.isDebug) console.log('processAction: recordId ',this.recordId);
        if (this.isDebug) console.log('processAction: action triggered ',JSON.stringify(action));
        if (this.isDebug) console.log('processAction: context provided ',JSON.stringify(context));

        switch (action.type) {
            case 'navigation':
                if (this.isDebug) console.log('processAction: processing navigation action');
                this.triggerNavigate(action.params);
                break;
            case 'open':
                let recordIdString = (context == null ? this.recordId : context.Id);
                if (recordIdString){
                    if (this.isDebug) console.log('processAction: processing record open action on ',recordIdString);
                    this.triggerNavigate({  type:"standard__recordPage",
                                            attributes:{'recordId':recordIdString, 'actionName':"view"}});
                }
                else {
                    console.warn('processAction: record open action requires a current record Id or a context object with Id field');
                }
                break;
            case 'edit':
                let recordIdStr = (context == null ? this.recordId : context.Id);
                if (recordIdStr) {
                    if (this.isDebug) console.log('processAction: processing standard ecord edit action on ',recordIdStr);
                    this.triggerNavigate({  type:"standard__recordPage",
                                            attributes:{'recordId': recordIdStr, 'actionName':"edit"}});
                }
                else {
                    console.warn('processAction: record edit action requires a current record Id or a context object with Id field');
                }
                break;
            case 'openURL':
                if (this.isDebug) console.log('processAction: processing openURL action');
                this.triggerOpenURL(action.params);
                break;
            case 'flow':
                if (this.isDebug) console.log('processAction: processing flow action');
                this.triggerFlow(action.params);
                break;
            case 'create':
            case 'update':
                if (this.isDebug) console.log('processAction: executing standard record form action of type ',action.type);
                this.triggerRecordFormAction(action.type,action.params);
                break;
            case 'LDS':
            case 'DML':
            case 'apex':
                if (this.isDebug) console.log('processAction: executing direct action of type ',action.type);
                this.triggerDirectAction(action.type,action.params);
                break;
            case 'ldsForm':
            case 'dmlForm':
            case 'apexForm':
                if (this.isDebug) console.log('processAction: executing form action of type ',action.type);
                this.triggerFormAction(action.type,action.params);
                break;
            case 'massDML':
            case 'massApex':
            case 'massForm':
            case 'massApexForm':
                if (this.isDebug) console.log('processAction: executing mass action of type ',action.type);
                this.triggerMassAction(action.type,action.params);
                break;
            case 'showDetails':
                if (this.isDebug) console.log('processAction: showing details popup');
                this.triggerShowDetails(action.params);
                break;
            case 'upload':
                if (this.isDebug) console.log('processAction: processing file Upload action');
                this.triggerFileUpload(action.params);
                break;
            case 'download':
                if (this.isDebug) console.log('processAction: processing file Download action');
                this.triggerFileDownload(action.params);
                break;
            case 'reload':
                if (this.isDebug) console.log('processAction: processing record LDS reload action');
                this.triggerReload(action.params);
                break;
            case 'done':
                if (this.isDebug) console.log('processAction: processing parent component notification (on done)');
                this.triggerParentEvt(action.params);
                break;
            case 'toast':
                if (this.isDebug) console.log('processAction: displaying toast');
                this.triggerToast(action.params);
                break;
            case 'utility':
                //if (this.isDebug) console.log('processAction: triggering utility action');
                //this.triggerUtilityAction(action.params,action.hasSelection);
                //break;
            case 'action':
                //if (this.isDebug) console.log('processAction: triggering action on custom LWC component via channel ',action.channel);
                //this.triggerCustomAction(action.params,action.channel,action.hasSelection);
                //break;
            case 'notify':
                //if (this.isDebug) console.log('processAction: notifying action to other component via channel ',action.channel);
                //this.triggerCustomNotification(action.params,action.channel,action.hasSelection);
                if (this.isDebug) console.log('processAction: triggering notification of type ', action.type);
                this.triggerNotification(action.type, action.channel, action.params,action.selection);
                break;
            case 'clipboard':
                if (this.isDebug) console.log('processAction: processing clipboard action');
                this.triggerClipboard(action.params);
                break;
            default:
                if (this.isDebug) console.log('processAction: END / action type for parent component ?',action.type);
                this.triggerParentEvt(action);
                return;
        }
        if (this.isDebug) console.log('processAction: action triggered');
    
        if (action.next) {
            if (this.isDebug) console.log('processAction: chained action to trigger',JSON.stringify(action.next));
            this.processAction(action.next,context);
            if (this.isDebug) console.log('processAction: chained action triggered');
        }
        else {
            if (this.isDebug) console.log('processAction: no chained action to trigger');
        }
        if (this.isDebug) console.log('processAction: END');
    }


    //----------------------------------------------------------------
    // Navigation Action Utilities
    //----------------------------------------------------------------

    triggerNavigate = function(targetPageRef) {
        if (this.isDebug) console.log('triggerNavigate: START with ',JSON.stringify(targetPageRef));

        // Workaround to handle issue with null lookup values in default field values in object creation page.
        if (    (targetPageRef.type === 'standard__objectPage')
            &&  (targetPageRef.attributes) && (targetPageRef.attributes.actionName === 'new')
            &&  (targetPageRef.state) && (targetPageRef.state.defaultFieldValues)) {
            if (this.isDebug) console.log('triggerNavigate: removing empty default values in creation page ',targetPageRef.state.defaultFieldValues);
            let regexp = /[^,]([\w]+=(,|$))/gi;
            //let newDefaults = (targetPageRef.state.defaultFieldValues).replaceAll(regexp,'');
            let newDefaults = (targetPageRef.state.defaultFieldValues).replace(regexp,'');
            if (this.isDebug) console.log('triggerNavigate: empty default values removed ',newDefaults);
            // Hack to be able to modify data set by other method.
            targetPageRef = JSON.parse(JSON.stringify(targetPageRef));
            targetPageRef.state.defaultFieldValues = newDefaults;
            if (this.isDebug) console.log('triggerNavigate: new default values set ',JSON.stringify(targetPageRef));
        }
        
        //this[NavigationMixin.GenerateUrl](targetPageRef).then(url => {
        //    console.log('triggerNavigate: url generated ',url);
        //});
        this[NavigationMixin.Navigate](targetPageRef);
        if (this.isDebug) console.log('triggerNavigate: END');
    }

    triggerOpenURL = function(targetUrl) {
        if (this.isDebug) console.log('triggerOpenURL: START with ',JSON.stringify(targetUrl));

        if (!targetUrl.url) {
            console.warn('triggerOpenURL: END KO / missing url field in OpenURL params');
            this.showError({message: 'Missing url property in OpenURL action!'});
            throw new Error("Missing url field in OpenURL params!");
        }

        let openUrl = targetUrl.url;
        if (targetUrl.reworkURL) {
            // Utilities to rework some URLs before navigation --> only SUBSTR() operation supported for now
            if (this.isDebug) console.log('triggerOpenURL: reworking targetUrl');
            if (targetUrl.url.includes("SUBSTR(")) {
                if (this.isDebug) console.log('triggerOpenURL: processing SUBSTR rework');
                let regexp = /SUBSTR\(([\.\,\'\w_-]*)\)/gi;
                let reworkKeys = openUrl.match(regexp);
                if (this.isDebug) console.log('triggerOpenURL: SUBSTR keys extracted ', reworkKeys);
                reworkKeys.forEach(keyIter => {
                    if (this.isDebug) console.log('triggerOpenURL: processing key ', keyIter);
                    let keyParams = keyIter.slice(7,-1);
                    if (this.isDebug) console.log('triggerOpenURL: keyParams extracted ', keyParams);
                    let keyparts = keyParams.split(',');
                    if (this.isDebug) console.log('triggerOpenURL: key parts extracted ', keyparts);
                    let keyValue = keyparts[0];
                    let keySplit = keyparts[1].slice(1,-1);
                    if (this.isDebug) console.log('triggerOpenURL: keySplit extracted ', keySplit);
                    let keyIndex = keyparts[2];
                    if (this.isDebug) console.log('triggerOpenURL: keyIndex extracted ', keyIndex);
                    let newValue = (keyValue.split(keySplit))[keyIndex];
                    if (this.isDebug) console.log('triggerOpenURL: newValue computed ', newValue);
                    let keyRegex = new RegExp("SUBSTR\\(" + keyParams + "\\)"  , 'g');
                    if (this.isDebug) console.log('triggerOpenURL: keyRegex computed ', keyRegex);
                    openUrl = openUrl.replace(keyRegex,newValue);
                    if (this.isDebug) console.log('triggerOpenURL: targetUrl reworked ', targetUrl);
                });
            }
            if (targetUrl.url.includes("LEFT(")) {
                if (this.isDebug) console.log('triggerOpenURL: processing LEFT rework');
                let regexp = /LEFT\(([\.\,\'\w_-]*)\)/gi;
                let reworkKeys = openUrl.match(regexp);
                if (this.isDebug) console.log('triggerOpenURL: LEFT keys extracted ', reworkKeys);
                reworkKeys.forEach(keyIter => {
                    if (this.isDebug) console.log('triggerOpenURL: processing key ', keyIter);
                    let keyParams = keyIter.slice(5,-1);
                    if (this.isDebug) console.log('triggerOpenURL: keyParams extracted ', keyParams);
                    let keyparts = keyParams.split(',');
                    if (this.isDebug) console.log('triggerOpenURL: key parts extracted ', keyparts);
                    let keyValue = keyparts[0];
                    let keyLength = keyparts[1];
                    if (this.isDebug) console.log('triggerOpenURL: keyLength extracted ', keyLength);
                    
                    let newValue = keyValue.substring(0, keyLength);
                    if (this.isDebug) console.log('triggerOpenURL: newValue computed ', newValue);
                    let keyRegex = new RegExp("LEFT\\(" + keyParams + "\\)"  , 'g');
                    if (this.isDebug) console.log('triggerOpenURL: keyRegex computed ', keyRegex);
                    openUrl = openUrl.replace(keyRegex,newValue);
                    if (this.isDebug) console.log('triggerOpenURL: targetUrl reworked ', targetUrl);
                });
            }
        }

        let target = targetUrl.target || '_blank';
        if (this.isDebug) console.log('triggerOpenURL: target evaluated ',target);

        window.open(openUrl,target);
        if (this.isDebug) console.log('triggerOpenURL: END');
    }


    //----------------------------------------------------------------
    // Direct Action Utilities
    //----------------------------------------------------------------

    triggerDirectAction = function (type,operation) {
        if (this.isDebug) console.log('triggerDirectAction: START for action ', operation?.name);
        if (this.isDebug) console.log('triggerDirectAction: of type ', type);
        if (this.isDebug) console.log('triggerDirectAction: with params ', JSON.stringify(operation));

        let confirmPromise;
        if (operation.bypassConfirm) {
            if (this.isDebug) console.log('triggerDirectAction: bypassing confirmation');
            confirmPromise = new Promise((resolve,reject) => {
                if (this.isDebug) console.log('triggerDirectAction: confirmation bypassed');
                resolve({isConfirmed: true});
            });
        }
        else {
            if (this.isDebug) console.log('triggerDirectAction: not bypassing confirmation');
            let confirmParams = {
                modalHeader: operation.title || DEFAULT_CONFIRM_HEADER,
                modalMessage: operation.message || DEFAULT_CONFIRM_MESSAGE,
                modalHelp: operation.help,
                modalClass: operation.class,
                description: operation.description,
                size: operation.size || 'small',
                isDebug: this.isDebug
            };
            if (this.isDebug) console.log('triggerDirectAction: opening confirmation popup with params ',JSON.stringify(confirmParams));
            confirmPromise = sfpegConfirmPopupDsp.open(confirmParams);
        }
        if (this.isDebug) console.log('triggerDirectAction: confirmation promise initialised');

        confirmPromise.then((result) => {
            if (this.isDebug) console.log('triggerDirectAction: confirmation status received ',result?.isConfirmed);

            if (result?.isConfirmed) {
                if (this.isDebug) console.log('triggerDirectAction: operation confirmed');

                let executeParams = {
                    modalHeader: operation.title || DEFAULT_EXEC_HEADER,
                    modalMessage: operation.message || DEFAULT_EXEC_MESSAGE,
                    modalHelp: operation.help,
                    modalClass: operation.class,
                    description: operation.description,
                    size: operation.size || 'small',
                    actionConfig: this.configName,
                    actionType: type,
                    actionParams: operation,
                    isDebug: this.isDebug
                };
                if (this.isDebug) console.log('triggerDirectAction: opening action popup with params ',JSON.stringify(executeParams));
                return sfpegActionPopupDsp.open(executeParams);
            }
            else {
                if (this.isDebug) console.log('triggerDirectAction: action cancelled in popup');
                return new Promise((resolve,reject) => {
                    if (this.isDebug) console.log('triggerDirectAction: returning cancellation promise');
                    resolve({isCancelled: true});
                });            }
        }).then((result) => {
            if (this.isDebug) console.log('triggerDirectAction: operation status received',JSON.stringify(result));

            if (result?.isCancelled) {
                if (this.isDebug) console.log('triggerDirectAction: END / direct action cancelled');
            }
            else if (result?.isCompleted) {
                if (this.isDebug) console.log('triggerDirectAction: successful operation result received ',JSON.stringify(result));

                if (operation.next) {
                    if (this.isDebug) console.log('triggerDirectAction: chained action to trigger',JSON.stringify(operation.next));
                    this.processAction(operation.next,result.result);
                    if (this.isDebug) console.log('triggerDirectAction: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerDirectAction: END / no chained action to trigger');
                }
            }
            else {
                console.warn('triggerDirectAction: operation failure received ',JSON.stringify(result));

                if (operation.error) {
                    if (this.isDebug) console.log('triggerDirectAction: chained error action to trigger',JSON.stringify(operation.error));
                    this.processAction(operation.error, result?.error);
                    if (this.isDebug) console.log('triggerDirectAction: END / chained error action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerDirectAction: END / no chained error action to trigger');
                }
            }
        }).catch((error) => {
            console.error('triggerDirectAction: END KO / action execution popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
        if (this.isDebug) console.log('triggerDirectAction: confirmation popup displayed');
    }
    

    //----------------------------------------------------------------
    // Form Action Utilities
    //----------------------------------------------------------------

    triggerFormAction = function(type,formAction) {
        if (this.isDebug) console.log('triggerFormAction: START for type ', type);
        if (this.isDebug) console.log('triggerFormAction: with params ',JSON.stringify(formAction));

        if (type === 'ldsForm') {
            if ((!formAction.record) || (!formAction.fields)) {
                console.warn('triggerFormAction: END KO / Missing record and/or fields properties');
                this.showError({message: 'Missing record and/or fields properties in LDS form action configuration!'});
                throw new Error("Missing record and/or fields properties in LDS form action configuration!");
            }
        }
        else {
            if ((!formAction.formRecord) || (!formAction.formFields)) {
                console.warn('triggerFormAction: END KO / Missing form record and/or fields properties');
                this.showError({message: 'Missing form record and/or fields properties in non LDS form action action configuration!'});
                throw new Error("Missing form record and/or fields properties in non LDS form action configuration!");
            }
        }
        if (this.isDebug) console.log('triggerFormAction: form params OK ');
        
        let formParams = {
            modalHeader: formAction.modalHeader || formAction.title || DEFAULT_FORM_HEADER,
            modalMessage: formAction.modalMessage || formAction.message || DEFAULT_FORM_MESSAGE,
            modalHelp: formAction.help,
            modalClass: formAction.class,
            description: formAction.description,
            size: formAction.size || 'small',
            columns: formAction.columns,
            variant: formAction.variant,
            actionType: type,
            record: (type === 'ldsForm' ? formAction.record : formAction.formRecord),
            fields: (type === 'ldsForm' ? formAction.fields : formAction.formFields),
            doSubmit: (type === 'ldsForm'),
            objectApiName: this.objectApiName,
            recordId: this.recordId,
            userId: this.userId,
            isDebug: formAction.isDebug || this.isDebug
        };
        if (this.isDebug) console.log('triggerFormAction: opening form popup with params ', JSON.stringify(formParams));

        if (this.isDebug) console.log('triggerFormAction: sfpegFormPopupDsp ', sfpegFormPopupDsp);
        sfpegFormPopupDsp.open(formParams)
        .then((result) => {
            if (this.isDebug) console.log('triggerFormAction: form popup closed with result ',JSON.stringify(result));

            if (! result?.doNext) {
                if (this.isDebug) console.log('triggerFormAction: form action cancelled in popup');
                return new Promise((resolve,reject) => {
                    if (this.isDebug) console.log('triggerFormAction: returning cancellation promise');
                    resolve({isCancelled: true});
                });
            }

            let executePromise;
            switch (type) {
                case 'ldsForm':
                    if (this.isDebug) console.log('triggerFormAction: LDS form action completed');
                    executePromise = new Promise((resolve,reject) => {
                        if (this.isDebug) console.log('triggerFormAction: execution bypassed');
                        resolve({isCompleted: true});
                    });
                    break;
                case 'dmlForm':
                    if (this.isDebug) console.log('triggerFormAction: preparing DML data');
                    let dmlParams = {
                        modalHeader: formAction.title || DEFAULT_EXEC_HEADER,
                        modalMessage: formAction.messageSave || formAction.message || DEFAULT_EXEC_MESSAGE,
                        modalHelp: formAction.help,
                        modalClass: formAction.class,
                        description: formAction.description,
                        size: formAction.size || 'small',
                        actionType: 'DML',
                        actionConfig: this.configName,
                        actionParams: {
                            name: formAction.name,
                            params: {
                                operation: ((formAction.record.Id)? 'update' : 'insert'),
                                records: []
                            }
                        },
                        isDebug: this.isDebug
                    };
                    if (this.isDebug) console.log('triggerFormAction: main DML params init ', JSON.stringify(dmlParams));

                    const ignoredFields = ['ObjectApiName','RecordTypeId'];
                    let fieldMapping = formAction.fieldMapping || {};
                    if (this.isDebug) console.log('triggerFormAction: fieldMapping set ',JSON.stringify(fieldMapping));
                    let outputRecord = {...(formAction.record)};
                    if (this.isDebug) console.log('triggerFormAction: outputRecord cloned ',JSON.stringify(outputRecord));
                    if (this.isDebug) console.log('triggerFormAction: analysing input ',JSON.stringify(result.record));
                    for (let iterField in result.record) {
                        if (this.isDebug) console.log('triggerFormAction: processing field ',iterField);
                        if ((ignoredFields.includes(iterField))) {
                            if (this.isDebug) console.log('triggerFormAction: ignoring field ',iterField);
                        }
                        else {
                            if (this.isDebug) console.log('triggerFormAction: merging field ',iterField);
                            let targetIterField =  fieldMapping[iterField] || iterField;
                            if (this.isDebug) console.log('triggerFormAction: in field ',targetIterField);
                            outputRecord[targetIterField] = (result.record)[iterField];
                        }
                    }
                    if (this.isDebug) console.log('triggerFormAction: DML record prepared ',JSON.stringify(outputRecord));
                    (dmlParams.actionParams.params.records).push(outputRecord);

                    if (this.isDebug) console.log('triggerFormAction: opening execution popup with params ', JSON.stringify(dmlParams));
                    executePromise = sfpegActionPopupDsp.open(dmlParams);
                    break;
                case 'apexForm':
                    if (this.isDebug) console.log('triggerFormAction: preparing APEX data');
                    let apexParams = {
                        modalHeader: formAction.title || DEFAULT_EXEC_HEADER,
                        modalMessage: formAction.messageSave || formAction.message || DEFAULT_EXEC_MESSAGE,
                        modalHelp: formAction.help,
                        modalClass: formAction.class,
                        description: formAction.description,
                        size: formAction.size || 'small',
                        actionType: 'apex',
                        actionConfig: this.configName,
                        actionParams: {
                            name: formAction.name,
                            params: {
                                params: formAction.params,
                                input: result.record
                            }
                        },
                        isDebug: this.isDebug
                    };                    
                    if (this.isDebug) console.log('triggerFormAction: opening execution popup with params ', JSON.stringify(apexParams));
                    executePromise = sfpegActionPopupDsp.open(apexParams);
                    break;
                default:
                    console.warn('triggerFormAction: END KO / Unsupported operation type',type);
                    return;
            }
            if (this.isDebug) console.log('triggerFormAction: launching execution promise');
            return executePromise;
        }).then((result) => {
            if (this.isDebug) console.log('triggerFormAction: execution status received',JSON.stringify(result));

            if (result?.isCancelled) {
                if (this.isDebug) console.log('triggerFormAction: END / form action cancelled');
            }
            else if (result?.isCompleted) {
                if (this.isDebug) console.log('triggerFormAction: successful operation result received ',JSON.stringify(result));

                if (formAction.next) {
                    if (this.isDebug) console.log('triggerFormAction: chained action to trigger',JSON.stringify(formAction.next));
                    this.processAction(formAction.next,result.result);
                    if (this.isDebug) console.log('triggerFormAction: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerFormAction: END / no chained action to trigger');
                }
            }
            else {
                console.warn('triggerFormAction: operation failure received ',JSON.stringify(result));

                if (formAction.error) {
                    if (this.isDebug) console.log('triggerFormAction: chained error action to trigger',JSON.stringify(operation.error));
                    this.processAction(formAction.error, result?.error);
                    if (this.isDebug) console.log('triggerFormAction: END / chained error action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerFormAction: END / no chained error action to trigger');
                }
            }
        }).catch((error) => {
            console.error('triggerFormAction: END KO / action form or execution popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
        if (this.isDebug) console.log('triggerFormAction: form popup displayed');
    }

    triggerRecordFormAction = function(type,formAction) {
        if (this.isDebug) console.log('triggerRecordFormAction: START for type ', type);
        if (this.isDebug) console.log('triggerRecordFormAction: with params ',JSON.stringify(formAction));

        if (!formAction.objectApiName) {
            console.warn('triggerRecordFormAction: END KO / Missing objectApiName action property');
            this.showError({message: 'Missing objectApiName property in create/update action configuration!'});
            throw new Error("Missing objectApiName property in create/update action configuration!");
        }
        if ((type === 'update') && (!formAction.recordId)) {
            console.warn('triggerRecordFormAction: END KO / Missing recordId action property');
            this.showError({message: 'Missing recordId property in update action configuration!'});
            throw new Error("Missing recordId property in update action configuration!");
        }
        if (this.isDebug) console.log('triggerRecordFormAction: form params OK ');
        
        let formParams = {
            modalHeader: formAction.modalHeader || formAction.title || DEFAULT_FORM_HEADER,
            modalMessage: formAction.modalMessage || formAction.message || DEFAULT_FORM_MESSAGE,
            modalHelp: formAction.help,
            modalClass: formAction.class,
            description: formAction.description,
            size: formAction.size || 'small',
            columns: formAction.columns,
            density: formAction.density,
            objectApiName: formAction.objectApiName,
            recordId: formAction.recordId,
            recordTypeId: formAction.recordTypeId,
            isDebug: formAction.isDebug || this.isDebug
        };
        if (this.isDebug) console.log('triggerRecordFormAction: opening form popup with params ', JSON.stringify(formParams));

        sfpegRecordPopupDsp.open(formParams) 
        .then((result) => {
            if (this.isDebug) console.log('triggerRecordFormAction: execution status received',JSON.stringify(result));

            if (result?.doNext) {
                if (formAction.next) {
                    if (this.isDebug) console.log('triggerRecordFormAction: chained action to trigger',JSON.stringify(formAction.next));
                    this.processAction(formAction.next,null);
                    if (this.isDebug) console.log('triggerRecordFormAction: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerRecordFormAction: END / no chained action to trigger');
                }
            }
            else {
                if (this.isDebug) console.log('triggerRecordFormAction: END / operation cancelled');
            }
        }).catch((error) => {
            console.error('triggerRecordFormAction: END KO / record form popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
        if (this.isDebug) console.log('triggerRecordFormAction: form popup displayed');
    }

    //----------------------------------------------------------------
    // Mass Action Utilities
    //----------------------------------------------------------------

    triggerMassAction = function(type,massAction) {
        if (this.isDebug) console.log('triggerMassAction: START for type ', type);
        if (this.isDebug) console.log('triggerMassAction: with params ',JSON.stringify(massAction));

        if (!(this._recordList?.length > 0)) {
            console.warn('triggerMassAction: END / no record to process');
            this.showError({message: NO_RECORD_ERROR},'warning');
            return;
        }
        if (this.isDebug) console.log('triggerMassAction: #records to process ',this._recordList?.length);

        let startPromise;
        switch (type) {
            case 'massDML':
            case 'massApex':
                if (this.isDebug) console.log('triggerMassAction: direct action mode');
                if (massAction?.bypassConfirm) {
                    if (this.isDebug) console.log('triggerMassAction: bypassing confirmation');
                    startPromise = new Promise((resolve,reject) => {
                        if (this.isDebug) console.log('triggerMassAction: confirmation bypassed');
                        resolve({isConfirmed: true});
                    });
                }
                else {
                    if (this.isDebug) console.log('triggerMassAction: not bypassing confirmation');
                    let confirmParams = {
                        modalHeader: (massAction.title || DEFAULT_MASS_CONFIRM_HEADER)?.replace('{0}',this._recordList.length),
                        modalMessage: (massAction.message || DEFAULT_MASS_CONFIRM_MESSAGE)?.replace('{0}',this._recordList.length),
                        modalHelp: massAction.help,
                        modalClass: massAction.class,
                        description: massAction.description,
                        size: massAction.size || 'small',
                        isDebug: this.isDebug
                    };
                    if (this.isDebug) console.log('triggerMassAction: opening confirmation popup with params ',JSON.stringify(confirmParams));
                    startPromise = sfpegConfirmPopupDsp.open(confirmParams);
                }
                break;        
            case 'massForm':
            case 'massApexForm':
                if (this.isDebug) console.log('triggerMassAction: direct form mode');
                if ((!massAction.formRecord) || (!massAction.formFields)) {
                    console.warn('triggerMassAction: END KO / Missing form record and/or fields properties');
                    this.showError({message: 'Missing form record and/or fields properties in mass form action action configuration!'});
                    throw new Error("Missing form record and/or fields properties in mass form action configuration!");
                }

                let formParams = {
                    modalHeader: (massAction.title || DEFAULT_MASS_FORM_HEADER)?.replace('{0}',this._recordList.length),
                    modalMessage: (massAction.message || DEFAULT_MASS_FORM_MESSAGE)?.replace('{0}',this._recordList.length),
                    modalHelp: massAction.help,
                    modalClass: massAction.class,
                    description: massAction.description,
                    size: massAction.size || 'small',
                    columns: massAction.columns,
                    variant: massAction.variant,
                    actionType: type,
                    record: massAction.formRecord,
                    fields: massAction.formFields,
                    doSubmit: false,
                    objectApiName: this.objectApiName,
                    recordId: this.recordId,
                    userId: this.userId,
                    isDebug: this.isDebug
                };
                if (this.isDebug) console.log('triggerMassAction: opening form popup with params ', JSON.stringify(formParams));
        
                startPromise = sfpegFormPopupDsp.open(formParams);
                break;
            default:
                console.warn('triggerMassAction: END KO / no/bad action type provided',type);
                this.showError({message: 'No/bad action type provided in mass action configuration!'},'warning');                
                throw new Error("No/bad action type provided in mass action configuration!");
        }
        
        startPromise.then((result) => {
            if (this.isDebug) console.log('triggerMassAction: first popup closed with result ',JSON.stringify(result));

            if ((result?.isConfirmed) || (result?.doNext)) {
                if (this.isDebug) console.log('triggerMassAction: operation confirmed',type);

                let executePromise;
                switch (type) {
                    case 'massDML':
                    case 'massForm':
                        if (this.isDebug) console.log('triggerMassAction: preparing DML data for ',JSON.stringify(massAction));
                        if (this.isDebug) console.log('triggerMassAction: for operation ',massAction.operation);
                        let dmlParams = {
                            modalHeader: (massAction.title || DEFAULT_MASS_EXEC_HEADER)?.replace('{0}',this._recordList.length),
                            modalMessage: (massAction.messageSave || massAction.message || DEFAULT_MASS_EXEC_MESSAGE)?.replace('{0}',this._recordList.length),
                            modalHelp: massAction.help,
                            modalClass: massAction.class,
                            description: massAction.description,
                            size: massAction.size || 'small',
                            actionType: 'DML',
                            actionConfig: this.configName,
                            actionParams: {
                                name: massAction.name,
                                params: {
                                    operation: massAction.operation,
                                    records: []
                                }
                            },
                            isDebug: this.isDebug
                        };
                        if (this.isDebug) console.log('triggerMassAction: main DML params init ', JSON.stringify(dmlParams));

                        switch (massAction.operation) {
                            case 'insert': 
                                if (this.isDebug) console.log('triggerMassAction: initializing insert operation');
                                if (! massAction.lookup) {
                                    console.error('triggerMassAction: END / no record to process');
                                    throw new Error("Missing lookup property for mass insert DML action");
                                }
                                dmlParams.actionParams.params.records = this.initMassList(massAction, this._recordList, result.record, massAction.lookup);
                                break;
                            case 'update': 
                                if (this.isDebug) console.log('triggerMassAction: initializing update operation');
                                dmlParams.actionParams.params.records = this.initMassList(massAction, this._recordList, result.record, 'Id');
                                break;
                            case 'delete':
                                if (this.isDebug) console.log('triggerMassAction: initializing delete operation');
                                this._recordList.forEach(rcdIter => {
                                    if (this.isDebug) console.log('triggerMassDML: processing rcdIter', JSON.stringify(rcdIter));
                                    let rcdUpdate = { Id : rcdIter.Id};
                                    dmlParams.actionParams.params.records.push(rcdUpdate);
                                });
                                break;
                            default:
                                console.error('triggerMassAction: END / unsupported DML operation ',massAction.operation);
                                throw new Error("Unsupported DML operation type " + massAction.operation);
                        }
                        
                        if (this.isDebug) console.log('triggerMassAction: opening execution popup with params ', JSON.stringify(dmlParams));
                        executePromise = sfpegActionPopupDsp.open(dmlParams);
                        break;
                    case 'massApex':
                    case 'massApexForm':
                        if (this.isDebug) console.log('triggerMassAction: preparing APEX data');
                        let apexParams = {
                            modalHeader: (massAction.title || DEFAULT_MASS_EXEC_HEADER)?.replace('{0}',this._recordList.length),
                            modalMessage: (massAction.messageSave || massAction.message || DEFAULT_MASS_EXEC_MESSAGE)?.replace('{0}',this._recordList.length),
                            modalHelp: massAction.help,
                            modalClass: massAction.class,
                            description: massAction.description,
                            size: massAction.size || 'small',
                            actionType: 'apex',
                            actionConfig: this.configName,
                            actionParams: {
                                name: massAction.name,
                                params: {
                                    params: massAction.params,
                                    input: result.record,
                                    selection: this._recordList
                                }
                            },
                            isDebug: this.isDebug
                        };                    
                        if (this.isDebug) console.log('triggerMassAction: opening execution popup with params ', JSON.stringify(apexParams));
                        executePromise = sfpegActionPopupDsp.open(apexParams);

                        break;
                    default:
                        console.warn('triggerMassAction: END KO / Unsupported mass operation type',type);
                        throw new Error("Unsupported mass operation type " + type);
                }
                if (this.isDebug) console.log('triggerMassAction: launching execution promise');
                return executePromise;
            }
            else {
                if (this.isDebug) console.log('triggerMassAction: action cancelled in popup');
                return new Promise((resolve,reject) => {
                    if (this.isDebug) console.log('triggerMassAction: returning cancellation promise');
                    resolve({isCancelled: true});
                });
            }
        }).then((result) => {
            if (this.isDebug) console.log('triggerMassAction: operation status received',JSON.stringify(result));

            if (result?.isCancelled) {
                if (this.isDebug) console.log('triggerMassAction: END / action cancelled');
            }
            else if (result?.isCompleted) {
                if (this.isDebug) console.log('triggerMassAction: successful operation result received ',JSON.stringify(result));

                if (massAction.next) {
                    if (this.isDebug) console.log('triggerMassAction: chained action to trigger',JSON.stringify(massAction.next));
                    this.processAction(massAction.next,result?.result);
                    if (this.isDebug) console.log('triggerMassAction: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerMassAction: END / no chained action to trigger');
                }
            }
            else {
                console.warn('triggerMassAction: operation failure received ',JSON.stringify(result));

                if (massAction.error) {
                    if (this.isDebug) console.log('triggerMassAction: chained error action to trigger',JSON.stringify(massAction.error));
                    this.processAction(massAction.error, result?.error);
                    if (this.isDebug) console.log('triggerMassAction: END / chained error action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerMassAction: END / no chained error action to trigger');
                }
            }
        }).catch((error) => {
            console.error('triggerMassAction: END KO / action execution popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
        if (this.isDebug) console.log('triggerMassAction: first popup displayed');
    }

    initMassList = function(actionConfig, selection, input, lookup) {
        if (this.isDebug) console.log('initMassList: START with #items ', selection.length);

        let targetList = [];
        const ignoredFields = ['ObjectApiName','RecordTypeId'];
        let fieldMapping = actionConfig.fieldMapping || {};
        if (this.isDebug) console.log('initMassList: fieldMapping set ',JSON.stringify(fieldMapping));
        if (this.isDebug) console.log('initMassList: rowMapping configured ',JSON.stringify(actionConfig.rowMapping));
        if (this.isDebug) console.log('initMassList: user input provided ',JSON.stringify(input));
        if (this.isDebug) console.log('initMassList: lookup provided ',lookup);

        selection.forEach(rcdIter => {
            if (this.isDebug) console.log('initMassList: processing rcdIter', JSON.stringify(rcdIter));
            let outputRecord = {...(actionConfig.record || {})};
            outputRecord[lookup] = rcdIter.Id;
            if (this.isDebug) console.log('initMassList: outputRecord init ',JSON.stringify(outputRecord));

            if (actionConfig.rowMapping) {
                if (this.isDebug) console.log('initMassList: analysing row data');
                for (let iterField in actionConfig.rowMapping) {
                    if (this.isDebug) console.log('initMassList: merging row field ',iterField);
                    let targetIterField = (actionConfig.rowMapping)[iterField];
                    if (this.isDebug) console.log('initMassList: in field ', targetIterField);
                    outputRecord[targetIterField] = rcdIter[iterField];
                }
                if (this.isDebug) console.log('initMassList: outputRecord record extended ',JSON.stringify(outputRecord));
            }
            if (input) {
                if (this.isDebug) console.log('initMassList: analysing user input');
                for (let iterField in input) {
                    if ((ignoredFields.includes(iterField))) {
                        if (this.isDebug) console.log('initMassList: ignoring field ',iterField);
                    }
                    else {
                        if (this.isDebug) console.log('initMassList: merging field ',iterField);
                        let targetIterField =  fieldMapping[iterField] || iterField;
                        if (this.isDebug) console.log('initMassList: in field ',targetIterField);
                        outputRecord[targetIterField] = input[iterField];
                    }
                }
                if (this.isDebug) console.log('initMassList: outputRecord record extended ',JSON.stringify(outputRecord));
            }
            targetList.push(outputRecord);
        });

        if (this.isDebug) console.log('initMassList: END with #items ', targetList.length);
        return targetList;
    }


    //----------------------------------------------------------------
    // Flow Action Utilities
    //----------------------------------------------------------------

    triggerFlow = function(flowAction) {
        if (this.isDebug) console.log('triggerFlow: START with ',JSON.stringify(flowAction));

        if (((!flowAction.title) && (!flowAction.modalHeader)) || (!flowAction.flowName))  {
            console.warn('triggerFlow: END KO / Missing title, modalHeader and/or flowName properties');
            this.showError({message: 'Missing title, modalHeader and/or flowName properties for flow action!'});
            throw new Error("Missing title, popupHeader and/or flowName properties for flow action!");
        }

        //let popupParams = JSON.parse(JSON.stringify(flowAction));
        let popupParams = {...flowAction};
        popupParams.isDebug = popupParams.isDebug || this.isDebug;
        if (this.isDebug) console.log('triggerFlow: popupParams init ', JSON.stringify(popupParams));

        if (flowAction.selection) {
            if (this.isDebug) console.log('triggerFlow: processing selection ', JSON.stringify(flowAction.selection));

            /*if (!(this._recordList?.length > 0)) {
                console.warn('triggerFlow: END KO / no record to process');
                this.showError({message: NO_RECORD_ERROR},'warning');
                return;
            }
            if (this.isDebug) console.log('triggerFlow: #items to process ', this._recordList?.length);*/

            popupParams.flowParams = popupParams.flowParams || [];
            if (this.isDebug) console.log('triggerFlow: flowParams init if need be');

            let selectionInput = {name: flowAction.selection.name, type: flowAction.selection.type};
            if (flowAction.selection.objectType) {selectionInput.objectType = flowAction.selection.objectType;}
            selectionInput.value = [];
            if (this.isDebug) console.log('triggerFlow: selectionInput init ',JSON.stringify(selectionInput));

            try {
                selectionInput.value = this.formatSelection(flowAction.selection,this._recordList);
                if (this.isDebug) console.log('triggerFlow: selection init ',JSON.stringify(selectionInput));
            }
            catch (error) {
                console.warn('triggerFlow: END KO / selection formatting problem',error);
                this.showError(error,'warning');
                return;
            }

            delete popupParams.selection;
            popupParams.flowParams.push(selectionInput);
            if (this.isDebug) console.log('openFlow: popupParams reviewed ', JSON.stringify(popupParams));
        }

        if (this.isDebug) console.log('triggerFlow: opening Flow popup', JSON.stringify(popupParams));
        sfpegFlowPopupDsp.open(popupParams)
        .then((result) => {
            if (this.isDebug) console.log('triggerFlow: popup closed with result ',JSON.stringify(result));

            if (result?.doNext) {
                if (result?.navigate) {
                    if (this.isDebug) console.log('triggerFlow: navigation requested ',JSON.stringify(result.navigate));
                    let navigateAction = {
                        type: "navigation",
                        params: result.navigate
                    }
                    if (flowAction.next) {
                        navigateAction.next = flowAction.next;
                    }
                    if (this.isDebug) console.log('triggerFlow: navigation action to trigger ',JSON.stringify(navigateAction));
                    this.processAction(navigateAction,null);
                    if (this.isDebug) console.log('triggerFlow: END / navigation triggered');
                }
                else if (flowAction.next) {
                    if (this.isDebug) console.log('triggerFlow: chained action to trigger',JSON.stringify(flowAction.next));
                    this.processAction(flowAction.next,null);
                    if (this.isDebug) console.log('triggerFlow: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerFlow: END / no chained action to trigger');
                }
            }
            else {
                if (this.isDebug) console.log('triggerFlow: END / action abandonned');
            }
        })
        .catch((error) => {
            console.error('triggerFlow: END KO / popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
    }


    //----------------------------------------------------------------
    // File Action Utilities
    //----------------------------------------------------------------

    triggerFileUpload = function(fileAction) {
        if (this.isDebug) console.log('triggerFileUpload: START with ',JSON.stringify(fileAction));

        if (((!fileAction.title) && (!fileAction.modalHeader)))  {
            console.warn('triggerFileUpload: END KO / Missing title and/or modalHeader properties');
            this.showError({message: 'Missing title and/or modalHeader properties for file action!'});
            throw new Error("Missing title and/or modalHeader properties for file action!");
        }

        let startPromise;
        if (fileAction.metaFields) {
            if (this.isDebug) console.log('triggerFileUpload: preparing metadata form popup for fields ', JSON.stringify(fileAction.metaFields));
            let fileRecord = {... fileAction.fileMetadata};
            if (this.isDebug) console.log('triggerFileUpload: fileMetadata init ', JSON.stringify(fileRecord));
            fileRecord.ObjectApiName = 'ContentVersion';
            if (this.isDebug) console.log('triggerFileUpload: fileMetadata updated ', JSON.stringify(fileRecord));
            let formParams = {
                modalHeader: (fileAction.modalHeader || fileAction.title || DEFAULT_FILE_HEADER),
                modalMessage: (fileAction.modalFormMessage || DEFAULT_FILE_FORM_MESSAGE),
                modalHelp: fileAction.help,
                modalClass: fileAction.class,
                description: fileAction.description,
                size: fileAction.size || 'small',
                columns: fileAction.columns,
                variant: fileAction.variant,
                actionType: 'dmlForm',
                record: fileRecord,
                fields: fileAction.metaFields,
                doSubmit: false,
                objectApiName: this.objectApiName,
                recordId: this.recordId,
                userId: this.userId,
                isDebug: this.isDebug
            };
            if (this.isDebug) console.log('triggerFileUpload: opening form popup with params ', JSON.stringify(formParams));
            startPromise = sfpegFormPopupDsp.open(formParams);
        }
        else {
            if (this.isDebug) console.log('triggerFileUpload: bypassing metadata form popup');
            startPromise = new Promise((resolve,reject) => {
                if (this.isDebug) console.log('triggerFileUpload: metadata form popup bypassed');
                resolve({doNext: true});
            });
        }

        startPromise.then((result) => {
            if (this.isDebug) console.log('triggerFileUpload: metadata received from metadata entry step ',JSON.stringify(result));

            if (result?.doNext) {
                if (this.isDebug) console.log('triggerFileUpload: displaying upload popup');

                let fileMeta = {... (result.record || fileAction.fileMetadata)};
                if (fileMeta.ObjectApiName) {delete fileMeta.ObjectApiName;}
                if (this.isDebug) console.log('triggerFileUpload: applying fileMeta ', JSON.stringify(fileMeta));

                // Many conditions for backwards compatibility
                let popupParams = {
                    modalHeader: (fileAction.modalHeader || fileAction.title || DEFAULT_FILE_HEADER),
                    modalMessage: (fileAction.modalMessage || fileAction.label || DEFAULT_FILE_MESSAGE),
                    modalHelp: fileAction.modalHelp,
                    modalClass: fileAction.modalClass,
                    label: (fileAction.modalHeader || fileAction.title || DEFAULT_FILE_HEADER),
                    description: fileAction.description,
                    size: fileAction.size || 'small',
                    recordId: fileAction.recordId,
                    fileFormats: (fileAction.fileFormats || fileAction.formats),
                    allowMultiple: fileAction.allowMultiple, 
                    fileMetadata: fileMeta,
                    isDebug: (fileAction.isDebug || this.isDebug)
                }
                if (this.isDebug) console.log('triggerFileUpload: opening File popup with params', JSON.stringify(popupParams));
                return sfpegFilePopupDsp.open(popupParams);
            }
            else {
                if (this.isDebug) console.log('triggerFileUpload: metadata form cancelled');
                return new Promise((resolve,reject) => {
                    if (this.isDebug) console.log('triggerFileUpload: propagating cancellation');
                    resolve({doNext: false});
                });
            }
        }).then((result) => {
            if (this.isDebug) console.log('triggerFileUpload: popup closed with result ',JSON.stringify(result));

            if (result?.doNext) {
                if (fileAction.next) {
                    if (this.isDebug) console.log('triggerFileUpload: chained action to trigger',JSON.stringify(fileAction.next));
                    this.processAction(fileAction.next,null);
                    if (this.isDebug) console.log('triggerFileUpload: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerFileUpload: END / no chained action to trigger');
                }
            }
            else {
                if (this.isDebug) console.log('triggerFileUpload: END / action abandonned');
            }
        })
        .catch((error) => {
            console.error('triggerFileUpload: END KO / popup open failed ',JSON.stringify(error));
            this.showError(error);
        });
    }

    triggerFileDownload = function(fileAction) {
        if (this.isDebug) console.log('triggerFileDownload: START with ',JSON.stringify(fileAction));

        let targetUrl = "/sfc/servlet.shepherd/";
        
        if (fileAction.documentId) {
            if (this.isDebug) console.log('triggerFileDownload: using content document ',fileAction.documentId);
            targetUrl += "/document/download/" + fileAction.documentId;
        }
        else if (fileAction.versionId) {
            if (this.isDebug) console.log('triggerFileDownload: using content version ',fileAction.versionId);
            targetUrl += "/version/download/" + fileAction.versionId;
        }
        else if (fileAction.selectedVersions) {
            if (this.isDebug) console.log('triggerFileDownload: using content version ID field from selection ', fileAction.selectedVersions);

            let versionIds = [];
            this._recordList.forEach(iter => {
                versionIds.push(iter[fileAction.selectedVersions]);
            })
            if (this.isDebug) console.log('triggerFileDownload: convent version ID list init ',JSON.stringify(versionIds));

            targetUrl += "/version/download/" + versionIds.join('/');
        }
        else {
            console.warn('triggerFileDownload: END KO / unsupported download configuration ',JSON.stringify(fileAction));
            this.showError('Unsupported download configuration','warning');
            return;
        }

        if (this.isDebug) console.log('triggerFileDownload: END / triggering download from targetUrl',targetUrl);
        this.triggerNavigate({  type:"standard__webPage", attributes:{url:targetUrl}});
        return;
    }
    
    //----------------------------------------------------------------
    // Notification Action Utilities
    //----------------------------------------------------------------

    triggerNotification = function(type,channel,action,selection) {
        if (this.isDebug) console.log('triggerNotification: START for type ', JSON.stringify(type));
        
        let notifConfig = {action: action};
        if (this.isDebug) console.log('triggerNotification: action set in notification ', JSON.stringify(action));
        if (channel) {
            notifConfig.channel = channel;
            if (this.isDebug) console.log('triggerNotification: channel set in notification ', channel);
        }
        else if (type !== 'utility') {
            //this.displayMsg = "Missing channel in notification configuration!";
            this.showError({message: 'Missing channel property in ' + type + ' notification configuration!'});
            console.warn('triggerNotification: END KO / Missing channel when not notifying utility bar', type);
        }

        if (selection) {
            try {
                notifConfig.context = this.formatSelection(selection,this._recordList);
                if (this.isDebug) console.log('triggerNotification: selection set in notification ', JSON.stringify(selection));
                if (this.isDebug) console.log('triggerNotification: for #records ', this._recordList?.length);
            }
            catch (error) {
                console.warn('triggerNotification: END KO / selection formatting problem',error);
                this.showError(error,'warning');
                return;
            }
            if (this.isDebug) console.log('triggerNotification: actionNotif prepared ',JSON.stringify(notifConfig));
        }

        let notification = (type === 'utility' ? sfpegAction : (type === 'action' ? sfpegCustomAction : sfpegCustomNotification));
        if (this.isDebug) console.log('triggerNotification: notification selected ',notification);
        
        publish(this.messageContext, notification, notifConfig);
        if (this.isDebug) console.log('triggerNotification: END - message sent');
    }

    /*
    triggerUtilityAction = function(action,selection) {
        if (this.isDebug) console.log('triggerUtilityAction: START with ', JSON.stringify(action));

        let actionNotif = {'action': action};
        if (selection) {
            if (this.isDebug) console.log('triggerUtilityAction: formatting selection ',JSON.stringify(selection));
            try {
                actionNotif.context = this.formatSelection(selection,this._recordList);
            }
            catch (error) {
                console.warn('triggerUtilityAction: END KO / selection formatting problem',JSON.stringify(error));
                this.showError({message: error},'warning');
                return;
            }
        }

        if (this.isDebug) console.log('triggerUtilityAction: actionNotif prepared ',JSON.stringify(actionNotif));

        publish(this.messageContext, sfpegAction, actionNotif);
        if (this.isDebug) console.log('triggerUtilityAction: END - message sent');
    }

    triggerCustomAction = function(action,channel,selection) {
        if (this.isDebug) console.log('triggerCustomAction: START with ', JSON.stringify(action));

        if (channel) {
            if (this.isDebug) console.log('triggerCustomAction: processing action for channel ', channel);

            let actionNotif = {'channel': channel, 'action': action};
 
            if (selection) {
                if (this.isDebug) console.log('triggerCustomAction: formatting selection ',JSON.stringify(selection));
                try {
                        actionNotif.context = this.formatSelection(selection,this._recordList);
                    }
                    catch (error) {
                        console.warn('triggerUtilityAction: END KO / selection formatting problem',JSON.stringify(error));
                        this.showError({message: error},'warning');
                        return;
                    }
                }

            if (this.isDebug) console.log('triggerCustomAction: actionNotif prepared ', JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomAction, actionNotif);
            if (this.isDebug) console.log('triggerCustomAction: END OK / message sent');
        }
        else {
            this.displayMsg = "Missing channel in custom action configuration!";
            this.showError({message: 'Missing channel property in custom action!'});
            console.warn('triggerCustomAction: END KO / Missing channel in action');
        }
    }

    triggerCustomNotification = function(notification,channel,hasSelection) {
        if (this.isDebug) console.log('triggerCustomNotification: START with ',JSON.stringify(notification));
        if (this.isDebug) console.log('triggerCustomNotification: hasSelection? ',hasSelection);

        if (channel) {
            if (this.isDebug) console.log('triggerCustomNotification: processing action for channel ', channel);

            let actionNotif = {
                'channel': channel,
                'action': notification,
                'context': (hasSelection ? this._recordList : null)
            };
            if (this.isDebug) console.log('triggerCustomNotification: actionNotif prepared ',JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomNotification, actionNotif);
            if (this.isDebug) console.log('triggerCustomNotification: END OK / message sent');
        }
        else {
            this.displayMsg = "Missing channel in custom notification configuration!";
            this.showError({message: 'Missing channel property in custom notification!'});
            console.warn('triggerCustomNotification: END KO / Missing channel in action');
        }
    }
    */

    //----------------------------------------------------------------
    // Misc Action Utilities
    //----------------------------------------------------------------

    triggerReload = function(reloadAction,context) {
        if (this.isDebug) console.log('triggerReload: START with ',JSON.stringify(reloadAction));

        if ((!reloadAction) || (!reloadAction.recordId))  {
            console.warn('triggerReload: END KO / Missing recordId property');
            throw new Error("Missing recordId property in reload operation params!");
        }

        getRecordNotifyChange([{recordId: reloadAction.recordId}]);

        if (this.isDebug) console.log('triggerReload: END');
    }

    triggerParentEvt = function(action) {
        if (this.isDebug) console.log('triggerParentEvt: START with ',JSON.stringify(action));

        let parentEvt = new CustomEvent('done', { detail: action });
        if (this.isDebug) console.log('triggerParentEvt: parentEvt init ', JSON.stringify(parentEvt));

        this.dispatchEvent(parentEvt);
        if (this.isDebug) console.log('triggerParentEvt: END');
    }

    triggerToast = function(toastMessage) {
        if (this.isDebug) console.log('triggerToast: START with ', JSON.stringify(toastMessage));

        let toastEvt = new ShowToastEvent({
            title: toastMessage.title,
            message: toastMessage.message,
            variant: toastMessage.variant || 'info',
        });
        if (this.isDebug) console.log('triggerToast: toastEvt init ', JSON.stringify(toastEvt));

        this.dispatchEvent(toastEvt);
        if (this.isDebug) console.log('triggerToast: END');
    }

    triggerShowDetails = function(recordDetails) {
        if (this.isDebug) console.log('triggerShowDetails: START with ',JSON.stringify(recordDetails));

        if ((!recordDetails) || (!recordDetails.fields)) {
            console.warn('triggerShowDetails: END KO / Missing fields property');
            this.showError({message: 'Missing fields property in showDetails action!'});
            throw new Error("Missing fields property in showDetails action!");
        }

        let displayParams = {
            modalHeader: recordDetails.modalHeader || recordDetails.title || DEFAULT_DISPLAY_HEADER,
            modalMessage: recordDetails.modalHeader || recordDetails.message || DEFAULT_DISPLAY_MESSAGE,
            modalHelp: recordDetails.help,
            modalClass: recordDetails.class,
            label: recordDetails.modalHeader || recordDetails.title || DEFAULT_DISPLAY_HEADER,
            description: recordDetails.description,
            size: recordDetails.size || 'small',
            fields: recordDetails.fields,
            columns: recordDetails.columns,
            nextLabel: recordDetails.next?.label,
            nextTitle: recordDetails.next?.title,
            isDebug: recordDetails.isDebug || this.isDebug
        };
        if (this.isDebug) console.log('triggerShowDetails: opening display popup with params ',JSON.stringify(displayParams));
        
        sfpegDisplayPopupDsp.open(displayParams)
        .then((result) => {
            if (this.isDebug) console.log('triggerShowDetails: display popup closed with result ',JSON.stringify(result));

            if (result?.doNext) {
                if (recordDetails.next) {
                    if (this.isDebug) console.log('triggerShowDetails: chained action to trigger',JSON.stringify(recordDetails.next));
                    this.processAction(recordDetails.next,null);
                    if (this.isDebug) console.log('triggerShowDetails: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerShowDetails: END / no chained action to trigger');
                }
            }
            else {
                if (this.isDebug) console.log('triggerShowDetails: END / popup simply closed');
            }
        }).catch((error) => {
            console.error('triggerShowDetails: END KO / display popup open failed ',JSON.stringify(error));
            this.showError(error);
        });


        /*
        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
        if (this.isDebug) console.log('triggerShowDetails: popupUtil fetched ', popupUtil);

        popupUtil.showRecordDetails(    recordDetails.title || DEFAULT_POPUP_HEADER, recordDetails.message,
                                        recordDetails.fields , recordDetails.columns, recordDetails.size,
                                        recordDetails.next?.label)
        .then(() => {
            if (this.isDebug) console.log('triggerShowDetails: END - display closed');
            if (recordDetails.next) {
                if (this.isDebug) console.log('triggerShowDetails: chained action to trigger',JSON.stringify(recordDetails.next));
                this.processAction(recordDetails.next,null);
                if (this.isDebug) console.log('triggerShowDetails: chained action triggered');
            }
            else {
                if (this.isDebug) console.log('triggerShowDetails: no chained action to trigger');
            }
        })
        .catch((error) => {
            this.displayMsg = JSON.stringify(error);
            this.showError(error);
            if (this.isDebug) console.log('triggerShowDetails: END / Issue when processing operation: ' , JSON.stringify(error));
        });
        */
        if (this.isDebug) console.log('triggerShowDetails: popup displayed');
    }

    triggerClipboard = function(textContent) {
        if (this.isDebug) console.log('triggerClipboard: START with ',JSON.stringify(textContent));

        if (!textContent)  {
            console.warn('triggerClipboard: END KO / Missing textContent property');
            throw new Error("Missing textContent in clipboard copy operation params!");
        }

        if (this.isDebug) console.log('triggerClipboard: navigator found ',navigator);
        if (navigator?.clipboard) {
            if (this.isDebug) console.log('triggerClipboard: triggering navigator copy on clipboard ',navigator.clipboard);
            navigator.clipboard.writeText(textContent);
        }
        else {
            if (this.isDebug) console.log('triggerClipboard: triggering legacy copy on clipboard');
            let hiddenInput = document.createElement("input");
            hiddenInput.setAttribute("value", textContent);
            document.body.appendChild(hiddenInput);
            hiddenInput.select();
            document.execCommand("copy");
            document.body.removeChild(hiddenInput); 
        }

        if (this.isDebug) console.log('triggerClipboard: END');
    }


    //################################################################
    // Utilities
    //################################################################

    //----------------------------------------------------------------
    // Selection Handling Utilities
    //----------------------------------------------------------------

    formatSelection = (configuration,records) => {
        if (this.isDebug) console.log('formatSelection: START with configuration ',JSON.stringify(configuration));
        if (this.isDebug) console.log('formatSelection: and #records ',records?.length);

        if ((!configuration) || (!records)) {
            console.error('formatSelection: END KO / bad configuration provided ',configuration);
            console.error('formatSelection: or records ',records);
            throw new Error("Bad selection configuration!");
        }

        if (!records?.length) {
            if (!configuration.allowNone) {  
                console.error('formatSelection: END KO / no record provided');
                throw new Error(NO_RECORD_ERROR);
            }
        }
        else if ((configuration.maxRows) && (records.length > configuration.maxRows)) {
            console.error('formatSelection: END KO / too many records provided ',records.length);
            console.error('formatSelection: vs maxRows ',configuration.maxRows);
            throw new Error(TOO_MANY_RECORDS_ERROR.replace('{0}',records.length).replace('{1}',configuration.maxRows));
        }

        let outputRecords = [];
        if (configuration.field) {
            if (this.isDebug) console.log('formatSelection: extracting field from input records ',configuration.field);
            records.forEach(item => {
                outputRecords.push(item[configuration.field]);
            });
        }
        else if (configuration.fields) {
            if (this.isDebug) console.log('formatSelection: extracting fields from selection ',JSON.stringify(configuration.fields));
            let recordTemplate = configuration.record || {};
            if (this.isDebug) console.log('formatSelection: with template ',JSON.stringify(recordTemplate));
            records.forEach(item => {
                let itemVal = {...recordTemplate};
                configuration.fields.forEach(itemField => {
                    itemVal[itemField] = item[itemField];
                });
                outputRecords.push(itemVal);
            });
        }
        else {
            if (this.isDebug) console.log('formatSelection: returning input records as-is');
            outputRecords = records;
        }
        if (this.isDebug) console.log('formatSelection: outputRecords init ',JSON.stringify(outputRecords));

        if (this.isDebug) console.log('formatSelection: END returning #outputRecords ',outputRecords.length);
        return outputRecords;
    }

    //----------------------------------------------------------------
    // Error Handling Utilities
    //----------------------------------------------------------------

    showError = function(error,severity, mode) {
        if (this.isDebug) console.log('showError: START with error ',error);
        if (this.isDebug) console.log('showError: typeof error ', typeof error);

        if ((!error) || (error.noToast)) {
            if (this.isDebug) console.log('showError: END / no toast triggered');
            return;
        }

        let errorMessage = {
            title: EXECUTION_ERROR,
            variant: severity || 'error',
            mode: mode || 'dismissable',
            message : this.parseError(error)
        }
        if (this.isDebug) console.log('showError: errorMessage prepared ', JSON.stringify(errorMessage));

        this.triggerToast(errorMessage);
        if (this.isDebug) console.log('showError: END / toast triggered');
    } 

    parseError = function (error) {
        if (this.isDebug) console.log('parseError: START with ',error);

        if (error.message) {
            if (this.isDebug) console.log('parseError: END with exception message ', error.message);
            return error.message;
        }

        if (this.isDebug) console.log('parseError: parsing more complex message ', JSON.stringify(error));
        const msgRegex = /"message":"[^"]+"/gi;
        let msgList = (JSON.stringify(error)).match(msgRegex);
        if (this.isDebug) console.log('parseError: messages extracted ', msgList);

        let errorMessage = ''; 
        if (msgList) {
            msgList.forEach(msgIter => {
                //if (this.isDebug) console.log('parseError: processing msgIter ', msgIter);
                errorMessage = errorMessage + msgIter.substr(11,msgIter.length - 12) + ' ';
                //if (this.isDebug) console.log('parseError: errorMessage updated ', errorMessage);
            });
            //if (this.isDebug) console.log('parseError: errorMessage finalized ', errorMessage);
            errorMessage = errorMessage.slice(0,-1);
        }

        if (this.isDebug) console.log("parseError: END with", errorMessage);
        return errorMessage;
    }

}