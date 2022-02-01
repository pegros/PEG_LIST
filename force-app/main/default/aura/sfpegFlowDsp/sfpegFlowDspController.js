({
/***
* @author P-E GROS
* @date   Oct 2021
* @description  Aura Component to execute a Flow in a component and trigger a popup close upon completion.
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

    doInit : function(component, event, helper) {
        console.log('doInit: START');
		helper.initComponent(component, event, helper);        
        console.log('doInit: END');
	},
    statusChange : function (component, event, helper) {
        if (helper.isDebug) console.log('statusChange: START');
    	if (event.getParam('status') === "FINISHED") {
        	if (helper.isDebug) console.log('statusChange: finished status');
			helper.closePopup(component, event, helper);    
    	}
        else {
        	if (helper.isDebug) console.log('statusChange: other status',JSON.stringify(event.getParams()));
        }
        if (helper.isDebug) console.log('statusChange: END');
    }
})
