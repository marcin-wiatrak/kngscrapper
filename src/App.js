import {useEffect, useState} from "react";
import axios from "axios";
import {
    Button, Divider, Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField, ToggleButton, ToggleButtonGroup,
    Typography,
} from "@mui/material";
import clsx from "clsx";
import {Autorenew} from "@mui/icons-material";
import {withStyles} from '@mui/styles';

const styles = {
    main: {
        padding: 16,
    },
    ratesRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    divider: {
        margin: '8px 0 16px 0 !important'
    },
    splitterControls: {
        display: "flex",
        flexDirection: "column",
        '& > *': {
            marginBottom: '12px !important',
        }
    },
    splitterInputWithSelect: {
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        justifyContent: "space-between",
    },
    splitterActions: {
        display: 'flex',
        justifyContent: "space-between",
    },
    splitterSummaryContainer: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 500,
        overflow: 'auto',
        marginTop: 24,
        justifyContent: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
        borderRadius: 10,
    },
    splitterSummaryRow: {
        width: '80%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '20px 1fr 1fr 1fr',
        '& > p:nth-child(2)': {
            textAlign: 'center',
        },
        '& > p:nth-child(4)': {
            textAlign: 'right',
        },
        '& > p:nth-child(3)': {
            textAlign: 'center',
        },
    },
    splitterSummaryHeader: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridGap: '15px',
        alignItems: 'start',
    },
    splitterSummarySingleHeader: {
        gridTemplateColumns: '1fr',
    },
    splitterSummaryHeaderField: {
        textAlign: 'center',
        padding: 16,
        border: `2px solid rgba(0, 0, 0, 0.2)`,
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
        borderRadius: 10,
    },
    splitterSummaryHeaderFieldAmount: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& > p': {
            margin: '0 8px',
        },
    },
    splitterProcessingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        background: 'linear-gradient(to bottom, rgba(62,153,62,0.57) 0%, rgba(62,153,62,0.47) 100%)',
        backdropFilter: 'blur(1px)',
        zIndex: 100,
        // display: 'none',
    },

    splitterProcessingIcon: {
        fontSize: '20vw !important',
        color: '#ffffff',
        transform: 'rotate(0deg)',
        animation: '$icon 3s linear infinite',
    },
    '@keyframes icon': {
        'from': {
            transform: 'rotate(0deg)',
        },
        'to': {
            transform: 'rotate(360deg)',
        },
    },
    config: {
        '& > *': {
          marginBottom: '12px !important',
        },
    },
};

const App = ({ classes }) => {
    const [rates, setRates] = useState(null);
    const [amount, setAmount] = useState('');
    const [auth, setAuth] = useState('');
    const [orderSplitterAmountToSplit, setOrderSplitterAmountToSplit] = useState('');
    const [orderSplitterValuePerOrder, setOrderSplitterValuePerOrder] = useState('');
    const [orderSplitterStep, setOrderSplitterStep] = useState('');
    const [orderSplitterBeginRate, setOrderSplitterBeginRate] = useState('');
    const [result, setResult] = useState('');
    const [ordersList, setOrdersList] = useState(null);
    const [showTables, setShowTables] = useState(false);
    const [currencyToSplit, setCurrencyToSplit] = useState('KNG');
    const [orderSplitterDirection, setOrderSplitterDirection] = useState('ASK');
    const [orderSplitterStepDirection, setOrderSplitterStepDirection] = useState('ASC');
    const [requestTimeout, setRequestTimeout] = useState('2000');
    const [orderSplitterProcessCounter, setOrderSplitterProcessCounter] = useState(0);
    const [processingOrders, setProcessingOrders] = useState(false);
    const [userOrdersList, setUserOrdersList] = useState(null);

    console.log(auth);

    console.log(`Wykonano: ${orderSplitterProcessCounter}/${ordersList ? ordersList.length : '0'}`);

    const getData = async () => {
        const { data: { items } } = await axios.post('/api/markets');
        const markets = items.reduce((acc, item) => {
            if (item.id === 'KNG-oPLN' || item.id === 'KNG-USDT' || item.id === 'USDT-oPLN') {
                acc[item.id] = item;
            }
            return acc;
        }, {});
        console.log(items);
        setRates(markets)
    }

    const createOrders = async () => {
        setProcessingOrders(true);
        const headers = {
            'Content-Type': 'application/json',
            'auth': auth
        }
        const timer = ms => new Promise(res => setTimeout(res, ms))

        const load = async () => { // We need to wrap
            console.log('load');// the loop into an async function for this to work
            for (let i = 0; i < ordersList.length; i++) {
                const { data } = axios.post('/api/user/order/create', ordersList[i], { headers: headers })
                setOrderSplitterProcessCounter(i+1)
                await timer(parseInt(requestTimeout));
            }
            setProcessingOrders(false);
        }
        load();
    }

    const calculateOrdersCount = () => {
        let rate = orderSplitterBeginRate;
        const ordersCount = parseInt(orderSplitterAmountToSplit / orderSplitterValuePerOrder);
        const ordersCountRest = orderSplitterAmountToSplit % orderSplitterValuePerOrder;
        setResult([ordersCount, ordersCountRest])
        console.log(ordersCount);
        const emptyArray = new Array(ordersCount).fill(0);
        const preparedOrders = emptyArray.map(() => {
            const data = {
                quantity: orderSplitterValuePerOrder.toString(),
                market: "KNG-oPLN",
                price: parseFloat(rate).toFixed(2).toString(),
                type: orderSplitterDirection
            };
            if (orderSplitterStepDirection === 'ASC') {
                rate = parseFloat(rate) + parseFloat(orderSplitterStep);
            } else {
                rate = parseFloat(rate) - parseFloat(orderSplitterStep);
            }
            console.log(data);
            return data
        })
        if (ordersCountRest > 0.5) {
            preparedOrders.push({
                quantity: ordersCountRest.toFixed(8).toString(),
                market: "KNG-oPLN",
                price: parseFloat(rate).toFixed(2).toString(),
                type: orderSplitterDirection
            })
        }
        setOrdersList(preparedOrders)
    };

    const saveConfigToLocalStorage = () => {
        localStorage.setItem('savedAuth', auth)
        localStorage.setItem('requestTimeout', requestTimeout)
    }

    const readConfigFromLocalStorage = () => {
        const authLS = localStorage.getItem('savedAuth');
        const requestTimeoutLS = localStorage.getItem('requestTimeout');
        setAuth(authLS)
        setRequestTimeout(requestTimeoutLS);
    }

    const getPlacedOrdersList = async () => {
        const headers = {
            'Content-Type': 'application/json',
            'auth': auth
        }
        const { data } = await axios.post(`/api/user/order/list`, {}, { headers: headers })
        console.log(data);
        setUserOrdersList(data.items);
    };

    const closeAllOrders = async () => {
        const headers = {
            'Content-Type': 'application/json',
            'auth': auth
        }
        const timer = ms => new Promise(res => setTimeout(res, ms))

        const load = async () => { // We need to wrap the loop into an async function for this to work
            for (let i = 0; i < userOrdersList.length; i++) {
                const { data } = axios.post('/api/user/order/cancel', { orderId: userOrdersList[i].id }, { headers: headers })
                setOrderSplitterProcessCounter(i+1)
                await timer(parseInt(requestTimeout));
            }
            setProcessingOrders(false);
        }
        load();
    }


    const renderTables = () => {
        console.log(`Pokaż tabele: ${showTables ? 'TAK' : 'NIE'}`);
        return (
            <>
                <Typography variant="h5">KNG/oPLN</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kupno</TableCell>
                            <TableCell>Fee</TableCell>
                            <TableCell>SUMA</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{(amount / rates['KNG-oPLN'].lastPrice).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) * 0.002).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) - ((amount / rates['KNG-oPLN'].lastPrice) * 0.002)).toFixed(8)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Typography variant="h5">KNG/USDT</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kupno</TableCell>
                            <TableCell>Fee</TableCell>
                            <TableCell>SUMA</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{(amount / rates['KNG-oPLN'].lastPrice).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) * 0.002).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) - ((amount / rates['KNG-oPLN'].lastPrice) * 0.002)).toFixed(8)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Typography variant="h5">USDT/oPLN</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kupno</TableCell>
                            <TableCell>Fee</TableCell>
                            <TableCell>SUMA</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{(amount / rates['KNG-oPLN'].lastPrice).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) * 0.002).toFixed(8)}</TableCell>
                            <TableCell>{((amount / rates['KNG-oPLN'].lastPrice) - ((amount / rates['KNG-oPLN'].lastPrice) * 0.002)).toFixed(8)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </>
        )
    }

    useEffect(() => {
        getData();
        readConfigFromLocalStorage();
        const interval = setInterval(() => {
            getData();
        }, 8000);
        return clearInterval(interval)
    }, [])

    if (!rates) return null;

  return (
    <Grid
        container
        spacing={2}
        className={classes.main}
        alignItems="stretch"
    >
        <Grid item lg={3} xs={12}>
            <Paper>
                <Typography variant="h5">Konfiguracja</Typography>
                <Divider className={classes.divider} />
                <div className={classes.config}>
                    <TextField
                        label="AUTH"
                        value={auth}
                        onChange={e => setAuth(e.target.value)}
                        type="password"
                        fullWidth
                    />
                    <TextField
                        type="number"
                        label="Częstotliwość zapytań (ms)"
                        helperText="(min. 300ms)"
                        value={requestTimeout}
                        onChange={e => setRequestTimeout(e.target.value)}
                        fullWidth
                        inputProps={{
                            min: 300,
                            step: 10,
                        }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={saveConfigToLocalStorage}
                    >
                        ZAPISZ
                    </Button>
                </div>
            </Paper>
            <Paper style={{ marginTop: 16 }}>
                <Typography variant="h5">Kursy walut</Typography>
                <Divider className={classes.divider}/>
                <div className={classes.ratesRow}>
                    <Typography variant="body2">KNG / oPLN</Typography>
                    <Typography variant="h6">{rates['KNG-oPLN'].lastPrice}</Typography>
                </div>
                <div className={classes.ratesRow}>
                    <Typography variant="body2">KNG / USDT</Typography>
                    <Typography variant="h6">{rates['KNG-USDT'].lastPrice}</Typography>
                </div>
                <div className={classes.ratesRow}>
                    <Typography variant="body2">USDT / oPLN</Typography>
                    <Typography variant="h6">{rates['USDT-oPLN'].lastPrice}</Typography>
                </div>
                <Button
                    variant="outlined"
                    color="primary"
                    style={{ marginTop: 12 }}
                >Odśwież kursy</Button>
            </Paper>
        </Grid>
        <Grid item lg={9} xs={12}>
            <Paper>
                <Typography variant="h5">Kalkulator opłacalności</Typography>
                <Divider className={classes.divider} />
                <div className={classes.ratesRow}>
                    <TextField value={amount} onChange={e => setAmount(e.target.value)} label="ilość PLN" />
                    <p>Ilość w KNG: {amount / rates['KNG-oPLN'].lastPrice}</p>
                    <p>Ilość w USDT: {amount / rates['USDT-oPLN'].lastPrice}</p>
                </div>
                {renderTables()}
            </Paper>
        </Grid>
        <Grid item lg={12} xs={12}>
            <Paper style={{ position: 'relative' }}>
                {processingOrders && (
                    <div className={classes.splitterProcessingOverlay}>
                        <Autorenew className={classes.splitterProcessingIcon} />
                        <Typography variant="h6">Wystawianie ofert w toku</Typography>
                        <Typography variant="h4">{`${orderSplitterProcessCounter} / ${ordersList ? ordersList.length : '0'}`}</Typography>
                    </div>
                )}
                <Typography variant="h4">Rozdzielacz ofert</Typography>
                <Divider className={classes.divider} />
                <Grid container spacing={5}>
                    <Grid item lg={3} xs={12}>
                        <div className={classes.splitterControls}>
                            <ToggleButtonGroup
                                exclusive
                                value={currencyToSplit}
                                onChange={e => setCurrencyToSplit(e.target.value)}
                                fullWidth
                            >
                                <ToggleButton value="KNG">KNG</ToggleButton>
                                <ToggleButton value="USDT">USDT</ToggleButton>
                                <ToggleButton value="oPLN">oPLN</ToggleButton>
                            </ToggleButtonGroup>
                            <TextField
                                type="number"
                                inputProps={{
                                    step: 0.01,
                                    min: 0.01,
                                }}
                                label={`Ilość ${currencyToSplit} do rozdzielenia`}
                                value={orderSplitterAmountToSplit}
                                onChange={e => setOrderSplitterAmountToSplit(e.target.value)}
                            />
                            <TextField
                                type="number"
                                inputProps={{
                                    step: 0.01,
                                    min: 0.01,
                                }}
                                label={`Ilość ${currencyToSplit} per oferta`}
                                value={orderSplitterValuePerOrder}
                                onChange={e => setOrderSplitterValuePerOrder(e.target.value)}
                            />
                            <div className={classes.splitterInputWithSelect}>
                                <TextField
                                    type="number"
                                    inputProps={{
                                        step: 0.01,
                                        min: 0.01,
                                    }}
                                    label="Zacznij od"
                                    value={orderSplitterBeginRate}
                                    onChange={e => setOrderSplitterBeginRate(e.target.value)}
                                    fullWidth
                                />
                                <ToggleButtonGroup
                                    exclusive
                                    value={orderSplitterStepDirection}
                                    onChange={e => setOrderSplitterStepDirection(e.target.value)}
                                >
                                    <ToggleButton value="ASC">ROSNĄCO</ToggleButton>
                                    <ToggleButton value="DSC">MALEJĄCO</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                            <TextField
                                type="number"
                                inputProps={{
                                    step: 0.01,
                                    min: 0.01,
                                }}
                                label="Skok kursu (min 0.01)"
                                value={orderSplitterStep}
                                onChange={e => setOrderSplitterStep(e.target.value)}
                            />
                            <ToggleButtonGroup
                                exclusive
                                value={orderSplitterDirection}
                                onChange={e => setOrderSplitterDirection(e.target.value)}
                                fullWidth
                            >
                                <ToggleButton value="ASK" style={{ color: 'red', fontWeight: 'bold' }}>SPRZEDAJ</ToggleButton>
                                <ToggleButton value="BID" style={{ color: 'green', fontWeight: 'bold' }}>KUP</ToggleButton>
                            </ToggleButtonGroup>
                            <div className={classes.splitterActions}>
                                <Button onClick={calculateOrdersCount} variant="contained" disabled={!orderSplitterAmountToSplit || !orderSplitterValuePerOrder || !orderSplitterBeginRate || !orderSplitterStep}>OBLICZ</Button>
                                <Button onClick={createOrders} variant="contained" disabled={!ordersList}>WYSTAW</Button>
                            </div>
                        </div>
                    </Grid>
                    <Grid item lg={4} xs={12}>
                        <Button variant="contained" onClick={getPlacedOrdersList}>Pobierz listę zleceń</Button>
                        <Button variant="contained" onClick={closeAllOrders}>Zamknij wszystkie</Button>
                        {userOrdersList && (
                            <Table padding="none">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>CENA</TableCell>
                                        <TableCell>RYNEK</TableCell>
                                        <TableCell>ILOŚĆ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userOrdersList.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.price}</TableCell>
                                            <TableCell>{`${item.buyingCurrency}/${item.payingCurrency}`}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Grid>
                    {ordersList && (
                        <Grid item lg={5} xs={12}>
                            <div className={clsx(classes.splitterSummaryHeader, { [classes.splitterSummarySingleHeader]: result[1] < 0.5 })}>
                                <div className={classes.splitterSummaryHeaderField}>
                                    <Typography variant="h6">Ilość równych ofert</Typography>
                                    <Divider className={classes.divider}/>
                                    <div className={classes.splitterSummaryHeaderFieldAmount}>
                                        <Typography variant="h4">{parseInt(result[0])}</Typography>
                                        <Typography variant="body2" >x</Typography>
                                        <div>
                                            <Typography variant="h4">{parseFloat(orderSplitterValuePerOrder).toFixed(2)}<span style={{ fontSize: 15, marginLeft: 3 }}>{currencyToSplit}</span></Typography>
                                        </div>
                                    </div>
                                </div>
                                {result[1] > 0.5 && (
                                <div className={classes.splitterSummaryHeaderField}>
                                    <Typography variant="h6">Ostatnia oferta</Typography>
                                    <Divider className={classes.divider}/>
                                    <div className={classes.splitterSummaryHeaderFieldAmount}>
                                        <Typography variant="h4">1</Typography>
                                        <Typography variant="body2">x</Typography>
                                        <div>
                                            <Typography variant="h4">{parseFloat(result[1]).toFixed(2)}<span style={{ fontSize: 15, marginLeft: 3 }}>{currencyToSplit}</span></Typography>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                            <div className={classes.splitterSummaryContainer}>
                                {ordersList.map((item, i) => (
                                    <div className={classes.splitterSummaryRow} key={item.price} style={{ color: item.type === 'ASK' ? 'red' : 'green' }}>
                                        <Typography>{i + 1}</Typography>
                                        <Typography>{item.price}</Typography>
                                        <Typography>{parseFloat(item.quantity).toFixed(2)} KNG</Typography>
                                        <Typography>{(item.price * item.quantity).toFixed(2)}</Typography>
                                    </div>
                                ))}
                            </div>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Grid>


    </Grid>
  );
}

export default withStyles(styles)(App);
