import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import ChangeLang from "./ChangeLang";
function ConfigTicket() {
    const {t} = useTranslation();
    const [getAdonTicketRules, setAdonTicketRules] = useState([]);
    const [showMessage, setMessage] = useState(false);
    const [loadingContent, setLoadingContent] = useState(true);
    const [saveContent, setSaveContent] = useState(false);
    const root = window.location.href.split("wp-admin")[0];
    useEffect(() => {
        fetch(`${root}wp-json/ticket-addon/get-pre-config-ticket-rule`)
            .then(res => res.json())
            .then(
                (result) => {
                    setAdonTicketRules(result.rules)
                    if (result.rules["age_less_then_equal_4"] === '0' || result.rules["age_less_then_equal_4"] === '') {
                        setMessage(true)
                    } else {
                        setMessage(false)
                    }
                    setLoadingContent(false);
                },
                (error) => {
                    console.log(error);
                }
            )
    }, [])
    const selectShortlistedApplicant = (e) => {
        if (e.target.value === 0 || e.target.value === '0' || e.target.value === '' || e.target.value < 0) {
            setMessage(true);
        } else {
            setMessage(false);
        }
    };
    const submitTicketConfigForm = (e) => {
        e.preventDefault();
        setSaveContent(true);
        fetch(`${root.split("wp-admin")[0]}wp-json/ticket-addon/set-pre-config-ticket-rule`
            , {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                },
                body: new URLSearchParams({
                        age_less_then_equal_4: e.target[0].value,
                        age_greater_then_or_equal_5_to_11: e.target[1].value,
                        age_greater_then_or_equal_12: e.target[2].value,
                    }
                )
            }
        )
            .then(res => res.json())
            .then((result) => {
                    console.log(result);
                    setSaveContent(false);
                },
                (error) => {
                    console.log(error);
                })
    };

    return (
        !loadingContent ? <div className="App">
                <ChangeLang EIDFOTVIEWTYPE={"config-ticket-comp"}></ChangeLang>
                <div className="row config-ticket" id="config-ticket-comp">
                    <h3 className="title">{t("Ticket_rules")}</h3>
                    <form id="save_rules" onSubmit={(e) => {
                        submitTicketConfigForm(e);
                    }}>
                        <div className="form-group">
                            <label htmlFor="age_less_then_equal_4">{t("age_of_4_or_below")}</label>
                            <input required type="number" id="age_less_then_equal_4"
                                   defaultValue={getAdonTicketRules["age_less_then_equal_4"]}
                                   name="age_less_then_equal_4"
                                   onChange={
                                       (e) => {
                                           selectShortlistedApplicant(e);
                                       }
                                   }
                            />
                            <p style={{display: showMessage ? "block" : "none"}}>{t("empty_rule_message")}</p>

                        </div>
                        <div className="form-group">
                            <label htmlFor="age_greater_then_or_equal_5_to_11">{t("age_5_to_11")}</label>
                            <input required type="number" id="age_greater_then_or_equal_5_to_11"
                                   name="age_greater_then_or_equal_5_to_11"
                                   defaultValue={getAdonTicketRules["age_greater_then_or_equal_5_to_11"]}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="age_greater_then_or_equal_12">{t("age_12_or_above")}</label>
                            <input required type="number" id="age_greater_then_or_equal_12"
                                   name="age_greater_then_or_equal_12"
                                   defaultValue={getAdonTicketRules["age_greater_then_or_equal_12"]}/>
                        </div>
                        <div className="form-group">
                            {
                                !saveContent ? <button type="submit">{t("save_rules")}</button>
                                    : <div id="message-loader">
                                        <div className="lds-ring">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                            }
                        </div>

                    </form>
                </div>
            </div> :
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

export default ConfigTicket;
