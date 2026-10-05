import "../css/mainPage.css";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../image/tybwhitelogo.png";
import logoblack from "../image/tyblogoblack.jpeg";
import esign1 from "../image/georgeEsign.jpeg";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PrintIcon from "@mui/icons-material/Print";

const units = ["kg", "gms", "pcs"];

const API_BASE_URL = "http://localhost:5000";

const msme = process.env.REACT_APP_MSME;

function MainPage() {
    const navigate = useNavigate();

    // ============================================================
    // BILL TYPE
    // ============================================================

    const [billType, setBillType] = useState("resort");

    // ============================================================
    // RESORT CUSTOMER BILLING
    // ============================================================

    const [resortCustomers, setResortCustomers] = useState([]);
    const [resortProducts, setResortProducts] = useState([]);

    const [resortCustomer, setResortCustomer] = useState("");
    const [resortProduct, setResortProduct] = useState("");
    const [resortQuantity, setResortQuantity] = useState(1);

    const [resortCart, setResortCart] = useState([]);

    // ============================================================
    // STORE CUSTOMER BILLING
    // ============================================================

    const [storeProducts, setStoreProducts] = useState([]);

    const [storeCustomerName, setStoreCustomerName] = useState("");
    const [storeCustomerAddress, setStoreCustomerAddress] =
        useState("");

    const [storeProduct, setStoreProduct] = useState("");
    const [storeQuantity, setStoreQuantity] = useState(1);
    const [storeUnit, setStoreUnit] = useState("");
    const [storePrice, setStorePrice] = useState("");

    const [storeCart, setStoreCart] = useState([]);

    // ============================================================
    // COMMON BILL DETAILS
    // ============================================================

    const [billNo, setBillNo] = useState(1);
    const [balance, setBalance] = useState("");

    const [isManual, setIsManual] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    const [savingOrder, setSavingOrder] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);

    // ============================================================
    // DATE
    // ============================================================

    const getTodayDate = () => {
        const currentDate = new Date();

        return currentDate
            .toISOString()
            .split("T")[0];
    };

    const todayDate = getTodayDate();

    useEffect(() => {
        if (!isManual) {
            setSelectedDate(todayDate);
        }
    }, [isManual, todayDate]);

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
                throw new Error(
                    "Failed to fetch resort customers"
                );
            }

            const data = await response.json();

            setResortCustomers(data);
        } catch (error) {
            console.error(
                "Error fetching resort customers:",
                error
            );
        }
    };

    // ============================================================
    // FETCH STORE PRODUCTS
    // ============================================================

    useEffect(() => {
        fetchStoreProducts();
    }, []);

    const fetchStoreProducts = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/store-customers/products`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch store products"
                );
            }

            const data = await response.json();

            setStoreProducts(data);
        } catch (error) {
            console.error(
                "Error fetching store products:",
                error
            );

            setStoreProducts([]);
        }
    };

    // ============================================================
    // FETCH PRODUCTS FOR SELECTED RESORT
    // ============================================================

    const fetchResortProducts = async (customerId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resort-customers/${customerId}/products`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch products for resort"
                );
            }

            const data = await response.json();

            setResortProducts(data);
        } catch (error) {
            console.error(
                "Error fetching resort products:",
                error
            );

            setResortProducts([]);
        }
    };

    // ============================================================
    // CHANGE BILL TYPE
    // ============================================================

    const handleBillTypeChange = (type) => {
        if (savingOrder) {
            return;
        }

        setBillType(type);

        // Clear resort data
        setResortCustomer("");
        setResortProduct("");
        setResortQuantity(1);
        setResortProducts([]);
        setResortCart([]);

        // Clear store data
        setStoreCustomerName("");
        setStoreCustomerAddress("");
        setStoreProduct("");
        setStoreQuantity(1);
        setStoreUnit("");
        setStorePrice("");
        setStoreCart([]);

        setBalance("");
        setOrderSaved(false);
    };

    // ============================================================
    // RESORT CUSTOMER CHANGE
    // ============================================================

    const handleResortCustomerChange = async (e) => {
        const customerId = e.target.value;

        setResortCustomer(customerId);
        setResortProduct("");
        setResortQuantity(1);
        setOrderSaved(false);

        if (!customerId) {
            setResortProducts([]);
            return;
        }

        await fetchResortProducts(customerId);
    };

    // ============================================================
    // SELECTED RESORT CUSTOMER
    // ============================================================

    const selectedResortCustomer =
        resortCustomers.find(
            (c) =>
                String(c.resort_customer_id) ===
                String(resortCustomer)
        );

    // ============================================================
    // SELECTED RESORT PRODUCT
    // ============================================================

    const selectedResortProduct =
        resortProducts.find((p) => {
            if (
                p.combo_id !== null &&
                p.combo_id !== undefined
            ) {
                return (
                    `combo-${p.combo_id}` ===
                    resortProduct
                );
            }

            return (
                `variant-${p.product_variant_id}` ===
                resortProduct
            );
        });

    // ============================================================
    // RESORT PRICE
    // ============================================================

    const resortUnitPrice = selectedResortProduct
        ? Number(selectedResortProduct.price)
        : 0;

    const resortItemTotal =
        resortUnitPrice *
        Number(resortQuantity || 0);

    // ============================================================
    // ADD RESORT ITEM
    // ============================================================

    const handleAddResortItem = () => {
        if (!resortCustomer) {
            alert("Please select a resort customer.");
            return;
        }

        if (!resortProduct) {
            alert("Please select a product.");
            return;
        }

        if (
            !resortQuantity ||
            Number(resortQuantity) <= 0
        ) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (!selectedResortProduct) {
            alert("Product details not found.");
            return;
        }

        const newItem = {
            id: Date.now(),

            resortCustomerId:
                Number(resortCustomer),

            productVariantId:
                selectedResortProduct
                    .product_variant_id ??
                null,

            comboId:
                selectedResortProduct.combo_id ??
                null,

            product:
                selectedResortProduct.product_name ||
                selectedResortProduct.combo_name,

            packSize:
                selectedResortProduct
                    .pack_size_grams ??
                null,

            quantity:
                Number(resortQuantity),

            price:
                Number(selectedResortProduct.price),

            total:
                Number(selectedResortProduct.price) *
                Number(resortQuantity)
        };

        setResortCart((prevCart) => [
            ...prevCart,
            newItem
        ]);

        setResortProduct("");
        setResortQuantity(1);
        setOrderSaved(false);
    };

    // ============================================================
    // DELETE RESORT ITEM
    // ============================================================

    const handleDeleteResortItem = (id) => {
        setResortCart((prevCart) =>
            prevCart.filter(
                (item) => item.id !== id
            )
        );

        setOrderSaved(false);
    };


    // ============================================================
    // SELECTED STORE PRODUCT
    // ============================================================

    const selectedStoreProduct =
        storeProducts.find(
            (p) =>
                String(p.product_id) ===
                String(storeProduct)
        );

    // ============================================================
    // STORE TOTAL CALCULATION
    //
    // kg:
    // price entered is per kg
    //
    // gms:
    // price entered is per kg
    //
    // pcs:
    // price entered is per piece
    // ============================================================

    let storeItemTotal = 0;

    if (storeUnit === "gms") {
        storeItemTotal =
            (Number(storeQuantity || 0) / 1000) *
            Number(storePrice || 0);
    } else {
        storeItemTotal =
            Number(storeQuantity || 0) *
            Number(storePrice || 0);
    }

    // ============================================================
    // ADD STORE ITEM
    // ============================================================

    const handleAddStoreItem = () => {
        if (!storeCustomerName.trim()) {
            alert("Please enter the customer name.");
            return;
        }

        if (!storeCustomerAddress.trim()) {
            alert("Please enter the customer address.");
            return;
        }

        if (!storeProduct) {
            alert("Please select a product.");
            return;
        }

        if (
            !storeQuantity ||
            Number(storeQuantity) <= 0
        ) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (!storeUnit) {
            alert("Please select a unit.");
            return;
        }

        if (
            storePrice === "" ||
            Number(storePrice) < 0
        ) {
            alert("Please enter a valid price.");
            return;
        }

        if (!selectedStoreProduct) {
            alert("Product details not found.");
            return;
        }

        const newItem = {
            id: Date.now(),

            productId:
                Number(
                    selectedStoreProduct.product_id
                ),

            product:
                selectedStoreProduct.product_name,

            quantity:
                Number(storeQuantity),

            unit:
                storeUnit,

            price:
                Number(storePrice),

            total:
                Number(storeItemTotal)
        };

        setStoreCart((prevCart) => [
            ...prevCart,
            newItem
        ]);

        setStoreProduct("");
        setStoreQuantity(1);
        setStoreUnit("");
        setStorePrice("");
        setOrderSaved(false);
    };

    // ============================================================
    // DELETE STORE ITEM
    // ============================================================

    const handleDeleteStoreItem = (id) => {
        setStoreCart((prevCart) =>
            prevCart.filter(
                (item) => item.id !== id
            )
        );

        setOrderSaved(false);
    };

    // ============================================================
    // STORE CUSTOMER / BILL TOTAL
    // ============================================================

    const itemCart =
        billType === "resort"
            ? resortCart
            : storeCart;

    const itemsTotal =
        billType === "resort"
            ? resortCart.reduce(
                  (sum, item) =>
                      sum + Number(item.total),
                  0
              )
            : storeCart.reduce(
                  (sum, item) =>
                      sum + Number(item.total),
                  0
              );

    const balanceAmount =
        Number(balance || 0);

    const grandTotal =
        itemsTotal + balanceAmount;

    // ============================================================
    // SAVE RESORT ORDER
    // ============================================================

    const saveResortOrder = async () => {
        if (!resortCustomer) {
            return true;
        }

        if (resortCart.length === 0) {
            return true;
        }

        if (orderSaved) {
            return true;
        }

        try {
            setSavingOrder(true);

            const items =
                resortCart.map((item) => ({
                    productVariantId:
                        item.productVariantId,

                    comboId:
                        item.comboId,

                    quantity:
                        item.quantity,

                    /*
                     * IMPORTANT:
                     *
                     * price in order_item is TOTAL
                     * price for this item.
                     *
                     * Example:
                     * quantity = 2
                     * unit price = 235
                     * order_item.price = 470
                     */
                    price:
                        Number(item.price) *
                        Number(item.quantity)
                }));

            const response = await fetch(
                `${API_BASE_URL}/api/resort-customers/${resortCustomer}/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        orderDate:
                            selectedDate,

                        totalAmount:
                            Number(grandTotal),

                        items
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save resort order"
                );
            }

            console.log(
                "Resort order saved:",
                data
            );

            setOrderSaved(true);

            return true;
        } catch (error) {
            console.error(
                "Error saving resort order:",
                error
            );

            alert(
                "Failed to save the resort order. Please try again."
            );

            return false;
        } finally {
            setSavingOrder(false);
        }
    };

    // ============================================================
    // SAVE STORE CUSTOMER ORDER
    // ============================================================

    const saveStoreOrder = async () => {
        if (!storeCustomerName.trim()) {
            return true;
        }

        if (storeCart.length === 0) {
            return true;
        }

        if (orderSaved) {
            return true;
        }

        try {
            setSavingOrder(true);

            const items =
                storeCart.map((item) => ({
                    productId:
                        item.productId,

                    quantity:
                        item.quantity,

                    unit:
                        item.unit,

                    /*
                     * IMPORTANT:
                     *
                     * order_item.price stores the TOTAL
                     * price for the item.
                     *
                     * Example:
                     * 2 kg × ₹500 = ₹1000
                     * price sent = 1000
                     *
                     * Example:
                     * 500 g × ₹500/kg = ₹250
                     * price sent = 250
                     */
                    price:
                        Number(item.total)
                }));

            const response = await fetch(
                `${API_BASE_URL}/api/store-customers/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        customerName:
                            storeCustomerName.trim(),

                        address:
                            storeCustomerAddress.trim(),

                        orderDate:
                            selectedDate,

                        totalAmount:
                            Number(grandTotal),

                        items
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save store order"
                );
            }

            console.log(
                "Store order saved:",
                data
            );

            setOrderSaved(true);


            return true;
        } catch (error) {
            console.error(
                "Error saving store order:",
                error
            );

            alert(
                "Failed to save the store order. Please try again."
            );

            return false;
        } finally {
            setSavingOrder(false);
        }
    };

    // ============================================================
    // SAVE CURRENT ORDER
    // ============================================================

    const saveCurrentOrder = async () => {
        if (billType === "resort") {
            return await saveResortOrder();
        }

        return await saveStoreOrder();
    };

    // ============================================================
    // NEW BILL
    // ============================================================

    const handleNewBill = () => {
        if (savingOrder) {
            return;
        }

        // Resort
        setResortCustomer("");
        setResortProduct("");
        setResortQuantity(1);
        setResortProducts([]);
        setResortCart([]);

        // Store
        setStoreCustomerName("");
        setStoreCustomerAddress("");
        setStoreProduct("");
        setStoreQuantity(1);
        setStoreUnit("");
        setStorePrice("");
        setStoreCart([]);

        setBalance("");
        setOrderSaved(false);
        setSavingOrder(false);

        setBillNo((prev) => prev + 1);
    };

    // ============================================================
    // NUMBER TO WORDS
    // ============================================================

    function numberToWords(num) {
        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen"
        ];

        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety"
        ];

        function convert(n) {
            if (n === 0) {
                return "";
            }

            if (n < 20) {
                return ones[n];
            }

            if (n < 100) {
                return (
                    tens[Math.floor(n / 10)] +
                    " " +
                    ones[n % 10]
                );
            }

            if (n < 1000) {
                return (
                    ones[Math.floor(n / 100)] +
                    " Hundred " +
                    convert(n % 100)
                );
            }

            if (n < 100000) {
                return (
                    convert(
                        Math.floor(n / 1000)
                    ) +
                    " Thousand " +
                    convert(n % 1000)
                );
            }

            if (n < 10000000) {
                return (
                    convert(
                        Math.floor(n / 100000)
                    ) +
                    " Lakh " +
                    convert(n % 100000)
                );
            }

            return (
                convert(
                    Math.floor(n / 10000000)
                ) +
                " Crore " +
                convert(n % 10000000)
            );
        }

        if (!num || num === 0) {
            return "Zero Only";
        }

        return (
            convert(Math.floor(num)) +
            " Only"
        );
    }

    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (dateStr) => {
        if (!dateStr) {
            return "";
        }

        const [
            year,
            month,
            day
        ] = dateStr.split("-");

        return `${day}/${month}/${year}`;
    };

    // ============================================================
    // PRINT
    // ============================================================

    const handlePrint = async () => {
        if (
            billType === "resort" &&
            resortCart.length > 0
        ) {
            const saved =
                await saveResortOrder();

            if (!saved) {
                return;
            }
        }

        if (
            billType === "store" &&
            storeCart.length > 0
        ) {
            const saved =
                await saveStoreOrder();

            if (!saved) {
                return;
            }
        }

        window.print();
    };

    // ============================================================
    // BILLING CUSTOMER DETAILS
    // ============================================================

    const billingCustomerName =
        billType === "resort"
            ? selectedResortCustomer
                  ?.customer_name || ""
            : storeCustomerName;

    const billingCustomerAddress =
        billType === "resort"
            ? selectedResortCustomer
                  ?.address || ""
            : storeCustomerAddress;

    // ============================================================
    // BALANCE SERIAL NUMBER
    // ============================================================

    const balanceSNo =
        itemCart.length + 1;

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="maindiv">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="header">

                <div>

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
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        <DashboardIcon />
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/courier"
                            )
                        }
                    >
                        <PrintIcon />
                    </button>

                </div>

            </div>

            <div className="mainbody">

                {/* =================================================
                    BILL TYPE
                ================================================= */}

                <h2>
                    Credit Bill
                </h2>

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <button
                        onClick={() =>
                            handleBillTypeChange(
                                "resort"
                            )
                        }
                        disabled={
                            savingOrder ||
                            resortCart.length > 0 ||
                            storeCart.length > 0
                        }
                        style={{
                            marginRight: "10px",
                            padding: "8px 20px",
                            background:
                                billType ===
                                "resort"
                                    ? "#333"
                                    : "#ddd",
                            color:
                                billType ===
                                "resort"
                                    ? "white"
                                    : "black"
                        }}
                    >
                        Resort Customer
                    </button>

                    <button
                        onClick={() =>
                            handleBillTypeChange(
                                "store"
                            )
                        }
                        disabled={
                            savingOrder ||
                            resortCart.length > 0 ||
                            storeCart.length > 0
                        }
                        style={{
                            padding: "8px 20px",
                            background:
                                billType ===
                                "store"
                                    ? "#333"
                                    : "#ddd",
                            color:
                                billType ===
                                "store"
                                    ? "white"
                                    : "black"
                        }}
                    >
                        Store Customer
                    </button>

                </div>

                {/* =================================================
                    DATE + BILL NUMBER
                ================================================= */}

                <div className="selectDateandBillNo">

                    <div>

                        <input
                            type="date"
                            style={{
                                marginRight:
                                    "10px",
                                paddingTop:
                                    "3px",
                                paddingBottom:
                                    "3px"
                            }}
                            value={
                                selectedDate
                            }
                            onChange={(e) =>
                                setSelectedDate(
                                    e.target.value
                                )
                            }
                            disabled={
                                !isManual
                            }
                        />

                        <button
                            onClick={() =>
                                setIsManual(
                                    !isManual
                                )
                            }
                        >
                            {isManual
                                ? "Today"
                                : "Custom"}
                        </button>

                    </div>

                    <div>

                        <input
                            type="number"
                            placeholder="Bill No"
                            value={billNo}
                            onChange={(e) =>
                                setBillNo(
                                    Number(
                                        e.target
                                            .value
                                    )
                                )
                            }
                            style={{
                                marginRight:
                                    "10px",
                                marginBottom:
                                    "10px",
                                paddingTop:
                                    "3px",
                                paddingBottom:
                                    "3px",
                                border:
                                    "2px solid black",
                                borderRadius:
                                    "5px",
                                paddingLeft:
                                    "5px"
                            }}
                        />

                    </div>

                </div>

                {/* =================================================
                    RESORT BILLING
                ================================================= */}

                {billType === "resort" && (

                    <>

                        <h3>
                            Resort Customer
                        </h3>

                        <div className="inputDetails">

                            <select
                                style={{
                                    width:
                                        "300px",
                                    border:
                                        "2px solid black",
                                    borderRadius:
                                        "5px",
                                    paddingTop:
                                        "10px",
                                    paddingBottom:
                                        "10px",
                                    paddingLeft:
                                        "5px"
                                }}
                                value={
                                    resortCustomer
                                }
                                onChange={
                                    handleResortCustomerChange
                                }
                                disabled={
                                    resortCart.length >
                                    0
                                }
                            >

                                <option value="">
                                    Select customer
                                </option>

                                {resortCustomers.map(
                                    (c) => (
                                        <option
                                            key={
                                                c.resort_customer_id
                                            }
                                            value={
                                                c.resort_customer_id
                                            }
                                        >
                                            {
                                                c.customer_name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            {/* PRODUCT */}

                            <select
                                style={{
                                    width:
                                        "300px",
                                    border:
                                        "2px solid black",
                                    borderRadius:
                                        "5px",
                                    paddingTop:
                                        "10px",
                                    paddingBottom:
                                        "10px",
                                    paddingLeft:
                                        "5px"
                                }}
                                value={
                                    resortProduct
                                }
                                onChange={(e) =>
                                    setResortProduct(
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    !resortCustomer
                                }
                            >

                                <option value="">
                                    Select product
                                </option>

                                {resortProducts.map(
                                    (p) => {

                                        const isCombo =
                                            p.combo_id !==
                                                null &&
                                            p.combo_id !==
                                                undefined;

                                        const value =
                                            isCombo
                                                ? `combo-${p.combo_id}`
                                                : `variant-${p.product_variant_id}`;

                                        let displayName =
                                            p.product_name;

                                        if (
                                            isCombo
                                        ) {
                                            displayName =
                                                p.combo_name ||
                                                p.product_name ||
                                                `Combo ${p.combo_id}`;
                                        }

                                        if (
                                            p.pack_size_grams
                                        ) {
                                            displayName +=
                                                ` (${p.pack_size_grams}g)`;
                                        }

                                        return (
                                            <option
                                                key={
                                                    value
                                                }
                                                value={
                                                    value
                                                }
                                            >
                                                {
                                                    displayName
                                                }
                                            </option>
                                        );
                                    }
                                )}

                            </select>

                            {/* QUANTITY */}

                            <input
                                style={{
                                    width:
                                        "290px",
                                    border:
                                        "2px solid black",
                                    borderRadius:
                                        "5px",
                                    paddingTop:
                                        "10px",
                                    paddingBottom:
                                        "10px",
                                    paddingLeft:
                                        "5px"
                                }}
                                type="number"
                                placeholder="Enter quantity"
                                value={
                                    resortQuantity
                                }
                                min="1"
                                onChange={(e) =>
                                    setResortQuantity(
                                        Number(
                                            e.target
                                                .value
                                        )
                                    )
                                }
                            />

                            {/* PRICE */}

                            <input
                                style={{
                                    width:
                                        "290px",
                                    border:
                                        "2px solid black",
                                    borderRadius:
                                        "5px",
                                    paddingTop:
                                        "10px",
                                    paddingBottom:
                                        "10px",
                                    paddingLeft:
                                        "5px"
                                }}
                                type="text"
                                value={
                                    selectedResortProduct
                                        ? `₹${resortUnitPrice}`
                                        : ""
                                }
                                readOnly
                                placeholder="Price"
                            />

                            {/* TOTAL */}

                            <input
                                style={{
                                    width:
                                        "290px",
                                    border:
                                        "2px solid black",
                                    borderRadius:
                                        "5px",
                                    paddingTop:
                                        "10px",
                                    paddingBottom:
                                        "10px",
                                    paddingLeft:
                                        "5px"
                                }}
                                type="text"
                                value={
                                    selectedResortProduct
                                        ? `₹${resortItemTotal}`
                                        : ""
                                }
                                readOnly
                                placeholder="Total price"
                            />

                            <button
                                onClick={
                                    handleAddResortItem
                                }
                                disabled={
                                    !resortCustomer
                                }
                            >
                                Add
                            </button>

                        </div>

                        {/* RESORT ITEMS */}

                        <h3
                            style={{
                                fontFamily:
                                    "'Times New Roman', Times, serif"
                            }}
                        >
                            Resort Items
                        </h3>

                        {resortCart.length ===
                        0 ? (

                            <p
                                style={{
                                    color:
                                        "grey",
                                    fontFamily:
                                        "monospace",
                                    fontSize:
                                        "15px"
                                }}
                            >
                                No items added
                            </p>

                        ) : (

                            <table
                                className="itemDisplayTable"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Qty
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {resortCart.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        selectedResortCustomer?.customer_name
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        item.product
                                                    }

                                                    {item.packSize
                                                        ? ` (${item.packSize}g)`
                                                        : ""}

                                                </td>

                                                <td>
                                                    {
                                                        item.quantity
                                                    }
                                                </td>

                                                <td>
                                                    ₹
                                                    {
                                                        item.price
                                                    }
                                                </td>

                                                <td>
                                                    ₹
                                                    {
                                                        item.total
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteResortItem(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </>

                )}

                {/* =================================================
                    STORE CUSTOMER BILLING
                ================================================= */}

                {billType === "store" && (

                    <>

                        <h3>
                            Store Customer
                        </h3>

                        <div className="inputDetailsForCustomers">
                            {/* PRODUCT */}

                            <select
                                value={
                                    storeProduct
                                }
                                onChange={(e) =>
                                    setStoreProduct(
                                        e.target
                                            .value
                                    )
                                }
                            >

                                <option value="">
                                    Select product
                                </option>

                                {storeProducts.map(
                                    (product) => (

                                        <option
                                            key={
                                                product.product_id
                                            }
                                            value={
                                                product.product_id
                                            }
                                        >
                                            {
                                                product.product_name
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                            {/* QUANTITY */}

                            <input
                                className="customerQuantity"
                                type="number"
                                placeholder="Enter Quantity"
                                value={
                                    storeQuantity
                                }
                                min="0.001"
                                step="any"
                                onChange={(e) =>
                                    setStoreQuantity(
                                        Number(
                                            e.target
                                                .value
                                        )
                                    )
                                }
                            />

                            {/* UNIT */}

                            <select
                                value={
                                    storeUnit
                                }
                                onChange={(e) =>
                                    setStoreUnit(
                                        e.target
                                            .value
                                    )
                                }
                            >

                                <option value="">
                                    Select Unit
                                </option>

                                {units.map(
                                    (unit) => (

                                        <option
                                            key={
                                                unit
                                            }
                                            value={
                                                unit
                                            }
                                        >
                                            {unit}
                                        </option>

                                    )
                                )}

                            </select>

                            <br />

                            <span
                                style={{
                                    color:
                                        "red"
                                }}
                            >
                                Enter per kg price
                                when choosing
                                kg/gms. For pcs,
                                enter per piece
                                price.
                            </span>

                            <br />
                            <br />

                            {/* PRICE */}

                            <input
                                placeholder="Enter Price"
                                type="number"
                                min="0"
                                step="any"
                                value={
                                    storePrice
                                }
                                onChange={(e) =>
                                    setStorePrice(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            {/* TOTAL */}

                            <input
                                type="text"
                                value={
                                    storePrice !==
                                        "" &&
                                    storeQuantity
                                        ? `₹${storeItemTotal}`
                                        : ""
                                }
                                readOnly
                                placeholder="Total price"
                            />

                            <br />

                            <button
                                onClick={
                                    handleAddStoreItem
                                }
                            >
                                Add
                            </button>

                        </div>

                        {/* STORE ITEMS */}

                        <h3
                            style={{
                                fontFamily:
                                    "'Times New Roman', Times, serif"
                            }}
                        >
                            Store Customer Items
                        </h3>

                        {storeCart.length ===
                        0 ? (

                            <p
                                style={{
                                    color:
                                        "grey",
                                    fontFamily:
                                        "monospace",
                                    fontSize:
                                        "15px"
                                }}
                            >
                                No items added
                            </p>

                        ) : (

                            <table
                                className="itemDisplayTable"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Qty
                                        </th>

                                        <th>
                                            Unit Price
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {storeCart.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        storeCustomerName
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.product
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.quantity
                                                    }
                                                    {" "}
                                                    {
                                                        item.unit
                                                    }
                                                </td>

                                                <td>
                                                    ₹
                                                    {
                                                        item.price
                                                    }

                                                    {item.unit ===
                                                    "gms"
                                                        ? " / kg"
                                                        : item.unit ===
                                                          "kg"
                                                        ? " / kg"
                                                        : " / pcs"}
                                                </td>

                                                <td>
                                                    ₹
                                                    {
                                                        item.total
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteStoreItem(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </>

                )}

                {/* =================================================
                    BALANCE
                ================================================= */}

                <input
                    onChange={(e) =>
                        setBalance(
                            e.target.value
                        )
                    }
                    value={balance}
                    style={{
                        width: "290px",
                        border:
                            "2px solid black",
                        borderRadius:
                            "5px",
                        paddingTop:
                            "10px",
                        paddingBottom:
                            "10px",
                        paddingLeft:
                            "5px",
                        marginTop:
                            "20px"
                    }}
                    type="number"
                    placeholder="Balance"
                />

                {/* =================================================
                    TOTAL
                ================================================= */}

                <h2>
                    Total: ₹{grandTotal}
                </h2>

                {/* =================================================
                    PRINT / NEW BILL
                ================================================= */}

                <button
                    onClick={handlePrint}
                    disabled={
                        savingOrder ||
                        itemCart.length === 0
                    }
                    style={{
                        position:
                            "relative",
                        zIndex:
                            "10000"
                    }}
                >
                    {savingOrder
                        ? "Saving..."
                        : "Print"}
                </button>

                {itemCart.length > 0 && (

                    <button
                        onClick={
                            handleNewBill
                        }
                        disabled={
                            savingOrder
                        }
                        style={{
                            position:
                                "relative",
                            zIndex:
                                "10000",
                            marginLeft:
                                "10px"
                        }}
                    >
                        New Bill
                    </button>

                )}

                {/* =================================================
                    PRINT BILL
                ================================================= */}

                <div className="printBill">

                    <div className="billHeader">
                        Credit Bill
                    </div>

                    {/* OWNER DETAILS */}

                    <div className="ownerDetails">

                        <div className="ownerDetailsLeft">

                            <span>
                                {msme}
                            </span>

                            <br />

                        </div>

                        <div className="ownerDetailsRight">

                            <img
                                src={
                                    logoblack
                                }
                                style={{
                                    width:
                                        "50px"
                                }}
                                alt="logo"
                            />

                            <br />

                            <span
                                style={{
                                    fontSize:
                                        "15px"
                                }}
                            >
                                The Yercaud Bean
                            </span>

                            <br />

                            <span>
                                Lady's seat Rd,
                            </span>

                            <br />

                            <span>
                                Yercaud.
                            </span>

                            <br />

                            9994797824
                            <br />
                            8489333469

                        </div>

                    </div>

                    {/* CUSTOMER DETAILS */}

                    <div className="customerDetails">

                        <div className="toAddr">

                            <span
                                style={{
                                    fontWeight:
                                        "bold"
                                }}
                            >
                                BILL NO:
                            </span>

                            {" "}
                            {billNo}

                            <br />

                            <span
                                style={{
                                    fontWeight:
                                        "bold"
                                }}
                            >
                                BILLING TO:
                            </span>

                            <br />

                            {billingCustomerName}

                            <br />

                            {billingCustomerAddress}

                        </div>

                        <div className="toDate">

                            <span
                                style={{
                                    fontWeight:
                                        "bold"
                                }}
                            >
                                BILLING DATE:
                            </span>

                            <br />

                            {formatDate(
                                selectedDate
                            )}

                        </div>

                    </div>

                    {/* =================================================
                        BILL ITEMS
                    ================================================= */}

                    <table className="itemTable">

                        <tbody>

                            <tr
                                className="itemDisplayHeader"
                            >

                                <td
                                    style={{
                                        width:
                                            "50px"
                                    }}
                                >
                                    S No.
                                </td>

                                <td>
                                    Description
                                </td>

                                <td
                                    style={{
                                        width:
                                            "90px"
                                    }}
                                >
                                    Quantity
                                </td>

                                <td
                                    style={{
                                        width:
                                            "90px"
                                    }}
                                >
                                    Unit Price
                                </td>

                                <td
                                    style={{
                                        width:
                                            "90px"
                                    }}
                                >
                                    Total Price
                                </td>

                            </tr>

                            {/* =================================================
                                RESORT ITEMS
                            ================================================= */}

                            {billType ===
                                "resort" &&
                                resortCart.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="itemDisplay"
                                        >

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                {
                                                    index +
                                                    1
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    paddingLeft:
                                                        "5px"
                                                }}
                                            >

                                                {
                                                    item.product
                                                }

                                                {item.packSize
                                                    ? ` (${item.packSize}g)`
                                                    : ""}

                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                {
                                                    item.quantity
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                ₹
                                                {
                                                    item.price
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                ₹
                                                {
                                                    item.total
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            {/* =================================================
                                STORE ITEMS
                            ================================================= */}

                            {billType ===
                                "store" &&
                                storeCart.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="itemDisplay"
                                        >

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                {
                                                    index +
                                                    1
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    paddingLeft:
                                                        "5px"
                                                }}
                                            >
                                                {
                                                    item.product
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                {
                                                    item.quantity
                                                }
                                                {
                                                    item.unit
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                ₹
                                                {
                                                    item.price
                                                }

                                                {item.unit ===
                                                "gms"
                                                    ? " / kg"
                                                    : item.unit ===
                                                      "kg"
                                                    ? " / kg"
                                                    : " / pcs"}
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >
                                                ₹
                                                {
                                                    item.total
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            {/* =================================================
                                BALANCE
                            ================================================= */}

                            {balanceAmount >
                                0 && (

                                <tr>

                                    <td
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >
                                        {
                                            balanceSNo
                                        }
                                    </td>

                                    <td
                                        style={{
                                            paddingLeft:
                                                "5px"
                                        }}
                                    >
                                        Balance
                                    </td>

                                    <td
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                        colSpan={
                                            2
                                        }
                                    >
                                        ₹
                                        {
                                            balanceAmount
                                        }
                                    </td>

                                    <td
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >
                                        ₹
                                        {
                                            balanceAmount
                                        }
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <table className="amtTable">

                        <tbody>

                            <tr>

                                <td
                                    style={{
                                        paddingLeft:
                                            "5px"
                                    }}
                                >

                                    <span
                                        style={{
                                            fontWeight:
                                                "bold"
                                        }}
                                    >
                                        Amount in words:
                                    </span>

                                    {" "}

                                    {
                                        numberToWords(
                                            grandTotal
                                        )
                                    }

                                </td>

                                <td
                                    style={{
                                        width:
                                            "90px",
                                        textAlign:
                                            "center",
                                        borderRight:
                                            "1px white solid",
                                        fontWeight:
                                            "bold"
                                    }}
                                >
                                    Grand Total
                                </td>

                                <td
                                    style={{
                                        width:
                                            "90px",
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    {
                                        grandTotal
                                    }
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="footer">

                        <div className="terms">

                            <span
                                style={{
                                    fontWeight:
                                        "bold"
                                }}
                            >
                                Terms & Condition
                                <sup>
                                    *
                                </sup>
                            </span>

                            <br />

                            Payment must be paid
                            within 15 days
                            from the issue
                            of bill.

                        </div>

                        <div className="signature">

                            <img
                                src={
                                    esign1
                                }
                                style={{
                                    width:
                                        "70px",
                                    marginLeft:
                                        "350px"
                                }}
                                alt="signature"
                            />

                            <br />

                            Signature

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default MainPage;