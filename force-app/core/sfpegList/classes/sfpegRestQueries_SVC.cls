/***
* @description  Service class to retrieve data via REST Callout requests.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         Sept. 2025
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

@SuppressWarnings('PMD.ClassNamingConventions,PMD.FieldNamingConventions')

public with sharing class sfpegRestQueries_SVC extends sfpegListQuery_SVC {

    /***
    * @description  Override of the standard getdata() method to execute a query.
    *               It executes a callout to the REST endpoint based on the
    *               query configuration.
    ***/
    public override List<Object> getData(final Object context, final String requestName) {
        System.debug('getData: START sfpegRestQueries_SVC implementation');
        System.debug('getData: context provided ' + context);
        System.debug('getData: request name provided ' + requestName);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;

        Map<String,Object> requestConfig = getConfig(contextMap);
        System.debug('getData: configuration fetched ' + requestConfig);

        // REST Request finalization
        HttpRequest calloutRequest = prepareRequest(requestConfig);
        System.debug('getData: request prepared ' + calloutRequest);

        // REST Callout execution
        List<Object> results = doCallout(requestConfig,calloutRequest);
        System.debug('getData: END sfpegRestQueries_SVC returning #items ' + results.size());
        return results;
    }


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to fetch the REST Callout configuration for a given
    *               sfpegList__mdt name (assumed to be set in the QuerySOQL__c field) and
    *               merge the context into it.
    ***/
    private Map<String,Object> getConfig(final Map<Object,Object> context) {
        System.debug('getConfig: START with context ' + context);

        sfpegList__mdt requestConfig = sfpegList_CTL.CONFIG;
        System.debug('getConfig: configuration retrieved ' + requestConfig);

        Map<String,Object> configMap;
        try {
            System.debug(LoggingLevel.FINE,'executeSOQL: query template ' + requestConfig.QuerySOQL__c);
            String mergedConfig = sfpegList_CTL.mergeQuery(requestConfig.QuerySOQL__c, context, requestConfig.BypassEscaping__c);
            System.debug(LoggingLevel.FINE,'executeSOQL: context merged ' + mergedConfig);

            configMap = (Map<String,Object>) (JSON.deserializeUntyped(mergedConfig));
            System.debug('getConfig: configuration parsed and merged ' + configMap);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'getConfig: END KO / configuration parsing failed');
            throw new StringException('Invalid configuration for REST Callout');
        }

        System.debug('getConfig: END');
        return configMap;
    }


    /***
    * @description  Private utility method to prepare the HTTP request and merge all requested context data
    ***/
    private HttpRequest prepareRequest(final Map<String,Object> requestConfig) {
        System.debug('prepareRequest: START');
        HttpRequest request = new HttpRequest();

        // Checking configuration properties 
        String endPoint = (string) requestConfig.get('endPoint'); // e.g. 'callout:Tableau_CRM/query'
        System.debug('prepareRequest: endPoint' + endPoint);
        Object header = requestConfig.get('header'); // e.g. {'Content-Type':'application/json;charset=UTF-8'}
        System.debug('prepareRequest: header ' + header);
        String method = (string) requestConfig.get('method'); // e.g. 'GET'
        System.debug('prepareRequest: method ' + method);

        if ((String.isBlank(endPoint)) || (header == null) || (String.isBlank(method))){
            System.debug(LoggingLevel.Error,'prepareRequest: END KO / Missing property (endpoint, header or method) in REST Callout configuration');
            throw new StringException('Missing property (endpoint, header or method) in REST Callout configuration');
        }

        // setting header
        request.setEndpoint(endPoint);
        System.debug(LoggingLevel.FINE,'prepareRequest: endpoint set');

        // setting header
        Map<String,Object> headerData = (Map<String,Object>) (header);
        for (String iter : headerData.keySet()) {
            System.debug(LoggingLevel.FINE,'prepareRequest: setting header ' + iter);
            request.setHeader(iter, (String)(headerData.get(iter)));
        }
        System.debug(LoggingLevel.FINE,'prepareRequest: header set');

        // setting header
        request.setMethod(method);
        System.debug(LoggingLevel.FINE,'prepareRequest: method set');

        // setting body
        String body = (string) requestConfig.get('body'); // e.g. '{"query":"select Name, Status from Account limit 10"}'
        if (String.isNotBlank(body)) {
            request.setBody(body);
            System.debug(LoggingLevel.FINE,'prepareRequest: body set');
        }

        System.debug('prepareRequest: END with  ' + request);
        return request;
    }

    
    /***
    * @description  Private utility method to execute a SAQL query
    ***/
    private List<Object> doCallout(final Map<String,Object> requestConfig, final HttpRequest request) {
        System.debug('doCallout: START');

        Http http = new Http();
        HTTPResponse response;
        
        try {
            if (Test.isRunningTest()) {
                System.debug('doCallout: using test result');
                response = new HttpResponse();
                response.setStatusCode(200);
                response.setBody( sfpegList_CTL.CONFIG.QueryCount__c);
            }
            else {
                response = http.send(request);
            }
            while (response.getStatusCode() == 302) {
                System.debug(LoggingLevel.WARN, 'doCallout: redirecting to ' + response.getHeader('Location'));
                request.setEndpoint(response.getHeader('Location'));
                response = http.send(request);
            }
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'doCallout: END KO / callout failed ' + e.getMessage());
            throw new StringException('Callout failure: ' + e.getMessage());
        }
        System.debug('doCallout: response received ' + response);

        // (response.getStatus() != 'OK')
        if ((response.getStatusCode() < 200) || (response.getStatusCode() > 299)) {
            System.debug(LoggingLevel.ERROR,'doCallout: END KO / request execution failed' + response);
            System.debug(LoggingLevel.ERROR,'doCallout: error details ' + response.getBody());
            throw new StringException('Callout request failure: ' + response.getBody());
        }
        System.debug('doCallout: results returned ' + response.getBody());

        List<Object> results;
        String resultField = (string) requestConfig.get('resultField'); 
        System.debug('doCallout: resultField configured ' + resultField);
        if (String.isBlank(resultField)) {
            results = (List<Object>) (JSON.deserializeUntyped(response.getBody()));
            System.debug('doCallout: result list parsed ' + results);
        }
        else {
            Map<String,Object> resultMap = (Map<String,Object>) (JSON.deserializeUntyped(response.getBody()));
            System.debug('doCallout: result object parsed ' + resultMap);
            results = (List<Object>) (resultMap.get(resultField));
            System.debug('doCallout: result list extracted ' + results);
        }
        
        System.debug('doCallout: END / returning #items ' + results.size());
        return results;
    }
}