"use strict";

var moment = require('moment');

module.exports = function()
{
    function Controller($scope,kaAppRoutingUtils,  kauReportsData,$element,$timeout)
    {
        var self = this;

        function exportToCsv()
        {
            // TODO - should get report type from report configuration
            var requestParams = _.defaults({
                reportType : 26,
                reportTitle: 'Usage report'
            },self.filters);

            self.reportStatus.isLoading = true;
            self.reportStatus.errorMessage = false;
            kauReportsData.getReportCSVUri(requestParams).then(function (result) {
                self.reportStatus.isLoading = false;
                kaAppRoutingUtils.openExternalUri(result.csvUri);

            }, function (reason) {
                self.reportStatus.isLoading = false;
                self.reportStatus.errorMessage = 'Error occurred while trying to create cvs file';
            });

        }

        self.filters = { date : { startDate: moment().subtract(2, 'month').startOf('month'), endDate: moment().endOf('month')}};

        self.dateOptions = {
            showDropdowns : true,
            autoApply : true,
            maxDate : moment(),
            ranges: {
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'Last 3 Months': [moment().subtract(2, 'month').startOf('month'), moment().endOf('month')]
            },
            isInvalidDate : function(date)
            {
                return !moment(date).isValid();
            }
        };


        self.reportAPI = {
            assignFilters : function(filters)
            {
                $.extend(filters, self.filters);
            }
        };

        self.export = exportToCsv;
        $scope.$watch('vm.filters.date',function()
        {
            if (self.reportAPI.refreshReport) {
                self.reportAPI.refreshReport.call(null);
            }
        });

        self.initDateRangeControl = function()
        {
            // bypass
            $timeout(function(){
                var $dateRangeElement = $($element.find('.date-picker')[0]);
                var dateRange = $dateRangeElement.data('daterangepicker');
                var $dateRangeSpan = $($dateRangeElement.find('span')[0]);
                var prevCallback = dateRange.callback;
                var wrapperCallback = function(start,end)
                {
                    $dateRangeSpan.html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                    return prevCallback.call(null,start,end);
                };
                dateRange.callback = wrapperCallback;
                wrapperCallback(dateRange.startDate,dateRange.endDate);
            },200);
        }


    }

    function Link(scope, element, attrs, ctrls) {
        var ctrl = ctrls[0];
        var reportCtrl = ctrls[1];

        reportCtrl.addSection(ctrl.reportAPI);
    }


    return {
        restrict: 'A',
        scope:{
            reportOptions : '=kOptions',
            reportStatus : '=kReportStatus'
        },
        require: ['kauFiltersSection','^kauReport'],
        controllerAs:'vm',
        bindToController : true,
templateUrl: 'kau-reports/directives/sections/kau-filters-section.html',
        controller: Controller,
        link:Link
    };
};


