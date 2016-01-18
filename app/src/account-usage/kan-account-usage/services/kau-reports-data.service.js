"use strict";

module.exports = function($q, kanAPIFacade, SessionInfo,$sessionStorage)
{
    var self = this;
    var requireFiltersProperties = ["reportType","date.startDate","date.endDate"];

    function getReportData(filters)
    {
        // temporary bypass to ks
        SessionInfo.setKs($sessionStorage.ks);

        if (filters && _.every(requireFiltersProperties, _.partial(_.has,filters))) {
            var requestParams = {
                reportType: filters.reportType,
                pager: {pageIndex: 1, pageSize: 1000},
                reportInputFilter: {fromDay: moment(filters.date.startDate).format('YYYYMMDD'), toDay: moment(filters.date.endDate).format('YYYYMMDD')}
            };

            return kanAPIFacade.doRequest(requestParams, {
                service: 'report',
                action: 'getTable'
            }).then(function (result) {
                var headers = _.words(result.data.header, /[^,]+/g);
                var items = _.chain(result.data.data).words(/[^;]+/g).compact().map(function (item) {
                    return _.zipObject(headers, _.words(item, /[^,]+/g));
                }).value();

                return {data: items};
            });
        }else
        {
            return $q.reject({errorMessage: 'get report was invoked with partial/missing required filters'});

        }
    }

    self.getReportData = getReportData;

};
