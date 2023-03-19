import React from 'react';
import {useBarcode} from 'react-barcodes';

const BarCode = (props) => {

    const {inputRef} = useBarcode({
        value:  props.TID,
        options: {
            background: '#ffffff',
        }
    });

    return (
        <img  hidden id="bar_code" name="bar_code" alt="BarCode" ref={inputRef}/>
    );
}
export default BarCode;
