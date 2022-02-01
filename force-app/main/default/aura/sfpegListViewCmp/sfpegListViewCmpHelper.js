({
/***
* @author P-E GROS
* @date   Dec 2021
* @description  Addressable Aura component to display a sfpegListCmp LWC component within a standalone tab.
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

    initComponent : function(component,event,helper) {
        console.log('initComponent: START');

        let pageReference = component.get("v.pageReference");
        //console.log('initComponent: pageReference fetched',JSON.stringify(pageReference));
        let state = pageReference.state;

        let context = component.get("v.context");

        if (context === JSON.stringify(state)) {
            console.log('initComponent: END init already done');
        }
        else {
            let isDebug = (state.c__isDebug ? eval(state.c__isDebug) : false);
            //console.log('initComponent: isDebug determined ', isDebug);
            component.set("v.isDebug",isDebug);
            if (isDebug) console.log('initComponent: state fetched',JSON.stringify(state));

            // Initialising the List component
            if (! state.c__list) {
                console.error('initComponent: END / Missing list configuration name');
                component.set("v.errorMsg","Missing list configuration name!");
                return;
            }
            component.set("v.list",state.c__list);
            if (isDebug) console.log('initComponent: list configuration name set',state.c__list);

            component.set("v.actions",state.c__actions || 'N/A');
            component.set("v.title",state.c__title || "Record List");
            component.set("v.icon",state.c__icon);
            component.set("v.recordId",state.c__recordId);
            component.set("v.objectApiName",state.c__objectApiName);

        
            // Resetting the Tab label
            if (state.c__label) {
                if (isDebug) console.log('initComponent: changing tab label',state.c__label);

                let wkAPI = component.find("workspaceUtil");
                if (isDebug) if (isDebug) console.log('initComponent: wkAPI',wkAPI);

                wkAPI.isConsoleNavigation().then(function(consoleMode) {
                    if (isDebug) console.log('initComponent: console mode',consoleMode);
                    if (consoleMode) return wkAPI.getEnclosingTabId();
                    if (isDebug) console.log('initComponent: not in console mode');
                    return;
                }).then(function(tabId){
                    if (isDebug) console.log('initComponent: tab ID fetched',tabId);
                    if (tabId) return wkAPI.setTabLabel({
                        "tabId": tabId,
                        "label": ' ' + (state.c__label || 'List') });
                    if (isDebug) console.log('initComponent: no tab ID');
                    return null;
                }).then(function(tabInfo){
                    if (isDebug) console.log('initComponent: tab renamed',tabInfo);
                    if (tabInfo) return wkAPI.setTabIcon({
                        "tabId": tabInfo.tabId,
                        "iconAlt": "List",
                        "icon": "utility:list" });
                    if (isDebug) console.log('initComponent: no tabInfo');
                    return null; 
                }).then(function(tabInfo){
                    if (isDebug) console.log('initComponent: tab icon changed',tabInfo);
                }).catch(function(error) {
                    if (isDebug) console.error('initComponent: error raised',JSON.stringify(error));
                });   
            } 
            else {
                if (isDebug) console.log('initComponent: no tab label provided');
            }
            component.set("v.context",JSON.stringify(state));

            if (isDebug) console.log('initComponent: END init done');
        }
    }
})
