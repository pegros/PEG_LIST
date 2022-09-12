/***
* @author       P-E GROS
* @date         May 2021
* @description  Virtual handling class used by the sfpegList_CTL generic controller to
*               implement custom Apex queries.
*               Provides virtual default implementations of supported methods.
*               Default implementation throws exceptions to warn about missing implementation.
* @see          sfpegList_CTL
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2021 pegros
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
public virtual class sfpegListQuery_SVC {

    /***
    * @description  Method to overide in Apex the default SOQL query implementation of the
    *               sfpegList_CTL class.
    * @param input  Context Object record containing all the input data expected
    *               by the query.
    * @param query  Text name of the query (optional) if the same override Apex class
    *               is used to implement multiple query logics.
    * @return List<Object>  Result list of the query.
    * @exception AuraHandledException   Returned systematically by default with a warning message
    *                                   to inform that real implementation is not available.
    ***/
    public virtual List<Object> getData(final Object input, final String query) {
        System.debug(LoggingLevel.ERROR,'getData: sfpegListQuery_SVC default implementation called.');
        throw new AuraHandledException('GetData Query action not implemented!');
        //return null;
    }

    /***
    * @description  Method to overide in Apex the default SOQL implementation of the sfpegList_CTL class
    *               to fetch the total number of records in case of paginated loading of data.
    * @param input  Context Object record containing all the input data expected
    *               by the query.
    * @param query  Text name of the query (optional) if the same override Apex class
    *               is used to implement multiple query logics.
    * @return Integer   Number of records returned by the query.
    * @exception AuraHandledException   Returned systematically by default with a warning message
    *                                   to inform that real implementation is not available.
    ***/
    public virtual Integer getCount(final Object input, final String query) {
        System.debug(LoggingLevel.ERROR,'getCount: sfpegListQuery_SVC default implementation called.');
        throw new AuraHandledException('GetCount Query action not implemented!');
        //return null;
    }

    /***
    * @description  Method to overide in Apex the default SOQL implementation of the sfpegList_CTL class
    *               to fetch each record set in case of paginated loading of data.
    * @param input  Context Object record containing all the input data expected
    *               by the query.
    * @param query  Text name of the query (optional) if the same override Apex class
    *               is used to implement multiple query logics.
    * @param lastValue Value of the last record returned previously (to be iused for pagination).
    * @return List<Object>  Result set of the query for the considered offset.
    * @exception AuraHandledException   Returned systematically by default with a warning message
    *                                   to inform that real implementation is not available.
    ***/
    public virtual List<Object> getPaginatedData(final Object input, final String query, final String lastValue) {
        System.debug(LoggingLevel.ERROR,'getPaginatedData: sfpegListQuery_SVC default implementation called.');
        throw new AuraHandledException('getPaginatedData: Query action not implemented!');
        //return null;
    }
}