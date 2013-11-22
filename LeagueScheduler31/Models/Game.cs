using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class Game
    {
        public int Id { get; set; }
        public DateTime GameTime { get; set; }
        public int Team1Id { get; set; }
        public int Team2Id { get; set; }
        
        public int LocationId { get; set; }
        public Location Location { get; set; }

        public int LeagueId { get; set; }
        public League League { get; set; }

    }
}