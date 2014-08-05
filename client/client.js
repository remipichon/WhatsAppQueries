Meteor.startup(function() {
	// code to run on server at startup

});

Data = new Meteor.Collection("data");



ref = "sample.txt";
getEnumName = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;
	var names = [];
	_.each(Data.find({
		$and: [{
				reference: ref
			},
			betweenDate
		]
	}).fetch(), function(row) {
		console.debug(row);
		if (names.indexOf(row.userName) === -1) {
			names.push(row.userName);
		}
	});

	return names;
};

getNumberMessagePerUser = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;
	var enumName = getEnumName(ref);
	var occurences = {};
	_.each(enumName, function(userName) {
		occurences[userName] = Data.find({
			$and: [{
					userName: userName
				}, {
					reference: ref
				},
				betweenDate
			]
		}).fetch().length;

	});
	return occurences;
}

getTotalContentPerUser = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;
	var enumName = getEnumName(ref);
	var occurences = {};
	_.each(enumName, function(userName) {
		var tot = 0;
		_.each(Data.find({
			$and: [{
					userName: userName
				}, {
					reference: ref
				},
				betweenDate
			]
		}).fetch(), function(record) {
			tot += record.content.length;
		});

		occurences[userName] = tot;
	});
	return occurences;
}

getNumberTotalMessage = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;

	return Data.find({
		reference: ref
	}).fetch().length;
}


statNumberMessagePerUser = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;

	var occurences = {};
	var enumName = getEnumName(ref);
	var nbMsgPerUser = getNumberMessagePerUser(ref);
	var totalMessage = getNumberTotalMessage(ref);
	_.each(enumName, function(name) {
		occurences[name] = nbMsgPerUser[name] / totalMessage;
	});
	return occurences;
}

statContentMessagePerUser = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;

	var occurences = {};
	var enumName = getEnumName(ref);
	var contentPerUser = getTotalContentPerUser(ref);
	var totalMessageContent = 0;
	_.each(contentPerUser, function(l) {
		totalMessageContent += l;
	});
	_.each(enumName, function(name) {
		occurences[name] = contentPerUser[name] / totalMessageContent;
	});
	return occurences;
}
getStat = function(ref, betweenDate) {
	betweenDate = betweenDate || infinityDate();;

	ref = ref || "sample.txt";

	console.info("user ", getEnumName(ref, betweenDate));
	console.info("number message per user ", getNumberMessagePerUser(ref, betweenDate));
	console.info("total content per user ", getTotalContentPerUser(ref, betweenDate));
	console.info("stat number message per user", statNumberMessagePerUser(ref, betweenDate));
	console.info("stat content message per user ", statContentMessagePerUser(ref, betweenDate));
}

infinityDate = function() {
	start = new Date(1970, 1, 1, 0, 0, 0, 0);
	end = new Date();
	return {
		"date.ISO": {
			$gte: start,
			$lt: end
		}
	};
}

getStateBetweenDate = function(start, end) {

	start = start || new 1970(Date, 1, 1, 0, 0, 0, 0);
	end = end || new Date();
	ref = ref || "sample.txt";
	var betweenDate = {
		"date.ISO": {
			$gte: start,
			$lt: end
		}
	};

	getStat(ref, betweenDate);

}



$(document).ready(function() {
	jQuery('#date_timepicker_start').datetimepicker({
		format: 'Y/m/d',
		timepicker: false,
		onChangeDateTime: function(dp, $input) {
			startDate = readDate($input.val());
		},
		onShow: function(ct) {
			this.setOptions({
				maxDate: jQuery('#date_timepicker_end').val() ? jQuery('#date_timepicker_end').val() : false
			});
		}
	});

	jQuery('#date_timepicker_end').datetimepicker({
		format: 'Y/m/d',
		timepicker: false,
		onChangeDateTime: function(dp, $input) {
			endDate = readDate($input.val());
		},
		onShow: function(ct) {
			this.setOptions({
				minDate: jQuery('#date_timepicker_start').val() ? jQuery('#date_timepicker_start').val() : false
			})
		}
	});
});