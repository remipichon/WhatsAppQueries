Test = function() {};

Test.prototype.analyseStatistique = function() {
    var date = new Date();
    var name = "analyseStatistique_" + date.getFullYear() + "." + date.getMonth() + "." + date.getDate() + "-" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    var stat = new Statistiques(false);

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

    var stat = new Statistiques(false);

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


Test.prototype.drawHightcharts = function(){
    var st = Test.prototype.getFromLocalStorage("sample");
    

    HighchartsService.prototype.drawHighcharts(st);
}

Test.prototype.getFromLocalStorage = function(conversationName){
    var statistique = JSON.parse(localStorage.getItem("sample"));
    var statMethods = new Statistiques({ref:"NOTHING",calculAll:false,initAop:false});
    statistique.numberMessagePerUser = null;

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

Test.prototype.statistiqueInLocalStorage = function(conversationName){
    localStorage.removeItem(conversationName);
    var st = new Statistiques({ref:conversationName,calculAll:true}); 
    st.getMessagePerUserTimeline();
    localStorage.setItem(conversationName,JSON.stringify(st));
    log.trace("Done");
}


test = new Test();