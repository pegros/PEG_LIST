/***
* @author P-E GROS
* @date   July 2021
* @description  LWC Component to display Lists of KPIS based on the current record
*               in a set of cards.
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

import { LightningElement, wire, api, track } from 'lwc';
import getConfiguration     from '@salesforce/apex/sfpegKpiList_CTL.getConfiguration';

import currentUserId        from '@salesforce/user/Id';
import CUSTOM_ICONS         from '@salesforce/resourceUrl/sfpegIcons';

var KPI_CONFIGS = {};

export default class SfpegKpiListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api wrapperClass;          // CSS Classes for the wrapping div
    @api configName;            // DeveloperName fo the sfpegKpi__mdt record to be used
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    @track isReady = false;         // Initialization state of the component (to control spinner)
    @track configDetails = null;    // Global configuration of the component
    @track errorMsg = null;         // Initialisation error message
    
    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)
    userId = currentUserId;     // ID of current User

    //Widget Labels & Titles from custom labels
    customIconsRsc = CUSTOM_ICONS; // Static resource for custom SVG Icons

    // Data Table mode related getters
    get kpiGroups() {
        return this.configDetails?.display?.groups || [];
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

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
        if (KPI_CONFIGS[this.configName]) {
            if (this.isDebug) console.log('connected: END / configuration already available');
            this.configDetails = KPI_CONFIGS[this.configName];
            this.isReady = true;
        }
        else {
            if (this.isDebug) console.log('connected: fetching configuration from server');
            getConfiguration({name: this.configName})
            .then( result => {
                if (this.isDebug) console.log('connected: configuration received  ',result);
                try {
                    KPI_CONFIGS[this.configName] = {
                        label: result.MasterLabel,
                        display: JSON.parse(result.DisplayConfig__c || '[]')
                        //actions: JSON.parse(result.GroupActions__c || '[]')
                    };
                    this.configDetails = KPI_CONFIGS[this.configName];
                    if (this.isDebug) console.log('connected: configuration parsed ',this.configDetails);

                    if (this.configDetails.display.groups) {
                        if (this.isDebug) console.log('connected: processing groups ');
                        (this.configDetails.display.groups).forEach(iterGrp => {
                            // KPI Group processing
                            if (this.isDebug) console.log('connected: processing group ',JSON.stringify(iterGrp));
                            iterGrp.groupClass = (iterGrp.size ? ' slds-size_' + iterGrp.size + '-of-12 ' : ' slds-shrink-none slds-grow ') + ' slds-col  slds-grid_vertical-stretch groupWrapper';
                            if (this.isDebug) console.log('connected: groupClass set ',iterGrp.groupClass);
                            iterGrp.cardClass = 'cardWrapper' + (iterGrp.border ? ' slds-card_boundary' : '');
                            //iterGrp.cardClass = 'cardWrapper' + (iterGrp.border ? ' cardWrapperBorder' : '');
                            if (this.isDebug) console.log('connected: cardClass set ',iterGrp.cardClass);
                        

                            // Unitary KPI processing
                            if (iterGrp.kpis) {
                                if (this.isDebug) console.log('connected: processing kpis ',iterGrp.kpis);

                                (iterGrp.kpis).forEach(iterKpi => {
                                    if (this.isDebug) console.log('connected: processing kpi ',JSON.stringify(iterKpi));
                                    iterKpi.iconSize = iterKpi.iconSize || 'small';
                                    if (iterKpi.iconName) {
                                        if (iterKpi.iconName.includes('resource:')) {
                                            iterKpi.isResourceIcon = true;
                                            iterKpi.iconSrc = this.customIconsRsc + '#' + iterKpi.iconName.substring(9) + '-' + iterKpi.iconSize;
                                        }
                                        else {
                                            iterKpi.isResourceIcon = false;
                                        } 
                                    }
                                    iterKpi.kpiClass =  "slds-media__figure" + (iterKpi.action ? ' kpiAction' : '');
                                    iterKpi.kpiAction =  (iterKpi.action ? iterGrp.actions + '-' +  iterKpi.action : '');
                                    if (this.isDebug) console.log('connected: kpi processed ',JSON.stringify(iterKpi));
                                });
                                if (this.isDebug) console.log('connected: all kpis processed ');
                            }
                            if (this.isDebug) console.log('connected: group updated ',JSON.stringify(iterGrp));
                        });
                    }
                    else {
                        console.warn('connected: no KPI group configured');
                        this.errorMsg = 'No KPI group configured!';
                    }
                    if (this.isDebug) console.log('connected: configuration parsed');
                }
                catch (parseError){
                    console.warn('connected: END / configuration parsing failed ',parseError);
                    this.errorMsg = 'Configuration parsing failed: ' + parseError;
                }
                finally {
                    if (this.isDebug) console.log('connected: END');
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
    
    //----------------------------------------------------------------
    // Event Handlers 
    //----------------------------------------------------------------      
    handleKpiAction(event) {
        if (this.isDebug) console.log('handleKpiAction: START');
        /*if (this.isDebug) console.log('handleKpiAction: event',event);
        if (this.isDebug) console.log('handleKpiAction: event SRC ',event.srcElement);
        let actionName = event.srcElement.name;
        if (this.isDebug) console.log('handleKpiAction: actionName fetched ',actionName);*/

        let actionName = event.detail;
        if (this.isDebug) console.log('handleKpiAction: actionName fetched ', actionName);

        if (actionName) {
            let actionParts = actionName.split('-');
            if (this.isDebug) console.log('handleKpiAction: actionParts extracted ',actionParts);

            let actionBars = this.template.querySelectorAll('c-sfpeg-action-bar-cmp');
            if (this.isDebug) console.log('handleKpiAction: actionBars fetched ',actionBars);
            if (this.isDebug) console.log('handleKpiAction: searching ',actionParts[0]);
            
            let actionBar = [...actionBars].find(item => {
                if (this.isDebug) console.log('handleKpiAction: evaluating ',item);
                return item.configName === actionParts[0];
            });
            if (this.isDebug) console.log('handleKpiAction: actionBar found ',actionBar);

            if (actionBar) {
                if (this.isDebug) console.log('handleKpiAction: triggering action ',actionParts[1]);
                actionBar.executeBarAction(actionParts[1]);
                if (this.isDebug) console.log('handleKpiAction: END / action trigered');
            }
            else {
                if (this.isDebug) console.log('handleKpiAction: END KO / action bar not found');
            }
        }
        else {
            if (this.isDebug) console.log('handleKpiAction: END / no action to trigger ');
        }
    }
}