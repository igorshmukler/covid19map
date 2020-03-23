import React, { useState } from "react";
import "./App.css";

import { Form, Formik, useField } from "formik";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import moment from "moment";

import GooglePlacesAutocomplete, {
  geocodeByPlaceId
} from "react-google-places-autocomplete";
import "react-google-places-autocomplete/dist/assets/index.css";

import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Circle
} from "react-google-maps";

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={12}
      defaultCenter={{ lat: 25.979806, lng: -80.119038 }}
      onClick={e => props.onMapClick(e)}
    >
      {props.marks.map((mark, index) => (
        <Circle
          key={index}
          center={mark}
          radius={1000}
          options={{
            strokeColor: "#66009a",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: `#66009a`,
            fillOpacity: 0.35,
            zIndex: 1
          }}
        />
      ))}
    </GoogleMap>
  ))
);

const DateControl = ({ ...props }) => {
  const [detectionDate, meta, dateHelpers] = useField("date");
  return (
    <>
      <DatePicker
        selected={Date.parse(detectionDate.value)}
        dateFormat="dd MMM yyyy"
        {...props}
        onChange={date => {
          console.log("setting date to:", date);
          dateHelpers.setValue(date);
        }}
      />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};

const AutocompleteControl = ({ ...props }) => {
  const [address, meta, addressHelpers] = useField("address");
  console.log("address:", address.value);
  return (
    <GooglePlacesAutocomplete
      onSelect={venue => {
        console.log("place id:", venue["place_id"]);
        geocodeByPlaceId(venue["place_id"])
          .then(results => {
            const location = results[0]["geometry"].location;
            const addressFromGeocode = results[0]["address_components"];
            console.log("address array:", addressFromGeocode);
            if (addressFromGeocode.length === 7) {
              const house_number = addressFromGeocode[0]["short_name"];
              const street = addressFromGeocode[1]["short_name"];
              const city = addressFromGeocode[3]["short_name"];
              const state = addressFromGeocode[4]["short_name"];
              const country = addressFromGeocode[5]["short_name"];
              const zip = addressFromGeocode[6]["short_name"];
              const fullAddress = `${house_number} ${street}\n${city}, ${state} ${zip}\n${country}`;
              console.log("address:", fullAddress);
              addressHelpers.setValue({
                address: fullAddress,
                coordinates: { lat: location.lat(), lng: location.lng() }
              });
            } else if (addressFromGeocode.length === 5) {
              const city = addressFromGeocode[0]["short_name"];
              const state = addressFromGeocode[2]["short_name"];
              const country = addressFromGeocode[3]["short_name"];
              const zip = addressFromGeocode[4]["short_name"];
              const fullAddress = `${city}, ${state} ${zip}\n${country}`;
              console.log("address:", fullAddress);
              addressHelpers.setValue({
                address: fullAddress,
                coordinates: { lat: location.lat(), lng: location.lng() }
              });
            }
          })
          .catch(error => console.error(error));
      }}
      renderInput={props => (
        <div>
          <input
            id="venue"
            // Custom properties
            {...props}
            placeholder="Address"
          />
        </div>
      )}
    />
  );
};

function App() {
  const [infections, setInfections] = useState([]);

  // eslint-disable-next-line
  console.log("infections:", infections);
  return (
    <div className="App">
      <header className="App-header">
        <p>Sample Coronavirus report form</p>

        <Formik
          initialValues={{
            date: new Date(),
            address: { address: "", coordinates: { lat: 0, lng: 0 } }
          }}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              actions.setSubmitting(false);
              setInfections([
                ...infections,
                {
                  date: values["date"],
                  address: values["address"].address,
                  coordinates: values["address"].coordinates
                }
              ]);
            }, 1000);
          }}
        >
          {props => {
            return (
              <Form>
                <DateControl />
                <AutocompleteControl />
                <button type="submit">Submit</button>
              </Form>
            );
          }}
        </Formik>
        {infections &&
          infections.map((entry, k) => (
            <div key={k}>
              address: {entry["address"]}, date:{" "}
              {moment(entry["date"]).format()}
            </div>
          ))}
        <div style={{ width: "600px", height: "400px" }}>
          <Map
            googleMapURL="http://maps.googleapis.com/maps/api/js?key=KEY"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `400px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            onMapClick={console.log('call helper setValue after filtering out the marker you want removed')}
            marks={infections.map(entry => entry.coordinates)}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
