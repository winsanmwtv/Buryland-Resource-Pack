include(Resources.id("jsblock:scripts/pids_util.js")); // Built-in script shipped with JCM

function create(ctx, state, pids) { // just left it null
}

function render(ctx, state, pids) {
    Texture.create("Background Image")
    .texture("jsblock:textures/tba_intercity_terminates.png")
    .size(pids.width, pids.height)
    .draw(ctx);

    let platform = pids.arrivals().get(0);
    Text.create("Platform")
    .text("Platform "+platform.platformName())
    .pos(pids.width - 2, 9)
    .scale(0.4)
    .rightAlign()
    .color(0xFFFFFF)
    .draw(ctx);
    
    // renderAd(ctx, pids);

    renderTime(ctx, pids);

    // renderCurrentTrain(ctx, pids);

    renderStatus(ctx, pids);

    // renderNextTrain(ctx, pids);
}

function renderCurrentTrain(ctx, pids) {
    let firstArrival = pids.arrivals().get(0);
    if(firstArrival == null) return;

    Text.create("Current Train")
    .text(PIDSUtil.formatDateTime(new Date((firstArrival.departureTime()))))
    .pos(13, 22)
    .scale(0.82)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);

    let rt = firstArrival.routeName();
    let term = firstArrival.terminating();
    let dest = firstArrival.destination();
    let delay = firstArrival.deviation()/1000;
    let delayText;
    let depart = ((firstArrival.arrivalTime()-20000)-Date.now())/1000;
    let departed = firstArrival.realtime();

    if (term) dest = "Terminates here";

    Text.create("Current Train Route")
    .text(TextUtil.getNonCjkParts(rt))
    .pos(25, 21)
    .scale(0.5)
    .color(0xFFFFFF)
    .draw(ctx);

    Text.create("Current Train Destination")
    .text(TextUtil.getNonCjkParts(dest))
    .pos(25, 26)
    .scale(0.4)
    .color(0xFFFFFF)
    .draw(ctx);

    if (!departed) {
        delayText = "At Orgin";
    } else if (delay == 0) {
        delayText = "On-time";
    } else if (delay <= 59) {
        delayText = "Slightly delay";
    } else {
        let delayMin = delay/60;
        delayText = PIDSAddon.getETATextMin(Math.floor(delayMin)) +" delayed";
    }

    Text.create("Current Train Delay")
    .text(delayText)
    .pos(68, 23)
    .scale(0.5)
    .color(0xFFFFFF)
    .leftAlign()
    .draw(ctx);

    if (depart < -9) {
        Text.create("Current Train Departure")
        .text(PIDSAddon.getETAText(firstArrival.departureTime()-20000, "Departuring"))
        .pos(pids.width-4, 23)
        .scale(0.5)
        .color(0xFFFFFF)
        .rightAlign()
        .draw(ctx);
    } else if (depart < 15) {
        Text.create("Arrive in text")
        .text("Arriving")
        .pos(68, 29)
        .scale(0.3)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);
    } else {
        Text.create("Arrive in")
        .text("Arrive in "+PIDSAddon.getETAText(firstArrival.arrivalTime()-20000, ""))
        .pos(68, 29)
        .scale(0.3)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);
    }
}

function renderNextTrain(ctx, pids) {
    let testArrival = new Array(3);
    let delay = new Array(3);

    let route = new Array(3);
    let dest = new Array(3);
    let term = new Array(3);

    let departed = new Array(3);

    for (let i = 0; i < 3; i++) {
        testArrival[i] = pids.arrivals().get(i+1);
        route[i] = testArrival[i].routeName();
        dest[i] = testArrival[i].destination();
        delay[i] = testArrival[i].deviation()/1000;
        term[i] = testArrival[i].terminating();
        departed[i] = testArrival[i].realtime();
    }

    let y = 42;
    let next = 0;

    for (let i = 0; i < 3; i++) {

        if (testArrival[i] == null) return;

        let delayText;

        Text.create("A Train")
        .text(PIDSUtil.formatDateTime(new Date(testArrival[i].departureTime())))
        .pos(4, y+next)
        .scale(0.41)
        .color(0xFFFFFF)
        .leftAlign()
        .draw(ctx);

        Text.create("Train Route")
        .text(TextUtil.getNonCjkParts(route[i]))
        .pos(14, (y+next)-0.5)
        .scale(0.25)
        .color(0xFFFFFF)
        .draw(ctx);

        Text.create("Train Destination")
        .text(TextUtil.getNonCjkParts(dest[i]))
        .pos(14, (y+next)+2.4)
        .scale(0.2)
        .color(0xFFFFFF)
        .draw(ctx);


        if (!departed[i]) {
            delayText = "At Orgin";
        } else if (delay[i] == 0) {
            delayText = "On-time";
        } else if (delay[i] <= 59) {
            delayText = "Slightly delay";
        } else {
            let delayMin = delay[i]/60;
            delayText = PIDSAddon.getETATextMin(Math.floor(delayMin)) +" delayed";
        }

        Text.create("Current Train Delay")
        .text(delayText)
        .pos((pids.width/2)-4, y+next)
        .scale(0.41)
        .color(0xFFFFFF)
        .rightAlign()
        .draw(ctx);

        next+=9;
    }
}

function renderStatus(ctx, pids) {
    let status;

    if (MinecraftClient.worldIsThundering() || MinecraftClient.worldIsRaining()) {
        status = "Due to raining outside, passenger can wait inside the station area";
    } else if (PIDSAddon.getHour(new Date()) >= 0 && PIDSAddon.getHour(new Date()) <= 5) {
        status = "Last train might just left the station";
    }
    else {
        status = "System is under testing by KONNO";
    }

    Text.create("Status")
    .text(status)
    .pos(pids.width/2, pids.height-4.25)
    .scale(0.35)
    .color(0xFFFFFF)
    .centerAlign()
    .draw(ctx);
}

function renderAd(ctx, pids) {
    Texture.create("Ad")
    .texture("jsblock:textures/advertise/ad1.png")
    .size(pids.width/2, (pids.height/2)-3.6)
    .pos(pids.width/2, (pids.height/2)-4)
    .draw(ctx);
}

function renderTime(ctx, pids) {
    Text.create("Time")
    .text(PIDSUtil.formatDateTime(new Date()))
    .pos(pids.width - 2, 2)
    .scale(0.5)
    .rightAlign()
    .color(0xFFFFFF)
    .draw(ctx);
    
    Text.create("Time Separator")
    .text("|")
    .pos(pids.width - 14.2, 1.6)
    .scale(0.5)
    .rightAlign()
    .color(0xFFFFFF)
    .draw(ctx);

    Text.create("Date")
    .text(PIDSAddon.formatDate(new Date()))
    .pos(pids.width - 16, 2)
    .scale(0.5)
    .rightAlign()
    .color(0xFFFFFF)
    .draw(ctx);

    Text.create("Day")
    .text(PIDSAddon.formatDay(new Date()))
    .pos(pids.width - 49, 2)
    .scale(0.5)
    .rightAlign()
    .color(0xFFFFFF)
    .draw(ctx);
}

const PIDSAddon = {
    formatDate(d) {
        let month = d.getMonth()+1;
        return `${d.getDate().toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-4)}`;
    },
    formatDay(d) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[d.getDay()];
        return `${dayOfWeek.toString()}`;
    },
    getETAText(arrival, arrivedText) {
        let willArriveIn = arrival - Date.now();
        let willArriveInSec = Math.floor(willArriveIn/1000);
        if(willArriveInSec <= 0) {
            return arrivedText ? arrivedText : "";
        } else if(willArriveIn <= 1999) {
            return `${willArriveInSec} second`;
        } else if(willArriveIn <= 60000) {
            return `${willArriveInSec} seconds`;
        } else if(willArriveIn <= 120000) { // Less than 2 mins, use non-plural form
            return `${Math.floor(willArriveInSec/60)} minute`;
        } else if(willArriveIn <= 3600000) {
             return `${Math.floor(willArriveInSec/60)} minutes`;
         } else if(willArriveIn <= 7200000) { // Less than 2 mins, use non-plural form
            return `${Math.floor((willArriveInSec/60)/60)} hour`;
        } else{
             return `${Math.floor((willArriveInSec/60)/60)} hours`;
         }
    },getETATextMin(arrival) {
        if(arrival == 1) { // Less than 2 mins, use non-plural form
            return `${arrival} min`;
        } else if (arrival <= 60) {
             return `${arrival} mins`;
         } else if (arrival <= 61) {
            return `${arrival} hr`;
        } else {
            return `${arrival} hrs`;
        }
    },getHour(d) {
        return `${d.getHours()}`;
    }
}

function dispose(ctx, state, pids) { // just left it null
}