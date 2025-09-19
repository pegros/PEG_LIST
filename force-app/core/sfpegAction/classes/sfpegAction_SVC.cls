/***
* @author       P-E GROS
* @date         May 2021
* @description  Virtual handling class used by the sfpegAction_CTL generic controller to
*               implement custom Apex actions.
*               Provides virtual default implementations of supported methods.
*               Default implementation throws exceptions to warn about missing implementation.
* @see          sfpegAction_CTL
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
public virtual class sfpegAction_SVC {

	/***
	* @description  Method to provide an Apex logic implementation for the
	*               sfpegAction_CTL generic controller class.
	* @param input  Context Object record containing all the input data expected
	*               by the action.
	* @param method Text name of the method (optional) if the same Apex class
	*               is used to implement multiple business logics.
	* @return Object  Object record containing the output of the Apex logic.
	* @exception AuraHandledException   Returned systematically by default with a warning message
	*                                   to inform that real implementation is not available.
	***/
	public virtual Object execute(final Object input, final String method) {
		System.debug(LoggingLevel.ERROR,'execute: sfpegAction_SVC default unitary implementation called.');
		throw new AuraHandledException('Execute Apex action not implemented!');
	}
}
