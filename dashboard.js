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
    
    // convert kilometers per hour to miles per hour
    data.truck.speedMph = data.truck.speed * 0.621371;
    // convert kg to t
    data.trailer.mass = (data.trailer.mass / 1000.0) + 't';
    // format odometer data as: 00000.0
    data.truck.odometer = utils.formatFloat(data.truck.odometer, 1);
    // convert gear to readable format
    data.truck.gear = data.truck.gear > 0 ? 'D' + data.truck.gear : (data.truck.gear < 0 ? 'R' : 'N');
    // convert rpm to rpm * 100
    data.truck.engineRpm = data.truck.engineRpm / 100;
    
    // Process DOM for job
    if (data.trailer.attached) {
        $('.hasJob').show();
        $('.noJob').hide();
    } else {
        $('.hasJob').hide();
        $('.noJob').show();
    }    
    
    // Round Distance Left
    data.navigation.estimatedDistance = Math.floor(data.navigation.estimatedDistance/1000) + " KM";    
    
    // Convert string to readable time format
    var timeLeftDate = new Date(data.job.remainingTime);
    var remainingDay = timeLeftDate.getUTCDay();
    var remainingHour = timeLeftDate.getUTCHours();
    var remainingMinute = timeLeftDate.getUTCMinutes();
    var remainingTotal = (remainingDay-1) * 24 + remainingHour;
    data.job.remainingTime = document.getElementById("remainingHour").innerHTML = remainingTotal + " hours ";
    data.job.remainingTime = document.getElementById("remainingMinute").innerHTML = remainingMinute + " minutes ";        
    
    // Convert string to readable time format
    var estimatedTimeDate = new Date(data.navigation.estimatedTime);
    var day = estimatedTimeDate.getUTCDay();
    var hour = estimatedTimeDate.getUTCHours();
    var minute = estimatedTimeDate.getUTCMinutes();
    var totalEstimated = (day-1) * 24 + hour;
    data.navigation.estimatedTime = document.getElementById("hour").innerHTML = totalEstimated + " hours ";
    data.navigation.estimatedTime = document.getElementById("minute").innerHTML = minute + " minutes ";    
    
    // Convert string to readable time format
    var nextRestStopTimeDate = new Date(data.game.nextRestStopTime);
    var hours = nextRestStopTimeDate.getUTCHours();
    var minutes = nextRestStopTimeDate.getUTCMinutes();
    data.game.nextRestStopTime = document.getElementById("hours").innerHTML = hours + " hours ";
    data.game.nextRestStopTime = document.getElementById("minutes").innerHTML = minutes + " minutes ";
    
    // Change hours text to hour when on 1 hour left
    if (hours == 1) {
        data.game.nextRestStopTime = document.getElementById("hours").innerHTML = hours + " hour ";
  
    }
    
    if (hour == 1) {
        data.navigation.estimatedTime = document.getElementById("hour").innerHTML = hour + " hour ";
    }
    
    if (remainingTotal == 1) {
        data.job.remainingTime = document.getElementById("remainingHour").innerHTML = remainingTotal + " hour ";       
    }

    if (minutes == 1) {
        data.game.nextRestStopTime = document.getElementById("minutes").innerHTML = minutes + " minute ";
    }        
    
    if (minute == 1) {
        data.navigation.estimatedTime = document.getElementById("minute").innerHTML = minute + "  minute ";
    }
    
    if (remainingMinute == 1) {
        data.job.remainingTime = document.getElementById("remainingMinute").innerHTML = remainingMinute + " minute ";        
    }
    
    var b = document.getElementById("timeLeftWarning");
    if (remainingTotal < 3) {
        b.classList.add("red-text");
    } else {
        b.classList.remove("red-text")
    }
        
    
    // Fill the tank icon to the current percentage
    data.currentFuelPercentage = (data.truck.fuel / data.truck.fuelCapacity) * 100;
    $('.fillingIcon.fuel .top').css('height', (100 - data.currentFuelPercentage) + '%');
    
    // Make the tank text and icon red when below 300KM left or remove it when not
    if (data.truck.fuel <= 300) {
        document.getElementById("tank").classList.add("red-text");
        $('.fillingIcon.fuel .warning').css('height', (100) + '%');
    } else {
        document.getElementById("tank").classList.remove("red-text");
        $('.fillingIcon.fuel .warning').css('height', (0) + '%');
    }
    
    // FIll the sleep icon to the current percentage
    var sleepHourInMinutes = (hours * 60);
    var sleepTotalInMinutes = (sleepHourInMinutes + minutes);
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
    
    // Detect the running game

    if (data.game.gameName == 'ETS2') {
        $('.isAts').hide();
        $('.isEts2').show();
    } else {
        $('.isEts2').hide();
        $('.isAts').show();
    }
    
    if (data.game.gameName == 'ATS') {
        document.getElementById("currency").innerHTML = '$ ';
    } else {
        document.getElementById("currency").innerHTML = '&euro; ';
    }
    
    // Calculate the percentage of damage
    
    function getDamagePercentage(data) {
        // Return the max value of all damage percentages.
        return Math.max(data.truck.wearEngine,
                        data.truck.wearTransmission,
                        data.truck.wearCabin,
                        data.truck.wearChassis,
                        data.truck.wearWheels) * 100;
    }        
    
    data.scsTruckDamage = getDamagePercentage(data);
    $('.fillingIcon.truckDamage .top').css('height', (100 - data.scsTruckDamage) + '%');
    $('.fillingIcon.trailerDamage .top').css('height', (100 - data.trailer.wear * 100) + '%');    

    var totalTruckPercent = 100 - (100- data.scsTruckDamage);
    var TotalTruckPercentRound = Math.floor(totalTruckPercent);
    if (data.scsTruckDamage >= 1) {
        document.getElementById("truckDamage").innerHTML = TotalTruckPercentRound + '%';
    } else {
        document.getElementById("truckDamage").innerHTML = '0%';
    }
    
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
    
    // Make Kilometer box on the Dashboard red when going above the designated speedlimit
    var d = document.getElementById("speedCheck");
    data.navigation.speedLimit = data.navigation.speedLimit + 1;
    if (data.truck.speed > data.navigation.speedLimit) {
        d.classList.add("red-gradient");
    } else {
        d.classList.remove("red-gradient");
    }
    
    // Make the speed bar red disappear when there is no speed limit and make it disappear
    // when it matches the speed
    var a = document.getElementById("speedCheck");
    if (data.navigation.speedLimit == 0) {
        a.classList.remove("red-gradient");
    }        
    
    var b = document.getElementById("speedCheck")
    if (data.truck.speed == data.navigation.speedLimit) {
        b.classList.remove("red-gradient");
    }

    // we don't have anything custom to render in this skin,
    // but you may use jQuery here to update DOM or CSS
}