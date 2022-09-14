/***
* @description  Simple implementation of the generic sfpegListQuery_SVC class for
*               Apex test coverage purposes.
* @author       P-E GROS
* @date         April 2021
* @see          sfpegAction_TST
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

@SuppressWarnings('PMD.ClassNamingConventions')
public with sharing class sfpegListTest_SVC extends sfpegListQuery_SVC {

    public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START (Apex) with query ' + query);

        if (query == 'TEST') {
            System.debug('getData: fetching test records');
            List<Object> resultList = (List<Object>) [select Name from sfpegTestObject__c];
            System.debug('getData: END OK returning ' + resultList);
            return resultList;
        }
        System.debug(LoggingLevel.Error,'getData: END KO / Missing method name ');
        throw new DmlException('Missing method name');
    }

    public override Integer getCount(final Object input, final String query) {
        System.debug('getCount: START (Apex) with query ' + query);

        if (query == 'TEST') {
            System.debug('getCount: fetching test records');
            Integer result = [select count() from sfpegTestObject__c];
            System.debug('getCount: END OK returning ' + result);
            return result;
        }
        System.debug(LoggingLevel.Error,'getData: END KO / Missing method name ');
        throw new DmlException('Missing method name');
    }

    public override List<Object> getPaginatedData(final Object input, final String query, final String lastValue) {
        System.debug('getPaginatedData: START (Apex) with query ' + query);
        System.debug('getPaginatedData: query is ' + query);
        System.debug('getPaginatedData: lastValue is ' + lastValue);

        if (query == 'TEST') {
            if (lastValue == null) {
                System.debug('getPaginatedData: fetching page #1 of test records');
                List<Object> resultList = (List<Object>) [select Name, Owner.Name from sfpegTestObject__c order by Id asc limit 2];
                 System.debug('getPaginatedData: END OK returning ' + resultList);
                return resultList;
            }
            else {
                System.debug('getPaginatedData: fetching page #2 of test records');
                List<Object> resultList = (List<Object>) [select Name, Owner.Name from sfpegTestObject__c where Id > :lastValue order by Id asc limit 2];
                 System.debug('getPaginatedData: END OK returning ' + resultList);
                return resultList;
            }
        }
        System.debug(LoggingLevel.Error,'getData: END KO / Missing method name ');
        throw new DmlException('Missing method name');
    }
}