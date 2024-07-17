import React from "react";
import { useState } from "react";
import Select from "./components/select";
import countries from "./constants/countries.json";
import { fetchCountries } from "./utils/fetchCountries";

function App() {
  const [selectedValue, setSelectedValue] = useState<string>(""); //배열
  const [asyncSelectedValue, setAsyncSelectedValue] = useState<string>(""); //함수형

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleAsyncInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAsyncSelectedValue(event.target.value);
  };

  return (
    <div className="App">
      <div style={{ padding: "50px", minHeight: "200vh" }}>
        <div style={{ margin: "500px 0 0 0" }}>
          <h2>배열 데이터</h2>
          <Select value={selectedValue} options={countries} onChange={handleInputChange} setSelectedValue={setSelectedValue} />
        </div>

        <div style={{ margin: "150px 0" }}>
          <h2>비동기 데이터</h2>
          <Select value={asyncSelectedValue} options={fetchCountries} onChange={handleAsyncInputChange} setSelectedValue={setAsyncSelectedValue} />
        </div>
      </div>
    </div>
  );
}

export default App;
