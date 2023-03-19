import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AddTicket from './components/ticket/AddTicket';
import ConfigTicket from "./components/ticket/ConfigTicket";
import ListTicket from "./components/ticket/ListTicket";

if (document.getElementById('add_ticket_addon')) {
    const add_ticket = ReactDOM.createRoot(document.getElementById('add_ticket_addon'));
    add_ticket.render(
        <React.StrictMode>
            <AddTicket />
        </React.StrictMode>
    );
}
if (document.getElementById('config_ticket_addon')) {
    const config_ticket_rule = ReactDOM.createRoot(document.getElementById('config_ticket_addon'));
    config_ticket_rule.render(
        <React.StrictMode>
            <ConfigTicket />
        </React.StrictMode>
    );
}
if (document.getElementById('list_ticket_addon')) {
    const list_ticket = ReactDOM.createRoot(document.getElementById('list_ticket_addon'));
    list_ticket.render(
        <React.StrictMode>
            <ListTicket />
        </React.StrictMode>
    );
}



