import { LightningElement,api } from 'lwc';
import customImageTemplate from './sfpegListCustomImageTemplate';

export default class SfpegListCustomDataTypesProvider extends LightningElement {

    //----------------------------------------------------------------
    // Return Custom Data Types 
    //----------------------------------------------------------------
    @api
    getDataTypes() {
      return {
        //A custom type 'customImage' to be able to display images in any column of the lightning Datatable
        customImage: {
          template: customImageTemplate, //imported template
          typeAttributes: ["imageUrl"], //attributes needed : imageUrl to be used in template
          standardCellLayout: true
        },
        //other custom types can be added here
      };
    }
}