/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display Lists of records in a datatable, a list of tiles or
*               cards.
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
import getConfiguration     from '@salesforce/apex/sfpegList_CTL.getConfiguration';
import getCount             from '@salesforce/apex/sfpegList_CTL.getCount';
import getData              from '@salesforce/apex/sfpegList_CTL.getData';
import getPaginatedData     from '@salesforce/apex/sfpegList_CTL.getPaginatedData';
import currentUserId        from '@salesforce/user/Id';
import { getRecord }        from 'lightning/uiRecordApi';
import sfpegJsonUtl         from 'c/sfpegJsonUtl';
import sfpegMergeUtl        from 'c/sfpegMergeUtl';
import sfpegCsvUtl          from 'c/sfpegCsvUtl';

import FORM_FACTOR          from '@salesforce/client/formFactor';

import REFRESH_LABEL        from '@salesforce/label/c.sfpegListRefresh';
import FILTER_LABEL         from '@salesforce/label/c.sfpegListFilter';
import FILTER_ALL           from '@salesforce/label/c.sfpegListFilterAll';
import FILTER_PLACEHOLDER   from '@salesforce/label/c.sfpegListFilterPlaceholder';
import FILTER_APPLY_LABEL   from '@salesforce/label/c.sfpegListFilterApply';
import FILTER_CLOSE_LABEL   from '@salesforce/label/c.sfpegListFilterClose';
import FILTER_SCOPE_LABEL   from '@salesforce/label/c.sfpegListFilterScope';
import SORT_LABEL           from '@salesforce/label/c.sfpegListSort';
import EXPORT_LABEL         from '@salesforce/label/c.sfpegListExport';
import INIT_LABEL           from '@salesforce/label/c.sfpegListInit';
import LOAD_LABEL           from '@salesforce/label/c.sfpegListLoading';
import SEARCH_LABEL         from '@salesforce/label/c.sfpegListSearching';
import LOAD_MORE_LABEL      from '@salesforce/label/c.sfpegListLoadMore';

var LIST_CONFIGS = {};

export default class SfpegListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardTitle;             // Title of the wrapping Card
    @api cardIcon;              // Icon of the wrapping Card
    @api cardClass;             // CSS Classes for the wrapping card div
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)

    @api configName;            // DeveloperName of the sfpegList__mdt record to be used
    @api actionConfigName;      // DeveloperName of the sfpegAction__mdt record to be used for header actions
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
    @track isReady = false;         // Initialization state of the component (to control spinner)
    @track isExpandDone = false;    // Execution state of the expandAll operation (for treeGrid in expandAll property set)
    @track configDetails = null;    // Global configuration of the component
    
    // Internal Query Control Parameters
    @track isLoading = false;   // Ongoing Query state  (to control spinner)
    recordCount = 0;            // Total number of records (fetched separately in case of pagination mode)

    // pagination mode
    lastRecordKey = null;       // last fetched record value (for offset management) 
    paginatedInput = null;      // last context data (for next paginated queries)

    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    @track recordFields = null; // List of Field API Names for current page record (if any) required as Query Input
    recordData = null;          // Data of the current page record (if any) required for Query Input

    userId = currentUserId;     // ID of current User
    @track userFields = null;   // List of Field API Names for current User (if any) required as Query Input
    userData = null;            // Data of the current User (if any) required for Query Input

    @track selectedRecords = null; // List of selected records (if doSelection) or all records (if not) for mass actions

    // Internal Display Parameter
    @track errorMsg = null;     // Error message (if any for end user display)
    @track resultList = null;   // Current List of results displayed (possibly filtered).
    resultListOrig = null;      // Current List of results fetched (original version, not filtered).

    //Sorting management
    @track sortFields = null;       // List of field sort options for List display mode (for the sort menu)
    @track sortDirection = 'asc';   // Current sorting direction (asc/desc)
    @track sortedBy = null;         // Field upon which the current sorting is done
    
    //Filter management
    @track isFiltered = false;      // State of the filter applied 
    @track showFilter = false;      // State of the filter popup
    @track filterFields = null;     // List of field filter scope options
    @track filterScope = null;      // Applicable filter scope selected (default being "ALL")
    @track filterString = null;     // Applicable filter keywords entered
    @track isFiltering = false;     // Ongoing Filter state  (to control spinner)

    //Form Factor (fo mobile specific configuration override)
    formfactor = FORM_FACTOR;

    //Widget Labels & Titles from custom labels
    refreshTitle = REFRESH_LABEL;
    filterTitle = FILTER_LABEL;
    filterAllOption = FILTER_ALL;
    filterPlaceholder = FILTER_PLACEHOLDER;
    filterApplyTitle = FILTER_APPLY_LABEL;
    filterCloseTitle = FILTER_CLOSE_LABEL;
    filterScopeTitle = FILTER_SCOPE_LABEL;
    sortTitle = SORT_LABEL;
    exportTitle = EXPORT_LABEL;
    initLabel = INIT_LABEL;
    loadLabel = LOAD_LABEL;
    searchLabel = SEARCH_LABEL;
    loadMoreLabel = LOAD_MORE_LABEL;

    //Rendering optimisation (Summer22)
    renderConfig = {virtualize: 'vertical'};

    //----------------------------------------------------------------
    // Custom UI Display getters
    //----------------------------------------------------------------
    get hasErrorMsg () {
        if (this.errorMsg) return true;
        return false;
    }
    get hasConfig () {
        if (this.configDetails) return true;
        return false;
    }
    get resultCount () {
        return (this.resultList || []).length;
    }
    get formatTitle() {
        let filteredCount = (this.resultList || []).length;
        let loadedCount = (this.resultListOrig || this.resultList || []).length;
        let totalCount = this.recordCount;
        let countSection = '' + filteredCount
                        + (((this.showFilter) || (loadedCount != filteredCount)) ? ' / ' + loadedCount : '')
                        + ((totalCount != loadedCount) ? ' / ' + totalCount : '');
        //if (this.isDebug) console.log('formatTitle: countSection ', countSection);
        if (this.showCount) {
            switch(this.showCount) {
                case 'right' :
                    return (this.cardTitle || '') + " (" + countSection + ")";
                case 'left' :
                    return countSection + " " + (this.cardTitle || '');
                default:
                    return (this.cardTitle || '');
            }
        }
        return (this.cardTitle || '');
        //return ((this.cardTitle || '') + (this.showCount ? " (" + this.resultCount + ")" : ""));
    }
    get displayType() {
        return (this.configDetails ? this.configDetails.type : "Not set");
    }
    get contentClass() {
        let returnClass = 'slds-card__body cardContent';
        if ((this.isCollapsible) && (this.isCollapsed)) {
            returnClass = returnClass + " slds-is-collapsed";
        }
        else if ((this.configDetails) && (this.configDetails.type.includes('List'))) {
            returnClass = returnClass + ' slds-var-p-horizontal_small'
                        + (((this.displayHeight) &&  (this.displayHeight !== '0')) ? ' slds-scrollable_y' : '')
                        + ((this.configDetails.display.variant === 'timeline') ? ' slds-var-p-top_medium slds-var-p-bottom_large' : ' slds-var-p-vertical_small');
        }
        if (this.isDebug) console.log('contentClass: value init ', returnClass);
        return returnClass;
        /*
        return 'slds-card__body cardContent'
            + (this.isCollapsible ? (this.isCollapsed ? " slds-is-collapsed" : " slds-is-expanded") : "")
            + (((this.configDetails) && (this.configDetails.type.includes('List')))
                ? ' slds-var-p-around_small'
                    + (((this.displayHeight) &&  (this.displayHeight !== '0')) ? ' slds-scrollable_y' : '')
                : '');*/
    }
    get contentStyle() {
        if ((this.isCollapsible) && (this.isCollapsed)) {
            return '';
        }
        else if ((this.resultList || []).length == 0) {
            return '';
        }
        //return (((this.displayHeight) &&  (this.displayHeight !== '0')) ? 'height: ' + this.displayHeight + ';' : 'height:100%;');
        return (((this.displayHeight) &&  (this.displayHeight !== '0')) ? 'height: ' + this.displayHeight + ';' : '');
    }
    get showPagination() {
        //if (this.isDebug) console.log('showPagination: showPagination? ', this.configDetails.query.doPagination);
        return (    (this.configDetails.query.doPagination)
                &&  ((this.resultListOrig || this.resultList || []).length < (this.recordCount || 0)) );
        //return ((this.configDetails.query.doPagination));
    }
    get formatSearchScope() {
        // Method to "truncate" label of the scope selector menu in the filter popup,
        // in order to keep enough space for the actual search input widget.
        if (this.isDebug) console.log('formatSearchScope: START');

        let divWrapper = this.template.querySelector('div[data-my-id=wrapperDiv]');
        if (this.isDebug) console.log('formatSearchScope: wrapperDiv ', divWrapper);

        let popupWidth = ((divWrapper.clientWidth - 46) - 2 );
        //if (this.isDebug) console.log('formatSearchScope: popupWidth ', popupWidth);
        let inputWidth = 30 + popupWidth / 2;
        //if (this.isDebug) console.log('formatSearchScope: inputWidth ', inputWidth);
        let selectWidth = popupWidth - inputWidth - 28 - 32 - 32;
        //if (this.isDebug) console.log('formatSearchScope: selectWidth ', selectWidth);
        let maxChars = Math.max(selectWidth / 10 - 2,0);
        if (this.isDebug) console.log('formatSearchScope: maxChars ', maxChars);

        let label = this.filterScope.label || 'All';
        if (maxChars < 3) {
            label = null;
        }
        else if (label.length > maxChars) {
            label = label.slice(0,maxChars) + '...';
        }
        console.log('formatSearchScope: END with ', label);
        return label;
    }

    get showCardHeaderIcons() {
        return (this.cardIcon || this.isCollapsible);
    }

    // Data Table mode related getters
    get isDataTable() {
        return (this.configDetails) && (this.configDetails.type === "DataTable");
    }
    get hideCheckbox() {
        return (this.configDetails.display.hideCheckboxColumn == null) || this.configDetails.display.hideCheckboxColumn;
    }
    get widthMode() {
        return this.configDetails.display.columnWidthMode || 'fixed';
    }
    get maxRowSelection() {
        return this.configDetails.display.maxRowSelection || 1;
    }

    // Tree Grid mode related getters
    get isTreeGrid() {
        return (this.configDetails) && (this.configDetails.type === "TreeGrid") && (this.resultList);
    }

    // List mode related getters
    get isList() {
        return (this.configDetails) && (this.configDetails.type.includes('List'));
        /*return (this.configDetails)
            && (    (this.configDetails.type === "CardList")
                ||  (this.configDetails.type === "TileList") );*/
    }
    get showSort() {
        return (this.sortFields) && (this.sortFields.length > 0);
    }
    get listClass() {
        return "slds-col slds-size_1-of-" + (this.configDetails.display.cardNbr || "1");
    }
    get tileSize() {
        return 12 / (this.configDetails.display.cardNbr || 1);
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');
        if (this.isDebug) console.log('connected: recordId provided ',this.recordId);
        if (this.isDebug) console.log('connected: objectApiName provided ',this.objectApiName);
        if (this.isDebug) console.log('connected: userId provided ',this.userId);
        if (this.isDebug) console.log('connected: formfactor provided ',this.formfactor);
        
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
        if (LIST_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            //this.errorMsg = 'Local configuration fetched: ' + LIST_CONFIGS[this.configName].label;
            this.configDetails = LIST_CONFIGS[this.configName];
            this.finalizeConfig();
            //this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
                try {
                    LIST_CONFIGS[this.configName] = {
                        label: result.MasterLabel,
                        type: result.DisplayType__c,
                        query: {
                            doFlatten: result.FlattenResults__c,
                            doPagination: result.DoPagination__c,
                            orderByField: result.QueryOrderBy__c,
                        },
                        display: JSON.parse(result.DisplayConfig__c || '{}'),
                        input: {
                            template: (result.QueryInput__c || '{}'),
                            tokens: sfpegMergeUtl.sfpegMergeUtl.extractTokens((result.QueryInput__c || '{}'),this.objectApiName)
                        },
                        rowActions: (result.RowActions__c || 'N/A')
                    };
                    this.configDetails = LIST_CONFIGS[this.configName];

                    if ((this.configDetails.display.menu) && (this.configDetails.display.columns))  {
                        if (this.isDebug) console.log('connected: registering menu in columns configuration ',JSON.stringify(this.configDetails.display.menu));
                        this.configDetails.display.columns.push({
                            type: "action",
                            typeAttributes: {
                                class: "slds-scrollable_none",
                                rowActions: this.configDetails.display.menu
                            }
                        });
                        if (this.isDebug) console.log('connected: columns configuration updated ',JSON.stringify(this.configDetails.display.columns));
                        //if (this.isDebug) console.log('connected: LIST_CONFIGS[this.configName] state ',JSON.stringify(LIST_CONFIGS[this.configName]));
                    }

                    if (this.formfactor === "Small") {
                        if (this.isDebug) console.log('connected: overriding configuration for mobile');
                        this.configDetails.type = "TileList"; 
                        this.configDetails.display.cardNbr = 1; 
                        this.configDetails.display.fieldNbr = 1; 
                        /*if (this.configDetails.display.menu) {
                            this.configDetails.display.menu.forEach(item => {
                                if (!item.title) item.title = item.label;
                                if (item.label) delete item.label;
                            });
                        }*/
                    }

                    this.finalizeConfig();
                    if (this.isDebug) console.log('connected: END / configuration parsed');
                    //this.errorMsg = 'Configuration fetched and parsed: ' + LIST_CONFIGS[this.configName].label;
                }
                catch (parseError){
                    console.warn('connected: END / configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                    this.isReady = true;
                }
                finally {
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

    renderedCallback() {
        if (this.isDebug) console.log('renderedCallback: START');

        if ((this.isReady) && (!this.isExpandDone) && (this.configDetails?.type === "TreeGrid") && (this.configDetails?.display?.expandAll)){
            if (this.isDebug) console.log('renderedCallback: expanding tree grid by default');

            const treeGridCmp =  this.template.querySelector('lightning-tree-grid');
            if (this.isDebug) console.log('renderedCallback: treeGridCmp fetched ', treeGridCmp);

            if (treeGridCmp) {
                treeGridCmp.expandAll();
                this.isExpandDone = true;
                if (this.isDebug) console.log('renderedCallback: treeGridCmp expanded');
            }
            else {
                if (this.isDebug) console.log('renderedCallback: treeGridCmp not yet rendered');
            }
        }

        if (this.isDebug) console.log('renderedCallback: END');
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------
    // Current Record 
    @wire(getRecord, { "recordId": '$recordId', "fields": '$recordFields' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START with ID ', this.recordId);
        if (this.isDebug) console.log('wiredRecord: recordFields fetched ',JSON.stringify(this.recordFields));
        if (this.isDebug) console.log('wiredRecord: tokens fetched ',JSON.stringify(this.configDetails.input.tokens.RCD));

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.recordData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.tokens.RCD);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredRecord: END / recordData updated ', JSON.stringify(this.recordData));

            //this.recordData = data;
            //this.executeQuery();
            if ((this.userFields) && (!this.userData)) {
                if (this.isDebug) console.log('wiredRecord: END waiting for user LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredRecord: END executing query');
                this.executeQuery();
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
        if (this.isDebug) console.log('wiredUser: tokens fetched ',JSON.stringify(this.configDetails.input.tokens.USR));

        if (data) {
            if (this.isDebug) console.log('wiredUser: data fetch OK', JSON.stringify(data));

            sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
            this.userData = sfpegMergeUtl.sfpegMergeUtl.convertLdsData(data,this.configDetails.input.tokens.USR);
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            if (this.isDebug) console.log('wiredUser: END / userData updated ', JSON.stringify(this.userData));

            //this.userData = data;
            //this.executeQuery();
            if ((this.recordFields) && (!this.recordData)) {
                if (this.isDebug) console.log('wiredUser: END waiting for record LDS fetch');
            }
            else {
                if (this.isDebug) console.log('wiredUser: END executing query');
                this.executeQuery();
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
            if (this.configDetails.input.userFields) {
                ldsFetchRequired = true;
                this.userFields = this.configDetails.input.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from previous',JSON.stringify(this.userFields));
            }
            else if (this.configDetails.input.tokens.USR) {
                ldsFetchRequired = true;
                //this.configDetails.input.userFields = [];
                //this.configDetails.input.USR.forEach(item => (this.configDetails.userFields).push('User.' + item));
                this.configDetails.input.userFields = this.configDetails.input.tokens.USR.ldsFields;
                this.userFields = this.configDetails.input.userFields;
                if (this.isDebug) console.log('finalizeConfig: userFields init from config',JSON.stringify(this.userFields));
            }

            // Record contextual data fetch
            if (this.objectApiName) {
                if (this.isDebug) console.log('finalizeConfig: analysing record fields for object ',this.objectApiName);
                if (this.configDetails.input.recordFields) {
                    ldsFetchRequired = true;
                    if (this.configDetails.input.recordFields[this.objectApiName]) {
                        this.recordFields = this.configDetails.input.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (same object)',JSON.stringify(this.recordFields));
                    }
                    else {
                        this.configDetails.input.recordFields[this.objectApiName] = [];
                        this.configDetails.input.tokens.RCD.forEach(item => (this.configDetails.input.recordFields[this.objectApiName]).push(this.objectApiName + '.' + item.field));
                        this.recordFields = this.configDetails.input.recordFields[this.objectApiName];
                        if (this.isDebug) console.log('finalizeConfig: recordFields init from previous (with different object) ',JSON.stringify(this.recordFields));
                    }
                }
                else if (this.configDetails.input.tokens.RCD){
                    ldsFetchRequired = true;
                    this.configDetails.input.recordFields = {};
                    this.configDetails.input.recordFields[this.objectApiName] = this.configDetails.input.tokens.RCD.ldsFields;
                    this.recordFields = this.configDetails.input.recordFields[this.objectApiName];
                    if (this.isDebug) console.log('finalizeConfig: recordFields init from config',JSON.stringify(this.recordFields));
                }
            }

            // Handling of specific list mode elements (Sorting)
            if (this.configDetails.type.includes('List')) {
                if (this.isDebug) console.log('finalizeConfig: analysing fields for list sorting ');
                if (this.configDetails.sortFields) {
                    this.sortFields = this.configDetails.sortFields;
                    if (this.isDebug) console.log('finalizeConfig: sortFields init from previous',JSON.stringify(this.sortFields));
                }
                else {
                    this.configDetails.sortFields = [];
                    let titleField = 'NOT_SET';
                    if ((this.configDetails.display.title) && (this.configDetails.display.title.sortable)) {
                        (this.configDetails.sortFields).push(this.configDetails.display.title);
                        titleField = this.configDetails.display.title.fieldName;
                    }
                    if (this.configDetails.display.columns) {
                        this.configDetails.display.columns.forEach(item => {
                            if ((item.sortable) && (item.fieldName !== titleField))
                                (this.configDetails.sortFields).push(item);
                        });
                    }
                    this.sortFields = this.configDetails.sortFields;
                    if (this.isDebug) console.log('finalizeConfig: sortFields init from config',JSON.stringify(this.sortFields));
                } 
            }

            // Initialization of Search field options
            if (this.showSearch) {
                if (this.configDetails.filterFields) {
                    this.filterFields = [... this.configDetails.filterFields];
                    if (this.isDebug) console.log('finalizeConfig: filterFields init from previous',JSON.stringify(this.filterFields));
                }
                else {
                    this.configDetails.filterFields = [{'label': this.filterAllOption,'fieldName':'ALL','selected':true}];
                    let titleField = 'NOT_SET';
                    if ((this.configDetails.display.title)) {
                        (this.configDetails.filterFields).push(this.configDetails.display.title);
                        titleField = this.configDetails.display.title.fieldName;
                    }
                    if (this.configDetails.display.columns) {
                        this.configDetails.display.columns.forEach(item => {
                            if ((item.sortable) && (item.fieldName !== titleField))
                                 (this.configDetails.filterFields).push(item);
                        });
                    }
                    this.filterFields = [... this.configDetails.filterFields];
                    if (this.isDebug) console.log('finalizeConfig: filterFields init from config',JSON.stringify(this.filterFields));
                }
                this.filterScope = this.filterFields[0];
            } 

            // Initialization of preset filter
            if (this.configDetails?.display?.filter) {
                if (this.isDebug) console.log('finalizeConfig: initializing filter from config',JSON.stringify(this.configDetails.display.filter));
                this.isFiltered = true;
                let filterScopeName = this.configDetails.display.filter.scope || 'ALL';
                if (this.isDebug) console.log('finalizeConfig: provided filter scope name ',filterScopeName);
                this.filterScope = this.filterFields.find(item => item.fieldName === filterScopeName);                
                if (this.isDebug) console.log('finalizeConfig: filter scope set',JSON.stringify(this.filterScope));
                this.filterFields.forEach(item => item.selected = (item.fieldName === this.filterScope.fieldName));
                if (this.isDebug) console.log('finalizeConfig: filterFields updated ',JSON.stringify(this.filterFields));
                this.filterString = this.configDetails.display.filter.string;
                if (this.isDebug) console.log('finalizeConfig: filterString set ',JSON.stringify(this.filterString));
            }

            if (ldsFetchRequired) {
                if (this.isDebug) console.log('finalizeConfig: END / waiting for LDS data fetch');
            }
            else {
                if (this.isDebug) console.log('finalizeConfig: END / executing query');
                this.executeQuery();
            }
            //this.executeQuery();
            //if (this.isDebug) console.log('finalizeConfig: END N/A');
        }
        catch(error) {
            console.warn('finalizeConfig: END / processing failure',error);
            this.isReady = true;
        }
    }

    //Query execution
    //TODO: refactor paginated case to trigger count & initial query in parallel instead of sequence
    executeQuery = function() {
        if (this.isDebug) console.log('executeQuery: START');

        if (this.recordFields && !this.recordData) {
            if (this.isDebug) console.log('executeQuery: END / missing Record Data');
            return;
        }

        if (this.userFields && !this.userData) {
            if (this.isDebug) console.log('executeQuery: END / missing User Data');
            return;
        }

        this.isReady = true;
        if (this.isDebug) console.log('executeQuery: configuration ready / triggering query ');

        this.isLoading = true;
        this.errorMsg = '';
        this.resultListOrig = null
        this.selectedRecords = null;

        let tableOrTree = this.template.querySelector('lightning-datatable') || this.template.querySelector('lightning-tree-grid');
        sfpegMergeUtl.sfpegMergeUtl.isDebug = this.isDebugFine;
        if (this.configDetails.query.doPagination) {
            // PAGINATED CASE HANDLING
            if (this.isDebug) console.log('executeQuery: processing paginated query');
            let inputData = null;
            sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.input.template,this.configDetails.input.tokens,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
            .then( value => {
                sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
                if (this.isDebug) console.log('executeQuery: context merged within configuration ',value);
                inputData = JSON.parse(value);
                if (this.isDebug) console.log('executeQuery: input Data parsed',inputData);

                if (this.contextString) {
                    if (this.isDebug) console.log('executeQuery: adding context',this.contextString);
                    inputData.CONTEXT = this.contextString;
                }

                if (this.isDebug) console.log('executeQuery: fetching count');
                this.paginatedInput = inputData;
                return getCount({name: this.configName, input: inputData});
            }).then((result) => {
                if (this.isDebug) console.log('executeQuery: count received ', result);
                this.recordCount = result;
                if (this.isDebug) console.log('executeQuery: recordCount updated ', this.recordCount);

                if (this.recordCount > 0) {
                    if (this.isDebug) console.log('executeQuery: fetching data (1st page)');
                    return getPaginatedData({   name:   this.configName,
                                                input:  inputData,
                                                lastRecord: null    });
                }
                else {
                    if (this.isDebug) console.log('executeQuery: no data to fetch');
                    return new Promise((resolve,reject) => {
                        if (sfpegMergeUtl.isDebug) console.log('executeQuery: promise END returning empty list ');
                        resolve(null);
                    });
                }
            }).then((result) => {
                //if (this.isDebug) console.log('executeQuery: config ', JSON.stringify(this.configDetails));
                if (this.isDebug) console.log('executeQuery: paginated results received ', JSON.stringify(result));
                this.resultList = [];
                if (this.configDetails.query.doFlatten) {
                    if (this.isDebug) console.log('executeQuery: flattening results with hierarchy fields', JSON.stringify(this.configDetails.display.hierarchyFields));
                    //sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebugFine;
                    this.resultList = sfpegJsonUtl.sfpegJsonUtl.flattenJsonList(result || [],this.configDetails.display.hierarchyFields || []);
                    //sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                }
                else {
                    if (this.isDebug) console.log('executeQuery: no flatten required');
                    this.resultList = result || [];
                }
                if (this.isDebug) console.log('executeQuery: results updated ', JSON.stringify(this.resultList));
                
                if (this.hideCheckbox) {
                    if (this.isDebug) console.log('executeQuery: CheckBox hidden ');
                    this.selectedRecords = this.resultList;
                }
                else {
                    if (this.isDebug) console.log('executeQuery: CheckBox displayed ');
                    this.selectedRecords = ( tableOrTree ? tableOrTree.getSelectedRows() : []);
                }
                if (this.isDebug) console.log('executeQuery: selectedRecords init ', JSON.stringify(this.selectedRecords));

                if (this.isDebug) console.log('executeQuery: tracking last record key ', this.configDetails.query.orderByField);
                let lastRecord = (this.resultList.length > 0 ? (this.resultList.slice(-1)) : null);
                if (this.isDebug) console.log('executeQuery: lastRecord fetched ', JSON.stringify(lastRecord));
                this.lastRecordKey = (lastRecord ? (lastRecord[0])[(this.configDetails.query.orderByField)] : null);
                if (this.isDebug) console.log('executeQuery: lastRecordKey registered ', this.lastRecordKey);

                if (this.filterString) {
                    if (this.isDebug) console.log('executeQuery: filtering results ');
                    this.filterRecords();
                }
                
                this.sortDirection = 'asc';
                this.sortedBy = null;
                if (this.sortFields) {
                    let sortFields = [...this.sortFields];
                    if (this.isDebug) console.log('executeQuery: resetting sortFields ',JSON.stringify(sortFields));
                    sortFields.forEach(item => {item.iconName = null;});
                    if (this.isDebug) console.log('executeQuery: sortFields reset ',JSON.stringify(sortFields));
                    this.sortFields = sortFields;
                }

                if (this.isDebug) console.log('executeQuery: END OK (pagination)');
            }).catch( error => {
                if (this.isDebug) console.warn('executeQuery: END / KO (pagination) ', error);
                this.resultList = null;
                this.selectedRecords = [];
                this.errorMsg = 'Data fetch failed : ' + ((error.body || error).message || error);
            }).finally( () => {
                if (this.isDebug) console.log('executeQuery: END 2 (pagination)');
                sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
                this.isLoading = false;
            });
        }
        else {
            // STANDARD NON-PAGINATED CASE HANDLING
            if (this.isDebug) console.log('executeQuery: processing non paginated query');
            sfpegMergeUtl.sfpegMergeUtl.mergeTokens(this.configDetails.input.template,this.configDetails.input.tokens,this.userId,this.userData,this.objectApiName,this.recordId,this.recordData,null)
            .then( value => {
                sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
                if (this.isDebug) console.log('executeQuery: context merged within configuration ',value);
                let inputData = JSON.parse(value);
                if (this.isDebug) console.log('executeQuery: input Data parsed ',inputData);
                if (this.contextString) {
                    if (this.isDebug) console.log('executeQuery: adding context',this.contextString);
                    inputData.CONTEXT = this.contextString;
                }
                if (this.isDebug) console.log('executeQuery: fetching data');
                return getData({ name: this.configName, input: inputData});
            }).then((result) => {
                //if (this.isDebug) console.log('executeQuery: config ', JSON.stringify(this.configDetails));
                if (this.isDebug) console.log('executeQuery: results received ', JSON.stringify(result));
                this.resultList = [];
                if (this.configDetails.query.doFlatten) {
                    if (this.isDebug) console.log('executeQuery: flattening results with hierarchy fields', JSON.stringify(this.configDetails.display.hierarchyFields));
                    //sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebugFine;
                    this.resultList = sfpegJsonUtl.sfpegJsonUtl.flattenJsonList(result || [],this.configDetails.display.hierarchyFields || []);
                    //sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                }
                else {
                    if (this.isDebug) console.log('executeQuery: no flatten required');
                    this.resultList = result || [];
                }
                if (this.isDebug) console.log('executeQuery: results updated ', JSON.stringify(this.resultList));

                if (this.isDebug) console.log('executeQuery: hide checkboxes? ', this.hideCheckbox);
                if (this.hideCheckbox) {
                    if (this.isDebug) console.log('executeQuery: CheckBox hidden ');
                    this.selectedRecords = this.resultList;
                }
                else {
                    if (this.isDebug) console.log('executeQuery: CheckBox displayed ');
                    this.selectedRecords = ( tableOrTree ? tableOrTree.getSelectedRows() : []);
                }

                if (this.filterString) {
                    if (this.isDebug) console.log('executeQuery: filtering results ');
                    this.filterRecords();
                }
    
                if (this.isDebug) console.log('executeQuery: selectedRecords init ', JSON.stringify(this.selectedRecords));

                //this.errorMsg = result.length + " item(s) fetched from Server!";
                this.recordCount = this.resultList.length;
                this.sortDirection = 'asc';
                this.sortedBy = null;
                if (this.sortFields) {
                    let sortFields = [...this.sortFields];
                    if (this.isDebug) console.log('executeQuery: resetting sortFields ',JSON.stringify(sortFields));
                    sortFields.forEach(item => {item.iconName = null;});
                    if (this.isDebug) console.log('executeQuery: sortFields reset ',JSON.stringify(sortFields));
                    this.sortFields = sortFields;
                }

                let loadEvt = new CustomEvent('load', { detail: this.resultList });
                if (this.isDebug) console.log('triggerParentEvt: triggering load event for parent component ', JSON.stringify(loadEvt));
                this.dispatchEvent(loadEvt);

                if (this.isDebug) console.log('executeQuery: END OK (no pagination)');
            }).catch( error => {
                if (this.isDebug) console.warn('executeQuery: END / KO (no pagination) ', error);
                this.resultList = null;
                this.selectedRecords = [];
                this.errorMsg = 'Data fetch failed : ' + ((error.body || error).message || error);
            }).finally( () => {
                sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
                this.isLoading = false;
            });
        }
    }

    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------
    // Parent action execution service (for parent components)
    @api doRefresh() {
        if (this.isDebug) console.log('doRefresh: START');
        this.executeQuery();
        if (this.isDebug) console.log('doRefresh: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Refresh action handling
    handleRefresh(event){
        if (this.isDebug) console.log('handleRefresh: START');
        this.isExpandDone = false;
        this.executeQuery();
        if (this.isDebug) console.log('handleRefresh: END');
    }

    // Pagination action handling
    handleLoadNext(event) {
        if (this.isDebug) console.log('handleLoadNext: START');
        if (this.isDebug) console.log('handleLoadNext: lastRecordKey fetched ', this.lastRecordKey);
        if (this.isDebug) console.log('handleLoadNext: paginatedInput fetched ', this.paginatedInput);
        this.isLoading = true;
        
        getPaginatedData({  name:       this.configName,
                            input:      this.paginatedInput,
                            lastRecord: this.lastRecordKey
        }).then((result) => {
            //if (this.isDebug) console.log('executeQuery: config ', JSON.stringify(this.configDetails));
            if (this.isDebug) console.log('handleLoadNext: next page results received ', JSON.stringify(result));
            let resultList = [];
            if (this.configDetails.query.doFlatten) {
                if (this.isDebug) console.log('handleLoadNext: flattening results with hierarchy fields', JSON.stringify(this.configDetails.display.hierarchyFields));
                //sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebug;
                resultList = sfpegJsonUtl.sfpegJsonUtl.flattenJsonList(result || [],this.configDetails.display.hierarchyFields || []);
                //sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
            }
            else {
                if (this.isDebug) console.log('handleLoadNext: no flatten required');
                resultList = result || [];
            }
            if (this.isDebug) console.log('handleLoadNext: page results init ', JSON.stringify(resultList));
            this.resultList = this.resultList.concat(resultList);
            if (this.isDebug) console.log('handleLoadNext: results updated ', JSON.stringify(this.resultList));
            if (this.isDebug) console.log('handleLoadNext: #results displayed ', this.resultList.length);
            
            let tableOrTree = this.template.querySelector('lightning-datatable') || this.template.querySelector('lightning-tree-grid');
            this.selectedRecords = (this.hideCheckbox ? this.resultList : tableOrTree?.getSelectedRows() || [] );
            //if (this.hideCheckbox) this.selectedRecords = this.resultList;
            if (this.isDebug) console.log('handleLoadNext: selectedRecords update ', JSON.stringify(this.selectedRecords));
    
            if (this.resultListOrig) this.resultListOrig = this.resultListOrig.concat(resultList);
            if (this.isDebug) console.log('handleLoadNext: original results updated ', JSON.stringify(this.resultListOrig));
            if (this.isDebug) console.log('handleLoadNext: #original results ', this.resultListOrig?.length);

            if (this.isDebug) console.log('handleLoadNext: tracking last record key ', this.configDetails.query.orderByField);
            let lastRecord = (resultList.length > 0 ? (resultList.slice(-1)) : null);
            if (this.isDebug) console.log('handleLoadNext: lastRecord fetched ', JSON.stringify(lastRecord));
            this.lastRecordKey = ((lastRecord || [{}])[0])[(this.configDetails.query.orderByField)];
            if (this.isDebug) console.log('handleLoadNext: lastRecordKey registered ', this.lastRecordKey);
                
            if (this.filterString) {
                if (this.isDebug) console.log('handleLoadNext: filtering results ');
                this.filterRecords();
            }

            this.sortDirection = 'asc';
            this.sortedBy = null;
            if (this.sortFields) {
                let sortFields = [...this.sortFields];
                if (this.isDebug) console.log('handleLoadNext: resetting sortFields ',JSON.stringify(sortFields));
                sortFields.forEach(item => {item.iconName = null;});
                if (this.isDebug) console.log('handleLoadNext: sortFields reset ',JSON.stringify(sortFields));
                this.sortFields = sortFields;
            }

            if (this.isDebug) console.log('handleLoadNext: END OK');
        }).catch( error => {
            if (this.isDebug) console.warn('handleLoadNext: END / KO ', error);
            this.resultList = null;
            this.selectedRecords = [];
            this.errorMsg = 'Data fetch failed : ' + ((error.body || error).message || error);
        }).finally( () => {
            sfpegMergeUtl.sfpegMergeUtl.isDebug = false;
            this.isLoading = false;
        });

        if (this.isDebug) console.log('handleLoadNext: END');
    }


    // Sorting action handling
    handleSortSelect(event){
        if (this.isDebug) console.log('handleSortSelect: START with ',JSON.stringify(event.detail));

        if (this.isDebug) console.log('handleSortSelect: current direction ',this.sortDirection);
        if (this.isDebug) console.log('handleSortSelect: current sort field ',this.sortedBy);
        if (event.detail.value === this.sortedBy) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        else {
            this.sortedBy = event.detail.value;
            this.sortDirection = 'asc';
        }
        if (this.isDebug) console.log('handleSortSelect: direction updated ',this.sortDirection);
        if (this.isDebug) console.log('handleSortSelect: new sort field ',this.sortedBy);
        
        let results2sort = [...this.resultList];
        if (this.isDebug) console.log('handleSortSelect: results2sort init ',JSON.stringify(results2sort));
        results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy(this.sortedBy, this.sortDirection !== 'asc'));
        if (this.isDebug) console.log('handleSortSelect: results2sort sorted ',JSON.stringify(results2sort));
        this.resultList = results2sort;

        let sortFields = [...this.sortFields];
        if (this.isDebug) console.log('handleSortSelect: current sortFields ',JSON.stringify(sortFields));
        sortFields.forEach(item => {
            if (item.fieldName === this.sortedBy) {
                item.iconName = (this.sortDirection === 'asc' ? "utility:arrowup" : "utility:arrowdown");
            }
            else {
                item.iconName = null;
            }
        });
        if (this.isDebug) console.log('handleSortSelect: sortFields updated ',JSON.stringify(sortFields));
        this.sortFields = sortFields;

        if (this.isDebug) console.log('handleSortSelect: END');
    }
    handleSort(event){
        if (this.isDebug) console.log('handleSort: START with ',JSON.stringify(event.detail));

        let { fieldName: sortedBy, sortDirection } = event.detail;
        if (this.isDebug) console.log('handleSort: selected sortedBy ',sortedBy);
        if (this.isDebug) console.log('handleSort: selected sortDirection ',sortDirection);

        let results2sort = [...this.resultList];
        if (this.isDebug) console.log('handleSort: results2sort init ',results2sort);
        results2sort.sort(sfpegJsonUtl.sfpegJsonUtl.sortBy(sortedBy, sortDirection !== 'asc'));
        if (this.isDebug) console.log('handleSort: results2sort sorted ',results2sort);
        this.resultList = results2sort;

        this.sortDirection = sortDirection;
        if (this.isDebug) console.log('handleSort: sortDirection updated ',this.sortDirection );
        this.sortedBy = sortedBy;
        if (this.isDebug) console.log('handleSort: sortedBy updated ',this.sortedBy);

        if (this.isDebug) console.log('handleSort: END');
    }

    // Filtering action handling
    handleFilterShow(event){
        if (this.isDebug) console.log('handleFilterShow: START with ',this.showFilter);
        if (this.isDebug) console.log('handleFilterShow: filterString ',JSON.stringify(this.filterString));
        this.showFilter = !this.showFilter;
        if (this.isDebug) console.log('handleFilterShow: END with ',this.showFilter); 
    }
    handleFilterSelect(event) {
        if (this.isDebug) console.log('handleFilterSelect: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleFilterSelect: filterScope ',JSON.stringify(this.filterScope));
        if (this.isDebug) console.log('handleFilterSelect: filterString ',JSON.stringify(this.filterString));

        this.filterScope = event.detail.value;
        if (this.isDebug) console.log('handleFilterSelect: filterScope updated ',JSON.stringify(this.filterScope));
        this.filterFields.forEach(item => item.selected = (item.fieldName === this.filterScope.fieldName));
        if (this.isDebug) console.log('handleFilterSelect: filterFields updated ',JSON.stringify(this.filterFields));
        
        if (this.filterString) {
            if (this.isDebug) console.log('handleFilterSelect: relaunching filter ');
            this.filterRecords()
            .then(() => {
                this.showFilter = false;
                if (this.isDebug) console.log('handleFilterSelect: END');
            });
            if (this.isDebug) console.log('handleFilterSelect: filtering triggered');
        }
        else {
            if (this.isDebug) console.log('handleFilterSelect: END / no filter to launch');
        }
    }
    handleFilterChange(event) {
        if (this.isDebug) console.log('handleFilterChange: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleFilterChange: filterScope ',JSON.stringify(this.filterScope));
        if (this.isDebug) console.log('handleFilterChange: filterString ',JSON.stringify(this.filterString));
        let filterInput = this.template.querySelector(".filterInput").value;
        if (this.isDebug) console.log('handleFilterChange: filterInput ',JSON.stringify(filterInput));
        this.filterString =  this.template.querySelector(".filterInput").value;

        if (this.filterString.length == 0) {
            if (this.isDebug) console.log('handleFilterChange: triggering filter (empty string)');
            this.filterRecords()
            .then(() => {
                this.isFiltered = false;
                if (this.isDebug) console.log('handleFilterChange: END ');
            });
            if (this.isDebug) console.log('handleFilterChange: filtering triggered'); 
        }
        else {
            if (this.isDebug) console.log('handleFilterChange: END / ignoring change');
        }
    }
    handleFilterApply(event){
        if (this.isDebug) console.log('handleFilterApply: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleFilterApply: filterScope ',JSON.stringify(this.filterScope));
        if (this.isDebug) console.log('handleFilterApply: filterString ',JSON.stringify(this.filterString));
        let filterInput = this.template.querySelector(".filterInput").value;
        if (this.isDebug) console.log('handleFilterApply: filterInput ',JSON.stringify(filterInput));
        this.filterString =  this.template.querySelector(".filterInput").value;

        this.filterRecords()
        .then(() => {
            if (this.isDebug) console.log('handleFilterApply: END with ',this.isFiltered); 
        });
        if (this.isDebug) console.log('handleFilterApply: filtering triggered'); 
    }
    handleFilterReset(event){
        if (this.isDebug) console.log('handleFilterReset: START with ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleFilterReset: filterScope ',JSON.stringify(this.filterScope));
        if (this.isDebug) console.log('handleFilterReset: filterString ',JSON.stringify(this.filterString));
        let filterInput = this.template.querySelector(".filterInput").value;
        if (this.isDebug) console.log('handleFilterReset: filterInput ',JSON.stringify(filterInput));

        let isEnterKey = event.keyCode === 13;
        if (this.isDebug) console.log('handleFilterReset: keyCode ',event.keyCode);
        if (isEnterKey) {
            if (this.isDebug) console.log('handleFilterReset: triggering filter');
            this.filterString =  this.template.querySelector(".filterInput").value;
            this.filterRecords()
            .then(() => {
                this.showFilter = false;
                if (this.isDebug) console.log('handleFilterReset: END');
            });
            if (this.isDebug) console.log('handleFilterReset: filtering triggered');
        }
        else {
            if (this.isDebug) console.log('handleFilterReset: END / ignoring key stroke');
        }
    }
    filterRecords = function(){
        if (this.isDebug) console.log('filterRecords: START');
        this.isFiltering = true;

        if (this.isDebug) console.log('filterRecords: END returning promise');
        return new Promise((resolve,reject) => {
            if (this.isDebug) console.log('filterRecords: executing promise');
            // trick to force reevaluation of isFiltering 
            setTimeout(() => {
                if (!this.resultListOrig) {
                    if (this.isDebug) console.log('filterRecords: registering original record data list from ',JSON.stringify(this.resultList));
                    this.resultListOrig = this.resultList;
                }

                if (this.isDebug) console.log('filterRecords: original record data list',JSON.stringify(this.resultListOrig));
                if (this.filterString) {
                    if (this.isDebug) console.log('filterRecords: filtering record list');
                    this.isFiltered = true;

                    if (this.filterScope.fieldName === 'ALL') {
                        if (this.isDebug) console.log('filterRecords: filtering on all fields');
                        sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebugFine;
                        //sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                        this.resultList = sfpegJsonUtl.sfpegJsonUtl.filterRecords(this.resultListOrig, this.filterFields.slice(1), this.filterString);
                        sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                    }
                    else {
                        if (this.isDebug) console.log('filterRecords: filtering on single field ', this.filterScope);
                        sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebugFine;
                        //sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                        this.resultList = sfpegJsonUtl.sfpegJsonUtl.filterRecords(this.resultListOrig, [this.filterScope], this.filterString);
                        sfpegJsonUtl.sfpegJsonUtl.isDebug = false;
                    }
                    if (this.isDebug) console.log('filterRecords: filtered list set ', JSON.stringify(this.resultList));
                    if (this.isDebug) console.log('filterRecords: filtered list # ', this.resultList.length);
                    
                    if (this.hideCheckbox) this.selectedRecords = this.resultList;
                    if (this.isDebug) console.log('filterRecords: selectedRecords update ', JSON.stringify(this.selectedRecords));
                }
                else {
                    if (this.isDebug) console.log('filterRecords: resetting original record list');
                    this.isFiltered = false;
                    this.resultList = this.resultListOrig;
                    if (this.hideCheckbox) this.selectedRecords = this.resultList;
                    if (this.isDebug) console.log('filterRecords: original list # ', this.resultList.length);
                }

                //this.showFilter = false;
                //if (this.isDebug) console.log('filterRecords: showFilter', this.showFilter);
                this.isFiltering = false;
                if (this.isDebug) console.log('filterRecords: END');
                resolve();
            }, 0);
            if (this.isDebug) console.log('filterRecords: timeOut set');
        });
        
    }

    // Expand / Collapse management
    handleExpandCollapse(event) {
        if (this.isDebug) console.log('handleExpandCollapse: START with isCollapsed ',this.isCollapsed);
        this.isCollapsed = !this.isCollapsed;
        if (this.isDebug) console.log('handleExpandCollapse: END with isCollapsed ',this.isCollapsed);
    }

    // Header / Row action handling
    handleRowSelection(event){
        if (this.isDebug) console.log('handleRowSelection: START');
        if (this.isDebug) console.log('handleRowSelection: event details',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleRowSelection: event detail selection ',JSON.stringify(event.detail.selectedRows));

        if (this.isDebug) console.log('handleRowSelection: prior selectedRecords ',JSON.stringify(this.selectedRecords));
        this.selectedRecords = event.detail.selectedRows || [];
        if (this.isDebug) console.log('handleRowSelection: selectedRecords updated ',JSON.stringify(this.selectedRecords));

        if (this.isDebug) console.log('handleRowSelection: END');
    }

    handleExport(event) {
        if (this.isDebug) console.log('handleExport: START');

        let fieldList = [];
        if (this.isDebug) console.log('handleExport: fieldList init ', fieldList);
        if (this.configDetails.display.title) fieldList.push(this.configDetails.display.title.fieldName);
        if (this.isDebug) console.log('handleExport: fieldList init ', fieldList);
        this.configDetails.display.columns.forEach(iter => fieldList.push(iter.fieldName));
        if (this.isDebug) console.log('handleExport: fieldList init ', fieldList);

        sfpegCsvUtl.sfpegCsvUtl.isDebug = this.isDebug;
        sfpegCsvUtl.sfpegCsvUtl.export(this.cardTitle,this.resultList,fieldList);
        sfpegCsvUtl.sfpegCsvUtl.isDebug = false;

        if (this.isDebug) console.log('handleExport: END ');
    }

    handleRowAction(event){
        if (this.isDebug) console.log('handleRowAction: START with ',JSON.stringify(event.detail));

        let action = event.detail.action;
        if (this.isDebug) console.log('handleRowAction: action triggered ', JSON.stringify(action));
        this.errorMsg = '';

        if ((action.name) || (action.subTypeAttributes && action.subTypeAttributes.name)) {
            let actioName = action.name || action.subTypeAttributes.name;
            if (this.isDebug) console.log('handleRowAction: triggering action ',actioName);

            let rowActionBar = this.template.querySelector('c-sfpeg-action-bar-cmp[data-my-id=rowActions]');
            console.log('handleRowAction: rowActionBar fetched ',rowActionBar);

            try {
                if (this.isDebug) console.log('handleRowAction: triggering action');
                rowActionBar.executeBarAction(actioName,event.detail.row);
                if (this.isDebug) console.log('handleRowAction: END / action triggered');
            }
            catch (error) {
                console.warn('handleRowAction: END KO / action execution failed!', JSON.stringify(error));
                this.errorMsg = JSON.stringify(error);
            }
        }
        else {
            console.warn('handleAction: END KO / name not configured on action');
        }
       
        /*
        //##### LEGACY CODE #####
        let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
        if (actionBar) {
            if (this.isDebug) console.log('handleRowAction: actionBar found');
            if (event.detail.action.action) {
                if (this.isDebug) console.log('handleRowAction: action details already provided');
                actionBar.executeAction(event.detail.action.action,event.detail.row);
            }
            else if ((event.detail.action.name) || (event.detail.action.subTypeAttributes.name)) {
                // menu vs action
                let actionName = event.detail.action.name || event.detail.action.subTypeAttributes.name;
                if (this.isDebug) console.log('handleRowAction: fetching details for action ',actionName);
                if (this.isDebug) console.log('handleRowAction: configDetails fetched ',JSON.stringify(this.configDetails));
                let actionDetails = this.configDetails.rowActions.find(item => item.name == actionName);
                if (this.isDebug) console.log('handleRowAction: action details found ',JSON.stringify(actionDetails));
                if (actionDetails) {
                    if (this.isDebug) console.log('handleRowAction: fetching details for action ',event.detail.action.name);
                    actionBar.executeAction(actionDetails.action,event.detail.row);
                }
                else {
                    if (this.isDebug) console.log('handleRowAction: configDetails fetched ',JSON.stringify(this.configDetails));
                    console.warn('handleRowAction: action configuration not found for name ',actionName);
                }
            }
            else {
                console.warn('handleRowAction: action name not provided');
            }
        }
        else {
            console.warn('handleRowAction: actionBar not found');
        }
        
        if (this.isDebug) console.log('handleRowAction: END');
        */
    }

    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START with ',JSON.stringify(event.detail));

        if (event.detail.type) {
            if (event.detail.type === 'refresh') {
                if (this.isDebug) console.log('handleActionDone: refreshing list');
                this.executeQuery();
            }
            else if (event.detail.type === 'filter') {
                if (this.isDebug) console.log('handleActionDone: setting filter');

                if (event.detail.params) {
                    this.showFilter = false;
                    if (this.isDebug) console.log('handleActionDone: closing filter popup if needed');
                    if (this.isDebug) console.log('handleActionDone: current filterFields fetched',JSON.stringify(this.filterFields));

                    let filterScopeName = event.detail.params.scope || 'ALL';
                    if (this.isDebug) console.log('handleActionDone: provided filter scope name ',filterScopeName);
                    let newScope = this.filterFields.find(item => item.fieldName === filterScopeName);                
                    if (this.isDebug) console.log('handleActionDone: filter scope reset',JSON.stringify(newScope));
                    
                    if (!newScope) {
                        console.warn('handleActionDone: END / unavailable scope name',filterScopeName );
                        return;
                    }

                    this.filterScope = newScope;
                    //this.filterFields.forEach(item => item.selected = (item.fieldName === this.filterScope.fieldName));
                    this.filterFields.forEach(item => item.selected = (item.fieldName === filterScopeName));
                    if (this.isDebug) console.log('handleActionDone: filterFields updated ',JSON.stringify(this.filterFields));
                    
                    this.filterString = event.detail.params.string || '';
                    if (this.isDebug) console.log('handleActionDone: filter string reset ', this.filterString);
                    this.filterRecords()
                    .then(() => {
                        if (this.isDebug) console.log('handleActionDone: list filtered');
                    });
                    if (this.isDebug) console.log('handleActionDone: filtering triggered');
                }
            }
            else {
                console.warn('handleActionDone: missing params on filter action');
            }
        }
        else {
            console.warn('handleActionDone: no notification type');
        }

        if (this.isDebug) console.log('handleActionDone: END');
    }

    
}