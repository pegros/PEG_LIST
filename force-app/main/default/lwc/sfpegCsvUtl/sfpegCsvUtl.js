/***
* @author P-E GROS
* @date   June 2021
* @description  Utility Javascript LWC component providing simple tools to export
*               JSON lists in CSV.
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

const sfpegCsvUtl = { 

    //#########################################################
    // Static variable to activate console logs on the methods 
    //#########################################################
    isDebug : false,

    //#########################################################
    // Static variable to tune the CSV output
    //#########################################################
    fieldDelimiter : ",",
    valueDelimiter : "\"",
    lineDelimiter  : "\r\n",

    //#########################################################
    // Utility method to export a list of records as a CSV file
    //#########################################################
    export : (fileName, recordList, fieldList) => {
        if (sfpegCsvUtl.isDebug) console.log('export: START with fileName ', fileName);
        if (sfpegCsvUtl.isDebug) console.log('export: recordList provided with #items ', (recordList || []).length);
        if (sfpegCsvUtl.isDebug) console.log('export: fieldList provided with #Items ', (fieldList || []).length);

        if ((!fileName) || (!recordList) || (!fieldList)) {
            console.warn('export: missing input!');
            return;
        }
        if ((recordList.length == 0) || (fieldList.length == 0)) {
            console.warn('export: empty data / field list!');
            return;
        }

        let fileContent = sfpegCsvUtl.formatHeader(fieldList);
        if (sfpegCsvUtl.isDebug) console.log('export: fileContent init with headers', fileContent);

        recordList.forEach(iter => {
            fileContent += sfpegCsvUtl.formatRow(iter,fieldList);
        });
        if (sfpegCsvUtl.isDebug) console.log('export: fileContent finalized  ', fileContent);

        let fileBlob = new Blob([fileContent]);
        if (sfpegCsvUtl.isDebug) console.log('export: fileBlob init  ', fileBlob);
        
        let exportFilename = fileName ? fileName + '.csv' : 'export.csv';
        if (sfpegCsvUtl.isDebug) console.log('export: exportFilename init  ', exportFilename);

        if(navigator.msSaveBlob){
            if (sfpegCsvUtl.isDebug) console.log('export: MS export mode');
            navigator.msSaveBlob(fileBlob, exportFilename);
        }
        else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)){
            if (sfpegCsvUtl.isDebug) console.log('export: iXXX export mode');
            const link = window.document.createElement('a')
            link.href='data:text/csv;charset=utf-8,' + encodeURI(fileContent);
            link.target="_blank"
            link.download=exportFilename
            link.click()
        }
        else {
            if (sfpegCsvUtl.isDebug) console.log('export: default export mode');
            const link = document.createElement("a")
            if(link.download !== undefined) {
                const url = URL.createObjectURL(fileBlob)
                link.setAttribute("href", url)
                link.setAttribute("download", exportFilename)
                link.style.visibility='hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        }
        if (sfpegCsvUtl.isDebug) console.log('export: END');
    },

    formatHeader : (fieldList) => {
        if (sfpegCsvUtl.isDebug) console.log('formatHeader: START with ',fieldList);
        let outputStr = sfpegCsvUtl.valueDelimiter + fieldList.join(sfpegCsvUtl.valueDelimiter + sfpegCsvUtl.fieldDelimiter + sfpegCsvUtl.valueDelimiter) + sfpegCsvUtl.valueDelimiter;
        outputStr += sfpegCsvUtl.lineDelimiter;
        if (sfpegCsvUtl.isDebug) console.log('formatHeader: END with ',outputStr);
        return outputStr;
    },

    formatRow : (row, fieldList) => {
        if (sfpegCsvUtl.isDebug) console.log('formatRow: START with ',row);
        let valueList = [];
        fieldList.forEach(iter => valueList.push(row[iter]));
        let outputStr = sfpegCsvUtl.valueDelimiter + valueList.join(sfpegCsvUtl.valueDelimiter + sfpegCsvUtl.fieldDelimiter + sfpegCsvUtl.valueDelimiter) + sfpegCsvUtl.valueDelimiter;
        outputStr += sfpegCsvUtl.lineDelimiter;
        if (sfpegCsvUtl.isDebug) console.log('formatRow: END with ',outputStr);
        return outputStr;
    }
}

export { sfpegCsvUtl }