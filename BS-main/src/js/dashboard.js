import "../css/dashboard.css";
import logo from "../image/tybwhitelogo.png";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import HomeIcon from "@mui/icons-material/Home";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://bs-trial.onrender.com";

const STORE_CUSTOMER_VALUE = "store";

function Dashboard() {

    const navigate = useNavigate();

    // ============================================================
    // DASHBOARD STATE
    // ============================================================

    const [customer, setCustomer] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const [resorts, setResorts] = useState([]);
    const [productsSold, setProductsSold] = useState([]);
    const [loading, setLoading] = useState(false);


    // ============================================================
    // EXCEL / DETAILED ORDER STATE
    // ============================================================

    const [detailCustomer, setDetailCustomer] = useState("");
    const [detailMonth, setDetailMonth] = useState("");
    const [detailYear, setDetailYear] = useState("");

    const [orderDetails, setOrderDetails] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);


    // ============================================================
    // FETCH RESORT CUSTOMERS
    // ============================================================

    useEffect(() => {
        fetchResortCustomers();
    }, []);


    const fetchResortCustomers = async () => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/resort-customers`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch resort customers");
            }

            const data = await response.json();

            setResorts(data);

        } catch (error) {

            console.error(
                "Error fetching resort customers:",
                error
            );

        }
    };


    // ============================================================
    // FETCH MONTHLY RESORT SUMMARY
    // ============================================================

    const fetchResortMonthlyOrders = async (
        customerId,
        selectedMonth,
        selectedYear
    ) => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/resort-customers/${customerId}/monthly-orders?month=${selectedMonth}&year=${selectedYear}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch resort monthly orders"
                );
            }

            const data = await response.json();

            setProductsSold(data);

        } catch (error) {

            console.error(
                "Error fetching resort monthly orders:",
                error
            );

            setProductsSold([]);

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // FETCH MONTHLY SALES FOR STORE CUSTOMERS
    // ============================================================

    const fetchStoreMonthlySales = async (
        selectedMonth,
        selectedYear
    ) => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/store-customers/monthly-sales?month=${selectedMonth}&year=${selectedYear}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch store customer monthly sales"
                );
            }

            const data = await response.json();

            setProductsSold(data);

        } catch (error) {

            console.error(
                "Error fetching store customer monthly sales:",
                error
            );

            setProductsSold([]);

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // FETCH DETAILED RESORT ORDERS
    // ============================================================

    const fetchResortOrderDetails = async (
        customerId,
        selectedMonth,
        selectedYear
    ) => {

        try {

            setDetailLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/resort-customers/${customerId}/monthly-order-details?month=${selectedMonth}&year=${selectedYear}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch resort order details"
                );
            }

            const data = await response.json();

            setOrderDetails(data);

        } catch (error) {

            console.error(
                "Error fetching resort order details:",
                error
            );

            setOrderDetails([]);

        } finally {

            setDetailLoading(false);

        }
    };


    // ============================================================
    // CUSTOMER CHANGE - DASHBOARD
    // ============================================================

    const handleCustomerChange = (e) => {

        const selectedCustomer = e.target.value;

        setCustomer(selectedCustomer);

        setProductsSold([]);

        if (!selectedCustomer || !month || !year) {
            return;
        }

        // STORE CUSTOMER

        if (selectedCustomer === STORE_CUSTOMER_VALUE) {

            fetchStoreMonthlySales(
                month,
                year
            );

            return;
        }

        // RESORT CUSTOMER

        fetchResortMonthlyOrders(
            selectedCustomer,
            month,
            year
        );
    };


    // ============================================================
    // DASHBOARD MONTH CHANGE
    // ============================================================

    const handleMMYYChange = (date) => {

        if (date) {

            const selectedMonth = date.month() + 1;
            const selectedYear = date.year();

            setMonth(selectedMonth);
            setYear(selectedYear);

            setProductsSold([]);

            if (customer) {

                // STORE CUSTOMER

                if (customer === STORE_CUSTOMER_VALUE) {

                    fetchStoreMonthlySales(
                        selectedMonth,
                        selectedYear
                    );

                }

                // RESORT CUSTOMER

                else {

                    fetchResortMonthlyOrders(
                        customer,
                        selectedMonth,
                        selectedYear
                    );

                }
            }

        } else {

            setMonth("");
            setYear("");
            setProductsSold([]);

        }
    };


    // ============================================================
    // DETAIL CUSTOMER CHANGE
    // ============================================================

    const handleDetailCustomerChange = (e) => {

        const selectedCustomer = e.target.value;

        setDetailCustomer(selectedCustomer);
        setOrderDetails([]);

        if (
            !selectedCustomer ||
            !detailMonth ||
            !detailYear
        ) {
            return;
        }

        fetchResortOrderDetails(
            selectedCustomer,
            detailMonth,
            detailYear
        );
    };


    // ============================================================
    // DETAIL MONTH CHANGE
    // ============================================================

    const handleDetailMonthChange = (date) => {

        if (date) {

            const selectedMonth = date.month() + 1;
            const selectedYear = date.year();

            setDetailMonth(selectedMonth);
            setDetailYear(selectedYear);

            setOrderDetails([]);

            if (detailCustomer) {

                fetchResortOrderDetails(
                    detailCustomer,
                    selectedMonth,
                    selectedYear
                );
            }

        } else {

            setDetailMonth("");
            setDetailYear("");
            setOrderDetails([]);

        }
    };


    // ============================================================
    // SELECTED RESORT
    // ============================================================

    const selectedResort = resorts.find(
        (r) =>
            String(r.resort_customer_id) ===
            String(customer)
    );


    // ============================================================
    // SELECTED DETAIL RESORT
    // ============================================================

    const selectedDetailResort = resorts.find(
        (r) =>
            String(r.resort_customer_id) ===
            String(detailCustomer)
    );


    // ============================================================
    // DISPLAY CUSTOMER NAME
    // ============================================================

    const displayCustomerName =
        customer === STORE_CUSTOMER_VALUE
            ? "Store Customer"
            : selectedResort?.customer_name;


    // ============================================================
    // DISPLAY DETAIL CUSTOMER NAME
    // ============================================================

    const displayDetailCustomerName =
        selectedDetailResort?.customer_name;


    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="dashboardMain">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="header">

                <div className="headimg">

                    <img
                        src={logo}
                        alt="logo"
                    />

                    <br />

                    <span
                        style={{
                            color: "white",
                            paddingLeft: "20px"
                        }}
                    >
                        The Yercaud Bean
                    </span>

                </div>

                <div>

                    <button
                        onClick={() => navigate("/")}
                    >
                        <HomeIcon />
                    </button>

                </div>

            </div>


            {/* ==================================================
                DASHBOARD TITLE
            ================================================== */}

            <h2>
                Dashboard
            </h2>


            {/* ==================================================
                DASHBOARD FILTER
            ================================================== */}

            <div className="dashboardFilter">

                <select
                    value={customer}
                    onChange={handleCustomerChange}
                >

                    <option
                        value=""
                        disabled
                        hidden
                    >
                        Select Customer
                    </option>


                    {/* RESORT CUSTOMERS */}

                    {resorts.map((r) => (

                        <option
                            key={r.resort_customer_id}
                            value={r.resort_customer_id}
                        >
                            {r.customer_name}
                        </option>

                    ))}


                    {/* STORE CUSTOMER */}

                    <option
                        value={STORE_CUSTOMER_VALUE}
                    >
                        Store Customer
                    </option>

                </select>


                <DatePicker
                    picker="month"
                    onChange={handleMMYYChange}
                />

            </div>


            {/* ==================================================
                DASHBOARD SUMMARY
            ================================================== */}

            {
                customer &&
                month &&
                year && (

                    <div className="dasboardDisplay">

                        <h2>
                            {displayCustomerName}
                        </h2>

                        <p>
                            {String(month).padStart(2, "0")}
                            /
                            {year}
                        </p>


                        {/* LOADING */}

                        {loading && (
                            <p>
                                Loading...
                            </p>
                        )}


                        {/* PRODUCTS */}

                        {!loading &&
                            productsSold.length > 0 && (

                                <div className="productSalesDisplay">

                                    {productsSold.map(
                                        (prod, index) => (

                                            <div
                                                className="productItem"
                                                key={
                                                    `${prod.item_name || prod.product_name}-${prod.pack_size_grams || ""}-${prod.unit || ""}-${index}`
                                                }
                                            >

                                                <p>

                                                    {
                                                        prod.item_name ||
                                                        prod.product_name
                                                    }

                                                    {
                                                        prod.pack_size_grams
                                                            ? ` (${prod.pack_size_grams}g)`
                                                            : ""
                                                    }

                                                </p>


                                                <p>

                                                    {
                                                        Number(
                                                            prod.total_quantity
                                                        ) *
                                                        (
                                                            prod.pack_size_grams
                                                                ? Number(
                                                                    prod.pack_size_grams
                                                                )
                                                                : 1
                                                        )
                                                    }

                                                    {
                                                        prod.pack_size_grams
                                                            ? "g"
                                                            : prod.unit
                                                                ? ` ${prod.unit}`
                                                                : ""
                                                    }

                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}


                        {/* NO ORDERS */}

                        {!loading &&
                            productsSold.length === 0 && (

                                <p
                                    style={{
                                        color: "grey"
                                    }}
                                >

                                    {
                                        customer === STORE_CUSTOMER_VALUE
                                            ? "No store customer orders found for the selected month."
                                            : "No orders found for this resort in the selected month."
                                    }

                                </p>

                            )}

                    </div>

                )
            }


            {/* ==================================================
                EXCEL / ORDER DETAILS
            ================================================== */}

            <h2>
                Excel
            </h2>


            <div className="detailedDisplayFilter">

                {/* RESORT CUSTOMER */}

                <select
                    value={detailCustomer}
                    onChange={handleDetailCustomerChange}
                >

                    <option
                        value=""
                        disabled
                        hidden
                    >
                        Select Resort
                    </option>


                    {resorts.map((r) => (

                        <option
                            key={r.resort_customer_id}
                            value={r.resort_customer_id}
                        >
                            {r.customer_name}
                        </option>

                    ))}

                </select>


                {/* MONTH */}

                <DatePicker
                    picker="month"
                    onChange={handleDetailMonthChange}
                />

            </div>


            {/* ==================================================
                EXCEL DISPLAY
            ================================================== */}

            {
                detailCustomer &&
                detailMonth &&
                detailYear && (

                    <div className="dasboardDisplay">

                        <h2>
                            {displayDetailCustomerName}
                        </h2>

                        <p>
                            {String(detailMonth).padStart(2, "0")}
                            /
                            {detailYear}
                        </p>


                        {/* LOADING */}

                        {detailLoading && (
                            <p>
                                Loading...
                            </p>
                        )}


                        {/* ==================================================
                            ORDER TABLE
                        ================================================== */}

                        {!detailLoading &&
                            orderDetails.length > 0 && (

                                <div className="productSalesDetailDisplay">

                                    <div className="productDetailDisplayItem">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Date
                                                    </th>

                                                    <th>
                                                        Particulars
                                                    </th>

                                                    <th>
                                                        Quantity
                                                    </th>

                                                    <th>
                                                        Unit Price
                                                    </th>

                                                    <th>
                                                        Total Price
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {orderDetails.map(
                                                    (order) => (

                                                        order.items.map(
                                                            (
                                                                item,
                                                                itemIndex
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        `${order.order_id}-${item.order_item_id || itemIndex}`
                                                                    }
                                                                >

                                                                    {/* DATE */}

                                                                    <td>

                                                                        {
                                                                            itemIndex === 0
                                                                                ? new Date(
                                                                                    order.order_date
                                                                                ).toLocaleDateString(
                                                                                    "en-GB",
                                                                                    {
                                                                                        day: "2-digit",
                                                                                        month: "2-digit",
                                                                                        year: "2-digit"
                                                                                    }
                                                                                )
                                                                                : ""
                                                                        }

                                                                    </td>


                                                                    {/* PARTICULARS */}

                                                                    <td>

                                                                        {
                                                                            item.item_name
                                                                        }

                                                                        {
                                                                            item.pack_size_grams
                                                                                ? ` (${item.pack_size_grams}g)`
                                                                                : ""
                                                                        }

                                                                    </td>


                                                                    {/* QUANTITY */}

                                                                    <td>

                                                                        {
                                                                            item.quantity_display
                                                                        }

                                                                    </td>


                                                                    {/* UNIT PRICE */}

                                                                    <td>

                                                                        {
                                                                            Number(
                                                                                item.unit_price
                                                                            ).toFixed(2)
                                                                        }

                                                                    </td>


                                                                    {/* TOTAL PRICE */}

                                                                    <td>

                                                                        {
                                                                            Number(
                                                                                item.total_price
                                                                            ).toFixed(2)
                                                                        }

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            )}


                        {/* NO ORDERS */}

                        {!detailLoading &&
                            orderDetails.length === 0 && (

                                <p
                                    style={{
                                        color: "grey"
                                    }}
                                >
                                    No orders found for this resort
                                    in the selected month.
                                </p>

                            )}

                    </div>

                )
            }

        </div>

    );
}


export default Dashboard;