import {forwardRef, useRef} from "react";
import ReactToPrint, {PrintContextConsumer} from "react-to-print";
import {useTranslation} from "react-i18next";
const ComponentToPrint = forwardRef((props, ref) => {
    let data=props.PRINTDATAUSERREF;
    return (
        <div className="print-source" ref={ref}>
            <div>
                <div style={{position: 'relative', width: '297px', height: '425px'}}>
                    <img width="297" alt="print_ticket" height="425" src={data.print_ticket_path}/>
                    <input type="text"   defaultValue={data.date_created} style={{border: 'none', background: 'transparent', textAlign:'right', position: 'absolute', top: '2.09in', left: '0.22in', width: '2.08in', height: '0.38in'}} />
                    <input type="text"   defaultValue={data.first_name+" "+data.last_name}  style={{border: 'none',textAlign:'right', position: 'absolute', top: '2.53in', left: '0.22in', width: '2.08in', height: '0.38in', color: 'black', background: 'transparent'}} />
                    <input type="text"   defaultValue={data.ticket_price} style={{position: 'absolute', top: '2.99in', left: '1.82in', width: '0.51in', height: '0.38in', background: 'transparent', border: 'none'}} />
                    <input type="text"   defaultValue={data.ticket_id} style={{background: 'transparent', border: 'none', position: 'absolute', top: '25pc', left: '0.1in'}} />
                </div>
            </div>

        </div>
    );
    }
);

const PrintTicket = (props) => {
    const { t } = useTranslation();
    const ref = useRef();
    return (
        <>
            <ReactToPrint content={() => ref.current}>
                <PrintContextConsumer>
                    {({handlePrint}) => (
                        <span  className="print-doc-button" onClick={handlePrint}>{t("Print")}</span>
                    )}
                </PrintContextConsumer>
            </ReactToPrint>
            <ComponentToPrint PRINTDATAUSERREF={props.PRINTDATA} ref={ref}/>
        </>
    );
}
export default PrintTicket;
