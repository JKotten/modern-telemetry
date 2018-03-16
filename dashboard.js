Funbit.Ets.Telemetry.Dashboard.prototype.initialize = function (skinConfig, utils) {
    //
    // skinConfig - a copy of the skin configuration from config.json
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //

    // this function is called before everything else, 
    // so you may perform any DOM or resource initializations / image preloading here
    
    // Load Tabs into the DOM
    $(document).ready(function(){
        $('.tabs').tabs();
    });      
    
}

Funbit.Ets.Telemetry.Dashboard.prototype.filter = function (data, utils) {
    //
    // data - telemetry data JSON object
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //

    // This filter is used to change telemetry data 
    // before it is displayed on the dashboard.
    // You may convert km/h to mph, kilograms to tons, etc.

    // round truck speed
    data.truck.speedRounded = Math.abs(data.truck.speed > 0
        ? Math.floor(data.truck.speed)
        : Math.round(data.truck.speed));

    // other examples:
    
    // Detect the time in ATS or ETS and change the dark and light mode
    var timeDate = new Date(data.game.time);
    var gameHour = timeDate.getUTCHours();
    var theme = document.getElementById("theme");
    
    if (gameHour >= 6 && gameHour <= 17) {
        theme.classList.remove("dark");
    } else {
        theme.classList.add("dark");
    }
    
    // convert gear to readable format
    data.truck.gear = data.truck.gear > 0 ? 'D' + data.truck.gear : (data.truck.gear < 0 ? 'R' : 'N');
    // Round Distance Left
    data.navigation.estimatedDistance = Math.floor(data.navigation.estimatedDistance / 1000);  
    
    // Text to go with the new date format
    var hoursString = " Hours ";
    var hourString = " Hour ";    
    var minutesString = " Minutes "
    var minuteString = " Minute "
    
    // NextRestStopTime in a new date format
    var nextRestStop = new Date (data.game.nextRestStopTime);
    var nextRestStopDay = nextRestStop.getUTCDay();
    var nextRestStopHour = nextRestStop.getUTCHours();
    var nextRestStopMinute = nextRestStop.getUTCMinutes();
    var nextRestStopTotal = (nextRestStopDay - 1) * 24 + nextRestStopHour;    
    
    // EstimatedTime in a new date format
    var estimatedTime = new Date (data.navigation.estimatedTime);
    var estimatedTimeDay = estimatedTime.getUTCDay();
    var estimatedTimeHour = estimatedTime.getUTCHours();
    var estimatedTimeMinute = estimatedTime.getUTCMinutes();
    var estimatedTimeTotal = (estimatedTimeDay - 1) * 24 + estimatedTimeHour;         
    
    // remainingTime in a new date format
    var remainingTime = new Date (data.job.remainingTime);
    var remainingTimeDay = remainingTime.getUTCDay();
    var remainingTimeHour = remainingTime.getUTCHours();
    var remainingTimeMinute = remainingTime.getUTCMinutes();
    var remainingTimeTotal = (remainingTimeDay - 1) * 24 + remainingTimeHour;         
        
    
    // Output the variables into the NextRestStopTime Data object
    document.getElementById("nextRestStopHour").innerHTML = nextRestStopTotal  + hoursString;
    document.getElementById("nextRestStopMinute").innerHTML = nextRestStopMinute  + minutesString;
    
    // Output the variables into the EstimatedTime Data object
    document.getElementById("estimatedTimeHour").innerHTML = estimatedTimeTotal  + hoursString;
    document.getElementById("estimatedTimeMinute").innerHTML = estimatedTimeMinute  + minutesString;    
    
    // Output the variables into the RemainingTime Data object
    document.getElementById("remainingTimeHour").innerHTML = remainingTimeTotal  + hoursString;
    document.getElementById("remainingTimeMinute").innerHTML = remainingTimeMinute  + minutesString;        
    
    // Conditional statements to replace nextRestStop Hours and Minutes to Hour and Minute if equal to 1
    if (nextRestStopTotal == 1) {
        document.getElementById("nextRestStopHour").innerHTML = nextRestStopTotal  + hourString;
    }
    if (nextRestStopMinute == 1) {
        document.getElementById("nextRestStopMinute").innerHTML = nextRestStopMinute  + minuteString;
    }                
    
    // Conditional statements to replace estimatedTime Hours and Minutes to Hour and Minute if equal to 1
    if (estimatedTimeTotal == 1) {
        document.getElementById("estimatedTimeHour").innerHTML = estimatedTimeTotal  + hourString;
    }
    if (estimatedTimeMinute == 1) {
        document.getElementById("estimatedTimeMinute").innerHTML = estimatedTimeMinute  + minuteString;
    }                 
    
    // Conditional statements to replace remainingTime Hours and Minutes to Hour and Minute if equal to 1
    if (remainingTimeTotal == 1) {
        document.getElementById("remainingTimeHour").innerHTML = remainingTimeTotal  + hourString;
    }
    if (remainingTimeMinute == 1) {
        document.getElementById("remainingTimeMinute").innerHTML = remainingTimeMinute  + minuteString;
    }          
    
    // Detect what game is running and hide the class that is not needed.
    if (data.game.gameName == 'ETS2') {
        
        // Hide the class isAts when playing ETS
        $('.isAts').hide();
        $('.isEts2').show();

        // Convert KG to T
        data.trailer.mass = (data.trailer.mass / 1000.0) + 't';        
        
        // Fill the tank icon to the current percentage
        data.currentFuelPercentage = (data.truck.fuel / data.truck.fuelCapacity) * 100;
        $('.fillingIcon.fuel .top').css('height', (100 - data.currentFuelPercentage) + '%');
    
        // Make the tank text and icon red when below 300 KM left or remove it when not
        if (data.truck.fuelCapacity <= 300) {
            document.getElementById("tank").classList.add("red-text");
            $('.fillingIcon.fuel .warning').css('height', (100) + '%');
        } else {
            document.getElementById("tank").classList.remove("red-text");
            $('.fillingIcon.fuel .warning').css('height', (0) + '%');
        }             
        
        // Make the speed box on the Dashboard red when going above the speedlimit
        var speedCheckBox = document.getElementById("speedCheck");
    
        if (data.truck.speed > data.navigation.speedLimit) {
            speedCheckBox.classList.add("red-gradient");
        } else {
            speedCheckBox.classList.remove("red-gradient");
        }

        // Make the speed bar red disappear when there is no speed limit and make it disappear
        // when it matches the speed
        if (data.navigation.speedLimit == 0) {
            speedCheckBox.classList.remove("red-gradient");
        }        

        if (data.truck.speed == data.navigation.speedLimit) {
            speedCheckBox.classList.remove("red-gradient");
        }                
        
        // Fill the sleep icon to the current percentage
        var sleepHourInMinutes = (nextRestStopTotal * 60);
        var sleepTotalInMinutes = (sleepHourInMinutes + nextRestStopMinute);
        var sleepTotal = (sleepTotalInMinutes / 840);
        $('.fillingIcon.rest .top').css('height', (sleepTotal * 100 ) + '%');

        // Make the sleep text and icon red when below 2 hours left or remove it when not
        if (sleepTotalInMinutes <= 120) {
            document.getElementById("sleep").classList.add("red-text");
            $('.fillingIcon.rest .warning').css('height', (100) + '%');
            $('.fillingIcon.rest .top').css('height', (0) + '%');
        } else {
            document.getElementById("sleep").classList.remove("red-text");
            $('.fillingIcon.rest .warning').css('height', (0) + '%');
        }            
                
        
    } else {
        
        // Hide the class isEts2 when playing ATS
        $('.isEts2').hide();
        $('.isAts').show();
        
        // Convert kilometers per hour to miles per hour
        data.truck.speedMph = data.truck.speed * 0.621371;        
        
        // Convert the speedlimit to miles per hour
        data.navigation.speedLimit = Math.floor(data.navigation.speedLimit * 0.621371);
        
        // Convert the estimated distance to destination to miles
        data.navigation.estimatedDistance = data.navigation.estimatedDistance * 0.621371;
        
        // Convert Cruise Control to MPH
        data.truck.cruiseControlSpeed = data.truck.cruiseControlSpeed * 0.621371;
        
        // Convert liters to gallons
        data.truck.fuel = data.truck.fuel * 0.264172052;
        data.truck.fuelCapacity = data.truck.fuelCapacity * 0.264172052;

        // Convert T to LBS
        data.trailer.mass = Math.round(data.trailer.mass * 2.204623) + ' lbs';                

        // Fill the tank icon to the current percentage
        data.currentFuelPercentage = (data.truck.fuel / data.truck.fuelCapacity) * 100;
        $('.fillingIcon.fuel .top').css('height', (100 - data.currentFuelPercentage) + '%');
    
        // Make the tank text and icon red when below 300 Miles left or remove it when not
        if (data.truck.fuelCapacity <= 186) {
            document.getElementById("tank").classList.add("red-text");
            $('.fillingIcon.fuel .warning').css('height', (100) + '%');
        } else {
            document.getElementById("tank").classList.remove("red-text");
            $('.fillingIcon.fuel .warning').css('height', (0) + '%');
        }        

        // Make the speed box on the Dashboard red when going above the speedlimit
        var speedCheckBoxMph = document.getElementById("speedCheck");
    
        if (data.truck.speedMph > data.navigation.speedLimit) {
            speedCheckBoxMph.classList.add("red-gradient");
        } else {
            speedCheckBoxMph.classList.remove("red-gradient");
        }

        // Make the speed bar red disappear when there is no speed limit and make it disappear
        // when it matches the speed
        if (data.navigation.speedLimit == 0) {
            speedCheckBoxMph.classList.remove("red-gradient");
        }        

        if (data.truck.speedMph == data.navigation.speedLimit) {
            speedCheckBoxMph.classList.remove("red-gradient");
        }                    
        
        // Fill the sleep icon to the current percentage
        var sleepHourInMinutes = (nextRestStopTotal * 60);
        var sleepTotalInMinutes = (sleepHourInMinutes + nextRestStopMinute);
        var sleepTotal = (sleepTotalInMinutes / 660);
        $('.fillingIcon.rest .top').css('height', (sleepTotal * 100 ) + '%');

        // Make the sleep text and icon red when below 2 hours left or remove it when not
        if (sleepTotalInMinutes <= 120) {
            document.getElementById("sleep").classList.add("red-text");
            $('.fillingIcon.rest .warning').css('height', (100) + '%');
            $('.fillingIcon.rest .top').css('height', (0) + '%');
        } else {
            document.getElementById("sleep").classList.remove("red-text");
            $('.fillingIcon.rest .warning').css('height', (0) + '%');
        }            
        
        }    
    
    // Hide hasJob when there is no job and the other way around.
    if (data.trailer.attached) {
        $('.hasJob').show();
        $('.noJob').hide();
    } else {
        $('.hasJob').hide();
        $('.noJob').show();
    }    
    
    // Make the text red when there is 3 hours left to complete the job
    var timeLeftWarning = document.getElementById("timeLeftWarning");
    if (remainingTimeTotal < 3) {
        timeLeftWarning.classList.add("red-text");
    } else {
        timeLeftWarning.classList.remove("red-text")
    }    
    
    // Return the max value of all damage percentages.
    function getDamagePercentage(data) {
        return Math.max(data.truck.wearEngine,
                        data.truck.wearTransmission,
                        data.truck.wearCabin,
                        data.truck.wearChassis,
                        data.truck.wearWheels) * 100;
    }        

    // Calculate the percentage of damage and adjust the height of the colored SVG
    data.scsTruckDamage = getDamagePercentage(data);
    $('.fillingIcon.truckDamage .top').css('height', (100 - data.scsTruckDamage) + '%');
    $('.fillingIcon.trailerDamage .top').css('height', (100 - data.trailer.wear * 100) + '%');    

    // Get the total damage of the truck in percent and show it on the truck status page
    var totalTruckPercent = 100 - (100- data.scsTruckDamage);
    var TotalTruckPercentRound = Math.floor(totalTruckPercent);
    if (data.scsTruckDamage >= 1) {
        document.getElementById("truckDamage").innerHTML = TotalTruckPercentRound + '%';
    } else {
        document.getElementById("truckDamage").innerHTML = '0%';
    }
    
    // Get the total damage of the trailer in percent and show it on the truck status page
    var trailerDamageWear = Math.floor(data.trailer.wear * 100) + '%';
    if (trailerDamageWear >= 1 + '%') {
        document.getElementById("trailerDamage").innerHTML = trailerDamageWear;
    } else {
        document.getElementById("trailerDamage").innerHTML = '0%';    
    }
    
    // return changed data to the core for rendering
    return data;
};

Funbit.Ets.Telemetry.Dashboard.prototype.render = function (data, utils) {
    //
    // data - same data object as in the filter function
    // utils - an object containing several utility functions (see skin tutorial for more information)
    //
    
    // data - same data object as in the filter function

    // we don't have anything custom to render in this skin,
    // but you may use jQuery here to update DOM or CSS
}