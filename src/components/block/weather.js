import React, { Component, Fragment as _ } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { map, find, isEmpty, split, get } from 'lodash';
import axios from 'axios';
import Highstock from 'react-highcharts/ReactHighstock.src';

import { DropdownList } from '../element/dropdown';
import { countries } from '../../constant/countries';

const url = 'https://api.openweathermap.org/data/2.5/forecast?';
const apiKey = 'cb293b2c3f7a6d57c3587a5f758a9366';

class WeatherUI extends Component {
  state = {
    isCountryDropdownOpen: false,
    isCityDropdownOpen: false,
    isDateDropdownOpen: false,
    isUnitDropdownOpen: false,
    countryList: [],
    cityList: [],
    dateList: [],
    unitList: ['Celsius', 'Fahrenheit '],

    selectedCountry: 'Select Country',
    selectedCity: 'Select City',
    selectedDate: 'Select Date',
    selectedUnit: 'Select Unit',
    countryCode: '',
    weatherData: {},    
    forecast: [],
    highstockConfig: {}
  }

  //First step here we will fetch all country list in component did mount and save it to state "countryList"
  componentDidMount = () => {
    const countryList = map(countries, 'name');
    this.setState({ countryList });
  }

  //This helps to toggle the every dropdown state which determines whether it is expanded or not.
  toggleDropdown = (state) => {
    this.setState(prevState => ({
      [state]: !prevState[state]
    }));
  }

  //this helps to set value of selected country, city, unit, and dates.
  onClickDropdownValue = async (key, value) => {
    await this.setState({
      [key]: value
    });

    if (key === 'selectedCountry') {
      await this.resteState({ 
        hasResetForecast: true, 
        hasResetCityList: true,
        hasResetSelectedCity: true, 
        hasResetDateList: true, 
        hasResetSelectedDate: true,
        hasResetSelectedUnit: true,
      });
      this.setCityList(value);
    }
    else if (key === 'selectedCity') {
      this.resteState({ 
        hasResetForecast: true,
        hasResetSelectedUnit: true, 
        hasResetSelectedDate: true, 
        hasResetDateList: true 
      });
    }
    else if (key === 'selectedUnit') {
      await this.resteState({
        hasResetForecast: true,
        hasResetSelectedDate: true, 
        hasResetDateList: true 
      });
      this.fetchWeather();
    }
    else if (key === 'selectedDate') {
      this.setForecast();
    }    
  }

  //this helps to reset the values on select values from dropdown
  resteState = (props) => {
    const { 
      hasResetForecast, 
      hasResetCityList, 
      hasResetSelectedCity, 
      hasResetDateList, 
      hasResetSelectedDate, 
      hasResetSelectedUnit,  
    } = props;
    
    this.setState({ 
      forecast: hasResetForecast ? [] : this.state.forecast, 
      cityList: hasResetCityList ? [] : this.state.cityList, 
      selectedCity: hasResetSelectedCity ? 'Select City' : this.state.selectedCity, 
      dateList: hasResetDateList ? [] : this.state.dateList, 
      selectedDate: hasResetSelectedDate ? 'Select Date' : this.state.selectedDate,
      selectedUnit: hasResetSelectedUnit ? 'Select Unit' : this.state.selectedUnit,
      highstockConfig: {},
    });
  }

  //this helps to set cilty list after selection of country
  setCityList = (selectedCountry) => {
    const data = find(countries, { 'name': selectedCountry }),
          { code, cities } = data;
    this.setState({
      cityList: cities,
      countryCode: code, 
    });
  }

  //this will fetch all forecast after selecting country, city and unit
  fetchWeather = async () => {
    this.setState({ forecast: [], dateList: [], selectedDate: 'Select Date' });
    const { selectedCity, countryCode, selectedUnit } = this.state;
    const uint = selectedUnit === 'Celsius' ? 'metric' : 'imperial';
    const site = `${url}q=${selectedCity},${countryCode}&units=${uint}&appid=${apiKey}`;
    await axios.get(site)
      .then(response => {
        const { data } = response;        
        this.arrangeDatewiseWeather(data.list);
      })
      .catch(function(error) {
        console.log(error);
      });    
  }

  //this will set all the weather information and date list to the state.
  arrangeDatewiseWeather = async (weatherList) => {
    const weatherData = {};
    const dateList = [];
    await map(weatherList, item => {
      const { dt_txt } = item;
      const dateTime = split(dt_txt, ' ');
      weatherData[dateTime[0]] = weatherData[dateTime[0]] ? weatherData[dateTime[0]] : [];

      isEmpty(weatherData[dateTime[0]]) && dateList.push(dateTime[0]);
      weatherData[`${dateTime[0]}`].push(item);
    });

    this.setState({ weatherData, dateList });
  }

  //this will set forecast of selected date and highchart information to state.
  setForecast = async () => {
    const { weatherData, selectedDate } = this.state,
          forecast = get(weatherData, selectedDate);    

    const data = [];
    await map(forecast, item => {
      const { dt_txt, main } = item;
      const dateTime = new Date(dt_txt);
      data.push([dateTime.getTime(), main.temp]);
    });

    const highstockConfig = {
      rangeSelector: {
        selected: 1
      },
      title: {
        text: 'Weather Forecast'
      },
      series: [{
        name: 'Temprature',
        data,
      }]
    };

    this.setState({ forecast, highstockConfig });
  }


  render() {

    const { state, toggleDropdown, onClickDropdownValue } = this,
          { 
            isCountryDropdownOpen, 
            countryList, 
            selectedCountry, 
            isCityDropdownOpen,
            selectedCity,
            cityList,
            forecast,
            dateList,
            isDateDropdownOpen,
            selectedDate,
            isUnitDropdownOpen,
            selectedUnit,
            unitList,
            highstockConfig,
          } = state,

          showUnitDropdown = selectedCity && selectedCity !== 'Select City',
          weatherItems = [],
          countryItems = {
            showDropdown: !isEmpty(countryList),
            isOpen: isCountryDropdownOpen,
            state: 'isCountryDropdownOpen',
            toggleDropdown,
            list: countryList,
            selected: selectedCountry,
            keyName: 'selectedCountry',
            onClickDropdownValue
          },
          
          cityItems = {
            showDropdown: !isEmpty(cityList),
            isOpen: isCityDropdownOpen,
            state: 'isCityDropdownOpen',
            toggleDropdown,
            list: cityList,
            selected: selectedCity,
            keyName: 'selectedCity',
            onClickDropdownValue
          },

          unitItems = {
            showDropdown: showUnitDropdown,
            isOpen: isUnitDropdownOpen,
            state: 'isUnitDropdownOpen',
            toggleDropdown,
            list: unitList,
            selected: selectedUnit,
            keyName: 'selectedUnit',
            onClickDropdownValue
          },

          dateItems = {
            showDropdown: !isEmpty(dateList),
            isOpen: isDateDropdownOpen,
            state: 'isDateDropdownOpen',
            toggleDropdown,
            list: dateList,
            selected: selectedDate,
            keyName: 'selectedDate',
            onClickDropdownValue
          };

    weatherItems.push(
      { ...countryItems }, 
      { ...cityItems }, 
      { ...unitItems }, 
      { ...dateItems }
    );

    return (
      <div className="weather">
        <h2 className="primary mt-3 mb-3">Current weather and forecasts in your city</h2>
        <Row> 
          {!isEmpty(weatherItems) &&
            weatherItems.map((items, index) => (
              items.showDropdown && 
                <Col xs={12} lg={3} key={index} className="mb-2">
                  <DropdownList {...items} />
                </Col>
            ))
          } 
        </Row> 
        {!isEmpty(forecast) &&
          <_>
            <h4 className="mt-3">Hourly forecast</h4>
            <ForecastData {...{ forecast }} />
          </_>          
        }   
        {!isEmpty(highstockConfig) && <Highstock {...{ config: highstockConfig }} />}
      </div>
    );
  }
}

//this table will show the forecast data ion tabular form
const ForecastData = ({ forecast }) => (
  <Table className="mt-3">
    <thead>
      <tr>
        <th>#</th>
        <th>Time</th>
        <th>Temprature</th>
      </tr>
    </thead>
    <tbody>        
      {forecast.map((item, index) => {
        const { dt_txt, main } = item,
              dateTime = new Date(dt_txt);

        return (
          <tr key={index}>
            <th scope="row">{index}</th>
            <td>{dateTime.toLocaleTimeString()}</td>
            <td>{main.temp}</td>
          </tr>
        );
      })}
    </tbody>
  </Table>
);

export default WeatherUI;