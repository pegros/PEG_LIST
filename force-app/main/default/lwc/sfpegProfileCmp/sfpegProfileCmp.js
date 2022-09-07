/***
* @author P-E GROS
* @date  August 2021
* @description  LWC Component to display a summary of record information in various 
*               ways (background header, avatar, header summary, header badges,
*               detailed info list/table).
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

import { LightningElement, api, track, wire } from 'lwc';

import currentUserId        from '@salesforce/user/Id';
import { getRecord }        from 'lightning/uiRecordApi';
import { getObjectInfo }    from 'lightning/uiObjectInfoApi';
import getConfiguration     from '@salesforce/apex/sfpegProfile_CTL.getConfiguration';

import BANNER_RSC           from '@salesforce/resourceUrl/sfpegBanners';
import AVATAR_RSC           from '@salesforce/resourceUrl/sfpegAvatars';

var PROFILE_CONFIGS = {};

export default class SfpegProfileCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api configName;            // DeveloperName fo the sfpegProfile__mdt record to be used
    @api wrappingClass;         // CSS Classes for the wrapping div
    @api size = "small";        // Global size of the component --> impacts the display of the different elements.
    @api detailsPadding = 'none'; // Additional padding size for the detail fields (none by default)
    @api actionAlignment = 'end'; // Action bar alignment mode (start, center, end)
    @api maxSize = 100;         // Action list overflow limit
    @api isInverseMode = false; // Flag to trigger inverse mode activation for text fields
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //---------------------------------------------------------------
    // Context initialization fields
    //----------------------------------------------------------------
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    recordFields;               // List of record field names for LDS data fetch (for avatar & bannner)
    labelObject;                // Object API name used to fetch field labels (for titles or actual labels)
    @api userId = currentUserId;// ID of current User

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    @track isReady = false;     // Initialization state of the component (to control spinner)
    @track configDetails = {};  // Global configuration of the component
    @track errorMsg = null;     // Initialisation error message

    @track bannerImage = null;              // Banner background Icon URL (may depend on record)
    @track avatarImage = null;              // Avatar Icon URL (may depend on record)
    //badgeTextClass ="slds-badge slds-badge_lightest";   // CSS class for the badge content
    //titleClass = "slds-text-heading_small"; // Text CSS for title field
    //fieldClass = "slds-text-body_small";    // Text CSS for details fields
    fieldVariant = "label-hidden";          // Output variant for details fields

    //----------------------------------------------------------------
    // Custom Getters for UI
    //----------------------------------------------------------------
    // for header
    get hasHeader() {
        return ( (this.bannerImage != null) || (this.avatarImage != null)
                ||  ((this.configDetails) && (this.configDetails?.isHeaderDisplayed)));
    }
    get bannerContainerClass() {
        return "profileBannerContainer-" + this.size;
    }
    get bannerImageClass() {
        return "profileBannerImage-" + this.size;
    } 
    get avatarClass() {
        return "slds-media__figure profileAvatar-" + this.size;
    }
    get badgeSectionClass(){
        return "profileBadge-" + this.size;
    }
    get badgeItemClass(){
        return "profileBadge " + (this.configDetails?.header?.badgeClass || "slds-badge slds-badge_lightest");
    }
    get badgeTextClass() {
        return "slds-text-title_bold profileBadgeText " + ((this.configDetails?.header?.badgeClass && this.configDetails?.header?.badgeClass?.includes("inverse")) ? "slds-text-color_inverse" : "");
    }
    get titleDetailsClass(){
        return (this.avatarImage ? "" : "slds-var-p-horizontal_" + this.detailsPadding);
    }
    get titleClass() {
        // slds-text-heading_small profileTitle
        return "slds-page-header__title slds-var-p-bottom_x-small " + (this.isInverseMode ? " slds-text-color_inverse" : "");
    }
    get fieldClass() {
        return "slds-text-body_small" + (this.isInverseMode ? " slds-text-color_inverse" : "");
    }
    get headerConfig() {
        return (this.configDetails?.objectHeader[this.objectApiName] || {});
    }

    //for action bar
    get hasActions() {
        return ((this.configDetails?.actions) &&  (this.configDetails?.actions !== 'N/A'));
    }
    get isTitleAction() {
        return this.actionAlignment === "title";
    }
    get actionClass() {
        return "profileActions slds-grid slds-grid_align-" + this.actionAlignment + " slds-var-p-horizontal_" + this.detailsPadding;
    }
    get titleActionClass() {
        return "slds-media__figure slds-media__figure_reverse slds-var-p-right_" + this.detailsPadding;
    }

    // for details
    get hasDetails() {
        return  ((this.configDetails) && (this.configDetails?.isDetailsDisplayed));
    }
    get detailsClass() {
        return "profileDetails slds-var-p-vertical_" + this.detailsPadding + " slds-p-horizontal_" + this.detailsPadding;
        //return "profileDetails slds-var-p-around_" + this.detailsPadding;
    }
    get isGridDisplay(){
        return !(this.configDetails?.details?.variant === "list");
    }
    get isBaseDisplay(){
        return (this.configDetails?.details?.variant === "base");
    }
    get isMediaDisplay() {
        return (this.configDetails?.details?.variant === "media");
    }
    get isTableDisplay() {
        return (this.configDetails?.details?.variant === "table")
    }
    get detailsConfig() {
        return (this.configDetails?.objectDetails[this.objectApiName] || []);
    }
    get fieldIconSize() {
        return ((this.configDetails?.details) ? this.configDetails?.details?.iconSize || "small" : "small");
    }
    get fieldIconVariant() {
        return (this.isInverseMode ? "inverse" : "");
    }
    
    // for debug
    get bannerSrc() {
        return JSON.stringify(this.configDetails?.banner);
    }
    get avatarSrc() {
        return JSON.stringify(this.configDetails?.avatar);
    }
    get headerSrc() {
        return JSON.stringify(this.configDetails?.header);
    }
    get detailsSrc() {
        return JSON.stringify(this.configDetails?.details);
    }
    
    
    //----------------------------------------------------------------
    // Component Initialization
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connected: START with config ', this.configName);
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

        if (PROFILE_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            this.configDetails = PROFILE_CONFIGS[this.configName];
            this.finalizeConfig();
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server', this.configName);
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',JSON.stringify(result));
                try {
                    PROFILE_CONFIGS[this.configName] = {
                        banner:  {value: result.ProfileBanner__c, isStatic: true},
                        avatar:  {value: result.ProfileAvatar__c, isStatic: true},
                        header:  JSON.parse(result.ProfileHeader__c  || '{}'),
                        objectHeader: {},
                        actions: (result.ProfileActions__c || 'N/A'),
                        details: JSON.parse(result.ProfileDetails__c || '{}'),
                        objectDetails: {},
                        recordFields: {"raw":[]},
                        labelFields: [],
                        labelFieldsOK: {}
                        //tokens: sfpegMergeUtl.sfpegMergeUtl.extractTokens((result.MessageDisplay__c || '{}'),this.objectApiName)
                    };
                    if ((result.ProfileBanner__c) && (result.ProfileBanner__c.includes('fieldName'))) {
                        if (this.isDebug) console.log('connected: registering dynamic banner field ',result.ProfileBanner__c);
                        let bannerObj = JSON.parse(result.ProfileBanner__c);
                        (PROFILE_CONFIGS[this.configName].recordFields.raw).push(bannerObj.fieldName);
                        (PROFILE_CONFIGS[this.configName]).banner.isStatic = false;
                        (PROFILE_CONFIGS[this.configName]).banner.fieldName = bannerObj.fieldName;
                    }
                    if ((result.ProfileAvatar__c) && (result.ProfileAvatar__c.includes('fieldName'))) {
                        if (this.isDebug) console.log('connected: registering dynamic avatar field ',result.ProfileAvatar__c);
                        let avatarObj = JSON.parse(result.ProfileAvatar__c);
                        (PROFILE_CONFIGS[this.configName].recordFields.raw).push(avatarObj.fieldName);
                        (PROFILE_CONFIGS[this.configName]).avatar.isStatic = false;
                        (PROFILE_CONFIGS[this.configName]).avatar.fieldName = avatarObj.fieldName;
                    }

                    if (result.ProfileHeader__c) {
                        if (this.isDebug) console.log('connected: reworking details ');
                        if (this.isDebug) console.log('connected: registering header fields for label fetch ');
                        if (PROFILE_CONFIGS[this.configName].header.title) {
                            (PROFILE_CONFIGS[this.configName].labelFields).push(PROFILE_CONFIGS[this.configName].header.title);
                        }
                        if (PROFILE_CONFIGS[this.configName].header.badge) {
                            (PROFILE_CONFIGS[this.configName].labelFields).push(PROFILE_CONFIGS[this.configName].header.badge);
                        }
                        if (PROFILE_CONFIGS[this.configName].header.details) {
                            (PROFILE_CONFIGS[this.configName].header.details).forEach(item => 
                                (PROFILE_CONFIGS[this.configName].labelFields).push(item));
                        }
                    }

                    if (result.ProfileDetails__c) {
                        if (this.isDebug) console.log('connected: reworking details ');
                        (PROFILE_CONFIGS[this.configName]).details.fieldClass = "slds-col slds-var-p-vertical_xx-small slds-size_1-of-" + ((PROFILE_CONFIGS[this.configName]).details.columns || "1");
                        (PROFILE_CONFIGS[this.configName]).details.variant = (PROFILE_CONFIGS[this.configName]).details.variant || "list";

                        if (this.isDebug) console.log('connected: registering details field for label fetch');
                        if (PROFILE_CONFIGS[this.configName].details.fields) {
                            (PROFILE_CONFIGS[this.configName].details.fields).forEach(item => {
                                if (typeof item === 'object') { 
                                    (PROFILE_CONFIGS[this.configName].labelFields).push(item.fieldName);
                                }
                                else {
                                    (PROFILE_CONFIGS[this.configName].labelFields).push(item);
                                }
                            });
                        }
                    }
                    if (this.isDebug) console.log('connected: labels to fetch registered ', JSON.stringify(PROFILE_CONFIGS[this.configName].labelFields));                    

                    this.configDetails = PROFILE_CONFIGS[this.configName];
                    if (this.isDebug) console.log('connected: END / configuration parsed');
                    this.finalizeConfig();
                    this.isReady = true;
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

    //----------------------------------------------------------------
    // Configuration Finalization / Update
    //----------------------------------------------------------------
    //Configuration finalisation
    finalizeConfig = function() {
        if (this.isDebug) console.log('finalizeConfig: START');

        if (this.isDebug) console.log('finalizeConfig: analyzing banner and avatar ',JSON.stringify(this.configDetails));
        if (this.configDetails.banner.value) {
            if (this.configDetails.banner.isStatic) {
                if (this.isDebug) console.log('finalizeConfig: static banner / adding resource URL');
                this.bannerImage = BANNER_RSC + '/' + this.configDetails.banner.value; 
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: dynamic banner / setting default image while loading ', this.configDetails.banner.fieldName);
                this.bannerImage = BANNER_RSC + '/banner1.png'; 
            }
        }
        else {
            if (this.isDebug) console.log('finalizeConfig: no banner to display');
        }

        if (this.configDetails.avatar.value) {
            if (this.configDetails.avatar.isStatic) {
                if (this.isDebug) console.log('finalizeConfig: static avatar / adding resource URL');
                this.avatarImage = AVATAR_RSC + '/' + this.configDetails.avatar.value; 
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: dynamic avatar / setting default image while loading ', this.configDetails.avatar.fieldName);
                this.avatarImage = AVATAR_RSC + '/avatar1.jpg'; 
            }
        }
        else {
            if (this.isDebug) console.log('finalizeConfig: no avatar to display');
        }

        if ((this.configDetails.recordFields.raw).length > 0) {
            if (this.configDetails.recordFields[this.objectApiName]) {
                if (this.isDebug) console.log('finalizeConfig: fetching previously init field list');
                this.recordFields = this.configDetails.recordFields[this.objectApiName];
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: initializing object specific field list');
                this.configDetails.recordFields[this.objectApiName] = [];
                this.configDetails.recordFields.raw.forEach(item => (this.configDetails.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item));
                this.recordFields = this.configDetails.recordFields[this.objectApiName];
            }
            if (this.isDebug) console.log('finalizeConfig: field list init', JSON.stringify(this.recordFields));
        }
        else {
            if (this.isDebug) console.log('finalizeConfig: no field list to init');
        }

        if ((this.configDetails.labelFields).length > 0) {
            if (this.configDetails.labelFieldsOK[this.objectApiName]) {
                if (this.isDebug) console.log('finalizeConfig: field labels already initialized');
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: fetching field labels for new object ',this.objectApiName);
                this.labelObject = this.objectApiName;
                if (this.isDebug) console.log('finalizeConfig: field list init', JSON.stringify(this.configDetails.labelFields));
            }
        }
        else {
            if (this.isDebug) console.log('finalizeConfig: no field labels to fetch');
        }

        if (this.isDebug) console.log('finalizeConfig: END');        
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------
    // Current Record 
    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields fetched ',JSON.stringify(this.recordFields));

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK', JSON.stringify(data));

            if (!this.configDetails.banner.isStatic) {
                if (this.isDebug) console.log('wiredRecord: setting dynamic banner based on ',this.configDetails.banner.fieldName);
                if (data.fields[this.configDetails.banner.fieldName]) {
                    this.bannerImage = BANNER_RSC + '/' + data.fields[this.configDetails.banner.fieldName].value; 
                    if (this.isDebug) console.log('wiredRecord: dynamic banner updated ',this.bannerImage);
                }
                else {
                    if (this.isDebug) console.log('wiredRecord: dynamic banner value not available ');
                }
            }
            if (!this.configDetails.avatar.isStatic) {
                if (this.isDebug) console.log('wiredRecord: setting dynamic avatar based on ',this.configDetails.avatar.fieldName);
                if (data.fields[this.configDetails.avatar.fieldName]) {
                    this.avatarImage = AVATAR_RSC + '/' + data.fields[this.configDetails.avatar.fieldName].value; 
                    if (this.isDebug) console.log('wiredRecord: dynamic avatar updated ',this.avatarImage);
                }
                else {
                    if (this.isDebug) console.log('wiredRecord: dynamic avatar value not available ');
                }
            }
            if (this.isDebug) console.log('wiredRecord: END ');
            this.isReady = true;
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

    @wire(getObjectInfo, { "objectApiName": '$labelObject' })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with ID ', this.labelObject);

        if (data) {
            if (this.isDebug) console.log('wiredObject: object metadata fetch OK ',JSON.stringify(data));
            if (this.configDetails.labelFieldsOK[this.objectApiName]) {
                if (this.isDebug) console.log('wiredObject: END / labels already fetched for object ', this.objectApiName);
            }
            else {
                if (this.isDebug) console.log('wiredObject: processing field labels');
                if (this.configDetails.header) {
                    if (this.isDebug) console.log('wiredObject: processing header ',JSON.stringify(this.configDetails.header));
                    let objHeader = {};
                    let isHeaderDisplayed = false;
                    if (this.configDetails.header.title) {
                        if (this.isDebug) console.log('wiredObject: processing title ',this.configDetails.header.title);
                        let fieldDesc = (data.fields)[this.configDetails.header.title];
                        objHeader.title = {
                            'name': this.configDetails.header.title,
                            'label': (fieldDesc || {}).label
                        };
                        isHeaderDisplayed = true;
                    }
                    if (this.configDetails.header.badge) {
                        if (this.isDebug) console.log('wiredObject: processing badge ',this.configDetails.header.badge)
                        let fieldDesc = (data.fields)[this.configDetails.header.badge];
                        objHeader.badge = {
                            'name': this.configDetails.header.badge,
                            'label': (fieldDesc || {}).label
                        };
                        isHeaderDisplayed = true;
                    }
                    if ((this.configDetails.header.details) && (this.configDetails.header.details.length > 0)) {
                        if (this.isDebug) console.log('wiredObject: processing details ',JSON.stringify(this.configDetails.header.details));
                        objHeader.details =  [];
                        (this.configDetails.header.details).forEach(item => {
                            let fieldDesc = (data.fields)[item];
                            objHeader.details.push({
                                'name': item,
                                'label': (fieldDesc || {}).label
                            });
                        });
                        isHeaderDisplayed = true;
                    }
                    (this.configDetails.objectHeader)[this.objectApiName]=objHeader;
                    this.configDetails.isHeaderDisplayed = isHeaderDisplayed;
                    if (this.isDebug) console.log('wiredObject: object specific header finalized ',JSON.stringify(this.configDetails.objectHeader[this.objectApiName]));
                }
                else {
                    if (this.isDebug) console.log('wiredObject: no header to finalize');
                    this.configDetails.isHeaderDisplayed = false;
                }
                if (this.isDebug) console.log('wiredObject: Header display set ',this.configDetails.isHeaderDisplayed);

                if ((this.configDetails.details) && (this.configDetails.details.fields) && (this.configDetails.details.fields.length > 0)) {
                    if (this.isDebug) console.log('wiredObject: processing details ',JSON.stringify(this.configDetails.details));

                    let objDetails = [];
                    (this.configDetails.details.fields).forEach(item => {
                        if (typeof item === 'object') { 
                            let fieldDesc = (data.fields)[item.fieldName];
                            objDetails.push({
                                'name': item.fieldName,
                                'icon': item.iconName,
                                'label': (fieldDesc || {}).label
                            });
                        }
                        else {
                            let fieldDesc = (data.fields)[item];
                            objDetails.push({
                                'name': item,
                                'label': (fieldDesc || {}).label
                            });
                        }
                    });
                    this.configDetails.objectDetails[this.objectApiName]=objDetails;
                    if (this.isDebug) console.log('wiredObject: object specific details finalized ',JSON.stringify(this.configDetails.objectDetails[this.objectApiName]));
                    this.configDetails.isDetailsDisplayed = true;
                }
                else {
                    if (this.isDebug) console.log('wiredObject: no details to finalize');
                    this.configDetails.isDetailsDisplayed = false;
                }
                if (this.isDebug) console.log('wiredObject: Details display set ',this.configDetails.isDetailsDisplayed);

                this.configDetails.labelFieldsOK[this.objectApiName] = true;
                if (this.isDebug) console.log('wiredObject: END / labels init for object ', this.objectApiName);
            } 
        }
        else if (error) {
            console.warn('wiredObject: data fetch KO', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('wiredObject: END N/A');
        }
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Form data loading --> to display/hide badges
    handleFormLoad(event){
        if (this.isDebug) console.log('handleFormLoad: START ');
        //if (this.isDebug) console.log('handleFormLoad: event ',event);
        //if (this.isDebug) console.log('handleFormLoad: event details ',JSON.stringify(event.detail));

        if (this.configDetails?.header?.badge) {
            if (this.isDebug) console.log('handleFormLoad: badge configuration fetched ',JSON.stringify(this.configDetails.header.badge));
            let badgeValue = (event.detail.records[this.recordId]).fields[this.configDetails.header.badge];
            if (this.isDebug) console.log('handleFormLoad: badgeValue extracted ',JSON.stringify(badgeValue));

            let badgeDisplayDiv = this.template.querySelector(".profileBadge");
            if (this.isDebug) console.log('handleFormLoad: badgeDisplayDiv  ',badgeDisplayDiv);
            let badgeDisplayDiv2 = this.template.querySelector("#" + this.configDetails.header.badge);
            if (this.isDebug) console.log('handleFormLoad: badgeDisplayDiv2  ',badgeDisplayDiv2);
            if (badgeDisplayDiv) {
                if (badgeValue?.value) {
                    if (this.isDebug) console.log('handleFormLoad: displaying badge  ');
                    badgeDisplayDiv.classList.remove("slds-hidden");
                }
                else {
                    if (this.isDebug) console.log('handleFormLoad: hiding badge  ');
                    badgeDisplayDiv.classList.add("slds-hidden");
                }
            }
            else {
                if (this.isDebug) console.log('handleFormLoad: badge div not found');
            }
        }

        const outputFields = this.template.querySelectorAll('.headerField');
        if (this.isDebug) console.log('handleFormLoad: outputFields fetched',outputFields);
        if (outputFields) {
            outputFields.forEach(item => {
                if (this.isDebug) console.log('handleFormLoad: processing field', item);
                const fieldName = item.dataset.name;
                if (this.isDebug) console.log('handleFormLoad: fieldName extracted',fieldName);
                const fieldValue = (event.detail.records[this.recordId]).fields[fieldName];
                if (this.isDebug) console.log('handleFormLoad: fieldValue fetched',JSON.stringify(fieldValue));
                if (fieldValue?.value == null) {
                    if (this.isDebug) console.log('handleFormLoad: hiding field');
                    item.classList.add("slds-hide");
                }
                else {
                    if (this.isDebug) console.log('handleFormLoad: unhiding field');
                    item.classList.remove("slds-hide");
                };
            });
        }

        if (this.isDebug) console.log('handleFormLoad: END');
    }
}