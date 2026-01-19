/***
* @author P-E GROS
* @date   Jan 2026
* @description  Example LWC Component to display a possibly searchable
*               options selection combobox with selected values displayed
*               as pills below.
*               Component created out of initial Pull Request contribution
*               from the community.
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
/***
* @description  LWC Component for searchable multi-select combobox with checkboxes
***/

import { LightningElement, api } from 'lwc';

import SELECT_LABEL   from '@salesforce/label/c.sfpegMultiSelectSelectPlaceholder';
import SEARCH_LABEL  from '@salesforce/label/c.sfpegMultiSelectSearchPlaceholder';

export default class SfpegMultiSelectCombobox extends LightningElement {

    //-------------------------------------------------------------------------------
    // CONGURATION PARAMETERS
    //-------------------------------------------------------------------------------
    
    @api 
    get isSearchable() {
        return this._isSearchable;
    }
    set isSearchable(value) {
        if (this.isDebug) console.log('set isSearchable: START for MultiSelectCombobox with new value', value);
        this._isSearchable = value || false;
        if (!this._isSearchable) {
            if (this.isDebug) console.log('set isSearchable: resetting searchInput');
            this.searchInput = null;
            if (this.optionList?.length > 0) {
                if (this.isDebug) console.log('set isSearchable: resetting options');
                this.reviewOptions(false);
            }
        }
        if (this.isDebug) console.log('set isSearchable: END for MultiSelectCombobox');
    }

    @api fieldLabel = 'Undefined';
    @api fieldName = 'Undefined';
    @api isDebug = false;    

    @api
    get optionList() {
        return this._optionList;
    }
    set optionList(value) {
        if (this.isDebug) console.log('set optionList: START for MultiSelectCombobox with new value', JSON.stringify(value));
        this._optionList = value || [];
        if (this.isDebug) console.log('set optionList: reviewing options in connected state');
        this.reviewOptions(true);
        if (this.isDebug) console.log('set optionList: END for MultiSelectCombobox');
    }


    //-------------------------------------------------------------------------------
    // TECHNICAL PARAMETERS
    //-------------------------------------------------------------------------------

    _isSearchable = false;
    _optionList = [];
    selectedOptions = [];

    // for search popup display
    searchInput;
    searchResults = [];
    displaySearch = false;

    // for pills display
    selectedPills = [];


    //-------------------------------------------------------------------------------
    // CUSTOM LABELS
    //-------------------------------------------------------------------------------
    
    searchPlaceholder = SEARCH_LABEL;
    selectPlaceholder = SELECT_LABEL;

    //-------------------------------------------------------------------------------
    // CUSTOM GETTERS
    //-------------------------------------------------------------------------------




    //-------------------------------------------------------------------------------
    // COMPONENT INITIALIZATION
    //-------------------------------------------------------------------------------

    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for MultiSelectCombobox searchable?', this.isSearchable);
            console.log('connected: fieldLabel', this.fieldLabel);
            console.log('connected: fieldName', this.fieldName);
            console.log('connected: placeholder', this.placeholder);
            console.log('connected: optionList', JSON.stringify(this.optionList));
            console.log('connected: END');
        }
        if (this.isDebug) console.log('connected: END');
    }
    
    /*renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for MultiSelectCombobox searchable?', this.isSearchable);
            console.log('rendered: fieldLabel', this.fieldLabel);
            console.log('rendered: fieldName', this.fieldName);
            console.log('rendered: placeholder', this.placeholder);
            console.log('rendered: optionList', JSON.stringify(this.optionList));
            console.log('rendered: selectedOptions', JSON.stringify(this.selectedOptions));
            console.log('rendered: searchInput', this.searchInput);
            console.log('rendered: searchResults', JSON.stringify(this.searchResults));
            console.log('rendered: displaySearch', this.displaySearch);
            console.log('rendered: selectedPills', JSON.stringify(this.selectedPills));
            console.log('rendered: END');
        }
    }*/
    
    //-------------------------------------------------------------------------------
    // EVENT HANDLERS
    //-------------------------------------------------------------------------------

    hideOption(event) {
        if (this.isDebug) console.log('hideOption: START',event);
        event.stopPropagation();
        event.preventDefault();
        setTimeout(() => {
            this.displaySearch = false;
            if (this.isDebug) console.log('hideOption: END');
        }, 200);
        if (this.isDebug) console.log('hideOption: timer init');
    }
    
    showOption(event) {
        if (this.isDebug) console.log('showOption: START',event);
        event.stopPropagation();
        event.preventDefault();
        this.displaySearch = true;
        if (this.isDebug) console.log('showOption: END');
    }

    searchOption(event) {
        if (this.isDebug) console.log('searchOption: START',event);
        if (this.isDebug) console.log('searchOption: details',JSON.stringify(event.detail));
        this.searchInput = this.refs.searchInput.value;
        if (this.isDebug) console.log('searchOption: new searchInput', this.searchInput);
        this.reviewOptions(false);
        this.displaySearch = true;
        if (this.isDebug) console.log('searchOption: END');
    }

    selectOption(event) {
        if (this.isDebug) console.log('selectOption: START',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('selectOption: event.detail', JSON.stringify(event.detail));
        if (this.isDebug) console.log('selectOption: event.target', JSON.stringify(event.target?.dataset));
        if (this.isDebug) console.log('selectOption: event.srcElement', JSON.stringify(event.srcElement?.dataset));

        const selectedValue = event.detail?.value ?? event.target?.dataset?.value ?? event.srcElement?.dataset?.value;
        if (this.isDebug) console.log('selectOption: selectedValue', JSON.stringify(selectedValue));
        
        if (!selectedValue) {
            console.warn('selectOption: END KO / no selected value');
            return;
        }

        const selectedOption = this.searchResults.find(iterOption => iterOption.value == selectedValue);
        if (!selectedOption) {
            console.warn('selectOption: END KO / selected value not found in options', selectedValue);
            return;
        }
        if (this.isDebug) console.log('selectOption: selectedOption found', JSON.stringify(selectedOption));

        //this.selectedOptions.push(selectedOption);
        this.selectedOptions = [... this.selectedOptions,selectedOption];
        if (this.isDebug) console.log('selectOption: selectedOptions extended', JSON.stringify(this.selectedOptions));

        //this.selectedPills.push({value: selectedOption,label: selectedOption.label ?? selectedOption.value});
        this.selectedPills = [... this.selectedPills,{value: selectedOption.value,label: selectedOption.label ?? selectedOption.value}];
        if (this.isDebug) console.log('selectOption: selectedPills extended', JSON.stringify(this.selectedPills));
        
        this.searchResults = this.searchResults.filter(optionIter => optionIter.label !== selectedOption.label);
        if (this.isDebug) console.log('selectOption: searchResults filtered', JSON.stringify(this.searchResults));            
        
        if (this.refs.valueSelector) {
            if (this.isDebug) console.log('selectOption: reseting combobox selection');            
            this.refs.valueSelector.value = '';
        }

        this.notifyChange();

        if (this.isDebug) console.log('selectOption: END');
    }

    deselectOption(event) {
        if (this.isDebug) console.log('deselectOption: START',event);
        if (this.isDebug) console.log('deselectOption: event details', JSON.stringify(event.detail));

        const deselectedValue = event.detail.item.value;
        if (this.isDebug) console.log('deselectOption: deselectedValue', JSON.stringify(deselectedValue));

        if (!deselectedValue) {
            console.warn('deselectOption: END KO / no deselected value provided');
            return;
        }
        
        const pillIndex = event.detail.index;
        if (this.isDebug) console.log('deselectOption: pillIndex', pillIndex);
        if (!(pillIndex >= 0)) {
            console.warn('deselectOption: END KO / no deselected value provided');
            return;
        }

        if (this.isDebug) console.log("deselectOption: current selected pills",JSON.stringify(this.selectedPills));
        this.selectedPills.splice(pillIndex,1);
        if (this.isDebug) console.log("deselectOption: pill removed from selection",JSON.stringify(this.selectedPills));
        
        if (this.isDebug) console.log("deselectOption: current selectedOptions",JSON.stringify(this.selectedOptions));
        //const selectedIndex = this.selectedOptions.find(iterOption => iterOption.value === deselectedValue);
        const deselectedOption = (this.selectedOptions.splice(pillIndex,1))[0];
        if (this.isDebug) console.log("deselectOption: deselected option removed",JSON.stringify(deselectedOption));
        if (this.isDebug) console.log("deselectOption: option removed from selection",JSON.stringify(this.selectedOptions));

        if (this.searchInput) {
            if (this.isDebug) console.log('deselectOption: handling filtered search', this.searchInput);
            if (deselectedOption?.label.toLowerCase().includes(this.searchInput.toLowerCase())) {
                if (this.isDebug) console.log('deselectOption: adding option in filtered search');
                //this.searchResults.push(deselectedOption);
                this.searchResults = [... this.searchResults, deselectedOption];
            }
            else {
                if (this.isDebug) console.log('deselectOption: ignoring option in filtered search');
            }
        }
        else {
            if (this.isDebug) console.log('deselectOption: adding option in search');
            //this.searchResults.push(deselectedOption);
            this.searchResults = [... this.searchResults, deselectedOption];
        }
        if (this.isDebug) console.log('deselectOption: searchResults updated', JSON.stringify(this.searchResults));

        this.notifyChange();

        if (this.isDebug) console.log('deselectOption: END');
    }


    //-------------------------------------------------------------------------------
    // UTILITIES
    //-------------------------------------------------------------------------------

    reviewOptions = (areOptionsChanged) => {
        if (this.isDebug) console.log('reviewOptions: START with options', JSON.stringify(this.optionList));
        if (this.isDebug) console.log('reviewOptions: and areOptionsChanged', areOptionsChanged);

        let searchResults = [];
        if (this.searchInput) {
            if (this.isDebug) console.log('reviewOptions: filtering options with search input', this.searchInput);
            searchResults = this.optionList.filter(iterOption => iterOption.label.toLowerCase().includes(this.searchInput.toLowerCase()));
        }
        else {
            if (this.isDebug) console.log('reviewOptions: using all options');
            searchResults = this.optionList;
        }
        if (this.isDebug) console.log('reviewOptions: searchResults init', JSON.stringify(searchResults));

        if (areOptionsChanged) {
            if (this.isDebug) console.log('reviewOptions: reviewing selectedOptions',JSON.stringify(this.selectedOptions));
            this.selectedOptions = this.selectedOptions ?? [];
            const selectedOptions = this.optionList.flatMap(iterOption =>
                (this.selectedOptions.find((iterSelect) => iterSelect.value === iterOption.value) ? [iterOption] : []));
            if (this.isDebug) console.log('reviewOptions: selectedOptions reset', JSON.stringify(selectedOptions));
            this.selectedOptions = selectedOptions;
            if (this.isDebug) console.log('reviewOptions: resetting pills for selection');
            this.resetPills();
        }

        searchResults = searchResults.filter(iterOption => !this.selectedOptions.includes(iterOption));
        if (this.isDebug) console.log('reviewOptions: selections removed from searchResults', JSON.stringify(searchResults));
        this.searchResults = searchResults;

        if (this.isDebug) console.log('reviewOptions: END');
    }

    resetPills = () => {
        if (this.isDebug) console.log('resetPills: START with selectedOptions', JSON.stringify(this.selectedOptions));
        this.selectedPills = this.selectedOptions.map(iterOption => {
            return {
                value: iterOption.value,
                label: iterOption.label ?? iterOption.value
            }
        });
        if (this.isDebug) console.log('resetPills: END with pills', JSON.stringify(this.selectedPills));
    }

    notifyChange = () => {
        if (this.isDebug) console.log('notifyChange: START');

        let changeEvent = new CustomEvent("valuechange", {
            detail: {
                selection: this.selectedOptions.map(iterSelect => iterSelect.value),
                fieldName: this.fieldName
            },
            bubbles: true,
            composed: true
        });
        if (this.isDebug) console.log('notifyChange: notifying changeEvent',JSON.stringify(changeEvent));

        this.dispatchEvent(changeEvent);
        if (this.isDebug) console.log('notifyChange: END');
    }
}