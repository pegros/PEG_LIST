/***
* @description  Service class to list all Objects available on an Org 
*               (especially their key prefixes) via a schema.describe 
*               and return all results for a sfpegList metadata configuration.
*               Implements the sfpegListQuery_SVC virtual class.
*               Part of the PEG_SYS package extensions.
*               Reusing logic initially implemented for the SYS_ObjectSnapshot_SCH
*               class of the PEG_SYS.   
* @author       P-E GROS
* @date         Dec 2025
* @see          sfpegListQuery_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
* @see          SYS_ObjectSnapshot_SCH
* @see          PEG_SYS package (https://github.com/pegros/PEG_SYS)
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

@SuppressWarnings('PMD.ClassNamingConventions')

public with sharing class sfpegObjectKeys_SVC extends sfpegListQuery_SVC {
    
    /***
    * @description  SObject partially processed because of technical accessibility issue
    *               Accessing their description triggers internal Salesforce errors
    *               with no ability to catch any Apex exception.
    ***/
    static final private Set<String> SPECIAL_OBJECTS = new Set<String>{
        'SalesforceContract','SalesforceContractFeed',
        'SalesforceInvoice','SalesforceInvoiceFeed',
        'SalesforceQuote','SalesforceQuoteFeed','TenantBillingUsageEvent'};

    /***
    * @description  Override of the standard getdata() method to execute a OrgLimits.getMap().
    *               There is no configuration.
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START sfpegObjectKeys_SVC implementation');

        List<Object> results = new List<Object>();
        for(Schema.SObjectType iter : Schema.getGlobalDescribe().Values()){
            Schema.DescribeSObjectResult iterDesc = iter.getDescribe();
            String iterName = iterDesc.getName();
            System.debug(LoggingLevel.FINE,'getData: processing object ' + iterName);

            String iterType = getType(iterDesc);
            System.debug(LoggingLevel.FINE,'getData: object type determined ' + iterType);

            // Section handling special cases where calling iterDesc methods triggers internal 
            // Salesforce errors not even catched in Apex. 
            Map<String,Object> iterMap = new Map<String,Object>();
            if (SPECIAL_OBJECTS.contains(iterName)) {
                system.debug(LoggingLevel.FINER,'getData: registering special Object ' + iterName);
                iterMap.put('Name',iterName);
                iterMap.put('Type',iterType);
                iterMap.put('isCustom',false);
                iterMap.put('isCustomSetting',false);
                iterMap.put('Label',iterName);
                iterMap.put('rtCount',0); 
            }
            else {
                System.debug(LoggingLevel.FINER,'getData: registering ' + iterName);
                iterMap.put('Name',iterName);
                iterMap.put('Type',iterType);
                iterMap.put('isCustom',iterDesc.isCustom());
                iterMap.put('isCustomSetting',iterDesc.isCustomSetting());
                iterMap.put('keyPrefix',iterDesc.getKeyPrefix());
                iterMap.put('Label',iterDesc.getLabel());
                iterMap.put('rtCount',iterDesc.getRecordTypeInfos().size());
            }

            results.add((Object)iterMap);
            System.debug(LoggingLevel.FINER,'getData: object registered');
        }

        System.debug('getData: END sfpegObjectKeys_SVC implementation with #Items ' + results.size());
        return results;
    }

    /***
    * @description  Private utility method to determine the actual type of an
    *               object, given its schema description.
    ***/
    private string getType(final Schema.DescribeSObjectResult iterDesc) {
        System.debug(LoggingLevel.FINER,'getType: START with object ' + iterDesc.getName());
        String iterName = iterDesc.getName();

        String iterType = (iterDesc.isCustomSetting() ? 'Custom Setting' :
 (iterDesc.isCustom() ? (iterName.countMatches('__') > 1 ? 'Managed Package' : null) : 'Standard Object'));
        System.debug(LoggingLevel.FINER,'getType: global type determined ' + iterType);

        if (String.isBlank(iterType)) {
            System.debug(LoggingLevel.FINER,'getType: refining special cases');
            switch on iterName.substringAfterLast('_') {
                when 'c'    { iterType = 'Custom Object';}
                when 'e'    { iterType = 'Custom Event';}
                when 'mdt'  { iterType = 'Custom Metadata';}
                when 'ka'   { iterType = 'Standard Object';}
                when 'kav'  { iterType = 'Standard Object';}
                when else   { iterType = 'Unknown';}
            }
        }
        else if (iterType.equals('Standard Object')) {
            System.debug(LoggingLevel.FINER,'getType: refining standard objects');
            switch on iterName.substringAfterLast('_') {
                when 'ChangeEvent'  { iterType = 'CDC Event';}
                when 'Share'        { iterType = 'Sharing';}
                when 'Feed'         { iterType = 'Feed';}
                when 'History'      { iterType = 'History';}
                when else {
                    if (iterName.endsWith('ChangeEvent'))   {iterType = 'CDC Event';}
                    else if (iterName.endsWith('Share'))    {iterType = 'Sharing';}
                    else if (iterName.endsWith('Feed'))     {iterType = 'Feed';}                        else if (iterName.endsWith('History'))  {iterType = 'History';}
                }
            }
        }

        System.debug(LoggingLevel.FINER,'getType: END with type ' + iterType);
        return iterType;
    }
}