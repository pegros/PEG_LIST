({
/***
* @author P-E GROS
* @date   June 2021
* @description  Aura Component to display an action menu in a utility bar and handle specific console operations.
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
    /*TABS_TO_CLOSE : {},
    TABS_TO_FOCUS : {},*/
    isDebug : false,
    // Initialization
    processInit : function(component,event,helper) {
        helper.isDebug = component.get("v.isDebug");
        if (helper.isDebug) console.log('processInit: START');
        //if (helper.isDebug) console.log('processInit: isDebug ',helper.isDebug);

        // User ID fetch
        let currentUser = $A.get("$SObjectType.CurrentUser");
        if (helper.isDebug) console.log('processInit: currentUser fetched',JSON.stringify(currentUser));
        component.set("v.userId",currentUser.Id);

        // console mode flag init
        let workspaceUtil = component.find("workspaceUtil");
        workspaceUtil.isConsoleNavigation()
        .then(consoleMode => {
            component.set("v.isConsole",consoleMode);
            if (helper.isDebug) console.log('processInit: END / console mode set ', consoleMode);
        }).catch(function(error){
            console.warn('processInit: END / isConsoleNavigation error ',JSON.stringify(error));  
        });        

        if (helper.isDebug) console.log('processInit: END (synchronous part)');	
	},
    // Action Handling
    processAction: function(action, context, component, helper) {
        if (helper.isDebug) console.log('processAction: START');
        if (helper.isDebug) console.log('processAction: action provided ',JSON.stringify(action));
        if (helper.isDebug) console.log('processAction: context provided ', JSON.stringify(context));

        let isLocalAction = true;
        if (helper.isDebug) console.log('processAction: action type provided ',action.type);
        switch (action.type) {
            case 'minimize':
                if (helper.isDebug) console.log('processAction: minimizing utility window');
                helper.minimize(component,helper);
                break;
            case 'openTab':
                if (helper.isDebug) console.log('processAction: opening/replacing one tab');
                helper.openTab(action.params,component,helper);
                break;
            case 'closeTabs':
                if (helper.isDebug) console.log('processAction: closing tabs');
                helper.closeTabs(action.params.closeAll,component,helper);
                break;
            case 'refreshTab':
                if (helper.isDebug) console.log('processAction: refreshing tabs');
                helper.refreshTab(component,helper);
                break;
            case 'openFlow':
                if (helper.isDebug) console.log('processAction: opening Flow popup');
                helper.openFlow(action.params,context,component,helper);
                break;
            case 'openPopup':
                if (helper.isDebug) console.log('processAction: opening custom Aura component popup');
                helper.openPopup(action.params,context,component,helper);
                break;
            case 'fireEvent':
                if (helper.isDebug) console.log('processAction: firing App event');
                helper.fireEvent(action.params,component,helper);
                break;
            default:
                if (helper.isDebug) console.log('processAction: invoking action on action bar ',action.type);
                isLocalAction = false;
                helper.callActionBar(action, context, component, helper);
        }

        if ((isLocalAction) && (action.next)) {
            if (this.isDebug) console.log('processAction: chained action to trigger',JSON.stringify(action.next));
            helper.processAction(action.next,context,component, helper);
            if (this.isDebug) console.log('processAction: END / chained action triggered');
        }
        else {
            if (this.isDebug) console.log('processAction: END / no chained action to trigger');
        }
    },
    minimize: function(component,helper) {
        if (helper.isDebug) console.log('minimize: START');

        let utilityUtil = component.find('utilityUtil');
        utilityUtil.getEnclosingUtilityId()
        .then(utilityId  => {
            if (helper.isDebug) console.log('minimize: utilityId fetched ',utilityId);
            if( utilityId ) {
                if (helper.isDebug) console.log('minimize: END OK / minimizing tab');
                return utilityUtil.minimizeUtility({'utilityId':utilityId});
            }
            else {
                console.warn('minimize: END KO / utility close requested but component not in utility bar');
                throw 'Configuration problem: utility close requested but component not in utility bar';
            }
        }).then(success => {
            if (helper.isDebug) console.log('minimize: END utility minimized');
        }).catch(error => {
            console.warn('minimize: END utility minimization error',error);
        });
        if (helper.isDebug) console.log('minimize: fetching utility ID');
    },
    closeTabs : function(closeAll,component,helper) {
        if (helper.isDebug) console.log('closeTabs: START with closeAll positionned to ',closeAll);
                
        let isConsole = component.get("v.isConsole");
        if (helper.isDebug) console.log('closeTabs: isConsole fetched ',isConsole);

        if (isConsole) {
            if (helper.isDebug) console.log('closeTabs: processing tab close');
            let workspaceAPI = component.find("workspaceUtil");
            workspaceAPI.getAllTabInfo()
            .then(tabinfos => {
                if (helper.isDebug)console.log('closeTabs: tab info fetched ', JSON.stringify(tabinfos));       

                if (tabinfos) {
                    if (helper.isDebug) console.log('closeTabs: closing tabs ');
                    tabinfos.forEach(tab => {
                        if (helper.isDebug) console.log('closeTabs: closing tab ',JSON.stringify(tab));
                        if (tab.pinned) {
                            if (helper.isDebug) console.log('closeTabs: keeping pinned tab');
                        }
                        else if (tab.focused) {
                            if (helper.isDebug) console.log('closeTabs: handling focused tab');
                            if (closeAll) {
                                console.log('closeTabs: closing focused tab');
                                workspaceAPI.closeTab({'tabId': tab.tabId});

                                let navService = component.find("navService");
                                navService.navigate({
                                    "type": "standard__namedPage",
                                    "attributes": {
                                        "pageName": "home"    
                                    }
                                },true);
                                console.log('closeTabs: opening home');
                            }
                            else {
                                console.log('closeTabs: keeping focused tab');
                            }
                        }
                        else {
                            console.log('closeTabs: closing tab (non focused/pinned)');
                            workspaceAPI.closeTab({'tabId': tab.tabId});
                        }
                    });
                    console.log('closeTabs: all tab close requested');
                }
                else {
                    console.warn('closeTabs: END KO / no tabinfos fetched ');
                }
            }).catch(error => {
                console.warn('closeTabs: END KO / tab info request failed ', JSON.stringify(error));
            });
            console.log('closeTabs: all tabInfos requested');
        }
        else {
            console.warn('closeTabs: END KO / close tab in non console mode!');
        }
    },
    openTab : function(params,component,helper) {
        if (helper.isDebug) console.log('openTab: START with params ',JSON.stringify(params));

        let isConsole = component.get("v.isConsole");
        if (helper.isDebug) console.log('openTab: isConsole fetched ',isConsole);

        let sourceId = params.sourceId;
        if (helper.isDebug) console.log('openTab: sourceId extracted ',sourceId);
        let targetId = params.targetId;
        if (helper.isDebug) console.log('openTab: targetId extracted ',targetId);
        let targetPage = params.targetPage;
        if (helper.isDebug) console.log('openTab: targetPage extracted ',targetPage);

        if (isConsole) {
            // ### CONSOLE MODE ###
            if (helper.isDebug) console.log('openTab: operating in console mode');

            let workspaceUtil = component.find("workspaceUtil");
            let openParams = (targetId ? {recordId: targetId} : {pageReference : targetPage});
            openParams.focus= true;
            openParams.overrideNavRules= false;
            if (helper.isDebug) console.log('openTab: openParams prepared',JSON.stringify(openParams));

            workspaceUtil.getFocusedTabInfo()
            .then(function(currentFocusedTab) {
                if (helper.isDebug) console.log('openTab: currentFocusedTab retrieved ',JSON.stringify(currentFocusedTab));
                if (sourceId == null) {
                    if (helper.isDebug) console.log('openTab: setting sourceId ');
                    sourceId = currentFocusedTab.tabId;
                } 
                return workspaceUtil.openTab(openParams);
            }).then(function(newTabId){
                if (helper.isDebug) console.log('openTab: new tab opened ',newTabId);
                //helper.TABS_TO_FOCUS[newTabId] = true;
                //if (helper.isDebug) console.log('openTab: TABS_TO_FOCUS updated ',JSON.stringify(helper.TABS_TO_FOCUS));
                if (sourceId) {
                    if (helper.isDebug) console.log('openTab: closing old tab ',sourceId);
                    workspaceUtil.closeTab({tabId: sourceId})
                    .then(function(status){
                        if (helper.isDebug) console.log('openTab: END / previous tab closed ',status);
                    }).catch(function(error){
                        console.warn('openTab: END / closeTab error ',JSON.stringify(error));  
                    });
                }
                else {
                    if (helper.isDebug) console.log('openTab: END / no old tab to close ');
                }
            }).catch(function(error){
            	console.warn('openTab: END / openTab error ',JSON.stringify(error));  
            });
            if (helper.isDebug) console.log('openTab: temporary end');
        }
        else {
            // ### STANDARD MODE ###
            if (helper.isDebug) console.log('openTab: operating in standard mode');
            let navService = component.find("navUtil");
            let pageRef = (targetId ? {"type": "standard__recordPage",
                                       "attributes": {"recordId": targetId,"actionName": "view" }}
                                    : targetPage);
            if (helper.isDebug) console.log('openTab: target pageRef prepared ', JSON.stringify(pageRef));
            navService.navigate(pageRef);
            if (helper.isDebug) console.log('openTab: END');
        }
    },
    refreshTab : function(component,helper) {
        if (helper.isDebug) console.log('refreshTab: START');

        let isConsole = component.get("v.isConsole");
        if (helper.isDebug) console.log('refreshTab: isConsole fetched ',isConsole);

        if (isConsole) {
            // ### CONSOLE MODE (using wokrspace API for refresh) ###
            if (helper.isDebug) console.log('refreshTab: operating in console mode');
            
            let workspaceUtil = component.find("workspaceUtil");
            workspaceUtil.getFocusedTabInfo()
            .then(function(currentTab) {
                if (helper.isDebug) console.log('refreshTab: current tab fetched ',JSON.stringify(currentTab));
                return workspaceUtil.refreshTab({tabId: currentTab.tabId, includeAllSubtabs: false})
            })
            .then(function() {
                if (helper.isDebug) console.log('refreshTab: END / current tab refreshed ');
            })
            .catch(function(error){
            	console.warn('refreshTab: END KO / refreshTab error ',JSON.stringify(error));  
        	});
        	if (helper.isDebug) console.log('refreshTab: temporary end');
        }
        else {
            // ### CONSOLE MODE (using ###
            if (helper.isDebug) console.log('refreshTab: operating in console mode');
            $A.get('e.force:refreshView').fire();
            if (helper.isDebug) console.log('refreshTab: END / Event fired');
        }
    },
    openFlow : function(params,context,component,helper) {
        if (helper.isDebug) console.log('openFlow: START with params ',JSON.stringify(params));
        if (helper.isDebug) console.log('openFlow: context provided ', JSON.stringify(context));

        let flowParams = [...(params.params || [])];
        if (helper.isDebug) console.log('openFlow: flowParams init ', JSON.stringify(flowParams));
        if ((params.selection) && (context)) {
            if (helper.isDebug) console.log('openFlow: adding selection configured as ',JSON.stringify(params.selection));
            //let selectParam = { ...(params.selection) };
            let selectParam = {name: params.selection.name, type: params.selection.type, value: []};
            if (helper.isDebug) console.log('openFlow: selectParam init ',JSON.stringify(selectParam));
            if (params.selection.fields) {
                if (helper.isDebug) console.log('openFlow: extracting fields from selection ',JSON.stringify(params.selection.fields));
                context.forEach(item => {
                    let itemVal = {};
                    params.selection.fields.forEach(itemField => {
                        itemVal[itemField] = item[itemField];
                    });
                    selectParam.value.push(itemVal);
                });
            }
            else {
                if (helper.isDebug) console.log('openFlow: extracting field from selection ',params.selection.field);
                context.forEach(item => {
                    selectParam.value.push(item[params.selection.field]);
                });
            }
            if (helper.isDebug) console.log('openFlow: selection init ',JSON.stringify(selectParam));
            flowParams.push(selectParam);
            if (helper.isDebug) console.log('openFlow: selection added ');
        }
        if (helper.isDebug) console.log('openFlow: flowParams prepared ', JSON.stringify(flowParams));

        $A.createComponent("c:sfpegFlowDsp", {
                "flowName":     params.name,
                //"flowParams":   params.params,
                "flowParams":   flowParams,
                "isDebug":      helper.isDebug
            },
            function(flowCmp, status, errorMessage) {
                if (status === "SUCCESS") {
                    if (helper.isDebug) console.log('openFlow: flow component create OK ', flowCmp);

                    let overlayLib = component.find("overlayLib");
                    overlayLib.showCustomModal({
                            header: params.header,
                            body: flowCmp, 
                            showCloseButton: true,
                            cssClass: params.class || 'slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large',
                            closeCallback: function() {
                                if (helper.isDebug) console.log('openFlow: popup closed');
                                if (params.next) {
                                    if (helper.isDebug) console.log('openFlow: chained action to trigger',JSON.stringify(params.next));
                                    if (helper.isDebug) console.log('openFlow: helper status',helper);
                                    helper.processAction(params.next,context,component, helper);
                                    if (helper.isDebug) console.log('openFlow: chained action triggered');
                                }
                                else {
                                    if (helper.isDebug) console.log('openFlow: no chained action to trigger');
                                }
                                if (params.doRefresh) {
                                    $A.get('e.force:refreshView').fire();
                                    if (helper.isDebug) console.log('openFlow: END / refresh fired');
                                }
                                else {
                                    if (helper.isDebug) console.log('openFlow: END / no refresh fired');
                                }
                            }
                    });
                    if (helper.isDebug) console.log('openFlow: showCustomModal done');
                }
                else {
                    console.warn('openFlow: END KO / component create failed ', errorMessage);
                }
            }
        );

        if (helper.isDebug) console.log('openFlow: component creation requested');
    },
    openPopup : function(params,context,component,helper) {
        if (helper.isDebug) console.log('openPopup: START with params ',JSON.stringify(params));
        if (helper.isDebug) console.log('openPopup: context provided ', context);

        let cmpParams = JSON.parse(JSON.stringify(params.params || {}));
        if (helper.isDebug) console.log('openPopup: cmpParams init ', JSON.stringify(cmpParams));
        if ((params.selection) && (context)) {
            if (helper.isDebug) console.log('openPopup: adding selection configured as ',JSON.stringify(params.selection));

            let selectionValue = [];
            if (params.selection.fields) {
                if (helper.isDebug) console.log('openPopup: extracting fields from selection ',JSON.stringify(params.selection.fields));
                context.forEach(item => {
                    let itemVal = {};
                    params.selection.fields.forEach(itemField => {
                        itemVal[itemField] = item[itemField];
                    });
                    selectionValue.value.push(itemVal);
                });
            }
            else {
                if (helper.isDebug) console.log('openPopup: extracting field from selection ',params.selection.field);
                context.forEach(item => {
                    selectionValue.push(item[params.selection.field]);
                });
            }
            if (helper.isDebug) console.log('openPopup: selectionValue init ',JSON.stringify(selectionValue));
            cmpParams[params.selection] = selectionValue;
        }
        if (helper.isDebug) console.log('openFlow: cmpParams prepared ', JSON.stringify(cmpParams));

        $A.createComponent(params.name, cmpParams,
            function(content, status, errorMessage) {
              if (status === "SUCCESS") {
                  console.log('openPopup: component create OK');
                  let overlayLib = component.find("overlayLib");
                  overlayLib.showCustomModal({
                           header: params.header,
                           body: content, 
                           showCloseButton: true,
                           cssClass: content.class || 'slds-modal slds-fade-in-open slds-slide-down-cancel',
                           closeCallback: function() {
                                if (helper.isDebug) console.log('openPopup: popup closed');
                                if (params.next) {
                                    if (helper.isDebug) console.log('openPopup: chained action to trigger',JSON.stringify(params.next));
                                    helper.processAction(params.next,context,component, helper);
                                    if (helper.isDebug) console.log('openPopup: chained action triggered');
                                }
                                else {
                                    if (helper.isDebug) console.log('openPopup: no chained action to trigger');
                                }
                                if (params.doRefresh) {
                                    $A.get('e.force:refreshView').fire();
                                    if (helper.isDebug) console.log('openPopup: END / refresh fired');
                                }
                                else {
                                    if (helper.isDebug) console.log('openPopup: END / no refresh fired');
                                }
                            }
                  });
                  if (helper.isDebug) console.log('openPopup: showCustomModal done');
              }
              else {
                  console.warn('openPopup: END KO / component create failed ',errorMessage);
              }
         });

        if (helper.isDebug) console.log('openFlow: component creation requested');
    },
    fireEvent : function(params,component,helper) {
        if (helper.isDebug) console.log('fireEvent: START with params ',JSON.stringify(params));

        let evtType = params.type;
        if (evtType) {
            if (helper.isDebug) console.log('fireEvent: firing event of type ',evtType);
            let appEvent = $A.get(evtType);

            let evtParams = params.params;
            if (evtParams) {
                if (helper.isDebug) console.log('fireEvent: setting event params');
                appEvent.setParams(evtParams);
            }
            else {
                if (helper.isDebug) console.log('fireEvent: no param provided');
            }

            appEvent.fire();
            if (helper.isDebug) console.log('fireEvent: END OK - Event fired');
        }
        else {
            console.warn("fireEvent: END KO - Missing event type")
        }
    },
    callActionBar : function(action,context,component,helper) {
        if (helper.isDebug) console.log('callActionBar: START');
            
        let actionBar = component.find("actionBar");
        if (context) {
            if (helper.isDebug) console.log('callActionBar: setting selection list from context',JSON.stringify(context));
            actionBar.recordList = context;
        }
        actionBar.executeAction(action,null);
        
        if (helper.isDebug) console.log('callActionBar: END');
    }
    //,
    // Workspace Tab Event Handling
    /*processTabFocus : function(component, event, helper) {
        if (helper.isDebug) console.log('processTabFocus: START');
        //if (helper.isDebug) console.log('processTabFocus: event params ', JSON.stringify(event.getParams()));
        let previousTabId = event.getParam('previousTabId');
        if (helper.isDebug) console.log('processTabFocus: previousTabId extracted ',previousTabId);
        
        //if (helper.isDebug) console.log('processTabFocus: TABS_TO_CLOSE fetched ',JSON.stringify(helper.TABS_TO_CLOSE));
        //if (helper.isDebug) console.log('processTabFocus: TABS_TO_FOCUS fetched ',JSON.stringify(helper.TABS_TO_FOCUS));
        if (helper.TABS_TO_FOCUS[previousTabId]) {
        	if (helper.isDebug) console.log('processTabFocus: previousTabId to refocus');
            delete helper.TABS_TO_FOCUS[previousTabId];
        	//if (helper.isDebug) console.log('processTabFocus: TABS_TO_FOCUS updated ',JSON.stringify(helper.TABS_TO_FOCUS));
            let workspaceUtil = component.find("workspaceUtil");
        	workspaceUtil.focusTab({tabId: previousTabId})
            .then(function(status){
                if (helper.isDebug) console.log('processTabFocus: END / previous tab focused ',status);
            }).catch(function(error){
            	console.warn('processTabFocus: END / focusTab error ',JSON.stringify(error));  
        	});
            if (helper.isDebug) console.log('processTabFocus: refocusing tab');
        }
        else {
            if (helper.isDebug) console.log('processTabFocus: END (no refocus needed)');	
        }
	}*/
})
