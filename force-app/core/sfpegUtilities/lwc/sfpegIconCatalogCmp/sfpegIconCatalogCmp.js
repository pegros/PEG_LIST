/***
* @author P-E GROS
* @date   Feb 2022
* @description  LWC Component to display all the custom Icons available in the
*               sfpegIcons static resource used by the sfpegIconDsp component.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2022 pegros
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

import { LightningElement, track, api} from 'lwc';
import getIconList     from '@salesforce/apex/sfpegIconCatalog_CTL.getIconList';

export default class SfpegIconCatalogCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @track isReady = false;     // Component init status
    @track iconCatalog = [];    // Icon catalog

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        console.log('connected: START');
        
        if (this.isReady) {
            console.warn('connected: END / already ready');
            return;
        }

        console.log('connected: fetching icon catalog from server');

        getIconList({})
        .then( result => {
            console.log('connected: icon catalog received ',JSON.stringify(result));

            for (let iter of Object.keys(result)) {
                console.log('connected: proccessing icon ',iter);
                this.iconCatalog.push({name: 'resource:' + iter, label: iter, sizes: result[iter]});
            }
            console.log('connected: END / catalog init ', JSON.stringify(this.iconCatalog));
            this.isReady = true;                
        }).catch( error => {
            console.warn('connected: END / configuration fetch error ',error);
            this.isReady = true;
        });

        console.log('connected: request sent');
    }

}