/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display Lists of actions in a button/menu bar.
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
import executeApex from '@salesforce/apex/sfpegAction_CTL.executeApex';
import executeDML from '@salesforce/apex/sfpegAction_CTL.executeDML';
import currentUserId from '@salesforce/user/Id';
import { getRecord, createRecord, updateRecord, deleteRecord,getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import sfpegMergeUtl from 'c/sfpegMergeUtl';

// To notify the utility bar handler if required
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegAction              from '@salesforce/messageChannel/sfpegAction__c';           // for Utility bar communication (outgoing)
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';// for sfpegActionBarCmp component invocation (incoming/outgoing)

// Custom labels for default values
import DEFAULT_CREATE_HEADER    from '@salesforce/label/c.sfpegActionDefaultCreateHeader';
import DEFAULT_UPDATE_HEADER    from '@salesforce/label/c.sfpegActionDefaultUpdateHeader';
import DEFAULT_DELETE_HEADER    from '@salesforce/label/c.sfpegActionDefaultDeleteHeader';
import DEFAULT_POPUP_HEADER     from '@salesforce/label/c.sfpegActionDefaultPopupHeader';
import DEFAULT_POPUP_MESSAGE    from '@salesforce/label/c.sfpegActionDefaultPopupMessage';
import DEFAULT_MASS_POPUP_HEADER    from '@salesforce/label/c.sfpegActionDefaultMassPopupHeader';
import DEFAULT_MASS_POPUP_MESSAGE   from '@salesforce/label/c.sfpegActionDefaultMassPopupMessage';
import DEFAULT_CONFIRM_MESSAGE  from '@salesforce/label/c.sfpegActionDefaultConfirmMessage';
import DEFAULT_APEX_HEADER      from '@salesforce/label/c.sfpegActionDefaultApexHeader';
import EXECUTION_MESSAGE        from '@salesforce/label/c.sfpegActionExecutionMessage';

var ACTION_CONFIGS = {};

export default class SfpegActionMenuDsp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api barClass;              // CSS Classes for the wrapping div
    @api isVertical = false;    // Flag to display the action bar vertically
    @api configName;            // DeveloperName fo the sfpegAction__mdt record to be used
    @api isDebug = false;       // Debug mode activation

    //----------------------------------------------------------------
    // Record List Context (for mass operations) 
    //----------------------------------------------------------------
    _recordList = {};          // parent record list contextual data (for mass operations)
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
    // Record Context (e.g. to provide default additional context) 
    //----------------------------------------------------------------
    _parentContext = {};
    // Implementation with setter to handle context changes.
    @api
    get parentContext() {
        return this._parentContext;
    }
    set parentContext(value) {
        if (this.isDebug) console.log('setParentContext: START set ');
        this._parentContext = value;
        if (this.isDebug) console.log('setParentContext: _parentContext updated ', this._parentContext);
        if (this.isDebug) console.log('setParentContext: END set ');
    }

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Initialization state of the component (to control spinner)
    @track configDetails = null;// Global configuration of the component
    
    // Internal Query Control Parameters
    @track isExecuting = false; // Ongoing Action state  (to control spinner)

    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields = null; // List of Field API Names for current page record (if any) required as Query Input

    @api userId = currentUserId;// ID of current User
    @track userFields = null;   // List of Field API Names for current User (if any) required as Query Input

    //@api configData = null;     // Configuration data used in merge tokens (typically record IDs for base
                                // elements such as reports, articles, recordTypes...)

    // Internal Display Parameter
    @track errorMsg = null;     // Error message (if any for end user display)
    
    // To notify the utility bar handler if required / receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;

    popupDefaultHeaders = {
        'create' : DEFAULT_CREATE_HEADER,
        'insert' : DEFAULT_CREATE_HEADER,
        'update' : DEFAULT_UPDATE_HEADER,
        'delete' : DEFAULT_DELETE_HEADER
    }

    //----------------------------------------------------------------
    // Custom Getters for UI
    //----------------------------------------------------------------
    get hasErrorMsg () {
        return (this.configName !== 'N/A') && (this.errorMsg != null);
    }
    get hasConfig () {
        return (this.configDetails) && (this.configDetails.actions) && (this.configDetails.actions.length > 0);
    }
    get helptext () {
        let helpString = 'Configuration ' + this.configName
                        + ((this.configDetails == null) ? ' not loaded.' :
                          ' loaded with ' + (this.configDetails.actionList?.length || 0) + ' main action(s)');
        return helpString;
    }
    get buttonGroupClass() {
        return (this.isVertical ? '' : 'slds-button-group-list');
    }
    get buttonClass() {
        return (this.isVertical ? 'slds-m-around_xx-small' : '');
    }

    //----------------------------------------------------------------
    // Component Initialization / deletion
    //----------------------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');
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
        if (ACTION_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            //this.errorMsg = 'Local configuration fetched: ' + ACTION_CONFIGS[this.configName].label;
            this.configDetails = ACTION_CONFIGS[this.configName];
            this.finalizeConfig();
            //this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                try {
                    ACTION_CONFIGS[this.configName] = {
                        "label"     :   result.MasterLabel,
                        "actions"   :   result.Actions__c,
                        "channels"  :   JSON.parse(result.NotificationChannels__c || "[]"),
                        "input"     :   sfpegMergeUtl.sfpegMergeUtl.extractTokens(result.Actions__c,this.objectApiName)
                    };
                    this.configDetails = ACTION_CONFIGS[this.configName];
                    this.finalizeConfig();
                    if (this.isDebug) console.log('connected: configuration parsed');
                    //this.errorMsg = 'Configuration fetched and parsed: ' + ACTION_CONFIGS[this.configName].label;
                }
                catch(parseError){
                    console.warn('connected: configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                }
                finally {
                    this.isReady = true;
                    if (this.isDebug) console.log('connected: END');
                    //this.isReady = true;
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

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START');

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END');
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

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
            this.recordData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.RCD);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredRecord: END / recordData updated ', JSON.stringify(this.recordData));

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
            console.warn('wiredRecord: END / data fetch KO ', JSON.stringify(error));
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

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.USR);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredUser: END / userData updated ', JSON.stringify(this.userData));

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

            // fetching Record data
            if (this.objectApiName) {
                if (this.isDebug) console.log('finalizeConfig: analysing record fields for object ',this.objectApiName);
                if (this.configDetails.recordFields) {
                    ldsFetchRequired = true;
                    if (this.configDetails.recordFields[this.objectApiName]) {
                        this.recordFields = this.configDetails.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with same object) ',JSON.stringify(this.recordFields));
                    }
                    else {
                        this.configDetails.recordFields[this.objectApiName] = [];
                        this.configDetails.input.RCD.forEach(item => (this.configDetails.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item.field));
                        this.recordFields = this.configDetails.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with different object) ',JSON.stringify(this.recordFields));
                    }
                }
                else if (this.configDetails.input.RCD) {
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

        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.actions,this.configDetails.input,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
        .then( value => {
            if (this.isDebug) console.log('doMerge: context merged within configuration ',value);
            this.configDetails.actionList = JSON.parse(value)
            if (this.isDebug) console.log('doMerge: configuration updated', JSON.stringify(this.configDetails.actionList));
            let readyEvt = new CustomEvent('ready', null);
            if (this.isDebug) console.log('triggerParentEvt: END / triggering readyEvt', JSON.stringify(readyEvt));
            this.dispatchEvent(readyEvt);
        }).catch( error => {
            console.warn('doMerge: KO ',error);
            this.displayMsg = JSON.stringify(error);
        }).finally( () => {
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            this.isReady = true;
        });

        if (this.isDebug) console.log('doMerge: merge requested ');
    }

    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------
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
        
        if (!this.configDetails.actionList) {
            console.warn('executeBarAction: END KO / Action initialisation failed');
            throw "Cannot execute action due to initialisation failure!";
        }

        let action = (this.configDetails.actionList).find(item => {
            if (this.isDebug) console.log('executeBarAction: analysing ', JSON.stringify(item));
            return item.name === actionName;
        });
        if (action) {
            if (this.isDebug) console.log('executeBarAction: launching action',JSON.stringify(action));

            if (action.disabled) {
                console.warn('executeBarAction: END KO / Action disabled');
                throw "Cannot execute disabled action!";
            }

            if (context) {
                if (this.isDebug) console.log('executeBarAction: merging context data in action ');
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                sfpegMergeUtl.sfpegMergeUtl.mergeTokens(JSON.stringify(action.action),this.configDetails.input,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,context)
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
                        throw "Parsing of contextualised action failed!";
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
        console.log('handleNotification: START with message ',JSON.stringify(message));

        if (message.channel) {
            if (this.configDetails.channels.includes(message.channel)) {
                console.log('handleMessage: END / processing message on subscribed channel ',message.channel);
                this.processAction(message.action,null);
            }
            else {
                console.log('handleMessage: END / message ignored as on unsubscribed channel ',message.channel);
            }
        }
        else {
            console.warn('handleMessage: END / channel information missing in notification');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    /*handleActionTrigger(event){
        if (this.isDebug) console.log('handleActionTrigger: START with ',JSON.stringify(event.detail));
        //this.executeAction(event.target.value.action);
        this.processAction(event.detail,null);
        if (this.isDebug) console.log('handleActionTrigger: END');
    }*/

    handleButtonClick(event){
        if (this.isDebug) console.log('handleButtonClick: START with ',JSON.stringify(event.target.value));
        //this.executeAction(event.target.value.action);
        this.processAction(event.target.value.action,null);
        if (this.isDebug) console.log('handleButtonClick: END');
    }

    handleMenuSelect(event){
        if (this.isDebug) console.log('handleMenuSelect: START with ',JSON.stringify(event.detail));
        //this.executeAction(event.detail.value.action);
        this.processAction(event.detail.value.action,null);
        if (this.isDebug) console.log('handleMenuSelect: END');
    }

    // Main Action Processing Utility
    processAction = function(action,context) {
        // context is kept in the signature only for the "open" and "edit" action
        if (this.isDebug) console.log('processAction: START');
        if (this.isDebug) console.log('processAction: action triggered ',JSON.stringify(action));
        if (this.isDebug) console.log('processAction: context provided ',JSON.stringify(context));

        switch (action.type) {
            case 'navigation':
                if (this.isDebug) console.log('processAction: processing navigation action');
                this.triggerNavigate(action.params);
                break;
            case 'open':
                if ((context) && (context.Id)){
                    if (this.isDebug) console.log('processAction: processing record open action on context record');
                    this.triggerNavigate({  type:"standard__recordPage",
                                            attributes:{'recordId':context.Id, 'actionName':"view"}});
                }
                else {
                    console.warn('processAction: record open action requires a context object with Id field');
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
            case 'LDS':
                if (this.isDebug) console.log('processAction: processing LDS action');
                this.triggerLDS(action.params);
                break;
            case 'DML':
                if (this.isDebug) console.log('processAction: processing DML action');
                this.triggerDML(action.params);
                break;
            case 'ldsForm':     // convergent create/edit type (record ID in record data decides the mode)
                if (this.isDebug) console.log('processAction: processing Create/Edit LDS popup action');
                this.triggerLdsForm(action.params);
                break;
            case 'dmlForm':
                if (this.isDebug) console.log('processAction: processing Create/Edit DML popup action');
                this.triggerDmlForm(action.params);
                break;
            case 'massForm':
                if (this.isDebug) console.log('processAction: processing mass Edit Popup action');
                this.triggerMassForm(action.params);
                break;
            case 'massDML':
                if (this.isDebug) console.log('processAction: processing mass DML action');
                this.triggerMassDML(action.params);
                break;
            case 'reload':
                if (this.isDebug) console.log('processAction: processing record LDSD reload action');
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
            case 'apex':
                if (this.isDebug) console.log('processAction: executing Apex action');
                this.triggerApex(action.params);
                break;
            case 'utility':
                if (this.isDebug) console.log('processAction: triggering utility action');
                this.triggerUtilityAction(action.params);
                break;
            case 'action':
                if (this.isDebug) console.log('processAction: triggering action on custom LWC component via channel ',action.channel);
                this.triggerCustomAction(action.params,action.channel);
                break;
            case 'notify':
                if (this.isDebug) console.log('processAction: notifying action to other component via channel ',action.channel);
                this.triggerCustomNotification(action.params,action.channel);
                break;
            default:
                console.warn('processAction: END / no/bad action type provided',action.type);
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

    // Dedicated Action Utilities
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
            if (this.isDebug) console.log('triggerNavigate: setting new default values ',newDefaults);
            // Hack to be able to modify data set by other method.
            targetPageRef = JSON.parse(JSON.stringify(targetPageRef));
            targetPageRef.state.defaultFieldValues = newDefaults;
            if (this.isDebug) console.log('triggerNavigate: new default values set');
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
            throw "Missing url field in OpenURL params!";
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
            else {
                if (this.isDebug) console.log('triggerOpenURL: no or unsupported rework action available');
            }
        }

        window.open(openUrl,'_blank');
        if (this.isDebug) console.log('triggerOpenURL: END');
    }

    triggerLDS = function(operation) {
        if (this.isDebug) console.log('triggerLDS: START with ',JSON.stringify(operation));

        if ((!operation.type) || (!operation.params)) {
            console.warn('triggerLDS: END KO / Missing type and/or params properties');
            throw "Missing type and/or params properties in LDS params!";
        }

        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');

        let confirmPromise;
        if (operation.bypassConfirm) {
            if (this.isDebug) console.log('triggerLDS: bypassing confirmation for operation ',operation.type);
            confirmPromise = new Promise((resolve,reject) => {
                if (this.isDebug) console.log('triggerLDS: confirmation bypassed');
                resolve();
            });
        }
        else {
            if (this.isDebug) console.log('triggerLDS: not bypassing confirmation for operation ',operation.type);
            confirmPromise = popupUtil.showConfirm(operation.title || this.popupDefaultHeaders[(operation.type)], operation.message || DEFAULT_CONFIRM_MESSAGE);
        }
        if (this.isDebug) console.log('triggerLDS: confirmation promise initialised');

        confirmPromise.then(() => {
            if (this.isDebug) console.log('triggerLDS: confirmation bypassed/received');
            popupUtil.startSpinner(operation.title || this.popupDefaultHeaders[(operation.type)], EXECUTION_MESSAGE);
            if (this.isDebug) console.log('triggerLDS: triggering LDS operation ',JSON.stringify(operation.params));

            let operationPromise;
            switch (operation.type) {
                case 'create': 
                    if (this.isDebug) console.log('triggerLDS: create action requested');
                    return createRecord(operation.params);
                case 'update':
                    if (this.isDebug) console.log('triggerLDS: update action requested');
                    return updateRecord(operation.params);
                case 'delete':
                    if (this.isDebug) console.log('triggerLDS: delete action requested');
                    return deleteRecord(operation.params);
                default: 
                    console.warn('triggerLDS: unsupported LDS action',operation.type);
                    throw "Unsupported LDS action type " + operation.type + '!';
            }
        }).then(() => {
            if (this.isDebug) console.log('triggerLDS: LDS operation done ');
            popupUtil.stopSpinner();
            if (operation.next) {
                if (this.isDebug) console.log('triggerLDS: chained action to trigger',JSON.stringify(operation.next));
                this.processAction(operation.next,null);
                if (this.isDebug) console.log('triggerLDS: END / chained action triggered');
            }
            else {
                if (this.isDebug) console.log('triggerLDS: END / no chained action to trigger');
            }
        }).catch( error => {
            this.displayMsg = JSON.stringify(error);
            popupUtil.stopSpinner();
            console.warn('triggerLDS: END KO / Issue when processing operation ',JSON.stringify(error));
        });
        if (this.isDebug) console.log('triggerLDS: confirmation promise started');            
    }

    triggerDML = function(operation) {
        if (this.isDebug) console.log('triggerDML: START with ',JSON.stringify(operation));

        if ((!operation.params) || (!operation.params.operation)) {
            console.warn('triggerDML: END KO / Missing params and/or params.operation properties');
            throw "Missing params and/or params.operation properties in DML params!";
        }

        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
        let confirmPromise;
        if (operation.bypassConfirm) {
            if (this.isDebug) console.log('triggerDML: bypassing confirmation for operation ',operation.params.operation);
            confirmPromise = new Promise((resolve,reject) => {
                if (this.isDebug) console.log('triggerDML: confirmation bypassed');
                resolve();
            });
        }
        else {
            if (this.isDebug) console.log('triggerDML: not bypassing confirmation for operation ',operation.params.operation);
            confirmPromise = popupUtil.showConfirm(operation.title || this.popupDefaultHeaders[(operation.params.operation)], operation.message || DEFAULT_CONFIRM_MESSAGE);
        }
        if (this.isDebug) console.log('triggerDML: confirmation promise initialised');

        confirmPromise.then(() => {
            if (this.isDebug) console.log('triggerDML: confirmation bypassed/received');
            popupUtil.startSpinner(operation.title || this.popupDefaultHeaders[(operation.params.operation)], EXECUTION_MESSAGE);
            if (this.isDebug) console.log('triggerDML: triggering DML ',JSON.stringify(operation.params));
            return executeDML(operation.params);
        }).then(() => {
            if (this.isDebug) console.log('triggerDML: DML operation done');
            popupUtil.stopSpinner();
            if (operation.next) {
                if (this.isDebug) console.log('triggerDML: chained action to trigger',JSON.stringify(operation.next));
                this.processAction(operation.next,null);
                if (this.isDebug) console.log('triggerDML: END / chained action triggered');
            }
            else {
                if (this.isDebug) console.log('triggerDML: END / no chained action to trigger');
            }
        })
        .catch((error) => {
            this.displayMsg = JSON.stringify(error);
            popupUtil.stopSpinner();
            if (this.isDebug) console.log('triggerDML: END / Issue when processing operation: ' , JSON.stringify(error));
        });
        if (this.isDebug) console.log('triggerDML: confirmation promise started');            
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

    triggerLdsForm = function(formAction) {
        if (this.isDebug) console.log('triggerLdsForm: START with ',JSON.stringify(formAction));

        if ((!formAction.record) || (!formAction.fields)) {
            console.warn('triggerLdsForm: END KO / Missing record and/or fields properties');
            throw "Missing record and/or fields properties in ldsForm params!";
        }

        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
        if (this.isDebug) console.log('triggerLdsForm: popupUtil fetched ', popupUtil);

        popupUtil.showRecordForm(   formAction.title || DEFAULT_POPUP_HEADER, formAction.message || DEFAULT_POPUP_MESSAGE,
                                    formAction.record , formAction.fields, formAction.columns, true)
        .then(() => {
            if (this.isDebug) console.log('triggerLdsForm: END - create/edit done');
            if (formAction.next) {
                if (this.isDebug) console.log('triggerLdsForm: chained action to trigger',JSON.stringify(formAction.next));
                this.processAction(formAction.next,null);
                if (this.isDebug) console.log('triggerLdsForm: chained action triggered');
            }
            else {
                if (this.isDebug) console.log('triggerLdsForm: no chained action to trigger');
            }
        })
        .catch((error) => {
            this.displayMsg = JSON.stringify(error);
            if (this.isDebug) console.log('triggerLdsForm: END / Issue when processing operation: ' , JSON.stringify(error));
        });
        if (this.isDebug) console.log('triggerLdsForm: popup displayed');
    }

    triggerDmlForm = function(formAction) {
        if (this.isDebug) console.log('triggerDmlForm: START with ',JSON.stringify(formAction));

        if ((!formAction.formRecord) || (!formAction.formFields) || (!formAction.record))  {
            console.warn('triggerDmlForm: END KO / Missing formRecord, formFields and/or record properties');
            throw "Missing formRecord, formFields and/or record properties in dmlForm params!";
        }

        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
        if (this.isDebug) console.log('triggerDmlForm: popupUtil fetched ', popupUtil);

        popupUtil.showRecordForm(   formAction.title || DEFAULT_POPUP_HEADER, formAction.message || DEFAULT_POPUP_MESSAGE,
                                    formAction.formRecord, formAction.formFields, formAction.columns, false)
        .then((userInput) => {
            if (this.isDebug) console.log('triggerDmlForm: user input received',JSON.stringify(userInput));
            
            let dmlAction = {
                'title'     : formAction.title,
                'message'   : formAction.messageSave,
                'params'    : {
                    'records': []
                },
                'bypassConfirm': true,
                'next': formAction.next
            };
            if (this.isDebug) console.log('triggerDmlForm: formAction recalled ', JSON.stringify(formAction));

            dmlAction.params.operation = ((formAction.record.Id)? 'update' : 'insert');
            if (this.isDebug) console.log('triggerDmlForm: DML operation determined ',dmlAction.params.operation);

            let fieldMapping = formAction.fieldMapping || {};
            if (this.isDebug) console.log('triggerDmlForm: fieldMapping set ',JSON.stringify(fieldMapping));

            let outputRecord = {...(formAction.record)};
            if (this.isDebug) console.log('triggerDmlForm: outputRecord cloned ',JSON.stringify(outputRecord));
            const ignoredFields = ['ObjectApiName','RecordTypeId'];
            for (let iterField in userInput) {
                if (this.isDebug) console.log('triggerDmlForm: processing field ',iterField);
                if (!(ignoredFields.includes(iterField))) {
                    if (this.isDebug) console.log('triggerDmlForm: merging field ',iterField);
                    if (this.isDebug) console.log('triggerDmlForm: with value ',userInput[iterField]);
                    let targetIterField =  fieldMapping[iterField] || iterField;
                    if (this.isDebug) console.log('triggerDmlForm: in field ',targetIterField);
                    outputRecord[targetIterField] = userInput[iterField];
                    //if (this.isDebug) console.log('triggerDmlForm: with new value ',outputRecord[targetIterField]);
                }
                else {
                    if (this.isDebug) console.log('triggerDmlForm: ignoring field ',iterField);
                }
            }
            if (this.isDebug) console.log('triggerDmlForm: DML record prepared ',JSON.stringify(outputRecord));
            (dmlAction.params.records).push(outputRecord);

            if (this.isDebug) console.log('triggerDmlForm: END / triggering DML operation ',JSON.stringify(dmlAction));
            this.triggerDML(dmlAction);
        })
        .catch((error) => {
            this.displayMsg = JSON.stringify(error);
            if (this.isDebug) console.log('triggerDmlForm: END - Issue when processing operatio: ' , JSON.stringify(error));
        });
        if (this.isDebug) console.log('triggerDmlForm: popup displayed');
    }

    triggerMassForm = function(formAction) {
        if (this.isDebug) console.log('triggerMassForm: START with ',JSON.stringify(formAction));

        if ((this._recordList) && (this._recordList.length > 0)) {
            if (this.isDebug) console.log('triggerMassForm: processing record list ', JSON.stringify(this._recordList));

            let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
            if (this.isDebug) console.log('triggerMassForm: popupUtil fetched ', popupUtil);

            popupUtil.showRecordForm(   (formAction.title || DEFAULT_MASS_POPUP_HEADER) + ' (' + this._recordList.length + ')', formAction.message || DEFAULT_MASS_POPUP_MESSAGE,
                                        formAction.record , formAction.fields, formAction.columns, false)
            .then((record) => {
                if (this.isDebug) console.log('triggerMassForm: END - user input done', JSON.stringify(record));

                let updateList = [];
                this._recordList.forEach(rcdIter => {
                    if (this.isDebug) console.log('triggerMassForm: processing rcdIter', JSON.stringify(rcdIter));
                    let rcdUpdate = {...record};
                    rcdUpdate.Id = rcdIter.Id;
                    if ((formAction.removeRT) && (rcdUpdate.RecordTypeId)) {
                        if (this.isDebug) console.log('triggerMassForm: removing RecordTypeId');
                        delete rcdUpdate.RecordTypeId;
                    }
                    updateList.push(rcdUpdate);
                });
                if (this.isDebug) console.log('triggerMassForm: updateList prepared ', JSON.stringify(updateList));
                
                popupUtil.startSpinner((formAction.title || DEFAULT_MASS_POPUP_HEADER) + ' (' + this._recordList.length + ')', EXECUTION_MESSAGE);
                if (this.isDebug) console.log('triggerMassForm: launching mass DML');
                return executeDML({"operation":"update", "records":updateList});
            }).then(() => {
                //this.showSpinner = false;
                if (this.isDebug) console.log('triggerMassForm: mass update DML done');
                popupUtil.stopSpinner();
                if (formAction.next) {
                    if (this.isDebug) console.log('triggerMassForm: chained action to trigger',JSON.stringify(formAction.next));
                    this.processAction(formAction.next,null);
                    if (this.isDebug) console.log('triggerMassForm: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerMassForm: END / no chained action to trigger');
                }
            }).catch((message) => {
                console.warn('triggerMassForm: END KO / execution error: ' , message);
                popupUtil.stopSpinner();
            });
            if (this.isDebug) console.log('triggerMassForm: form popup displayed');
        }
        else {
            console.warn('triggerMassForm: END / no record to process');
        }
    }

    triggerMassDML = function(dmlAction,context) {
        if (this.isDebug) console.log('triggerMassDML: START with ',JSON.stringify(dmlAction));

        if (!dmlAction.operation)  {
            console.warn('triggerDmlForm: END KO / Missing operation property');
            throw "Missing operation property in massDML params!";
        }

        if ((this._recordList && this._recordList.length > 0)) {
            if (this.isDebug) console.log('triggerMassDML: processing record list ', JSON.stringify(this._recordList));

            let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
            if (this.isDebug) console.log('triggerMassDML: popupUtil fetched ', popupUtil);

            let confirmPromise;
            if (dmlAction.bypassConfirm) {
                if (this.isDebug) console.log('triggerMassDML: bypassing confirmation for operation ',dmlAction.operation);
                confirmPromise = new Promise((resolve,reject) => {
                    if (this.isDebug) console.log('triggerMassDML: confirmation bypassed');
                    resolve();
                });
            }
            else {
                if (this.isDebug) console.log('triggerDML: not bypassing confirmation for operation ',dmlAction.operation);
                confirmPromise = popupUtil.showConfirm((dmlAction.title || DEFAULT_MASS_POPUP_HEADER) + ' (' + this._recordList.length + ')', (dmlAction.message || DEFAULT_CONFIRM_MESSAGE));
            }
            if (this.isDebug) console.log('triggerDML: confirmation promise initialised');

            confirmPromise.then(() => {
                if (this.isDebug) console.log('triggerDML: confirmation bypassed/received');
                popupUtil.startSpinner((dmlAction.title || DEFAULT_MASS_POPUP_HEADER) + ' (' + this._recordList.length + ')', EXECUTION_MESSAGE);

                let dmlList = [];
                switch (dmlAction.operation) {
                    case 'update': 
                        if (this.isDebug) console.log('triggerMassDML: initializing update operation');
                        this._recordList.forEach(rcdIter => {
                            if (this.isDebug) console.log('triggerMassDML: processing rcdIter', JSON.stringify(rcdIter));
                            let rcdUpdate = {...(dmlAction.record || {})};
                            rcdUpdate.Id = rcdIter.Id;
                            dmlList.push(rcdUpdate);
                        });
                        break;
                    case 'delete':
                        if (this.isDebug) console.log('triggerMassDML: initializing delete operation');
                        this._recordList.forEach(rcdIter => {
                            if (this.isDebug) console.log('triggerMassDML: processing rcdIter', JSON.stringify(rcdIter));
                            let rcdUpdate = {"Id":rcdIter.Id};
                            dmlList.push(rcdUpdate);
                        });
                        break;
                    default:
                        console.warn('triggerMassDML: unsupported operation ',dmlAction.type);
                        throw 'Unsupported mass DML operation! --> ' + dmlAction.type;
                }
                if (this.isDebug) console.log('triggerMassDML: dmlList prepared for update ', JSON.stringify(dmlList));

                if (this.isDebug) console.log('triggerMassDML: launching mass DML');
                return executeDML({"operation":dmlAction.operation, "records":dmlList});
            }).then(() => {
                if (this.isDebug) console.log('triggerMassDML: mass DML done');
                popupUtil.stopSpinner();

                if (dmlAction.next) {
                    if (this.isDebug) console.log('triggerMassDML: chained action to trigger',JSON.stringify(dmlAction.next));
                    this.processAction(dmlAction.next,null);
                    if (this.isDebug) console.log('triggerMassDML: END / chained action triggered');
                }
                else {
                    if (this.isDebug) console.log('triggerMassDML: END / no chained action to trigger');
                }
            }).catch((error) => {
                this.displayMsg = JSON.stringify(error);
                popupUtil.stopSpinner();
                console.warn('triggerMassDML: END KO / execution error: ' , JSON.stringify(error));
            });
            if (this.isDebug) console.log('triggerMassDML: confirmation popup displayed');
        }
        else {
            console.warn('triggerMassDML: END / no record to process');
        }
    }

    triggerReload = function(reloadAction,context) {
        if (this.isDebug) console.log('triggerReload: START with ',JSON.stringify(reloadAction));

        if ((!reloadAction) || (!reloadAction.recordId))  {
            console.warn('triggerReload: END KO / Missing recordId property');
            throw "Missing recordId property in reload operation params!";
        }

        getRecordNotifyChange([{recordId: reloadAction.recordId}]);

        if (this.isDebug) console.log('triggerReload: END');
    }

    triggerApex = function(apexAction) {
        if (this.isDebug) console.log('triggerApex: START with ', JSON.stringify(apexAction));

        if ((!apexAction.name) || (!apexAction.params)) {
            console.warn('triggerApex: END KO / Missing name and/or params properties');
            throw "Missing name and/or params properties in apex params!";
        }

        let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
        if (this.isDebug) console.log('triggerMassDML: popupUtil fetched ', popupUtil);

        let confirmPromise;
        if (apexAction.bypassConfirm) {
            if (this.isDebug) console.log('triggerApex: bypassing confirmation for operation ',apexAction.name);
            confirmPromise = new Promise((resolve,reject) => {
                if (this.isDebug) console.log('triggerApex: confirmation bypassed');
                resolve();
            });
        }
        else {
            if (this.isDebug) console.log('triggerApex: not bypassing confirmation for operation ',apexAction.name);
            confirmPromise = popupUtil.showConfirm(apexAction.title || DEFAULT_APEX_HEADER, apexAction.message || DEFAULT_CONFIRM_MESSAGE);
        }
        if (this.isDebug) console.log('triggerApex: confirmation promise initialised');

        confirmPromise.then(() => {
            let popupUtil = this.template.querySelector('c-sfpeg-popup-dsp');
            popupUtil.startSpinner(apexAction.title || DEFAULT_APEX_HEADER, apexAction.message || EXECUTION_MESSAGE);
            return executeApex({ "action": apexAction.name, "params": apexAction.params });
        }).then((result) => {
            if (this.isDebug) console.log('triggerApex: action executed ', JSON.stringify(result));
            popupUtil.stopSpinner();
            if (apexAction.next) {
                if (this.isDebug) console.log('triggerApex: chained action to trigger ',JSON.stringify(apexAction.next));
                this.processAction(apexAction.next,null);
                if (this.isDebug) console.log('triggerApex: END / chained action triggered');
            }
            else {
                if (this.isDebug) console.log('triggerApex: END / no chained action to trigger');
            }
        })
        .catch((error) => {
            console.warn('triggerApex: END / Issue when processing operation: ', JSON.stringify(error));
            popupUtil.stopSpinner();
            this.triggerToast({
                title : apexAction.label || DEFAULT_APEX_HEADER,
                message: error.body.message,
                variant: 'error'
            }, null);
        });
        if (this.isDebug) console.log('triggerApex: confirmation popup displayed');
    }

    triggerUtilityAction = function(action) {
        if (this.isDebug) console.log('triggerUtilityAction: START with ', JSON.stringify(action));

        let actionNotif = {
            'action': action,
            'context': null
        };
        if (this.isDebug) console.log('triggerUtilityAction: actionNotif prepared ',JSON.stringify(actionNotif));

        publish(this.messageContext, sfpegAction, actionNotif);
        if (this.isDebug) console.log('triggerUtilityAction: END - message sent');
    }

    triggerCustomAction = function(action,channel) {
        if (this.isDebug) console.log('triggerCustomAction: START with ', JSON.stringify(action));

        if (channel) {
            if (this.isDebug) console.log('triggerCustomAction: processing action for channel ', channel);

            let actionNotif = {
                'channel': channel,
                'action': action,
                'context': null
            };
            if (this.isDebug) console.log('triggerCustomAction: actionNotif prepared ', JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomAction, actionNotif);
            if (this.isDebug) console.log('triggerCustomAction: END OK / message sent');
        }
        else {
            this.displayMsg = "Missing channel in custom action configuration!";
            console.warn('triggerCustomAction: END KO / Missing channel in action');
        }
    }

    triggerCustomNotification = function(notification,channel) {
        if (this.isDebug) console.log('triggerCustomNotification: START with ',JSON.stringify(notification));

        if (channel) {
            if (this.isDebug) console.log('triggerCustomNotification: processing action for channel ', channel);

            let actionNotif = {
                'channel': channel,
                'action': notification,
                'context': null
            };
            if (this.isDebug) console.log('triggerCustomNotification: actionNotif prepared ',JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomNotification, actionNotif);
            if (this.isDebug) console.log('triggerCustomNotification: END OK / message sent');
        }
        else {
            this.displayMsg = "Missing channel in custom notification configuration!";
            console.warn('triggerCustomNotification: END KO / Missing channel in action');
        }
    }

    // Context Merge Utilities (OBSOLETE --> migrated to merge and action components)
    /*
    mergeActionContext = function(action, context) {
        if (this.isDebug) console.log('mergeParams: START');

        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.actions,this.configDetails.input,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
        .then( value => {
            if (this.isDebug) console.log('doMerge: context merged within configuration ',value);
            this.configDetails.actionList = JSON.parse(value)
            if (this.isDebug) console.log('doMerge: END configuration updated', JSON.stringify(this.configDetails.actionList));
        }).catch( error => {
            if (this.isDebug) console.warn('doMerge: KO ',error);
            this.displayMsg = JSON.stringify(error);
        }).finally( () => {
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            this.isReady = true;
        });
    }
    
    mergeParams = function(params, context) {
        if (this.isDebug) console.log('mergeParams: START');

        let mergedParams = params;
        let paramsStr = JSON.stringify(params);
        if (paramsStr.includes('{{{')) {
            if (this.isDebug) console.log('mergeParams: parsing tokens');

            let tokens = this.parseString(paramsStr);
            if (this.isDebug) console.log('mergeParams: tokens parsed',tokens);

            paramsStr = this.mergeString(paramsStr,tokens,context);
            if (this.isDebug) console.log('mergeParams: paramsStr merged',paramsStr);

            mergedParams = JSON.parse(paramsStr);
            if (this.isDebug) console.log('mergeParams: END / mergedParams reparsed ',mergedParams);
        }
        else {
            if (this.isDebug) console.log('mergeParams: END / no merge required',mergedParams);
        }
        return mergedParams;
    }

    parseString = function(templateString) {
        if (this.isDebug) console.log('parseString: START with templateString ',templateString);

        // eslint-disable-next-line no-useless-escape
        let regexp = /\{\{\{([\.\w-_]*)\}\}\}/gi;
        //console.log('parseString: regexp', regexp);
        let mergeKeys = templateString.match(regexp);
        if (this.isDebug) console.log('parseString: mergeKeys extracted ', mergeKeys);

        if (! mergeKeys) {
            console.warn('parseString: END / no mergeKeys found');
            return [];
        }

        let mergeFields = [];
        mergeKeys.forEach(mergeKey => {
            if (this.isDebug) console.log('parseString: processing mergeKey',mergeKey);
            let mergeField = ((mergeKey.replace(/\{|\}/gi,'')).trim());
            if (this.isDebug) console.log('parseString: mergeField extracted', mergeField);
            let splitIndex = mergeField.indexOf('.');
            mergeFields.push({
                "token":mergeKey,
                "domain": mergeField.slice(0, splitIndex),
                "field": mergeField.slice(splitIndex +1)
            });
        });

        if (this.isDebug) console.log('parseString: END / returning ',mergeFields);
        return mergeFields;
    }

    mergeString = function(templateString,tokens,context) {
        if (this.isDebug) console.log('mergeString: START with templateString ',templateString);
        if (this.isDebug) console.log('mergeString: context provided ',JSON.stringify(context));
        if (this.isDebug) console.log('mergeString: recordData init ',JSON.stringify(this.recordData));
        if (this.isDebug) console.log('mergeString: userData init ',JSON.stringify(this.userData));

        let mergedString = templateString;
        tokens.forEach(token => {
            if (this.isDebug) console.log('mergeString: processing token ',token);

            let tokenKey = token['token'];
            let tokenValue = null;
            switch (token['domain']) {
                case 'RCD': 
                    //if (this.recordData) tokenValue = this.recordData.data.fields[token['field']].value;
                    if (this.recordData) tokenValue = this.getValue(this.recordData.data.fields,token['field']);
                    break;
                case 'ROW':
                    if (context) tokenValue = context[token['field']];
                    break;
                case 'USR':
                    //if (this.userData) tokenValue = this.userData.data.fields[token['field']].value;
                    if (this.userData) tokenValue = this.getValue(this.userData.data.fields,token['field']);
                    break;
                case 'GEN': 
                    switch (token['field']) {
                        case "objectApiName":
                            tokenValue = this.objectApiName;
                            break;
                        case "recordId": 
                            tokenValue = this.recordId;
                            break;
                        case "userId": 
                            tokenValue =  this.userId;
                            break;
                        default:
                            console.warn('mergeString: unsupported GEN field ',token['field']);
                    }
                    break;
                default:
                    if (this.isDebug) console.log('mergeString: current configData ',JSON.stringify(this.configData));
                    if (this.configData) tokenValue = (this.configData[token['domain']])[token['field']];            
            }
            if (this.isDebug) console.log('mergeString: tokenValue extracted ',tokenValue);
            
            if (tokenValue != null) {
                let tokenRegex = new RegExp(tokenKey, 'g');
                mergedString = mergedString.replace(tokenRegex,tokenValue);
                if (this.isDebug) console.log('mergeString: mergedString updated ',mergedString);
            }
            else {
                console.warn('mergeString: no value available for token ', tokenKey);
                let tokenRegex = new RegExp(tokenKey, 'g');
                mergedString = mergedString.replace(tokenRegex,'');
            }
        });
        if (this.isDebug) console.log('mergeString: END with mergedString ',mergedString);
        return mergedString;
    }
    
    getValue = function (record,field) {
        if (this.isDebug) console.log('getValue: START with field ',field);
        if (this.isDebug) console.log('getValue: record provided ',record);

        if ((field) && (record)) {
            if (field.includes('.')) {
                if (this.isDebug) console.log('getValue: processing relation field ');
                let index = field.indexOf('.');
                if (this.isDebug) console.log('getValue: index of 1st relation ',index);
                let relationField = field.substring(0,index);
                if (this.isDebug) console.log('getValue: relationField extracted ',relationField);
                let subFields = field.substring(index+1);
                if (this.isDebug) console.log('getValue: END - fetching next field in relation ',subFields);
                return this.getValue(record[relationField].value.fields,subFields);
            }
            else {
                if (this.isDebug) console.log('getValue: END - returning simple field ',record[field].value);
                return record[field].value;
            }
        }
        else {
            console.warn('getValue: END - No field name or record provided');
            return null;
        }
    }
    */
}