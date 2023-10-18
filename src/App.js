import { useState, useEffect, useRef,StrictMode } from 'react';
import Papa from 'papaparse';
import { TypeChooser } from "react-stockcharts/lib/helper";
import { ToastContainer, toast } from 'react-toastify';

import ChartPage from './pages/Chart';

import { BsFillBrightnessHighFill, BsMoonStarsFill } from "react-icons/bs";

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function App() {
  const [dark, setDark] = useState(0);
  const [rows, setRows] = useState([]);
  const [forecastRows, setForecastRows] = useState([]);
  const [data, setData] = useState([]);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const inputRef = useRef(null);
  const inputPredictionRef = useRef(null);
  const handleClick = () => {
    inputRef.current?.click();
  }
  const handlePredictionClick = () => {
    inputPredictionRef.current?.click();
  }
  const chartKey = ['date', 'open', 'high', 'low', 'close', 'volume','returns', 'states', 'posterior_state_0', 'posterior_state_1', 'posterior_state_2','posterior_state_3'];
  const forecastKey = ['max', 'min'];
  const isKeysInArray = (arrays, keys) => {
    let tempObject = {};
    for ( var i = 0 ; i < keys.length ; i ++ ){
      for ( var j = 0; j < arrays.length ; j ++ ){
        if ( arrays[j].trim().toLowerCase().includes(keys[i].trim().toLowerCase()) ){
          tempObject[[keys[i].trim().toLowerCase()]] = j;
          break;
        }
      }
      if ( j === arrays.length ) break;
    }
    if ( i === keys.length ) {
      return tempObject;
    }
    else return false;
  }
  const handleFileChange = async (e , type) => {
    if (e.target.files) {
      try {

        const file = e.target.files[0];

        Papa.parse(file, {
          worker: true, // use a web worker so that the page doesn't hang up
          complete({ data }) {
            switch (type) {
              case 1: 
                handleData(data);
                break;
              case 2:
                handlePredictionData(data);
                break;
              default:
                break;
            }
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleData = (data) => {
    setRows(data);
  }
  const handlePredictionData = (data) => {
    setForecastRows(data);
  }

  const handleDarkMode = () => {
    setDark(1-dark);
  }

  useEffect(() => {
    if ( rows.length === 0 ) return ;
    const tempArrays = rows[0];
    const result = isKeysInArray(tempArrays, chartKey) ;
    if ( !result ) {
      toast.error(`Invalid CSV:\n ('date', 'open', 'high', 'low', 'close', 'volume','returns', 'states', 'posterior_state_0', 'posterior_state_1', 'posterior_state_2','posterior_state_3' options are required)`);
      return;
    }
    let temp = [];
    const tempRows = rows.filter((one, index) => index !== rows.length-1);
    tempRows.map((row, index) => {
      if ( index !== 0 ) {
        temp.push({
          date: new Date(row[result.date]),
          open : parseFloat(row[result.open]),
          high: parseFloat(row[result.high]),
          low: parseFloat(row[result.low]),
          close: parseFloat(row[result.close]),
          volume: row[result.volume],
          returns: parseFloat(row[result.returns]),
          states: parseInt(row[result.states]),
          posterior_0: parseFloat(row[result.posterior_state_0]),
          posterior_1: parseFloat(row[result.posterior_state_1]),
          posterior_2: parseFloat(row[result.posterior_state_2]),
          posterior_3: parseFloat(row[result.posterior_state_3]),
          types:0
        });
      }
    });
    setData(temp);
  },[rows]);

  useEffect(() => {
    if (forecastRows.length === 0) return;
    const tempArrays = forecastRows[0];
    const result = isKeysInArray(tempArrays, forecastKey);
    if (!result) {
      toast.error('Invalid CSV:\n (min and max are required)');
      return;
    }
    let temp=data.filter(one => one.types === 0);
    console.log(temp);
    if ( temp.length === 0 ) {
      toast.warn('Warning: You must select main file first');
      return;
    }
    forecastRows.map((row,index) => {
      if ( index !== 0 && index !== 1 ){
        const date = new Date(temp[temp.length-1].date);
        date.setDate(date.getDate() + 1);
        temp.push({
          date: date,
          open : String(row[result.min]),
          high: String(row[result.max]),
          low: String(row[result.min]),
          close: String(row[result.max]),
          volume: 0,
          returns: 0,
          states: 0,
          posterior_0: 0,
          posterior_1: 0,
          posterior_2: 0,
          posterior_3: 0,
          types:1
        });
      }
    });
    setData(temp);
  },[forecastRows])

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <StrictMode>
      <div className={`App min-h-screen bg-white ${dark?'dark':''}`}>
        <div className={`w-full ${!dark?'bg-slate-300':'bg-slate-900'} py-2 px-4 justify-between flex flex-row`}>
          <h1 className={`text-4xl font-bold ${!dark?'text-black':'text-white'}`}>Welcome Chart App!</h1>
          <button onClick={handleDarkMode}>
            {dark?<BsFillBrightnessHighFill className='text-white'/>:<BsMoonStarsFill className='text-white'/>}
          </button>
        </div>
        <form className='mt-8 py-2 px-6 w-3/6 text-left'>
          <label className='text-2xl text-teal-900'>Please select csv file:</label>
          <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:outline-none font-medium rounded-lg text-sm px-7 py-2 text-center mr-2 mb-2 ml-2" onClick={handleClick}>Upload</button>
          <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:outline-none font-medium rounded-lg text-sm px-7 py-2 text-center mr-2 mb-2 ml-2" onClick={handlePredictionClick}>Forecast</button>
          <input type='file' className='hidden' accept=".csv" ref={inputRef} onInput={e => handleFileChange(e,1)}/>
          <input type='file' className='hidden' accept=".csv" ref={inputPredictionRef} onInput={e => handleFileChange(e,2)}/>
        </form>
        <div className={`w-full py-2 px-4`}>
          {
            data.length > 0 ?<>
              <TypeChooser>
                {type => <ChartPage type={type} initialData={data} width={windowDimensions.width}/>}
              </TypeChooser>
              <div className='justify-between w-full flex flex-row border border-slate-300 px-10 py-2 bg-slate-300'>
                <h1 className='text-2xl'> ───── Returns</h1>
                <div className='sub_description'>
                  <div className='w-20 h-7 bg-purple-600'></div>
                  <h1 className='text-xl'>State 0</h1>
                </div>
                <div className='sub_description'>
                  <div className='w-20 h-7 bg-cyan-300'></div>
                  <h1 className='text-xl'>State 1</h1>
                </div>
                <div className='sub_description'>
                  <div className='w-20 h-7 bg-yellow-200'></div>
                  <h1 className='text-xl'>State 2</h1>
                </div>
                <div className='sub_description'>
                  <div className='w-20 h-7 bg-orange-500'></div>
                  <h1 className='text-xl'>State 3</h1>
                </div>
              </div>
            </>:
            <p className="text-2xl text-teal-900 text-center">There is no chart</p>
          }
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </StrictMode>
  );
}

export default App;
