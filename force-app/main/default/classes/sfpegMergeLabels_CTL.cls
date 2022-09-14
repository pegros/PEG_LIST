/***
* @description  Lightning controller to provide custom label values dynamically,
*               (according to the user language).
*               Also used as VF controler as technical workaround to fetch the the
*               translated labels via the sfpegMergeLabels_VFP page.
* @author       P-E GROS
* @date         May 2021
* @see          sfpegMergeLabels_VFP
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
public with sharing class sfpegMergeLabels_CTL {

	/***
	* @description  For the VF controller part, list of requested Custom Label Names
	***/
	private List<String> labelNames;

	/***
	* @description  Constructor of the VF page controler part, parsing the provided
	*               'labels' page string parameter as JSON String list of custom label
	*               dev names.
	***/
	public sfpegMergeLabels_CTL() {
		System.debug('Constructor: START');

		String labelList = Apexpages.currentPage().getParameters().get('labels');
		System.debug('Constructor: labelList fetched ' + labelList);

		labelNames = new List<String>();
		if (String.isEmpty(labelList)) {
			System.debug('Constructor: END no label provided ');
		}
		else {
			System.debug('Constructor: parsing labels ');
			List<Object> parsedList = (List<Object>)JSON.deserializeUntyped(labelList);
			for (Object iter : parsedList) {
				labelNames.add((String)iter);
			}
			System.debug('Constructor: END labels init ' + labelNames);
		}
	}
	/***
	* @description  Accessor for the VF page controler part to fetch the list of
	*               custom label dev names to display.
	***/
	public List<String> getLabelNames() {
		return labelNames;
	}
}
