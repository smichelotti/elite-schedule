using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Services.Client;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class ScheduleRepository
    {
        private static readonly string environment = ConfigurationManager.AppSettings["environment"];
        //private static readonly string currentScheduleName = environment + "-CURRENT";

        public void Save(int leagueId, string leagueName, string jsonSchedule)
        {
            // LeagueId, environment, scheduleid/{CURRENT}
            var blob = GetContainer().GetBlobReference(leagueId.ToString() + "-" + Guid.NewGuid().ToString());
            blob.Properties.ContentType = "application/json";
            blob.UploadText(jsonSchedule);

            // Now update *current*
            var blobCurrent = GetContainer().GetBlobReference(leagueId.ToString() + "-CURRENT");
            blobCurrent.Properties.ContentType = "application/json";
            blobCurrent.UploadText(jsonSchedule);
        }

        public string Find(int leagueId, string scheduleName)
        {
            var blob = GetContainer().GetBlobReference(leagueId.ToString() + "-" + scheduleName);
            var json = blob.DownloadText();
            return json;
        }

        public string FindCurrent(int leagueId)
        {
            return Find(leagueId, "CURRENT");
        }

        //public void SaveOld(int leagueId, string leagueName, string jsonSchedule)
        //{
        //    var context = ScheduleTableContext.CreateContext();
        //    Schedule schedule = new Schedule
        //    {
        //        PartitionKey = leagueId.ToString(),
        //        RowKey = environment + "-" + Guid.NewGuid().ToString(),
        //        Timestamp = DateTime.Now,
        //        LeagueName = leagueName,
        //        JsonSchedule = jsonSchedule
        //    };

        //    context.AddObject("LeagueSchedules", schedule);
        //    context.SaveChangesWithRetries();

        //    // Now update *current*
        //    context.Detach(schedule);
        //    schedule.RowKey = currentScheduleName;
        //    context.AttachTo("LeagueSchedules", schedule);
        //    context.UpdateObject(schedule);
        //    context.SaveChangesWithRetries(SaveChangesOptions.ReplaceOnUpdate);
        //}

        //public Schedule FindOld(int leagueId, string scheduleName)
        //{
        //    var context = ScheduleTableContext.CreateContext();
        //    var schedule = context.Schedules.Where(x => x.PartitionKey == leagueId.ToString() && x.RowKey == scheduleName).SingleOrDefault();
        //    return schedule;
        //}

        //public Schedule FindCurrentOld(int leagueId)
        //{
        //    return this.FindOld(leagueId, currentScheduleName);
        //}

        private CloudBlobContainer GetContainer()
        {
            // Get a handle on account, create a blob service client and get container proxy
            var account = CloudStorageAccount.FromConfigurationSetting("AzureStorage");
            var client = account.CreateCloudBlobClient();
            return client.GetContainerReference("elite-schedule-" + environment);
        }
    }
}