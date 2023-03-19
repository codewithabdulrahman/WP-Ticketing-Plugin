import React, {useEffect, useState} from "react";
import "./118n";
import {useTranslation} from "react-i18next";
const ChangeLang = (props) => {
    const {t,i18n} = useTranslation();
    const changeLanguage = (event) => {
        localStorage.setItem("lang-ticketing-addon", event.target.value);
        setLang(event.target.value);
        i18n.changeLanguage(event.target.value);
        event.target.value==="pr"? document.getElementById(props.EIDFOTVIEWTYPE).setAttribute("dir", "rtl"):document.getElementById(props.EIDFOTVIEWTYPE).setAttribute("dir", "ltr");
    };
    const [lang, setLang] = useState(null !== localStorage.getItem("lang-ticketing-addon") ? localStorage.getItem("lang-ticketing-addon") : "en");
    useEffect(() => {
        lang==="pr" ? document.getElementById(props.EIDFOTVIEWTYPE).setAttribute("dir", "rtl"):document.getElementById(props.EIDFOTVIEWTYPE).setAttribute("dir", "ltr");
        i18n.changeLanguage(lang);
    }, [])
    return (
        <div>
            <select className="selectBox" onChange={changeLanguage} name="lang" value={lang}>
                <option className="optionsMenu" value="en">
                    English
                </option>
                <option className="optionsMenu" value="pr">
                    {t("Arabic")}
                </option>
            </select>
        </div>
    );
}


export default ChangeLang;
