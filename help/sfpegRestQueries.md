# ![Logo](/media/Logo.png) &nbsp; **sfpegRestQueries_SVC** Query Extension

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
This feature is new and not available in the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.

## Introduction

The **sfpegRestQueries_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)**
component capabilities. It basically enables to execute a REST callout to an external endpoint
to fetch a list of records.

Typical use case is to fetch contextualised detailed information available in an external system and display
it as a related list in a record page.

## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to
get more general information about the way the included components may be configured.

This Apex class may be leveraged within standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration.
In order to use it, the `sfpegList` metadata record should be configured as follows:

- `Query Type` should be set to `Apex`
- `Query Class` should be set to `sfpegRestQueries_SVC`
- `Query Template` should contain a JSON object with the following properties
  - `endPoint` providing the endpoint URL to which the request should be sent,
    possibly leveraging _named credentials_
  - `header` with the list of parameters to set in the request header such as
    the expected `Content-Type`
  - `method` with the HTTP request method, `GET` being the usual value
  - `body` (optional) to provide a JSON bodu to the HTTP request (e.g. in case of `PUT`request)
  - `resultField` (optional) to handle cases where the list of results is not directly
    provided in the HTTP response body (as a JSON list) but embedded in a main JSON Object
    and available in one of its fields (e.g. as in the the standard Salesforce REST API results)

ℹ️ Context merge is applied to the whole `Query Template` value, enabling to customise the
endpoint URL (e.g. with the current record ID) or the request body.

⚠️ Please pay attention to the `Bypass Escaping` which should preferably remain unchecked
to ensure better protection against _code injection_.

## Configuration Example

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in an **Account** record page
providing **Opportunity** records corresponding to the Account with a same Global ID in another Org.

It relies on the `RemoteSF` named credential to handle the endpoint URL and authentication, the configuration
of which is not detailed here.

For this result, the **sfpegList** metadata record should be configured as follows:

- `Scope`set to `Account`
- `Query Type`set to `Apex`
- `Query Input` set to

```
{
    "GID":"{{{RCD.GlobalId__c}}}",
    "LIMIT":"10"
}
```

- `Query Class` set to `sfpegRestQueries_SVC`
- `Query Template` set to

```
{
    "endPoint":"callout:RemoteSF/services/data/v65.0/query/?q=SELECT+Name,Id,StageName,CreatedDate,Owner.Name,OwnerId+from+Opportunity+where+Account.GlobalAccount__c+=+'{{{GID}}}'+limit+{{{LIMIT}}}",
    "header":{"Content-Type":"text/xml/json;charset=UTF-8"},
    "method":"GET",
    "resultField":"records"
}
```

- `Display Type` set to `DataTable`
- `Flatten Results?` set to `true`
- `Display Configuration` set to

```
{
    "keyField":"Id",
    "widthMode":"auto",
    "hideCheckboxColumn": true,
    "columns": [
        {"label":"Name", "fieldName": "Name", "sortable": "true", "initialWidth": 250},
        { "label": "Stage", "fieldName": "StageName", "sortable": true},
        { "label": "Creation", "fieldName": "CreatedDate", "sortable": true, "type":"date"},
        { "label": "Owner", "fieldName": "Owner.Name", "sortable": true}
    ]
}
```

## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class.
This means that pagination is (currently) not supported.

It relies on the standard **[http](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_restful_http_http.htm)** Apex class to manage REST callouts.

This class comes with its dedicated **sfpegRestQueries_TST** test class.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more global information about the way the components have been implemented.
