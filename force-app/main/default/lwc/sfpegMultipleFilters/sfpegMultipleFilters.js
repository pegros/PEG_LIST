/***
* @description  LWC Component to display multiple column filters for sfpegListCmp
*               Provides dynamic filter selection with searchable field picker
***/

import { LightningElement, api, track } from 'lwc';

export default class SfpegMultipleFilters extends LightningElement {
    @api columns = [];
    @api isDebug = false;
    @track useSearchableCombobox = false; // If true, use sfpegMultiSelectCombobox; if false, use lightning-combobox
    
    _records = [];
    _initialRecordsReceived = false;
    
    /**
     * Gets the records array
     * @returns {Array} Array of record objects
     */
    @api 
    get records() {
        return this._records;
    }
    
    /**
     * Sets the records array
     * Triggers distinct options computation on first receipt of records
     * Only computes once to avoid performance issues with large datasets
     * @param {Array} value - Array of record objects
     */
    set records(value) {
        const newRecords = value || [];
        const recordsChanged = this._records.length !== newRecords.length || 
                              this._records !== newRecords;
        
        this._records = newRecords;
        this.isFiltering = false;
        
        // Only compute distinct options when records are first received (not when filtered)
        if (newRecords.length > 0 && 
            this.columns.length > 0 && 
            !this._distinctOptionsComputed && 
            !this._initialRecordsReceived) {
            
            this._initialRecordsReceived = true;
            
            // Use setTimeout to ensure component is fully initialized
            setTimeout(() => {
                if (!this._distinctOptionsComputed) {
                    this.recomputeDistinctOptions(true);
                }
            }, 0);
        }
    }
    
    @track activeFilters = [];
    @track generalSearchValue = '';
    @track distinctOptionsByField = {};
    @track isFiltering = false; // Controlled by parent - shows spinner and prevents duplicate filtering
    @track useButtonFilter = false; // If true, filter only on button click; if false, filter automatically
    
    recomputeTimeout;
    filterTimeout;
    generalSearchTimeout;
    _lastRecordsRef = null;
    _distinctOptionsComputed = false; // Flag to ensure we only compute once
    _originalRecords = null; // Store original records for distinct value computation
    
    /**
     * Checks if columns are available
     * @returns {boolean} True if columns exist and have length > 0
     */
    get hasColumns() {
        return this.columns && this.columns.length > 0;
    }
    
    /**
     * Filters columns to only include filterable ones (excludes action columns)
     * @returns {Array} Array of filterable column objects
     */
    get filterableColumns() {
        if (!this.columns) return [];
        return this.columns.filter(col => 
            col.fieldName && col.type !== 'action' && !col.typeAttributes?.rowActions
        );
    }
    
    /**
     * Gets options for the field selector dropdown (only shows fields not already added as filters)
     * @returns {Array} Array of {label, value} objects for available fields
     */
    get fieldSelectorOptions() {
        const selectedFieldNames = this.activeFilters.map(f => f.fieldName);
        return this.filterableColumns
            .filter(col => !selectedFieldNames.includes(col.fieldName))
            .map(col => ({
                label: col.label || col.fieldName,
                value: col.fieldName
            }));
    }
    
    /**
     * Checks if a column is a date type
     * @param {Object} col - Column object
     * @returns {boolean} True if column type is date, date-local, datetime, or time
     */
    isDateType(col) {
        const t = (col.type || '').toLowerCase();
        return t === 'date' || t === 'date-local' || t === 'datetime' || t === 'time';
    }

    /**
     * Checks if a column is a text type (text, string, or empty/undefined)
     * @param {Object} col - Column object
     * @returns {boolean} True if column is text type and not a date type
     */
    isTextType(col) {
        const t = (col.type || '').toLowerCase();
        if (this.isDateType(col)) return false;
        return !t || t === 'text' || t === 'string';
    }
    
    /**
     * Lifecycle hook: Called when component is inserted into the DOM
     * Initializes searchable combobox and computes distinct options if records/columns are available
     */
    connectedCallback() {
        if (this._records.length > 0 && 
            this.columns.length > 0 && 
            !this._distinctOptionsComputed && 
            !this._initialRecordsReceived) {
            this._initialRecordsReceived = true;
            this.recomputeDistinctOptions(true);
        }
    }
    
    /**
     * Lifecycle hook: Called after every render
     * Fallback to compute distinct options if records were set after connectedCallback
     */
    renderedCallback() {
        const currentRecords = this._records || [];
        if (currentRecords.length > 0 && 
            this.columns.length > 0 && 
            !this._distinctOptionsComputed && 
            !this._initialRecordsReceived &&
            Object.keys(this.distinctOptionsByField).length === 0) {
            this._initialRecordsReceived = true;
            this._lastRecordsRef = currentRecords;
            this.recomputeDistinctOptions(true);
        }
    }
    
    /**
     * Gets a field value from a record, supporting nested field paths (e.g., "Account.Name")
     * @param {Object} record - The record object
     * @param {string} fieldName - Field name, can be nested (e.g., "Account.Name")
     * @returns {*} The field value or null if not found
     */
    getFieldValue(record, fieldName) {
        if (!record || !fieldName) return null;
        const fieldParts = fieldName.split('.');
        let value = record;
        for (const part of fieldParts) {
            if (value === null || value === undefined) return null;
            value = value[part];
        }
        return value;
    }

    /**
     * Finds filter index by fieldName
     * @param {string} fieldName - Field name to search for
     * @returns {number} Filter index or -1 if not found
     */
    findFilterIndex(fieldName) {
        return this.activeFilters.findIndex(f => f?.fieldName === fieldName);
    }

    /**
     * Updates a filter's property and triggers reactivity
     * @param {number} filterIndex - Index of filter to update
     * @param {string} property - Property name to update
     * @param {*} value - Value to set
     */
    updateFilter(filterIndex, property, value) {
        if (filterIndex >= 0) {
            this.activeFilters[filterIndex][property] = value;
            this.activeFilters = [...this.activeFilters];
        }
    }

    /**
     * Conditionally applies filters based on useButtonFilter setting
     * @param {number} delay - Delay in milliseconds (default: 100)
     * @param {string} timeoutName - Name of timeout variable ('filterTimeout' or 'generalSearchTimeout')
     */
    applyFiltersIfAuto(delay = 100, timeoutName = 'filterTimeout') {
        if (!this.useButtonFilter) {
            clearTimeout(this[timeoutName]);
            this[timeoutName] = setTimeout(() => this.applyFilters(), delay);
        }
    }

    /**
     * Normalizes date value by removing time component
     * @param {string} dateValue - Date string (may include time)
     * @returns {string} Date string in YYYY-MM-DD format
     */
    normalizeDate(dateValue) {
        return String(dateValue || '').trim().split('T')[0];
    }

    /**
     * Normalizes combobox values to array of lowercase strings
     * @param {*} filterValue - Filter value (array or single value)
     * @returns {Array} Array of normalized lowercase strings
     */
    normalizeComboboxValues(filterValue) {
        const values = Array.isArray(filterValue) 
            ? filterValue 
            : (filterValue != null ? [String(filterValue).trim()] : []);
        return values
            .filter(v => v != null)
            .map(v => String(v).trim().toLowerCase())
            .filter(v => v);
    }

    /**
     * Normalizes text value to array of keywords (split by space) for OR search
     * @param {*} filterValue - Filter value
     * @returns {Array} Array of lowercase keywords for OR search
     */
    normalizeTextValue(filterValue) {
        const textValue = String(filterValue || '').trim();
        if (!textValue) return [];
        // Split by spaces and filter out empty strings
        return textValue.toLowerCase().split(/\s+/).filter(keyword => keyword.length > 0);
    }

    /**
     * Normalizes general search value to array of keywords
     * @param {string} searchValue - General search input value
     * @returns {Array} Array of lowercase keywords
     */
    normalizeSearchKeywords(searchValue) {
        const trimmed = searchValue?.trim();
        if (!trimmed) return [];
        return trimmed.toLowerCase().split(/\s+/).filter(k => k);
    }

    /**
     * Dispatches filterchange event with given filter data
     * @param {Object} filterData - Filter data object to dispatch
     */
    dispatchFilterChange(filterData) {
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: filterData,
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Computes distinct values for each filterable column (used for combobox options)
     * Only runs once per component lifecycle to avoid performance issues
     * Scans up to 5000 records to find unique values
     * @param {boolean} immediate - If true, runs immediately; otherwise uses setTimeout
     */
    recomputeDistinctOptions(immediate = false) {
        if (this._distinctOptionsComputed) return;
        
        const cols = this.filterableColumns || [];
        const data = this._records || [];
        
        if (!this._originalRecords && data.length > 0) {
            this._originalRecords = [...data];
        }
        
        const recordsToUse = this._originalRecords || data;
        
        if (cols.length === 0 || recordsToUse.length === 0) {
            this.distinctOptionsByField = {};
            return;
        }

        const run = () => {
            if (this._distinctOptionsComputed) return;
            
            const optionsByField = {};
            const SCAN_LEN = Math.min(recordsToUse.length, 5000);

            cols.forEach(col => {
                const field = col.fieldName;
                if (!field || this.isDateType(col)) {
                    optionsByField[field] = [];
                    return;
                }
                
                const valuesSet = new Set();
                
                for (let i = 0; i < SCAN_LEN; i++) {
                    const rec = recordsToUse[i];
                    if (!rec) continue;
                    
                    const raw = this.getFieldValue(rec, field);
                    if (raw == null) continue;
                    
                    const s = String(raw).trim();
                    if (s) valuesSet.add(s);
                }
                
                optionsByField[field] = valuesSet.size > 0
                    ? Array.from(valuesSet).sort((a, b) => a.localeCompare(b)).map(v => ({ label: v, value: v }))
                    : [];
            });

            this.distinctOptionsByField = { ...optionsByField };
            this._distinctOptionsComputed = true;
        };

        clearTimeout(this.recomputeTimeout);
        immediate ? run() : (this.recomputeTimeout = setTimeout(run, 150));
    }
    
    /**
     * Handles field selection from the field selector dropdown
     * Creates a new filter based on column type and distinct values count
     * - Date columns → date filter
     * - Text columns with < 3000 distinct values → combobox filter
     * - Other columns → text filter
     * @param {Event} event - Change event from field selector combobox
     */
    handleFieldSelectorChange(event) {
        const fieldName = event.detail.value;
        if (!fieldName) return;
        
        const col = this.filterableColumns.find(c => c.fieldName === fieldName);
        if (!col) return;
        
        const options = this.distinctOptionsByField[fieldName] || [];
        const optionsCount = options.length;
        
        if (this.isDebug) {
            console.log('handleFieldSelectorChange', {
                fieldName: fieldName,
                columnType: col.type,
                columnLabel: col.label,
                isTextType: this.isTextType(col),
                isDateType: this.isDateType(col),
                optionsCount: optionsCount,
            options: options,
                distinctOptionsKeys: Object.keys(this.distinctOptionsByField),
                hasOptionsForField: !!this.distinctOptionsByField[fieldName]
            });
        }
        
        // Determine filter type based on column type and distinct values count
        const filterType = this.isDateType(col) ? 'date' 
            : (this.isTextType(col) && optionsCount > 0 && optionsCount < 3000) ? 'combobox' 
            : 'text';
        
        const newFilter = {
            fieldName,
            label: col.label || fieldName,
            type: filterType,
            filterValue: filterType === 'combobox' ? [] : '',
            options,
            isDateRange: filterType === 'date',
            startDate: filterType === 'date' ? '' : null,
            endDate: filterType === 'date' ? '' : null
        };
        
        this.activeFilters = [...this.activeFilters, newFilter];
        
        const fieldSelector = this.template.querySelector('[data-field-selector]');
        if (fieldSelector) {
            fieldSelector.value = null;
        }
    }
    
    /**
     * Removes a filter from activeFilters and applies filters
     * @param {Event} event - Click event from remove filter button
     */
    handleRemoveFilter(event) {
        const fieldName = event.currentTarget.dataset.fieldname;
        if (!fieldName) return;
        
        this.activeFilters = this.activeFilters.filter(f => f.fieldName !== fieldName);
        this.applyFilters();
    }
    
    /**
     * Handles date filter changes (start or end date)
     * Updates the filter value and applies filters if auto-filter mode is enabled
     * @param {Event} event - Change event from date input
     */
    handleDateFilterChange(event) {
        const fieldName = event.target.dataset.fieldname;
        const dateType = event.target.dataset.dateType;
        const value = event.target.value || '';
        
        const filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, dateType === 'end' ? 'endDate' : 'startDate', value);
        this.applyFiltersIfAuto(500);
    }
    
    /**
     * Handles filter mode checkbox change (auto-filter vs button-filter)
     * If switching to auto-filter mode, applies current filters immediately
     * @param {Event} event - Change event from checkbox
     */
    handleFilterModeChange(event) {
        this.useButtonFilter = event.target.checked;
        if (!this.useButtonFilter) {
            this.applyFilters();
        }
    }

    /**
     * Handles searchable combobox mode checkbox change
     * @param {Event} event - Change event from checkbox
     */
    handleSearchableComboboxModeChange(event) {
        this.useSearchableCombobox = event.target.checked;
    }

    /**
     * Handles text filter input changes
     * Updates the filter value and applies filters if auto-filter mode is enabled
     * @param {Event} event - Change event from text input
     */
    handleTextFilterChange(event) {
        const fieldName = event.target.dataset.fieldname;
        const value = String(event.target.value || '').trim();
        
        if (!fieldName) return;
        
        const filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, 'filterValue', value);
        this.applyFiltersIfAuto(500);
    }
    
    /**
     * Handles Enter key press in text filter input
     * Applies filters immediately when Enter is pressed
     * @param {Event} event - Keypress event
     */
    handleTextFilterKeyPress(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.applyFilters();
        }
    }
    
    /**
     * Handles search button click
     * Applies all current filters
     */
    handleSearchClick() {
        this.applyFilters();
    }
    
    /**
     * Handles standard lightning-combobox change (non-searchable)
     * Adds selected value to filter's array of values (multi-select)
     * Clears combobox after selection to allow selecting another value
     * @param {Event} event - Change event from lightning-combobox
     */
    handleComboboxChange(event) {
        const fieldName = event.currentTarget.dataset.fieldname;
        const selectedValue = String(event.detail.value || '').trim();
        
        if (!fieldName || !selectedValue) return;
        
        const filterIndex = this.findFilterIndex(fieldName);
        if (filterIndex >= 0) {
            const currentValues = Array.isArray(this.activeFilters[filterIndex].filterValue) 
                ? this.activeFilters[filterIndex].filterValue.filter(v => v != null)
                : [];
            
            if (!currentValues.includes(selectedValue)) {
                this.updateFilter(filterIndex, 'filterValue', [...currentValues, selectedValue]);
                
                setTimeout(() => {
                    const combobox = this.template.querySelector(`lightning-combobox[data-fieldname="${fieldName}"]`);
                    if (combobox) combobox.value = null;
                }, 0);
            }
        }
        
        this.applyFiltersIfAuto(100);
    }
    
    /**
     * Handles searchable multi-select combobox change
     * Updates filter with array of selected values
     * Note: Change event only fires on selection/removal, not while typing
     * @param {Event} event - Change event from sfpegMultiSelectCombobox
     */
    handleSearchableComboboxChange(event) {
        const fieldNameElement = event.target.closest('[data-fieldname]');
        const fieldName = fieldNameElement?.dataset.fieldname;
        
        if (!fieldName) return;
        
        const selectedValues = Array.isArray(event.detail.value) 
            ? event.detail.value.filter(v => v != null)
            : [];
        
        const filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, 'filterValue', selectedValues);
        this.applyFiltersIfAuto(100);
    }
    
    /**
     * Handles pill removal from combobox filters
     * Removes the value from filter's array and applies filters if auto-filter mode is enabled
     * @param {Event} event - Remove event from lightning-pill
     */
    handleRemovePill(event) {
        const fieldName = event.currentTarget.dataset.fieldname;
        const valueToRemove = event.currentTarget.dataset.value;
        
        if (!fieldName || valueToRemove == null) return;
        
        const filterIndex = this.findFilterIndex(fieldName);
        if (filterIndex >= 0) {
            const currentValues = Array.isArray(this.activeFilters[filterIndex].filterValue) 
                ? this.activeFilters[filterIndex].filterValue.filter(v => v != null && v !== valueToRemove)
                : [];
            this.updateFilter(filterIndex, 'filterValue', currentValues);
        }
        
        this.applyFiltersIfAuto(100);
    }
    
    /**
     * Handles general search input changes
     * Updates generalSearchValue and applies filters if auto-filter mode is enabled
     * @param {Event} event - Change event from general search input
     */
    handleGeneralSearchChange(event) {
        this.generalSearchValue = event.target.value;
        this.applyFiltersIfAuto(500, 'generalSearchTimeout');
    }
    
    /**
     * Handles Enter key press in general search input
     * Applies filters immediately when Enter is pressed
     * @param {Event} event - Keypress event
     */
    handleGeneralSearchKeyPress(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.applyFilters();
        }
    }
    
    /**
     * Main method that prepares and dispatches filter data to parent component
     * Normalizes all filter values (dates, text, combobox) and general search keywords
     * Dispatches 'filterchange' event with normalized filter object
     * Parent component handles the actual filtering logic
     */
    applyFilters() {
        this.isFiltering = true;
        const activeFilters = {};
        
        this.activeFilters.forEach(filter => {
            if (!filter?.fieldName) return;
            
            const { fieldName, filterValue, type, startDate, endDate } = filter;
            const validFieldName = String(fieldName).trim();
            if (!validFieldName) return;
            
            if (type === 'date') {
                const start = this.normalizeDate(startDate);
                const end = this.normalizeDate(endDate);
                if (start || end) {
                    activeFilters[validFieldName] = { mode: 'range', startDate: start, endDate: end };
                }
            } else if (filterValue != null) {
                if (type === 'combobox') {
                    const normalized = this.normalizeComboboxValues(filterValue);
                    if (normalized.length > 0) {
                        activeFilters[validFieldName] = normalized;
                    }
                } else {
                    const textKeywords = this.normalizeTextValue(filterValue);
                    if (textKeywords.length > 0) {
                        activeFilters[validFieldName] = textKeywords; // Array of keywords for OR search
                    }
                }
            }
        });
        
        const keywords = this.normalizeSearchKeywords(this.generalSearchValue);
        if (keywords.length > 0) {
            activeFilters._generalSearch = keywords;
        }
        
        this.dispatchFilterChange(activeFilters);
    }
    
    /**
     * Clears all filters and resets all input fields
     * Dispatches empty filterchange event to restore original list in parent
     */
    handleClearFilters() {
        this.isFiltering = true;
        this.activeFilters = [];
        this.generalSearchValue = '';
        
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => input.value = '');
        
        const combos = this.template.querySelectorAll('lightning-combobox');
        combos.forEach(combo => combo.value = null);
        
        const fieldSelector = this.template.querySelector('[data-field-selector]');
        if (fieldSelector) fieldSelector.value = null;
        
        clearTimeout(this.filterTimeout);
        clearTimeout(this.generalSearchTimeout);
        
        this.dispatchFilterChange({});
    }
    
    /**
     * Computed getter that enriches activeFilters with computed properties for template rendering
     * - Adds isDate, isCombobox, isText flags
     * - Creates selectedPills for combobox filters
     * - Filters availableOptions to exclude already selected values
     * - Adds date labels for date filters
     * @returns {Array} Array of filter objects with computed properties
     */
    get filterItemsWithComputed() {
        return this.activeFilters.map(filter => {
            const allOptions = (this.distinctOptionsByField[filter.fieldName] || []).filter(opt => opt?.value != null);
            const isCombobox = filter.type === 'combobox';
            const isDate = filter.type === 'date';
            const selectedValues = isCombobox && Array.isArray(filter.filterValue) 
                ? filter.filterValue.filter(v => v != null)
                : [];
            
            let selectedPills = [];
            let availableOptions = allOptions;
            
            if (isCombobox) {
                selectedPills = selectedValues
                    .map(val => {
                        const option = allOptions.find(opt => opt.value === val);
                        return { value: String(val), label: option?.label || String(val) };
                    })
                    .filter(pill => pill);
                
                const selectedSet = new Set(selectedValues);
                availableOptions = allOptions.filter(opt => !selectedSet.has(opt.value));
            }
            
            return {
                ...filter,
                isDate,
                isCombobox,
                isText: filter.type === 'text',
                options: allOptions,
                availableOptions,
                selectedPills,
                isDateRange: isDate,
                startDateLabel: isDate ? `${filter.label} (Début)` : '',
                endDateLabel: isDate ? `${filter.label} (Fin)` : ''
            };
        });
    }
}