/***
* @description  Service class to execute a OrgLimits query and return all results
*               for a sfpegList metadata configuration.
*               Implements the sfpegListQuery_SVC virtual class.
*               Part of the PEG_SYS package extensions.
* @author       P-E GROS
* @date         April 2024
* @see          sfpegListQuery_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2024 pegros
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

public with sharing class sfpegOrgLimits_SVC extends sfpegListQuery_SVC {
    
    /***
    * @description  Override of the standard getdata() method to execute a OrgLimits.getMap().
    *               There is no configuration.
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START SYS_OrgLimits_SVC implementation');

        Map<String,System.OrgLimit> limitMap = OrgLimits.getMap();
        System.debug('getData: OrgLimit Map fetched with #items ' + limitMap.size());

        List<Object> results = new List<Object>();
        for (String iter : limitMap.keySet()) {
            System.debug(LoggingLevel.FINE,'getData: processing limit ' + iter);
            System.OrgLimit iterLimit = limitMap.get(iter);
            System.debug(LoggingLevel.FINE,'getData:   --> ' + iterLimit);

            Map<String,Object> iterMap = new Map<String,Object>();
            iterMap.put('Name',iter);
            iterMap.put('Value',iterLimit.getValue());
            iterMap.put('Limit',iterLimit.getLimit());
            iterMap.put('Ratio',((Decimal) iterLimit.getValue()) / Math.max(1,iterLimit.getLimit()));
            System.debug(LoggingLevel.FINE,'getData: registering ' + iterMap);
            results.add((Object)iterMap);
        }

        System.debug('getData: END SYS_OrgLimits_SVC implementation with #Items ' + results.size());
        return results;
    }
}