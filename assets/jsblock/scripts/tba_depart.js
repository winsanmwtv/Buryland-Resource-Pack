// copyright 2024 Transport for Buryland Authority (TBA Board) and Konno Systems Ltd.
include(Resources.id("jsblock:scripts/pids_util.js")); // built-in script from JCM

function create(ctx, state, pids) {/* leave this empty */}

function render(ctx, state, pids) { // do logic here 
    Texture.create("Background") // background image
    .texture("jsblock:textures/konno/tba_departure_board.png")
    .size(pids.width, pids.height)
    .draw(ctx);
    
    renderClock(ctx, pids);

    renderDate(ctx, pids);

    let trainData = new Array(6); // init data
    for (let i = 0; i < 6; i++) {
        trainData[i] = pids.arrivals().get(i);
    }

    if (trainData[0] == null) { // misconfiguration
        Texture.create("Background") // background image
        .texture("jsblock:textures/tba.png")
        .size(pids.width, pids.height)
        .draw(ctx);

        Text.create("misconfig")
        .text("Error while launch: WRONG_DATA_CONFIGURATION")
        .pos(pids.width/2, pids.height-10.5)
        .scale(0.5)
        .color(0xFF5757)
        .centerAlign()
        .draw(ctx);

        Text.create("misconfig")
        .text("(0x659C7EF8) Is platform missing? (Contact KONNO)")
        .pos(pids.width/2, pids.height-6)
        .scale(0.5)
        .color(0xFF5757)
        .centerAlign()
        .draw(ctx);
        
    } else {
        let thisStation = trainData[0].route().getPlatforms(); // current station name
        let whereStation = trainData[0].route().getPlatformIndex(trainData[0].platformId());
        Text.create("This Station") // where we're at right now
        .text(TextUtil.getNonCjkParts(thisStation[whereStation].getStationName()))
        .pos(12, 6.5)
        .scale(0.5)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);

        let y = 22;

        for (let i = 0; i < 6; i++) {
            if (trainData[i] == null) return;
            renderArrivals(ctx, pids, trainData[i], y);
            y+=8.9;
        }
    }
}

function renderArrivals(ctx, pids, trainData, y) {
    let departureTime = ClockFormat.formatTime(new Date(trainData.departureTime()));
    if (trainData.terminating()) {
        departureTime = ClockFormat.formatTime(new Date(trainData.arrivalTime()));
    }

    Text.create("Departure Time")
    .text(departureTime)
    .pos(9, y)
    .scale(0.6)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    let trainName = KonnoUtil.formatTrainNo(trainData.departureIndex())+" "+TextUtil.getNonCjkParts(trainData.routeName());

    Text.create("Train Name")
    .text(trainName)
    .pos(38.3, y+0.8)
    .scale(0.4)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    let trainDestination = trainData.destination();
    if (trainData.terminating()) {
        trainDestination = "(Arrival)";
    }

    Text.create("destination")
    .text(trainDestination)
    .pos(78, y+0.8)
    .scale(0.4)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    let platform = trainData.platformName();

    Text.create("platform")
    .text(platform)
    .pos(105, y)
    .scale(0.5)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    let statusText = "";
    let pillColor = 0xFFFFFF;
    let pillEmpty = true;
    let statusTextColor = 0x2B2B2B;

    if (trainData.deviation()/1000 >= 15 && trainData.deviation()/1000 < 60) {
        statusText = "Delayed";
        statusTextColor = 0xFF5757;
    } else if (trainData.deviation()/1000 >= 60) {
        statusText = ClockFormat.formatSecond(trainData.deviation()/1000)+" delay";
        statusTextColor = 0xFF5757;
    }

    if (!trainData.terminating()) {
        if ((((trainData.departureTime()-Date.now())-20000)/1000) > 40 && (((trainData.arrivalTime()-Date.now())-20000)/1000)/60 < 1.5) {
            statusText = "Boarding";
            pillColor = 0xE58A00;
            pillEmpty = false;
            statusTextColor = 0x2B2B2B;
        } else if ((((trainData.departureTime()-Date.now())-20000)/1000) <= 40 && (((trainData.departureTime()-Date.now())-20000)/1000) > 10) {
            if (trainData.platform().getDwellTime()/1000 > 60) {
                statusText = "Final Call";
                pillColor = 0xFF3131;
                pillEmpty = false;
                statusTextColor = 0xFFFFFF;
            } else {
                statusText = "Last Check";
                pillColor = 0xFF3131;
                pillEmpty = false;
                statusTextColor = 0xFFFFFF;
            }
        } else if ((((trainData.departureTime()-Date.now())-20000)/1000) <= 10) {
            statusText = "Confirmed";
            pillColor = 0x2567FB;
            pillEmpty = false;
            statusTextColor = 0xFFFFFF;
        }
    } else {
        if ((((trainData.departureTime()-Date.now())-20000)/1000) > 40 && (((trainData.arrivalTime()-Date.now())-20000)/1000)/60 < 0.5) {
            statusText = "Alighting";
            pillColor = 0xE58A00;
            pillEmpty = false;
            statusTextColor = 0x2B2B2B;
        } else if ((((trainData.departureTime()-Date.now())-20000)/1000) <= 40 && (((trainData.departureTime()-Date.now())-20000)/1000) > 10) {
            statusText = "Last Check";
            pillColor = 0xFF3131;
            pillEmpty = false;
            statusTextColor = 0xFFFFFF;
        } else if ((((trainData.departureTime()-Date.now())-20000)/1000) <= 10) {
            statusText = "Confirmed";
            pillColor = 0x2567FB;
            pillEmpty = false;
            statusTextColor = 0xFFFFFF;
        }
    }

    if (!pillEmpty) {
        Texture.create("Status Texture") // Boarding, alighting, etc.
        .texture("jsblock:textures/konno/tba_status.png")
        .pos(pids.width-22.5, y-1.7)
        .size(21, 7)
        .color(pillColor)
        .draw(ctx);
    }

    Text.create("status")
        .text(statusText)
        .pos(pids.width-12, y+0.8)
        .scale(0.4)
        .color(statusTextColor)
        .centerAlign()
        .draw(ctx);
}

function renderClock(ctx, pids) { // top-right clock render
    Text.create("Time")
    .text(ClockFormat.formatTime(new Date()))
    .pos(pids.width-6.5, 3)
    .scale(0.8)
    .color(0xFFFFFF)
    .rightAlign()
    .draw(ctx);
}

function renderDate(ctx, pids) { // top-right today's  date
    Text.create("Day")
    .text(ClockFormat.formatDay(new Date()))
    .pos(pids.width-32, 2)
    .scale(0.5)
    .color(0xFFFFFF)
    .rightAlign()
    .draw(ctx);

    Text.create("Date")
    .text(ClockFormat.formatDate(new Date()))
    .pos(pids.width-32, 6.5)
    .scale(0.5)
    .color(0xFFFFFF)
    .rightAlign()
    .draw(ctx);
}

function dispose(ctx, state, pids) {/* leave this empty */}

const KonnoUtil = {
    formatTrainNo(train) {
        return `${train.toString().padStart(3, '0')}`;
    },
    formatCars(cars) {
        if (cars == 1) return `${cars} coach`;
        else return `${cars} coaches`;
    }
}

const ClockFormat = {
    formatTime(d) { // time formater 20:18
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    formatDate(d) { // date formater 29 Nov 2024
        const month = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-4)}`;
    },
    formatSecond(time) { // format into min, mins, hr, hrs
        if (Math.floor(time) < 1) return;
        else if (Math.floor(time) < 60) return `${Math.floor(time)} sec`;
        time /= 60; // make it into minutes
        if (Math.floor(time) == 1) return `${Math.floor(time)} min`;
        else if (Math.floor(time) < 60) return `${Math.floor(time)} mins`;
        else if (Math.floor(time) < 120) return `${Math.floor(time/60)} hr`;
        else if (Math.floor(time) < 1440) return `${Math.floor(time/60)} hrs`;
        else if (Math.floor(time) < 2880) return `${Math.floor((time/60)/24)} day`;
        else return `${Math.floor((time/60)/24)} days`;
    },
    formatDay(d) {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = daysOfWeek[d.getDay()];
        return `${dayOfWeek.toString()}`;
    }
}