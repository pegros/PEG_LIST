/***
* @description  LWC Component for searchable multi-select combobox with checkboxes
***/

import { LightningElement, api, track } from 'lwc';

export default class SfpegMultiSelectCombobox extends LightningElement {
    isListening = false;
    _pickList = [];
    @track searchResults;
    @track selectedValues = [];
    searchInputValue = '';
    hideTimeout;
    isFocusing = false; // Flag to prevent hiding when focusing

    _labelText;
    _picklistValue;

    @api 
    get labelText() {
        if(!this._labelText) { return "No name specified" };
        return this._labelText;
    }

    set labelText(value) {
        this._labelText = value;
    }

    @api
    get pickList() {
        return this._pickList;
    }

    set pickList(value) {
        this._pickList = value || [];
    }

    @api
    get picklistValue() {
        // Return array of selected values
        return this.selectedValues;
    }
    
    set picklistValue(value) {
        // If value is null or undefined, preserve existing values (don't clear)
        if (value === null || value === undefined) {
            return;
        }
        
        // Convert input to array format
        const newValues = Array.isArray(value) 
            ? [...value] 
            : (typeof value === 'string' && value.trim() 
                ? value.split(',').map(v => v.trim()).filter(v => v) 
                : []);
        
        // CRITICAL: If new value is empty but we have existing selections, ALWAYS preserve them
        // This prevents parent re-renders or reactive updates from clearing user selections
        // The only way to clear is through handleRemovePill or explicit user action
        if (newValues.length === 0 && this.selectedValues.length > 0) {
            // Preserve existing values - don't clear on empty updates
            return;
        }
        
        // Compare arrays to avoid unnecessary updates
        const currentValuesStr = JSON.stringify([...this.selectedValues].sort());
        const newValuesStr = JSON.stringify([...newValues].sort());
        
        // Only update if values actually changed
        if (currentValuesStr !== newValuesStr) {
            this.selectedValues = newValues;
            this._picklistValue = this.selectedValues;
        }
    }
               
    get selectedValue() {
        // Return empty string for search input (not showing selected value in input)
        return this.searchInputValue;
    }

    get selectedPills() {
        return this.selectedValues.map(val => {
            const option = this._pickList.find(opt => opt.value === val);
            return {
                value: val,
                label: option ? option.label : val
            };
        });
    }

    get availableOptions() {
        // Filter out already selected options and filter by search text
        return this._pickList.filter(opt => {
            // Skip already selected
            if (this.selectedValues.includes(opt.value)) return false;
            // Filter by search text - support multiple keywords (OR logic)
            if (this.searchInputValue) {
                // Split search input into keywords (similar to general search)
                const keywords = this.searchInputValue.trim().toLowerCase().split(/\s+/).filter(k => k.length > 0);
                if (keywords.length > 0) {
                    const labelLower = opt.label.toLowerCase();
                    const valueLower = String(opt.value).toLowerCase();
                    // Check if any keyword matches (OR logic)
                    return keywords.some(keyword => 
                        labelLower.includes(keyword) || valueLower.includes(keyword)
                    );
                }
            }
            return true;
        });
    }
     
    /**
     * 
     * @returns nothing
     */
    renderedCallback() {
        if (this.isListening) return;
        
        // Listen for clicks on the document to detect clicks outside
        document.addEventListener("click", (event) => {
            this.handleOutsideClick(event);
        }); 
        this.isListening = true;
    }
    
    /**
     * Handle clicks outside the component - hide dropdown if click is outside
     */
    handleOutsideClick(event) {
        // Don't hide if we're currently focusing (focus event is firing)
        console.log('handleOutsideClick '+this.isFocusing);
        
        if (this.isFocusing) {
            return;
        }
        else{
            this.clearSearchResults();
        }
        
    }
    
    /** 
     * Filter the values to whatever text was entered - case insensitive 
     * This method is called when typing in the search input.
     * It does NOT fire a change event - only updates the search results.
     * The change event is ONLY fired when a value is selected or a pill is removed.
     * */
    search(event) {
        const input = event.detail.value || '';
        this.searchInputValue = input;
        // Always update search results based on current input
        // This does NOT trigger a change event - only selection/removal does
        this.searchResults = this.availableOptions;
        // Note: We do NOT call fireChange() here - that only happens on selection/removal
    }
    
    /** 
     * Set the selected value (add to array for multi-select)
     * This should ONLY be called when user clicks on a dropdown item, NOT while typing
     * */
    selectSearchResult(event) {
        console.log('search result'+event.type);
        
        // Safety check: ensure this is a click event, not triggered by typing or keyboard
        if (!event || event.type !== 'click') {
            // Silently return - this might be called programmatically, we don't want that
            return;
        }
       
        
        // Prevent the click from bubbling to document and triggering hideDropdown
        event.stopPropagation();
        event.preventDefault();
        
        // Clear any pending blur timeout since user is interacting with dropdown
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        const selectedValue = event.currentTarget?.dataset?.value;
        console.log('selected value '+selectedValue);
        
        if (!selectedValue) {
            return;
        }

        // Add to selected values if not already selected
        if (!this.selectedValues.includes(selectedValue)) {
            this.selectedValues = [...this.selectedValues, selectedValue];
            this._picklistValue = this.selectedValues;
            
            // Fire change event - this is the ONLY place where selection triggers a change
            this.fireChange();
        }

        // Keep dropdown open for multi-select
        this.searchResults = this.availableOptions;
    }

    handleRemovePill(event) {
        const valueToRemove = event.currentTarget.dataset.value;
        
        this.selectedValues = this.selectedValues.filter(v => v !== valueToRemove);
        this._picklistValue = this.selectedValues;
        
        // Update search results to include the removed option
        this.searchResults = this.availableOptions;
        
        // Fire change event
        this.fireChange();
    }

    fireChange() {

        // Fire change event when selectedValues changes
        // This is ONLY called from selectSearchResult() and handleRemovePill()
        // It is NEVER called from search() (typing)
        if (Array.isArray(this.selectedValues) && this.selectedValues.length >= 0) {
            this.dispatchEvent(new CustomEvent("valuechange", {
                detail: {
                    value: this.selectedValues,
                    valueString: this.selectedValues.join(',')
                },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    /**
     * Clear the results
     * */
    clearSearchResults() {
        this.searchInputValue = '';
        this.searchResults = null;
    }
    
    /**
     * Invoked when inputbox is focused
     */
    showPickListOptions() {
        console.log('showPickListOptions on focus');
        
        // Set flag to prevent hideDropdown from firing during focus
        this.isFocusing = true;
        
        // Clear search input to show all available options on first focus
        // this.searchInputValue = '';
        
        // Always show all available options on focus (not filtered by search)
        this.searchResults = this.availableOptions;
        
        // Clear the flag after a short delay to allow click event to complete
        setTimeout(() => {
            this.isFocusing = false;
        }, 1000);
    }
}