using Microsoft.WindowsAzure.StorageClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class Schedule : TableServiceEntity
    {
        public string LeagueName { get; set; }
        public string JsonSchedule { get; set; }
    }
}