/***
* @description  Service class to execute multiple SOQL queries and group all results
*               in a single list.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         Sept. 2023
* @see          sfpegListQuery_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2023 pegros
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

@SuppressWarnings('PMD.ClassNamingConventions,PMD.FieldNamingConventions')
public with sharing class sfpegMultiQueries_SVC extends sfpegListQuery_SVC {
    
    /***
    * @description  Override of the standard getdata() method to execute multiple queries
    *               and group all results in a single list, each record getting a "Query"
    *               property providing the name of the query having retrieved it.
    *               Configuration of the set of SOQL queries is retrieved from the
    *               sfpegList metadata triggering its execution (via the sfpegList_CTL.CONFIG
    *               static property).
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START sfpegMultiQueries_SVC implementation');
        System.debug('getData: context provided ' + context);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;

        Map<String,Object> queryConfig = getConfig();
        System.debug('getData: configuration fetched ' + queryConfig);

        List<Object> results = new List<Object>();
        try {
            for (String iter : queryConfig.keySet()) {
                System.debug('getData: processing query ' + iter);
                String iterQuery = (String) (queryConfig.get(iter));

                List<Object> iterList = executeSOQL(iterQuery ,contextMap);
                System.debug('getData: data fetched with #items ' + iterList.size());

                iterList = (List<Object>) (JSON.deserializeUntyped(JSON.serialize(iterList)));
                for (Object iterObj : iterList) {
					Map<String,Object> iterMap = ((Map<String,Object>)iterObj);
					iterMap.put('Query',iter);
					iterMap.remove('attributes');
				}
                System.debug('getData: data reworked ' + iterList.size());

                results.addAll(iterList);
            }
            System.debug('getData: all queries processed');
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'getData: END KO / ' + error.getMessage());
            throw new AuraHandledException('SOQL Query failure: ' + error.getMessage());
        }

        String orderByField = sfpegList_CTL.CONFIG.QueryOrderBy__c;
        System.debug('getData: orderByField specified ' + orderByField);
        if (String.isNotBlank(orderByField)) {
            System.debug('getData: sorting results by ' + orderByField + ' ' + sfpegList_CTL.CONFIG.QueryOrder__c);
            try {
                results.sort(new FieldComparator(orderByField, sfpegList_CTL.CONFIG.QueryOrder__c));
            }
            catch (Exception error) {
                System.debug(LoggingLevel.WARN,'getData: END KO / sort failed - ' + error.getMessage());
                throw new AuraHandledException('SOQL Query sort failure: ' + error.getMessage());
            }
        }

        System.debug('getData: END sfpegMultiQueries_SVC implementation with #Items ' + results.size());
        return results;
    }


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Comparator that sorts List<Object> entries (each a Map<String,Object>) by a
    *               given field name. Supports String, Boolean, Integer, Long, Decimal/Double,
    *               and ISO-8601 Date/Datetime strings. Nulls always sort last regardless of direction.
    ***/
    @TestVisible
    private class FieldComparator implements Comparator<Object> {
        private final String field;
        private final Integer directionFactor; // 1 = ASC, -1 = DESC

        public FieldComparator(String field, String order) {
            this.field = field;
            this.directionFactor = ('DESC' == order) ? -1 : 1;
        }

        public Integer compare(Object a, Object b) {
            Object valA = ((Map<String,Object>) a).get(field);
            Object valB = ((Map<String,Object>) b).get(field);

            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;   // nulls last regardless of direction
            if (valB == null) return -1;

            return directionFactor * compareValues(valA, valB);
        }

        private Integer compareValues(Object a, Object b) {
            if (a instanceof Boolean) {
                Boolean bA = (Boolean) a, bB = (Boolean) b;
                return bA == bB ? 0 : (bA ? 1 : -1);
            }
            if (a instanceof Integer) {
                Integer iA = (Integer) a, iB = (Integer) b;
                return iA > iB ? 1 : (iA < iB ? -1 : 0);
            }
            if (a instanceof Long) {
                Long lA = (Long) a, lB = (Long) b;
                return lA > lB ? 1 : (lA < lB ? -1 : 0);
            }
            if (a instanceof Decimal) {
                Decimal dA = (Decimal) a, dB = (Decimal) b;
                return dA > dB ? 1 : (dA < dB ? -1 : 0);
            }
            if (a instanceof Double) {
                Double dA = (Double) a, dB = (Double) b;
                return dA > dB ? 1 : (dA < dB ? -1 : 0);
            }
            // String, Date and Datetime values from JSON.deserializeUntyped are all Strings;
            // ISO-8601 lexicographic ordering is equivalent to chronological ordering.
            String sA = String.valueOf(a);
            String sB = String.valueOf(b);
            return sA.compareTo(sB);
        }
    }


    /***
    * @description  Private utility method to fetch the complex SOSL/SOQL query configuration for
    *               the current sfpegList__mdt record (assumed to be set in the QuerySOQL__c field).
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