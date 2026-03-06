/***
* @author P-E GROS
* @date   March 2026
* @description  Utility Javascript LWC component providing central configuration caching
*               capability for all types of configuration used in the PEG_LIST package.
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

const sfpegConfigUtl = {

    //----------------------------------------------------------------
    // Properties
    //----------------------------------------------------------------
    isDebug : false, // Debug logs activation
    CONFIG_MAP : {}, // Config Caching Map
    
    
    //----------------------------------------------------------------
    // Cache Management Methods
    //----------------------------------------------------------------

    getMap: (type) => {
        if (sfpegConfigUtl.isDebug) console.log('getMap: START with type ', type);
        if (sfpegConfigUtl.isDebug) console.log('getMap: END returning ', JSON.stringify((this.CONFIG_MAP)[type]));
        return (sfpegConfigUtl.CONFIG_MAP)[type];
    },

    getConfig: (type,name) => {
        if (sfpegConfigUtl.isDebug) console.log('getConfig: START for config ', name);
        if (sfpegConfigUtl.isDebug) console.log('getConfig: of type ', type);
        let typeMap = (sfpegConfigUtl.CONFIG_MAP)[type];
        if (typeMap) {
            if (typeMap[name]) {
                if (sfpegConfigUtl.isDebug) console.log('getConfig: END / returning config found ',JSON.stringify(typeMap[name]));
                return typeMap[name];
            }
            else {
                if (sfpegConfigUtl.isDebug) console.log('getConfig: END / no config with this name set');
                return null;
            }
        }
        else {
            if (sfpegConfigUtl.isDebug) console.log('getConfig: END / no config of this type set');
            return null;
        }
    },

    setConfig: (type,name,value) => {
        if (sfpegConfigUtl.isDebug) console.log('setConfig: for config ', name);
        if (sfpegConfigUtl.isDebug) console.log('setConfig: of type ', type);
        if (!(sfpegConfigUtl.CONFIG_MAP)[type]) { (sfpegConfigUtl.CONFIG_MAP)[type] = {};}
        (sfpegConfigUtl.CONFIG_MAP)[type][name] = value;
        if (sfpegConfigUtl.isDebug) console.log('setConfig: END with value ', JSON.stringify(value));
    }
}

export { sfpegConfigUtl }