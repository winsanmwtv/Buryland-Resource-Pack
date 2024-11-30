// copyright 2024 Meugon Connect and Konno Systems Ltd.
include(Resources.id("jsblock:scripts/pids_util.js")); // built-in script from JCM

function create(ctx, state, pids) {/* leave this empty */}

function render(ctx, state, pids) { // do logic here
    Texture.create("Background") // background image
    .texture("jsblock:textures/mec_display_main.png")
    .size(pids.width, pids.height)
    .draw(ctx);

    let trainData = new Array(3); // init data
    for (let i = 0; i < 3; i++) {
        trainData[i] = pids.arrivals().get(i);
    }

    if (trainData[0] != null) { // only load arrival if not null
        let thisStation = trainData[0].route().getPlatforms(); // current station name
        let whereStation = trainData[0].route().getPlatformIndex(trainData[0].platformId());

        let y = 13.5; // start first train
        let trainStatus = "";
        for (let i = 0; i < 3; i++) { // 3 arriving trains
            if (!trainData[i].realtime()) { // if train hasn't departed yet
                trainStatus = "At origin station";
            } else if (trainData[i].deviation()/1000 < 0) { // if train come too early
                trainStatus = "Early than schedule";
            } else if (trainData[i].deviation()/1000 < 15) { // if train is on time (offset 15 secs)
                trainStatus = "On time";
            } else if (trainData[i].deviation()/1000 < 60) { // if delay in less than 1 min
                trainStatus = "Delayed from schedule";
            } else { // else format by train delay 1 min or more
                trainStatus = ClockFormat.formatSecond(trainData[i].deviation()/1000)+" delayed";
            }

            renderArrival(ctx, pids, y, i, trainData, trainStatus); // render each train
            y += 20.5;
            trainStatus = "";
        }

        if (!trainData[0].realtime()) { // if train hasn't departed yet
            trainStatus = "At origin station";
        } else if (trainData[0].deviation()/1000 < 0) { // if train come too early
            trainStatus = "Early than schedule";
        } else if (trainData[0].deviation()/1000 < 15) { // if train is on time (offset 15 secs)
            trainStatus = "On time";
        } else if (trainData[0].deviation()/1000 < 60) { // if delay in less than 1 min
            trainStatus = "Delayed from schedule";
        } else { // else format by train delay 1 min or more
            trainStatus = ClockFormat.formatSecond(trainData[0].deviation()/1000)+" delayed";
        }

        if (((trainData[0].arrivalTime()-Date.now())-20000)/1000 <= 5) { // just render full screen display
            renderTrainScreen(ctx, pids, trainData[0]);
        }

        Text.create("This Station") // where we're at right now
        .text(TextUtil.getNonCjkParts(thisStation[whereStation].getStationName()))
        .pos(19, 1)
        .scale(0.5)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);

        Text.create("This Platform") // current platform
        .text("Platform "+trainData[0].platformName())
        .pos(19, 5.5)
        .scale(0.5)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);

        renderClock(ctx, pids); // top-right clock
    }

    else if (trainData[0] == null) { // show boot menu if this being placed outside station area
        Texture.create("Boot Menu")
        .texture("jsblock:textures/mec_empty.png")
        .size(pids.width, pids.height)
        .draw(ctx);
    }
}

function renderTrainScreen(ctx, pids, trainData) {
    let imageURL = "jsblock:textures/mec_display_zoom.png";
    if (trainData.terminating()) imageURL = "jsblock:textures/mec_display_terminus.png";
    Texture.create("Full Information Screen") // full screen train arrived
    .texture(imageURL)
    .size(pids.width, pids.height)
    .draw(ctx);

    Text.create("Train Departure Time") // departure time
    .text(ClockFormat.formatTime(new Date(trainData.departureTime())))
    .pos(2.5, 18)
    .scale(0.8)
    .color(0xFFFFFF)
    .leftAlign()
    .draw(ctx);

    Text.create("Train Information") // Train Information
    .text(KonnoUtil.formatTrainNo(trainData.departureIndex())+" - "+TextUtil.getNonCjkParts(trainData.routeName()))
    .pos(24, 17)
    .scale(0.5)
    .color(0xFFFFFF)
    .leftAlign()
    .draw(ctx);

    let destination = trainData.destination(); // train destination
    if (trainData.terminating()) destination = "Not in Service";
    Text.create("Train Destination") // Train Information
    .text(destination)
    .pos(24, 22)
    .scale(0.5)
    .color(0xFFFFFF)
    .leftAlign()
    .draw(ctx);

    let pillColor = 0xFFFFFF;
    let pillText = "";
    let pillTextColor = 0xFFFFFF;

    if (((trainData.departureTime()-Date.now())-20000)/1000 > trainData.platform().getDwellTime()/1000) {
        if (trainData.deviation()/1000 < 15) { // not delayed
            pillColor = 0x0B794E;
            pillText = "On time";
            pillTextColor = 0xFFFFFF;
        } else if (trainData.deviation()/1000 < 60) { // delay in less than 1 min
            pillColor = 0xFFB000;
            pillText = "Delayed";
            pillTextColor = 0x2B2B2B;
        } else if ((trainData.deviation()/1000)/60 < 10) { // delay in less than 10 min
            pillColor = 0xFFB000;
            pillText = ClockFormat.formatSecond(trainData.deviation()/1000)+" delay";
            pillTextColor = 0x2B2B2B;
        } else {
            pillColor = 0xBE1931;
            pillText = ClockFormat.formatSecond(trainData.deviation()/1000)+" delay";
            pillTextColor = 0xFFFFFF;
        }
    } else if (((trainData.departureTime()-Date.now())-20000)/1000 <= trainData.platform().getDwellTime()/1000 && ((trainData.departureTime()-Date.now())-20000)/1000 >= 15) {
        if (!trainData.terminating()) { // ready to board status
            pillColor = 0xFFB000;
            pillText = "Boarding";
            pillTextColor = 0x2B2B2B;
        } else {
            pillColor = 0xBE1931;
            pillText = "Alighting";
            pillTextColor = 0xFFFFFF;
        }
    } else {
        if (trainData.platform().getDwellTime()/1000 > 15) { // final call
            if (!trainData.terminating()) {
                pillColor = 0xBE1931;
                pillText = "Final Call";
                pillTextColor = 0xFFFFFF;
            } else {
                pillColor = 0xBE1931;
                pillText = "Door Closing";
                pillTextColor = 0xFFFFFF;
            }
        } else {
            if (!trainData.terminating()) { // short final call
                pillColor = 0x2B2B2B;
                pillText = "Departing";
                pillTextColor = 0xFFFFFF;
            } else {
                pillColor = 0xBE1931;
                pillText = "Door Closing";
                pillTextColor = 0xFFFFFF;
            }
        }
    }

    Texture.create("Status Texture") // Boarding, alighting, etc.
    .texture("jsblock:textures/status_pill.png")
    .pos(pids.width-40, 17)
    .size(35, 10)
    .color(pillColor)
    .draw(ctx);

    Text.create("When Departure") // departure information
    .text(pillText)
    .pos(pids.width-23, 20)
    .scale(0.5)
    .color(pillTextColor)
    .centerAlign()
    .draw(ctx);

    let thisStation = trainData.route().getPlatforms(); 
    let whereStation = trainData.route().getPlatformIndex(trainData.platformId());

    if (!trainData.terminating()) {
        let y = 41;
        for (let i = whereStation+1; i < thisStation.size(); i++) {

            if(i >= whereStation + 5) break; // limit station list by 4

            Text.create("Stopping List") // list station name by 4
            .text("- " + TextUtil.getNonCjkParts(thisStation[i].getStationName()))
            .pos(4, y)
            .scale(0.5)
            .color(0x2567FB)
            .leftAlign()
            .draw(ctx);

            y+=7.5;
        }
    }
} 

function renderArrival(ctx, pids, y, i, trainData, trainStatus) {
    let color = 0xE58000;
    if (i == 1) color = 0x2567FB;
    Text.create("Train Number - Service Company") // train route
    .text(KonnoUtil.formatTrainNo(trainData[i].departureIndex())+" - "+TextUtil.getNonCjkParts(trainData[i].routeName()))
    .pos(12, y)
    .scale(0.5)
    .color(color)
    .leftAlign()
    .draw(ctx);

    Text.create("When Departure") // departure time
    .text(ClockFormat.formatTime(new Date(trainData[i].departureTime())))
    .pos(pids.width-22.5, y+1.5)
    .scale(0.6)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    if (((trainData[i].arrivalTime()-Date.now())-20000)/1000 > 15 && (((trainData[i].arrivalTime()-Date.now())-20000)/1000)/60 <= 10) { // countdown at 10 minutes left and more than 15 seconds
        Text.create("ETA") // do countdown
        .text(ClockFormat.formatSecond(((trainData[i].arrivalTime()-Date.now())-20000)/1000))
        .pos(pids.width-22.5, y+9)
        .scale(0.5)
        .color(0xFFFFFF)
        .centerAlign()
        .draw(ctx);
    } else if (((trainData[i].arrivalTime()-Date.now())-20000)/1000 > 5 && ((trainData[i].arrivalTime()-Date.now())-20000)/1000 <= 15) { // 15 seconds left
        Text.create("ETA") // do countdown
        .text("Arriving") // just show arriving
        .pos(pids.width-22.5, y+9)
        .scale(0.5)
        .color(0xFFFFFF)
        .centerAlign()
        .draw(ctx);
    }

    let destination = trainData[i].destination(); // train destination
    if (trainData[i].terminating()) destination = "Not in Service";
    Text.create("Train Destination")
    .text(destination)
    .pos(12, y+5.5)
    .scale(0.6)
    .color(0x2B2B2B)
    .leftAlign()
    .draw(ctx);

    Text.create("Coaches") // train cars
    .text(KonnoUtil.formatCars(trainData[i].carCount()))
    .pos(2.5, y+11.5)
    .scale(0.5)
    .color(0xFF3131)
    .leftAlign()
    .draw(ctx);

    Text.create("Train Status") // train status
    .text(trainStatus)
    .pos(87.5, y+11.5)
    .scale(0.5)
    .color(0x2B2B2B)
    .rightAlign()
    .draw(ctx);
}

function renderClock(ctx, pids) { // top-right clock render
    Text.create("Date")
    .text(ClockFormat.formatDate(new Date()))
    .pos(pids.width-1, 1)
    .scale(0.5)
    .color(0xFFFFFF)
    .rightAlign()
    .draw(ctx);

    Text.create("Time")
    .text(ClockFormat.formatTime(new Date()))
    .pos(pids.width-1, 5.5)
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
        return `${d.getDate().toString().padStart(2, '0')} ${month[d.getMonth()]} ${d.getFullYear().toString().slice(-4)}`;
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
    }
}