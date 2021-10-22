import { LightningElement, wire , api, track} from 'lwc';
import currentUserId from '@salesforce/user/Id';
import sfpegMergeUtl from 'c/sfpegMergeUtl';
import { getRecord } from 'lightning/uiRecordApi';
import { getFieldValue } from 'lightning/uiRecordApi';

export default class SfpegMessageCmp extends LightningElement {

    //----------------------------------------------------------------
    // Configuration parameters
    //----------------------------------------------------------------
    @api msgClass = 'slds-box slds-theme_default'; // CSS class for the wrapping div

    @api configIcon;             // Config of the Icon name
    @api iconSize = 'medium';    // Size of the icon
    @api iconVariant = 'default';// Variant of the icon (for utility ones)

    @api configTitle;           // Config of the message title
    @api configMsg;             // Config of the message content
 
    @api actionConfigName;      // DeveloperName fo the sfpegAction__mdt record to be used as action    

    @api isDebug = false;       // Activates logs

    //----------------------------------------------------------------
    // Internal Display parameters
    //----------------------------------------------------------------
    @track displayIcon;     // Actual icon name displayed (contextualized)
    @track displayTitle;    // Actual message title displayed (contextualized)
    @track displayMsg;      // Actual message content displayed (contextualized)

    //----------------------------------------------------------------
    // Internal Context fetch parameters
    //----------------------------------------------------------------
    configTemplate      // Template combining the different configuration strings requiring contextual merge
    tokenMap            // Map of the different tokens referenced within the message icon, title and content configuration

    @api objectApiName; // Object API Name for current page record (if any)
    @api recordId;      // ID of current page record (if any
    recordFields;       // List of record field names for LDS
    recordData;         // Record Data fetched via LDS

    @api userId = currentUserId;// ID of current User
    userFields;         // List of user fields for LDS
    userData;           // User Data

    //----------------------------------------------------------------
    // Component Initialization
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connectedCallback: START');

        let config = {};
        let mergeRequired = false;
        if ((this.configIcon) && (this.configIcon.includes('{{{'))) {
            if (this.isDebug) console.log('connectedCallback: registering configIcon for merge',this.configIcon);
            config.icon = this.configIcon;
            mergeRequired=true;
        }
        else {
            if (this.isDebug) console.log('connectedCallback: initialising displayIcon directly ',this.displayIcon);
            this.displayIcon = this.configIcon;
        }
        if ((this.configTitle) && (this.configTitle.includes('{{{'))) {
            if (this.isDebug) console.log('connectedCallback: registering configTitle for merge',this.configTitle);
            config.title = this.configTitle;
            mergeRequired=true;
        }
        else {
            if (this.isDebug) console.log('connectedCallback: initialising displayIcon directly ',this.displayTitle);
            this.displayTitle = this.configTitle;
        }
        if ((this.configMsg) && (this.configMsg.includes('{{{'))) {
            if (this.isDebug) console.log('connectedCallback: registering configMsg for merge',this.configMsg);
            config.message = this.configMsg;
            mergeRequired=true;
        }
        else {
            if (this.isDebug) console.log('connectedCallback: initialising displayMsg directly ',this.displayMsg);
            this.displayMsg = this.configMsg;
        }
        if (this.isDebug) console.log('connectedCallback: configuration initialized ', config);

        if (mergeRequired) {
            if (this.isDebug) console.log('connectedCallback: processing merge ');

            this.configTemplate = JSON.stringify(config);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
            this.tokenMap = sfpegMergeUtl.sfpegMergeUtl.extractTokens(this.configTemplate,this.objectApiName);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('connectedCallback: tokenMap extracted ',JSON.stringify(this.tokenMap));

            if (this.tokenMap.RCD) {
                if (this.isDebug) console.log('connectedCallback: preparing record fields ',this.recordFieldNames);
                this.recordFields = this.tokenMap.RCD.ldsFields;
                if (this.isDebug) console.log('connectedCallback: record fields for LDS init ',this.recordFields);
            }
            else {
                if (this.isDebug) console.log('connectedCallback: no record fields');
            }

            if (this.tokenMap.USR) {
                if (this.isDebug) console.log('connectedCallback: preparing user fields ',this.userFieldNames);
                this.userFields = this.tokenMap.USR.ldsFields;
                if (this.isDebug) console.log('connectedCallback: user fields for LDS init ',this.userFields);
            }
            else {
                if (this.isDebug) console.log('connectedCallback: no user fields ');
            }

            if ((this.tokenMap.USR) || (this.tokenMap.RCD)) {
                if (this.isDebug) console.log('connectedCallback: waiting for LDS fetch');
            }
            else {
                if (this.isDebug) console.log('connectedCallback: calling merge');
                this.doMerge();
            }
            if (this.isDebug) console.log('connectedCallback: merge requested ');
        }
        else {
            if (this.isDebug) console.log('connectedCallback: END / no merge required');
        }
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------
    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields ',JSON.stringify(this.recordFields));
        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK ', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
            this.recordData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.tokenMap.RCD);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredRecord: recordData updated ', JSON.stringify(this.recordData));

            if ((this.tokenMap.USR) && (!this.userData)) {
                if (this.isDebug) console.log('wiredRecord: END waiting for user LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: END calling merge');
                this.doMerge();
            }
        }
        else if (error) {
            this.recordData = null;
            console.warn('wiredRecord: END data fetch KO ', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END N/A');
        }
    };

    // Current User 
    @wire(getRecord, { "recordId": '$userId', "fields": '$userFields' })
    wiredUser({ error, data }) {
        if (this.isDebug) console.log('wiredUser: START with ID ', this.userId);
        if (this.isDebug) console.log('wiredUser: userFields ',JSON.stringify(this.userFields));
        if (data) {
            if (this.isDebug) console.log('wiredUser: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.tokenMap.USR);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredUser: userData updated ', JSON.stringify(this.userData));

            if ((this.tokenMap.RCD) && (!this.recordData)) {
                if (this.isDebug) console.log('wiredUser: END waiting for record LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredUser: END calling merge');
                this.doMerge();
            }
        }
        else if (error) {
            this.userData = null;
            console.warn('wiredUser: END data fetch KO ', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredUser: END N/A');
        }
    }

    //----------------------------------------------------------------
    // Contextual Data Merge
    //----------------------------------------------------------------
    doMerge = function(){
        if (this.isDebug) console.log('doMerge: START with ',this.configTemplate);
        let contextObj = {'Name':"NAME",'Status':"STATUS",'Type':"Unknown"};
        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebug;
        sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configTemplate,this.tokenMap,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,contextObj)
        .then( value => {
            if (this.isDebug) console.log('doMerge: context merged within configuration ',value);
            let configData = JSON.parse(value);
            if (this.isDebug) console.log('doMerge: parsing done ',configData);
            if (configData.icon) this.displayIcon = configData.icon;
            if (configData.title) this.displayTitle = configData.title;
            if (configData.message) {
                this.displayMsg = null;
                this.displayMsg = configData.message;
            }
            if (this.isDebug) console.log('doMerge: icon updated',this.displayIcon);
            if (this.isDebug) console.log('doMerge: title updated',this.displayTitle);
            if (this.isDebug) console.log('doMerge: message updated',this.displayMsg);
            if (this.isDebug) console.log('doMerge: END configuration updated');
        }).catch( error => {
            if (this.isDebug) console.warn('doMerge: KO ',error);
            this.displayMsg = JSON.stringify(error);
        }).finally( () => {
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
        });
        if (this.isDebug) console.log('doMerge: merge requested ');
    }
}