import React, { useEffect, useState, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import "react-datepicker/dist/react-datepicker.css";
import ListTicket from "./ListTicket";
import Webcam from "react-webcam";
import { useTranslation } from "react-i18next";
import ChangeLang from "./ChangeLang";


const EditTicket = (props) => {
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
    const [webCamPermission, setwebCamPermission] = useState(false);
    const webcamRef = useRef(null);
    const root = window.location.href.split("wp-admin")[0];
    const [Agewiseprice, setAgewiseprice] = useState('');
    const [ListModeView, setListMode] = useState(false)
    const [pictureFromcam, setpictureFromcam] = useState(false);
    const [dobDate, setdobDate] = useState(new Date());
    const retakeCapture = (e) => {
        setShowPreview(false);
        setMessage('');
        setNotify(false);
        setwebCamPermission(true);
        setpictureFromcam(false);
        setshowUploadButton(false);
    }
    const [showUploadButton, setshowUploadButton] = useState(false);
    const capture = useCallback(
        () => {
            setPreviewImageUrl(webcamRef.current.getScreenshot());
            setShowPreview(true);
            setMessage('');
            setNotify(false);
            setpictureFromcam(true);
            setwebCamPermission(false);
            setshowUploadButton(true);
        },
        [webcamRef]
    );
    let config = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
            row_id: props.ROWDATA["row_id"]
        })
    };

    useEffect(() => {
        console.log("date_of_birth: ", props.ROWDATA["date_of_birth"]);
        let dateParts = props.ROWDATA["date_of_birth"].split("/");
        let dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        setStartDate(dateObject);
        setdobDate(props.ROWDATA["date_of_birth"])
        setLoadingContent(false);
        LoadRulesDynamic();
        setImageUploadingPath(props.ROWDATA["picture_url"])
        setPreviewImageUrl(props.ROWDATA["picture_url"])
        setAgewiseprice(props.ROWDATA["ticket_price"])
        setShowPreview(true);
    }, [])
    const ListTableCallback = (d) => {
        setListMode(true);
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
    const [loadingContent, setLoadingContent] = useState(true);
    const [priceRules, setpriceRules] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [notify, setNotify] = useState(false);
    const [message, setMessage] = useState('');
    const [previewImageUrl, setPreviewImageUrl] = useState();
    const [imageUploadingPath, setImageUploadingPath] = useState('');

    function LoadRulesDynamic() {
        fetch(`${root}wp-json/ticket-addon/get-pre-config-ticket-rule`)
            .then(res => res.json())
            .then(
                (result) => {
                    setpriceRules(result);

                },
                (error) => {
                    console.log(error);
                }
            )
    }

    const updateTicket = (e) => {
        e.preventDefault();
        if (document.getElementById("image-data").files.length !== 0) {
            setMessage(<div className="alert alert-danger" role="alert">Picture Selected Click On Upload</div>)
            setNotify(true);
        } else {

            setMessage('')
            setNotify(false)
            let config = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                },
                body: new URLSearchParams({
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
                    picture_url: imageUploadingPath,
                    bar_code: e.target.bar_code.src,
                    ticket_price: Agewiseprice,
                    ticket_status: props.ROWDATA["ticket_status"],
                    row_id: props.ROWDATA["row_id"]
                })
            };
            fetch(`${root}wp-json/ticket-addon/update-ticket`, config).then(res => res.json()).then((result) => {
                setMessage(<div className="alert alert-success" role="alert">Updated</div>)
                setNotify(true)
            }, (error) => {
                console.log("error: ", error)
                setMessage(<div className="alert alert-danger" role="alert">Failed</div>)
                setNotify(true)
            })
        }

    }
    const browseClick = (e) => {
        e.preventDefault();
        const wrapperEle = document.getElementById("image-data");
        wrapperEle.click();
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
            setImageUploadingPath(result);
            document.getElementById("image-data").value = '';
            setMessage(<div className="alert alert-success" role="alert">Image Uploaded</div>)
            setNotify(true)
            setUploadingloader(false)
            setshowUploadButton(false);
        }, (error) => {
            console.log("error: ", error)
            setMessage(<div className="alert alert-danger" role="alert">Failed</div>)
            setNotify(true)
        })

    }
    const fileSelectedUpdate = (e) => {
        if (e.target.files.length) {
            setPreviewImageUrl(URL.createObjectURL(e.target.files[0]));
            setShowPreview(true);
            setMessage('');
            setNotify(false);
            setwebCamPermission(false);
            setpictureFromcam(false);
            setshowUploadButton(true);
        }
    }
    return (
        !loadingContent ?
            !ListModeView ?
                <div>
                    <ChangeLang EIDFOTVIEWTYPE={"update-ticket"}></ChangeLang>
                    <form className="save-ticket" onSubmit={(e) => {
                        updateTicket(e)
                    }} id="update-ticket">
                        <div className="App">
                            <button onClick={(e) => {
                                ListTableCallback(e)
                            }}>{t("back")}
                            </button>
                            <div className="row" id="ticket-form">
                                <div className="column">
                                    <div className="form-group test">
                                        <input required className="form-input" type="text" id="first-name" name="first_name"
                                            defaultValue={props.ROWDATA["first_name"]} placeholder={t("First_name")}></input>
                                    </div>
                                    <div className="form-group">
                                        <input required className="form-input" type="text" id="grand_father_name"
                                            name="grand_father_name"
                                            defaultValue={props.ROWDATA["grand_father_name"]}
                                            placeholder={t("Grandfather_name")}></input>
                                    </div>
                                    <div className="form-group">
                                        <input required className="form-input" type="number" id="phone-number"
                                            name="phone_number"
                                            defaultValue={props.ROWDATA["phone_number"]}
                                            placeholder="0000 000 0000"></input>
                                    </div>
                                    <div className="form-group">
                                        <input className="form-input" type="text" id="name-of-accompanying-person"
                                            name="name_of_accompanying_person"
                                            defaultValue={props.ROWDATA["name_of_accompanying_person"]}
                                            placeholder={t("Name_of_accompanying_person")}></input>
                                    </div>
                                    <div className="form-group">
                                        <input className="form-input" type="text" id="ticket-id" name="ticket_id"
                                            defaultValue={props.ROWDATA["ticket_id"]} readOnly={true}
                                            placeholder="Ticket Id"></input>
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
                                                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
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

                                                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                                                        {">"}
                                                    </button>
                                                </div>
                                            )}
                                            selected={startDate}
                                            onChange={(date) => calCulatePriceAgeWise(date)}
                                        />

                                    </div>
                                </div>
                                <div className="column">
                                    <div className="form-group">
                                        <input required className="form-input" type="text" id="last-name" name="last_name"
                                            defaultValue={props.ROWDATA["last_name"]} placeholder={t("Last_name")}></input>
                                    </div>

                                    <div className="form-group">
                                        <input className="form-input" type="text" id="family-name" name="family_name"
                                            defaultValue={props.ROWDATA["family_name"]}
                                            placeholder={t("Family_name")}></input>
                                    </div>

                                    <div className="form-group phone-number-type">

                                        <div className="btn-float-left">
                                            <input className="form-input" type="checkbox" id="phone-number-type-viber"
                                                defaultChecked={props.ROWDATA["phone_number_type_viber"] === "false" ? false : true}
                                                name="phone_number_type_viber" />
                                            <span>Viber</span>
                                        </div>
                                        <div className="btn-float-left margin-left-7">
                                            <input className="form-input" type="checkbox" id="phone-number-type-whats-app"
                                                defaultChecked={props.ROWDATA["phone_number_type_whats_app"] === "false" ? false : true}
                                                name="phone_number_type_whats_app" />
                                            <span>Whats App</span>
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <select className="form-input" id="relation-accompanying-person"
                                            defaultValue={props.ROWDATA["relation_accompanying_person"]}
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
                                            <div style={{ display: !showPreview && !webCamPermission ? "block" : "none" }} className="plus">
                                            </div>
                                        </div>
                                        <div className="from-btn-container">
                                            {
                                                webCamPermission ?
                                                    <span className="btn btn-float-left span-button" onClick={capture}>{t("Capture_photo")}</span> :
                                                    <span className="btn btn-float-left span-button" onClick={(e) => {
                                                        retakeCapture(e)
                                                    }}>{t("Capture_photo")}</span>
                                            }

                                            {
                                                showUploadButton && !uploadingLoader ?
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
                                        </div>
                                        <input onChange={(e) => {
                                            fileSelectedUpdate(e)
                                        }} hidden type="file" id="image-data" accept="image/*" name="image-data"></input>

                                        <input hidden id="image_uploaded_path" className="hidden_content"
                                            defaultValue={imageUploadingPath !== '' ? imageUploadingPath : ''}
                                            name="image_uploaded_path"></input>
                                        <input id="ticket_price" name="ticket_price" hidden
                                            defaultValue={Agewiseprice !== '' ? Agewiseprice : ''}></input>
                                    </div>
                                    <div className="form-group">
                                        <img className="bar-code-edit" alt="Bar Code" id="bar_code" src={props.ROWDATA["bar_code"]}></img>
                                    </div>

                                </div>
                            </div>
                            <div className="row">
                                {notify ? message : ''}
                            </div>
                            <div className="row">
                                <div className="form-group-option">

                                    <button type="submit" className="print-doc-button"
                                        id="save-ticket">{t("Save")}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
                : <ListTicket /> :
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
export default EditTicket;
