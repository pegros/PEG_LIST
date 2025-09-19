/***
* @description  Service class to execute a series of dependent SOQL queries and leverage
*               their output as for criteria of a main SOQL query.
*               This enables to work-around limitations of SOQL sub-queries (e.g. when
*               querying multiple times on the same object).
*               Part of the PEG_LIST package extensions.
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

public with sharing class sfpegDependentQueries_SVC extends sfpegListQuery_SVC {
    
    /***
    * @description  Override of the standard getdata() method to execute multiple SOQL queries
    *               and leverage their outputs as context for a main SOQL query.
    *               property providing the name of the query having retrieved it.
    *               Configuration of the set of SOQL queries is retrieved from the
    *               sfpegList metadata triggering its execution (via the sfpegList_CTL.CONFIG
    *               static property).
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START sfpegDependentQueries_SVC implementation');
        System.debug('getData: context provided ' + context);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;
        if (contextMap == null) contextMap = new Map<Object,Object>();

        Map<String,Object> queryConfig = getConfig();
        System.debug('getData: configuration fetched ' + queryConfig);

        // Step #1 - executing subqueries
        try {
            Map<String,Object> subQueries = (Map<String,Object>) queryConfig.get('subqueries');
            System.debug('getData: processing subqueries ' + subQueries?.keySet());

            for (String iter : subQueries.keySet()) {
                System.debug('getData: processing subquery ' + iter);
                Map<String,Object> iterConfig = (Map<String,Object>) (subQueries.get(iter));
                String iterField = (iterConfig.containsKey('field') ? (String) (iterConfig.get('field')) : 'Id');
                System.debug('getData: key field fetched ' + iterField);
                String iterQuery = (String) (iterConfig.get('query'));
                System.debug('getData: template fetched ' + iterQuery);

                List<Object> iterList = executeSOQL(iterQuery ,contextMap);
                System.debug('getData: data fetched with #items ' + iterList.size());

                iterList = (List<Object>) (JSON.deserializeUntyped(JSON.serialize(iterList)));
                List<String> valueList = new List<String>();
                for (Object iterObj : iterList) {
                    Map<String,Object> iterMap = ((Map<String,Object>)iterObj);
                    if (iterMap.containsKey(iterField)) {
                        valueList.add((String) iterMap.get(iterField));
                    }
				}
                System.debug('getData: data extracted ' + valueList.size());

                //String iterValue = (valueList.isEmpty() ? '\'\'' : '\'' + String.join(valueList, '\',\'') + '\'');
                String iterValue = ' LIST(((' + String.join(valueList,',') + '|||,)))';
                System.debug('getData: query value init ' + iterValue);

                contextMap.put(iter,iterValue);
            }
            System.debug('getData: all subqueries processed');
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'getData: END KO / subquery failed: ' + error.getMessage());
            throw new AuraHandledException('SOQL subQuery failure: ' + error.getMessage());
        }
        System.debug('getData: subquery results added in context ' + contextMap);

        // Step #1 - executing subqueries
        List<Object> results;
        try {
            String mainQuery = (string) queryConfig.get('query');
            System.debug('getData: processing main query ' + mainQuery);

            results = executeSOQL(mainQuery ,contextMap);
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'getData: END KO / main query failed: ' + error.getMessage());
            throw new AuraHandledException('SOQL Query failure: ' + error.getMessage());
        }
        System.debug('getData: END sfpegDependentQueries_SVC implementation with #Items ' + results.size());
        return results;
    }


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to fetch the complex SOSL/SOQL query configuration for a given
    *               sfpegList__mdt name (assumed to be set in the QuerySOQL__c field).
    ***/
    @TestVisible
    private Map<String,Object> getConfig() {
        System.debug('getConfig: START');

        sfpegList__mdt config = sfpegList_CTL.CONFIG;
        System.debug('getConfig: configuration retrieved ' + config);

        Map<String,Object> configMap;
        try {
            configMap = (Map<String,Object>) (JSON.deserializeUntyped(config.QuerySOQL__c));
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'getConfig: END KO / configuration parsing failed');
            throw new StringException('Invalid configuration for complex SOSL/SOQL query');
        }
        System.debug('getConfig: configuration parsed ' + configMap);

        System.debug('getConfig: END');
        return configMap;
    }

    /***
    * @description  Private utility method to execute a SOQL Query after having prepared the WHERE clauses.
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