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
    isDebug : true,
    initComponent : function(component,event,helper) {
        //helper.isDebug = component.get("v.isDebug");
        if (helper.isDebug) console.log('initComponent: START');
        //if (helper.isDebug) console.log('initComponent: isDebug', helper.isDebug);
        
        // Fetching & analysing inputs     
        let flowName = component.get("v.flowName");
        if (helper.isDebug) console.log('initComponent: flowName fetched',flowName);
        let flowParams = component.get("v.flowParams") || [];
        //if (helper.isDebug) console.log('initComponent: flowParams fetched',flowParams);
        if (helper.isDebug) console.log('initComponent: flowParams fetched',JSON.stringify(flowParams));
        if (!flowName) {
            console.warn('initComponent: END / missing flow name');
            return;
        }
        component.set("v.flowParamsStr", JSON.stringify(flowParams));
        if (helper.isDebug) console.log('initComponent: flowParamsStr set');

        // Initialising the Flow       
        let flowContainer = component.find("flowContainer");
        if (helper.isDebug) console.log('initComponent: flow fetched',flowContainer);  

    	flowContainer.startFlow(flowName, flowParams);
        if (helper.isDebug) console.log('initComponent: flow started')
        
        if (helper.isDebug) console.log('initComponent: END');
    },
    closePopup : function(component,event,helper,isDebug) {
        if (helper.isDebug) console.log('closePopup: START');
        component.find("overlayLibrary").notifyClose();
		if (helper.isDebug) console.log('closePopup: END');  
    }
})
