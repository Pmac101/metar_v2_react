import React, {useEffect, useState} from 'react'

//TODO: add checking/error handling for user input
function App() {
    const [metarData, setMetarData] = useState({})
    const [location, setLocation] = useState('')
    const [rule, setRule] = useState('')
    const [icon, setIcon] = useState('')
    const [temp, setTemp] = useState('')
    const [time, setTime] = useState('')
    const [sky, setSky] = useState('')

    // ----------------------------------------Functions----------------------------------------

    // checks checkwx API response for current cloud condition and also checks ipgeolocation API for current sunrise/sunset time. Returns appropriate image based on response data
    function weatherIcon(weather) {
        setIcon(weather.current.weather[0].icon)
        setSky(weather.current.weather[0].description)
    }

    // converts unit timestamp to human-readable format
    function timeConversion(unix) {
        const milliseconds = (unix.current.dt * 1000)
        const dateObject = new Date(milliseconds)
        const readableTime = dateObject.toLocaleString('en-US', {timeZone: `${unix.timezone}`})
        setTime(readableTime)
    }

    // listens for window resizing upon loading app and resizes background accordingly
    window.addEventListener('resize', ()=> {
        if (window.innerWidth < 700 && metarData.icao) {
            document.getElementsByClassName('app')[0].classList.add('heightPercent')
            document.getElementsByClassName('app')[0].classList.remove('heightVH')
        }
        else {
            document.getElementsByClassName('app')[0].classList.add('heightVH')
            document.getElementsByClassName('app')[0].classList.remove('heightPercent')
        }
    })

    // takes user input and makes 2 API calls to retrieve METAR and weather data
    const searchAirport = (event) => {

        if (event.key === 'Enter') {
            const welcome = document.getElementsByClassName('welcome-message')
            welcome[0].style.visibility = 'hidden'

            // Call to CheckWX API - retrieves METAR data
            fetch(`https://api.checkwx.com/metar/${location}/decoded?x-api-key=429d0470f1b747b4b9de564ff9`)
                .then((response) => response.json())
                .then(response => {
                    if (response.data[0]) {
                        setMetarData(response.data[0])
                        return response.data[0]
                    }
                })
                .then(response => {
                    setRule(response.flight_category)
                    return response
                })
                .then( response => {
                    // API call to openweathermap. Airport coordinates from CheckWX API response are used to retrieve current weather conditions
                    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${response.station.geometry.coordinates[1]}&lon=${response.station.geometry.coordinates[0]}&exclude=minutely&units=imperial&appid=f77078a3b256ade5ae31b9e8ab8422c6`)
                        .then((response) => response.json())
                        .then(response => {
                            setTemp(response.current.temp.toFixed(0))
                            weatherIcon(response)
                            timeConversion(response)
                        })
                })
        }
    }

    return (
        <div className="app ">
            {/*--------------------Search Bar--------------------*/}
            <section className="search">
                <input
                    value={location}
                    onChange={event => setLocation(event.target.value)}
                    onKeyPress={searchAirport}
                    placeholder='Enter Airport ID'
                    type='text'/>
                <h1 className='welcome-message'>{metarData.icao ? null : 'Welcome! Enter an ICAO identifier in the box above to get started.'}</h1>
            </section>
            {/*-------------------- Local Weather --------------------*/}
            {metarData.icao !== undefined &&
                <div className='data-container'>
                    <section className='location-data'>
                        <div className='airport'>
                            <h2>{metarData.icao ? metarData.icao + ' -' : null} {metarData.station ? metarData.station.name : null}</h2>
                            <h2>{metarData.station ? metarData.station.location : null}</h2>
                            <h3 className='time'>{time}</h3>
                        </div>
                        <div className='weather'>
                            {icon !== '' ?
                                <img className='weather-icon' src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
                                     alt="weather icon"></img> : null}
                            <div className="weather-conditions">
                                {temp !== '' ? <h3>{temp}°F</h3> : null}
                                {sky !== '' ? <p className='weather-description'>{sky}</p> : null}
                            </div>
                        </div>
                    </section>
                    {/*--------------------METAR Data --------------------*/}
                    <section className='metar'>
                        <div className="metar-header">
                            <h3>METAR</h3>
                            {metarData.raw_text ? <p className='bold'>{metarData.raw_text}</p> : null}
                        </div>
                        <div className="metar-data">
                            <div className="flight-rules">
                                <p>Flight Rules</p>
                                <p className='rule-color'>{rule}</p>
                            </div>
                            <div className="wind">
                                <p>Wind</p>
                                {metarData.wind ? <p className='bold'>{metarData.wind.degrees}°
                                    at {metarData.wind.speed_kts} kts</p> : <p className='bold'>0 kts</p>}
                            </div>
                            <div className="altimeter">
                                <p>Altimeter</p>
                                {metarData.barometer ? <p className='bold'>{metarData.barometer.hg} inHg</p> : null}
                            </div>
                            <div className="clouds">
                                <p>Clouds</p>
                                {metarData.clouds ?
                                    <p className='bold'>{metarData.clouds[0].text} {metarData.clouds[0].base_feet_agl}</p> : null}
                            </div>
                            <div className="dewpoint">
                                <p>Dewpoint</p>
                                {metarData.dewpoint ? <p className='bold'>{metarData.dewpoint.fahrenheit}°F</p> : null}
                            </div>
                            <div className="visibility">
                                <p>Visibility</p>
                                {metarData.visibility ? <p className='bold'>{metarData.visibility.miles}SM</p> : null}
                            </div>
                        </div>
                    </section>
                </div>
            }
        </div>
    );
}

export default App;