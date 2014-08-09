drawUserBarChart = function(ref, betweenDate) {
    this.betweenDate = this.betweenDate || infinityDate();
    this.ref = this.ref || ref;

    console.info("drawUserBarChart");
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
            categories: getEnumName.call(this)
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
            data: _.values(getNumberMessagePerUser.call(this)),
            pointPadding: 0.3,
            pointPlacement: -0.2
        }, {
            name: 'Content typed',
            color: 'rgba(126,86,134,.9)',
            data: _.values(getTotalContentPerUser.call(this)),
            pointPadding: 0.4,
            pointPlacement: -0.2,
            yAxis: 1
        }]
    });
}


drawContentUserPieChart = function(ref, betweenDate) {
    this.betweenDate = this.betweenDate || infinityDate();
    this.ref = this.ref || ref;

    console.info("drawContentUserPieChart");
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
            data: _.map(statContentMessagePerUser.call(this), function(num, key) {
                return [key, num];
            })
        }]
    });
}


drawMessageUserPieChart = function(ref, betweenDate) {
    this.betweenDate = this.betweenDate || infinityDate();
    this.ref = this.ref || ref;

    console.info("drawMessageUserPieChart");
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
            data: _.map(statNumberMessagePerUser.call(this), function(num, key) {
                return [key, num];
            })
        }]
    });
}


drawHighcharts = function(ref, betweenDate) {
    console.debug("drawHighcharts avt",this.ref,this.betweenDate);

    this.betweenDate = this.betweenDate || infinityDate();
    this.ref = this.ref || ref;
    console.debug("drawHighcharts",this.ref,this.betweenDate);

    drawMessageUserPieChart.call(this);
    drawContentUserPieChart.call(this);
    drawUserBarChart.call(this);
}