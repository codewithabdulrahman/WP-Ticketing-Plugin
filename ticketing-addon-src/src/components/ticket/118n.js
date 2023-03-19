import i18n from "i18next";

import Backend from "i18next-xhr-backend";

import {initReactI18next} from "react-i18next";


i18n

    .use(Backend)

    .use(initReactI18next)

    .init({
        lng: "en",
        resources: {
            en: {
                translation: {

                    Ticket_list: "Ticket List",
                    Save: "Save",
                    Action: "Action",
                    Upload: "Upload",
                    Capture_photo: "Capture Photo",
                    Print: "print",
                    Grandfather_name: "grandfather name",
                    First_name: "first name",
                    Last_name: "last name",
                    Name_of_accompanying_person: "name of accompanying person",
                    Relative_relation: "relative relation",
                    father: "father",
                    mother: "mother",
                    other: "other",
                    Family_name: "family name",
                    Total_tickets: "Total Tickets",
                    Ticket: "Ticket",
                    Relative:"Relative",
                    Total_Sales: "Total Sales",
                    Un_read: "Un-Read",
                    Read: "Read",
                    Filters: "Filters",
                    Export_to_CSV: "Export to CSV",
                    Filter_by_status: "Filters By Status",
                    Filter_by_name: "Filters By Name",
                    Filter_by_age: "Filters By Age",
                    Filter_by_price: "Filters By Price",
                    Filter_by_date_range: "Filter by Date range",
                    no_record_message: "There are no records to display",
                    name: "name",
                    age: "age",
                    price: "price",
                    date_created: "date created",
                    delete: "delete",
                    edit: "edit",
                    status:"status",
                    read:"read",
                    unread:"unread",
                    mark_as_read:"Mark as read",
                    Arabic:"Arabic",
                    Ticket_rules:"Ticket Rules",
                    age_of_4_or_below:"Age of 4 or below",
                    empty_rule_message:"0 or empty will be counted free",
                    age_5_to_11:"Age 5 to 11",
                    age_12_or_above:"Age 12 or above",
                    save_rules:"Save rules",
                    back:"Back",
                    date_of_birth:"Date of birth",

                }
            },
            pr: {
                translation: {
                    back:"الى الخلف",
                    save_rules:"حفظ القواعد",
                    age_12_or_above:"سن 12 وما فوق",
                    age_5_to_11:"من سن 5 إلى 11 عامًا",
                    empty_rule_message:"0 أو فارغة سوف تحسب مجانا",
                    age_of_4_or_below:"سن 4 أو أقل",
                    Ticket_rules:"قواعد التذاكر",
                    Arabic:"عربي",
                    Relative:"نسبية",
                    name: "الاسم",
                    age: "العمر",
                    price: "السعر",
                    date_created:"تاريخ الإنشاء",
                    delete: "حذف",
                    edit: "تعديل",
                    status:"الحالة",
                    no_record_message: "لا توجد سجلات لعرضها",
                    Filters: "التصفية",
                    Filter_by_status: "تصفية حسب الحالة",
                    Filter_by_name: "تصفية حسب الاسم",
                    Filter_by_age: "تصفية حسب العمر",
                    Filter_by_price: "تصفية حسب السعر",
                    Filter_by_date_range: "تصفية حسب النطاق الزمني",
                    Total_Sales: "إجمالي المبيعات",
                    Un_Read: " محسوب غير",
                    Read: "محسوب",
                    read:"محسوب",
                    mark_as_read:"ضع إشارة مقروء",
                    unread:"محسوب غير",
                    Export_to_CSV: "إلى تصدير CSV",
                    Ticket: "التذكرة",
                    Ticket_list: "قائمة التذاكر",
                    Total_tickets: "إجمالي التذاكر",
                    Family_name: "اسم العائلة",
                    father: "الأب",
                    mother: "الأم",
                    other: "آخر",
                    Relative_relation: " علاقةنسبية",
                    Last_name: "اللقب",
                    Name_of_accompanying_person: "اسم الشخص المرافق",
                    First_name: "الاسم الأول",
                    Grandfather_name: "اسم الجد",
                    Image_uploaded: "الصورة رفع",
                    Print: "طباعة",
                    Save: "حفظ",
                    Action: "عمل",
                    Upload: "رفع",
                    Capture_photo: "لتقاط الصورة",
                    date_of_birth:"تاريخ الولادة",
                }
            },

        },
        keySeparator: false,
        interpolation: {escapeValue: false}
    });


export default i18n;
