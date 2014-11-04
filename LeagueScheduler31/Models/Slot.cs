using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class Slot
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int GameDuration { get; set; }

        public int LocationId { get; set; }
        public Location Location { get; set; }

        public int LeagueId { get; set; }
        public League League { get; set; }

    }
}