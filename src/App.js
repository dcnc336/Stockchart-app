import { useState, useEffect, useRef,StrictMode } from 'react';
import Papa from 'papaparse';
import { TypeChooser } from "react-stockcharts/lib/helper";
import { ToastContainer, toast } from 'react-toastify';

import ChartPage from './pages/Chart';

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
  const [rows, setRows] = useState([]);
  const [data, setData] = useState([]);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const inputRef = useRef(null);
  const handleClick = () => {
    inputRef.current?.click();
  }
  const chartKey = ['date', 'open', 'high', 'low', 'close', 'volume','returns', 'states', 'posterior_state_0', 'posterior_state_1', 'posterior_state_2','posterior_state_3'];
  const isKeysInArray = (arrays, keys) => {
    let tempObject = {};
    for ( var i = 0 ; i < keys.length ; i ++ ){
      for ( var j = 0; j < arrays.length ; j ++ ){
        if ( keys[i].trim().toLowerCase() === arrays[j].trim().toLowerCase() ){
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
  const handleFileChange = async (e) => {
    if (e.target.files) {
      try {
        const file = e.target.files[0];

        Papa.parse(file, {
          worker: true, // use a web worker so that the page doesn't hang up
          complete({ data }) {
            handleData(data);
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

  useEffect(() => {
    if ( rows.length === 0 ) return ;
    const tempArrays = rows[0];
    const result = isKeysInArray(tempArrays, chartKey) ;
    if ( !result ) {
      toast.error('Invalid CSV, Please update CSV types correctly.');
      return;
    }
    let temp = [];
    rows.map((row, index) => {
      if ( index !== 0 ) {
        temp.push({
          date: new Date(row[result.date]),
          open : row[result.open],
          high: row[result.high],
          low: row[result.low],
          close: row[result.close],
          volume: row[result.volume],
          returns: parseFloat(row[result.returns]),
          states: parseInt(row[result.states]),
          posterior_0: parseFloat(row[result.posterior_state_0]),
          posterior_1: parseFloat(row[result.posterior_state_1]),
          posterior_2: parseFloat(row[result.posterior_state_2]),
          posterior_3: parseFloat(row[result.posterior_state_3]),
        });
      }
    });
    setData(temp);
  },[rows]);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <StrictMode>
      <div className="App">
        <div className='w-full bg-slate-900 py-2 px-4'>
          <h1 className="text-4xl font-bold text-white">Welcome Chart App!</h1>
        </div>
        <form className='mt-8 py-2 px-6 w-3/6 text-left'>
          <label className='text-2xl text-teal-900'>Please select csv file:</label>
          <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:outline-none font-medium rounded-lg text-sm px-7 py-2 text-center mr-2 mb-2 ml-2" onClick={handleClick}>Upload</button>
          <input type='file' className='hidden' accept=".csv" ref={inputRef} onInput={handleFileChange}/>
        </form>
        <div className='w-full py-2 px-4'>
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
