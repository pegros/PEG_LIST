/***
* @author P-E GROS
* @date   Feb. 2026
* @description  LWC Component to display on a Map a list of records fetched via
*               a sfpegListCmp.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2026 pegros
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

import { LightningElement, api } from 'lwc';
import NO_LOCATION_LABEL    from '@salesforce/label/c.sfpegListMapNoLocation';
import REFRESH_LABEL        from '@salesforce/label/c.sfpegListRefresh';
import RESULTS_TITLE        from '@salesforce/label/c.sfpegListMapResultsTitle';

export default class SfpegListMapCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------

    @api cardClass;
    @api cardTitle;
    @api cardIcon;

    @api configName;
    @api actionConfigName;
    @api footerConfigName;

    @api contextString;
    @api listContext;

    @api showExport = false;    // Flag to show Export action in result list header.
    @api mapHeight = 0;         // Max-height of the map (0 meaning no limit)
    @api displayHeight = 0;     // Max-height of the result list (0 meaning no limit)
    @api maxSize = 100;         // Header Action list overflow limit
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)
    
    @api isDebug;
    @api isDebugFine;
    
    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)

    // Map Display Config
    @api mapLegend = 'Localisation';
    @api listView;
    @api draggable;
    @api zoomControl;
    @api scrollwheel;
    @api disableDefaultUI;
    @api disableDoubleClickZoom;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    listCardClass;
    configDetails;
    mapConfig;
    resultList;
    mapMarkers;
    selectedMarker;

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    refreshTitle = REFRESH_LABEL;
    resultCardTitle = RESULTS_TITLE;

    //-----------------------------------------------------
    // Custom getter
    //-----------------------------------------------------

    get figureCaption() {
        return (this.mapMarkers ? this.mapLegend : NO_LOCATION_LABEL);
    }

    get mapClass() {
        //return (this.mapMarkers ? 'slds-p-horizontal_small' : 'slds-illustration slds-illustration_small');
        return (this.mapMarkers ? '' : 'slds-illustration slds-illustration_small');
    }

    get hideList() {
        return (this.configDetails ? (this.configDetails.type === 'Hidden') : true);
    }

    get mapStyle() {
        return (((this.mapHeight) &&  (this.mapHeight !== '0')) ? 'overflow:hidden; max-height: ' + this.mapHeight + ';' : ' ');
    }

    get mapOptions() {
        return {    draggable:this.draggable,
                    zoomControl:this.zoomControl,
                    scrollwheel: this.scrollwheel,
                    disableDefaultUI: this.disableDefaultUI,
                    disableDoubleClickZoom: this.disableDoubleClickZoom
        };
    }

    get mapMarkersSerialized() {
        return JSON.stringify(this.mapMarkers);
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START ListMap for ', this.cardTitle);

        if (this.cardClass.includes('slds-card_boundary')) {
            if (this.isDebug) console.log('connected: handling card with boundary');
            this.listCardClass = 'sfpegNoTableRadius';
        }
        else {
            if (this.isDebug) console.log('connected: handling card without boundary');
            this.listCardClass = "slds-var-m-top_small"
        }

        if (this.isDebug) console.log('connected: END ListMap');
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    // sfpegList initialization handling
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START ListMap',event);
        if (this.isDebug) console.log('handleRecordLoad: #results received ',event.detail?.length);
        if (this.isDebugFine) console.log('handleRecordLoad: results received',JSON.stringify(event.detail));
        
        if (!this.mapConfig) {
            if (this.isDebug) console.log('handleRecordLoad: initializing mapConfig');
            this.initMapConfig();
        }
        
        this.resultList = [...event.detail];
        if (this.isDebug) console.log('handleRecordLoad: #results init ',this.resultList?.length);
        this.initMapMarkers();

        if (this.isDebug) console.log('handleRecordLoad: END ListMap');
    }

    handleRefresh(event){
        if (this.isDebug) console.log('handleRefresh: START',event);
        let listCmp = this.refs.listLoader;
        if (this.isDebug) console.log('handleRefresh: fetching listCmp ',listCmp);
        listCmp.doRefresh();
        if (this.isDebug) console.log('handleRefresh: END');
    }

    handleMarkerSelect(event) {
        if (this.isDebug) console.log('handleMarkerSelect: START',event);

        if (this.selectedMarkerValue === event.detail.selectedMarkerValue) {
            if (this.isDebug) console.log('handleMarkerSelect: unselecting current value ', this.selectedMarkerValue);
            this.selectedMarkerValue = null;
            let listCmp = this.refs.listLoader;
            if (this.isDebug) console.log('handleMarkerSelect: fetching listCmp ',listCmp);
            listCmp.doFilter('', 'ALL');
            if (this.isDebug) console.log('handleMarkerSelect: END / listCmp unfiltered');
        }
        else {
            this.selectedMarkerValue = event.detail.selectedMarkerValue;
            if (this.isDebug) console.log('handleMarkerSelect: selecting new value ', this.selectedMarkerValue);
            /*let selectedMarker = this.mapMarkers.find(item => item.value === this.selectedMarkerValue);
            if (this.isDebug) console.log('handleMarkerSelect: marker found ', selectedMarker);
            selectedMarker.strokeColor = "#FFF000";
            if (this.isDebug) console.log('handleMarkerSelect: selectedMarker updated ', selectedMarker);*/

            let listCmp = this.refs.listLoader;
            if (this.isDebug) console.log('handleMarkerSelect: fetching listCmp ',listCmp);
            listCmp.doFilter(this.selectedMarkerValue, this.mapConfig.value);
            if (this.isDebug) console.log('handleMarkerSelect: END / listCmp filtered');
        }
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    initMapConfig = () => {
        if (this.isDebug) console.log('initMapConfig: START');
    
        let listCmp = this.refs.listLoader;
        if (this.isDebug) console.log('initMapConfig: fetching listCmp ',listCmp);
        this.configDetails =  listCmp.configuration;
        if (this.isDebug) console.log('initMapConfig: configDetails fetched ',JSON.stringify(this.configDetails));

        let mapConfig = {
            iconDefault: "standard:address",
            title: "Name",
            value: "Id"
        };
        if (this.configDetails?.display?.map) {
            let mapConfig = {...this.configDetails.display.map};

            if (!mapConfig.title) {
                mapConfig.title = "Name";
            }
            if (!mapConfig.value) {
                mapConfig.value = "Id";
            }
            if (!mapConfig.location) {
                console.error('initMapConfig: END KO / Missing map location property in list display config ',this.configName);
                return;
            }
            this.mapConfig = mapConfig;
        }
        else {
            console.error('initMapConfig: END KO / Missing map property in list display config ',this.configName);
            return;
        }
        if (this.isDebug) console.log('initMapConfig: END / mapConfig init ', JSON.stringify(this.mapConfig));
    }

    initMapMarkers = () => {
        if (this.isDebug) console.log('initMapMarkers: START with #items ',this.resultList.length);
        if (this.isDebug) console.log('initMapConfig: and mapConfig ', JSON.stringify(this.mapConfig));

        if (!this.mapConfig) {
            console.error('initMapMarkers: END KO /  missing map config');
            return;
        }

        let mapMarkers = this.resultList.map(item => {
            if (this.isDebug) console.log('initMapMarkers: processing item ',JSON.stringify(item));
            let itemMarker = {icon : "standard:address", location:{} };
            Object.entries(this.mapConfig).forEach( ([key,value]) => {
                if (typeof value === 'object') {
                    if (this.isDebug) console.log('initMapMarkers: ignoring object/array property ',key);
                }
                else if (item[value] !== null) {
                    itemMarker[key] = item[value];
                }
            });
            if (this.isDebug) console.log('initMapMarkers: main properties init');

            Object.entries(this.mapConfig?.location).forEach(([key, value]) => {
                if (item[value] !== null) {
                    itemMarker.location[key] = item[value];
                }
            });
            if (this.isDebug) console.log('initMapMarkers: location properties added');

            if (Array.isArray(this.mapConfig?.description)) {
                if (this.isDebug) console.log('initMapMarkers: processing complex description ',JSON.stringify(this.mapConfig?.description));
                let descItems = this.mapConfig?.description.reduce((descList,key) => {
                    if (item[key] !== null) {
                        descList.push(item[key]);
                    }
                    return descList;
                },[]);
                itemMarker.description = descItems.join('<br/>');
                if (this.isDebug) console.log('initMapMarkers: description properties merged');
            }

            if (Array.isArray(this.mapConfig?.customDescription)) {
                if (this.isDebug) console.log('initMapMarkers: processing complex customDescription ',JSON.stringify(this.mapConfig?.customDescription));
                let descItems = this.mapConfig?.customDescription.reduce((descList,key) => {
                    if (item[key] !== null) {
                        descList.push(item[key]);
                    }
                    return descList;
                },[]);
                itemMarker.customDescription = descItems.join('<br/>');
                if (this.isDebug) console.log('initMapMarkers: customDescription properties merged');
            }

            if (this.isDebug) console.log('initMapMarkers: item marker init', JSON.stringify(itemMarker));
            return itemMarker;
        });

        this.mapMarkers = mapMarkers;
        if (this.isDebug) console.log('initMapConfig:END / mapMarkers init with #items ', mapMarkers.length);
    }
}
