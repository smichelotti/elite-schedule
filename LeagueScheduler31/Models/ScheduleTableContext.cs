using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class ScheduleTableContext : TableServiceContext
    {
        public ScheduleTableContext(string baseAddress, StorageCredentials credentials)
            : base(baseAddress, credentials)
        {
        }

        public IQueryable<Schedule> Schedules
        {
            get
            {
                return this.CreateQuery<Schedule>("LeagueSchedules");
            }
        }

        public static ScheduleTableContext CreateContext()
        {
            var account = CloudStorageAccount.FromConfigurationSetting("AzureStorage");
            return new ScheduleTableContext(account.TableEndpoint.AbsoluteUri, account.Credentials);
        }
    }
}