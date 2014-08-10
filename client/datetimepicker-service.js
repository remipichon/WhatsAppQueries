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

infinityHours = function() {
	start = new Date(1970, 1, 1, 0, 0, 0, 0);
	end = new Date(1970, 1, 1, 23, 59, 59, 999);
	return {
		"hours.ISO": {
			$gte: start,
			$lt: end
		}
	};
}

//deprecated
printStatsBetweenDate = function(start, end) {

	start = start || new 1970(Date, 1, 1, 0, 0, 0, 0);
	end = end || new Date();
	ref = ref || "sample.txt";
	var betweenDate = {
		"date.ISO": {
			$gte: start,
			$lt: end
		}
	};

	new Statistique(betweenDate).printStat();
}

datetimepicker = new Meteor.Collection("dateTime", {
	connection: null
}); //local db
datetimepicker.insert({
	type: "startDate",
	date: new Date(1970, 1, 1, 0, 0, 0, 0)
});
datetimepicker.insert({
	type: "endDate",
	date: new Date()
});
datetimepicker.insert({
	type: "startHours",
	hours: new Date(1970, 1, 1, 0, 0, 0, 0)
});
datetimepicker.insert({
	type: "endHours",
	hours: new Date(1970, 1, 1, 23, 59, 59, 999)
});



datetimepicker.find({}).observeChanges({
	changed: function() {

		statistique = new Statistiques();

		var endDate = datetimepicker.findOne({
			type: "endDate"
		}).date;
		var startDate = datetimepicker.findOne({
			type: "startDate"
		}).date;
		statistique.betweenDate = {
			"date.ISO": {
				$gte: startDate,
				$lt: endDate
			}
		};

		var endHours = datetimepicker.findOne({
			type: "endHours"
		}).hours;
		var startHours = datetimepicker.findOne({
			type: "startHours"
		}).hours;
		statistique.betweenHours = {
			"hours.ISO": {
				$gte: startHours,
				$lt: endHours
			}
		};

		drawHighcharts(statistique);
	}
});


initDatePicker = function() {
	jQuery('#date_timepicker_start').datetimepicker({
		format: 'Y/m/d',
		timepicker: false,
		onChangeDateTime: function(dp, $input) {
			startDate = readDate($input.val());
			datetimepicker.update(
				datetimepicker.findOne({
					type: "startDate"
				})._id, {
					$set: {
						date: startDate
					}
				});
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
			datetimepicker.update(
				datetimepicker.findOne({
					type: "endDate"
				})._id, {
					$set: {
						hours: endDate
					}
				});
		},
		onShow: function(ct) {
			this.setOptions({
				minDate: jQuery('#date_timepicker_start').val() ? jQuery('#date_timepicker_start').val() : false
			})
		}
	});
}


initTimePicker = function() {
	jQuery('#hour_timepicker_start').datetimepicker({
		format: 'H:i',
		datepicker: false,
		onChangeDateTime: function(dp, $input) {
			start = readHour($input.val());
			console.log("time.onChangeDateTime.startHour", start);
			datetimepicker.update(
				datetimepicker.findOne({
					type: "startHours"
				})._id, {
					$set: {
						hours: start
					}
				});
		},
		onShow: function(ct) {
			this.setOptions({
				maxTime: jQuery('#hour_timepicker_end').val() ? jQuery('#hour_timepicker_end').val() : false
			});
		}
	});

	jQuery('#hour_timepicker_end').datetimepicker({
		format: 'H:i',
		datepicker: false,
		onChangeDateTime: function(dp, $input) {
			end = readHour($input.val());
			datetimepicker.update(
				datetimepicker.findOne({
					type: "endHours"
				})._id, {
					$set: {
						date: end
					}
				});
		},
		onShow: function(ct) {
			this.setOptions({
				minTime: jQuery('#hour_timepicker_start').val() ? jQuery('#hour_timepicker_start').val() : false
			})
		}
	});
}


$(document).ready(function() {
	initDatePicker();
	initTimePicker();
});


readDate = function(date) {
	return new Date(date.substring(0, 4),
		date.substring(5, 7) - 1,
		date.substring(8, 10),
		date.substring(11, 13),
		date.substring(14, 16), 0, 0);
}

readHour = function(date) {
	// console.log("readHour",date)
	return new Date(1970,1,1,
		date.substring(0, 2),
		date.substring(3,5), 0, 0);
}