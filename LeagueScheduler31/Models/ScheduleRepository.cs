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
        private static readonly string currentScheduleName = environment + "-CURRENT";

        public void Save(int leagueId, string leagueName, string jsonSchedule)
        {
            var context = ScheduleTableContext.CreateContext();
            Schedule schedule = new Schedule
            {
                PartitionKey = leagueId.ToString(),
                RowKey = environment + "-" + Guid.NewGuid().ToString(),
                Timestamp = DateTime.Now,
                LeagueName = leagueName,
                JsonSchedule = jsonSchedule
            };

            context.AddObject("LeagueSchedules", schedule);
            context.SaveChangesWithRetries();

            // Now update *current*
            context.Detach(schedule);
            schedule.RowKey = currentScheduleName;
            context.AttachTo("LeagueSchedules", schedule);
            context.UpdateObject(schedule);
            context.SaveChangesWithRetries(SaveChangesOptions.ReplaceOnUpdate);
        }

        public Schedule Find(int leagueId, string scheduleName)
        {
            var context = ScheduleTableContext.CreateContext();
            var schedule = context.Schedules.Where(x => x.PartitionKey == leagueId.ToString() && x.RowKey == scheduleName).SingleOrDefault();
            return schedule;
        }

        public Schedule FindCurrent(int leagueId)
        {
            return this.Find(leagueId, currentScheduleName);
        }
    }
}