<<<<<<< HEAD
# ![Logo](/media/Logo.png) &nbsp; **sfpegSearch_SVC** Query Extension

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegSearchQueries.md).

=======
# ![Logo](/media/Logo.png) &nbsp; **sfpegSearch_SVC** Extension
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8

## Introduction

The **sfpegSearch_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to switch between a SOSL and a SOQL query depending on
whether a _search term_ is actually provided in the context (and is more than 2 characters long).
It also enables to dynamically build `WHERE` clauses based on other values actually provided in the
context.

Typical use cases is to implement a search page result list with filtering criteria, either
in an experience site leveraging LWR data bindings or embedded within a parent LWC component 
implementing a search form such as **sfpegSearchListCmp**.


## Configuration

<<<<<<< HEAD
ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

This Apex class may be leveraged within standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration.
In order to use it, the `sfpegList` metadata record should be configured as follows:
=======
Configuration relies on standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration principles.

In order to leverage this new capability, the `sfpegList` metadata record should be configured as
follows:
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
* `Query Type` should be set to `Apex`
* `Query Class` should be set to `sfpegSearch_SVC` 
* `Query Template` should contain a JSON object with the following properties
    * `sosl`: configuration of the **SOSL** query to execute, as a JSON object with
    the following sub-properties:
        * `term` with the context property name the value of which should be used as searched
        term in the `FIND` search query
        * `search` with the **SOSL** query template to execute, leveraging not only tokens 
        from the context but tokens from the `where` clauses (see below)
        * `where` with the set of clauses to be built and merged within the `search` 
        template (multiple required to cope with **SOSL** queries on multiple
        objects), as a as a JSON object with:
            * the clause merge token as property name
            * a clause structure JSON object as value (see below for details)
    * `soql`: configuration of the fallback **SOQL** query to execute, as a JSON object with
    the following sub-properties
        * `select` with the **SOQL** query template to execute, leveraging not only tokens 
        from the context but tokens from the `where` clauses (see below)
        * `where` with the set of clauses to be built and merged within the `select` 
        template, with a similar structure as for `sosl`

ℹ️ `sosl` query is executed as first option if the `term` has a length longer than 2 and
not `?` or `*` as last character.
* `soql` is optional, in which case no data is returned if `sosl` cannot be executed
* `sosl` is optional, in which case `soql` query is directly executed

⚠️ Please pay attention to the `Bypass Escaping` which should preferably remain unchecked 
to ensure better protection against _code injection_.

<<<<<<< HEAD

### Detailed Clause Configuration

The structure of a **clause** JSON object is a combination of
* structuring `AND` and `OR` JSON list properties, containing
    * sub-structuring properties (to combine `AND` and `OR` statements)
    * or unitary criteria (for individual conditions)
=======
The structure of a **clause** JSON object is a combination of
* structuring `AND` and `OR` JSON list properties, containing sub-structuring properties
or unitary criteria
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
* unitary JSON criteria of the following types:
    * `RAW` as a literal text condition string (possibly including context merge tokens)
    * `EQ` for `=` and `!=` conditions, as a JSON object with the following properties
        * `field` with the field API name evaluated in the condition (left side)
        * `context` with the  property name providing the value tested (right side)
        * `not` as a boolean to switch from `=` (_false_) to `!=` (_true_)
        * `value` with a default replacement value if context value is null
    * `IN` for `IN` and `NOT IN` conditions, as a JSON object with the following properties
        * `field` with the field API name evaluated in the condition (left side)
        * `context` with the  property name providing the value tested (right side) as
        a `;` separated value list (like a multi-picklist)
        * `not` as a boolean to switch from `IN` (_false_) to `NOT IN` (_true_)
        * `value` with a default replacement value if context value is null
    * `INCL` for multi-picklist `INCLUDES` and `EXCLUDES`conditions, as a JSON object with the following properties
        * `field` with the multi-picklist field API name evaluated in the condition (left side)
        * `context` with the  property name providing the value tested (right side) as
        a `;` separated value list (like a multi-picklist)
        * `not` as a boolean to switch from `INCLUDES` (_false_) to `EXCLUDES` (_true_)
        * `value` with a default replacement value if context value is null
<<<<<<< HEAD

ℹ️ When its value is not found (via `context` or `value`), a unitary condition is not included
in the resulting clause.

E.g. the following clause configuration
=======
When its value is not found (via `context` or `value`), a unitary condition is not included
in the resulting clause.

E.g. the following clause condifuration
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
```
{
    "CLAUSE": {
        "AND": [
<<<<<<< HEAD
          {"IN":{"field":"Region__c", "context":"REG", "value":"REG0"}},
=======
          {"IN":{"field":"Region__c", "context":"REG"}},
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
          {"INCL":{"field":"Departement__c", "context":"DPT"}},
          {"RAW":"Published__c = true"}
      ]
    }
}
```
will have different output depending on the provided Context:
* `WHERE ((Region__c IN ('REG1','REG5')) AND (Published__c = true)))`
    * with a context input as `{"REG":"REG1;REG5", "DPT":""}`
<<<<<<< HEAD
* `WHERE ((Region__c IN ('REG0') AND (Departement__c INCLUDES ('DEP2','DEP4')) AND (Published__c = true)))`
=======
* `WHERE ((Departement__c INCLUDES ('DEP2','DEP4')) AND (Published__c = true)))`
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
    * with a context input as `{"REG":"", "DPT":"DEP2;DEP4"}`


## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. 
This means that pagination is (currently) not supported.

This class comes with the **sfpegSearch_TST** test class requiring 3 test custom metadata
<<<<<<< HEAD
(**sfpegTestSearch**, **sfpegTestSearchKO**, **sfpegTestSearchKOparse**).

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.
=======
(**sfpegTestSearch**, **sfpegTestSearchKO**, **sfpegTestSearchKOparse**).
>>>>>>> e9dfa1fe1b7b8cd4d1ac37f9742a9cdfe65148a8
