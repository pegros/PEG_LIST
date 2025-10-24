/***
* @author P-E GROS
* @date   Oct 2025
* @description  URL-addressable LWC wrapper to display a sfpegListCmp LWC component in a standalone console tab.
*               Implemented as a workaround to a Salesforce page state initialization delay in console mode.
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

import { LightningElement } from 'lwc';

export default class SfpegListConsoleTabCmp extends LightningElement {

    //################################################################
	// Technical Properties
	//################################################################
    isReady = false;    // Flag to manage wait time
    isDebug = false;    // Flag to debug logs

    //################################################################
	// Initialization
	//################################################################
    connectedCallback() {
        //this.isDebug = true;
        if(this.isDebug) console.log('connected: START for ListConsoleTab');
        setTimeout(() => {
            if(this.isDebug) console.log('connected: timer expired');
            this.isReady = true;
            if(this.isDebug) console.log('connected: END for ListConsoleTab');
        }, 1000);
        if(this.isDebug) console.log('connected: timer launched');
    }
}