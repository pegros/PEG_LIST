/***
* @description  Service class to retrieve data via a REST callout requests.
* @date         Sept. 2022
* @see          sfpegListQuery_SVC
***/

public with sharing class sfpegRestCallout_SVC extends sfpegListQuery_SVC {

    /***
    * @description  regex patterns to extract context tokens.
    ***/
    static final Pattern TOKEN_PATTERN = Pattern.compile('\\{\\{\\{(\\w+)\\}\\}\\}');

    /***
    * @description  Override of the standard getdata() method to execute a query.
    *               It executes a SAQL query via a callout to the Wave API.
    *               The name of the dataset should be provided in the "input"
    *               parameter via the "TCRM_DATASET" property and a "{{{TCRM_DATASET}}}"
    *               merge token present in the SAQL query template identified via 
    *               the query parameter
    ***/
    public override List<Object> getData(final Object context, final String requestName) {
        System.debug('getData: START sfpegRestCallout_SVC implementation');
        System.debug('getData: context provided ' + context);
        System.debug('getData: request name provided ' + requestName);
        Map<Object,Object> contextMap = (Map<Object,Object>) context;

        // Request configuration fetch
        if (String.isBlank(requestName)) {
            System.debug(LoggingLevel.Error,'getData: END KO / missing request name in Apex configuration');
            throw new DmlException('Missing request name in REST Callout configuration');
        }
        Map<String,Object> requestConfig = getConfig(requestName);
        System.debug('getData: requestConfig fetched ' + requestConfig);

        // Request finalization
        HttpRequest calloutRequest = prepareRequest(requestConfig,contextMap);
        System.debug('getData: request prepared ' + calloutRequest);

        // SAQL query execution
        List<Object> results = doCallout(requestConfig,calloutRequest);
        System.debug('getData: END returning #items = ' + results.size());
        return results;
    }


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to fetch the REST Callout configuration for a given
    *               sfpegList__mdt name (assumed to be set in the QuerySOQL__c field) 
    ***/
    private Map<String,Object> getConfig(final String requestName) {
        System.debug('getConfig: START for ' + requestName);

        sfpegList__mdt config;
        try {
            config = [ SELECT QuerySOQL__c FROM sfpegList__mdt WHERE DeveloperName = :requestName limit 1];
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'getConfig: END KO / configuration not found for ' + requestName);
            throw new StringException('Configuration not found for REST callout ' + requestName);
        }
        System.debug('getConfig: configuration found ' + config);

        Map<String,Object> configMap;
        try {
            configMap = (Map<String,Object>) (JSON.deserializeUntyped(config.QuerySOQL__c));
        }
        catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'getConfig: END KO / configuration parsing failed for ' + requestName);
            throw new StringException('Invalid configuration for REST callout ' + requestName);
        }
        System.debug('getConfig: configuration parsed ' + configMap);

        System.debug('getTemplate: END');
        return configMap;
    }


    /***
    * @description  Private utility method to prepare the HTTP request and merge all requested context data
    ***/
    private HttpRequest prepareRequest(final Map<String,Object> requestConfig, final Map<Object,Object> context) {
        System.debug('prepareRequest: START');
        HttpRequest request = new HttpRequest();

        // setting endpoint
        String endPoint = (string) requestConfig.get('endPoint'); // e.g. 'callout:Tableau_CRM/query'
        if (String.isBlank(endPoint)) {
            System.debug(LoggingLevel.Error,'prepareRequest: END KO / Missing endpoint in REST Callout configuration');
            throw new StringException('Missing endpoint in REST Callout configuration');
        }
        request.setEndpoint(mergeContext(endPoint,context));
        System.debug(LoggingLevel.FINE,'prepareRequest: endpoint set');

        // setting header
        String header = (string) requestConfig.get('header'); // e.g. {'Content-Type':'application/json;charset=UTF-8'}
        if (String.isBlank(header)) {
            System.debug(LoggingLevel.Error,'prepareRequest: END KO / Missing header in REST Callout configuration');
            throw new StringException('Missing header in REST Callout configuration');
        }
        try {
            Map<String,Object> headerData = (Map<String,Object>) (JSON.deserializeUntyped(mergeContext(header,context)));
            for (String iter : headerData.keySet()) {
                System.debug(LoggingLevel.FINE,'prepareRequest: setting header ' + iter);
                request.setHeader(iter, (String)(headerData.get(iter)));
            }
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error,'prepareRequest: END KO / Header configuration parsing failed ' + e.getMessage());
            throw new StringException('Parsing of header configured for REST Callout failed');
        }
        System.debug(LoggingLevel.FINE,'prepareRequest: header set');

        // setting header
        String method = (string) requestConfig.get('method'); // e.g. 'GET'
        if (String.isBlank(method)) {
            System.debug(LoggingLevel.Error,'prepareRequest: END KO / Missing method in REST Callout configuration');
            throw new StringException('Missing method in REST Callout configuration');
        }
        request.setMethod(mergeContext(method,context));
        System.debug(LoggingLevel.FINE,'prepareRequest: header set');

        // setting body
        String body = (string) requestConfig.get('body'); // e.g. '{"query":"select Name, Status from Account limit 10"}'
        if (String.isNotBlank(body)) {
            request.setBody(mergeContext(body,context));
            System.debug(LoggingLevel.FINE,'prepareRequest: body set');
        }

        System.debug('prepareRequest: END with  ' + request);
        return request;
    }

    /***
    * @description  Private utility method to replace context tokens within a string template
    ***/
    private String mergeContext(final String template, Map<Object,Object> context) {
        System.debug('mergeContext: START with ' + template);
        System.debug('mergeContext: and context ' + context);
        HttpRequest request = new HttpRequest();

        String mergedString = template;
        Matcher tokenMatcher = TOKEN_PATTERN.matcher(template);
        while (tokenMatcher.find()) {
            System.debug(LoggingLevel.FINE,'mergeContext: processing match ' + tokenMatcher.group(0));

            String contextData = (String) (context.get(tokenMatcher.group(1)));
            System.debug(LoggingLevel.FINE,'mergeContext: context value fetched ' + contextData);

            if (contextData != null) {
                System.debug(LoggingLevel.WARN,'mergeContext: context value found --> replacing ' + tokenMatcher.group(1));
                mergedString = mergedString.replace(tokenMatcher.group(0),contextData);
            }
            else {
                System.debug(LoggingLevel.WARN,'mergeContext: no context value found --> ignoring ' + tokenMatcher.group(1));
            }
        }
        System.debug('mergeContext: END / returning ' + mergedString);
        return mergedString;
    }
    
    /***
    * @description  Private utility method to execute a SAQL query
    ***/
    private List<Object> doCallout(final Map<String,Object> requestConfig, final HttpRequest request) {
        System.debug('doCallout: START');

        Http http = new Http();
        HTTPResponse response;
        try {
            response = http.send(request);
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