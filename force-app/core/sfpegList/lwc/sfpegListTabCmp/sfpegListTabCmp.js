/***
* @author P-E GROS
* @date   Sept 2025
* @description  URL-addressable LWC wrapper to display a sfpegListCmp LWC component in a standalone tab.
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
import { CurrentPageReference } from 'lightning/navigation';
import { EnclosingTabId, IsConsoleNavigation, setTabLabel, setTabIcon } from 'lightning/platformWorkspaceApi';

export default class SfpegListTabCmp extends LightningElement {
	// URL/state-driven public props
	@api list;              // REQUIRED: sfpegList__mdt developer name
	@api actions = 'N/A';   // Optional header action config name
	@api label = 'List';    // Tab label
	@api title;             // Card title
	@api icon;              // Card icon (e.g. utility:list)
	@api recordId;          // Context record Id
	@api objectApiName;     // Context object API name
	@api showSearch = false;// Must default to false per LWC lint rule; overridden by URL state
	@api showExport = false;// Show export
	@api displayHeight = '0';
	@api buttonSize = 'small';
	@api contextString;     // Optional context
	@api isDebug = false;

	// Internal state
	pageStateContext;       // JSON string of last processed state to avoid loops
	errorMsg;               // Error message for template display
	isReady = false;

	// Console context
	@wire(IsConsoleNavigation) isConsoleNavigation;
	@wire(EnclosingTabId) enclosingTabId;

	//################################################################
	// Page Reference handling
	//################################################################
	@wire(CurrentPageReference)
	parseState(pageRef) {
		this.isDebug = true;
		if (this.isDebug) console.log('parseState: START ListTab with pageRef',JSON.stringify(pageRef));
		const state = pageRef?.state;
		if (!state) {
			if (this.isDebug) console.log('parseState: END ListTab / no State');
			return;
		}
		const stateJson = JSON.stringify(state);
		if (this.pageStateContext === stateJson) {
			if (this.isDebug) console.log('parseState: END ListTab / already initialized');
			return;
		}

		// Parse and coerce values from c__-namespaced state
		this.isDebug = state.c__isDebug ? (String(state.c__isDebug).toLowerCase() === 'true') : false;
		if (this.isDebug) console.log('parseState: state received', stateJson);

		this.list = state.c__list;
		if (!this.list) {
			console.error('parseState: END ListTab KO / missing list configuration name');
			this.errorMsg = 'Missing list configuration name!';
			this.pageStateContext = stateJson; // prevent re-processing
			return;
		}

		this.isReady = false;
		setTimeout(() => {
            if(this.isDebug) console.log('parseState: timer expired');
            
			this.actions = state.c__actions || 'N/A';
			this.title = state.c__title || 'Record List';
			this.icon = state.c__icon || 'utility:list';
			this.recordId = state.c__recordId;
			this.objectApiName = state.c__objectApiName;
			this.showSearch = state.c__showSearch ? (String(state.c__showSearch).toLowerCase() === 'true') : true;
			this.showExport = state.c__showExport ? (String(state.c__showExport).toLowerCase() === 'true') : false;
			this.displayHeight = state.c__displayHeight || '0';
			this.buttonSize = state.c__buttonSize || 'small';
			this.contextString = state.c__contextString;
			this.label = state.c__label || this.label;

			this.pageStateContext = stateJson;
			if (this.isDebug) console.log('parseState: properties set');

			// Tab label/icon updates (console only) if label provided
			if (this.isConsoleNavigation) {
				if (this.isDebug) console.log('parseState: updating tab content in console');
				this.updateTabLabelAndIcon();
			}
			if(this.isDebug) console.log('parseState: (re)rendering list');
			this.isReady = true;

			if (this.isDebug) console.log('parseState: END ListTab');
        }, 100);
        if(this.isDebug) console.log('parseState: forcing list unrendering');
	}

	updateTabLabelAndIcon() {
		if (this.isDebug) console.log('updateTabLabelAndIcon: START');
		try {
			const tabId = this.enclosingTabId;
			if (this.isDebug) console.log('updateTabLabelAndIcon: tabId fetched ',tabId);

			if (!tabId) {
				if (this.isDebug) console.log('updateTabLabelAndIcon: END / no enclosing tab');
				return;
			}
			
			if (this.isDebug) console.log('updateTabLabelAndIcon: setting tab label ',this.label );
			setTabLabel(tabId, this.label)
				.then(() => {
					if (this.isDebug) console.log('updateTabLabelAndIcon: setting tab icon',this.icon);
					setTabIcon(tabId,this.icon,'List')
				}).then(() => {
					if (this.isDebug) console.log('updateTabLabelAndIcon: END');
				}).catch(error => { if (this.isDebug) console.error('updateTabLabelAndIcon: error', JSON.stringify(error)); });
		}
		catch (error) {
			if (this.isDebug) console.error('updateTabLabelAndIcon: END KO / error', JSON.stringify(error));
		}
	}
}
