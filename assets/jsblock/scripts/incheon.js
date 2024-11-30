// copyright 2024 Incheon Connect and Konno Systems Ltd.
include(Resources.id("jsblock:scripts/pids_util.js")); // built-in script from JCM

function create(ctx, state, pids) {/* leave this empty */}

function render(ctx, state, pids) { // do logic here
    Texture.create("Background") // background image
    .texture("jsblock:textures/ic/template.png")
    .size(pids.width, pids.height)
    .draw(ctx);

    let trainData = new Array(2); // init data
    for (let i = 0; i < 2; i++) {
        trainData[i] = pids.arrivals().get(i);
    }

    let thisStation = trainData[0].route().getPlatforms(); // current station name
        let whereStation = trainData[0].route().getPlatformIndex(trainData[0].platformId());

    Text.create("This Station") // where we're at right now
    .text(TextUtil.getNonCjkParts(thisStation[whereStation].getStationName()))
    .pos(47, 6)
    .scale(0.7)
    .color(0xFFFFFF)
    .leftAlign()
    .draw(ctx);

    Text.create("Platform") // which platform we're at
    .text("Platform "+trainData[0].platformName())
    .pos(pids.width-3, 6)
    .scale(0.7)
    .color(0xFFFFFF)
    .rightAlign()
    .draw(ctx);

    let y = 24;

    let isArriving = false;

    for (let i = 0; i < 2; i++) {
        Text.create("Train Number - Service Company") // train route
        .text(TextUtil.getNonCjkParts(trainData[i].routeName()))
        .pos(5, y)
        .scale(0.7)
        .color(trainData[i].route().getColor())
        .leftAlign()
        .draw(ctx);

        let statusText = "";
        let color = 0xFFFFFF;
        if ((((trainData[i].arrivalTime()-Date.now())-20000)/1000)/60 >= 1 && (((trainData[i].arrivalTime()-Date.now())-20000)/1000)/60 <= 3) {
            statusText = ClockFormat.formatSecond(((trainData[i].arrivalTime()-Date.now())-20000)/1000);
            color = 0xFFBF00;
        } else if ((((trainData[i].arrivalTime()-Date.now())-20000)/1000) > 30 && (((trainData[i].arrivalTime()-Date.now())-20000)/1000)/60 < 1) {
            statusText = "soon";
            color = 0xFFBF00;
        } else if ((((trainData[i].arrivalTime()-Date.now())-20000)/1000) > 1 && (((trainData[i].arrivalTime()-Date.now())-20000)/1000) <= 30) {
            // statusText = "soon";
            // color = 0xFFBF00;
            if ((trainData[i].deviation()/1000)/60 >= 3) {
                statusText = ClockFormat.formatSecond(trainData[i].deviation()/1000)+" delay";
                color = 0xFF3131;
            }
            isArriving = true;
            
        } else if ((trainData[i].deviation()/1000)/60 >= 3) {
            statusText = ClockFormat.formatSecond(trainData[i].deviation()/1000)+" delay";
            color = 0xFF3131;
        } else if ((((trainData[i].arrivalTime()-Date.now())-20000)/1000) <= 1) {
            statusText = "Departing";
            color = 0xFFBF00;
        }

        Text.create("Train Number - Service Company") // train route
        .text(statusText)
        .pos((pids.width/2)-12, y)
        .scale(0.7)
        .color(color)
        .centerAlign()
        .draw(ctx);

        let destination = "for " + trainData[i].destination(); // train destination
        if (trainData[i].terminating()) destination = "Service ends here";
        Text.create("Train Number - Service Company") // train route
        .text(destination)
        .pos(pids.width-5, y)
        .scale(0.7)
        .color(0xFFFFFF)
        .rightAlign()
        .draw(ctx);

        y += 20;
    }

    if (isArriving) {
        Texture.create("Arriving") // white bar
        .texture("jsblock:textures/ic/train_arriving.png")
        .size(pids.width, pids.height)
        .draw(ctx);
    }

    Texture.create("Background") // white bar
    .texture("jsblock:textures/ic/white_bar.png")
    .size(pids.width, pids.height)
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