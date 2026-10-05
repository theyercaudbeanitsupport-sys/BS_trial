import { useEffect, useState } from "react";
import "../css/courierAddr.css"
import districts from "../data/statesAndDistricts.json"


function CourierAddr() {

    const states = Object.keys(districts);

    const [name, setName] = useState();
    const [addr, setAddr] = useState();
    const [state, setState] = useState();
    const [district, setDistrict] = useState();
    const [ph, setPh] = useState();
    const [pincode, setPincode] = useState();

    const handleCourierAddr = () => {
        window.print();
    }

    return(
        <div>
            <h2>Courier Address</h2>
            
            <div className="inputDetails">
                <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></input>

                <input className="textArea" placeholder="Address" type="textarea" rows="10" cols="10" value={addr} onChange={(e) => setAddr(e.target.value)} ></input>

                <select value={state} onChange={(e)=>{setState(e.target.value)}}>
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>     

                <select value={district} onChange={(e)=>{setDistrict(e.target.value)}} disabled={!state}>
                    <option value="">Select District</option>
                    {state && districts[state].map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>           

                <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} ></input>

                <input placeholder="Phone number" type="tel" maxLength={10} value={ph} onChange={(e) => setPh(e.target.value)} ></input>
            </div>
            
            <button onClick={handleCourierAddr} style={{position:"relative", zIndex:"10000", marginLeft:"10px"}}>Print</button>

            {/* Formatting to print addr */}
            <div className='addrPrint'>
                <div className='fromAddr'>
                    From<br></br>
                    The Yercaud Bean,<br></br>
                    Lady's seat Rd,<br></br>
                    Yercaud.<br></br>
                    Ph. no: 9994797824
                </div>
                <div className='toAddr'>
                    To<br></br>
                    {name}<br></br>
                    <span style={{ whiteSpace: "pre-line" }}>{addr?.replace(/,\s*/g, ",\n")},<br></br></span>
                    {district},<br></br>
                    {state},<br></br>
                    {pincode}.<br></br>
                    Ph. no: {ph}
                    
                </div>
            </div>
        </div>
    )
}

export default CourierAddr;