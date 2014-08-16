HighchartsService = function(){}

HighchartsService.prototype.drawUserBarChart = function(statistique) {

    var $chart = $('#user-bar-chart');
    if(typeof $chart.highcharts() !== "undefined") $chart.highcharts().destroy();
    $chart.highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Messages and content per user'
        },
        xAxis: {
            categories: statistique.getEnumName()
        },
        yAxis: [{
            min: 0,
            title: {
                text: 'Messages'
            }
        }, {
            title: {
                text: 'Content (nb caracters)'
            },
            opposite: true
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            bar: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Messages send',
            color: 'rgba(165,170,217,1)',
            data: _.values(statistique.getNumberMessagePerUser()),
            pointPadding: 0.3,
            pointPlacement: -0.2
        }, {
            name: 'Content typed',
            color: 'rgba(126,86,134,.9)',
            data: _.values(statistique.getTotalContentPerUser()),
            pointPadding: 0.4,
            pointPlacement: -0.2,
            yAxis: 1
        }]
    });
}


HighchartsService.prototype.drawContentUserPieChart = function(statistique) {

    var $chart = $('#user-content-pie-chart');
    if(typeof $chart.highcharts() !== "undefined") $chart.highcharts().destroy();

    $('#user-content-pie-chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1, //null,
            plotShadow: false
        },
        title: {
            text: 'Content per users'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Number caracteres sent',
            data: _.map(statistique.getStatContentMessagePerUser(), function(num, key) {
                return [key, num];
            })
        }]
    });
}


HighchartsService.prototype.drawMessageUserPieChart = function(statistique) {

    var $chart = $('#user-message-pie-chart');
    if(typeof $chart.highcharts() !== "undefined") $chart.highcharts().destroy();

    $('#user-message-pie-chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1, //null,
            plotShadow: false
        },
        title: {
            text: 'Message sent per users'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Messages sent',
            data: _.map(statistique.getStatNumberMessagePerUser(), function(num, key) {
                return [key, num];
            })
        }]
    });
}


HighchartsService.prototype.drawHighcharts = function(statistique) {

    if(! statistique instanceof Statistiques ){
        return console.error("drawHighcharts : not statistique args");
    }
    var highchartsService = new HighchartsService();
    highchartsService.drawUserBarChart(statistique);
    highchartsService.drawMessageUserPieChart(statistique);
    highchartsService.drawContentUserPieChart(statistique);
}


HighchartsService.prototype.initDrawHighcharts = function() {

    statistique = new Statistiques(true);

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
    console.info("HighchartsService.initDrawHighcharts statistique",statistique);
    HighchartsService.prototype.drawHighcharts(statistique);
}

// must be after adding methods to prototype
Aop.around("", function(f) {
        //arguments[0].arguments[0] += 10;      
      console.log("TRACE : AOPbefore HighchartsService."+f.fnName,"called with", ((arguments[0].arguments.length == 0)? "no args":arguments[0].arguments) );
      var retour = Aop.next(f); //mandatory
      console.log("TRACE : AOPafter HighchartsService."+f.fnName,"which returned",retour);
      return retour; //mandatory
}, [ HighchartsService.prototype ]); 



