import DataTable from 'react-data-table-component';
import React, { useEffect, useState } from "react";
import EditTicket from "./EditTicket";
import { CSVLink } from "react-csv";
import PrintTicket from './PrintTicket';
import ChangeLang from "./ChangeLang";
import { useTranslation } from "react-i18next";


function ListTicket() {
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState()
    const [isAdmin, setisAdmin] = useState(false)
    const [endDate, setEndDate] = useState()
    const root = window.location.href.split("wp-admin")[0];
    let [data, setData] = useState([]);
    const [CalculatedTotal, setCalculatedTotal] = useState([]);
    const [editTicketMode, setEditTicketMode] = useState(false);
    const [editTicketData, setEditTicketData] = useState('');
    const ageCalculate = (d) => {
        let dateParts = d.split("/");
        let dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        let ageInMilliseconds = new Date() - dateObject;
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }
    let headersCSV = [
        { label: `${t("First_name")}`, key: "first_name" },
        { label: `${t("Last_name")}`, key: "last_name" },
        { label: "Phone", key: "phone_number" },
        { label: `${t("date_of_birth")}`, key: "date_of_birth" },
        { label: "Ticket ID", key: "ticket_id" },
        { label: `${t("price")}`, key: "ticket_price" },
        { label: `${t("status")}`, key: "ticket_status" }
    ];

    const EditTicketCallBack = (d) => {

        setEditTicketData(d);
        setEditTicketMode(true);
    }

    const ExpandedComponent = ({ data }) => <pre>
        <div className="form-group">
            <label>Ticket Id:{data.ticket_id}</label>
            <br></br>
            <label>Phone:{data.phone_number}</label>
            <br></br>
            <label>{t("Relative")}:{t(data.relation_accompanying_person)}</label>
            <br></br>
            <label>{t("status")}:{t(data.ticket_status)}</label>
            <br></br>
            <img className="bar-code-view" src={data.bar_code} alt="Bar Code" />
        </div>
    </pre>;
    const columns = [
        {
            name: `${t("name")}`,
            selector: row => row.first_name + ' ' + row.last_name,
        },
        {
            name: `${t("age")}`,
            selector: row => ageCalculate(row.date_of_birth),

        },
        {
            name: `${t("price")}`,
            selector: row => row.ticket_price,
        },
        {
            name: `${t("date_created")}`,
            selector: row => row.date_created,
            sortable: true,
        },

        // {
        //     name: 'Bar Code',
        //     selector: row => <img className="bar-code-view" src={row.bar_code} alt="Bar Code"/>,
        // },
        // {
        //     name: 'Status',
        //     selector: row => row.ticket_status,
        // },

        {
            name: `${t("Action")}`,
            selector: row => isAdmin ? <div className="unset-overflow">
                <PrintTicket PRINTDATA={row} />
                {
                    row.ticket_status === "unread" ?
                        <button onClick={(e) => {
                            ChangeStatus(row)
                        }}>{t("Read")}
                        </button> : ""
                }
                <button onClick={(e) => {
                    EditTicketCallBack(row)
                }}>{t("edit")}
                </button>
                <button onClick={(e) => {
                    deleteRows(row)
                }}>{t("delete")}
                </button>
            </div> : <div>
                {
                    row.ticket_status === "unread" ?
                        <div>
                            <PrintTicket PRINTDATA={row} />
                            <button onClick={(e) => {
                                EditTicketCallBack(row)
                            }}>{t("edit")}
                            </button>
                        </div> : <div>
                            <PrintTicket PRINTDATA={row} />
                        </div>
                }

            </div>
        }
    ];

    function seprateDateFromTimeStamp(strDate) {
        let currentDate = new Date(strDate);
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;
        let day = currentDate.getDate();
        let date = day + "-" + month + "-" + year;
        return date;
    }

    useEffect(() => {
        loadComponent();
    }, [])
    const loadComponent = (e) => {
        fetch(`${root}wp-json/ticket-addon/get-tickets`)
            .then(res => res.json())
            .then(
                (result) => {
                    let collection = [],
                        CollectionOfCalculation = [];
                    let $TmpTicketDataRes = result.ticket_data;
                    setisAdmin(result.is_admin);
                    CollectionOfCalculation["total_tickets"] = $TmpTicketDataRes.length;
                    CollectionOfCalculation["total_read_price"] = 0;
                    CollectionOfCalculation["total_un_read_price"] = 0;
                    for (let i = 0; i < $TmpTicketDataRes.length; i++) {
                        let $tmpJson = JSON.parse($TmpTicketDataRes[i].data);
                        $tmpJson["row_id"] = $TmpTicketDataRes[i].id;
                        $tmpJson["print_ticket_path"] = result.print_ticket_path;
                        $tmpJson["date_created"] = seprateDateFromTimeStamp($TmpTicketDataRes[i].time_stamp);
                        let tmpAge = ageCalculate($tmpJson["date_of_birth"]);
                        $tmpJson["age"] = tmpAge.toString();
                        if ($tmpJson["ticket_status"] === "read") {
                            CollectionOfCalculation["total_read_price"] = parseInt(CollectionOfCalculation["total_read_price"]) + parseInt($tmpJson["ticket_price"]);
                        }
                        if ($tmpJson["ticket_status"] === "unread") {
                            CollectionOfCalculation["total_un_read_price"] = parseInt(CollectionOfCalculation["total_un_read_price"]) + parseInt($tmpJson["ticket_price"]);
                        }
                        collection.push($tmpJson);
                    }
                    setCalculatedTotal(CollectionOfCalculation);
                    setData(collection);
                }
            )
    }
    const ChangeStatus = (e) => {
        let config = {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            },
            body: new URLSearchParams({
                data: JSON.stringify(e)
            })
        };
        fetch(`${root}wp-json/ticket-addon/set-ticket-status`, config)
            .then(res => res.json())
            .then(
                (result) => {
                    loadComponent();
                }
            )
    }
    const [selectedRows, setSelectedRows] = useState(false);
    const [selectedToggleActionButton, setselectedToggleActionButton] = useState(false);


    const handleChange = ({ selectedRows }) => {
        setSelectedRows(selectedRows);
        if (isAdmin) {
            if (selectedRows.length > 0) {
                setselectedToggleActionButton(true)
            }
            if (selectedRows.length === 0) {
                setselectedToggleActionButton(false)
            }
        }
    };


    const deleteRows = (e) => {
        setselectedToggleActionButton(false)
        let config = {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            },
            body: new URLSearchParams({
                data: JSON.stringify(e)
            })
        }
        fetch(`${root}wp-json/ticket-addon/delete-ticket-data`, config).then(res => res.json()).then((result) => {
            loadComponent()
        }, (error) => {
            console.log("error: ", error)
        });

    }
    const [filter_type, setFilter_type] = useState('');
    const [filterText, setFilterText] = useState('');
    const [Filterbyinput_text, setFilterbyinput_text] = useState(false)
    const [Filterbyinput_date, setFilterbyinput_date] = useState(false)
    const [Filterbyall, setFilterall] = useState(true);
    const [Filterbystatus, setFilterbyStatus] = useState(false);

    const SelectedfilterHandles = (e) => {
        setSelectedRows('');
        if (e.target.value !== "all" && e.target.value === "date_created") {
            setFilterbyinput_date(true);
            setFilterall(false);
            setFilterbyinput_text(false);
            setFilterbyStatus(false);
        }
        if (e.target.value === "ticket_status" && e.target.value !== "all") {
            setFilterbyStatus(true);
            setFilterbyinput_date(false);
            setFilterbyinput_text(false);
            setFilterall(false);
        }
        if (e.target.value === "all") {
            setFilterall(true);
            setFilterbyinput_date(false);
            setFilterbyinput_text(false);
            setFilterbyStatus(false);
        }
        if (e.target.value !== "all" && e.target.value !== "date_created" && e.target.value !== "ticket_status") {
            setFilterbyinput_text(true);
            setFilterall(false);
            setFilterbyinput_date(false);
            setFilterbyStatus(false);
        }
        setFilter_type(e.target.value);
        renderByFilterType();
    }
    const renderByFilterType = (e) => {
        if (filter_type === "" || filter_type === "all") {
            return data;
        } else {
            if (filter_type !== "date_created") {
                if (filter_type === "ticket_status") {
                    return data.filter(
                        item => item[filter_type].toLowerCase() === FilterStatusReadUnread.toLowerCase(),
                    );
                } else {
                    return data.filter(
                        item => item[filter_type].toLowerCase().includes(filterText.toLowerCase()),
                    );
                }
            } else {
                let $startDate = seprateDateFromTimeStamp(startDate);
                let $endDate = seprateDateFromTimeStamp(endDate);
                let DateFilterCollection = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i]["date_created"] >= $startDate && data[i]["date_created"] <= $endDate) {
                        DateFilterCollection.push(data[i]);
                    }
                }
                return DateFilterCollection;
            }
        }
    }
    const [FilterStatusReadUnread, setFilterStatusReadUnread] = useState("unread");
    const filteredItems = renderByFilterType();
    return (
        !editTicketMode ?
            <div>
                <ChangeLang EIDFOTVIEWTYPE={"list-comp"}></ChangeLang>
                <div className="App" id="list-comp">
                    <div className="view-container action-responsive">
                        <h3>{t("Ticket_list")}</h3>
                        <span className="view-cal">{t("Total_tickets")}: {CalculatedTotal["total_tickets"]}{t("Ticket")}</span>
                        {/*<span className="view-cal">Total Sales Read:{CalculatedTotal["total_read_price"]}</span>*/}
                        <span className="view-cal">{t("Total_Sales")}{t("Un_Read")}: {CalculatedTotal["total_un_read_price"]}</span>
                        <span className="view-cal">
                            <select id="filter-by" name="filter-by" onChange={(e) => {
                                SelectedfilterHandles(e)
                            }}>
                                <option value="all">{t("Filters")}</option>
                                <option value="ticket_status">{t("Filter_by_status")}</option>
                                <option value="first_name">{t("Filter_by_name")}</option>
                                <option value="age">{t("Filter_by_age")}</option>
                                <option value="ticket_price">{t("Filter_by_price")}</option>
                                <option value="date_created">{t("Filter_by_date_range")}</option>
                            </select>
                        </span>
                        {
                            Filterbyinput_text ?
                                <span className="view-cal">
                                    <input onChange={
                                        e => setFilterText(e.target.value)
                                    }></input>
                                </span> : ''
                        }{
                            Filterbyinput_date ?
                                <span className="view-cal">
                                    <input className="date-range"
                                        onChange={
                                            e => setStartDate(e.target.value)
                                        }
                                        type="date"></input>
                                    <input className="date-range" onChange={
                                        e => setEndDate(e.target.value)
                                    } type="date"></input>
                                </span> : ''
                        }
                        {
                            Filterbystatus ?
                                <span className="view-cal">
                                    <select id="filter-status" defaultValue="unread" onChange={(e) => {
                                        setFilterStatusReadUnread(e.target.value)
                                    }}>
                                        <option value="read">{t("Read")}</option>
                                        <option value="unread">{t("Un_Read")}</option>
                                    </select>
                                </span> : ""
                        }
                        <span className="view-cal">
                            <CSVLink filename={"ticketing_list.csv"} data={filteredItems} headers={headersCSV}>
                                {t("Export_to_CSV")}
                            </CSVLink>
                        </span>
                        {
                            selectedToggleActionButton ?
                                <button className="button-del-all" value={"delete-rows"} onClick={(e) => {
                                    deleteRows(selectedRows)
                                }}>
                                    {t("delete")}
                                </button>
                                : ""
                        }
                        {
                            selectedToggleActionButton ?
                                <button className="button-read-all" value={"mark-as-read-rows"} onClick={(e) => {
                                    ChangeStatus(selectedRows)
                                }}>
                                    {t("mark_as_read")}
                                </button> : ""
                        }

                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        expandableRows
                        expandableRowsComponent={ExpandedComponent}
                        selectableRows
                        onSelectedRowsChange={handleChange}
                        pagination
                    />
                </div></div> : <EditTicket ROWDATA={editTicketData} />

    );
}


export default ListTicket;
