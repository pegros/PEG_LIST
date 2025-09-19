/***
* @description  Lightning controller to provide chatter feeds of a record
* @author       P-E GROS
* @date         July 2023
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

public with sharing class sfpegChatterFeed_SVC extends sfpegListQuery_SVC {
        
    Integer counter = 0;
    
	public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START sfpegChatterFeed_SVC implementation');
        System.debug('getData: input provided ' + input);
        System.debug('getData: query provided ' + query);
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        ID recordId = (ID)(inputData.get('recordId'));
        System.debug('getData: recordId fetched ' + recordId);

        ConnectApi.FeedElementPage fep = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(Network.getNetworkId(),ConnectApi.FeedType.Record, recordId);
        System.debug('getData: feeds fetched ' + fep);

        System.debug('getData: END with #records on 1st level ' + fep.elements.size());
        return fep.elements;
	}
}