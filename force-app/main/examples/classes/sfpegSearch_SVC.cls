/***
* @description  Service class to retrieve data via SOSL or SOQL
*               with dynamic query filters.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         April 2023
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

public with sharing class sfpegSearch_SVC extends sfpegListQuery_SVC {

    /***
    * @description  regex patterns to extract context tokens.
    ***/
    static final Pattern TOKEN_PATTERN = Pattern.compile('\\{\\{\\{(\\w+)\\}\\}\\}');

    /***
    * @description  Override of the standard getdata() method to execute a query.
    *               It executes a SOSL or SOQL query depending on the query configuration
    *               and search term provided in the context.
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START sfpegSearch_SVC implementation');
        System.debug('getData: context provided ' + context);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;

        Map<String,Object> queryConfig = getConfig();
        System.debug('getData: configuration fetched ' + queryConfig);

        if (queryConfig.containsKey('sosl')) {
            System.debug('getData: evaluating SOSL');
            Map<String,Object> soslConfig = (Map<String,Object>) queryConfig.get('sosl');
            System.debug('getData: soslConfig fetched ' + soslConfig);

            if (soslConfig.containsKey('term')) {
                System.debug('getData: evaluating SOSL trigger based on ' + soslConfig.get('term'));

                String soslTerm = (String) contextMap.get(soslConfig.get('term'));
                System.debug('getData: provided context search term ' + soslTerm);

                if (	(String.isNotBlank(soslTerm))
                    &&	(	(soslTerm.length() > 2)
                         || ((soslTerm.length() == 2) && !(soslTerm.endsWith('*') || soslTerm.endsWith('?'))))) {
                    System.debug('getData: END / launching SOSL search');
                    return executeSOSL((Map<String,Object>)soslConfig,contextMap,soslTerm);
                }
                else if (queryConfig.containsKey('soql')) {
                    System.debug('getData: END / launching SOQL query as fallback to SOSL search with no term set');
                    return executeSOQL((Map<String,Object>)queryConfig.get('soql'),contextMap);
                }
                else {
                    System.debug('getData: END / returning empty SOSL results');
                    return null;
                }
            }
            else {
                System.debug(LoggingLevel.Error,'getData: END KO / missing "term" parameter in "sosl" section');
                throw new DmlException('Missing "term" parameter in "sosl" section of Complex SOSL/SOQL configuration');
            }
        }
        else if (queryConfig.containsKey('soql')) {
            System.debug('getData: END OK / launching SOQL query');
            return executeSOQL((Map<String,Object>)queryConfig.get('soql'),contextMap);
        }
        else {
            System.debug(LoggingLevel.Error,'getData: END KO / missing "sosl" or "soql" section in query configuration');
            throw new DmlException('Missing "sosl" or "soql" section in Complex SOSL/SOQL configuration');
        }
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
    * @description  Private utility method to execute a SOSL Query after having prepared the where clauses.
    ***/
    @TestVisible
    private List<Object> executeSOSL(final Map<String,Object> searchConfig, Map<Object,Object> context, final String term) {
        System.debug('executeSOSL: START  with term ' + term);

        if (!searchConfig.containsKey('search')) {
            System.debug(LoggingLevel.WARN,'executeSOQL: END KO / Missing "search" property in the "sosl" section');
            throw new AuraHandledException('Missing "search" property in "sosl" section of Complex SOSL/SOQL configuration');
        }

        String queryString = (String)searchConfig.get('search');
        System.debug(LoggingLevel.FINE,'executeSOSL: raw search string fetched ' + queryString);

        if (searchConfig.containsKey('where')) {
            System.debug('executeSOSL: building WHERE clause');
            Map<String,Object> whereClause = (Map<String,Object>) searchConfig.get('where');
            for (String iter : whereClause.keySet()) {
                System.debug('executeSOSL: processing WHERE clause ' + iter);
                String iterClause = buildWhere((Map<String,Object>)whereClause.get(iter),context);
                System.debug('executeSOSL: WHERE clause init ' + iterClause);
                iterClause = ((iterClause == null) ? '' : 'WHERE ' + iterClause);
                String iterToken  = '{{{' + iter + '}}}';
                System.debug('executeSOSL: clause token init ' + iterToken);
                queryString = queryString.replace(iterToken,iterClause);
            }
            System.debug('executeSOSL: context updated ' + context);
        }
        else {
            System.debug('executeSOSL: no WHERE clause build required');
        }
        System.debug(LoggingLevel.FINE,'executeSOSL: clauses replaced in SOSL search ' + queryString);

        String mergedSearch = sfpegList_CTL.mergeQuery(queryString, context, sfpegList_CTL.CONFIG.BypassEscaping__c);
        System.debug(LoggingLevel.FINE,'executeSOSL: SOSL search merged ' + mergedSearch);

        try {
            System.debug('executeSOSL: END / triggering SOSL mergedSearch');
            return sfpegList_CTL.executeSosl(mergedSearch, sfpegList_CTL.CONFIG.BypassSharing__c, sfpegList_CTL.CONFIG.BypassFLS__c);
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'executeSOSL: END KO / ' + error.getMessage());
            throw new AuraHandledException('SOSL Search failure: ' + error.getMessage());
        }
    }

    /***
    * @description  Private utility method to execute a SOQL Query after having prepared the where clauses.
    ***/
    @TestVisible
    private List<Object> executeSOQL(final Map<String,Object> queryConfig,  Map<Object,Object> context) {
        System.debug('executeSOQL: START');

        if (!queryConfig.containsKey('select')) {
            System.debug(LoggingLevel.WARN,'executeSOQL: END KO / Missing "select" property in the "soql" section');
            throw new AuraHandledException('Missing "select" property in "soql" section of Complex SOSL/SOQL configuration');
        }

        String queryString = (String)queryConfig.get('select');
        System.debug(LoggingLevel.FINE,'executeSOQL: raw search string fetched ' + queryString);

        if (queryConfig.containsKey('where')) {
            System.debug('executeSOQL: building WHERE clause');
            Map<String,Object> whereClause = (Map<String,Object>) queryConfig.get('where');
            for (String iter : whereClause.keySet()) {
                System.debug('executeSOQL: processing WHERE clause ' + iter);
                String iterClause = buildWhere((Map<String,Object>)whereClause.get(iter),context);
                System.debug('executeSOQL: WHERE clause init ' + iterClause);
                iterClause = ((iterClause == null) ? '' : 'WHERE ' + iterClause);
                String iterToken  = '{{{' + iter + '}}}';
                System.debug('executeSOSL: clause token init ' + iterToken);
                queryString = queryString.replace(iterToken,iterClause);
            }
            System.debug('executeSOQL: context updated ' + context);
        }
        else {
            System.debug('executeSOQL: no WHERE clause build required');
        }
        System.debug(LoggingLevel.FINE,'executeSOQL: clauses replaced in SOSL search ' + queryString);

        String mergedQuery = sfpegList_CTL.mergeQuery(queryString, context, sfpegList_CTL.CONFIG.BypassEscaping__c);
        System.debug(LoggingLevel.FINE,'executeSOQL: SOQL query merged ' + mergedQuery);

        try {
            System.debug('executeSOQL: END / triggering SOQL mergedQuery');
            return sfpegList_CTL.executeSoql(mergedQuery, sfpegList_CTL.CONFIG.BypassSharing__c, sfpegList_CTL.CONFIG.BypassFLS__c);
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'executeSOQL: END KO / ' + error.getMessage());
            throw new AuraHandledException('SOQL Query failure: ' + error.getMessage());
        }
    }
    
    /***
    * @description  Private utility method to build a dynamic WHERE clause
    ***/
    @TestVisible
    private String buildWhere(final Map<String,Object> whereClause, final Map<Object,Object> context) {
        System.debug('buildWhere: START');

        if (whereClause.size() != 1) {
            System.debug(LoggingLevel.WARN,'buildWhere: END KO / Bad "where" parameter in ' + whereClause);
            throw new AuraHandledException('Bad "where" parameter in Complex SOSL/SOQL configuration');
        }

        String type;
        for (String iter : whereClause.keySet()) {type = (String) iter;}
        System.debug('buildWhere: processing condition type ' + type);

        switch on type {
            when 'RAW' {
                System.debug('buildWhere: processing RAW type');
                String condition = (String) whereClause.get(type);
                System.debug('buildWhere: END / returning condition');
                return '(' + condition + ')';
            }
            when 'LK' {
                System.debug('buildWhere: processing LK type');
                Map<String,Object> conditionMap = (Map<String,Object>) whereClause.get(type);
                String fieldName = (String) conditionMap.get('field');
                Boolean fieldNot = (Boolean) conditionMap.get('not');
                String fieldValue = getValue(conditionMap,context);
                if (String.isNotBlank(fieldValue)) {
                    if (fieldNot == true) {
                        System.debug('buildWhere: END / returning NOT condition');
                        return '(NOT(' + fieldName + ' LIKE \'' + fieldValue + '%\'))';
                    }
                    else {
                        System.debug('buildWhere: END / returning condition');
                        return '(' + fieldName + ' LIKE \'' + fieldValue + '%\')';
                    }
                }
                else {
                    System.debug('buildWhere: END / ignoring condition');
                    return null;
                }
            }
            when 'EQ' {
                System.debug('buildWhere: processing EQ type');
                Map<String,Object> conditionMap = (Map<String,Object>) whereClause.get(type);
                String fieldName = (String) conditionMap.get('field');
                Boolean fieldNot = (Boolean) conditionMap.get('not');
                String fieldValue = getValue(conditionMap,context);
                if (String.isNotBlank(fieldValue)) {
                    System.debug('buildWhere: END / returning condition');
                    return '(' + fieldName + (fieldNot == true ? ' != \'' : ' = \'') + fieldValue + '\')';
                }
                else {
                    System.debug('buildWhere: END / ignoring condition');
                    return null;
                }
            }	
            when 'IN' {
                System.debug('buildWhere: processing IN type');
                Map<String,Object> conditionMap = (Map<String,Object>) whereClause.get(type);
                String fieldName = (String) conditionMap.get('field');
                Boolean fieldNot = (Boolean) conditionMap.get('not');
                String fieldValue = getValue(conditionMap,context);
                if (String.isNotBlank(fieldValue)) {
                    System.debug('buildWhere: returning condition on ' + fieldValue);
                    /*List<String> values = fieldValue.split(';');
                    System.debug('buildWhere: values split ' + values);
                    System.debug('buildWhere: values condition ' + String.join(values,'\',\''));
                    System.debug('buildWhere: fieldNot ' + fieldNot);
                    System.debug('buildWhere: fieldNot confition ' + (fieldNot == true ? ' NOT IN (\'' : ' IN (\''));
                    System.debug('buildWhere: END / resulting in ' + '(' + fieldName + (fieldNot == true ? ' NOT IN (\'' : ' IN (\'') + String.join(values,'\',\'') + '\'))');*/
                    System.debug('buildWhere: END / resulting in ' + '(' + fieldName + (fieldNot == true ? ' NOT IN LIST(((' : ' IN LIST(((') + fieldValue + '|||;))) )');
                    //return '(' + fieldName + (fieldNot == true ? ' NOT IN (\'' : ' IN (\'') + String.join(values,'\',\'') + '\'))';
                    return '(' + fieldName + (fieldNot == true ? ' NOT IN LIST(((' : ' IN LIST(((') + fieldValue + '|||;))) )';
                }
                else {
                    System.debug('buildWhere: END / ignoring condition');
                    return null;
                }
            }
            when 'INCL' {
                System.debug('buildWhere: processing INCL type');
                Map<String,Object> conditionMap = (Map<String,Object>) whereClause.get(type);
                String fieldName = (String) conditionMap.get('field');
                Boolean fieldNot = (Boolean) conditionMap.get('not');
                String fieldValue = getValue(conditionMap,context);
                if (String.isNotBlank(fieldValue)) {
                    System.debug('buildWhere: END / returning condition on ' + fieldValue);
                    List<String> values = fieldValue.split(';');
                    //return '(' + fieldName + (fieldNot == true ? ' EXCLUDES (\'' : ' INCLUDES (\'') + String.join(values,'\',\'') + '\'))';
                    return '(' + fieldName + (fieldNot == true ? ' EXCLUDES LIST(((' : ' INCLUDES LIST(((') + fieldValue + '|||;))) )';
                }
                else {
                    System.debug('buildWhere: END / ignoring condition');
                    return null;
                }
            }
            when 'OR' {
                System.debug('buildWhere: processing OR type');
                List<Object> conditionList = (List<Object>) whereClause.get(type);

                List<String> subConditions = new List<String>();
                for (Object iter : conditionList) {
                    System.debug('buildWhere: processing subcondition ' + iter);
                    String iterCondition = buildWhere((Map<String,Object>)iter,context);
                    if (String.isNotEmpty(iterCondition)) {
                        System.debug('buildWhere: registering subcondition ' + iterCondition);
                        subConditions.add(iterCondition);
                    }
                    else {
                        System.debug('buildWhere: subcondition ignored');
                    }
                }
                if (subConditions.isEmpty()) {
                    System.debug('buildWhere: END / ignoring OR condition (no sub-conditions)');
                    return null;
                }
                else {
                    System.debug('buildWhere: END / grouping OR sub-conditions');
                    return '(' + String.join(subConditions,') OR (') + ')';
                }
            }
            when 'AND' {
                System.debug('buildWhere: processing AND type');
                List<Object> conditionList = (List<Object>) whereClause.get(type);

                List<String> subConditions = new List<String>();
                for (Object iter : conditionList) {
                    System.debug('buildWhere: processing subcondition ' + iter);
                    String iterCondition = buildWhere((Map<String,Object>)iter,context);
                    System.debug('buildWhere: subcondition build ' + iterCondition);
                    if (String.isNotEmpty(iterCondition)) {
                        System.debug('buildWhere: registering subcondition ' + iterCondition);
                        subConditions.add(iterCondition);
                    }
                    else {
                        System.debug('buildWhere: subcondition ignored');
                    }
                    System.debug('buildWhere: subConditions updated ' + subConditions);
                }
                if (subConditions.isEmpty()) {
                    System.debug('buildWhere: END / ignoring AND condition (no sub-conditions)');
                    return null;
                }
                else {
                    System.debug('buildWhere: END / grouping AND sub-conditions');
                    return '(' + String.join(subConditions,') AND (') + ')';
                }
            }
            when else {
                System.debug(LoggingLevel.WARN,'buildWhere: END KO / Unsupported "where" type in ' + whereClause);
                throw new AuraHandledException('Unsupported "where" parameter in Complex SOSL/SOQL configuration');
            }
        }
    }

    /***
    * @description  Private utility method to get the value for a condition either from context or from set value.
    ***/
    @TestVisible
    private String getValue(final Map<String,Object> condition, final Map<Object,Object> context) {
        System.debug('getValue: START');

        if (condition.containsKey('context')) {
            String fieldName = (String) condition.get('context');
            System.debug('getValue: searching context field ' + fieldName);
            String fieldValue = (String) context.get(fieldName);
            if (!String.isEmpty(fieldValue)) {
                System.debug('getValue: END / returning context value ' + fieldValue);
                return '{{{' + fieldName + '}}}';
            }
        }

        if (condition.containsKey('value')) {
            String fieldValue = (String) condition.get('value');
            System.debug('getValue: END / returning default value ' + fieldValue);
            return fieldValue;
        }

        System.debug('getValue: END / returning no value');
        return null;
    }
}