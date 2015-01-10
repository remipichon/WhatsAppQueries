Conversation = new Meteor.Collection("conversation");
ConversationSubscription = null;

ConversationHelper = function () {
}

/**
 * parse each options.rows into Data.ref = options.ref
 * create conversation
 * create null statistique
 * @param  {object} options filename (string),conversationName (string), add (boolean) if server, append data or delete
 * rows (array of string) all the rows of the file
 */
ConversationHelper.prototype.parseRows = function (options) {
    var filename = options.filename;
    var conversationName = options.conversationName;
    var add = ((typeof options.add === "boolean") ? options.add : true);
    var rows = options.rows;
    var date = {};
    var hours = {};
    var userName = "";
    var now = new Date();
    var year = now.getFullYear();
    var isMultiple = false;
    var month = ["jan", "feb", "mar", "apr", "may", "juin", "juil", "aug", "sept", "nov", "dec"];

    var nbRows = rows.length;
    var cpt = 0;
    var names = [];
    var minDate, maxDate, tempDate;

    // _.each(rows, function(row) {
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        if (row.length === 0) continue;

        var deltaD = null; //
        var deltaM = null;
        var deltaH = null;

        //case day is one digits
        if (row.substring(1, 2) === " ") { //case day is one digit
            deltaD = 0;
        } else
        //case day is two digits
        if (typeof parseInt(row.substring(1, 2)) === "number") {
            deltaD = 1;
        } else {
            isMultiple = true;
        }
        //case month is short enough
        if (row.substring(6 + deltaD, 7 + deltaD) === " ") {
            deltaM = 0;
        } else
        //case month is too long and contains "."
        if (row.substring(6 + deltaD, 7 + deltaD) === ".") { //case month is cut and has . at the end
            deltaM = 1;
        } else {
            isMultiple = true;
        }


        //case hour is one digit
        if (row.substring(8 + deltaD + deltaM, 9 + deltaD + deltaM) === ":") {
            deltaH = -2;
        }else
        //case hour is two digit
        if (row.substring(9 + deltaD + deltaM, 10 + deltaD + deltaM) == ":") {
            deltaH = -1;
        }else{
        //case the year is not the one when the script was extracted
            deltaH = 4;
            year = row.substring(7 + deltaD + deltaM, 11 + deltaD + deltaM)


        }


        tempDate = {
            day: row.substring(0, 2),
            month: row.substring(2 + deltaD, 6 + deltaD),
            hour: row.substring(8 + deltaM + deltaD + deltaH, 10 + deltaM + deltaD + deltaH),
            minutes: row.substring(11 + deltaM + deltaD + deltaH, 13 + deltaM + deltaD + deltaH)
        };

        //is the row a multiple row ?  and are we found number of
        if (isMultiple || isNaN(tempDate.day) || isNaN(tempDate.hour) || isNaN(tempDate.minutes)) {
            var content = row;
            isMultiple = false;
            //we use previous metadata
        } else {
            date = tempDate;
            date.ISO = new Date(now.getFullYear(), month.indexOf(date.month), parseInt(date.day), parseInt(date.hour), parseInt(date.minutes), 0, 0);
            hours = {
                hour: date.hour,
                minutes: date.minutes
            }
            hours.ISO = new Date(1970, 1, 1, parseInt(date.hour), parseInt(date.minutes), 0, 0);
            var header = row.split(":")[0] + row.split(":")[1];
            userName = row.substring(18-2 + deltaM + deltaD + deltaH, header.length + 1);
            var content = row.substring(header.length + 3, row.length);
        }


        Data.insert({
            date: date,
            hours: hours,
            userName: userName,
            content: content.length, //here we only store length of the content, which means number of characters. This code should never be on the server for privacy purpose
            reference: conversationName
        });

        if (names.indexOf(userName) === -1) {
            names.push(userName);
        }

        if (cpt === 0) {
            minDate = date;
        }
        maxDate = date;


        cpt++;
        var toDisplay = null;
        if (cpt > 100) {
            if (cpt > 1000) {
                if (cpt > 10000) {
                    if (cpt % 10000 == 0) toDisplay = cpt
                }
                if (cpt % 1000 == 0) toDisplay = cpt
            }
            if (cpt % 100 == 0) toDisplay = cpt
        } else {
            toDisplay = cpt;
        }

        //update bootstrap progress bar
        if (Meteor.isClient) {
            if (cpt / nbRows * 100 === parseInt(cpt / nbRows * 100)) {
                var toPrint = parseInt(cpt / nbRows * 100) + "%";
                log.info("parseRows",toPrint,"-",cpt,"on",nbRows);
                //var e1 = document.getElementById("e1");
                //e1.style.width = toPrint;
                // $("#parse-file-progress-bar").css("width", toPrint);
                // $("#parse-file-progress-bar span").html(toPrint);

            }
        }

        if (toDisplay !== null) {
            log.info("parseRows", filename, toDisplay, "on", nbRows, row);
        }

    }

    log.info("parseRows", cpt, "from", filename, "into", conversationName);

    this.create(conversationName, names, minDate, maxDate, nbRows);
    var st = new StatistiqueService({
        ref: conversationName,
        calculAll: false
    });
    st.create();
    ModalControler.prototype.resetModal();

}


/**
 * all are mandatories
 * @param  {string} name
 * @param  {array of string} userList
 * @param  {IsoDate} minDate  date of the first row
 * @param  {IsoDate} maxDate  date of the last row
 * @param  {number} nbRows
 */
ConversationHelper.prototype.create = function (name, userList, minDate, maxDate, nbRows) {
    return Conversation.insert({
        name: name,
        userList: userList,
        minDate: minDate,
        maxDate: maxDate,
        nbRows: nbRows
    });
}

/**
 * honnete ce n'est pas sa place ici, je fais pas trop ou la mettre
 * @param  {string} conversationName
 */
ConversationHelper.prototype.getConversationDataStatistique = function (conversationName, prematureSub, callback) {
    if (typeof prematureSub === "function") callback = prematureSub;
    else if (typeof prematureSub !== "boolean") prematureSub = false;

    Meteor.call("getConversation", conversationName, null /*Meteor.userId()*/, prematureSub, function (error, result) {
        if (typeof error !== "undefined") {
            log.error("getConversationDataStatistique : get error ", error);
            return;
        }

        //arret des precedentes ubscriptions si existante
        if (DataSubscription !== null)
            DataSubscription.stop();
        if (StatistiqueSubscription !== null)
            StatistiqueSubscription.stop();
        if (ConversationSubscription !== null)
            ConversationSubscription.stop();

        //nouvelles sub
        DataSubscription = Meteor.subscribe("data_" + conversationName);
        StatistiqueSubscription = Meteor.subscribe("statistique_" + conversationName);
        ConversationSubscription = Meteor.subscribe("conversation_" + conversationName);

        log.info("getConversationDataStatistique ", result, ": done with subscribes");
        if (typeof callback === "function") callback();


    });
}


ConversationHelper.prototype.setHasStat = function (hasStat, statistique) {
    Conversation.update({
        _id: Conversation.findOne({
            name: statistique.ref
        })._id
    }, {
        $set: {
            hasStat: hasStat
        }
    });
}


Aop.around("", function (f) {
    log.info(" AOPbefore ConversationHelper." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
    var retour = Aop.next(f, ConversationHelper.prototype); //mandatory
    log.info(" AOPafter ConversationHelper." + f.fnName, "which returned", retour);
    return retour; //mandatory
}, [ConversationHelper.prototype]);