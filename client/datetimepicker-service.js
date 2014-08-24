DatetimePicker = function(){}

DatetimePicker.prototype.infinityDate = function() {
	start = new Date(1970, 1, 1, 0, 0, 0, 0);
	end = new Date();
	return {
		"date.ISO": {
			$gte: start,
			$lt: end
		}
	};
}

DatetimePicker.prototype.infinityHours = function() {
	start = new Date(1970, 1, 1, 0, 0, 0, 0);
	end = new Date(1970, 1, 1, 23, 59, 59, 999);
	return {
		"hours.ISO": {
			$gte: start,
			$lt: end
		}
	};
};

DatetimePicker.prototype.oneHour = function() {
	start = new Date(1970, 1, 1, 0, 0, 0, 0);
	end = new Date(1970, 1, 1, 0, 59, 59, 99);
	return {
		"hours.ISO": {
			$gte: start,
			$lt: end
		}
	};
};

DatetimePicker.prototype.readDate = function(date) {
	return new Date(date.substring(0, 4),
		date.substring(5, 7) - 1,
		date.substring(8, 10),
		date.substring(11, 13),
		date.substring(14, 16), 0, 0);
}

DatetimePicker.prototype.readHour = function(date) {
	return new Date(1970, 1, 1,
		date.substring(0, 2),
		date.substring(3, 5), 0, 0);
};

DatetimePicker.prototype.nextHour = function(date){
	date["hours.ISO"].$gte.setHours(date["hours.ISO"].$gte.getHours()+1);
	date["hours.ISO"].$lt.setHours(date["hours.ISO"].$lt.getHours()+1);

	return date;
};

// must be after adding methods to prototype
Aop.around("", function(f) {
		//arguments[0].arguments[0] += 10;		
	  log.trace( " AOPbefore DatetimePicker."+f.fnName,"called with", ((arguments[0].arguments.length == 0)? "no args":arguments[0].arguments) );
	  var retour = Aop.next(f); //mandatory
	  log.trace( " AOPafter DatetimePicker."+f.fnName,"which returned",retour);
	  return retour; //mandatory
}, [ DatetimePicker.prototype ]); 






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

		if (Data.find({}).fetch().length > 300) {
			$("#draw-button").fadeIn(400);
			return;
		}


		HighchartsService.initDrawHighcharts();

	}
});

initDatePicker = function() {
	jQuery('#date_timepicker_start').datetimepicker({
		format: 'Y/m/d',
		timepicker: false,
		onChangeDateTime: function(dp, $input) {
			startDate = DatetimePicker.prototype.readDate($input.val());
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
			endDate = DatetimePicker.prototype.readDate($input.val());
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
			start = DatetimePicker.prototype.readHour($input.val());
			var ret = datetimepicker.update(
				datetimepicker.findOne({
					type: "startHours"
				})._id, {
					$set: {
						hours: start
					}
				});
			log.debug("start time picker hours",start,ret);

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
			end = DatetimePicker.prototype.readHour($input.val());
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
	$("#draw-button").on("click", HighchartsService.prototype.initDrawHighcharts);
});



