import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";

function App() {
    const [kngoplnrate, setkngoplnrate] = useState(0);
    const [kngusdtrate, setkngusdtrate] = useState(0);
    const [usdtoplnrate, setusdtoplnrate] = useState(0);

    const getData = async () => {
        const { data : { items } } = await axios.post('https://trade.kanga.exchange/api/markets');
        console.log(items);
    }

    useEffect(() => {
        getData();
    })
  return (
    <div>
        <p>{`Kurs KNG/oPLN: ${kngoplnrate}`}</p>
        <p>{`Kurs KNG/USDT: ${kngusdtrate}`}</p>
        <p>{`Kurs USDT/oPLN: ${usdtoplnrate}`}</p>
    </div>
  );
}

export default App;
