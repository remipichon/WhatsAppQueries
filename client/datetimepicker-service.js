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

dateDto = new Meteor.Collection("dateTime", {
	connection: null
}); //local db
dateDto.insert({
	type: "startDate",
	date: new Date(1970, 1, 1, 0, 0, 0, 0)
});
dateDto.insert({
	type: "endDate",
	date: new Date()
});



dateDto.find({}).observeChanges({
	changed: function() {

		var end = dateDto.findOne({
			type: "endDate"
		}).date;
		var start = dateDto.findOne({
			type: "startDate"
		}).date;

	
		var statistique = new Statistiques();
		statistique.betweenDate = {
			"date.ISO": {
				$gte: start,
				$lt: end
			}
		};

		drawHighcharts(statistique);
	}
});

$(document).ready(function() {
	jQuery('#date_timepicker_start').datetimepicker({
		format: 'Y/m/d',
		timepicker: false,
		onChangeDateTime: function(dp, $input) {
			startDate = readDate($input.val());
			dateDto.update(
				dateDto.findOne({
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
			dateDto.update(
				dateDto.findOne({
					type: "endDate"
				})._id, {
					$set: {
						date: endDate
					}
				});
		},
		onShow: function(ct) {
			this.setOptions({
				minDate: jQuery('#date_timepicker_start').val() ? jQuery('#date_timepicker_start').val() : false
			})
		}
	});
});