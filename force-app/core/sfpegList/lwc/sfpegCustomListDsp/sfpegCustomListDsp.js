/***
* @author P-E GROS
* @date   Sept. 2025
* @description  LWC Component to display custom types in a standard Lightning data table
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
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

import { LightningElement, api } from 'lwc';

import sfpegAvatarDsp           from "./sfpegAvatarDsp.html";
import sfpegBadgeDsp            from "./sfpegBadgeDsp.html";
import sfpegIconOnlyDsp         from "./sfpegIconOnlyDsp.html";
import sfpegPercentFixedDsp     from "./sfpegPercentFixedDsp.html";
import sfpegRichTextDsp         from "./sfpegRichTextDsp.html";

export default class SfpegCustomListDsp extends LightningElement {

    @api
    getDataTypes() {
      return {
        avatar: {
          template: sfpegAvatarDsp,
          standardCellLayout: true,
          typeAttributes: ["iconName","size","variant"]
        },
        badge: {
          template: sfpegBadgeDsp,
          standardCellLayout: true,
          typeAttributes: ["iconName","variant"]
        },
        icon: {
          template: sfpegIconOnlyDsp,
          standardCellLayout: true,
          typeAttributes: ["iconName","size","variant"]
        },
        'percent-fixed': {
          template: sfpegPercentFixedDsp,
          standardCellLayout: true,
          typeAttributes: []
        },
        richText: {
          template: sfpegRichTextDsp,
          standardCellLayout: true,
          typeAttributes: []
        }
      };
    }
}