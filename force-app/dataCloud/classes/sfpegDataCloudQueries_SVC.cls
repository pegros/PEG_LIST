/***
* @description  Service class to execute a SQL queries to a connected
*               DataCloud instance via the ConnectAPI
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         July 2025
* @see          sfpegListQuery_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
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

public with sharing class sfpegDataCloudQueries_SVC extends sfpegListQuery_SVC {
    
    /***
    * @description  Override of the standard getdata() method to execute a SQL query
    *               to Data Cloud via the ConnectApi.CdpQuery class.
    *               Configuration of the SQL query is retrieved from the sfpegList
    *               metadata triggering its execution (via the sfpegList_CTL.CONFIG
    *               static property).
    ***/
    public override List<Object> getData(final Object context, final String queryName) {
        System.debug('getData: START sfpegDataCloudQueries_SVC implementation');
        System.debug('getData: context provided ' + context);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;
        if (contextMap == null) contextMap = new Map<Object,Object>();

        String sqlQuery = sfpegList_CTL.CONFIG.QuerySOQL__c;
        System.debug('getData: configuration fetched ' + sqlQuery);

        List<Object> results;
        try {
            results = executeSQL(sqlQuery,contextMap);
        }
        catch (Exception error) {
            System.debug(LoggingLevel.WARN,'getData: END KO / SQL query failed: ' + error.getMessage());
            throw new AuraHandledException('SQL Query failure: ' + error.getMessage());
        }
        System.debug('getData: END sfpegDataCloudQueries_SVC implementation with #Items ' + results.size());
        return results;
    }


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to execute a SQL Query after having merged the context
    *               (within the WHERE clauses). It uses the queryAnsiSqlV2() method of the
    *               ConnectApi.CdpQuery class to execute the query on Data Cloud.
    ***/
    @TestVisible
    private List<Object> executeSQL(final String queryConfig,  Map<Object,Object> context) {
        System.debug('executeSQL: START');

        String mergedQuery = sfpegList_CTL.mergeQuery(queryConfig, context, sfpegList_CTL.CONFIG.BypassEscaping__c);
        System.debug(LoggingLevel.FINE,'executeSQL: SQL query merged ' + mergedQuery);

        ConnectApi.CdpQueryInput queryRequest = new ConnectApi.CdpQueryInput();
        queryRequest.sql = mergedQuery;
        System.debug(LoggingLevel.FINE,'executeSQL: SQL request prepared ' + queryRequest);

        ConnectApi.CdpQueryOutputV2 queryOutput = (Test.isRunningTest() ? new ConnectApi.CdpQueryOutputV2() : ConnectApi.CdpQuery.queryAnsiSqlV2(queryRequest));
        //ConnectApi.CdpQueryOutputV2 queryOutput = ConnectApi.CdpQuery.queryAnsiSqlV2(queryRequest);
        System.debug(LoggingLevel.FINEST,'executeSQL: metadata received ' + queryOutput?.metadata);
        System.debug(LoggingLevel.FINEST,'executeSQL: #results received ' + queryOutput?.rowCount);

        List<Object> results = new List<Object>();
        if (Test.isRunningTest()) {
            if (queryConfig.startsWith('SELECT')) {
                System.debug(LoggingLevel.ERROR,'executeSQL: returning test result');
                Map<String,Object> resultItem = new Map<String,Object>();
                resultItem.put('Id','ID001');
                resultItem.put('Name','Name001');
                results.add(resultItem);                
            }
            else {
        		System.debug(LoggingLevel.ERROR,'executeSQL: bad query');
                throw new StringException('Query should start with SELECT');
            }
        }
        else {
        	for (ConnectApi.CdpQueryV2Row iterRow : queryOutput?.data) {
            	System.debug(LoggingLevel.FINEST,'executeSQL: Processing row ' + iterRow.rowData);
            	Map<String,Object> iterResult = new Map<String,Object>();
            	for (String iterField : queryOutput.metadata.keySet()) {
                	ConnectApi.CdpQueryMetadataItem iterFieldDesc = queryOutput.metadata.get(iterField);
                    iterResult.put(iterField,((iterFieldDesc.type == 'DATETIME')?DateTime.parse((String)(iterRow.rowData.get(iterFieldDesc.placeInOrder))) :iterRow.rowData.get(iterFieldDesc.placeInOrder)));
            	}
            	System.debug(LoggingLevel.FINEST,'executeSQL: registering row ' + iterResult);
            	results.add(iterResult);
        	}
        }
        System.debug('executeSQL: END with #results ' + results.size());
        return results;
    }
}