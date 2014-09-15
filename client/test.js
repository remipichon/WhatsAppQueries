Test = function() {};

Test.prototype.analyseStatistique = function() {
    var date = new Date();
    var name = "analyseStatistique_" + date.getFullYear() + "." + date.getMonth() + "." + date.getDate() + "-" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    var stat = new StatistiqueService(false);

    log.debug("Test.analyseStatistique : start profile");
    console.profile(name);
    log.debug("Test.analyseStatistique start timeline");
    console.timeline(name);

    log.setLevel(log.levels.WARN);
    stat.setAll(function() {
        console.profileEnd(name);
        log.debug("Test.analyseStatistique : end profile");

        console.timelineEnd(name);
        log.debug("Test.analyseStatistique end timeline");

        log.setLevel(log.levels.TRACE);


    });

    return stat;



}



Test.prototype.analyseStatistiqueTimeline = function() {
    var date = new Date();
    var name = "analyseStatistique_" + date.getFullYear() + "." + date.getMonth() + "." + date.getDate() + "-" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    var stat = new StatistiqueService(false);

    log.debug("Test.analyseStatistique getMessagePerUserTimeline : start profile");
    console.profile(name);
    log.debug("Test.analyseStatistique getMessagePerUserTimeline start timeline");
    console.timeline(name);

    log.setLevel(log.levels.WARN);
    stat.getMessagePerUserTimeline(function() {
        console.profileEnd(name);
        log.debug("Test.analyseStatistique getMessagePerUserTimeline : end profile");

        console.timelineEnd(name);
        log.debug("Test.analyseStatistique getMessagePerUserTimeline end timeline");

        log.setLevel(log.levels.TRACE);


    });

    return stat;



}


Test.prototype.drawHightcharts = function(filename) {
    var st = Test.prototype.getFromLocalStorage(filename);


    HighchartsService.prototype.drawHighcharts(st);
}

Test.prototype.getFromLocalStorage = function(conversationName) {
    var statistique = JSON.parse(localStorage.getItem(conversationName));
    var statMethods = new StatistiqueService({
        ref: "NOTHING",
        calculAll: false,
        initAop: false
    });
    statistique.numberMessagePerUser = null; //je sais pas pourquoi c'est perdu lors du passage par le local storage

    //re-add methods which are lost after being serialized
    var arrayProperties = Object.getOwnPropertyNames(statMethods);
    for (var id = 0; id < arrayProperties.length; id++) {
        var property = arrayProperties[id];
        if (typeof statMethods[property] === "function") {
            statistique[property] = statMethods[property];
        }
    }

    return statistique;

}

Test.prototype.statistiqueInLocalStorage = function(conversationName, timeline) {
    localStorage.removeItem(conversationName);
    var st = new StatistiqueService({
        ref: conversationName,
        calculAll: true
    });
    if (typeof timeline === "boolean" && timeline === true) st.getMessagePerUserTimeline();
    else {

        var series = [];
        for (var i = 0; i < 24; i++) {
            series.push({
                name: "name",
                data: i
            });

        }
        st.messagePerUserTimeline = series;
    }
    localStorage.setItem(conversationName, JSON.stringify(st));
    log.trace("Done");
}

Test.prototype.deleteAll = function(conversationName){
     Meteor.call("deleteAll", conversationName, null/*Meteor.userId()*/, function(error, result) {
        log.info("deleteAll done", Conversation.find({}).fetch.length, Data.find({}).fetch().length, Statistique.find({}).fetch().length);
     });
}



test = new Test();


/*
Rien = function() {
    this.logger = function() {
        console.log("rien");
    }


    this.fn = function() {
        this.logger();
    }
}


// must be after adding methods to prototype
Aop.around("", function(f) {
    //arguments[0].arguments[0] += 10;      
    log.trace(" AOPbefore DatetimePickerService" + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
    var retour = Aop.next(f); //mandatory
    log.trace(" AOPafter DatetimePickerService" + f.fnName, "which returned", retour);
    return retour; //mandatory
}, [Rien]);
*/

/*
Autre = function() {
    this.attr = 34;
}

Autre.prototype.fn = function() {
    this.logger();
}

Autre.prototype.logger = function() {
    console.log("rien");
}

// must be after adding methods to prototype
Aop.around("", function(f) {
    //arguments[0].arguments[0] += 10;      
    log.debug(" AOPbefore DatetimePickerService" + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
    var retour = Aop.next(f,Autre.prototype); //mandatory
    log.debug(" AOPafter DatetimePickerService" + f.fnName, "which returned", retour);
    return retour; //mandatory
}, [Autre.prototype]);

Autre.prototype.fn();
a = new Autre(); a.fn();

*/