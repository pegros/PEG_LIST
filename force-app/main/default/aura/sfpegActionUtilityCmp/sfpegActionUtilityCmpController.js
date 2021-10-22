({
/***
* @author P-E GROS
* @date   June 2021
* @description  Aura Component to display an action menu in a utility bar and handle specific console operations.
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

    // Initialisation handling
    doInit : function(component, event, helper) {
        //console.log('doInit: START');
        helper.processInit(component, event, helper);
        if (helper.isDebug) console.log('doInit: END');	
	},
    // Action handling
    handleAction : function(component, event, helper) {
        if (helper.isDebug) console.log('handleAction: START');
        let action = event.getParams();
        if (helper.isDebug) console.log('handleAction: action extracted ',JSON.stringify(action));
        helper.processAction(action,component,helper);
        if (helper.isDebug) console.log('handleAction: END');
    }//,
    // Console Tab Events handling
    /*handleTabFocus : function(component, event, helper) {
        if (helper.isDebug) console.log('handleTabFocus: START');
        helper.processTabFocus(component,event,helper);
        if (helper.isDebug) console.log('handleTabFocus: END');	
	}*/
})
