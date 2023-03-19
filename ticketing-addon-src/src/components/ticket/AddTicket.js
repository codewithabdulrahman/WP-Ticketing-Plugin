import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import "react-datepicker/dist/react-datepicker.css";
import BarCode from "./barCode";
import PrintTicket from './PrintTicket';
import Webcam from "react-webcam";
import ChangeLang from "./ChangeLang";
import { useTranslation } from "react-i18next";


const AddTicket = (props) => {
    const { t } = useTranslation();
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };
    const [startDate, setStartDate] = useState(new Date());
    const years = range(1970, getYear(new Date()) + 1, 1);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const [loadingContent, setLoadingContent] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState();
    const [notify, setNotify] = useState(false);
    const [message, setMessage] = useState('');
    const [imageUploadingPath, setImageUploadingPath] = useState('');
    const [Agewiseprice, setAgewiseprice] = useState('');
    const [priceRules, setpriceRules] = useState('');
    const [randomTicketId, setrandomTicketId] = useState();
    const [webCamPermission, setwebCamPermission] = useState(true);
    const [printRenderMode, setPrintRenderMode] = useState(false);
    const [pictureFromcam, setpictureFromcam] = useState(false);
    const [PrintData, SetPrintData] = useState('');
    const webcamRef = useRef(null);
    const root = window.location.href.split("wp-admin")[0];

    let currentDate = new Date();
    var curr_date = currentDate.getDate();
    var curr_month = currentDate.getMonth();
    curr_month++;  //We add +1 because Jan is indexed at 0 instead of 1
    var curr_year = currentDate.getFullYear();
    const [dobDate, setdobDate] = useState(curr_date + "/" + curr_month + "/" + curr_year);

    useEffect(() => {
        setrandomTicketId(`TID-${(1 + Math.random()).toString(36).substring(7)}`);
        LoadRulesDynamic();
        console.log("dobDate: ", dobDate);
    }, [])

    function LoadRulesDynamic() {
        fetch(`${root}wp-json/ticket-addon/get-pre-config-ticket-rule`)
            .then(res => res.json())
            .then(
                (result) => {
                    setpriceRules(result);
                    setLoadingContent(false);
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    const calCulatePriceAgeWise = (dates) => {
        setStartDate(dates);
        let dateTmp = new Date(dates);
        dateTmp = dateTmp.getDate() + '/' + (dateTmp.getMonth() + 1) + '/' + dateTmp.getFullYear();
        setdobDate(dateTmp);
        let ageInMilliseconds = new Date() - new Date(dates);
        let yearAge = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
        if (yearAge >= 5 && yearAge <= 11) {
            setAgewiseprice(priceRules.rules["age_greater_then_or_equal_5_to_11"]);
        }
        if (yearAge <= 5) {
            setAgewiseprice(priceRules.rules["age_less_then_equal_4"]);
        }
        if (yearAge >= 12) {
            setAgewiseprice(priceRules.rules["age_greater_then_or_equal_12"]);
        }
    };

    const browseClick = (e) => {
        e.preventDefault();
        const wrapperEle = document.getElementById("image-data");
        wrapperEle.click();
    }
    const fileSelectedUpdate = (e) => {
        if (e.target.files.length) {
            setPreviewImageUrl(URL.createObjectURL(e.target.files[0]));
            setShowPreview(true);
            setMessage('');
            setNotify(false);
            setpictureFromcam(false);
            setwebCamPermission(false);
        }
    }
    const [uploadingLoader, setUploadingloader] = useState(false);
    const uploadFileSelected = (e) => {
        e.preventDefault();
        let fileInput;
        if (!pictureFromcam) {
            fileInput = document.getElementById("image-data").files[0];
        } else {
            fileInput = previewImageUrl;
        }

        let myFormData = new FormData();
        myFormData.append('image_data', fileInput);
        myFormData.append('web_cam', pictureFromcam);
        let config = {
            method: 'POST',
            credentials: 'same-origin',
            processData: false, // important
            contentType: false, // important
            dataType: 'json',
            body: myFormData,
        };
        setUploadingloader(true)
        fetch(`${root}wp-json/ticket-addon/upload-ticket-picture`, config).then(res => res.json()).then((result) => {
            setUploadingloader(false);
            setImageUploadingPath(result);
            setMessage(<div className="alert alert-success" role="alert">{t("Image_uploaded")}</div>)
            setNotify(true)
        }, (error) => {
            console.log("error: ", error)
            setMessage(<div className="alert alert-danger" role="alert">Failed</div>)
            setNotify(true)
        })


    }

    const saveTicket = (e) => {
        e.preventDefault();
        let TmpBodyData = [{
            first_name: e.target.elements.first_name.value,
            grand_father_name: e.target.elements.grand_father_name.value,
            phone_number: e.target.elements.phone_number.value,
            name_of_accompanying_person: e.target.elements.name_of_accompanying_person.value,
            ticket_id: e.target.elements.ticket_id.value,
            date_of_birth: dobDate,
            last_name: e.target.elements.last_name.value,
            family_name: e.target.elements.family_name.value,
            phone_number_type_viber: e.target.elements.phone_number_type_viber.checked,
            phone_number_type_whats_app: e.target.elements.phone_number_type_whats_app.checked,
            relation_accompanying_person: e.target.elements.relation_accompanying_person.value,
            picture_url: e.target.image_uploaded_path.value,
            bar_code: e.target.bar_code.src,
            ticket_price: e.target.ticket_price.value,
            ticket_status: 'unread'
        }];
        // printTicket(e);
        if (document.getElementById("image_uploaded_path").value === '') {
            setNotify(true);
            if (document.getElementById("image-data").files.length === 0) {
                setMessage(<div className="alert alert-danger" role="alert">Select or Capture Picture and Upload</div>)
            } else {
                setMessage(<div className="alert alert-danger" role="alert">Picture Selected Click On Upload</div>)
            }
        } else {
            TmpBodyData = TmpBodyData[0];
            setMessage('')
            setNotify(false)
            let config = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                },
                body: new URLSearchParams(TmpBodyData)
            };
            fetch(`${root}wp-json/ticket-addon/save-ticket`, config).then(res => res.json()).then((result) => {
                let dateTmp = new Date();
                dateTmp = dateTmp.getDate() + '-' + (dateTmp.getMonth() + 1) + '-' + dateTmp.getFullYear();
                TmpBodyData["date_created"] = dateTmp;
                TmpBodyData["print_ticket_path"] = result.print_ticket_path;
                SetPrintData(TmpBodyData)
                setPrintRenderMode(true)
                setMessage(<div className="alert alert-success" role="alert">Ticket Added Successfully</div>)
                setNotify(true)
            }, (error) => {
                console.log("error: ", error)
                setMessage(<div className="alert alert-danger" role="alert">Failed</div>)
                setNotify(true)
            })
        }

    }

    const capture = useCallback(
        () => {
            setPreviewImageUrl(webcamRef.current.getScreenshot());
            setShowPreview(true);
            setMessage('');
            setNotify(false);
            setpictureFromcam(true);
            setwebCamPermission(false);
        },
        [webcamRef]
    );
    const retakeCapture = (e) => {
        setShowPreview(false);
        setMessage('');
        setNotify(false);
        setwebCamPermission(true);
        setpictureFromcam(false);
    }

    return (
        !loadingContent ?
            <div>
                <ChangeLang EIDFOTVIEWTYPE={"save-ticket"}></ChangeLang>
                <form className="save-ticket" onSubmit={(e) => {
                    saveTicket(e)
                }} id="save-ticket">
                    <div className="App">
                        <div className="row" id="ticket-form">
                            <div className="column">
                                <div className="form-group test">
                                    <input required className="form-input" type="text" id="first-name" name="first_name"
                                        placeholder={t("First_name")}></input>
                                </div>
                                <div className="form-group">
                                    <input required className="form-input" type="text" id="grand_father_name"
                                        name="grand_father_name"
                                        placeholder={t("Grandfather_name")}></input>
                                </div>
                                <div className="form-group">
                                    <input required className="form-input" type="number" id="phone-number"
                                        name="phone_number"
                                        placeholder="0000 000 0000"></input>
                                </div>
                                <div className="form-group">
                                    <input className="form-input" type="text" id="name-of-accompanying-person"
                                        name="name_of_accompanying_person"
                                        placeholder={t("Name_of_accompanying_person")}></input>
                                </div>
                                <div className="form-group">
                                    <input className="form-input" type="text" id="ticket-id" name="ticket_id"
                                        value={randomTicketId} readOnly={true} placeholder="Ticket Id"></input>
                                </div>
                                <div className="form-group">
                                    <DatePicker className="form-input"
                                        inline
                                        renderCustomHeader={({
                                            date,
                                            changeYear,
                                            changeMonth,
                                            decreaseMonth,
                                            increaseMonth,
                                            prevMonthButtonDisabled,
                                            nextMonthButtonDisabled,
                                        }) => (
                                            <div
                                                style={{
                                                    margin: 10,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <button onClick={decreaseMonth}
                                                    disabled={prevMonthButtonDisabled}>
                                                    {"<"}
                                                </button>
                                                <select
                                                    value={getYear(date)}
                                                    onChange={({ target: { value } }) => changeYear(value)}
                                                >

                                                    {years.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={months[getMonth(date)]}
                                                    onChange={({ target: { value } }) =>
                                                        changeMonth(months.indexOf(value))
                                                    }
                                                >
                                                    {months.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button onClick={increaseMonth}
                                                    disabled={nextMonthButtonDisabled}>
                                                    {">"}
                                                </button>
                                            </div>
                                        )}
                                        selected={startDate}
                                        onChange={(date) => calCulatePriceAgeWise(date)}
                                    />
                                    <BarCode TID={randomTicketId} />

                                </div>
                            </div>
                            <div className="column">
                                <div className="form-group">
                                    <input required className="form-input" type="text" id="last-name" name="last_name"
                                        placeholder={t("Last_name")}></input>
                                </div>

                                <div className="form-group">
                                    <input className="form-input" type="text" id="family-name" name="family_name"
                                        placeholder={t("Family_name")}></input>
                                </div>

                                <div className="form-group phone-number-type">

                                    <div className="btn-float-left">
                                        <input className="form-input" type="checkbox" id="phone-number-type-viber"
                                            name="phone_number_type_viber" />
                                        <span>Viber</span>
                                    </div>
                                    <div className="btn-float-left margin-left-7">
                                        <input className="form-input" type="checkbox" id="phone-number-type-whats-app"
                                            name="phone_number_type_whats_app" />
                                        <span>Whats App</span>
                                    </div>

                                </div>

                                <div className="form-group">
                                    <select className="form-input" id="relation-accompanying-person"
                                        name="relation_accompanying_person">
                                        <option value="">{t("Relative_relation")}</option>
                                        <option value="father">{t("father")}</option>
                                        <option value="mother">{t("mother")}</option>
                                        <option value="other">{t("other")}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <div className="image-uploader" onClick={(e) => {
                                        browseClick(e)
                                    }}>
                                        {
                                            webCamPermission ?
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/png"
                                                    videoConstraints={videoConstraints}
                                                /> : ""
                                        }
                                        <img alt="Preview" id="uploading-image-preview" src={previewImageUrl}
                                            style={{ display: showPreview && !webCamPermission ? "block" : "none" }}></img>
                                        <div style={{ display: !showPreview && !webCamPermission ? "block" : "none" }}
                                            className="plus"></div>
                                    </div>
                                    {
                                        !printRenderMode ?
                                            <div className="from-btn-container">
                                                {
                                                    webCamPermission ?
                                                        <span className="btn btn-float-left span-button"
                                                            onClick={capture}>{t("Capture_photo")}</span> :
                                                        <span className="btn btn-float-left span-button"
                                                            onClick={(e) => {
                                                                retakeCapture(e)
                                                            }}>{t("Capture_photo")}</span>
                                                }
                                                {
                                                    showPreview && !webCamPermission && !uploadingLoader ?
                                                        <button onClick={(e) => {
                                                            uploadFileSelected(e)
                                                        }} className="btn btn-float-right">{t("Upload")}
                                                        </button> : ""
                                                }
                                                {
                                                    uploadingLoader ?
                                                        <div id="message-loader">
                                                            <div className="lds-ring">
                                                                <div></div>
                                                                <div></div>
                                                                <div></div>
                                                                <div></div>
                                                            </div>
                                                        </div> : ""
                                                }

                                            </div> : ""
                                    }

                                    <input onChange={(e) => {
                                        fileSelectedUpdate(e)
                                    }} hidden type="file" id="image-data" accept="image/*" name="image-data"></input>

                                    <input hidden id="image_uploaded_path" className="hidden_content"
                                        defaultValue={imageUploadingPath !== '' ? imageUploadingPath : ''}
                                        name="image_uploaded_path"></input>
                                    <input id="ticket_price" name="ticket_price" hidden
                                        defaultValue={Agewiseprice !== '' ? Agewiseprice : ''}></input>
                                </div>

                            </div>
                        </div>

                        <div className="row">
                            {notify ? message : ''}
                        </div>

                        <div className="row">
                            <div className="form-group-option">
                                {
                                    !printRenderMode ? <button className="before-save-form-file-check" type="submit"
                                        id="print-save-ticket">{t("Save")}
                                    </button> :
                                        <PrintTicket PRINTDATA={PrintData} />
                                }


                            </div>
                        </div>

                    </div>
                </form>
            </div>
            :
            <div id="message-loader">
                <div className="lds-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
    );
}
export default AddTicket;
