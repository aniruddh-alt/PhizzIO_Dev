import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://localhost:5000/api/data');
      console.log(response);
      setData(response.data);
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      {data && <p>{data.message}</p>}
    </div>
  );
}

export default App;
