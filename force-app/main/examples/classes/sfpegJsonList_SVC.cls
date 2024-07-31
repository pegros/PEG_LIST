/***
* @description  Lightning controller for sfpegList configuration
*               enabling to deserialized a JSON List stored in a 
*               record text field.
* @author       P-E GROS
* @date         July 2024
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

public with sharing class sfpegJsonList_SVC extends sfpegListQuery_SVC {
            
    /***
    * @description  Override of the standard getdata() method to execute a query
    *               returning a single record and JSON deserialize a text field of
    *               this record as a list of objects.
    *               The name of the field to parse should be set in the FIELD
    *               property of the input context.
    *               Configuration of SOQL query is retrieved from the sfpegList 
    *               metadata triggering its execution (via the sfpegList_CTL.CONFIG
    *               static property).
    ***/
	public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START sfpegJsonList_SVC implementation');
        System.debug('getData: input provided ' + input);
        System.debug('getData: query provided ' + query);
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        String fieldName = (String)(inputData.get('FIELD'));
        System.debug('getData: fieldName extracted ' + fieldName);

        sfpegList__mdt config = sfpegList_CTL.CONFIG;
        String soqlQuery = config.QuerySOQL__c;
        System.debug('getData: soqlQuery retrieved ' + input);

        List<Object> soqlResults = executeSOQL(soqlQuery , inputData);
        System.debug('getData: results fetched with #items ' + soqlResults.size());
        System.debug('getData: results returned ' + soqlResults);

        if (soqlResults.isEmpty()) {
            System.debug('getData: END sfpegJsonList_SVC with no record');
            return null;
        }
        else if (soqlResults.size() > 1) {
            System.debug('getData: END sfpegJsonList_SVC KO with too many results --> ' + soqlResults.size());
            throw new AuraHandledException('sfpegJsonList_SVC: Too many rows fetched: ' + + soqlResults.size());
        }
        else {
            System.debug('getData: parsing result ' + soqlResults[0]);
            String resultString = (String) ((SObject) soqlResults[0]).get(fieldName);
            System.debug('getData: resultString extracted ' + resultString);

            if (String.isBlank(resultString)) {
                System.debug('getData: END sfpegJsonList_SVC with no record');
                return null;
            }
            
            try {
                List<Object> results = (List<Object>) (JSON.deserializeUntyped(resultString));
                System.debug('getData: results parsed ' + results);
                System.debug('getData: END sfpegJsonList_SVC with #records ' + results.size());
                return results;
            }
            catch (Exception error) {
                System.debug('getData: END sfpegJsonList_SVC KO / JSON parsing failed: ' + error);
                throw new AuraHandledException('sfpegJsonList_SVC: Technical error ' + error.getMessage());
            }
        }
	}

    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to execute a SOQL Query after having prepared the where clauses.
    ***/
    @TestVisible
    private List<Object> executeSOQL(final String queryConfig,  Map<Object,Object> context) {
        System.debug('executeSOQL: START');

        System.debug(LoggingLevel.FINE,'executeSOQL: preparing SOQL query string');
        String mergedQuery = sfpegList_CTL.mergeQuery(queryConfig, context, sfpegList_CTL.CONFIG.BypassEscaping__c);
        System.debug(LoggingLevel.FINE,'executeSOQL: SOQL query merged ' + mergedQuery);

        System.debug('executeSOQL: END / triggering SOQL mergedQuery');
        return sfpegList_CTL.executeSoql(mergedQuery, sfpegList_CTL.CONFIG.BypassSharing__c, sfpegList_CTL.CONFIG.BypassFLS__c);
    }
}